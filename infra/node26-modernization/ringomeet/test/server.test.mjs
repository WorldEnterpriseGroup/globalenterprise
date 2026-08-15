import assert from "node:assert/strict";
import { once } from "node:events";
import http from "node:http";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { createApp } from "../server.mjs";

let server;
let baseUrl;

test.before(async () => {
  const app = createApp({
    config: {
      endpoint: "https://example.communication.azure.com",
      connectionString: "Endpoint=https://example.communication.azure.com/;accesskey=redacted",
      adminUserId: "8:acs-test-user",
      allowedOrigins: new Set(["https://globalenterprise.com"]),
      port: 0,
      rateLimitPerMinute: 30
    },
    buildDir: fileURLToPath(new URL("../build/", import.meta.url))
  });
  server = http.createServer(app).listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test("health and readiness are available on Node 26", async () => {
  const health = await fetch(`${baseUrl}/healthz`);
  assert.equal(health.status, 200);
  assert.match((await health.json()).runtime, /^v26\./);
  const ready = await fetch(`${baseUrl}/readyz`);
  assert.equal(ready.status, 200);
});

test("unsupported ACS scopes fail before a service call", async () => {
  const response = await fetch(`${baseUrl}/token?scope=identity`, { headers: { origin: "https://globalenterprise.com" } });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /chat and voip/);
});

test("the recovered browser bundle is served", async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /root/);
});
