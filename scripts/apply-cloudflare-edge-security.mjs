const apiBase = "https://api.cloudflare.com/client/v4";
const phase = "http_response_headers_transform";
const zoneName = process.env.CLOUDFLARE_ZONE_NAME?.trim() || "globalenterprise.com";
const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const configuredZoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
const dryRun = process.argv.includes("--dry-run");
const allZones = process.argv.includes("--all-zones");
const concurrency = Math.max(1, Number.parseInt(process.env.CLOUDFLARE_CONCURRENCY ?? "4", 10) || 4);

// These headers are deliberately domain-neutral. HSTS, framing, cross-origin
// isolation, Permissions-Policy, and CSP remain opt-in because they can break
// an otherwise healthy application or contain site-specific origins.
const globalHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
};

const siteHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  ...globalHeaders,
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-Frame-Options": "SAMEORIGIN",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; frame-src 'self'; form-action 'self' https://briefs.globalenterprise.com https://formsubmit.co; script-src 'self' https://plausible.io https://static.cloudflareinsights.com; style-src 'self'; style-src-elem 'self' 'unsafe-inline'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://plausible.io https://cloudflareinsights.com; manifest-src 'self'; upgrade-insecure-requests",
};

const ruleRef = allZones ? "worldenterprise-global-security-baseline" : "globalenterprise-security-headers";
const ruleDescription = allZones
  ? "Apply the domain-neutral security baseline across active Cloudflare zones."
  : "Apply the repository public/_headers security contract at the Cloudflare edge.";
const edgeHeaders = allZones ? globalHeaders : siteHeaders;
const headerParameters = Object.fromEntries(Object.entries(edgeHeaders).map(([name, value]) => [name, { operation: "set", value }]));
const desiredRule = {
  ref: ruleRef,
  description: ruleDescription,
  expression: "true",
  action: "rewrite",
  action_parameters: { headers: headerParameters },
};

function usageMessage() {
  return allZones
    ? "Cloudflare global edge security dry run; no API request made. Use --all-zones with a token to apply the baseline to every active zone."
    : `Cloudflare edge security dry run for ${zoneName}; no API request made.`;
}

if (dryRun && !token) {
  console.log(usageMessage());
  console.log(JSON.stringify({ scope: allZones ? "all active zones" : zoneName, rule: desiredRule }, null, 2));
  process.exit(0);
}

if (!token) {
  console.error("CLOUDFLARE_API_TOKEN is not set; no Cloudflare request was made.");
  process.exit(2);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function cloudflare(path, options = {}, attempt = 0) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));

  if ((response.status === 429 || response.status >= 500) && attempt < 4) {
    const retryAfter = Number.parseInt(response.headers.get("retry-after") ?? "", 10);
    const delay = Number.isFinite(retryAfter) ? Math.min(retryAfter * 1000, 10000) : 500 * 2 ** attempt;
    await sleep(delay);
    return cloudflare(path, options, attempt + 1);
  }

  if (!response.ok || payload.success === false) {
    const messages = (payload.errors ?? []).map((error) => error.message).filter(Boolean).join("; ");
    throw new Error(`Cloudflare API ${response.status} ${response.statusText}${messages ? `: ${messages}` : ""}`);
  }
  return payload;
}

async function cloudflareResult(path, options = {}) {
  return (await cloudflare(path, options)).result;
}

async function listActiveZones() {
  const zones = [];
  for (let page = 1; ; page += 1) {
    const payload = await cloudflare(`/zones?status=active&per_page=100&page=${page}`);
    zones.push(...(payload.result ?? []));
    const info = payload.result_info ?? {};
    if (!info.total_pages || page >= info.total_pages) break;
  }
  return zones.filter((zone) => zone?.id && zone?.name);
}

