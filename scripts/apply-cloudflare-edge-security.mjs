const apiBase = "https://api.cloudflare.com/client/v4";
const zoneName = process.env.CLOUDFLARE_ZONE_NAME?.trim() || "globalenterprise.com";
const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const configuredZoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
const dryRun = process.argv.includes("--dry-run");

const edgeHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-Frame-Options": "SAMEORIGIN",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self'; form-action 'self' https://briefs.globalenterprise.com https://formsubmit.co; script-src 'self' https://plausible.io; style-src 'self'; style-src-elem 'self' 'unsafe-inline'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://plausible.io; manifest-src 'self'; upgrade-insecure-requests",
};

const headerParameters = Object.fromEntries(Object.entries(edgeHeaders).map(([name, value]) => [name, { operation: "set", value }]));
const desiredRule = {
  ref: "globalenterprise-security-headers",
  description: "Apply the repository public/_headers security contract at the Cloudflare edge.",
  expression: "true",
  action: "rewrite",
  action_parameters: { headers: headerParameters },
};

if (dryRun && !token) {
  console.log(`Cloudflare edge security dry run for ${zoneName}; no API request made.`);
  console.log(JSON.stringify({ zone: zoneName, zoneId: configuredZoneId || "resolve by name", rule: desiredRule }, null, 2));
  process.exit(0);
}

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN is not set; no Cloudflare request was made.");
  process.exit(2);
}

async function cloudflare(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const messages = (payload.errors ?? []).map((error) => error.message).filter(Boolean).join("; ");
    throw new Error(`Cloudflare API ${response.status} ${response.statusText}${messages ? `: ${messages}` : ""}`);
  }
  return payload.result;
}

const zone = configuredZoneId
  ? await cloudflare(`/zones/${encodeURIComponent(configuredZoneId)}`)
  : (await cloudflare(`/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=50`)).at(0);
if (!zone?.id) throw new Error(`Active Cloudflare zone not found for ${zoneName}.`);
if (zone.name !== zoneName) throw new Error(`Resolved zone ${zone.name} does not match expected ${zoneName}.`);

const rulesets = await cloudflare(`/zones/${zone.id}/rulesets?phase=http_response_headers_transform`);
const existing = rulesets.find((ruleset) => ruleset.phase === "http_response_headers_transform");

if (!existing) {
  const payload = {
    name: "Global Enterprise security response headers",
    description: "Mirrors the repository public/_headers security contract at the Cloudflare edge.",
    kind: "zone",
    phase: "http_response_headers_transform",
    rules: [desiredRule],
  };
  if (dryRun) {
    console.log(`Cloudflare edge security dry run for ${zone.name} (${zone.plan?.name ?? "plan unknown"}); would create:`);
    console.log(JSON.stringify(payload, null, 2));
    process.exit(0);
  }
  const created = await cloudflare(`/zones/${zone.id}/rulesets`, { method: "POST", body: JSON.stringify(payload) });
  console.log(`Created Cloudflare response-header ruleset ${created.id} for ${zone.name}.`);
  process.exit(0);
}

const detail = await cloudflare(`/zones/${zone.id}/rulesets/${existing.id}`);
const rules = Array.isArray(detail.rules) ? [...detail.rules] : [];
const ruleIndex = rules.findIndex((rule) => rule.ref === desiredRule.ref);
if (ruleIndex === -1) rules.push(desiredRule);
else rules[ruleIndex] = desiredRule;

const payload = {
  name: detail.name ?? "Global Enterprise security response headers",
  description: detail.description ?? "Mirrors the repository public/_headers security contract at the Cloudflare edge.",
  kind: detail.kind ?? "zone",
  phase: detail.phase ?? "http_response_headers_transform",
  rules,
};

if (dryRun) {
  console.log(`Cloudflare edge security dry run for ${zone.name} (${zone.plan?.name ?? "plan unknown"}); would update ruleset ${existing.id}:`);
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const updated = await cloudflare(`/zones/${zone.id}/rulesets/${existing.id}`, { method: "PUT", body: JSON.stringify(payload) });
console.log(`Updated Cloudflare response-header ruleset ${updated.id} for ${zone.name}; existing rules were preserved.`);
