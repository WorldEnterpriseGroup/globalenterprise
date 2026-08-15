# Node 26 modernization

These two services are rebuilt as small Node 26 Alpine containers so they do not depend on Azure's built-in Windows IISNode runtime catalog. As of August 13, 2026, Node 26 is still the Node project's Current line and is scheduled to enter LTS in October; Azure Functions/App Service built-in catalogs do not expose Node 26. The container path is therefore deliberate.

Both deployments should use one shared Consumption Azure Container Apps environment and one shared Basic Azure Container Registry. Keep minimum replicas at zero. Do not create another Front Door: route through the existing shared edge only after the new origins pass their direct smoke tests.

## Services

- `ringomeet`: recovered browser artifact plus a rebuilt ACS server using the current communication packages. It preserves the legacy browser API paths while eliminating hard-coded server settings, IISNode, and the 2023 bundled server.
- `stripedonate`: rebuilt HTTP service using Stripe Node 22.5.0. It preserves `/api/StripeHttpTrigger`, validates payment identifiers and amounts, returns correct HTTP errors, and never logs payment payloads.

## Secrets

Keep source secrets in `omlab-secrets` and reference them from Container Apps through Key Vault references and managed identity. Do not place values in images, git, command output, or plain Container Apps secrets. The old app settings remain in place for rollback until a successful soak period is complete.

## CI/CD hardening

The release control plane is under [`ci/`](ci/):

- `test-node26.sh` runs both services' tests and `npm audit --audit-level=high` inside the exact pinned Node `26.5.0` Alpine image;
- `build-and-push.sh` verifies the Dockerfile base digest, builds `linux/amd64` with BuildKit, pushes the requested input tag to `acrglobalapps`, and resolves the post-push ACR manifest digest;
- `deploy-by-digest.sh` refuses mutation without `DEPLOY_APPROVED=true`, captures the current image as an immutable digest, and updates the named Container App by digest only;
- `wait-ready.sh` requires the new revision to be Running, Healthy, and Azure's `latestReadyRevisionName` before continuing;
- `smoke-e2e.sh` checks health/readiness and a non-mutating negative contract for each service; it never creates an ACS thread or charges Stripe; and
- `deploy-and-smoke.sh` automatically rolls back to the captured previous digest if deployment, readiness, or smoke verification fails. If rollback cannot reach Ready, it exits with status 2 and leaves an explicit critical error for operator intervention.

[`node26-release.yml`](../../.github/workflows/node26-release.yml) is the reviewed GitHub Actions pipeline. Pull requests run the pinned tests and audit only. Publishing and deployment are manual; deployment requires the protected `node26-production` environment. Production matrix deployment is serialized and fail-fast: if one service fails, its rollback completes in that job and the remaining service is not started.

Required repository configuration before activation:

- `NODE26_AZURE_SUBSCRIPTION_ID` repository variable;
- `NODE26_AZURE_CLIENT_ID` and `NODE26_AZURE_TENANT_ID` workload-identity secrets;
- an Azure federated credential restricted to this repository and release workflow; and
- a protected `node26-production` environment with named reviewers.

The local release scripts make no Azure calls unless explicitly invoked. Do not set `DEPLOY_APPROVED=true` outside the protected deployment job.
