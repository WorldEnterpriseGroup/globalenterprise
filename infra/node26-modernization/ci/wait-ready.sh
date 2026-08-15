#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

app_name="${1:-${CONTAINER_APP_NAME:-}}"
revision="${2:-${REVISION_NAME:-}}"
[[ -n "$app_name" && -n "$revision" ]] || fail "usage: $0 <container-app-name> <revision-name>"
require_cmd az
require_env AZURE_RESOURCE_GROUP
require_env AZURE_SUBSCRIPTION_ID

deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))
while (( SECONDS < deadline )); do
  running_state="$(az containerapp revision show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --revision "$revision" --query properties.runningState --output tsv 2>/dev/null || true)"
  health_state="$(az containerapp revision show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --revision "$revision" --query properties.healthState --output tsv 2>/dev/null || true)"
  ready_revision="$(az containerapp show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --query properties.latestReadyRevisionName --output tsv 2>/dev/null || true)"
  provisioning_state="$(az containerapp revision show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --revision "$revision" --query properties.provisioningState --output tsv 2>/dev/null || true)"

  log "revision=$revision running=$running_state health=$health_state provisioning=$provisioning_state latestReady=$ready_revision"
  if [[ "$running_state" == 'Running' && "$health_state" == 'Healthy' && "$ready_revision" == "$revision" ]]; then
    printf '%s\n' "https://$(az containerapp show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --query 'properties.latestRevisionFqdn' --output tsv)"
    exit 0
  fi
  case "$running_state:$health_state:$provisioning_state" in
    Failed:*|Degraded:*|Stopped:*|*:Failed|*:Degraded|*:Stopped)
      fail "revision $revision entered a terminal unhealthy state"
      ;;
  esac
  sleep "$WAIT_INTERVAL_SECONDS"
done

fail "revision $revision did not become Ready within ${WAIT_TIMEOUT_SECONDS}s"
