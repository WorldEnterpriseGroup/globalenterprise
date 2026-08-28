import crypto from "node:crypto";
import http from "node:http";

export const MAX_BODY_BYTES = 64 * 1024;
export const STRIPE_CLIENT_OPTIONS = Object.freeze({ maxNetworkRetries: 2, timeout: 10_000 });
const defaultAllowedOrigins = new Set(String(process.env.CORS_ORIGINS || "https://globalenterprise.com,https://www.globalenterprise.com").split(",").map((value) => value.trim()).filter(Boolean));

let stripeClient;
function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || process.env.StripeSecret || "";
}

function stripeMode(key = stripeSecretKey()) {
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return "unknown";
}

async function getStripe(injectedClient) {
  if (injectedClient) return injectedClient;
  if (!stripeClient) {
    const key = stripeSecretKey();
    if (!key) throw Object.assign(new Error("Stripe is not configured"), { statusCode: 503 });
    if (process.env.REQUIRE_STRIPE_TEST_MODE === "true" && stripeMode(key) !== "test") {
      throw Object.assign(new Error("Stripe test mode is required"), { statusCode: 503 });
    }
    return import("stripe").then(({ default: Stripe }) => {
      stripeClient = new Stripe(key, STRIPE_CLIENT_OPTIONS);
      return stripeClient;
    });
  }
  return Promise.resolve(stripeClient);
}

function requestId(request, response) {
  const candidate = String(request.headers["x-request-id"] || "").trim();
  const id = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(candidate) ? candidate : crypto.randomUUID();
  response.setHeader("X-Request-Id", id);
  return id;
}

function setHeaders(request, response, allowedOrigins) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  const origin = request.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
}

function sendJson(response, status, body) {
  const payload = JSON.stringify(body);
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", Buffer.byteLength(payload));
  response.end(payload);
}

async function readJson(request) {
  const declaredLength = Number(request.headers["content-length"] || 0);
  if (declaredLength > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large"), { statusCode: 413 });
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error("Request body is too large"), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("JSON object required");
    return value;
  } catch {
    throw Object.assign(new Error("Valid JSON is required"), { statusCode: 400 });
  }
}

function amountInCents(value) {
  const amount = typeof value === "string" && /^\d+$/.test(value.trim()) ? Number(value) : value;
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100_000_000) {
    throw Object.assign(new Error("totalamount must be an integer number of cents between 1 and 100000000"), { statusCode: 400 });
  }
  return amount;
}

function id(value, prefix) {
  const result = String(value || "").trim();
  if (!new RegExp(`^${prefix}_[A-Za-z0-9_]+$`).test(result)) {
    throw Object.assign(new Error(`Invalid ${prefix} identifier`), { statusCode: 400 });
  }
  return result;
}

function optionalEmail(value) {
  if (value == null || value === "") return undefined;
  const email = String(value).trim();
  if (email.length > 320 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw Object.assign(new Error("email must be a valid email address"), { statusCode: 400 });
  }
  return email;
}

function subscriptionPayload(body) {
  const customer = id(body.customer, "cus");
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
    throw Object.assign(new Error("items must contain one to twenty subscription items"), { statusCode: 400 });
  }
  const items = body.items.map((item) => {
    if (!item || typeof item !== "object") throw Object.assign(new Error("invalid subscription item"), { statusCode: 400 });
    const result = {};
    if (item.price) result.price = id(item.price, "price");
    if (item.plan) result.plan = id(item.plan, "plan");
    if (item.quantity != null && Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0) result.quantity = Number(item.quantity);
    if (!result.price && !result.plan) throw Object.assign(new Error("each subscription item needs a price or plan"), { statusCode: 400 });
    return result;
  });
  return { customer, items, ...(body.default_payment_method ? { default_payment_method: id(body.default_payment_method, "pm") } : {}) };
}

function stripeRequestOptions(idempotencyKey) {
  return idempotencyKey ? { idempotencyKey } : undefined;
}

function readIdempotencyKey(request) {
  const value = String(request.headers["idempotency-key"] || "");
  if (!value) return undefined;
  if (value.length > 255 || /[\r\n]/.test(value) || value.trim() !== value) {
    throw Object.assign(new Error("Idempotency-Key must be 255 characters or fewer with no surrounding whitespace"), { statusCode: 400 });
  }
  return value;
}

function requireIdempotencyKey(idempotencyKey) {
  if (!idempotencyKey) {
    throw Object.assign(new Error("Idempotency-Key is required for payment mutations"), { statusCode: 400 });
  }
  return idempotencyKey;
}

