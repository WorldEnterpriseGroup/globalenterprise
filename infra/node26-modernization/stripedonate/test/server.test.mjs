import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import { MAX_BODY_BYTES, STRIPE_CLIENT_OPTIONS, createServer } from "../server.mjs";

let server;
let baseUrl;

async function startServer(options = {}) {
  const instance = createServer(options).listen(0, "127.0.0.1");
  await once(instance, "listening");
  return { instance, url: `http://127.0.0.1:${instance.address().port}` };
}

async function jsonRequest(url, init = {}) {
  const response = await fetch(url, init);
  return { response, body: await response.json() };
}

function fakeStripe({ paymentIntent = { id: "pi_test_succeeded", status: "succeeded" }, paymentError, subscription = { id: "sub_test", status: "active" }, capture = {} } = {}) {
  return {
    paymentIntents: {
      async create(params, options) {
        capture.create = { params, options };
        if (paymentError) throw paymentError;
        return paymentIntent;
      },
      async confirm(id, params, options) {
        capture.confirm = { id, params, options };
        if (paymentError) throw paymentError;
        return paymentIntent;
      },
    },
    subscriptions: {
      async create(params, options) {
        capture.subscription = { params, options };
        return subscription;
      },
    },
  };
}

test.before(async () => {
  ({ instance: server, url: baseUrl } = await startServer());
});

test.after(() => server.close());

test("health exposes the running service identity without requiring Stripe", async () => {
  const response = await fetch(`${baseUrl}/healthz`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.service, "stripedonate");
  assert.equal(body.runtime, process.version);
});

test("readiness fails closed without a Stripe secret and reports unknown mode", async () => {
  const { response, body } = await jsonRequest(`${baseUrl}/readyz`);
  assert.equal(response.status, 503);
  assert.equal(body.status, "not-ready");
  assert.equal(body.stripe_mode, "unknown");
});

