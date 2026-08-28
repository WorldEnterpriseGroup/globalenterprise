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

request_json() {
  local url="$1"
  local expected_status="$2"
  local body_file="$3"
  local status
  status="$(curl --silent --show-error --fail-with-body --location \
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
      -H 'content-type: application/json' -X POST -d '{}' "$base_url/api/StripeHttpTrigger" || true)"
    [[ "$status" == 400 ]] || fail "Stripe negative smoke expected HTTP 400, got $status"
    ;;
esac

log "$service smoke E2E passed without making an ACS thread or charging Stripe"
