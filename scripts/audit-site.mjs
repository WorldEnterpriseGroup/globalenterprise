import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../dist/", import.meta.url);
const errors = [];
const htmlFiles = [];
const utilityRoutes = ["/privacy/", "/terms/", "/404/", "/visual-sitemap/", "/audiences/", "/contact/thanks/", "/insights/thanks/", "/resources/thanks/", "/trust/vendor-pack/", "/global/"];
const redirectFiles = new Set(["global/index.html"]);
const editorialDirectory = new URL("../src/content/insights/", import.meta.url);
const sourcePdfDirectory = new URL("../infra/brief-delivery/source-pdfs/", import.meta.url);
const freshnessBaseline = "2026-08-10";
const routeImages = new Map();
const renderedPhotos = new Map();
const diagramIds = new Map();
const audienceDestinationContracts = [
  "https://ignitecuriosity.org/",
  "https://taostaff.com/",
  "https://instarlab.org/",
  "https://dreamlimited.org/",
];
const audienceDestinationRouteContracts = [
  { destination: "https://ignitecuriosity.org/", files: ["careers/index.html"] },
  { destination: "https://taostaff.com/", files: ["careers/index.html"] },
  { destination: "https://instarlab.org/", files: ["services/research-foresight/index.html", "insights/topics/research-and-foresight/index.html"] },
  { destination: "https://dreamlimited.org/", files: ["trust/vendor-pack/index.html"] },
];
const approvedOrganizationMapFiles = new Set(["audiences/index.html", "visual-sitemap/index.html"]);
const quietShellMarkers = ["Who this is for", "Audience routes", "Other homes in the organization"];
const renderedAudienceDestinations = new Set();
const reportDocuments = [
  "reports/enterprise-decision-readiness.html",
  "reports/ai-governance-controls.html",
  "reports/modernization-investment-priority.html",
  "reports/global-operating-model-brief.html",
];
const reportPdfs = reportDocuments.map((report) => report.replace(/^reports\//, "").replace(/\.html$/, ".pdf"));

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else if (name.endsWith(".html")) htmlFiles.push(path);
  }
}

function requiredMarkup(html, pattern, label, file) {
  if (!pattern.test(html)) errors.push(`${file}: missing ${label}`);
}

function imageKey(source) {
  const filename = source.split("?")[0].split("/").at(-1) ?? source;
  return filename.replace(/\.[a-z0-9]+$/i, "").replace(/\.[a-z0-9_-]{6,}$/i, "");
}

