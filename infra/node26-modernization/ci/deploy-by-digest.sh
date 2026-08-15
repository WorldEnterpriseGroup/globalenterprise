#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

service="${1:-}"
digest="${2:-}"
[[ -n "$service" && -n "$digest" ]] || fail "usage: $0 <ringomeet|stripedonate> <sha256:digest>"
service_dir "$service" >/dev/null
validate_digest "$digest"
ensure_mutation_approved
require_cmd az
require_env AZURE_SUBSCRIPTION_ID

repository="$(service_repository "$service")"
app_name="$(service_container_app "$service")"
login_server="$(acr_login_server)"
target_image="$login_server/$repository@$digest"
resolved_target="$(acr_digest_for_tag "$repository" "${IMAGE_TAG:?IMAGE_TAG is required to prove this digest was published}")"
[[ "$resolved_target" == "$digest" ]] || fail "ACR tag does not resolve to requested digest: expected $digest, got $resolved_target"

old_image="$(az containerapp show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --query properties.template.containers[0].image --output tsv)"
[[ -n "$old_image" ]] || fail "could not resolve current image for $app_name"
old_immutable="$(immutable_image_for "$old_image" "$login_server")"
old_revision="$(az containerapp show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --query properties.latestReadyRevisionName --output tsv)"
[[ -n "$old_revision" ]] || fail "could not resolve current Ready revision for $app_name"

# A tag is an input to the release, not a unique revision identifier. Include
# the workflow run/attempt so a retry cannot collide with a previous revision.
deployment_nonce="${GITHUB_RUN_ID:-$(date -u +%Y%m%d%H%M%S%N)}-${GITHUB_RUN_ATTEMPT:-1}"
revision_suffix="release-${service}-${deployment_nonce}"
revision_suffix="$(printf '%s' "$revision_suffix" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-' | cut -c1-63)"
validate_revision_suffix "$revision_suffix"

state_file="${STATE_FILE:-${RUNNER_TEMP:-/tmp}/node26-${service}.state}"
state_put SERVICE "$service" "$state_file"
state_put APP_NAME "$app_name" "$state_file"
state_put TARGET_IMAGE "$target_image" "$state_file"
state_put TARGET_DIGEST "$digest" "$state_file"
state_put OLD_IMAGE "$old_immutable" "$state_file"
state_put OLD_REVISION "$old_revision" "$state_file"
state_put NEW_REVISION "$revision_suffix" "$state_file"
state_put MUTATION_STARTED true "$state_file"
state_put DEPLOYED false "$state_file"

log "deploying immutable image $target_image to $app_name"
az containerapp update \
  --name "$app_name" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --subscription "$AZURE_SUBSCRIPTION_ID" \
  --image "$target_image" \
  --revision-suffix "$revision_suffix" \
  --output none
state_put DEPLOYED true "$state_file"

ready_url="$(AZURE_RESOURCE_GROUP="$AZURE_RESOURCE_GROUP" WAIT_TIMEOUT_SECONDS="$WAIT_TIMEOUT_SECONDS" WAIT_INTERVAL_SECONDS="$WAIT_INTERVAL_SECONDS" bash "$script_dir/wait-ready.sh" "$app_name" "$revision_suffix")"
state_put READY_URL "$ready_url" "$state_file"
log "revision is Ready: $ready_url"
printf '%s\n' "$ready_url"
