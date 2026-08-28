#!/usr/bin/env node

import { createServer } from "node:http";
import { access, constants, mkdir, mkdtemp, readFile, rename, rm, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const reportNames = [
  "enterprise-decision-readiness",
  "ai-governance-controls",
  "modernization-investment-priority",
  "global-operating-model-brief",
];

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
]);

function usage() {
  console.log(`Usage: node scripts/generate-report-pdfs.mjs [options]

Generate the four report PDFs from the production dist/ directory using local
Google Chrome. The default outputs are written to the private delivery source
directory, not the public site.

Options:
  --dist <path>          Production build directory (default: dist)
  --output-dir <path>    PDF output directory (default: public/reports)
  --chrome <path>        Chrome executable; otherwise auto-detected
  --port <number>        Local server port (default: choose an available port)
  --timeout <ms>         Per-report Chrome timeout (default: 60000)
  --help                 Show this message

The script does not run a build, install packages, or contact external hosts.
Run npm run build first.`);
}

function parseArguments(argv) {
  const options = {
    dist: join(repositoryRoot, "dist"),
    outputDir: join(repositoryRoot, "infra", "brief-delivery", "source-pdfs"),
    chrome: process.env.CHROME_BIN ?? process.env.CHROME_PATH ?? process.env.GOOGLE_CHROME_BIN ?? "",
    port: 0,
    timeout: 60_000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      usage();
      process.exit(0);
    }

    const [name, inlineValue] = argument.split("=", 2);
    const optionNames = new Map([
      ["--dist", "dist"],
      ["--output-dir", "outputDir"],
      ["--chrome", "chrome"],
      ["--port", "port"],
      ["--timeout", "timeout"],
    ]);
    const key = optionNames.get(name);
    if (!key) throw new Error(`Unknown option ${argument}. Use --help for usage.`);

    const value = inlineValue ?? argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);

    if (key === "port" || key === "timeout") {
      const parsed = Number(value);
      const minimum = key === "port" ? 0 : 1_000;
      if (!Number.isInteger(parsed) || parsed < minimum) {
        throw new Error(`${name} must be an integer of at least ${minimum}.`);
      }
      options[key] = parsed;
    } else {
      options[key] = resolve(repositoryRoot, value);
    }
  }

  return options;
}

async function isExecutable(candidate) {
  try {
    await access(candidate, constants.X_OK);
    const details = await stat(candidate);
    return details.isFile();
  } catch {
    return false;
  }
}

async function findChrome(configuredPath) {
  if (configuredPath) {
    if (await isExecutable(configuredPath)) return configuredPath;
    throw new Error(`Google Chrome was not found at the configured path ${configuredPath}. Set CHROME_BIN to an executable Chrome path or omit it for automatic detection.`);
  }

  const candidates = [];

  const pathEntries = (process.env.PATH ?? "").split(sep).filter(Boolean);
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    candidates.push(...pathEntries.map((entry) => join(entry, name)));
  }

  candidates.push(
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  );

  const uniqueCandidates = [...new Set(candidates)];
  for (const candidate of uniqueCandidates) {
    if (await isExecutable(candidate)) return candidate;
  }

  const configuredMessage = configuredPath ? ` The configured path was ${configuredPath}.` : "";
  throw new Error(`Google Chrome was not found.${configuredMessage} Install Google Chrome or set CHROME_BIN to its executable path. Checked: ${uniqueCandidates.join(", ")}`);
}

async function requireFile(filePath, label) {
  try {
    const details = await stat(filePath);
    if (!details.isFile() || details.size === 0) throw new Error("is empty or not a regular file");
  } catch (error) {
    throw new Error(`${label} is missing or invalid at ${filePath}. ${error instanceof Error ? error.message : String(error)} Run npm run build first.`);
  }
}

async function validateBuild(distDir) {
  try {
    const details = await stat(distDir);
    if (!details.isDirectory()) throw new Error("is not a directory");
  } catch (error) {
    throw new Error(`Production build directory is missing at ${distDir}. ${error instanceof Error ? error.message : String(error)} Run npm run build first.`);
  }

  for (const reportName of reportNames) {
    await requireFile(join(distDir, "reports", `${reportName}.html`), `Production report ${reportName}.html`);
  }
  await requireFile(join(distDir, "reports", "report.css"), "Shared report stylesheet");
}