test("malformed and empty donation requests fail closed", async () => {
  const malformed = await fetch(`${baseUrl}/api/StripeHttpTrigger`, { method: "POST", body: "nope" });
  assert.equal(malformed.status, 400);
  const empty = await jsonRequest(`${baseUrl}/api/StripeHttpTrigger`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  assert.equal(empty.response.status, 400);
  assert.match(empty.body.error, /payment_method_id or payment_intent_id/);
});

test("payment input validation happens before Stripe is contacted", async () => {
  const capture = {};
  const { instance, url } = await startServer({ stripeClient: fakeStripe({ capture }) });
  try {
    const invalidAmount = await jsonRequest(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 0 }),
    });
    assert.equal(invalidAmount.response.status, 400);
    assert.equal(capture.create, undefined);

    const invalidEmail = await jsonRequest(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 100, email: "not-an-email" }),
    });
    assert.equal(invalidEmail.response.status, 400);
    assert.equal(capture.create, undefined);
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("allowed CORS preflight advertises idempotency and echoes the approved origin", async () => {
  const { instance, url } = await startServer({ allowedOrigins: new Set(["https://donate.example.test"]) });
  try {
    const response = await fetch(`${url}/api/StripeHttpTrigger`, {
      method: "OPTIONS",
      headers: {
        origin: "https://donate.example.test",
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type, idempotency-key",
      },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://donate.example.test");
    assert.match(response.headers.get("access-control-allow-headers"), /Idempotency-Key/);
    assert.equal(response.headers.get("access-control-allow-methods"), "POST, OPTIONS");
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("disallowed CORS preflight is rejected without an allow-origin header", async () => {
  const { instance, url } = await startServer({ allowedOrigins: new Set(["https://donate.example.test"]) });
  try {
    const response = await fetch(`${url}/api/StripeHttpTrigger`, { method: "OPTIONS", headers: { origin: "https://evil.example.test" } });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("approved-origin API errors remain readable to the browser", async () => {
  const { instance, url } = await startServer({ allowedOrigins: new Set(["https://donate.example.test"]) });
  try {
    const { response, body } = await jsonRequest(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { origin: "https://donate.example.test", "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://donate.example.test");
    assert.match(body.error, /payment_method_id or payment_intent_id/);
    assert.match(body.requestId, /^[0-9a-f-]{36}$/i);
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("oversized donation requests return 413 before Stripe is contacted", async () => {
  const response = await fetch(`${baseUrl}/api/StripeHttpTrigger`, {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": String(MAX_BODY_BYTES + 1) },
    body: "x".repeat(MAX_BODY_BYTES + 1),
  });
  assert.equal(response.status, 413);
});

test("idempotency key is forwarded to PaymentIntent creation", async () => {
  const capture = {};
  const { instance, url } = await startServer({ stripeClient: fakeStripe({ capture }) });
  try {
    const { response, body } = await jsonRequest(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "donation-test-001" },
      body: JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 100, email: "test@example.com" }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, { success: true, payment_intent_id: "pi_test_succeeded", status: "succeeded" });
    assert.deepEqual(capture.create.options, { idempotencyKey: "donation-test-001" });
    assert.equal(capture.create.params.amount, 100);
    assert.equal(capture.create.params.payment_method, "pm_card_visa");
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("payment mutations require an idempotency key after payload validation", async () => {
  const capture = {};
  const { instance, url } = await startServer({ stripeClient: fakeStripe({ capture }) });
  try {
    const { response, body } = await jsonRequest(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 100 }),
    });
    assert.equal(response.status, 400);
    assert.equal(body.error, "Idempotency-Key is required for payment mutations");
    assert.equal(capture.create, undefined);
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("PaymentIntent states preserve payment semantics and HTTP meaning", async () => {
  const action = await startServer({ stripeClient: fakeStripe({ paymentIntent: { id: "pi_test_action", status: "requires_action", client_secret: "pi_secret_test", next_action: { type: "use_stripe_sdk" } } }) });
  const processing = await startServer({ stripeClient: fakeStripe({ paymentIntent: { id: "pi_test_processing", status: "processing" } }) });
  const failed = await startServer({ stripeClient: fakeStripe({ paymentIntent: { id: "pi_test_failed", status: "requires_payment_method" } }) });
  const headers = { "content-type": "application/json", "idempotency-key": "state-test-001" };
  const payload = JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 100 });
  try {
    const actionResult = await jsonRequest(`${action.url}/api/StripeHttpTrigger`, { method: "POST", headers, body: payload });
    assert.equal(actionResult.response.status, 200);
    assert.deepEqual(actionResult.body, { requires_action: true, payment_intent_id: "pi_test_action", status: "requires_action", payment_intent_client_secret: "pi_secret_test" });

    const processingResult = await jsonRequest(`${processing.url}/api/StripeHttpTrigger`, { method: "POST", headers, body: payload });
    assert.equal(processingResult.response.status, 202);
    assert.deepEqual(processingResult.body, { processing: true, payment_intent_id: "pi_test_processing", status: "processing" });

    const failedResult = await jsonRequest(`${failed.url}/api/StripeHttpTrigger`, { method: "POST", headers, body: payload });
    assert.equal(failedResult.response.status, 402);
    assert.deepEqual(failedResult.body, { error: "payment_failed", payment_intent_id: "pi_test_failed", status: "requires_payment_method" });
  } finally {
    await Promise.all([action.instance, processing.instance, failed.instance].map((instance) => new Promise((resolve) => instance.close(resolve))));
  }
});

test("subscription responses are sanitized and idempotent", async () => {
  const capture = {};
  const { instance, url } = await startServer({ stripeClient: fakeStripe({ capture, subscription: { id: "sub_test_123", status: "active", customer: "cus_private", latest_invoice: "in_private" } }) });
  try {
    const { response, body } = await jsonRequest(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "subscription-test-001" },
      body: JSON.stringify({ subscription: true, customer: "cus_test_123", items: [{ price: "price_test_123", quantity: 1 }] }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(body, { success: true, subscription_id: "sub_test_123", status: "active" });
    assert.deepEqual(capture.subscription.options, { idempotencyKey: "subscription-test-001" });
    assert.deepEqual(capture.subscription.params, { customer: "cus_test_123", items: [{ price: "price_test_123", quantity: 1 }] });
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("oversized and malformed idempotency keys fail before Stripe is contacted", async () => {
  const capture = {};
  const { instance, url } = await startServer({ stripeClient: fakeStripe({ capture }) });
  try {
    const response = await fetch(`${url}/api/StripeHttpTrigger`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": "x".repeat(256) },
      body: JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 100 }),
    });
    assert.equal(response.status, 400);
    assert.equal(capture.create, undefined);
  } finally {
    await new Promise((resolve) => instance.close(resolve));
  }
});

test("Stripe card errors map to 402 and hide provider details for 5xx errors", async () => {
  const card = await startServer({ stripeClient: fakeStripe({ paymentError: { type: "StripeCardError", message: "test card declined" } }) });
  const outage = await startServer({ stripeClient: fakeStripe({ paymentError: new Error("private upstream detail") }) });
  try {
    const payload = JSON.stringify({ payment_method_id: "pm_card_visa", totalamount: 100 });
    const headers = { "content-type": "application/json", "idempotency-key": "error-test-001" };
    const cardResponse = await jsonRequest(`${card.url}/api/StripeHttpTrigger`, { method: "POST", headers, body: payload });
    assert.equal(cardResponse.response.status, 402);
    assert.equal(cardResponse.body.error, "test card declined");
    const outageResponse = await jsonRequest(`${outage.url}/api/StripeHttpTrigger`, { method: "POST", headers, body: payload });
    assert.equal(outageResponse.response.status, 500);
    assert.equal(outageResponse.body.error, "Payment service unavailable");
    assert.doesNotMatch(JSON.stringify(outageResponse.body), /private upstream detail/);
  } finally {
    await Promise.all([card.instance, outage.instance].map((instance) => new Promise((resolve) => instance.close(resolve))));
  }
});

test("Stripe client uses bounded official SDK retries", () => {
  assert.equal(STRIPE_CLIENT_OPTIONS.maxNetworkRetries, 2);
  assert.equal(STRIPE_CLIENT_OPTIONS.timeout, 10_000);
});

test("unknown routes do not expose the legacy function host", async () => {
  const response = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(response.status, 404);
  const webhook = await fetch(`${baseUrl}/webhook`, { method: "POST", body: "{}" });
  assert.equal(webhook.status, 404);
});

test("invalid client request IDs are replaced instead of reaching response headers", async () => {
  const response = await fetch(`${baseUrl}/api/unknown`, { headers: { "x-request-id": "bad request" } });
  assert.equal(response.status, 404);
  assert.match(response.headers.get("x-request-id"), /^[0-9a-f-]{36}$/i);
});
