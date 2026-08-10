import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = new URL("../dist/", import.meta.url);
const errors = [];
const htmlFiles = [];

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
  const headings = html.match(/<h1\b/gi) ?? [];
  if (headings.length !== 1) errors.push(`${file}: expected one h1, found ${headings.length}`);
  if (!file.startsWith("visual-sitemap/") && !html.includes(".avif")) errors.push(`${file}: missing AVIF editorial visual`);
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]+"/i.test(image[0])) errors.push(`${file}: image missing alt text`);
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
const insightPages = htmlFiles.filter((path) => /\/insights\/[^/]+\/index\.html$/.test(path) && !path.includes("/topics/")).length;
const topicPages = htmlFiles.filter((path) => /\/insights\/topics\/[^/]+\/index\.html$/.test(path)).length;
if (insightPages < 15) errors.push(`editorial library: expected at least 15 insight pages, found ${insightPages}`);
if (topicPages < 10) errors.push(`editorial navigation: expected at least 10 topic pages, found ${topicPages}`);

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join("\n"));
  process.exit(1);
}

console.log(`✓ audited ${htmlFiles.length} HTML files, ${insightPages} insight pages, and ${topicPages} topic pages`);
