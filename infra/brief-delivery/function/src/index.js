import crypto from "node:crypto";
import { app } from "@azure/functions";
import { EmailClient } from "@azure/communication-email";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const EXTERNAL_TIMEOUT_MS = 10_000;

function boundedInteger(value, minimum, maximum, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function normalizeSiteUrl(value) {
  try {
    const url = new URL(value || "https://globalenterprise.com");
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("invalid_site_url");
    return url.origin;
  } catch {
    return "https://globalenterprise.com";
  }
}

const SITE_URL = normalizeSiteUrl(process.env.BRIEF_PUBLIC_SITE_URL);
const API_URL = normalizeSiteUrl(process.env.BRIEF_API_HOST ? (String(process.env.BRIEF_API_HOST).startsWith("http") ? process.env.BRIEF_API_HOST : `https://${process.env.BRIEF_API_HOST}`) : SITE_URL);
const STORAGE_ACCOUNT = process.env.BRIEF_STORAGE_ACCOUNT_NAME;
const CONTAINER_NAME = process.env.BRIEF_CONTAINER_NAME || "briefs";
const ACS_ENDPOINT = process.env.ACS_ENDPOINT;
const ACS_SENDER_ADDRESS = process.env.ACS_SENDER_ADDRESS;
const REPLY_TO = process.env.ACS_REPLY_TO || "info@globalenterprise.com";
const DATAVERSE_URL = (() => {
  try {
    const url = new URL(process.env.DATAVERSE_URL || "");
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return "";
    return url.origin;
  } catch {
    return "";
  }
})();
const DATAVERSE_ACCOUNT_ID = clean(process.env.DATAVERSE_ACCOUNT_ID, 64).toLowerCase();
const DATAVERSE_TEAM_ID = clean(process.env.DATAVERSE_TEAM_ID, 64).toLowerCase();
const DATAVERSE_ENTITY_SET = "ge_briefengagements";
const ALLOWED_ORIGINS = new Set((process.env.ALLOWED_ORIGINS || `${SITE_URL},https://www.globalenterprise.com`).split(",").map((value) => {
  try {
    const url = new URL(value.trim());
    return /^https?:$/.test(url.protocol) && !url.username && !url.password && !url.pathname.replace(/\/$/, "") && !url.search && !url.hash ? url.origin : null;
  } catch {
    return null;
  }
}).filter(Boolean));
const MAX_BODY_BYTES = boundedInteger(process.env.MAX_BODY_BYTES, 1_024, 64 * 1_024, 16 * 1_024);
const RATE_LIMIT_PER_HOUR = boundedInteger(process.env.RATE_LIMIT_PER_HOUR, 1, 100, 5);
const SAS_HOURS = boundedInteger(process.env.SAS_HOURS, 1, 72, 48);
// The forms do not render a Turnstile widget until a site key is configured.
// Keep the integration optional by default; honeypot, origin, rate, and WAF
// controls still apply. Set TURNSTILE_REQUIRED=true only with a matching site key.
const TURNSTILE_REQUIRED = parseBoolean(process.env.TURNSTILE_REQUIRED, false);
const credential = new DefaultAzureCredential();
const KEY_VAULT_URI = process.env.KEY_VAULT_URI ? normalizeSiteUrl(process.env.KEY_VAULT_URI).replace(/\/$/, "") : "";
const UNSUBSCRIBE_TOKEN_SECRET_NAME = clean(process.env.UNSUBSCRIBE_TOKEN_SECRET_NAME, 128);
const NURTURE_WEBHOOK_SECRET_NAME = clean(process.env.NURTURE_WEBHOOK_SECRET_NAME, 128);
const keyVault = KEY_VAULT_URI ? new SecretClient(KEY_VAULT_URI, credential) : null;
const secretCache = new Map();
const blobService = STORAGE_ACCOUNT ? new BlobServiceClient(`https://${STORAGE_ACCOUNT}.blob.core.windows.net`, credential) : null;
const container = blobService?.getContainerClient(CONTAINER_NAME);
const emailClient = ACS_ENDPOINT ? new EmailClient(ACS_ENDPOINT, credential) : null;

const reports = {
  "enterprise-decision-readiness": {
    title: "Enterprise Decision Readiness",
    blob: "enterprise-decision-readiness.pdf",
    filename: "global-enterprise-enterprise-decision-readiness.pdf",
    subject: "Your Enterprise Decision Readiness field guide",
    next: "resources/thanks/?resource=enterprise-decision-readiness",
    followUps: [
      "Use the worksheet to name one decision that is waiting on ownership, evidence, or escalation.",
      "Bring the decision stack into a 30-minute room: mandate, owner, evidence, exception, and next move.",
      "If the report is useful, reply with the bottleneck you are trying to make legible.",
    ],
  },
  "ai-governance-controls": {
    title: "AI Governance Controls",
    blob: "ai-governance-controls.pdf",
    filename: "global-enterprise-ai-governance-controls.pdf",
    subject: "Your AI Governance Controls field guide",
    next: "resources/thanks/?resource=ai-governance-controls",
    followUps: [
      "Use the control map to identify where a model output becomes a consequential workflow decision.",
      "Test one human-in-the-loop control against an exception rather than a happy path.",
      "If the report is useful, reply with the workflow where governance currently slows adoption.",
    ],
  },
  "modernization-investment-priority": {
    title: "Modernization Investment Priority",
    blob: "modernization-investment-priority.pdf",
    filename: "global-enterprise-modernization-investment-priority.pdf",
    subject: "Your Modernization Investment Priority field guide",
    next: "resources/thanks/?resource=modernization-investment-priority",
    followUps: [
      "Use the portfolio worksheet to classify one system as retire, wrap, replace, or redesign.",
      "Add continuity, capability, and transition cost to the modernization business case.",
      "If the report is useful, reply with the dependency that makes your next investment difficult.",
    ],
  },
  "global-operating-model-brief": {
    title: "Global Operating Model Brief",
    blob: "global-operating-model-brief.pdf",
    filename: "global-enterprise-global-operating-model-brief.pdf",
    subject: "Your Global Operating Model Brief",
    next: "insights/thanks/?source=global-brief",
    followUps: [
      "Use the context lens to separate the shared standard from the local translation it requires.",
      "Ask one cross-border team to make a handoff, decision right, or exception visible.",
      "If the brief is useful, reply with the region or operating context you are coordinating.",
    ],
  },
};

function clean(value, max = 500) {
  return String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

function escapeHtml(value, max = 500) {
  return clean(value, max).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

async function secretValue(name, fallbackSetting) {
  if (keyVault && name) {
    if (secretCache.has(name)) return secretCache.get(name);
    try {
      const result = await withTimeout(keyVault.getSecret(name), EXTERNAL_TIMEOUT_MS, "key_vault_secret_timeout");
      if (result.value) {
        secretCache.set(name, result.value);
        return result.value;
      }
    } catch {
      // Health and request paths fail closed below if the vault is unavailable.
    }
  }
  const fallback = clean(process.env[fallbackSetting], 4096);
  return fallback.startsWith("@Microsoft.KeyVault(") ? "" : fallback;
}

async function tokenKey() {
  const material = await secretValue(UNSUBSCRIBE_TOKEN_SECRET_NAME, "UNSUBSCRIBE_TOKEN_KEY") || await secretValue(NURTURE_WEBHOOK_SECRET_NAME, "NURTURE_WEBHOOK_SECRET");
  if (!material) throw new Error("unsubscribe_key_not_configured");
  return crypto.createHash("sha256").update(`globalenterprise-unsubscribe:${material}`).digest();
}

async function encryptToken(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", await tokenKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString("base64url")).join(".");
}

async function decryptToken(value) {
  const [ivValue, tagValue, ciphertextValue] = String(value || "").split(".");
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error("invalid_unsubscribe_token_ciphertext");
  const decipher = crypto.createDecipheriv("aes-256-gcm", await tokenKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
}

async function getUnsubscribeToken(record) {
  if (record?.unsubscribeTokenCiphertext) return decryptToken(record.unsubscribeTokenCiphertext);
  // Existing records may predate encrypted token storage. Do not write this legacy field back.
  return clean(record?.unsubscribeToken, 200);
}

function sanitizeSourceUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(String(value), SITE_URL);
    const site = new URL(SITE_URL);
    if (url.origin !== site.origin || !/^https?:$/.test(url.protocol)) return "";
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return "";
  }
}

function clientIp(request) {
  const trusted = request.headers.get("x-azure-clientip");
  if (trusted) return clean(trusted, 80);
  const forwarded = request.headers.get("x-forwarded-for");
  return clean(forwarded?.split(",")[0], 80);
}

function safeErrorCode(error) {
  const code = error?.code || error?.statusCode || error?.name || "unknown";
  return clean(code, 80).replace(/[^a-zA-Z0-9_.-]/g, "_");
}

async function withTimeout(promise, milliseconds, code) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(code)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function response(status, body, extraHeaders = {}) {
  return {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "content-type": "text/plain; charset=utf-8",
      ...extraHeaders,
    },
    body,
  };
}

function originHeaders(request) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
  };
}

