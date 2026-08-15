#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd -- "$script_dir/.." && pwd)"
# shellcheck disable=SC1091
# shellcheck source=lib.sh
source "$script_dir/lib.sh"

service="${1:-}"
tag="${2:-${IMAGE_TAG:-}}"
[[ -n "$service" && -n "$tag" ]] || fail "usage: $0 <ringomeet|stripedonate> <immutable-tag>"
service_dir "$service" >/dev/null
validate_tag "$tag"
require_cmd docker
require_cmd az
require_env AZURE_SUBSCRIPTION_ID

repository="$(service_repository "$service")"
login_server="$(acr_login_server)"
image="$login_server/$repository:$tag"
context_dir="$root_dir/$service"

grep -Fq "FROM $NODE26_IMAGE" "$context_dir/Dockerfile" || fail "$service Dockerfile is not pinned to the approved Node 26 Alpine digest"
log "logging into $ACR_NAME"
az acr login --name "$ACR_NAME" --resource-group "$ACR_RESOURCE_GROUP" --subscription "$AZURE_SUBSCRIPTION_ID" >/dev/null

log "building $image"
DOCKER_BUILDKIT=1 docker build \
  --pull \
  --platform linux/amd64 \
  --provenance=false \
  --sbom=false \
  --label "org.opencontainers.image.revision=${GITHUB_SHA:-local}" \
  --label "org.opencontainers.image.source=${GITHUB_SERVER_URL:-local}/${GITHUB_REPOSITORY:-local}" \
  --tag "$image" \
  --file "$context_dir/Dockerfile" \
  "$context_dir"

log "pushing $image"
docker push "$image" >/dev/null

digest="$(acr_digest_for_tag "$repository" "$tag")"
immutable="$login_server/$repository@$digest"
log "resolved pushed manifest: $immutable"

if [[ -n "${DIGEST_FILE:-}" ]]; then
  umask 077
  printf '%s\n' "$digest" > "$DIGEST_FILE"
fi
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'digest=%s\nimage=%s\nrepository=%s\n' "$digest" "$immutable" "$repository" >> "$GITHUB_OUTPUT"
fi
printf '%s\n' "$digest"
