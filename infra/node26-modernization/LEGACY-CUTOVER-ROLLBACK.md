# Legacy RingoMeet / Stripe Donate cutover runbook

**Decision at 2026-08-13:** **NO-GO to stop either legacy resource today.** No
Azure resource was stopped, deleted, or reconfigured during this review. This
runbook is a gated plan for a later, owner-approved cutover; it is not an
authorization to execute one.

## Scope and hard boundary

This runbook covers the legacy RingoMeet App Service, the legacy Stripe Donate
Function App, their Azure-managed plans, the replacement Container Apps, the
public DNS/edge path, ACS, Stripe, Key Vault, and the shared image registry.

HM Proxy is out of scope. The replacement apps read images from the shared
`acrglobalapps.azurecr.io` registry, which is a dependency only. Do not change
the HM Proxy app, its routes, its registry configuration, or anything in its
resource group as part of this cutover.

## Live topology and dependencies

All resources below are in tenant `focushive`, subscription **Microsoft
Partner Network** (`6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f`) unless stated
otherwise.

### Legacy RingoMeet

- App Service: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/RingoMeet/providers/Microsoft.Web/sites/RingoMeet`
- Plan: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/RingoMeet/providers/Microsoft.Web/serverFarms/AppServicePlan-RingoMeet`
- Public hostname: `ringomeet.azurewebsites.net`; HTTPS-only is enabled; no
  custom hostname, App Service managed identity, or slot was returned.
- App settings names observed without reading values: `ResourceConnectionString`
  and `WEBSITE_NODE_DEFAULT_VERSION`. The connection string is a dependency on
  the Communication Services resource below; its secret value was not read.
- ACS resource: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/RingoMeet/providers/Microsoft.Communication/CommunicationServices/CommunicationServices-RingoMeet`
- Old browser/API surface is live at the old host. The root serves the ACS
  Calling Sample UI; the legacy `GET /token?scope=voip` route returned 200.
  Do not use that route as a routine health probe: it issues ACS credentials
  and can create a user as part of the legacy contract.
- Azure Monitor, 2026-07-14T00:00Z through 2026-08-13T00:00Z: **11 Requests**
  and **1 Http5xx**, both recorded on 2026-08-12. This is not an idle-resource
  signal, even though the volume is low.

### Legacy Stripe Donate

- Function App: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/stripedonate/providers/Microsoft.Web/sites/stripedonate`
- Plan: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/stripedonate/providers/Microsoft.Web/serverfarms/WestUSPlan`
- Azure hostname: `stripedonate.azurewebsites.net`; HTTPS-only is enabled;
  system-assigned identity principal ID is
  `a203e2bc-b3cc-4926-b075-a5407898b9af`.
- Function metadata exposes `stripedonate/StripeHttpTrigger` as an anonymous
  HTTP POST trigger. No webhook function was found in the function list.
- Custom hostname: `p.taolearning.org`, with an App Service certificate
  resource ending in `8E187B37084A24B5F009D112F903BCB8B10D13AE-stripedonate-WestUSwebspace`.
- DNS currently returns `p.taolearning.org CNAME stripedonate.azurewebsites.net`.
  The zone is delegated to Cloudflare, but the hostname resolves directly to
  Azure rather than to the shared Front Door. Its public TLS handshake served
  a Cloudflare Origin CA certificate; ordinary certificate validation failed
  in the probe environment. Treat this as a TLS/edge prerequisite, not as a
  cutover-ready public endpoint.
- The current root is the default Azure Function “up and running” page, not a
  confirmed donor UI. A missing Azure request series is not proof of safety;
  external callers, saved integrations, or payment clients may still post to
  the anonymous trigger.

### Replacement Container Apps

- Environment: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/RingoMeet/providers/Microsoft.App/managedEnvironments/aca-node26`
  with `Consumption` workload profile, default domain
  `happyrock-d12daa4c.eastus.azurecontainerapps.io`, and platform logs sent to
  Azure Monitor.