function rejectOrigin(request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && !ALLOWED_ORIGINS.has(origin));
}

async function parseBody(request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return { error: "body_too_large" };
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json") && !contentType.includes("application/x-www-form-urlencoded")) return { error: "unsupported_content_type" };
  let raw;
  try {
    raw = await request.text();
  } catch {
    return { error: "body_unreadable" };
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return { error: "body_too_large" };
  if (contentType.includes("application/json")) {
    try {
      const value = JSON.parse(raw || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? { data: value } : { error: "invalid_body" };
    } catch {
      return { error: "invalid_body" };
    }
  }
  return { data: Object.fromEntries(new URLSearchParams(raw)) };
}

async function readJson(blobName) {
  const blob = container.getBlockBlobClient(blobName);
  try {
    const download = await blob.downloadToBuffer();
    return JSON.parse(download.toString("utf8"));
  } catch (error) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

async function writeJson(blobName, value, conditions) {
  const body = JSON.stringify(value, null, 2);
  const blob = container.getBlockBlobClient(blobName);
  await blob.upload(body, Buffer.byteLength(body), {
    blobHTTPHeaders: {
      blobContentType: "application/json",
      blobCacheControl: "no-store",
    },
    conditions,
  });
}

async function withExistingBlobLease(blob, callback) {
  const leaseClient = blob.getBlobLeaseClient();
  let lease;
  try {
    lease = await leaseClient.acquireLease(60);
  } catch (error) {
    if ([409, 412].includes(error?.statusCode)) return null;
    throw error;
  }
  try {
    return await callback(lease.leaseId);
  } finally {
    await leaseClient.releaseLease().catch(() => undefined);
  }
}

async function enforceRateLimit(key) {
  const blobName = `rate-limits/${hash(key)}.json`;
  const now = Date.now();
  const blob = container.getBlockBlobClient(blobName);
  const emptyRateLimitBody = JSON.stringify({ timestamps: [] });
  try {
    await blob.upload(emptyRateLimitBody, Buffer.byteLength(emptyRateLimitBody), {
      blobHTTPHeaders: { blobContentType: "application/json", blobCacheControl: "no-store" },
      conditions: { ifNoneMatch: "*" },
    });
  } catch (error) {
    if (![409, 412].includes(error?.statusCode)) throw error;
  }
  const result = await withExistingBlobLease(blob, async (leaseId) => {
    const existing = (await readJson(blobName)) || { timestamps: [] };
    const timestamps = existing.timestamps.filter((timestamp) => Number.isFinite(timestamp) && now - timestamp < HOUR_MS);
    if (timestamps.length >= RATE_LIMIT_PER_HOUR) return false;
    timestamps.push(now);
    await writeJson(blobName, { timestamps }, { leaseId });
    return true;
  });
  if (result === null) throw new Error("rate_limit_lock_busy");
  return result;
}

async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return !TURNSTILE_REQUIRED;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
    });
    if (!result.ok) return false;
    return Boolean((await result.json()).success);
  } catch {
    return false;
  }
}

