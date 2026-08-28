#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

service="${1:-}"
digest="${2:-}"
[[ -n "$service" && -n "$digest" ]] || fail "usage: $0 <ringomeet|stripedonate> <sha256:digest>"
ensure_mutation_approved

state_file="${STATE_FILE:-${RUNNER_TEMP:-/tmp}/node26-${service}.state}"
export STATE_FILE="$state_file"

rollback_on_failure() {
  local status=$?
  if (( status != 0 )) && [[ -f "$state_file" ]] && [[ "$(state_get MUTATION_STARTED "$state_file" || true)" == 'true' ]]; then
    log "release failed; beginning digest-pinned rollback"
    DEPLOY_APPROVED=true bash "$script_dir/rollback.sh" || {
      log 'CRITICAL: automatic rollback did not reach Ready; stop traffic changes and investigate immediately'
      exit 2
    }
  fi
  return "$status"
}
trap rollback_on_failure EXIT

bash "$script_dir/deploy-by-digest.sh" "$service" "$digest" >/dev/null
smoke_url="$(state_get READY_URL "$state_file")"
bash "$script_dir/smoke-e2e.sh" "$service" "$smoke_url"
log "$service immutable deployment and smoke E2E passed"
