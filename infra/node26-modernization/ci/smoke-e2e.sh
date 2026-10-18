#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

service="${1:-}"
base_url="${2:-}"
[[ -n "$service" && -n "$base_url" ]] || fail "usage: $0 <ringomeet|stripedonate> <https://host>"
service_dir "$service" >/dev/null
require_cmd curl
require_cmd node

if [[ ! "$base_url" =~ ^https://[A-Za-z0-9.-]+$ ]]; then
  fail "smoke URL must be an HTTPS origin without a path or query string"
fi

# Services behind Azure Front Door only answer requests that carry the Front
# Door profile id. The smoke authenticates as "Front Door" with that header and
# separately proves the lock rejects a direct request without it.
front_door_id="$(service_front_door_id "$service")"
fd_header=()
[[ -n "$front_door_id" ]] && fd_header=(-H "X-Azure-FDID: $front_door_id")

request_json() {
  local url="$1"
  local expected_status="$2"
  local body_file="$3"
  local status
  status="$(curl --silent --show-error --fail-with-body --location "${fd_header[@]}" \
    --connect-timeout 5 --max-time 20 --retry 5 --retry-all-errors \
    --output "$body_file" --write-out '%{http_code}' "$url" || true)"
  [[ "$status" == "$expected_status" ]] || {
    log "smoke response from $url: HTTP $status"
    sed -n '1,80p' "$body_file" >&2 || true
    fail "unexpected smoke status for $url; expected $expected_status"
  }
}

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

request_json "$base_url/healthz" 200 "$tmp_dir/health.json"
request_json "$base_url/readyz" 200 "$tmp_dir/ready.json"

node --input-type=module - "$service" "$tmp_dir/health.json" "$tmp_dir/ready.json" <<'NODE'
import fs from "node:fs";
const [service, healthPath, readyPath] = process.argv.slice(2);
const health = JSON.parse(fs.readFileSync(healthPath, "utf8"));
const ready = JSON.parse(fs.readFileSync(readyPath, "utf8"));
if (health.status !== "ok" || health.service !== service) throw new Error(`health contract failed for ${service}`);
if (ready.status !== "ready" || ready.service !== service) throw new Error(`readiness contract failed for ${service}`);
NODE

case "$service" in
  ringomeet)
    request_json "$base_url/token?scope=identity" 400 "$tmp_dir/negative.json"
    ;;
  stripedonate)
    status="$(curl --silent --show-error --location --connect-timeout 5 --max-time 20 \
      --output "$tmp_dir/negative.json" --write-out '%{http_code}' \
      "${fd_header[@]}" -H 'content-type: application/json' -X POST -d '{}' "$base_url/api/StripeHttpTrigger" || true)"
    [[ "$status" == 400 ]] || fail "Stripe negative smoke expected HTTP 400, got $status"
    # CORS: every declared origin must get a 204 preflight echoing its own origin.
    IFS=',' read -r -a cors_list <<< "$(service_cors_origins stripedonate)"
    for cors_origin in "${cors_list[@]}"; do
      preflight="$(curl --silent --show-error --connect-timeout 5 --max-time 20 --output /dev/null \
        --dump-header - "${fd_header[@]}" -X OPTIONS -H "Origin: $cors_origin" \
        -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type,idempotency-key' \
        "$base_url/api/StripeHttpTrigger" | tr -d '\r' || true)"
      grep -q '^HTTP/[0-9.]* 204' <<< "$preflight" || fail "CORS preflight for $cors_origin expected 204"
      grep -qi "^access-control-allow-origin: $cors_origin\$" <<< "$preflight" || fail "CORS preflight for $cors_origin did not echo the origin"
    done
    # Origin lock: direct requests (no / wrong X-Azure-FDID) must be refused for
    # both POST and the CORS preflight; nothing reaches Stripe.
    for lock_case in "POST:" "POST:X-Azure-FDID: 00000000-0000-0000-0000-000000000000" "OPTIONS:"; do
      lock_method="${lock_case%%:*}"
      lock_header="${lock_case#*:}"
      lock_args=()
      [[ -n "$lock_header" ]] && lock_args=(-H "$lock_header")
      status="$(curl --silent --show-error --connect-timeout 5 --max-time 20 \
        --output /dev/null --write-out '%{http_code}' \
        "${lock_args[@]}" -H 'content-type: application/json' -H 'Origin: https://taolearning.org' \
        -X "$lock_method" -d '{}' "$base_url/api/StripeHttpTrigger" || true)"
      [[ "$status" == 403 ]] || fail "origin lock smoke expected HTTP 403 for $lock_method without Front Door id, got $status"
    done
    ;;
esac

log "$service smoke E2E passed without making an ACS thread or charging Stripe (stripedonate also proves the Front Door origin lock)"