- RingoMeet app: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/RingoMeet/providers/Microsoft.App/containerApps/ringomeet-node26`
  - public FQDN: `ringomeet-node26.happyrock-d12daa4c.eastus.azurecontainerapps.io`
  - current ready revision: `ringomeet-node26--globalapps`
  - current image digest:
    `sha256:72d9ff23c2ee2669996487f8269d5be2e3e8cdc4aff16620e44e82b9f753bf20`
  - external HTTP ingress, HTTPS-only, target port 8080, min replicas 0,
    max replicas 2, system identity, and no custom domain.
  - Key Vault references: `ringomeet-acs-connection-string`,
    `ringomeet-acs-endpoint`, and `ringomeet-acs-admin-user-id` in
    `omlab-secrets`.
- Stripe app: `/subscriptions/6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f/resourceGroups/RingoMeet/providers/Microsoft.App/containerApps/stripedonate-node26`
  - public FQDN: `stripedonate-node26.happyrock-d12daa4c.eastus.azurecontainerapps.io`
  - current ready revision: `stripedonate-node26--stripehardening4`
  - current image digest:
    `sha256:2b6bb19a61657675d6195b8f22028e219c65c9564c8f0c84ef5fcd9fcd24edd6`
  - external HTTP ingress, HTTPS-only, target port 8080, min replicas 0,
    max replicas 2, system identity, and no custom domain.
  - Key Vault reference: `stripedonate-stripe-secret-key` in `omlab-secrets`.
  - Payment mutations require a caller-supplied `Idempotency-Key`; the service
    allows `https://globalenterprise.com` and
    `https://www.globalenterprise.com` by default. `p.taolearning.org` is not
    in the observed allow-list.

The live revision names differ from the older deployment record
(`ringomeet-node26--final4` and `stripedonate-node26--pinned2`). Before any
cutover, capture the live revision and digest again; rollback must use the
captured live digest, not a stale document entry or mutable image tag.

## Why the answer is NO-GO today

1. **No public replacement route exists.** The shared Front Door profile
   `taodoor-standard` has no custom domain, route, or origin for RingoMeet or
   Stripe Donate. Its `p.taolearning.org` custom domain is absent; that domain
   still points directly to the old Function.
2. **RingoMeet has observed use.** Eleven requests and one 5xx occurred in the
   last 30-day metric window. The old browser/API host remains live, and no
   complete external caller inventory exists.
3. **Stripe compatibility is unproven.** The replacement changes the payment
   contract by requiring `Idempotency-Key` and changes the allowed browser
   origins. There is no evidence that every caller satisfies either contract.
4. **Rollback is not atomic.** DNS cutover is subject to TTL and resolver
   caching; Front Door changes require deployment; and neither ACA app has a
   custom domain that can be swapped atomically with the old Azure hostname.
5. **Cold-start behavior needs a deliberate decision.** Both ACA apps scale to
   zero. Stripe’s first `/healthz` probe timed out at 20 seconds, while later
   probes returned 200 in about 0.3 seconds. This may be scale-to-zero wake-up
   behavior, but it must be measured from the intended client path.
6. **RingoMeet has process-local state.** The replacement stores
   `/userConfig/:userId` in an in-memory `Map` while allowing up to two
   replicas. The owner must either accept that state as non-authoritative or
   externalize it/add an explicit session-affinity and restart-loss decision.
7. **External payment/ACS side effects do not roll back.** A Stripe PaymentIntent
   or subscription, or an ACS thread/user created during the new path, remains
   in the external service if traffic is later returned to the old path.

## Gated cutover checklist

Do not advance a gate unless the named owner records the evidence and approves
the next gate.

### Gate 0 — authorization and freeze

- [ ] Parent confirms the exact cutover window, DNS/Cloudflare owner, Azure
  owner, ACS owner, Stripe account owner, and rollback authority.
- [ ] Confirm the operation is a route/DNS change only; no stop/delete action
  is included in the initial cutover.
- [ ] Freeze image, Key Vault, ACR, Front Door, DNS, and application changes.
- [ ] Record current old-resource states, old hostnames, certificates, current
  ACA revision names/digests, Key Vault secret names, and AFD configuration.

### Gate 1 — caller and contract inventory

- [ ] Identify every RingoMeet caller and origin. Confirm legacy paths
  `/token`, `/refreshToken/:id`, `/getEndpointUrl`, `/createThread`,
  `/addUser/:threadId`, and `/userConfig/:userId` are all covered.
- [ ] Identify every Stripe caller, including scripts, saved forms, mobile or
  partner clients, and Stripe-side integrations. Confirm the exact POST path
  and whether each payment mutation sends a stable `Idempotency-Key`.
- [ ] Confirm the browser origin(s). Add or explicitly route every approved
  origin; do not assume `globalenterprise.com` covers `p.taolearning.org`.
- [ ] Confirm no caller relies on the old Function’s anonymous auth behavior,
  old response shapes, or a legacy Stripe key/mode that differs from the new
  Key Vault secret.

### Gate 2 — replacement and edge readiness

- [ ] Verify the current ACA revisions are Running/Ready and pinned to the
  approved digests; verify system identities can pull from
  `acrglobalapps.azurecr.io` and resolve the named Key Vault references.
- [ ] Verify the RingoMeet replacement against a non-production ACS test
  identity/tenant. Do not use production `GET /token` merely as a health check.
- [ ] Verify Stripe readiness and mode without sending a payment. Exercise
  invalid payloads and a test-mode payment only with the Stripe owner’s
  explicit approval; never use a production card for cutover validation.
