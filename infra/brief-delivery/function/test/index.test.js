import test from "node:test";
import assert from "node:assert/strict";
import { briefRequest, health, renderEmail, unsubscribe } from "../src/index.js";

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

test("branded email template is responsive, escaped, and includes both delivery links", () => {
  const { html, plainIntro } = renderEmail({
    name: "A <reader>",
    report: {
      title: "Decision Readiness",
      followUps: ["Name the next decision owner."],
    },
    link: "https://briefs.example.com/file.pdf?sig=a&se=b",
    stage: 0,
    unsubscribeUrl: "https://briefs.example.com/api/unsubscribe?token=abc&x=y",
  });
  assert.match(html, /GLOBAL ENTERPRISE/);
  assert.match(html, /role="presentation"/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /Open the PDF field guide/);
  assert.match(html, /href="https:\/\/briefs\.example\.com\/file\.pdf\?sig=a&amp;se=b"/);
  assert.match(html, /A &lt;reader&gt;/);
  assert.match(html, /Stop these follow-ups/);
  assert.match(plainIntro, /https:\/\/briefs\.example\.com\/file\.pdf\?sig=a&se=b/);
});
