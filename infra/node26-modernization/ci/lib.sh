#!/usr/bin/env bash
set -euo pipefail

# Shared, deliberately boring helpers for the Node 26 release pipeline.
# This file is sourced by the scripts in this directory; it is not a deploy
# entry point by itself.

NODE26_IMAGE="${NODE26_IMAGE:-node:26.5.0-alpine@sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66}"
ACR_NAME="${ACR_NAME:-acrglobalapps}"
ACR_RESOURCE_GROUP="${ACR_RESOURCE_GROUP:-rg-hm-proxy}"
AZURE_RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-RingoMeet}"
AZURE_SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-300}"
WAIT_INTERVAL_SECONDS="${WAIT_INTERVAL_SECONDS:-10}"

log() {
  printf '[node26] %s\n' "$*" >&2
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

require_env() {
  [[ -n "${!1:-}" ]] || fail "required environment variable is missing: $1"
}

service_dir() {
  case "$1" in
    ringomeet|stripedonate) printf '%s' "$1" ;;
    *) fail "unsupported service: $1 (expected ringomeet or stripedonate)" ;;
  esac
}

service_repository() {
  case "$1" in
    ringomeet) printf '%s' 'ringomeet-node26' ;;
    stripedonate) printf '%s' 'stripedonate-node26' ;;
    *) fail "unsupported service: $1" ;;
  esac
}

service_container_app() {
  case "$1" in
    ringomeet) printf '%s' 'ringomeet-node26' ;;
    stripedonate) printf '%s' 'stripedonate-node26' ;;
    *) fail "unsupported service: $1" ;;
  esac
}

service_health_name() {
  case "$1" in
    ringomeet) printf '%s' 'ringomeet' ;;
    stripedonate) printf '%s' 'stripedonate' ;;
    *) fail "unsupported service: $1" ;;
  esac
}

validate_tag() {
  [[ "$1" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$ ]] || fail "invalid image tag: $1"
}

validate_digest() {
  [[ "$1" =~ ^sha256:[a-f0-9]{64}$ ]] || fail "invalid OCI digest: $1"
}

validate_revision_suffix() {
  [[ "$1" =~ ^[a-z0-9][a-z0-9-]{0,62}$ ]] || fail "invalid Container App revision suffix: $1"
}

acr_login_server() {
  require_cmd az
  local server
  local subscription_args=()
  [[ -n "$AZURE_SUBSCRIPTION_ID" ]] && subscription_args+=(--subscription "$AZURE_SUBSCRIPTION_ID")
  server="$(az acr show --name "$ACR_NAME" --resource-group "$ACR_RESOURCE_GROUP" "${subscription_args[@]}" --query loginServer --output tsv)"
  [[ "$server" =~ ^[a-z0-9-]+\.azurecr\.io$ ]] || fail "ACR login server is not an Azure Container Registry host: $server"
  printf '%s' "$server"
}

acr_digest_for_tag() {
  local repository="$1"
  local tag="$2"
  validate_tag "$tag"
  local digest
  local subscription_args=()
  [[ -n "$AZURE_SUBSCRIPTION_ID" ]] && subscription_args+=(--subscription "$AZURE_SUBSCRIPTION_ID")
  digest="$(az acr manifest show-metadata --registry "$ACR_NAME" --name "$repository:$tag" "${subscription_args[@]}" --query digest --output tsv)"
  validate_digest "$digest"
  printf '%s' "$digest"
}

immutable_image_for() {
  local image="$1"
  local login_server="$2"
  [[ "$image" == "$login_server/"* ]] || fail "existing image is outside the approved registry: $image"
  if [[ "$image" == *@sha256:* ]]; then
    local digest="${image##*@}"
    validate_digest "$digest"
    printf '%s' "$image"
    return
  fi
  local repository_and_tag="${image#"$login_server/"}"
  [[ "$repository_and_tag" == *:* ]] || fail "existing image is not tagged or digest-pinned: $image"
  local repository="${repository_and_tag%:*}"
  local tag="${repository_and_tag##*:}"
  local digest
  digest="$(acr_digest_for_tag "$repository" "$tag")"
  printf '%s/%s@%s' "$login_server" "$repository" "$digest"
}

state_get() {
  local key="$1"
  local file="${2:-${STATE_FILE:-}}"
  [[ -n "$file" && -f "$file" ]] || fail "state file not found: $file"
  awk -F= -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); print; found=1; exit } END { if (!found) exit 1 }' "$file"
}

state_put() {
  local key="$1"
  local value="$2"
  local file="${3:-${STATE_FILE:-}}"
  [[ -n "$file" ]] || fail "STATE_FILE is required"
  umask 077
  mkdir -p "$(dirname "$file")"
  touch "$file"
  local tmp="${file}.tmp.$$"
  awk -F= -v key="$key" -v value="$value" '
    BEGIN { replaced=0 }
    $1 == key { print key "=" value; replaced=1; next }
    { print }
    END { if (!replaced) print key "=" value }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

ensure_mutation_approved() {
  [[ "${DEPLOY_APPROVED:-false}" == 'true' ]] || fail "Azure mutation refused; use a protected deployment environment with DEPLOY_APPROVED=true"
}
