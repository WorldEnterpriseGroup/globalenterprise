#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd -- "$script_dir/.." && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

service="${1:-all}"
container_engine="${CONTAINER_ENGINE:-docker}"
require_cmd "$container_engine"

run_service_tests() {
  local name="$1"
  service_dir "$name" >/dev/null
  log "testing $name inside pinned Node 26 Alpine image"
  "$container_engine" run --rm \
    --env CI=true \
    --env NPM_CONFIG_UPDATE_NOTIFIER=false \
    --volume "$root_dir/$name:/workspace" \
    --workdir /workspace \
    "$NODE26_IMAGE" \
    sh -eu -c 'node --version | grep -E "^v26\\." >/dev/null; npm ci --ignore-scripts; npm test -- --test-concurrency=1; npm audit --audit-level=high'
}

case "$service" in
  all)
    run_service_tests ringomeet
    run_service_tests stripedonate
    ;;
  ringomeet|stripedonate)
    run_service_tests "$service"
    ;;
  *)
    fail "usage: $0 [all|ringomeet|stripedonate]"
    ;;
esac

log 'Node 26 tests and high-severity dependency audit passed'
