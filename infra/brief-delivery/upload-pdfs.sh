#!/usr/bin/env bash
set -euo pipefail

: "${RESOURCE_GROUP:?Set RESOURCE_GROUP, for example rg-globalenterprise-briefs}"
: "${STORAGE_ACCOUNT:?Set STORAGE_ACCOUNT to the deployed storage account name}"
: "${AZURE_SUBSCRIPTION_ID:?Set AZURE_SUBSCRIPTION_ID before uploading}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
az account set --subscription "$AZURE_SUBSCRIPTION_ID"

for pdf in "$repo_root"/infra/brief-delivery/source-pdfs/*.pdf; do
  [ -f "$pdf" ] || continue
  filename="$(basename "$pdf")"
  az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --container-name briefs \
    --name "$filename" \
    --file "$pdf" \
    --auth-mode login \
    --overwrite true \
    --content-type application/pdf \
    --content-disposition "attachment; filename=\"$filename\""
done
