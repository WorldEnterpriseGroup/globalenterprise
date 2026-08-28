# Dynamics 365 / Dataverse playbook

## Recommendation

Use Dream Dataverse as the relationship and engagement system. Do not use it as the PDF store and do not make it the public download gate.

The public boundary should stay deliberately small:

1. A person requests a named report and gives report-specific consent.
2. The Function validates the request, writes a minimal event to private Blob Storage, and emails a short-lived PDF link.
3. The Function’s managed identity sends a sanitized `brief.requested` projection directly to Dream Dataverse; an optional HMAC-protected webhook can fan out a separately reviewed event.
4. Dataverse resolves or creates the native Contact under the Global Enterprise Account, records campaign source and consent, and runs the explicit follow-up playbook.

The exact projection, idempotency, consent, suppression, and secret-handling rules are defined in [`CRM-BRIDGE-CONTRACT.md`](./CRM-BRIDGE-CONTRACT.md). The machine-readable canonical payload is [`dataverse-bridge-contract.schema.json`](./dataverse-bridge-contract.schema.json). The live Function implements this projection directly with its managed identity; the optional HMAC webhook uses the same contract when enabled.

This separates three things that are often mixed together: content delivery, relationship management, and marketing permission.

## Dataverse shape

Create one custom table called `GE Brief Engagement` rather than forcing every resource request into an unstructured note. Use the native Contact and Account tables for identity and organization. The live table logical name is `ge_briefengagement`, entity set `ge_briefengagements`, and `ge_requestid` is the alternate key.

Recommended `GE Brief Engagement` fields:

| Field | Type | Purpose |
| --- | --- | --- |
| `ge_request_id` | Text, alternate key | Idempotency key from the Function. |
| `ge_report_key` | Choice/text | Stable report slug, not a public URL. |
| `ge_report_title` | Text | Human-readable report name. |
| `ge_email_hash` | Text | Deterministic deduplication aid; do not use as the only identity key. |
| `ge_contact` | Native Contact join | The bridge resolves the native Contact by email and attaches that Contact to the Global Enterprise Account. |
| `ge_account` | Account association | The fixed Global Enterprise Account is the parent customer for the native Contact. |
| `ge_name` | Text | Name supplied in the form. |
| `ge_organization` | Text | Organization supplied in the form. |
| `ge_context` | Text/choice | Use case, region, or operating lens supplied in the form. |
| `ge_role` | Choice/text | Role in the decision, supplied by the requester. |
| `ge_decision_stage` | Choice/text | Decision stage selected in the intake. |
| `ge_decision_horizon` | Choice/text | Planning horizon selected in the intake. |
| `ge_organization_size` | Choice/text | Optional organization-size band; do not infer revenue or buying power. |
| `ge_industry` | Choice/text | Optional industry context supplied by the requester. |
| `ge_primary_challenge` | Text | Optional challenge summary; reject sensitive, classified, patient, credential, or regulated material. |
| `ge_preferred_next_step` | Choice/text | Requested next step; never treat it as a commitment to a meeting. |
| `ge_source_url` | URL | Page where the request started. |
| `ge_source_campaign` | Text | Campaign, squeeze-page, partner, or UTM source. |
| `ge_consent_scope` | Choice | `report-specific-follow-up`, `occasional-notes`, or `none`. |
| `ge_consent_captured_at` | Date/time | Time the permission was captured. |
| `ge_delivery_status` | Choice | `pending`, `sent`, `failed`, `bounced`, or `expired`. |
| `ge_delivery_sent_at` | Date/time | Delivery timestamp. |
| `ge_nurture_stage` | Choice/number | Current stage from the sequence below. |
| `ge_last_engagement_at` | Date/time | Last confirmed click, reply, or meeting action. |
| `ge_suppression_status` | Choice | `active`, `opted-out`, `bounced`, `manual-hold`. |
| `ge_owner` | Lookup | Human owner for a real conversation. |
| `ge_last_event_at` | Date/time | Technical replay guard; update only when an accepted source event is newer. |

Do not store the PDF, SAS URL, unsubscribe token, or the Function’s private Blob path in Dataverse. A signed URL is a delivery artifact with a short lifetime, not a CRM record. Keep the report key and delivery status; if someone needs the document later, generate a fresh link through an authenticated internal workflow.

## Relationship stages

The playbook should have visible stages and exit criteria:

### 1. Requested

Entry: the Function accepts the form and creates a request id. The record has report, source, use case, consent scope, and delivery status.

