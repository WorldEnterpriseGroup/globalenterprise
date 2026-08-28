# Global Enterprise brief delivery

This package is the low-cost delivery boundary for the long-form PDF field guides.

It creates one resource group containing:

- a private, Standard LRS StorageV2 account and `briefs` container;
- a Linux Flex Consumption Function App for form validation, principal-dialogue intake, lead capture, signed PDF links, unsubscribe handling, and the small consented follow-up sequence; and
- Azure Communication Services Email, using an Azure-managed sender domain until the Global Enterprise domain is verified.

The PDFs are not served from GitHub Pages by this design. The site form posts to the Function, the Function stores a minimal request record, creates a short-lived read-only user-delegation SAS, and emails the link. The Blob container remains private and directory listing is disabled.

Brief requests require a company email address. The Function rejects public mailbox domains including Gmail, Google Mail, Hotmail, Outlook.com, Yahoo, and their supported country variants before writing the delivery ledger, sending email, or projecting the request into Dataverse. Custom company domains hosted by Google or Microsoft remain eligible. The separate principal-dialogue route is not a brief download and follows its own intake policy.

## Target Azure placement

The discovered `taodoor` Front Door profile belongs to the `focushive` tenant, Microsoft Partner Network subscription `6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f`, in resource group `tli_interest`. The default deployment target for this package is therefore:

- subscription: `6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f`;
- resource group: `rg-globalenterprise-briefs`;
- region: `eastus`.

Change the subscription explicitly if Finance or platform ownership says the Global Enterprise workload belongs elsewhere.

## Deployment sequence

Run the following from the infrastructure repository after review. Use `what-if` first; the normal infrastructure workflow should own the apply. This site repository now includes a manual GitHub Actions workflow at `.github/workflows/deploy-brief-delivery.yml` for the foundation, Function package, sender configuration, and private PDF upload. It requires OIDC variables `BRIEF_AZURE_CLIENT_ID`, `BRIEF_AZURE_TENANT_ID`, and `BRIEF_AZURE_SUBSCRIPTION_ID`; it runs only when the operator types `PROVISION` and the production environment allows it.

```bash
az deployment sub what-if \
  --subscription 6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f \
  --location eastus \
  --template-file infra/brief-delivery/main.bicep \
  --parameters infra/brief-delivery/parameters.example.json

az deployment sub create \
  --subscription 6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f \
  --location eastus \
  --template-file infra/brief-delivery/main.bicep \
  --parameters infra/brief-delivery/parameters.example.json
```

After the Email Communication Service provisions its Azure-managed domain, retrieve the MailFrom address and set `ACS_SENDER_ADDRESS` on the Function App. A verified `mail.globalenterprise.com` sender should replace the Azure-managed address before a serious campaign launch; it gives recipients a recognizable sender and lets the domain's existing SPF/DKIM policy do its work.

Build and publish the Function from `function/` with the repository's approved Azure deployment identity. Then upload only the PDFs:

```bash
./upload-pdfs.sh
```

The Function retrieves the named unsubscribe and nurture secrets from `omlab-secrets` through the Key Vault SDK using its user-assigned managed identity; secret values are never copied into app settings or the deployment payload. The Function encrypts unsubscribe tokens in the private lead record. `turnstileRequired` remains `false` until a matching Turnstile widget and site key are added to the forms.

The uploader intentionally does not upload the HTML report editions, generated images, source notes, or site files.

## Site configuration

Set the GitHub Pages build variable `PUBLIC_BRIEF_API_URL` to the final same-brand endpoint, for example:

```text
https://briefs.globalenterprise.com/api/brief-request
```

The production site uses `https://briefs.globalenterprise.com/api/brief-request` for report requests and principal-dialogue intake. The Function also exposes the explicit `https://briefs.globalenterprise.com/api/contact-request` route; `PUBLIC_CONTACT_API_URL` may opt the site into that dedicated route after the shared Front Door route is deployed. The existing brief route dispatches principal-dialogue submissions during edge rollout so the public contact form remains available. The Signal newsletter remains a separate manual-review form until a native subscription route is enabled.

## Front Door integration