async function internalTarget(href) {
  const parsed = new URL(href, "https://globalenterprise.com");
  if (parsed.origin !== "https://globalenterprise.com") return null;
  const pathname = decodeURIComponent(parsed.pathname);
  const direct = join(root.pathname, pathname.replace(/^\//, ""));
  const route = pathname === "/" ? join(root.pathname, "index.html") : join(root.pathname, pathname.replace(/^\//, ""), "index.html");
  try {
    const directInfo = await stat(direct);
    if (directInfo.isFile()) return direct;
  } catch {
  }
  return route;
}

await walk(root.pathname);

for (const path of htmlFiles) {
  const file = relative(root.pathname, path) || "index.html";
  const html = await readFile(path, "utf8");
  if (file === "visual-sitemap/compact.html" || file === "404.html" || redirectFiles.has(file)) continue;
  if (file.startsWith("reports/")) continue;
  for (const destination of audienceDestinationContracts) {
    if (html.includes(destination)) renderedAudienceDestinations.add(destination);
  }
  for (const contract of audienceDestinationRouteContracts) {
    if (contract.files.includes(file) && !html.includes(contract.destination)) errors.push(`${file}: missing contextual destination ${contract.destination}`);
  }
  const links = [...html.matchAll(/\bhref="([^"]+)"/gi)].map((match) => match[1].replaceAll("&amp;", "&"));
  if (links.includes("/audiences/") && !approvedOrganizationMapFiles.has(file)) errors.push(`${file}: organization map link escaped its approved site-tool surfaces`);
  for (const destination of audienceDestinationContracts) {
    if (links.includes(destination) && !audienceDestinationRouteContracts.some((contract) => contract.destination === destination && contract.files.includes(file)) && file !== "audiences/index.html") {
      errors.push(`${file}: outbound audience destination is not approved for this route (${destination})`);
    }
  }
  for (const marker of quietShellMarkers) {
    if (html.includes(marker)) errors.push(`${file}: audience segmentation leaked into the shared shell (${marker})`);
  }
  if (html.includes("https://dreamlimited.com/")) errors.push(`${file}: parked DreamLimited domain must not be used; link to dreamlimited.org`);
  requiredMarkup(html, /<title>[^<]+<\/title>/i, "title", file);
  requiredMarkup(html, /<meta name="description" content="[^"]+"/i, "meta description", file);
  requiredMarkup(html, /<link rel="canonical" href="https:\/\/globalenterprise\.com\//i, "canonical", file);
  requiredMarkup(html, /<meta property="og:image" content="[^"]+"/i, "Open Graph image", file);
  requiredMarkup(html, /<script type="application\/ld\+json">/i, "JSON-LD", file);
  requiredMarkup(html, /<body[^>]+data-route-signature="[^"]+"/i, "route signature", file);
  requiredMarkup(html, /<body[^>]+data-route-image="[^"]+"/i, "route image assignment", file);
  requiredMarkup(html, /data-motion-progress/i, "progressive motion system", file);
  requiredMarkup(html, /<link rel="preload" href="\/font\/roboto-regular-webfont\.(?:woff2|woff)" as="font"/i, "primary font preload", file);
  if (/<section class="[^"]*\bsection-pad\b[^"]*"[^>]*>\s*<div class="container-site"[^>]*>\s*<section class="intelligence-stack\b/i.test(html)) {
    errors.push(`${file}: intelligence stack is wrapped in duplicate section padding`);
  }
  const headings = html.match(/<h1\b/gi) ?? [];
  if (headings.length !== 1) errors.push(`${file}: expected one h1, found ${headings.length}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
  for (const id of new Set(ids.filter((value, index) => ids.indexOf(value) !== index))) {
    errors.push(`${file}: duplicate id ${id}`);
  }
  const routeImage = html.match(/data-route-image="([^"]+)"/)?.[1] ?? "none";
  if (routeImage !== "none") {
    const owner = routeImages.get(routeImage);
    if (owner && owner !== file) errors.push(`${file}: photo ${routeImage} is already assigned to ${owner}`);
    routeImages.set(routeImage, file);
  }
  const imagesOnRoute = new Map();
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"\s][^"]*"/i.test(image[0])) errors.push(`${file}: image missing alt text`);
    if (!/\bwidth="\d+"/i.test(image[0]) || !/\bheight="\d+"/i.test(image[0])) errors.push(`${file}: image missing intrinsic dimensions`);
    const source = image[0].match(/\bsrc="([^"]+)"/i)?.[1];
    if (source && /\.avif(?:\?|$)/i.test(source)) {
      const key = imageKey(source);
      const count = (imagesOnRoute.get(key) ?? 0) + 1;
      imagesOnRoute.set(key, count);
      if (count > 1) errors.push(`${file}: repeated photo or crop ${key} on the same route`);
      const owner = renderedPhotos.get(key);
      if (owner && owner !== file) errors.push(`${file}: photo ${key} is rendered on more than one route (${owner})`);
      renderedPhotos.set(key, file);
    }
  }
  if (routeImage !== "none" && !html.includes(".avif")) errors.push(`${file}: photo route is missing its assigned AVIF image`);
  for (const match of html.matchAll(/data-diagram-id="([^"]+)"/g)) {
    const id = match[1];
    const owner = diagramIds.get(id);
    if (owner && owner !== file) errors.push(`${file}: technical diagram ${id} is already shown on ${owner}`);
    diagramIds.set(id, file);
  }
  const isDiagramRoute = /^(?:services|solutions|industries|case-studies)\/[^/]+\/index\.html$/.test(file);
  if (isDiagramRoute && !file.includes("/topics/") && !html.includes("data-diagram-id=")) {
    errors.push(`${file}: substantial detail route is missing its one technical visual`);
  }
  if (/^insights\/[^/]+\/index\.html$/.test(file) && !file.startsWith("insights/thanks/") && !file.includes("/topics/")) {
    const wordCount = html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 280) errors.push(`${file}: article is too thin (${wordCount} words)`);
    if (!/https:\/\/[^"'<>]+/i.test(html)) errors.push(`${file}: article is missing a public source link`);
    if (!/<h2\b/i.test(html)) errors.push(`${file}: article is missing a structured section heading`);
  }
  for (const match of html.matchAll(/\bhref="([^"]+)"/gi)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    const target = await internalTarget(href);
    if (target && !((await stat(target).catch(() => null))?.isFile?.())) errors.push(`${file}: broken internal link ${href}`);
  }
}

for (const destination of audienceDestinationContracts) {
  if (!renderedAudienceDestinations.has(destination)) errors.push(`audience routing: missing rendered destination ${destination}`);
}

for (const report of reportDocuments) {
  const path = join(root.pathname, report);
  const html = await readFile(path, "utf8").catch(() => "");
  if (!html) {
    errors.push(`${report}: missing deep report document`);
    continue;
  }
  if (!/<h1\b/i.test(html)) errors.push(`${report}: missing report title`);
  if ((html.match(/<h2\b/gi) ?? []).length < 4) errors.push(`${report}: deep report needs at least four structured sections`);
  if (!/<(?:div|section)\b[^>]*class="[^"]*\breport-worksheet\b/i.test(html)) errors.push(`${report}: missing reusable worksheet`);
  if (!/https:\/\/[^"'<>]+/i.test(html)) errors.push(`${report}: missing public source links`);
  const wordCount = html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 1000) errors.push(`${report}: report is too thin (${wordCount} words)`);
}

for (const report of reportPdfs) {
  const path = join(sourcePdfDirectory.pathname, report);
  const info = await stat(path).catch(() => null);
  if (!info?.isFile() || info.size < 100_000) {
    errors.push(`infra/brief-delivery/source-pdfs/${report}: missing or unusually small generated PDF`);
  }
  const publicPath = join(root.pathname, "reports", report);
  const publicInfo = await stat(publicPath).catch(() => null);
  if (publicInfo?.isFile()) errors.push(`reports/${report}: PDF must remain outside the public build`);
}

const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
if (!robots.includes("Sitemap: https://globalenterprise.com/sitemap-index.xml")) errors.push("public/robots.txt: missing production sitemap declaration");
const manifest = await readFile(new URL("../src/data/route-manifest.ts", import.meta.url), "utf8");
for (const field of ["focalPoint", "role", "promptIntent", "createdAt", "routeVisuals"]) {
  if (!manifest.includes(field)) errors.push(`src/data/route-manifest.ts: missing ${field} metadata`);
}

const sourceMediaDirectory = new URL("../src/assets/media/", import.meta.url);
const sourceMediaFiles = (await readdir(sourceMediaDirectory.pathname)).filter((name) => name.endsWith(".avif"));
const sourceHashes = new Map();
for (const name of sourceMediaFiles) {
  const hash = createHash("sha256").update(await readFile(join(sourceMediaDirectory.pathname, name))).digest("hex");
  const owner = sourceHashes.get(hash);
  if (owner) errors.push(`src/assets/media: exact duplicate photography ${owner} and ${name}`);
  sourceHashes.set(hash, name);
}
for (const name of await readdir(root)) {
  if (!name.startsWith("sitemap-") || !name.endsWith(".xml")) continue;
  const sitemap = await readFile(join(root.pathname, name), "utf8");
  for (const utilityRoute of utilityRoutes) {
    if (sitemap.includes(`globalenterprise.com${utilityRoute}`)) errors.push(`${name}: utility route included in sitemap (${utilityRoute})`);
  }
}

const editorialFiles = (await readdir(editorialDirectory)).filter((name) => name.endsWith(".md"));
const editorialParagraphs = new Map();
for (const name of editorialFiles) {
  const markdown = await readFile(join(editorialDirectory.pathname, name), "utf8");
  if (!markdown.includes(`lastReviewed: ${freshnessBaseline}`)) errors.push(`src/content/insights/${name}: missing August 2026 review date`);
  const body = markdown.replace(/^---[\s\S]*?---\s*/m, "");
  const bodyWithoutUrls = body.replace(/https?:\/\/\S+/g, "");
  if (/\b(?:2025|2024|2023|2022|2021|2020|2019)\b/.test(bodyWithoutUrls)) errors.push(`src/content/insights/${name}: stale pre-August 2026 reference`);
  for (const paragraph of body.split(/\n\s*\n/).map((value) => value.replace(/\s+/g, " ").trim())) {
    if (paragraph.length < 140 || paragraph.startsWith("#") || paragraph.startsWith("- ")) continue;
    const existing = editorialParagraphs.get(paragraph) ?? [];
    existing.push(name);
    editorialParagraphs.set(paragraph, existing);
  }
}
for (const [paragraph, names] of editorialParagraphs) {
  if (names.length > 1) errors.push(`editorial library: repeated paragraph across ${names.join(", ")}: ${paragraph.slice(0, 90)}…`);
}
const insightPages = htmlFiles.filter((path) => /\/insights\/[^/]+\/index\.html$/.test(path) && !path.includes("/topics/")).length;
const topicPages = htmlFiles.filter((path) => /\/insights\/topics\/[^/]+\/index\.html$/.test(path)).length;
if (insightPages < 15) errors.push(`editorial library: expected at least 15 insight pages, found ${insightPages}`);
if (topicPages < 10) errors.push(`editorial navigation: expected at least 10 topic pages, found ${topicPages}`);

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join("\n"));
  process.exit(1);
}

console.log(`✓ audited ${htmlFiles.length} HTML files, ${reportDocuments.length} deep report documents and ${reportPdfs.length} private PDFs, ${routeImages.size} route photo assignments / ${renderedPhotos.size} rendered one-time photos, ${diagramIds.size} one-time diagrams, ${insightPages} insight pages, and ${topicPages} topic pages`);