async function resolveNamedZone() {
  const zone = configuredZoneId
    ? await cloudflareResult(`/zones/${encodeURIComponent(configuredZoneId)}`)
    : (await cloudflareResult(`/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=50`)).at(0);
  if (!zone?.id) throw new Error(`Active Cloudflare zone not found for ${zoneName}.`);
  if (zone.name !== zoneName) throw new Error(`Resolved zone ${zone.name} does not match expected ${zoneName}.`);
  return zone;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function ruleMatches(currentRule) {
  const comparable = Object.fromEntries(Object.keys(desiredRule).map((key) => [key, currentRule[key]]));
  return stableStringify(comparable) === stableStringify(desiredRule);
}

function ruleFingerprints(rules) {
  return rules.map((rule) => stableStringify(rule));
}

function assertPostMutation(detail, expectedNonOwnedRules) {
  const rules = Array.isArray(detail?.rules) ? detail.rules : [];
  const ownedRules = rules.filter((rule) => rule.ref === ruleRef);
  if (ownedRules.length !== 1 || !ruleMatches(ownedRules[0])) {
    throw new Error(`Cloudflare post-mutation verification found an invalid ${ruleRef} rule`);
  }

  const actualNonOwnedRules = rules.filter((rule) => rule.ref !== ruleRef);
  if (stableStringify(ruleFingerprints(actualNonOwnedRules)) !== stableStringify(ruleFingerprints(expectedNonOwnedRules))) {
    throw new Error("Cloudflare post-mutation verification found a changed non-owned rule");
  }
  return detail;
}

async function verifyPostMutation(zone, rulesetId, expectedNonOwnedRules) {
  const detail = await cloudflareResult(`/zones/${zone.id}/rulesets/${rulesetId}`);
  return assertPostMutation(detail, expectedNonOwnedRules);
}

async function upsertZone(zone) {
  const rulesets = await cloudflareResult(`/zones/${zone.id}/rulesets?phase=${phase}&per_page=50`);
  const existing = (rulesets ?? []).find((ruleset) => ruleset.phase === phase && (ruleset.kind === "zone" || !ruleset.kind));

  if (!existing) {
    const payload = {
      name: allZones ? "World Enterprise global security response headers" : "Global Enterprise security response headers",
      description: ruleDescription,
      kind: "zone",
      phase,
      rules: [desiredRule],
    };
    if (dryRun) return { zone: zone.name, action: "create", ruleset: payload };
    const created = await cloudflareResult(`/zones/${zone.id}/rulesets`, { method: "POST", body: JSON.stringify(payload) });
    const verified = await verifyPostMutation(zone, created.id, []);
    return { zone: zone.name, action: "created", id: verified.id ?? created.id };
  }

  const detail = await cloudflareResult(`/zones/${zone.id}/rulesets/${existing.id}`);
  const rules = Array.isArray(detail.rules) ? [...detail.rules] : [];
  const ownedRules = rules.filter((rule) => rule.ref === ruleRef);
  if (ownedRules.length > 1) throw new Error(`Cloudflare ruleset contains multiple ${ruleRef} rules; refusing an ambiguous mutation`);
  const currentRule = ownedRules[0];
  const ruleIndex = currentRule ? rules.indexOf(currentRule) : -1;

  if (currentRule && ruleMatches(currentRule)) {
    return { zone: zone.name, action: "unchanged", id: existing.id };
  }

  const nonOwnedRules = rules.filter((rule) => rule.ref !== ruleRef);
  if (dryRun) return { zone: zone.name, action: ruleIndex === -1 ? "append" : "update", id: existing.id, rules: rules.length + (ruleIndex === -1 ? 1 : 0) };

  let mutationResult;
  if (ruleIndex === -1) {
    mutationResult = await cloudflareResult(`/zones/${zone.id}/rulesets/${existing.id}/rules`, {
      method: "POST",
      body: JSON.stringify(desiredRule),
    });
  } else {
    if (!currentRule.id) throw new Error(`Cloudflare owned ${ruleRef} rule has no ID; refusing a full-ruleset fallback`);
    mutationResult = await cloudflareResult(`/zones/${zone.id}/rulesets/${existing.id}/rules/${currentRule.id}`, {
      method: "PATCH",
      body: JSON.stringify(desiredRule),
    });
  }

  const verified = await verifyPostMutation(zone, existing.id, nonOwnedRules);
  return {
    zone: zone.name,
    action: ruleIndex === -1 ? "appended" : "updated",
    id: verified.id ?? mutationResult?.id ?? existing.id,
    preservedRules: nonOwnedRules.length,
  };
}

async function runZones(zones) {
  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < zones.length) {
      const index = cursor++;
      const zone = zones[index];
      try {
        results[index] = await upsertZone(zone);
      } catch (error) {
        results[index] = { zone: zone.name, action: "failed", error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, zones.length) }, () => worker()));
  return results;
}

const zones = allZones ? await listActiveZones() : [await resolveNamedZone()];
if (!zones.length) throw new Error("No active Cloudflare zones were returned for this token.");

if (dryRun) {
  const results = await runZones(zones);
  const counts = Object.groupBy(results, (result) => result.action);
  console.log(`Cloudflare ${allZones ? "global" : "site"} edge security dry run for ${zones.length} zone${zones.length === 1 ? "" : "s"}; no writes made.`);
  console.log(JSON.stringify({ counts: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, value.length])), failures: results.filter((result) => result.action === "failed") }, null, 2));
  process.exit(results.some((result) => result.action === "failed") ? 1 : 0);
}

const results = await runZones(zones);
for (const result of results) {
  if (result.action === "failed") console.error(`✗ ${result.zone}: ${result.error}`);
  else console.log(`✓ ${result.zone}: ${result.action}${result.id ? ` (${result.id})` : ""}`);
}

const failures = results.filter((result) => result.action === "failed");
const changed = results.filter((result) => ["created", "appended", "updated"].includes(result.action));
const unchanged = results.filter((result) => result.action === "unchanged");
console.log(`Cloudflare ${allZones ? "global" : "site"} edge security complete: ${changed.length} changed, ${unchanged.length} unchanged, ${failures.length} failed across ${results.length} zone${results.length === 1 ? "" : "s"}.`);
if (failures.length) process.exit(1);
