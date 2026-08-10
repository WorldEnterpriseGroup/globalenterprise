import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../dist/", import.meta.url);
const errors = [];
const htmlFiles = [];
const utilityRoutes = ["/privacy/", "/terms/", "/404/", "/visual-sitemap/", "/contact/thanks/", "/insights/thanks/"];
const editorialDirectory = new URL("../src/content/insights/", import.meta.url);
const freshnessBaseline = "2026-08-10";

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
  if (file === "visual-sitemap/compact.html" || file === "404.html") continue;
  requiredMarkup(html, /<title>[^<]+<\/title>/i, "title", file);
  requiredMarkup(html, /<meta name="description" content="[^"]+"/i, "meta description", file);
  requiredMarkup(html, /<link rel="canonical" href="https:\/\/globalenterprise\.com\//i, "canonical", file);
  requiredMarkup(html, /<meta property="og:image" content="[^"]+"/i, "Open Graph image", file);
  requiredMarkup(html, /<script type="application\/ld\+json">/i, "JSON-LD", file);
  requiredMarkup(html, /<body[^>]+data-route-signature="[^"]+"/i, "route signature", file);
  requiredMarkup(html, /<body[^>]+data-route-image="[^"]+"/i, "route image assignment", file);
  requiredMarkup(html, /class="page-visual[^"]*"/i, "page visual", file);
  const headings = html.match(/<h1\b/gi) ?? [];
  if (headings.length !== 1) errors.push(`${file}: expected one h1, found ${headings.length}`);
  if (!file.startsWith("visual-sitemap/") && !html.includes(".avif")) errors.push(`${file}: missing AVIF editorial visual`);
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"\s][^"]*"/i.test(image[0])) errors.push(`${file}: image missing alt text`);
    if (!/\bwidth="\d+"/i.test(image[0]) || !/\bheight="\d+"/i.test(image[0])) errors.push(`${file}: image missing intrinsic dimensions`);
  }
  if (/^insights\/[^/]+\/index\.html$/.test(file) && !file.includes("/topics/")) {
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

const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
if (!robots.includes("Sitemap: https://globalenterprise.com/sitemap-index.xml")) errors.push("public/robots.txt: missing production sitemap declaration");
const manifest = await readFile(new URL("../src/data/route-manifest.ts", import.meta.url), "utf8");
for (const field of ["focalPoint", "role", "promptIntent", "createdAt", "routeVisuals"]) {
  if (!manifest.includes(field)) errors.push(`src/data/route-manifest.ts: missing ${field} metadata`);
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
  if (/\b(?:2025|2024|2023|2022|2021|2020|2019)\b/.test(markdown)) errors.push(`src/content/insights/${name}: stale pre-August 2026 reference`);
  const body = markdown.replace(/^---[\s\S]*?---\s*/m, "");
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

console.log(`✓ audited ${htmlFiles.length} HTML files, ${insightPages} insight pages, and ${topicPages} topic pages`);
