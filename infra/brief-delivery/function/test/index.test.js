import test from "node:test";
import assert from "node:assert/strict";
import { briefRequest, buildDataverseContactFields, buildDataverseEngagement, contactRequest, dataverseRetryState, displayFormValue, health, isCorporateEmail, parseContactTaxonomy, renderContactEmail, renderEmail, selectDataverseContact, syncContactDataverseRecord, unsubscribe } from "../src/index.js";

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

test("form values are stored as readable labels while legacy labels remain readable", () => {
  assert.equal(displayFormValue("federal_enterprise_architecture_feaf", "context"), "Federal enterprise architecture / FEAF");
  assert.equal(displayFormValue("professor_researcher", "reader_role"), "Professor, researcher, lab, or academic partner");
  assert.equal(displayFormValue("executive_leadership", "role"), "Executive leadership");
  assert.equal(displayFormValue("Next 90 days", "decision_horizon"), "Next 90 days");
  assert.equal(displayFormValue("unknown_value", "role"), "unknown_value");
  assert.equal(displayFormValue("__proto__", "role"), "__proto__");
});

test("principal-dialogue taxonomies accept canonical pairs and reject crossed or unknown values", () => {
  const taxonomy = parseContactTaxonomy({
    reader_role: "professor_researcher",
    conversation_context: "research_partnership_strategic_inquiry",
  });
  assert.deepEqual(taxonomy, {
    readerRole: "professor_researcher",
    readerRoleLabel: "Professor, researcher, lab, or academic partner",
    conversationContext: "research_partnership_strategic_inquiry",
    conversationContextLabel: "Research partnership or strategic inquiry",
  });
  assert.equal(parseContactTaxonomy({ reader_role: "unknown", conversation_context: "research_partnership_strategic_inquiry" }), null);
  assert.equal(parseContactTaxonomy({ reader_role: "research_partnership_strategic_inquiry", conversation_context: "professor_researcher" }), null);
});

test("Dataverse contact and engagement projections preserve title and routing fields", () => {
  const record = {
    id: "11111111-1111-4111-8111-111111111111",
    kind: "principal-dialogue",
    email: "reader@example.com",
    name: "A Reader",
    title: "Deputy Director",
    organization: "Example Organization",
    report: "Principal dialogue",
    reportSlug: "principal-dialogue",
    formKind: "principal-dialogue",
    context: "Research partnership or strategic inquiry",
    qualification: {
      readerRole: "professor_researcher",
      readerRoleLabel: "Professor, researcher, lab, or academic partner",
      conversationContext: "research_partnership_strategic_inquiry",
      conversationContextLabel: "Research partnership or strategic inquiry",
    },
    decisionHorizon: "Next 90 days",
    sourceUrl: "https://globalenterprise.com/contact/",
    consent: { scope: "principal-dialogue" },
    delivery: { status: "sent" },
  };
  const contact = buildDataverseContactFields(record);
  assert.equal(contact.jobtitle, "Deputy Director");
  const reportContact = buildDataverseContactFields({ ...record, kind: "brief", title: undefined, qualification: { role: "Executive leadership" } });
  assert.equal(reportContact.jobtitle, undefined);
  const engagement = buildDataverseEngagement(record, true, "22222222-2222-4222-8222-222222222222");
  assert.equal(engagement.ge_reportkey, "principal-dialogue");
  assert.equal(engagement.ge_role, "professor_researcher");
  assert.equal(engagement.ge_context, "research_partnership_strategic_inquiry");
  assert.equal(engagement.ge_decisionhorizon, "Next 90 days");
  assert.equal(engagement["ge_contact@odata.bind"], "/contacts(22222222-2222-4222-8222-222222222222)");
  assert.equal(engagement.ge_nurturestage, undefined);
  const replay = buildDataverseEngagement(record, false, "22222222-2222-4222-8222-222222222222");
  assert.equal(replay["ge_contact@odata.bind"], undefined);
});

test("Dataverse identity ambiguity is surfaced instead of creating a duplicate contact", () => {
  assert.deepEqual(selectDataverseContact([{ contactid: "one" }]), { contactid: "one" });
  assert.throws(() => selectDataverseContact([{ contactid: "one" }, { contactid: "two" }]), { code: "dataverse_contact_ambiguous" });
});

test("Dataverse contact outbox uses bounded retry backoff", () => {
  const epoch = Date.parse("2026-01-01T00:00:00.000Z");
  assert.equal(dataverseRetryState(0, epoch).nextAttemptAt, "2026-01-01T00:00:00.000Z");
  assert.equal(dataverseRetryState(1, epoch).nextAttemptAt, "2026-01-01T00:01:00.000Z");
  assert.equal(dataverseRetryState(20, epoch).nextAttemptAt, "2026-01-01T06:00:00.000Z");
});

test("Dataverse contact outbox recovers a transient sync failure", async () => {
  const epoch = Date.parse("2026-01-01T00:00:00.000Z");
  const record = { id: "33333333-3333-4333-8333-333333333333", dataverseSync: dataverseRetryState(0, epoch) };
  const errors = [];
  const first = await syncContactDataverseRecord(record, async () => {
    const error = new Error("temporary failure");
    error.code = "dataverse_503";
    throw error;
  }, new Date(epoch), { error: (...args) => errors.push(args) });
  assert.equal(first, false);
  assert.equal(record.dataverseSync.status, "pending");
  assert.equal(record.dataverseSync.attempts, 1);
  const second = await syncContactDataverseRecord(record, async () => ({ contactId: "44444444-4444-4444-8444-444444444444", engagementId: "55555555-5555-4555-8555-555555555555", identityStatus: "resolved" }), new Date(epoch + 60_000));
  assert.equal(second, true);
  assert.equal(record.dataverseSync.status, "synced");
  assert.equal(record.dataverseContactId, "44444444-4444-4444-8444-444444444444");
  assert.equal(errors.length, 1);
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
    readerRole: "Professor, researcher, lab, or academic partner",
    email: "reader@example.com",
    organization: "Example & Co",
    context: "Enterprise transformation",
    mandate: "Make the operating decision clear.\nThen move it.",
    sourceUrl: "https://globalenterprise.com/contact/",
  });
  assert.match(html, /GLOBAL ENTERPRISE|Global Enterprise/);
  assert.match(html, /A &lt;reader&gt;/);
  assert.match(html, /Example &amp; Co/);
  assert.match(html, /Reader role/);
  assert.match(plain, /Reader role: Professor, researcher, lab, or academic partner/);
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
