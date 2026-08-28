#!/usr/bin/env node

/*
 * Live acceptance test for the gated brief path.
 *
 * Required:
 *   BRIEF_API_URL=https://briefs.example.com/api/brief-request
 *   TEST_EMAIL=controlled-mailbox@example.com
 *
 * Optional values let the operator verify the links from the received email:
 *   TEST_DOWNLOAD_URL='https://...blob.core.windows.net/...?...'
 *   TEST_UNSUBSCRIBE_URL='https://briefs.example.com/api/unsubscribe?token=...'
 *   SITE_URL=https://globalenterprise.com
 *
 * The script never prints the submitted email or signed URLs. Treat signed
 * URLs as secrets and pass them only through the process environment.
 */

import assert from "node:assert/strict";

const apiUrl = process.env.BRIEF_API_URL;
const email = process.env.TEST_EMAIL;
const siteUrl = (process.env.SITE_URL || "https://globalenterprise.com").replace(/\/$/, "");
const report = process.env.TEST_REPORT || "enterprise-decision-readiness";
const downloadUrl = process.env.TEST_DOWNLOAD_URL;
const unsubscribeUrl = process.env.TEST_UNSUBSCRIBE_URL;

if (!apiUrl || !email) {
  console.error("Usage: BRIEF_API_URL=... TEST_EMAIL=... node scripts/e2e-brief-delivery.mjs");
  process.exit(2);
}

const briefEndpoint = new URL(apiUrl);
const endpointBase = briefEndpoint.origin;
const healthUrl = `${endpointBase}/api/health`;
const pdfUrl = `${siteUrl}/reports/${report}.pdf`;
const htmlUrl = `${siteUrl}/reports/${report}.html`;

async function request(url, init = {}) {
  const result = await fetch(url, { redirect: "manual", ...init });
  return { result, body: await result.text() };
}

function check(name, condition, detail) {
  assert.ok(condition, `${name}: ${detail}`);
  console.log(`PASS ${name}`);
}

const health = await request(healthUrl);
check("health endpoint", health.result.status === 200, `expected 200, got ${health.result.status}`);
check("health response", /globalenterprise-brief-delivery/.test(health.body), "unexpected service identity");
check("health provider configuration", /configured/.test(health.body), "provider is not configured");

const form = new URLSearchParams({
  report,
  form_kind: "e2e_acceptance",
  name: process.env.TEST_NAME || "Global Enterprise acceptance test",
  email,
  organization: process.env.TEST_ORGANIZATION || "Global Enterprise",
  use_case: process.env.TEST_USE_CASE || "Acceptance testing of gated field-guide delivery",
  role: process.env.TEST_ROLE || "Operations leadership",
  industry: process.env.TEST_INDUSTRY || "Professional services",
  organization_size: process.env.TEST_ORGANIZATION_SIZE || "51-250",
  decision_horizon: process.env.TEST_DECISION_HORIZON || "0-90 days",
  primary_challenge: process.env.TEST_PRIMARY_CHALLENGE || "Validate private delivery and follow-up controls",
  preferred_next_step: process.env.TEST_PREFERRED_NEXT_STEP || "Email the field guide",
  consent: "yes",
  source_url: `${siteUrl}/resources/${report}/`,
});

const submission = await request(apiUrl, {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    origin: new URL(siteUrl).origin,
  },
  body: form,
});
check("brief submission", submission.result.status === 303, `expected 303, got ${submission.result.status}`);
check("thank-you redirect", /^https:\/\//.test(submission.result.headers.get("location") || ""), "missing redirect location");
check("email delivery acknowledgement", !/could not send|provider unavailable/i.test(submission.body), "provider reported delivery failure");

const publicPdf = await request(pdfUrl);
check("public PDF is gated", publicPdf.result.status === 404, `expected 404, got ${publicPdf.result.status}`);

const publicHtml = await request(htmlUrl);
check("browser report remains available", publicHtml.result.status === 200, `expected 200, got ${publicHtml.result.status}`);

if (downloadUrl) {
  const download = await request(downloadUrl);
  check("private PDF link", download.result.status === 200, `expected 200, got ${download.result.status}`);
  check("private PDF content type", /^application\/pdf/i.test(download.result.headers.get("content-type") || ""), "not a PDF response");
  check("private PDF attachment disposition", /attachment/i.test(download.result.headers.get("content-disposition") || ""), "missing attachment disposition");
} else {
  console.log("SKIP private PDF link (set TEST_DOWNLOAD_URL from the controlled test mailbox)");
}

if (unsubscribeUrl) {
  const unsubscribe = await request(unsubscribeUrl);
  check("unsubscribe confirmation page", unsubscribe.result.status === 200, `expected 200, got ${unsubscribe.result.status}`);
  check("unsubscribe confirmation page", /stop follow-ups/i.test(unsubscribe.body), "missing confirmation form");
  const tokenMatch = unsubscribe.body.match(/name="token" value="([^"]+)"/i);
  check("unsubscribe confirmation token", Boolean(tokenMatch), "confirmation token was not rendered");
  const actionMatch = unsubscribe.body.match(/<form[^>]+action="([^"]+)"/i);
  const confirmationAction = actionMatch ? actionMatch[1] : unsubscribeUrl;
  const confirmed = await request(confirmationAction, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token: tokenMatch[1] }),
  });
  check("unsubscribe endpoint", confirmed.result.status === 200, `expected 200, got ${confirmed.result.status}`);
  check("unsubscribe confirmation", /unsubscribed/i.test(confirmed.body), "missing final confirmation");
} else {
  console.log("SKIP unsubscribe verification (set TEST_UNSUBSCRIBE_URL from the controlled test mailbox)");
}

console.log("E2E acceptance completed");