async function signedPdfUrl(report) {
  if (!blobService || !container) throw new Error("storage_not_configured");
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + SAS_HOURS * 60 * 60 * 1000);
  const delegationKey = await blobService.getUserDelegationKey(startsOn, expiresOn);
  const filename = report.filename.replace(/["\\]/g, "_");
  const sas = generateBlobSASQueryParameters({
    containerName: CONTAINER_NAME,
    blobName: report.blob,
    permissions: BlobSASPermissions.parse("r"),
    startsOn,
    expiresOn,
    contentDisposition: `attachment; filename="${filename}"`,
    contentType: "application/pdf",
  }, delegationKey, STORAGE_ACCOUNT).toString();
  return `${container.getBlockBlobClient(report.blob).url}?${sas}`;
}

function renderEmail({ name, report, link, stage, unsubscribeUrl }) {
  const isInitial = stage === 0;
  const followUp = report.followUps[stage - 1];
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";
  const preheader = isInitial
    ? `Your ${report.title} field guide is ready to read.`
    : `One practical next step from your ${report.title} field guide.`;
  const intro = isInitial
    ? `Thanks for requesting the <strong>${escapeHtml(report.title)}</strong>. We made the complete field guide available for you below.`
    : `A small prompt from the <strong>${escapeHtml(report.title)}</strong>: ${escapeHtml(followUp)}`;
  const plainIntro = isInitial
    ? `Thanks for requesting the ${report.title}. Your complete PDF field guide is ready: ${link}`
    : `A small prompt from the ${report.title}: ${followUp}\n\nOpen the field guide: ${link}`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light dark">
    <title>${escapeHtml(report.title)}</title>
    <style>
      @media (prefers-color-scheme: dark) {
        .email-shell { background:#101820 !important; }
        .email-card { background:#182532 !important; }
        .email-copy, .email-heading { color:#f5f7fa !important; }
        .email-muted, .email-footer { color:#b7c3cf !important; }
        .email-note { background:#223342 !important; border-color:#385064 !important; }
      }
      @media screen and (max-width: 640px) {
        .email-pad { padding-left:20px !important; padding-right:20px !important; }
        .email-heading { font-size:34px !important; }
        .email-button { display:block !important; text-align:center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#e8eef3;-webkit-text-size-adjust:100%;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-shell" style="width:100%;background:#e8eef3;">
      <tr>
        <td align="center" class="email-pad" style="padding:28px 16px 44px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;">
            <tr>
              <td style="padding:8px 4px 18px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:12px;line-height:18px;font-weight:bold;letter-spacing:2px;color:#16324f;">
                      <span style="display:inline-block;width:24px;height:24px;line-height:24px;margin-right:8px;border-radius:6px;background:#16324f;color:#ffffff;text-align:center;font-size:12px;letter-spacing:0;vertical-align:middle;">GE</span>
                      GLOBAL ENTERPRISE
                    </td>
                    <td align="right" style="font-size:11px;line-height:18px;color:#647587;letter-spacing:1px;">FIELD GUIDE</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-card" style="background:#ffffff;border:1px solid #d9e2e9;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(22,50,79,.08);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr><td style="height:7px;background:#2d74b8;font-size:0;line-height:0;">&nbsp;</td></tr>
                  <tr>
                    <td class="email-pad" style="padding:42px 48px 18px;">
                      <p style="margin:0 0 16px;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;color:#2d74b8;">${isInitial ? "Your requested guide" : "A practical prompt"}</p>
                      <h1 class="email-heading" style="margin:0;color:#16324f;font-size:40px;line-height:1.08;font-weight:700;letter-spacing:-.8px;">${escapeHtml(report.title)}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-pad email-copy" style="padding:0 48px;color:#33485a;font-size:16px;line-height:26px;">
                      <p style="margin:0 0 18px;">${greeting}</p>
                      <p style="margin:0 0 24px;">${intro}</p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                        <tr>
                          <td bgcolor="#2d74b8" style="border-radius:8px;background:#2d74b8;">
                            <a class="email-button" href="${escapeHtml(link, 4096)}" style="display:inline-block;padding:15px 22px;border:1px solid #2d74b8;border-radius:8px;color:#ffffff;font-size:15px;line-height:20px;font-weight:bold;text-decoration:none;">Open the PDF field guide&nbsp; <span aria-hidden="true">→</span></a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-pad" style="padding:0 48px 12px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-note" style="background:#f1f6fa;border:1px solid #d7e4ed;border-radius:10px;">
                        <tr><td style="padding:16px 18px;color:#40566a;font-size:13px;line-height:20px;"><strong style="color:#16324f;">Private link</strong><br>This link expires in ${SAS_HOURS} hours and is intended for the person who requested the guide. Please do not submit sensitive, classified, patient, credential, or regulated information through the public form.</td></tr>
                      </table>
                    </td>
                  </tr>
                  ${isInitial ? `<tr><td class="email-pad email-muted" style="padding:14px 48px 28px;color:#647587;font-size:13px;line-height:21px;">You may receive a few report-specific follow-ups with a worksheet prompt or practical next step. No unrelated outreach.</td></tr>` : `<tr><td class="email-pad" style="height:16px;padding:0 48px 28px;font-size:0;line-height:0;">&nbsp;</td></tr>`}
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-footer" style="padding:22px 8px 0;color:#647587;font-size:12px;line-height:19px;">
                <p style="margin:0 0 8px;"><strong style="color:#16324f;">Global Enterprise</strong><br>Making complex decisions clearer, more durable, and easier to move.</p>
                <p style="margin:0 0 8px;"><a href="https://globalenterprise.com/contact/" style="color:#2d74b8;text-decoration:underline;">Request a principal dialogue</a> · <a href="mailto:info@globalenterprise.com" style="color:#2d74b8;text-decoration:underline;">info@globalenterprise.com</a> · <a href="tel:+19292292918" style="color:#2d74b8;text-decoration:underline;">+1 929 229 2918</a></p>
                <p style="margin:0;"><a href="${escapeHtml(unsubscribeUrl, 2048)}" style="color:#2d74b8;text-decoration:underline;">Stop these follow-ups</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  return { html, plainIntro };
}

async function sendEmail({ to, name, report, link, stage = 0, unsubscribeUrl }) {
  if (!emailClient || !ACS_SENDER_ADDRESS) throw new Error("email_not_configured");
  const isInitial = stage === 0;
  const subject = isInitial ? report.subject : `${report.title}: one practical next step`;
  const { html, plainIntro } = renderEmail({ name, report, link, stage, unsubscribeUrl });
  const poller = await emailClient.beginSend({
    senderAddress: ACS_SENDER_ADDRESS,
    replyTo: [{ address: REPLY_TO }],
    content: { subject, plainText: `${plainIntro}\n\nStop these follow-ups: ${unsubscribeUrl}`, html },
    recipients: { to: [{ address: to, displayName: name || undefined }] },
  });
  const result = await withTimeout(poller.pollUntilDone(), EXTERNAL_TIMEOUT_MS, "email_send_timeout");
  if (result.status !== "Succeeded") throw new Error(`email_send_${result.status || "failed"}`);
  return result.id || null;
}

async function nurtureWebhookConfig() {
  const endpoint = process.env.NURTURE_WEBHOOK_URL;
  if (!endpoint) return null;
  const secret = await secretValue(NURTURE_WEBHOOK_SECRET_NAME, "NURTURE_WEBHOOK_SECRET");
  if (!secret) throw new Error("nurture_bridge_not_configured");
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("nurture_bridge_invalid_url");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("nurture_bridge_invalid_url");
  return { endpoint: url.toString(), secret };
}

function buildNurturePayload(record) {
  return {
    id: record.id,
    createdAt: record.createdAt,
    email: record.email,
    name: record.name,
    organization: record.organization,
    context: record.context,
    qualification: record.qualification,
    report: record.report,
    reportSlug: record.reportSlug,
    formKind: record.formKind,
    sourceCampaign: record.sourceCampaign,
    sourceUrl: record.sourceUrl,
    consent: record.consent,
    delivery: {
      status: record.delivery?.status,
      sentAt: record.delivery?.sentAt || null,
    },
  };
}

function dataverseId(value) {
  // Dataverse record ids are GUID-shaped, but platform-generated ids do not
  // have to use RFC 4122 version/variant bits.
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value) ? value : "";
}

function odataString(value) {
  return `'${String(value ?? "").replace(/'/g, "''")}'`;
}

function dataverseConfigured() {
  return Boolean(DATAVERSE_URL && dataverseId(DATAVERSE_ACCOUNT_ID) && dataverseId(DATAVERSE_TEAM_ID));
}

async function dataverseRequest(path, options = {}) {
  if (!DATAVERSE_URL) throw new Error("dataverse_not_configured");
  const accessToken = await withTimeout(credential.getToken(`${DATAVERSE_URL}/.default`), EXTERNAL_TIMEOUT_MS, "dataverse_token_timeout");
  if (!accessToken?.token) throw new Error("dataverse_token_unavailable");
  const result = await fetch(`${DATAVERSE_URL}/api/data/v9.2/${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken.token}`,
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
  });
  if (!result.ok) throw new Error(`dataverse_${result.status}`);
  return result;
}

function splitName(value) {
  const parts = clean(value, 160).split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "Global Enterprise",
    lastName: parts.join(" ") || "Reader",
  };
}

async function findDataverseContact(email) {
  const params = new URLSearchParams({
    "$select": "contactid,fullname,emailaddress1,_parentcustomerid_value,_owningbusinessunit_value",
    "$filter": `emailaddress1 eq ${odataString(email)}`,
    "$top": "1",
  });
  const result = await dataverseRequest(`contacts?${params}`);
  return (await result.json()).value?.[0] || null;
}

async function upsertDataverseContact(record) {
  const existing = await findDataverseContact(record.email);
  const { firstName, lastName } = splitName(record.name);
  const fields = {
    firstname: firstName,
    lastname: lastName,
    emailaddress1: record.email,
    jobtitle: record.qualification?.role || undefined,
    "parentcustomerid_account@odata.bind": `accounts(${DATAVERSE_ACCOUNT_ID})`,
  };
  Object.keys(fields).forEach((key) => fields[key] === undefined && delete fields[key]);
  if (existing?.contactid) {
    await dataverseRequest(`contacts(${existing.contactid})`, { method: "PATCH", headers: { "If-Match": "*" }, body: JSON.stringify(fields) });
    return existing.contactid;
  }
  const result = await dataverseRequest("contacts", { method: "POST", body: JSON.stringify(fields) });
  const entityId = result.headers.get("odata-entityid") || "";
  const match = entityId.match(/contacts\(([^)]+)\)/i);
  if (!match) throw new Error("dataverse_contact_id_missing");
  return match[1];
}

function buildDataverseEngagement(record, initial) {
  const q = record.qualification || {};
  const fields = {
    ge_name: clean(`${record.report} · ${record.name || record.email}`, 200),
    ge_requestid: record.id,
    ge_reportkey: record.reportSlug,
    ge_reporttitle: record.report,
    ge_emailhash: hash(record.email),
    ge_organization: record.organization,
    ge_context: record.context,
    ge_role: q.role,
    ge_decisionstage: q.decisionStage,
    ge_decisionhorizon: q.decisionHorizon,
    ge_organizationsize: q.organizationSize,
    ge_industry: q.industry,
    ge_primarychallenge: q.primaryChallenge,
    ge_preferrednextstep: q.preferredNextStep,
    ge_sourceurl: record.sourceUrl,
    ge_sourcecampaign: record.sourceCampaign || record.formKind,
    ge_consentscope: record.consent?.scope || "report-specific-follow-up",
    ge_deliverystatus: record.delivery?.status || "pending",
  };
  if (initial) {
    fields.ge_nurturestage = 0;
    fields.ge_suppressionstatus = "active";
  }
  // Contact is the native relationship record attached to Account. The event
  // ledger intentionally avoids copying the raw email; the resolved Contact
  // can be joined by the deterministic email hash/request id in the bridge.
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined && value !== ""));
}

async function syncDataverse(record) {
  if (!dataverseConfigured()) return null;
  const contactId = await upsertDataverseContact(record);
  const params = new URLSearchParams({ "$select": "ge_briefengagementid,ge_nurturestage,ge_suppressionstatus", "$filter": `ge_requestid eq ${odataString(record.id)}`, "$top": "1" });
  const existingResult = await dataverseRequest(`${DATAVERSE_ENTITY_SET}?${params}`);
  const existing = (await existingResult.json()).value?.[0] || null;
  const body = buildDataverseEngagement(record, !existing);
  if (existing?.ge_briefengagementid) {
    await dataverseRequest(`${DATAVERSE_ENTITY_SET}(${existing.ge_briefengagementid})`, { method: "PATCH", headers: { "If-Match": "*" }, body: JSON.stringify(body) });
    return { contactId, engagementId: existing.ge_briefengagementid, created: false };
  }
  try {
    const result = await dataverseRequest(DATAVERSE_ENTITY_SET, { method: "POST", body: JSON.stringify(body) });
    const entityId = result.headers.get("odata-entityid") || "";
    const match = entityId.match(new RegExp(`${DATAVERSE_ENTITY_SET}\\(([^)]+)\\)`, "i"));
    return { contactId, engagementId: match?.[1] || null, created: true };
  } catch (error) {
    // The alternate key on ge_requestid makes retries idempotent. If another
    // invocation won the create race, update that row rather than duplicating it.
    if (String(error?.message || "").includes("dataverse_412")) {
      const retryResult = await dataverseRequest(`${DATAVERSE_ENTITY_SET}?${params}`);
      const retry = (await retryResult.json()).value?.[0];
      if (retry?.ge_briefengagementid) {
        await dataverseRequest(`${DATAVERSE_ENTITY_SET}(${retry.ge_briefengagementid})`, { method: "PATCH", headers: { "If-Match": "*" }, body: JSON.stringify(buildDataverseEngagement(record, false)) });
        return { contactId, engagementId: retry.ge_briefengagementid, created: false };
      }
    }
    throw error;
  }
}

async function updateDataverseEngagement(record, fields) {
  if (!dataverseConfigured()) return null;
  const params = new URLSearchParams({ "$select": "ge_briefengagementid", "$filter": `ge_requestid eq ${odataString(record.id)}`, "$top": "1" });
  let result = await dataverseRequest(`${DATAVERSE_ENTITY_SET}?${params}`);
  let existing = (await result.json()).value?.[0] || null;
  if (!existing?.ge_briefengagementid) {
    await syncDataverse(record);
    result = await dataverseRequest(`${DATAVERSE_ENTITY_SET}?${params}`);
    existing = (await result.json()).value?.[0] || null;
  }
  if (!existing?.ge_briefengagementid) throw new Error("dataverse_engagement_not_found");
  await dataverseRequest(`${DATAVERSE_ENTITY_SET}(${existing.ge_briefengagementid})`, { method: "PATCH", headers: { "If-Match": "*" }, body: JSON.stringify(fields) });
  return existing.ge_briefengagementid;
}

async function notifyNurtureBridge(record) {
  const dataverse = await syncDataverse(record);
  const config = await nurtureWebhookConfig();
  if (!config) return dataverse;
  const body = JSON.stringify({ eventType: "brief.requested", eventId: record.id, occurredAt: record.createdAt, record: buildNurturePayload(record) });
  const signature = sign(body, config.secret);
  const result = await fetch(config.endpoint, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", "x-globalenterprise-signature": signature },
    body,
    signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
  });
  if (!result.ok) throw new Error(`nurture_bridge_${result.status}`);
  return { dataverse, webhook: true };
}

async function briefRequest(request, context) {
  const headers = originHeaders(request);
  if (request.method === "OPTIONS") return response(204, "", headers);
  if (request.method !== "POST") return response(405, "Method not allowed", headers);
  if (rejectOrigin(request)) return response(403, "Origin not allowed", headers);
  if (!container || !blobService) return response(503, "Brief delivery is not configured", headers);

  const parsedBody = await parseBody(request);
  if (parsedBody.error) return response(parsedBody.error === "body_too_large" ? 413 : 400, "Please submit a valid form.", headers);
  const body = parsedBody.data;
  if (clean(body._honey, 50)) return response(400, "Unable to process this request", headers);
  const email = clean(body.email, 320).toLowerCase();
  const report = reports[clean(body.report || body.resource, 80)];
  const formKind = clean(body.form_kind || body["form-kind"], 80);
  const name = clean(body.name, 160);
  const organization = clean(body.organization, 200);
  const contextValue = clean(body.context || body.use_case, 200);
  const role = clean(body.role, 120);
  const decisionStage = clean(body.decision_stage, 120);
  const decisionHorizon = clean(body.decision_horizon, 120);
  const organizationSize = clean(body.organization_size, 80);
  const industry = clean(body.industry, 120);
  const primaryChallenge = clean(body.primary_challenge, 300);
  const preferredNextStep = clean(body.preferred_next_step, 120);
  const sourceCampaign = clean(body.source_campaign || body.utm_campaign, 160);
  const signalOptIn = clean(body.signal_opt_in, 20).toLowerCase() === "yes";
  const consent = clean(body.consent, 20).toLowerCase();
  const remoteIp = clientIp(request);

  if (!report || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || consent !== "yes") return response(400, "Please provide a valid email, resource, and consent.", headers);
  try {
    await tokenKey();
  } catch (error) {
    context.error("Secret store unavailable", { error: safeErrorCode(error) });
    return response(503, "Brief delivery is not configured", headers);
  }
  if (!(await verifyTurnstile(clean(body["cf-turnstile-response"], 4096), remoteIp))) return response(400, "Please complete the verification challenge.", headers);
  try {
    if (!(await enforceRateLimit(`ip:${remoteIp || "unknown"}`)) || !(await enforceRateLimit(`email:${email}`))) return response(429, "Please try again later.", headers);
  } catch (error) {
    context.error("Rate limit unavailable", { error: safeErrorCode(error) });
    return response(error?.message === "rate_limit_lock_busy" ? 429 : 503, "Please try again later.", headers);
  }

  const id = crypto.randomUUID();
  const unsubscribeToken = crypto.randomBytes(24).toString("base64url");
  const unsubscribeHash = hash(unsubscribeToken);
  const leadPath = `leads/${new Date().toISOString().slice(0, 7)}/${id}.json`;
  const unsubscribePath = `unsub/${unsubscribeHash}.json`;
  const now = new Date();
  const record = {
    id,
    createdAt: now.toISOString(),
    email,
    name,
    organization,
    context: contextValue,
    report: report.title,
    reportSlug: Object.keys(reports).find((slug) => reports[slug] === report),
    formKind,
    sourceCampaign,
    sourceUrl: sanitizeSourceUrl(body.source_url || request.headers.get("referer")),
    qualification: {
      role,
      decisionStage,
      decisionHorizon,
      organizationSize,
      industry,
      primaryChallenge,
      preferredNextStep,
    },
    communicationPreferences: { occasionalNotes: signalOptIn },
    consent: { value: true, capturedAt: now.toISOString(), scope: "report-specific-follow-up" },
    delivery: { status: "pending", expiresAt: new Date(Date.now() + SAS_HOURS * 60 * 60 * 1000).toISOString() },
    nurture: {
      status: "active",
      nextStage: 1,
      stages: report.followUps.map((_, index) => ({ stage: index + 1, dueAt: new Date(Date.now() + [3, 10, 21][index] * DAY_MS).toISOString(), sentAt: null })),
    },
    unsubscribeTokenCiphertext: await encryptToken(unsubscribeToken),
  };

  await writeJson(leadPath, record);
  await writeJson(unsubscribePath, { leadPath });
  try {
    const link = await signedPdfUrl(report);
    const unsubscribeUrl = `${API_URL}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
    const messageId = await sendEmail({ to: email, name, report, link, unsubscribeUrl });
    record.delivery = { status: "sent", sentAt: new Date().toISOString(), messageId, expiresAt: new Date(Date.now() + SAS_HOURS * 60 * 60 * 1000).toISOString() };
    await writeJson(leadPath, record);
  } catch (error) {
    context.error("Brief delivery failed", { id, error: safeErrorCode(error) });
    record.delivery = { status: "failed", failedAt: new Date().toISOString(), reason: "provider_unavailable" };
    await writeJson(leadPath, record);
    return response(503, "We received the request but could not send the email yet. Please try again shortly.", headers);
  }

  // The email is already delivered at this point. A CRM bridge outage must
  // not make the visitor resubmit and receive duplicate PDFs.
  try {
    await notifyNurtureBridge(record);
  } catch (error) {
    context.error("Nurture bridge failed", { id, error: safeErrorCode(error) });
  }

  const next = report.next.startsWith("http") ? report.next : `${SITE_URL}/${report.next}`;
  return response(303, "", { ...headers, Location: next });
}

async function unsubscribe(request, context) {
  const headers = originHeaders(request);
  if (request.method === "OPTIONS") return response(204, "", headers);
  if (!container) return response(503, "Unsubscribe is not configured", headers);
  let token = clean(new URL(request.url).searchParams.get("token"), 200);
  if (request.method === "POST" && !token) {
    const parsedBody = await parseBody(request);
    if (parsedBody.error) return response(400, "Invalid unsubscribe request", headers);
    token = clean(parsedBody.data.token, 200);
  }
  if (!token) return response(400, "Missing unsubscribe token");
  const pointerPath = `unsub/${hash(token)}.json`;
  const pointer = await readJson(pointerPath);
  if (!pointer?.leadPath) return response(404, "This unsubscribe link is no longer available");
  if (request.method === "GET") {
    const action = `${API_URL}/api/unsubscribe`;
    return response(200, `<main style="font:16px system-ui;max-width:42rem;margin:4rem auto;padding:0 1rem"><h1>Stop report follow-ups?</h1><p>Confirm once and we will stop the follow-ups for this field guide.</p><form method="post" action="${escapeHtml(action)}"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit" style="padding:.75rem 1rem">Stop follow-ups</button></form></main>`, { "content-type": "text/html; charset=utf-8", ...headers });
  }
  if (request.method !== "POST") return response(405, "Method not allowed", headers);
  const leadBlob = container.getBlockBlobClient(pointer.leadPath);
  const updated = await withExistingBlobLease(leadBlob, async (leaseId) => {
    const record = await readJson(pointer.leadPath);
    if (record) {
      record.nurture = { ...record.nurture, status: "opted_out", optedOutAt: new Date().toISOString() };
      await writeJson(pointer.leadPath, record, { leaseId });
    }
    return true;
  });
  if (updated === null) return response(409, "Please try again.", headers);
  try {
    const record = await readJson(pointer.leadPath);
    if (record) await updateDataverseEngagement(record, { ge_suppressionstatus: "opted-out" });
  } catch (error) {
    context?.error?.("Dataverse suppression update failed", { error: safeErrorCode(error) });
  }
  return response(200, "<main style=\"font:16px system-ui;max-width:42rem;margin:4rem auto;padding:0 1rem\"><h1>You are unsubscribed.</h1><p>No further report-specific follow-ups will be sent for this request.</p></main>", { "content-type": "text/html; charset=utf-8", ...headers });
}

async function health() {
  let hasSecret = false;
  try {
    hasSecret = Boolean(await tokenKey());
  } catch {
    hasSecret = false;
  }
  return response(200, JSON.stringify({
    ok: true,
    service: "globalenterprise-brief-delivery",
    configured: Boolean(container && emailClient && ACS_SENDER_ADDRESS && hasSecret && dataverseConfigured()),
    dataverse: dataverseConfigured(),
  }), { "content-type": "application/json" });
}

async function nurtureSweep(context) {
  if (!container || !emailClient || !ACS_SENDER_ADDRESS) return;
  const now = Date.now();
  for await (const item of container.listBlobsFlat({ prefix: "leads/" })) {
    if (!item.name.endsWith(".json")) continue;
    const leadBlob = container.getBlockBlobClient(item.name);
    await withExistingBlobLease(leadBlob, async (leaseId) => {
      const record = await readJson(item.name);
      if (!record || record.nurture?.status !== "active" || record.delivery?.status !== "sent") return;
      if (!record.nurture.nextStage || record.nurture.nextStage > record.nurture.stages.length) return;
      const stage = record.nurture.stages.find((candidate) => candidate.stage === record.nurture.nextStage);
      if (!stage || stage.sentAt || Date.parse(stage.dueAt) > now) return;
      const report = reports[record.reportSlug];
      if (!report) return;
      try {
        const link = await signedPdfUrl(report);
        const unsubscribeUrl = `${API_URL}/api/unsubscribe?token=${encodeURIComponent(await getUnsubscribeToken(record))}`;
        await sendEmail({ to: record.email, name: record.name, report, link, stage: stage.stage, unsubscribeUrl });
        stage.sentAt = new Date().toISOString();
        record.nurture.nextStage += 1;
        if (record.nurture.nextStage > record.nurture.stages.length) record.nurture.status = "complete";
        await writeJson(item.name, record, { leaseId });
        try {
          await updateDataverseEngagement(record, { ge_nurturestage: stage.stage });
        } catch (bridgeError) {
          context.error("Dataverse nurture update failed", { id: record.id, stage: stage.stage, error: safeErrorCode(bridgeError) });
        }
      } catch (error) {
        context.error("Nurture stage failed", { id: record.id, stage: stage.stage, error: safeErrorCode(error) });
      }
    });
  }
}

app.http("briefRequest", { methods: ["POST", "OPTIONS"], authLevel: "anonymous", route: "brief-request", handler: briefRequest });
app.http("unsubscribe", { methods: ["GET", "POST", "OPTIONS"], authLevel: "anonymous", route: "unsubscribe", handler: unsubscribe });
app.http("health", { methods: ["GET"], authLevel: "anonymous", route: "health", handler: health });
app.timer("nurtureSweep", { schedule: "0 0 * * *", handler: nurtureSweep, runOnStartup: false, useMonitor: true });

export { briefRequest, health, nurtureSweep, renderEmail, unsubscribe };