async function createPayment(body, injectedClient, idempotencyKey) {
  if (body.payment_method_id) {
    const paymentMethod = id(body.payment_method_id, "pm");
    const amount = amountInCents(body.totalamount);
    const receiptEmail = optionalEmail(body.email);
    requireIdempotencyKey(idempotencyKey);
    const stripe = await getStripe(injectedClient);
    const params = {
      payment_method: paymentMethod,
      receipt_email: receiptEmail,
      amount,
      currency: "usd",
      confirmation_method: "manual",
      confirm: true
    };
    const options = stripeRequestOptions(idempotencyKey);
    const intent = options ? await stripe.paymentIntents.create(params, options) : await stripe.paymentIntents.create(params);
    return paymentResponse(intent);
  }
  if (body.payment_intent_id) {
    const paymentIntent = id(body.payment_intent_id, "pi");
    requireIdempotencyKey(idempotencyKey);
    const stripe = await getStripe(injectedClient);
    const options = stripeRequestOptions(idempotencyKey);
    const intent = options
      ? await stripe.paymentIntents.confirm(paymentIntent, {}, options)
      : await stripe.paymentIntents.confirm(paymentIntent);
    return paymentResponse(intent);
  }
  throw Object.assign(new Error("payment_method_id or payment_intent_id is required"), { statusCode: 400 });
}

function paymentResponse(intent) {
  const paymentIntentId = intent.id;
  const status = intent.status;
  if (intent.status === "requires_action" && intent.next_action?.type === "use_stripe_sdk") {
    return { requires_action: true, payment_intent_id: paymentIntentId, status, payment_intent_client_secret: intent.client_secret };
  }
  if (intent.status === "succeeded") return { success: true, payment_intent_id: paymentIntentId, status };
  if (intent.status === "processing") return { processing: true, payment_intent_id: paymentIntentId, status };
  if (intent.status === "requires_payment_method") return { error: "payment_failed", payment_intent_id: paymentIntentId, status };
  return { error: intent.status === "canceled" ? "payment_canceled" : "payment_incomplete", payment_intent_id: paymentIntentId, status };
}

function subscriptionResponse(subscription) {
  return { success: true, subscription_id: subscription.id, status: subscription.status || "unknown" };
}

function resultStatus(result) {
  if (result?.processing) return 202;
  if (result?.error === "payment_failed" || result?.error === "payment_canceled" || result?.error === "payment_incomplete") return 402;
  return 200;
}

async function handleDonation(body, injectedClient, idempotencyKey) {
  if (body.subscription) {
    const params = subscriptionPayload(body);
    requireIdempotencyKey(idempotencyKey);
    const stripe = await getStripe(injectedClient);
    const options = stripeRequestOptions(idempotencyKey);
    const subscription = options ? await stripe.subscriptions.create(params, options) : await stripe.subscriptions.create(params);
    return subscriptionResponse(subscription);
  }
  return createPayment(body, injectedClient, idempotencyKey);
}

function stripeStatus(error) {
  if (error?.statusCode === 503) return 503;
  if (Number.isInteger(error?.statusCode) && error.statusCode >= 400 && error.statusCode < 500) return error.statusCode;
  if (error?.type === "StripeCardError") return 402;
  if (error?.type === "StripeInvalidRequestError" || error?.statusCode === 400) return 400;
  return 500;
}

export function createServer({ allowedOrigins = defaultAllowedOrigins, stripeClient: injectedClient } = {}) {
  const originSet = allowedOrigins instanceof Set ? allowedOrigins : new Set(allowedOrigins);
  return http.createServer(async (request, response) => {
    const idForLog = requestId(request, response);
    setHeaders(request, response, originSet);
    if (request.method === "OPTIONS") {
      if (request.headers.origin && !originSet.has(request.headers.origin)) return sendJson(response, 403, { error: "Origin not allowed", requestId: idForLog });
      response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key, X-Request-Id");
      response.statusCode = 204;
      return response.end();
    }
    if (request.method === "GET" && request.url === "/healthz") return sendJson(response, 200, { status: "ok", service: "stripedonate", runtime: process.version });
    if (request.method === "GET" && request.url === "/readyz") {
      const mode = stripeMode();
      const ready = Boolean(stripeSecretKey());
      return sendJson(response, ready ? 200 : 503, { status: ready ? "ready" : "not-ready", service: "stripedonate", stripe_mode: mode });
    }
    if (request.method !== "POST" || !["/api/StripeHttpTrigger", "/StripeHttpTrigger"].includes(new URL(request.url, "http://localhost").pathname)) return sendJson(response, 404, { error: "Not found", requestId: idForLog });
    try {
      const body = await readJson(request);
      const idempotencyKey = readIdempotencyKey(request);
      const result = await handleDonation(body, injectedClient, idempotencyKey);
      return sendJson(response, resultStatus(result), result);
    } catch (error) {
      const status = stripeStatus(error);
      if (status >= 500) console.error(JSON.stringify({ requestId: idForLog, error: error.type || error.name || "Error", status }));
      return sendJson(response, status, { error: status >= 500 ? "Payment service unavailable" : error.message, requestId: idForLog });
    }
  });
}

export function start(port = Number.parseInt(process.env.PORT || "8080", 10)) {
  const server = createServer();
  server.listen(port, "0.0.0.0", () => console.log(`stripedonate listening on ${port}`));
  const close = () => server.close(() => process.exit(0));
  process.once("SIGTERM", close);
  process.once("SIGINT", close);
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) start();
