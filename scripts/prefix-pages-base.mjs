import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const outputDir = process.env.PAGES_OUTPUT_DIR ?? "dist";
const rawBasePath = process.env.PAGES_BASE_PATH;

if (!rawBasePath) {
  console.error("PAGES_BASE_PATH is required when preparing a path-based Pages deployment.");
  process.exit(1);
}

const basePath = `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`;

function prefixUrl(value) {
  if (!value.startsWith("/") || value.startsWith("//") || value === basePath || value.startsWith(`${basePath}/`)) {
    return value;
  }
  return `${basePath}${value}`;
}

function prefixSrcset(value) {
  return value
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return candidate;
      const match = trimmed.match(/^(\S+)([\s\S]*)$/);
      if (!match) return candidate;
      return `${prefixUrl(match[1])}${match[2]}`;
    })
    .join(",");
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

const files = await collectFiles(outputDir);
let changedFiles = 0;
let changedReferences = 0;

for (const file of files) {
  const extension = file.slice(file.lastIndexOf("."));
  if (![".html", ".css", ".webmanifest"].includes(extension)) continue;

  const original = await readFile(file, "utf8");
  let transformed = original;

  if (extension === ".html") {
    transformed = transformed.replace(
      /\b(href|src|srcset|action|poster|cite|data-src|data-href)=(["'])([\s\S]*?)\2/g,
      (match, attribute, quote, value) => {
        const nextValue = attribute === "srcset" ? prefixSrcset(value) : prefixUrl(value);
        if (nextValue === value) return match;
        changedReferences += 1;
        return `${attribute}=${quote}${nextValue}${quote}`;
      },
    );
  }

  if (extension === ".html" || extension === ".css") {
    transformed = transformed.replace(/url\(\s*(["']?)(\/[^\s)"']+)\1\s*\)/g, (match, quote, value) => {
      const nextValue = prefixUrl(value);
      if (nextValue === value) return match;
      changedReferences += 1;
      return `url(${quote}${nextValue}${quote})`;
    });
  }

  if (extension === ".webmanifest") {
    const manifest = JSON.parse(transformed);
    for (const key of ["start_url", "scope"]) {
      if (typeof manifest[key] !== "string") continue;
      const nextValue = prefixUrl(manifest[key]);
      if (nextValue === manifest[key]) continue;
      manifest[key] = nextValue;
      changedReferences += 1;
    }
    for (const icon of manifest.icons ?? []) {
      if (typeof icon.src !== "string") continue;
      const nextValue = prefixUrl(icon.src);
      if (nextValue === icon.src) continue;
      icon.src = nextValue;
      changedReferences += 1;
    }
    transformed = `${JSON.stringify(manifest, null, 2)}\n`;
  }

  if (transformed !== original) {
    await writeFile(file, transformed);
    changedFiles += 1;
  }
}

console.log(`Prefixed ${changedReferences} root-relative references across ${changedFiles} files under ${relative(process.cwd(), outputDir)} with ${basePath}/`);
