#!/usr/bin/env node

/*
 * Official Stripe test-mode E2E.
 *
 * This script refuses to run a payment flow unless the local secret is sk_test_*
 * or the target readiness endpoint explicitly reports stripe_mode=test. It never
 * accepts, sends, or falls back to a live-mode key.
 *
 * Local:
 *   STRIPE_TEST_SECRET_KEY=sk_test_... npm run test:stripe:e2e
 * Remote/container:
 *   STRIPEDONATE_TEST_ENDPOINT=https://.../api/StripeHttpTrigger npm run test:stripe:e2e
 */

import assert from "node:assert/strict";
import { once } from "node:events";

import { MAX_BODY_BYTES, createServer } from "../server.mjs";

const endpoint = process.env.STRIPEDONATE_TEST_ENDPOINT;
const testSecret = process.env.STRIPE_TEST_SECRET_KEY;
const testOrigin = process.env.STRIPEDONATE_TEST_ORIGIN || "https://globalenterprise.com";
const timeoutMs = 20_000;

if (testSecret && !testSecret.startsWith("sk_test_")) {
  throw new Error("Refusing to run: STRIPE_TEST_SECRET_KEY must start with sk_test_.");
}
if (!endpoint && !testSecret) {
  console.log("SKIP Stripe test-mode E2E: set STRIPE_TEST_SECRET_KEY=sk_test_... or STRIPEDONATE_TEST_ENDPOINT=...");
  process.exit(0);
}

let localServer;
let apiUrl = endpoint;

if (!apiUrl) {
  process.env.STRIPE_SECRET_KEY = testSecret;
  process.env.REQUIRE_STRIPE_TEST_MODE = "true";
  localServer = createServer({ allowedOrigins: new Set([testOrigin]) }).listen(0, "127.0.0.1");
  await once(localServer, "listening");
  apiUrl = `http://127.0.0.1:${localServer.address().port}/api/StripeHttpTrigger`;
}

const api = new URL(apiUrl);
const root = `${api.origin}`;

async function request(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect: "manual", ...init, signal: controller.signal });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { /* text-only error response */ }
    return { response, text, body };
  } finally {
    clearTimeout(timer);
  }
}

function check(name, condition, detail) {
  assert.ok(condition, `${name}: ${detail}`);
  console.log(`PASS ${name}`);
}

try {
  const health = await request(`${root}/healthz`);
  check("health", health.response.status === 200, `expected 200, got ${health.response.status}`);
  check("health identity", health.body?.service === "stripedonate", "unexpected service identity");

  const ready = await request(`${root}/readyz`);
  check("readiness", ready.response.status === 200, `expected 200, got ${ready.response.status}`);
  check("test-mode gate", ready.body?.stripe_mode === "test", "target did not explicitly report Stripe test mode");

  const preflight = await request(apiUrl, {
    method: "OPTIONS",
    headers: {
      origin: testOrigin,
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type, idempotency-key",
    },
  });
  check("allowed CORS preflight", preflight.response.status === 204, `expected 204, got ${preflight.response.status}`);
  check("CORS origin", preflight.response.headers.get("access-control-allow-origin") === testOrigin, "approved origin was not echoed");
  check("CORS idempotency header", /Idempotency-Key/i.test(preflight.response.headers.get("access-control-allow-headers") || ""), "Idempotency-Key was not allowed");

  const deniedPreflight = await request(apiUrl, { method: "OPTIONS", headers: { origin: "https://not-allowed.example" } });
  check("denied CORS preflight", deniedPreflight.response.status === 403, `expected 403, got ${deniedPreflight.response.status}`);

  const malformed = await request(apiUrl, { method: "POST", body: "not-json" });
  check("malformed JSON", malformed.response.status === 400, `expected 400, got ${malformed.response.status}`);

  const empty = await request(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json", origin: testOrigin },
    body: "{}",
  });
  check("required payment fields", empty.response.status === 400, `expected 400, got ${empty.response.status}`);
  check("validation error shape", /payment_method_id or payment_intent_id/.test(empty.body?.error || ""), "missing validation message");
  check("browser-readable validation CORS", empty.response.headers.get("access-control-allow-origin") === testOrigin, "validation response was not CORS-readable");

  const invalidAmount = await request(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 0 }),
  });
  check("amount validation", invalidAmount.response.status === 400, `expected 400, got ${invalidAmount.response.status}`);

  const tooLarge = await request(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(MAX_BODY_BYTES + 1) },
    body: "x".repeat(MAX_BODY_BYTES + 1),
  });
  check("request-size limit", tooLarge.response.status === 413, `expected 413, got ${tooLarge.response.status}`);

  const idempotencyKey = `stripe-test-e2e-${Date.now()}`;
  const payment = {
    payment_method_id: "pm_card_visa",
    totalamount: 100,
    email: "stripe-test@example.com",
  };
  const paymentHeaders = { "content-type": "application/json", origin: testOrigin, "idempotency-key": idempotencyKey };
  const first = await request(apiUrl, { method: "POST", headers: paymentHeaders, body: JSON.stringify(payment) });
  check("test PaymentIntent", first.response.status === 200, `expected 200, got ${first.response.status}; ${first.text.slice(0, 160)}`);
  check("test PaymentIntent result", first.body?.success === true, "test PaymentIntent did not succeed");

  const retry = await request(apiUrl, { method: "POST", headers: paymentHeaders, body: JSON.stringify(payment) });
  check("idempotent application retry", retry.response.status === 200, `expected 200, got ${retry.response.status}`);
  check("idempotent retry result", retry.body?.success === true, "retry did not return the same successful result");
  console.log("PASS Stripe official test-mode flow: pm_card_visa, no live charge possible");
} finally {
  if (localServer) await new Promise((resolve) => localServer.close(resolve));
}
