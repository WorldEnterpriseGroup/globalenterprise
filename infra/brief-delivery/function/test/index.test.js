import test from "node:test";
import assert from "node:assert/strict";
import { briefRequest, health, unsubscribe } from "../src/index.js";

test("health response is safe before provider configuration", async () => {
  const result = await health();
  assert.equal(result.status, 200);
  assert.match(result.body, /globalenterprise-brief-delivery/);
  assert.match(result.body, /configured/);
});

test("brief request fails closed before provider configuration", async () => {
  const request = new Request("https://briefs.example.com/api/brief-request", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ report: "enterprise-decision-readiness", email: "test@example.com", consent: "yes" }),
  });
  const result = await briefRequest(request, { error() {} });
  assert.equal(result.status, 503);
  assert.match(result.body, /not configured/i);
});

test("unsubscribe fails closed before storage configuration", async () => {
  const request = new Request("https://briefs.example.com/api/unsubscribe?token=invalid");
  const result = await unsubscribe(request);
  assert.equal(result.status, 503);
  assert.match(result.body, /not configured/i);
});
