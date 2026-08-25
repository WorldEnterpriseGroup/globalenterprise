import { access, readdir, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const headersPath = new URL("public/_headers", root);
const securityTxtPath = new URL("public/.well-known/security.txt", root);
const distPath = new URL("dist/", root);
const errors = [];
const warnings = [];

const requiredHeaders = {
  "x-content-type-options": (value) => /^nosniff$/i.test(value),
  "strict-transport-security": (value) => /max-age=31536000/i.test(value) && /includesubdomains/i.test(value),
  "referrer-policy": (value) => /^strict-origin-when-cross-origin$/i.test(value),
  "permissions-policy": (value) => ["camera=()", "microphone=()", "geolocation=()", "payment=()"].every((token) => value.toLowerCase().includes(token)),
  "x-frame-options": (value) => /^sameorigin$/i.test(value),
  "cross-origin-opener-policy": (value) => /^same-origin$/i.test(value),
  "cross-origin-resource-policy": (value) => /^same-origin$/i.test(value),
  "x-permitted-cross-domain-policies": (value) => /^none$/i.test(value),
};

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

async function readRequired(path, label) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    fail(`${label}: ${error instanceof Error ? error.message : String(error)}`);
    return "";
  }
}

function parseHeadersFile(source) {
  const blocks = new Map();
  let currentBlock = null;

  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    if (!/^\s/.test(rawLine)) {
      currentBlock = line;
      if (!blocks.has(currentBlock)) blocks.set(currentBlock, new Map());
      continue;
    }

    if (!currentBlock) {
      fail(`public/_headers:${lineNumber}: header is not inside a route block`);
      continue;
    }

    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.+)$/);
    if (!match) {
      fail(`public/_headers:${lineNumber}: invalid header declaration`);
      continue;
    }

    const name = match[1].toLowerCase();
    const value = match[2].trim();
    const block = blocks.get(currentBlock);
    if (block.has(name)) fail(`public/_headers:${lineNumber}: duplicate ${match[1]} header in ${currentBlock}`);
    block.set(name, value);
  }

  return blocks;
}

function parseCsp(value, sourceLabel) {
  const directives = new Map();
  for (const directive of value.split(";").map((part) => part.trim()).filter(Boolean)) {
    const [name, ...tokens] = directive.split(/\s+/);
    if (!name) continue;
    const key = name.toLowerCase();
    if (directives.has(key)) fail(`${sourceLabel}: duplicate CSP directive ${name}`);
    directives.set(key, tokens);
  }

  const required = [
    ["default-src", "'self'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["frame-ancestors", "'self'"],
    ["frame-src", "'self'"],
    ["script-src", null],
    ["style-src", null],
    ["img-src", null],
    ["font-src", null],
    ["connect-src", null],
    ["form-action", "'self'"],
    ["upgrade-insecure-requests", null],
  ];

  for (const [name, token] of required) {
    if (!directives.has(name)) {
      fail(`${sourceLabel}: CSP is missing ${name}`);
      continue;
    }
    if (token && !directives.get(name).includes(token)) fail(`${sourceLabel}: CSP ${name} is missing ${token}`);
  }

  for (const name of ["default-src", "script-src", "style-src", "style-src-elem", "style-src-attr", "img-src", "font-src", "connect-src", "form-action", "frame-src", "frame-ancestors"]) {
    if (directives.get(name)?.includes("*")) fail(`${sourceLabel}: CSP ${name} must not allow wildcard *`);
  }
  if (directives.get("script-src")?.includes("'unsafe-eval'")) fail(`${sourceLabel}: CSP script-src must not allow 'unsafe-eval'`);
  if (directives.get("script-src")?.includes("'unsafe-inline'")) fail(`${sourceLabel}: CSP script-src must not allow 'unsafe-inline'`);
}

function validateHeaderSet(headers, sourceLabel) {
  for (const [name, predicate] of Object.entries(requiredHeaders)) {
    const value = headers.get(name);
    if (!value) {
      fail(`${sourceLabel}: missing ${name}`);
      continue;
    }
    if (!predicate(value)) fail(`${sourceLabel}: ${name} has an unsafe or unexpected value (${value})`);
  }

  const csp = headers.get("content-security-policy");
  if (!csp) fail(`${sourceLabel}: missing content-security-policy`);
  else parseCsp(csp, sourceLabel);
}

function validateStaticHeaders(source) {
  const blocks = parseHeadersFile(source);
  const wildcard = blocks.get("/*");
  if (!wildcard) {
    fail("public/_headers: missing /* route block");
    return;
  }

  validateHeaderSet(wildcard, "public/_headers /*");
  console.log(`✓ public/_headers: ${wildcard.size} headers parsed in the /* block`);
}

function parseSecurityTxt(source) {
  const fields = new Map();
  for (const [index, rawLine] of source.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator < 1) {
      fail(`public/.well-known/security.txt:${index + 1}: invalid field`);
      continue;
    }
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (!fields.has(name)) fields.set(name, []);
    fields.get(name).push(value);
  }
  return fields;
}

