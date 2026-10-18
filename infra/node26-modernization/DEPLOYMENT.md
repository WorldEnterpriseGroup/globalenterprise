# Node 26 deployment record

Updated August 13, 2026.

## Runtime decision

Azure App Service and Azure Functions' built-in Windows/Linux runtime catalogs do not expose Node 26. The Node project currently lists Node 26 as Current, with LTS scheduled for October 2026. Changing `WEBSITE_NODE_DEFAULT_VERSION` alone therefore cannot produce a real Node 26 deployment and caused RingoMeet's old IISNode bundle to fail under the newer built-in runtime.

The production-compatible path is an explicit `node:26.5.0-alpine` container, pinned to digest `sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66`, running on the Azure Container Apps Consumption profile.

## Azure topology

- Existing resource group: `RingoMeet`.
- Shared Container Apps environment: `aca-node26`.
- Shared registry: `acrglobalapps` in `rg-hm-proxy` (Basic, admin disabled, managed-identity pull).
- Repositories: `hm-proxy`, `ringomeet-node26`, and `stripedonate-node26`.
- App: `ringomeet-node26` → `ringomeet-node26.happyrock-d12daa4c.eastus.azurecontainerapps.io`.
- App: `stripedonate-node26` → `stripedonate-node26.happyrock-d12daa4c.eastus.azurecontainerapps.io`.
- Both apps: 0.25 vCPU, 0.5 GiB, maximum replicas 2, HTTP scale rule, single active revision.
- Minimum replicas: `ringomeet-node26` 0; `stripedonate-node26` **1** (since 2026-10-13, see "Stripe Donate scale" below).
- No new Front Door was created. The existing old App Service/Function resources remain available for rollback while the caller/edge routing decision is made.

This topology keeps the compute consumption-based and shares one environment and one registry. Azure Monitor is used for the environment's platform logs rather than creating a separate Log Analytics workspace. The Basic ACR is the only new fixed registry service.

## Secret posture

The following values are stored in Key Vault `omlab-secrets` and referenced by managed identity from Container Apps; their values are not in source, image layers, or app settings:

- `ringomeet-acs-connection-string`
- `ringomeet-acs-endpoint`
- `ringomeet-acs-admin-user-id`
- `stripedonate-stripe-secret-key`

The RingoMeet ACS endpoint was derived from the existing connection string, and a dedicated ACS admin identity was provisioned for the thread-management path. The old placeholder values from the 2023 bundle are no longer used by the Node 26 service.

## What changed

RingoMeet now has a maintained Node 26 server with current `@azure/communication-chat`, `@azure/communication-common`, and `@azure/communication-identity` packages, Express 5, Helmet, strict request limits, request IDs, health/readiness endpoints, ACS ID validation, supported-scope validation, and a pinned UUID override. The recovered browser artifact is included under `ringomeet/build/` because the old App Service had no source-control connection.

Stripe Donate now has a maintained Node 26 server using Stripe `22.5.0`. It preserves `/api/StripeHttpTrigger`, validates payment amounts, email addresses, PaymentIntent/payment-method IDs, request size, and subscription items, returns meaningful HTTP status codes, avoids logging payment payloads, and exposes health/readiness endpoints.

## Verification

The currently verified immutable revisions are:

- RingoMeet: `ringomeet-node26--obsheal1`, image digest `sha256:72d9ff23c2ee2669996487f8269d5be2e3e8cdc4aff16620e44e82b9f753bf20`.
- Stripe Donate: `stripedonate-node26--stripehardening4`, image digest `sha256:2b6bb19a61657675d6195b8f22028e219c65c9564c8f0c84ef5fcd9fcd24edd6`.

The direct E2E smoke test passed on Node `v26.5.0`: health, readiness/Key Vault
resolution, real ACS token issuance, token refresh, ACS chat-thread creation,
participant addition, browser delivery, Stripe readiness, and safe invalid-payment
validation. RingoMeet's 7 non-writing browser tests passed. The official Stripe
test-mode lane was attempted with the stored test key but Stripe returned 401
for that key before a PaymentIntent was created; no live charge was attempted.

## CI/CD release contract

The reviewed pipeline definition is [`.github/workflows/node26-release.yml`](../../.github/workflows/node26-release.yml), with shell entry points in [`ci/`](ci/). Pull requests run verification only; publishing and deployment are manual, with deployment protected by the `node26-production` environment.

The release sequence is:

1. Run each service's tests and `npm audit --audit-level=high` inside the exact pinned `node:26.5.0-alpine` image.
2. Build each image with the pinned Alpine base, `linux/amd64`, BuildKit, provenance/SBOM output disabled for deterministic legacy Container Apps compatibility, and no source secrets.
3. Push the immutable commit/input tag to `acrglobalapps`.
4. Resolve the ACR manifest digest after the push. The digest handoff is uploaded as a short-lived workflow artifact; deployment never reconstructs it from a tag. The input tag is re-resolved immediately before mutation and must still match the handed-off digest.
5. Require the protected `node26-production` environment and `DEPLOY_APPROVED=true` before any Container Apps mutation.
6. Capture the current Ready image and resolve it to a digest before updating the named app by `registry/repository@sha256:...`.
7. Wait until the new revision is Running, Healthy, and Azure reports it as `latestReadyRevisionName`.
8. Run HTTPS smoke E2E: health, readiness, and a non-mutating negative contract. The smoke does not create an ACS thread, send a real chat participant, create a Stripe payment, or charge a card.
9. If deployment, readiness, or smoke fails after mutation starts, first verify that the app still runs the failed target digest, then update it to the captured previous digest, wait for the rollback revision to become Ready, and fail the job. This prevents an automatic rollback from overwriting an unrelated newer deployment. An unsuccessful rollback exits with status 2 and requires an operator to stop further traffic changes.

