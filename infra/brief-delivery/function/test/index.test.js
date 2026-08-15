import test from "node:test";
import assert from "node:assert/strict";
import { briefRequest, contactRequest, health, isCorporateEmail, renderContactEmail, renderEmail, unsubscribe } from "../src/index.js";

test("corporate email policy rejects consumer mailboxes but allows custom company domains", () => {
  for (const email of ["reader@gmail.com", "reader@googlemail.com", "reader@hotmail.com", "reader@hotmail.co.uk", "reader@outlook.com", "reader@yahoo.com", "reader@yahoo.co.uk"]) {
    assert.equal(isCorporateEmail(email), false, email);
  }
  assert.equal(isCorporateEmail("reader@company.com"), true);
  assert.equal(isCorporateEmail("reader@company.onmicrosoft.com"), true);
});

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

test("contact request fails closed before provider configuration", async () => {
  const request = new Request("https://briefs.example.com/api/contact-request", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      name: "Test Reader",
      title: "Operations lead",
      email: "test@example.com",
      organization: "Example Organization",
      conversation_context: "Enterprise transformation and change architecture",
      mandate: "We need to make a consequential operating decision legible to the teams carrying it.",
      consent: "yes",
    }),
  });
  const result = await contactRequest(request, { error() {} });
  assert.equal(result.status, 503);
  assert.match(result.body, /not configured/i);
});

test("contact email template is branded, escaped, and reply-ready", () => {
  const { html, plain } = renderContactEmail({
    name: "A <reader>",
    title: "COO",
    email: "reader@example.com",
    organization: "Example & Co",
    context: "Enterprise transformation",
    mandate: "Make the operating decision clear.\nThen move it.",
    sourceUrl: "https://globalenterprise.com/contact/",
  });
  assert.match(html, /GLOBAL ENTERPRISE|Global Enterprise/);
  assert.match(html, /A &lt;reader&gt;/);
  assert.match(html, /Example &amp; Co/);
  assert.match(html, /Make the operating decision clear\.<br>Then move it\./);
  assert.match(plain, /reader@example\.com/);
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
  assert.match(html, /Request a principal dialogue/);
  assert.match(html, /info@globalenterprise\.com/);
  assert.match(html, /tel:\+19292292918/);
  assert.match(html, /Stop these follow-ups/);
  assert.match(plainIntro, /https:\/\/briefs\.example\.com\/file\.pdf\?sig=a&se=b/);
});
