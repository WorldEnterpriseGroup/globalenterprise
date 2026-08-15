import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { spawn, spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { createServer } from "../server.mjs";

const browserBin = process.env.BROWSER_BIN || "google-chrome";
const browserCheck = spawnSync(browserBin, ["--version"], { encoding: "utf8" });
if (browserCheck.error || browserCheck.status !== 0) {
  console.log(`SKIP browser E2E: ${browserBin} is not available`);
  process.exit(0);
}

const fixture = await readFile(new URL("./browser-fixture.html", import.meta.url), "utf8");
let apiServer;
let fixtureServer;
let browser;

try {
  fixtureServer = http.createServer((request, response) => {
    if (request.url !== "/") {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }
    const page = fixture.replace("__API_URL__", apiUrl);
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(page);
  }).listen(0, "127.0.0.1");
  await once(fixtureServer, "listening");

  const fixtureOrigin = `http://localhost:${fixtureServer.address().port}`;
  apiServer = createServer({ allowedOrigins: new Set([fixtureOrigin]) }).listen(0, "127.0.0.1");
  await once(apiServer, "listening");
  const apiUrl = `http://127.0.0.1:${apiServer.address().port}`;

  browser = spawn(browserBin, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--virtual-time-budget=3000",
    "--dump-dom",
    `${fixtureOrigin}/`,
  ], { stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  browser.stdout.on("data", (chunk) => { stdout += chunk; });
  browser.stderr.on("data", (chunk) => { stderr += chunk; });
  const [exitCode] = await once(browser, "close");
  assert.equal(exitCode, 0, stderr || "browser process failed");
  assert.match(stdout, /id="browser-result" data-status="pass"/);
  assert.match(stdout, /"health":200/);
  assert.match(stdout, /"validation":400/);
  console.log("PASS browser/API flow: browser-origin fetch, CORS, health, and safe validation error");
} finally {
  if (browser && !browser.killed) browser.kill("SIGTERM");
  if (fixtureServer) await new Promise((resolve) => fixtureServer.close(resolve));
  if (apiServer) await new Promise((resolve) => apiServer.close(resolve));
}
