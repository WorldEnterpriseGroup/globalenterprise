import { readdir, readFile } from "node:fs/promises";

const insightRoot = new URL("../src/content/insights/", import.meta.url);
const files = (await readdir(insightRoot)).filter((name) => name.endsWith(".md")).sort();
const sourceFiles = new Map();
const quantifiedClaims = new Map();
const staleFiles = [];

function withoutFrontmatter(markdown) {
  return markdown.replace(/^---[\s\S]*?---\s*/, "");
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/\[[^\]]+\]\([^)]*\)/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

for (const file of files) {
  const markdown = await readFile(new URL(file, insightRoot), "utf8");
  if (/\b(?:2025|2024|2023|2022|2021|2020|2019)\b/.test(markdown)) staleFiles.push(file);
  const uniqueUrls = new Set([...markdown.matchAll(/https?:\/\/[^\s)"']+/g)].map((match) => match[0].replace(/[.,]+$/, "")));
  for (const url of uniqueUrls) {
    if (!sourceFiles.has(url)) sourceFiles.set(url, new Set());
    sourceFiles.get(url).add(file);
  }

  const body = withoutFrontmatter(markdown);
  for (const sentence of body.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((value) => value.trim())) {
    if (!/(?:\d+(?:\.\d+)?\s*%|\b\d{2,3}(?:,\d{3})*\b|one in (?:four|three|five)|nine in ten)/i.test(sentence)) continue;
    const claim = normalize(sentence);
    if (!claim) continue;
    if (!quantifiedClaims.has(claim)) quantifiedClaims.set(claim, new Set());
    quantifiedClaims.get(claim).add(file);
  }
}

const duplicateSources = [...sourceFiles.entries()].filter(([, owners]) => owners.size > 1);
const duplicateClaims = [...quantifiedClaims.entries()].filter(([, owners]) => owners.size > 1);

console.log(`Audited ${files.length} insight articles.`);
console.log(`Unique source URLs: ${sourceFiles.size}`);
console.log(`Cross-article shared source URLs for editorial review: ${duplicateSources.length}`);
for (const [url, owners] of duplicateSources) console.log(`  ${[...owners].join(", ")} -> ${url}`);
console.log(`Cross-article duplicate quantified claims: ${duplicateClaims.length}`);
for (const [claim, owners] of duplicateClaims) console.log(`  ${[...owners].join(", ")} -> ${claim}`);
console.log(`Stale pre-August 2026 article references: ${staleFiles.length}`);
for (const file of staleFiles) console.log(`  ${file}`);

if (duplicateClaims.length || staleFiles.length) process.exitCode = 1;