Action: send the PDF email immediately. Do not assign a sales owner solely because a form was submitted.

Exit: delivery succeeds, delivery fails after retry, or the address is suppressed.

### 2. Delivered

Entry: the email provider confirms the message is out for delivery.

Action: schedule only the report-specific prompts allowed by consent. Record delivery date and the first due date.

Exit: a meaningful engagement signal occurs, the person opts out, the address bounces, or the sequence completes.

### 3. Engaged

Entry: a link click, reply, second resource request, or explicit return visit is available. Treat opens as weak evidence because mail privacy features make them unreliable.

Action: create a task for a human to review the request context. The task should ask, “What decision is this person carrying?” rather than “Send a sales email.”

Exit: working conversation booked, no response after the sequence, or suppression.

### 4. Working conversation

Entry: the person replies, requests a meeting, or accepts a relevant invitation.

Action: convert or associate the Lead with the correct Contact and Account. Capture mandate, decision horizon, stakeholders, constraints, and what “useful” means. Do not copy sensitive information from email into the public intake record.

Exit: qualified opportunity, advisory conversation, partner conversation, or closed/no-fit.

### 5. Qualified / closed

Entry: a human confirms that there is a real mandate, owner, time horizon, and next action—or that there is not.

Action: report conversion by report, source, industry, and stage. Preserve suppression and consent history even when the commercial record is closed.

## The follow-up sequence

The sequence should feel like a useful continuation of the report, not a disguised sales drip campaign.

| Timing | Message | Intended value | Stop condition |
| --- | --- | --- | --- |
| Immediately | PDF delivery | Give the promised field guide and explain its scope. | Delivery failure or suppression. |
| Day 3 | Worksheet prompt | Ask the reader to name one decision blocked by ownership, evidence, or context. | Reply, opt-out, bounce, or manual hold. |
| Day 10 | Decision-room prompt | Suggest a 30-minute internal conversation using one artifact from the report. | Reply, meeting, opt-out, or bounce. |
| Day 21 | Working-session invitation | Offer a focused conversation only if the report’s subject remains relevant. | Any response, opt-out, bounce, or sequence completion. |

Every follow-up must identify why the person is receiving it, link to one-click unsubscribe, and avoid unrelated offers. If consent is only `report-specific-follow-up`, do not add the person to the general newsletter or a different campaign.

## Routing and scoring

Use a light-touch score to prioritize human attention, not to automate a conclusion:

- +1: requested a second report;
- +2: clicked the delivery or worksheet link;
- +3: replied with a mandate, constraint, or question;
- +4: requested or accepted a working session;
- −5: bounced or opted out;
- manual hold: any indication of sensitive, regulated, classified, or inappropriate material.

At +3, create a review task. At +4, offer a human response. Never infer budget, authority, procurement timing, or buying intent from an email address or a page view alone.

## Board and operating metrics

The CRM dashboard should answer business questions, not only marketing questions:

- Which report attracts the highest-quality working conversations?
- Which squeeze page produces requests from organizations we can actually serve?
- How long is the interval from request to meaningful human dialogue?
- Where do delivery failures, bounces, and opt-outs cluster?
- Which topics generate repeated interest without turning into a mandate?
- Are owners responding within the agreed service level?

Keep the public delivery telemetry separate from commercial conversion reporting. A high download count is not proof of demand, and a low conversion rate may indicate weak positioning, wrong audience, poor delivery, or an unclear next step.

## Environment boundary

The environment is live and confirmed: Dream (`https://dream.crm.dynamics.com`) in the focushive tenant, organization `52d2ebbc-9fc5-4cbc-854c-15c861e95020`. Global Enterprise uses BU `34888b00-f595-f111-8075-7ced8d6f5115`, default owner team `0df89b06-f595-f111-8075-7ced8d6f5115`, and Account `e9aec63e-f595-f111-8075-00224803c40c`. The application user is the Function’s UAI `14e5316d-8131-4c12-b9b3-b00ea9a098e7` and is assigned only the custom `Global Enterprise Brief Delivery` role.

The private Blob record remains the durable low-cost delivery ledger. Dataverse is the relationship and engagement system of record. Raw email is stored only on the native Contact; the engagement row stores a SHA-256 email hash, request id, qualification fields, report, campaign, delivery state, nurture stage, and suppression state. PDF binaries, SAS links, unsubscribe tokens, and private Blob paths are never written to Dataverse.
