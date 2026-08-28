# Dataverse bridge contract

Status: live contract for the direct managed-identity bridge; also used by the optional `NURTURE_WEBHOOK_URL` extension.

This contract is intentionally separate from the delivery ledger. The Function remains the delivery system of record and projects the accepted `brief.requested` event directly to Dream Dataverse with its UAI. When `NURTURE_WEBHOOK_URL` is configured, it also emits the HMAC-protected event below for a private downstream bridge. Every consumer must validate the event, project only the fields below, and write Dataverse by request ID.

## Boundary and assumptions

The optional webhook posts this shape after the email send succeeds and the direct Dataverse projection has been attempted:

```json
{
  "eventType": "brief.requested",
  "occurredAt": "2026-08-11T15:04:05.000Z",
  "record": {
    "id": "request UUID",
    "createdAt": "2026-08-11T15:04:05.000Z",
    "email": "person@example.com",
    "name": "Example Person",
    "organization": "Example Organization",
    "context": "operating context supplied by the requester",
    "report": "AI Governance Controls",
    "reportSlug": "ai-governance-controls",
    "formKind": "report-request",
    "sourceUrl": "https://globalenterprise.com/resources/ai-governance-controls/",
    "consent": {
      "value": true,
      "capturedAt": "2026-08-11T15:04:05.000Z",
      "scope": "report-specific-follow-up"
    },
    "delivery": {
      "status": "sent",
      "sentAt": "2026-08-11T15:04:06.000Z",
      "messageId": "provider delivery identifier",
      "expiresAt": "2026-08-13T15:04:06.000Z"
    },
    "nurture": { "status": "active", "nextStage": 1, "stages": [] }
  }
}
```

The example is illustrative. Do not copy it into telemetry or use it as a Dataverse row. The webhook signature is sent in `x-globalenterprise-signature`, calculated over the exact raw request body. It is not part of the JSON event and must never be copied into Dataverse.

The bridge must:

1. accept only `eventType = brief.requested` over HTTPS;
2. verify the HMAC over the raw body before parsing or logging it;
3. reject a missing or invalid signature, malformed event, invalid email, or consent other than the exact value and scope described below;
4. project only the canonical payload in [`dataverse-bridge-contract.schema.json`](./dataverse-bridge-contract.schema.json);
5. upsert one `GE Brief Engagement` row using `ge_request_id` as an alternate key; and
6. return success for a replay of the same request after the first upsert has completed.

If the chosen Logic App connector cannot validate the current HMAC contract without exposing the raw body or secret in run history, place a private validation/projection boundary in front of it. Do not weaken the signature check or move the secret into the event body.

## Canonical projected event

The bridge should derive this small event and use it as the only input to Dataverse. The source `record` is an input envelope, not a CRM schema.

```json
{
  "schemaVersion": "1.0",
  "eventType": "brief.requested",
  "eventId": "request UUID",
  "occurredAt": "2026-08-11T15:04:05.000Z",
  "person": {
    "email": "person@example.com",
    "emailHash": "sha256-of-lowercase-trimmed-email",
    "name": "Example Person",
    "organization": "Example Organization"
  },
  "engagement": {
    "requestId": "request UUID",
    "reportKey": "ai-governance-controls",
    "reportTitle": "AI Governance Controls",
    "context": "operating context supplied by the requester",
    "qualification": {
      "role": "Technology, data, or security",
      "decisionStage": "Building the case",
      "decisionHorizon": "Next 90 days",
      "organizationSize": "51-250",
      "industry": "Professional services",
      "primaryChallenge": "The decision context supplied by the requester",
      "preferredNextStep": "Email the field guide"
    },
    "sourceUrl": "https://globalenterprise.com/resources/ai-governance-controls/",
    "sourceCampaign": null,
    "formKind": "report-request",
    "consent": {
      "granted": true,
      "scope": "report-specific-follow-up",
      "capturedAt": "2026-08-11T15:04:05.000Z"
    },
    "delivery": {
      "status": "sent",
      "sentAt": "2026-08-11T15:04:06.000Z"
    }
  }
}
```

`emailHash` is a deterministic deduplication aid, not anonymization. The bridge may use the normalized email for safe Lead/Contact resolution, but it should not write the raw email into `GE Brief Engagement` if the native Lead or Contact record can own it. Raw email belongs only in the protected integration path and the CRM identity record required by the approved environment.

The projection deliberately excludes `delivery.messageId`, `delivery.expiresAt`, the whole `nurture` object, and any unknown source properties. It must also reject or drop any property named `unsubscribeToken`, `unsubscribeHash`, `unsubscribeUrl`, `sas`, `sasUrl`, `blobPath`, `privateBlobPath`, `pdfUrl`, `pdfLink`, `webhookSecret`, or `signature`.

## Dataverse mapping

The live table logical name is `ge_briefengagement`, entity set `ge_briefengagements`, and the publisher-prefixed logical names are confirmed in Dream. The mapping below retains the readable contract names; Dataverse removes underscores from the publisher-prefixed logical column names (for example, `ge_request_id` is `ge_requestid`).