function contentType(filePath) {
  return mimeTypes.get(extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

function safeFilePath(rootDir, requestPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestPath, "http://127.0.0.1").pathname);
  } catch {
    return null;
  }

  const filePath = resolve(rootDir, `.${pathname}`);
  const rootWithSeparator = rootDir.endsWith(sep) ? rootDir : `${rootDir}${sep}`;
  if (filePath !== rootDir && !filePath.startsWith(rootWithSeparator)) return null;
  return filePath;
}

async function startStaticServer(rootDir, port) {
  const server = createServer(async (request, response) => {
    if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const requestedPath = safeFilePath(rootDir, request.url);
    if (!requestedPath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    let filePath = requestedPath;
    try {
      if ((await stat(filePath)).isDirectory()) filePath = join(filePath, "index.html");
      const details = await stat(filePath);
      if (!details.isFile()) throw new Error("not a file");
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": details.size,
        "Content-Type": contentType(filePath),
      });
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  await new Promise((resolveServer, rejectServer) => {
    const onError = (error) => {
      server.off("listening", onListening);
      rejectServer(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolveServer();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen({ host: "127.0.0.1", port });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    await closeServer(server);
    throw new Error("Local report server did not provide a TCP port.");
  }

  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function closeServer(server) {
  if (!server?.listening) return;
  await new Promise((resolveClose) => server.close(resolveClose));
}

function runChrome(chromePath, url, outputPath, profileDir, timeout) {
  const args = [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--metrics-recording-only",
    "--disable-features=MediaRouter,OptimizationHints,Translate,AutofillServerCommunication,CertificateTransparencyComponentUpdater",
    "--host-resolver-rules=MAP * ~NOTFOUND,EXCLUDE 127.0.0.1",
    `--user-data-dir=${profileDir}`,
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=5000",
    `--print-to-pdf=${outputPath}`,
    url,
  ];

  return new Promise((resolveProcess, rejectProcess) => {
    const child = spawn(chromePath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      rejectProcess(new Error(`Chrome timed out after ${timeout}ms while printing ${url}.\n${stderr || stdout}`));
      settled = true;
    }, timeout);

    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.once("error", (error) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      rejectProcess(new Error(`Chrome could not start for ${url}: ${error.message}`));
    });
    child.once("close", (code, signal) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      if (code !== 0) {
        rejectProcess(new Error(`Chrome failed while printing ${url} (exit ${code ?? "unknown"}, signal ${signal ?? "none"}).\n${stderr || stdout}`));
        return;
      }
      resolveProcess();
    });
  });
}

async function validatePdf(filePath) {
  const details = await stat(filePath);
  if (!details.isFile() || details.size < 1_024) {
    throw new Error(`Chrome produced an invalid or unusually small PDF at ${filePath}.`);
  }
  const header = (await readFile(filePath)).subarray(0, 5).toString("ascii");
  if (header !== "%PDF-") throw new Error(`Chrome output at ${filePath} does not have a PDF signature.`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const distDir = resolve(options.dist);
  const outputDir = resolve(options.outputDir);
  const chromePath = await findChrome(options.chrome);
  await validateBuild(distDir);
  await mkdir(outputDir, { recursive: true });

  const stagingDir = await mkdtemp(join(outputDir, ".report-pdf-staging-"));
  const profileDir = await mkdtemp(join(tmpdir(), "globalenterprise-chrome-"));
  let server;

  try {
    const localServer = await startStaticServer(distDir, options.port);
    server = localServer.server;
    console.log(`Using production build: ${distDir}`);
    console.log(`Using Chrome: ${chromePath}`);
    console.log(`Serving reports locally at ${localServer.baseUrl}`);

    for (const reportName of reportNames) {
      const sourceUrl = `${localServer.baseUrl}/reports/${reportName}.html`;
      const stagedPdf = join(stagingDir, `${reportName}.pdf`);
      console.log(`Printing ${reportName}.html → ${reportName}.pdf`);
      await runChrome(chromePath, sourceUrl, stagedPdf, profileDir, options.timeout);
      await validatePdf(stagedPdf);
    }

    for (const reportName of reportNames) {
      const stagedPdf = join(stagingDir, `${reportName}.pdf`);
      const finalPdf = join(outputDir, `${reportName}.pdf`);
      await rename(stagedPdf, finalPdf);
      console.log(`✓ ${relative(repositoryRoot, finalPdf)}`);
    }

    console.log(`✓ generated ${reportNames.length} PDFs in ${outputDir}`);
  } finally {
    await closeServer(server);
    await rm(stagingDir, { recursive: true, force: true });
    await rm(profileDir, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
