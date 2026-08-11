# Global Enterprise brief delivery

This package is the low-cost delivery boundary for the long-form PDF field guides.

It creates one resource group containing:

- a private, Standard LRS StorageV2 account and `briefs` container;
- a Linux Flex Consumption Function App for form validation, lead capture, signed PDF links, unsubscribe handling, and the small consented follow-up sequence; and
- Azure Communication Services Email, using an Azure-managed sender domain until the Global Enterprise domain is verified.

The PDFs are not served from GitHub Pages by this design. The site form posts to the Function, the Function stores a minimal request record, creates a short-lived read-only user-delegation SAS, and emails the link. The Blob container remains private and directory listing is disabled.

## Target Azure placement

The discovered `taodoor` Front Door profile belongs to the `focushive` tenant, Microsoft Partner Network subscription `6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f`, in resource group `tli_interest`. The default deployment target for this package is therefore:

- subscription: `6e60a8fd-9992-4ff7-8a3e-db96b4dfed4f`;
- resource group: `rg-globalenterprise-briefs`;
- region: `eastus`.

Change the subscription explicitly if Finance or platform ownership says the Global Enterprise workload belongs elsewhere.

## Deployment sequence

Run the following from the infrastructure repository after review. Use `what-if` first; the normal infrastructure workflow should own the apply. This site repository now includes a manual GitHub Actions workflow at `.github/workflows/deploy-brief-delivery.yml` for the foundation, Function package, sender configuration, and private PDF upload. It requires OIDC variables `BRIEF_AZURE_CLIENT_ID`, `BRIEF_AZURE_TENANT_ID`, and `BRIEF_AZURE_SUBSCRIPTION_ID`, plus the environment secret `BRIEF_UNSUBSCRIBE_TOKEN_KEY`; it runs only when the operator types `PROVISION` and the production environment allows it.

```bash
az deployment sub what-if \
  --location eastus \
  --template-file infra/brief-delivery/main.bicep \
  --parameters infra/brief-delivery/parameters.example.json

az deployment sub create \
  --location eastus \
  --template-file infra/brief-delivery/main.bicep \
  --parameters infra/brief-delivery/parameters.example.json
```

After the Email Communication Service provisions its Azure-managed domain, retrieve the MailFrom address and set `ACS_SENDER_ADDRESS` on the Function App. A verified `mail.globalenterprise.com` sender should replace the Azure-managed address before a serious campaign launch; it gives recipients a recognizable sender and lets the domain's existing SPF/DKIM policy do its work.

Build and publish the Function from `function/` with the repository's approved Azure deployment identity. Then upload only the PDFs:

```bash
./upload-pdfs.sh
```

The deployment must receive a random `unsubscribeTokenKey` through the approved secret store or CI secret. The Function encrypts unsubscribe tokens in the private lead record; an empty value intentionally keeps the health check unready. `turnstileRequired` remains `false` until a matching Turnstile widget and site key are added to the forms.

The uploader intentionally does not upload the HTML report editions, generated images, source notes, or site files.

## Site configuration

Set the GitHub Pages build variable `PUBLIC_BRIEF_API_URL` to the final same-brand endpoint, for example:

```text
https://briefs.globalenterprise.com/api/brief-request
```

Until this variable is set, the static site retains its FormSubmit fallback so local builds do not point at a nonexistent service. The production switch should happen only after the Function, email sender, and Front Door route have passed a test submission.

## Front Door integration

`taodoor-standard` is shared production infrastructure and is tagged as Terraform-managed. Do not add an origin or route by hand. Add the Function hostname as a new origin in the existing infrastructure workflow, add a dedicated `briefs.globalenterprise.com` custom domain, and apply the smallest route possible:

- `/api/brief-request` → Function origin, no caching;
- `/api/unsubscribe` → Function origin, no caching; GET shows a confirmation page and POST performs the opt-out so mail scanners cannot unsubscribe someone accidentally;
- `/api/health` → Function origin, no caching and preferably restricted to monitoring;
- no Blob origin is needed for the first release because the emailed SAS points directly to private Blob Storage.

The Front Door WAF should receive a rate-limit rule for the brief POST route. Keep the Function's application-level rate limit as a second control because the edge is shared.

## Dynamics 365 recommendation

The Function writes a minimal lead event and consented nurture state to Blob Storage and can POST the same event to an HMAC-protected `NURTURE_WEBHOOK_URL`. That seam is intentional: once the Dynamics/Dataverse environment and table design are confirmed, the webhook should create or update a Lead/Contact plus a `Brief Engagement` row and campaign source.

Dynamics should own identity resolution, owner assignment, pipeline stage, tasks, suppression, and reporting. It should not own the PDF binary or be the public download gate. The first nurture stages are explicit and report-specific: immediate delivery, a worksheet prompt after three days, a decision-room prompt after ten days, and a working-session invitation after twenty-one days. Every message carries an unsubscribe link and the sequence stops on opt-out.

## Cost posture

This is intentionally Flex Consumption (`FC1`) + Standard LRS + no always-ready instances. At low lead volume the principal recurring costs are email sends and small Function/Blob transactions. Application Insights is not provisioned by default; add it when the workflow earns enough volume to justify centralized telemetry. Do not add Cosmos DB, a dedicated App Service plan, Redis, or a second Front Door profile for this use case.
