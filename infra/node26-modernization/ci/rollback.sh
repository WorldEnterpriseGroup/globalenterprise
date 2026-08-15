#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

ensure_mutation_approved
require_cmd az
require_env AZURE_SUBSCRIPTION_ID
state_file="${STATE_FILE:-}"
[[ -n "$state_file" ]] || fail "STATE_FILE is required for rollback"

app_name="$(state_get APP_NAME "$state_file")"
old_image="$(state_get OLD_IMAGE "$state_file")"
service="$(state_get SERVICE "$state_file")"
target_image="$(state_get TARGET_IMAGE "$state_file")"
target_digest="$(state_get TARGET_DIGEST "$state_file")"
[[ "$old_image" == *@sha256:* ]] || fail "rollback target is not digest-pinned: $old_image"
validate_digest "${old_image##*@}"
validate_digest "$target_digest"

repository="$(service_repository "$service")"
login_server="$(acr_login_server)"
expected_target_image="$login_server/$repository@$target_digest"
[[ "$target_image" == "$expected_target_image" ]] || fail "rollback state target does not match the approved registry and digest"

# Fail closed if another operator or deployment changed the app after the
# failed release. Never replace an unrelated newer image with the old image.
current_image="$(az containerapp show --name "$app_name" --resource-group "$AZURE_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" --query properties.template.containers[0].image --output tsv)"
[[ -n "$current_image" ]] || fail "could not resolve current image for $app_name before rollback"
current_immutable="$(immutable_image_for "$current_image" "$login_server")"
[[ "$current_immutable" == "$target_image" ]] || fail "refusing rollback: current image $current_immutable differs from failed target $target_image"

# Keep rollback revision names unique across fast retries as well as separate
# workflow runs.
rollback_nonce="${GITHUB_RUN_ID:-$(date -u +%Y%m%d%H%M%S%N)}-${GITHUB_RUN_ATTEMPT:-1}"
rollback_suffix="rollback-${service}-${rollback_nonce}"
rollback_suffix="$(printf '%s' "$rollback_suffix" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-' | cut -c1-63)"
validate_revision_suffix "$rollback_suffix"
state_put ROLLBACK_REVISION "$rollback_suffix" "$state_file"

log "rolling $app_name back to the previous immutable image $old_image"
az containerapp update \
  --name "$app_name" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --subscription "$AZURE_SUBSCRIPTION_ID" \
  --image "$old_image" \
  --revision-suffix "$rollback_suffix" \
  --output none

rollback_url="$(AZURE_RESOURCE_GROUP="$AZURE_RESOURCE_GROUP" WAIT_TIMEOUT_SECONDS="$WAIT_TIMEOUT_SECONDS" WAIT_INTERVAL_SECONDS="$WAIT_INTERVAL_SECONDS" bash "$script_dir/wait-ready.sh" "$app_name" "$rollback_suffix")"
state_put ROLLBACK_URL "$rollback_url" "$state_file"
state_put ROLLED_BACK true "$state_file"
log "rollback revision is Ready: $rollback_url"
printf '%s\n' "$rollback_url"