| Canonical source | Dataverse target | Transform and ownership |
| --- | --- | --- |
| `engagement.requestId` | `ge_request_id` | Identity. Alternate key and idempotency key. Never use email as the key. |
| `engagement.reportKey` | `ge_report_key` | Stable report slug. Do not use a public URL as the key. |
| `engagement.reportTitle` | `ge_report_title` | Human-readable snapshot from the event. |
| `person.emailHash` | `ge_email_hash` | SHA-256 of lowercase, trimmed email. Pseudonymous lookup aid only. |
| `person.email` | Native Lead/Contact email | Secure identity resolution only; do not duplicate into the engagement table unless required by the approved schema. |
| `person.name` | `ge_name` | Supplied name, length-limited and escaped by the producer. |
| `person.organization` | `ge_organization` | Supplied organization; do not infer an Account from the string alone. |
| `engagement.context` | `ge_context` | Supplied use case or operating lens. Do not reinterpret it as buying intent. |
| `engagement.qualification.*` | Approved qualification columns or a related intake object | Preserve the supplied routing context; do not derive budget, authority, or intent. Keep sensitive free text out of CRM. |
| normalized `engagement.sourceUrl` | `ge_source_url` | Strip query and fragment before storage. Preserve only origin and path. |
| whitelisted `utm_campaign` | `ge_source_campaign` | Derived only when present in the source URL. Never persist the complete query string. |
| `engagement.consent.scope` | `ge_consent_scope` | Preserve exactly as `report-specific-follow-up`. Never promote to `occasional-notes` or a general marketing list. |
| `engagement.consent.capturedAt` | `ge_consent_captured_at` | Preserve the producer timestamp; do not replace it with bridge receipt time. |
| `engagement.delivery.status` | `ge_delivery_status` | Map only to the playbook choices. The event is emitted after the Function’s send attempt succeeds. |
| `engagement.delivery.sentAt` | `ge_delivery_sent_at` | Preserve when present; otherwise leave null. |
| derived initial state | `ge_nurture_stage` | Set to `0` only when the row is first created. Never reset an existing stage on replay. |
| derived new-row state | `ge_suppression_status` | Set to `active` only for a new row. Never overwrite `opted-out`, `bounced`, or `manual-hold`. |
| `occurredAt` | `ge_last_event_at` | Recommended technical column used for monotonic replay protection. Add it to the custom table if the environment does not already have an equivalent. |
| CRM resolution | `ge_contact`, `ge_account`, `ge_owner` | CRM-owned. Resolve with the approved matching and ownership rules; never infer ownership from the form. |
| no source value | `ge_last_engagement_at` | CRM-owned. A request is not an engagement signal. |

## Idempotent upsert rules

Configure `ge_request_id` as a unique alternate key on `GE Brief Engagement`. The bridge should use Dataverse upsert, not “search then create.” Search-then-create allows two concurrent retries to create duplicate rows.

For each accepted event:

1. Normalize and validate the event.
2. Build the canonical projection.
3. Upsert the row by `ge_request_id = engagement.requestId`.
4. On create, write the event-owned fields, set `ge_nurture_stage = 0`, set `ge_suppression_status = active`, and set `ge_last_event_at = occurredAt`.
5. On update, apply only event-owned fields when `occurredAt` is greater than or equal to the stored `ge_last_event_at`. Keep the same values for an equal timestamp.
6. Never overwrite `ge_suppression_status` when it is `opted-out`, `bounced`, or `manual-hold`.
7. Never overwrite `ge_nurture_stage`, `ge_last_engagement_at`, `ge_contact`, `ge_account`, or `ge_owner` from a `brief.requested` event.
8. Return a 2xx result for an identical replay after the row is already present. A retry must not create a second Lead, Contact, Account, task, campaign member, or engagement row.

Separate report requests from delivery retries. The Function generates a new request ID for a new form submission; therefore two different report requests from the same person should remain two engagement rows. De-duplicate only the same request ID.

## Consent and suppression rules

The current producer records one explicit consent scope: `report-specific-follow-up`. The bridge must preserve that exact scope and captured timestamp. It must not:

- add the person to a general newsletter or `occasional-notes` list;
- infer consent from an email address, a click, a page view, or a prior request;
- treat delivery as consent for a different purpose;
- write the unsubscribe URL or token to Dataverse; or
- reactivate a CRM record already marked opted out, bounced, or manual hold.

The Function does not emit a public webhook event when `/api/unsubscribe` is called. Instead, its direct managed-identity bridge updates the matching Dataverse engagement to `ge_suppressionstatus = opted-out` after the private Blob record is marked opted out. Dataverse must not independently send the sequence unless a separately reviewed suppression event or synchronization path is enabled.

## Data that must never cross the bridge

The following are delivery or security artifacts and must not be stored in Dataverse, bridge logs, error messages, run-history outputs, or CRM notes:

- PDF bytes or a PDF filename when it reveals a private storage convention;
- any SAS URL, SAS query string, Blob URL, Blob path, or container name;
- `unsubscribeToken`, `unsubscribeHash`, or `unsubscribeUrl`;
- the webhook secret or the HMAC signature;
- raw request bodies in normal application logs;
- provider message IDs unless a separately approved delivery-reconciliation field is needed; and
- the Function’s full `nurture` object, including due dates and stage internals.

The bridge may retain a short-lived correlation ID equal to `eventId` in protected diagnostics. Do not use that ID to construct a delivery URL.

## Failure and replay behavior

Return a retryable failure for Dataverse throttling, timeout, or a transient 5xx. Retry the identical canonical event with the same `ge_request_id` and bounded backoff. Return a non-retryable 4xx for invalid HMAC, unsupported event type, invalid consent, invalid report key, schema violation, or secret-like fields in the projected payload.

If Dataverse succeeds but the bridge response is lost, the next delivery is safe because the alternate key makes the operation idempotent. If identity resolution is ambiguous, keep the engagement row and route it for human resolution; do not create duplicate Contacts or Accounts merely to complete the automation.