The pipeline uses a concurrency group so two production deployment runs cannot overlap, and deploys the two services serially with fail-fast enabled. If the first service fails, its rollback completes in that job and the second service is not started. Pull requests verify only; publishing is manual, restricted to `main` for deployment, and environment-protected. A production deployment must not be simulated by setting a local shell variable; use the protected GitHub environment and workload identity. A forced workflow cancellation or runner loss can still prevent an `EXIT` trap from running; in that case, verify the live image against the recorded target and perform the documented digest rollback manually before any further traffic change.

The workflow is now in the repository root where GitHub discovers it. Ordinary pushes do not publish images or mutate Azure. Pull requests run the pinned service and browser verification jobs. A manual run can publish, and only a manual run on `main` with `deploy=true` can enter the protected deployment environment.

Required GitHub configuration is documented in [`README.md`](README.md): the subscription variable, workload-identity secrets, federated credential restrictions, and named environment reviewers. The scripts default to the documented `acrglobalapps`, `rg-hm-proxy`, `RingoMeet`, and service names, but the subscription ID remains an explicit repository variable.

The repository pipeline is designed for later releases; the current runtime image promotion was separately performed by immutable digest and verified live.

## Cutover and rollback

The old `RingoMeet` App Service and `stripedonate` Function App are intentionally not deleted. No custom hostname was attached to either old resource, so their Azure-managed hostnames cannot be atomically renamed to the Container App hostnames. Before a public caller cutover, route the existing edge or caller configuration to the new hosts and test again. Keep the old resources until a soak period and a confirmed caller inventory are complete. If rollback is needed, return the caller/edge route to the old host; the old application settings and deployed artifacts remain untouched.

## Stripe Donate scale (2026-10-13)

`stripedonate-node26` runs with `minReplicas: 1`. Scale-to-zero never happened in practice: the Front Door origin group `stripedonate-origins` (taodoor-standard) probes `GET /readyz` every 120 seconds from each edge POP. That is about 7,000 requests/day, compared with 3–35 client requests/day forwarded by Front Door. The probes kept one replica up 24/7. With `minReplicas: 0`, every second of that replica is billed at the **active** vCPU rate, about $14/month. A replica held at its minimum count is billed at the **idle** rate ($0.000003 instead of $0.000024 per vCPU-second) whenever it is not serving a request. The expected cost is about $4–5/month, and donors no longer hit a cold start.

The deploy and rollback scripts change only the image, so this setting carries over to new revisions. To set it or revert it:

```bash
az containerapp update --name stripedonate-node26 --resource-group RingoMeet \
  --subscription 6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f --min-replicas 1 --max-replicas 2
```

Scale-to-zero would bring this close to $0, but only if the Front Door health probe on that single-origin group is disabled (Microsoft's guidance for single-origin groups). That is a Front Door change and was out of scope. Stripe does not call this app: there is no webhook route, and `POST /webhook` returns 404. Ingress IP restrictions therefore do not affect Stripe. They would not lower cost either, because the probes have to be allowed.

## Stripe Donate origin lock (FocusApiary/infrastructure#507)

`stripedonate-node26` has external Container Apps ingress, so its default hostname is reachable by anyone. The public path is `https://p.taolearning.org` -> Azure Front Door `taodoor-standard` (WAF `tliwafstandard`, rate limits). To keep the WAF and rate limits from being bypassed, the origin only serves requests that carry the Front Door profile GUID in `X-Azure-FDID`:

- `stripedonate/server.mjs` returns `403 {"error":"Forbidden"}` for every route (donation POST, CORS preflight, `/healthz`, `/readyz`, unknown paths) unless `X-Azure-FDID` equals one of the GUIDs in the `FRONT_DOOR_ID` environment variable (comma-separated, case-insensitive, constant-time compare). Front Door adds this header to proxied requests and to its health probes (`/readyz`), so no path is exempt. Refusals carry no CORS headers.
- The server refuses to start without `FRONT_DOOR_ID` unless `ALLOW_DIRECT_ACCESS=true` (local development only), so a misconfigured revision fails readiness and the deploy rolls back instead of silently serving the open origin.
- `ci/deploy-by-digest.sh` sets `FRONT_DOOR_ID` from `ci/lib.sh` (`STRIPEDONATE_FRONT_DOOR_ID`) in the same `az containerapp update` that changes the image, and `ci/smoke-e2e.sh` proves the lock on every release (valid header: 400 validation error; missing or wrong header: POST and OPTIONS return 403).
- The GUID is an identifier, not a secret. If the Front Door profile is ever recreated, update `STRIPEDONATE_FRONT_DOOR_ID` (check with `az afd profile show -g tli_interest --profile-name taodoor-standard --query frontDoorId -o tsv`) and redeploy.

Decision: no `ipSecurityRestrictions` for the `AzureFrontDoor.Backend` service tag. Container Apps accepts CIDRs only; the tag currently expands to 157 IPv4 ranges that Microsoft changes weekly. A stale list would silently drop donation traffic, and CI runners (smoke tests) would also be blocked. The header check is therefore the control. Residual risk: anyone who learns the (non-secret) profile GUID can spoof the header and bypass the lock; they still hit only the app's own validation, never Stripe credentials. Moving to Front Door Premium with Private Link, or a scheduled, reviewed service-tag refresh job, would close that gap and is tracked in the issue.

Callers: the app has no Stripe webhook receiver (see `stripedonate/TESTING.md`) and the Stripe account has no webhook endpoints configured, so Stripe never calls the origin. The only callers are browsers and Front Door via `p.taolearning.org`. Azure Container Apps defines no probes for this app.