`taodoor-standard` is shared production infrastructure and is tagged as Terraform-managed. Do not add an origin or route by hand. Add the Function hostname as a new origin in the existing infrastructure workflow, add a dedicated `briefs.globalenterprise.com` custom domain, and apply the smallest route possible:

- `/api/brief-request` → Function origin, no caching;
- `/api/contact-request` → Function origin, no caching; stores a minimal contact event, sends a branded internal notification, and resolves the requester to the Global Enterprise Account in Dream Dataverse;
- `/api/unsubscribe` → Function origin, no caching; GET shows a confirmation page and POST performs the opt-out so mail scanners cannot unsubscribe someone accidentally;
- `/api/health` → Function origin, no caching and preferably restricted to monitoring;
- no Blob origin is needed for the first release because the emailed SAS points directly to private Blob Storage.

The Front Door WAF should receive a rate-limit rule for the brief POST route. Keep the Function's application-level rate limit as a second control because the edge is shared.

## Dynamics 365 recommendation

The Function writes a minimal lead event and consented nurture state to Blob Storage, then projects the accepted event directly into Dream Dataverse with its user-assigned managed identity. Principal-dialogue records use a separate contact outbox with bounded retry and human-review handling for ambiguous identity matches; they never enter report nurture. `NURTURE_WEBHOOK_URL` remains an optional HMAC extension for a separately reviewed downstream workflow; it is not required for the CRM write path.

Dream Dataverse owns the native Contact relationship, the Global Enterprise Account association, engagement history, owner BU, pipeline stage, tasks, suppression, and reporting. It does not own the PDF binary or act as the public download gate. The first nurture stages are explicit and report-specific: immediate delivery, a worksheet prompt after three days, a decision-room prompt after ten days, and a working-session invitation after twenty-one days. Every message carries an unsubscribe link and the sequence stops on opt-out.

The live bridge is configured with `DATAVERSE_URL=https://dream.crm.dynamics.com`, the Global Enterprise account id, and the default team id. The Function identity is a managed-identity application user in the `Global Enterprise` BU with a custom role named `Global Enterprise Brief Delivery`; the role is limited to Local Create/Read/Write/Append/AppendTo on `GE Brief Engagement`, Local Contact resolution/write privileges, and Local Account read/AppendTo. No client secret or Dataverse token is stored in app settings.

The environment boundary is confirmed: Dream (`https://dream.crm.dynamics.com`) is in the focushive tenant, organization `52d2ebbc-9fc5-4cbc-854c-15c861e95020`. The `Global Enterprise` BU is `34888b00-f595-f111-8075-7ced8d6f5115`, its default owner team is `0df89b06-f595-f111-8075-7ced8d6f5115`, the parent Account is `e9aec63e-f595-f111-8075-00224803c40c`, and the custom solution is `globalenterprise_briefs` / `Global Enterprise Briefs`.

The production create-path test was verified on 2026-08-12 UTC: the public squeeze POST returned 303, the managed identity created a native Contact attached to the Global Enterprise Account, and it created a `ge_briefengagements` row in the new BU with delivery `sent`, nurture stage `0`, suppression `active`, the selected report, role, organization, and campaign source. The private Blob event remains the durable delivery ledger; Dataverse is the relationship and engagement system of record.

## Cost posture

This is intentionally Flex Consumption (`FC1`) + Standard LRS + no always-ready instances. At low lead volume the principal recurring costs are email sends and small Function/Blob transactions. Application Insights is not provisioned by default; add it when the workflow earns enough volume to justify centralized telemetry. Do not add Cosmos DB, a dedicated App Service plan, Redis, or a second Front Door profile for this use case.

## Runtime policy (August 2026)

The production Function App is pinned to the newest Azure Functions-supported
GA Node runtime, Node 24, in `functionAppConfig.runtime`. Node 26 is a current
Node release but is not an Azure Functions-supported production runtime yet;
do not force it through an app setting. Azure Functions also does not provide
an Alpine base image for this managed Flex runtime. Keep the official managed
Linux runtime and the 512 MB minimum Flex instance size for this low-volume,
I/O-bound service.

The deployment package uses the same Node 24 floor in `function/package.json`.
Run `npm ci` from `infra/brief-delivery/function` before packaging so the
checked-in lockfile remains the source of truth.