function validateSecurityTxt(source) {
  const fields = parseSecurityTxt(source);
  const contacts = fields.get("contact") ?? [];
  const canonicals = fields.get("canonical") ?? [];
  const expires = fields.get("expires") ?? [];

  if (!contacts.length) fail("public/.well-known/security.txt: missing Contact");
  for (const contact of contacts) {
    try {
      const parsed = new URL(contact);
      if (!["mailto:", "https:"].includes(parsed.protocol)) fail(`public/.well-known/security.txt: unsupported Contact URI ${contact}`);
    } catch {
      fail(`public/.well-known/security.txt: invalid Contact URI ${contact}`);
    }
  }

  if (canonicals.length !== 1 || canonicals[0] !== "https://globalenterprise.com/.well-known/security.txt") {
    fail("public/.well-known/security.txt: Canonical must be https://globalenterprise.com/.well-known/security.txt");
  }

  if (expires.length !== 1) {
    fail("public/.well-known/security.txt: exactly one Expires field is required");
  } else {
    const expiry = Date.parse(expires[0]);
    const now = Date.now();
    const oneYear = 366 * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(expiry)) fail(`public/.well-known/security.txt: invalid Expires timestamp ${expires[0]}`);
    else if (expiry <= now) fail(`public/.well-known/security.txt: Expires has passed (${expires[0]})`);
    else if (expiry > now + oneYear) fail("public/.well-known/security.txt: Expires must be no more than one year in the future");
    else console.log(`✓ public/.well-known/security.txt: Expires ${new Date(expiry).toISOString()}`);
  }

  const policy = fields.get("policy") ?? [];
  for (const value of policy) {
    try {
      if (new URL(value).protocol !== "https:") fail(`public/.well-known/security.txt: Policy must use HTTPS (${value})`);
    } catch {
      fail(`public/.well-known/security.txt: invalid Policy URI ${value}`);
    }
  }

  if (!fields.get("preferred-languages")?.length) warn("public/.well-known/security.txt: Preferred-Languages is not present");
}

async function requestHeaders(url) {
  const options = { redirect: "follow", signal: AbortSignal.timeout(10000) };
  let response = await fetch(url, { ...options, method: "GET", headers: { Range: "bytes=0-0" } });
  if (response.status === 405 || response.status === 501) {
    response = await fetch(url, { ...options, method: "HEAD" });
  }
  await response.body?.cancel();
  return response;
}

async function validateLive() {
  const configured = process.env.LIVE_SITE_URL?.trim();
  if (!configured) return;

  let base;
  try {
    base = new URL(configured);
  } catch {
    fail(`LIVE_SITE_URL is not a valid URL (${configured})`);
    return;
  }
  if (base.protocol !== "https:") {
    fail(`LIVE_SITE_URL must use HTTPS (${configured})`);
    return;
  }

  try {
    const response = await requestHeaders(base.href);
    if (!response.ok) {
      fail(`live ${base.href}: ${response.status} ${response.statusText}`);
    } else {
      const liveHeaders = new Headers(response.headers);
      const errorsBeforeHeaders = errors.length;
      validateHeaderSet(liveHeaders, `live ${base.href}`);
      if (errors.length === errorsBeforeHeaders) console.log(`✓ live ${base.href}: ${response.status} and security headers checked`);
      else console.log(`! live ${base.href}: ${response.status} reached, but one or more required security headers are missing or unsafe`);
    }
  } catch (error) {
    fail(`live ${base.href}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

async function validateBuiltOutput() {
  try {
    await access(distPath);
  } catch {
    warn("dist/: built output not found; run npm run build before relying on the inline-script check");
    return;
  }

  let checkedFiles = 0;
  for (const path of await htmlFiles(distPath)) {
    checkedFiles += 1;
    const source = await readFile(path, "utf8");
    const relative = path.pathname.slice(distPath.pathname.length);
    const isRedirectDocument = /<meta\b[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/i.test(source);
    if (!isRedirectDocument) {
      const metaCspTag = source.match(/<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/i)?.[0];
      const metaCspMatch = metaCspTag?.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const metaCsp = metaCspMatch?.[1] ?? metaCspMatch?.[2];
      if (!metaCsp) fail(`dist/${relative}: document-level Content-Security-Policy meta fallback is missing`);
      else parseCsp(metaCsp, `dist/${relative} meta CSP`);
    }

    for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attributes = match[1] ?? "";
      const body = (match[2] ?? "").trim();
      const type = attributes.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const normalizedType = (type?.[1] ?? type?.[2] ?? type?.[3] ?? "").split(";", 1)[0].trim().toLowerCase();
      const javascriptType = !normalizedType || normalizedType === "module" || /(?:java|ecma)script/.test(normalizedType);
      if (body && !/\bsrc\s*=/i.test(attributes) && normalizedType !== "application/ld+json" && javascriptType) {
        const line = source.slice(0, match.index).split(/\r?\n/).length;
        fail(`dist/${relative}:${line}: executable inline script remains; externalize it before shipping`);
      }
    }
  }
  console.log(`✓ built output: checked ${checkedFiles} HTML file${checkedFiles === 1 ? "" : "s"} for executable inline scripts`);
}

const headersSource = await readRequired(headersPath, "public/_headers");
if (headersSource) validateStaticHeaders(headersSource);

const securityTxtSource = await readRequired(securityTxtPath, "public/.well-known/security.txt");
if (securityTxtSource) validateSecurityTxt(securityTxtSource);

await validateLive();
await validateBuiltOutput();

for (const warning of warnings) console.warn(`⚠ ${warning}`);
if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join("\n"));
  console.error(`Security audit failed with ${errors.length} error${errors.length === 1 ? "" : "s"} and ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`);
  process.exit(1);
}

console.log(`✓ security audit passed with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}${process.env.LIVE_SITE_URL ? " (static and live)" : " (static configuration)"}`);
