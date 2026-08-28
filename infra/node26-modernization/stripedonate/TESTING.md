# Stripe Donate test-mode coverage

This service has two safe test lanes:

1. `npm test` runs offline HTTP contract tests with an injected fake Stripe client. It never contacts Stripe and never creates a PaymentIntent.
2. `npm run test:browser` starts the real Node HTTP server and uses a local Chrome browser to submit a browser-origin `fetch` request. It verifies CORS, health, and a safe validation error. It does not require a Stripe key.
3. `npm run test:stripe:e2e` runs the official Stripe test-mode flow only when a test key or explicitly test-mode endpoint is supplied. It creates a $1.00 USD test PaymentIntent with Stripe’s `pm_card_visa` test PaymentMethod and retries it with the same idempotency key. It cannot run against live mode.

## Offline and browser checks

```bash
npm test
npm run test:browser
```

The browser lane uses `google-chrome` by default. Set `BROWSER_BIN` to another Chromium executable when needed. The local browser fixture is served from a separate origin, so the request crosses the same CORS boundary as the production flow.

Coverage includes:

- health and readiness behavior;
- required-field, malformed JSON, amount, email, identifier, and idempotency-key validation;
- approved and rejected CORS preflight requests;
- browser-readable error responses;
- 64 KiB request-size rejection;
- Stripe card-error mapping to `402` and sanitized upstream failures;
- forwarding of `Idempotency-Key` to Stripe’s official Node SDK;
- requiring `Idempotency-Key` for every payment or subscription mutation after request validation;
- bounded Stripe SDK retries (`maxNetworkRetries: 2`, timeout 10 seconds);
- `requires_action`, `processing`, `succeeded`, failed, and canceled PaymentIntent semantics;
- sanitized subscription responses and the absence of an unsigned webhook endpoint;
- browser/API interaction without a payment attempt.

## Stripe test-mode E2E

For a local service with a Stripe test secret:

```bash
STRIPE_TEST_SECRET_KEY=sk_test_... npm run test:stripe:e2e
```

The script copies that value into the local process only, sets `REQUIRE_STRIPE_TEST_MODE=true`, verifies `/readyz` reports `stripe_mode=test`, and then sends the official test PaymentMethod `pm_card_visa`. The key is never printed. The script rejects any value that does not start with `sk_test_`.

For a deployed test-only revision:

```bash
STRIPEDONATE_TEST_ENDPOINT=https://test-host.example/api/StripeHttpTrigger \
STRIPEDONATE_TEST_ORIGIN=https://globalenterprise.com \
npm run test:stripe:e2e
```

The endpoint must return `200` from `/readyz` with `{"stripe_mode":"test"}`. A live-mode or unknown-mode endpoint is refused before any payment request. Keep the test revision and its Stripe secret isolated from production; do not point this command at a production hostname unless the readiness response is explicitly test mode.

The repeated request is an application-level retry simulation. The same request body and `Idempotency-Key` are sent twice; Stripe should return the original test result rather than create a second PaymentIntent. The service also configures Stripe’s official Node SDK with two bounded network retries for transient transport failures.

Every payment mutation must carry an `Idempotency-Key`. The server validates the payload first, then rejects a valid mutation without that header before contacting Stripe. Use one stable key for one logical operation and reuse it for a retry; never reuse a key for a different amount, customer, payment method, or subscription.

The API does not currently implement a Stripe webhook receiver or a fulfillment ledger. The synchronous response reports the PaymentIntent state only: `succeeded` is a successful Stripe state, `requires_action` returns the publishable client secret needed for customer authentication, `processing` returns `202`, and failed/canceled/incomplete states return `402`. Do not treat a browser response as final accounting or fulfillment evidence. A future webhook must verify the raw body with Stripe’s signing secret before adding side effects.

## What this does not test

- It does not use live keys, live cards, or live charges.
- It does not bypass 3DS or other customer authentication. A test that requires `requires_action` must be completed through a real Stripe.js client flow before adding a separate test case.
- It does not test subscription creation by default because that requires test-mode customer and price fixtures. Invalid subscription payloads are covered offline.
- It does not treat a successful HTTP response as proof of live settlement; test-mode PaymentIntents remain test data.

Never paste a Stripe secret into source, a command committed to shell history, a screenshot, or test output. Use a secret manager or an ephemeral environment variable supplied by the test runner.