- [ ] In the shared Front Door/IaC workflow, prepare (but do not apply without
  approval) the smallest route/origin change for the intended hostname. Set
  health probes to `/healthz` or `/readyz`, not a route that intentionally
  returns 404. Confirm managed TLS and WAF association.
- [ ] Prepare DNS with a documented low TTL and an exact before/after record.
  The public `p.taolearning.org` certificate must validate for intended
  clients; do not expose a Cloudflare Origin CA certificate directly.

### Gate 3 — controlled cutover

- [ ] Confirm old resources are still Running and their app settings,
  certificate, plan, and deployed artifacts are unchanged.
- [ ] Apply the approved edge/DNS change through its owning workflow. Do not
  change HM Proxy.
- [ ] From the real browser origin and an external network, verify RingoMeet
  root/UI, `/readyz`, token flow using a controlled ACS identity, thread flow
  only if explicitly approved, and browser media/chat behavior.
- [ ] Verify Stripe `/readyz`, CORS preflight, invalid request behavior, and a
  Stripe test-mode idempotent payment path with a preassigned key. Do not
  treat a 200 health response alone as payment readiness.
- [ ] Compare error rate, latency, payment outcomes, ACS behavior, and logs
  against the old path for at least the agreed soak window.

### Gate 4 — stop-only decision

Stopping remains a separate parent-approved action. It is allowed only when:

- [ ] DNS/edge has converged at the intended resolvers and synthetic checks
  show the new path from all approved origins.
- [ ] The caller inventory is signed off; no unknown direct dependency remains.
- [ ] RingoMeet has no unexplained requests/errors during the soak window, and
  the in-memory `userConfig` behavior is accepted or fixed.
- [ ] Stripe has confirmed request compatibility, idempotency, key mode,
  CORS, and no pending external reconciliation.
- [ ] A rollback owner is present, the old routes remain addressable, and the
  DNS/AFD rollback change has been rehearsed on paper with TTLs and owners.
- [ ] Parent explicitly approves stopping each resource separately. Never
  stop both together as one irreversible batch.

## Rollback procedure

Rollback is a traffic reversal, not an attempt to undo ACS or Stripe side
effects.

1. Declare rollback, freeze further deploys, and record the failing request
   IDs, revision, digest, time, and client origin.
2. If RingoMeet is failing, return the owning route/hostname to
   `ringomeet.azurewebsites.net`. If the old App Service was already stopped
   under a separate approval, start it before routing traffic; do not delete
   the plan, app, ACS resource, or settings.
3. If Stripe is failing, return the owning route to
   `stripedonate.azurewebsites.net`. For `p.taolearning.org`, restore the
   previous DNS CNAME through the DNS owner or restore the prior edge origin;
   account for TTL and resolver caching. Preserve the old certificate and
   Function identity.
4. Verify the old RingoMeet root and a non-mutating endpoint. Verify the old
   Stripe trigger with a schema-only or Stripe-approved test request; do not
   charge a card merely to prove rollback.
5. Keep the replacement ACA apps available for evidence collection. Do not
   delete revisions or images during incident response.
6. Reconcile any Stripe PaymentIntents/subscriptions and ACS threads/users
   created before rollback. Idempotency prevents duplicate payment attempts;
   it does not reverse a payment or subscription by itself.
7. Reopen the cutover only after the failed dependency and the route decision
   have a named owner and a new approval.

## Verification record for this pass

- New RingoMeet ACA: `/healthz` 200, `/readyz` 200, root UI 200.
- New Stripe ACA: `/readyz` 200; `/healthz` returned 200 after warm-up, with
  one preceding 20-second timeout; root correctly returns 404 because it is an
  API-only service.
- Old RingoMeet: root 200 and legacy token route 200; `/healthz` 404 is
  expected for the old contract.
- Old Stripe: root is the Azure Function default page; `/healthz` 404 is
  expected; Azure metadata confirms anonymous POST
  `StripeHttpTrigger`.
- DNS: `p.taolearning.org` still CNAMEs to the old Function hostname; no
  RingoMeet custom domain was found.
- Repository tests: Stripe Donate **19 passed**, browser/API flow passed, and
  the RingoMeet browser suite passed **7/7** non-writing live tests. The official
  Stripe test-mode E2E was attempted with the Key Vault test key but Stripe
  rejected that key with HTTP 401 before creating a PaymentIntent; no charge or
  test PaymentIntent was created. The pinned Node 26 container tests passed for
  both services, and the live services report Node `v26.5.0`.
- No stop/delete/control-plane mutation was performed. A legacy
  `GET /token?scope=voip` probe was used to confirm the old route; because that
  route issues ACS credentials, treat it as a service-level side effect and do
  not repeat it outside a controlled test identity.
