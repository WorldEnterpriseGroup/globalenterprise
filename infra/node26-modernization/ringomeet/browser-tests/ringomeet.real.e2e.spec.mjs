import { once } from "node:events";
import http from "node:http";

import { expect, test } from "@playwright/test";

const baseUrl = (process.env.RINGOMEET_BASE_URL || "https://ringomeet-node26.happyrock-d12daa4c.eastus.azurecontainerapps.io").replace(/\/$/, "");
const allowedOrigin = (process.env.RINGOMEET_ALLOWED_ORIGIN || "https://www.globalenterprise.com").replace(/\/$/, "");
const liveWrites = process.env.RINGOMEET_E2E_WRITE === "1";

test.setTimeout(90_000);
test.describe.configure({ mode: "serial" });

let originServer;
let originUrl;

test.beforeAll(async () => {
  originServer = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end("<!doctype html><title>RingoMeet browser origin</title><main>browser origin</main>");
  }).listen(0, "127.0.0.1");
  await once(originServer, "listening");
  originUrl = `http://127.0.0.1:${originServer.address().port}`;
});

test.afterAll(() => originServer?.close());

async function fetchFromPage(page, path, options = {}) {
  return page.evaluate(async ({ baseUrl: endpoint, path: requestPath, options: requestOptions }) => {
    const response = await fetch(`${endpoint}${requestPath}`, requestOptions);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("json") ? await response.json() : await response.text();
    return {
      status: response.status,
      body,
      headers: {
        accessControlAllowOrigin: response.headers.get("access-control-allow-origin"),
        requestId: response.headers.get("x-request-id")
      }
    };
  }, { baseUrl, path, options });
}

async function openApp(page, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 45_000 });
}

test("loads the recovered SPA from the real Node 26 endpoint", async ({ page }) => {
  await openApp(page);

  await expect(page.locator("#root")).toBeVisible();
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 45_000 });
  await expect(page.getByRole("textbox").first()).toBeVisible({ timeout: 45_000 });
  expect(await page.title()).toMatch(/home|calling sample/i);

  const health = await fetchFromPage(page, "/healthz");
  expect(health.status).toBe(200);
  expect(health.body.service).toBe("ringomeet");
  expect(health.body.runtime).toMatch(/^v26\./);
});

test("keeps an actionable SPA surface when camera and microphone are denied", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const denied = (name) => ({ name, state: "denied", onchange: null });
    const originalQuery = navigator.permissions?.query?.bind(navigator.permissions);
    if (originalQuery) {
      navigator.permissions.query = (descriptor) => {
        if (descriptor?.name === "camera" || descriptor?.name === "microphone") return Promise.resolve(denied(descriptor.name));
        return originalQuery(descriptor);
      };
    }
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException("The user denied media access", "NotAllowedError");
      };
    }
  });

  await openApp(page);
  const permissionState = await page.evaluate(async () => ({
    camera: (await navigator.permissions.query({ name: "camera" })).state,
    microphone: (await navigator.permissions.query({ name: "microphone" })).state,
    mediaDenied: await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(() => false).catch((error) => error.name === "NotAllowedError")
  }));

  expect(permissionState).toEqual({ camera: "denied", microphone: "denied", mediaDenied: true });
  expect(pageErrors).toEqual([]);
  await expect(page.locator("#root")).not.toBeEmpty();
  await context.close();
});

test("shows a degraded, actionable state when the token request fails", async ({ page }) => {
  await page.route("**/*", (route) => {
    if (new URL(route.request().url()).pathname === "/token") return route.abort("failed");
    return route.continue();
  });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });

  await page.getByRole("textbox").first().fill("RingoMeet degraded-mode test");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText(/Error getting user credentials from server/i)).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText(/Ensure the sample server is running/i)).toBeVisible();
});

test("issues a browser-origin token and exposes readiness", async ({ page }) => {
  await openApp(page);

  const ready = await fetchFromPage(page, "/readyz");
  expect(ready.status).toBe(200);
  expect(ready.body).toMatchObject({ status: "ready", service: "ringomeet" });

  const token = await fetchFromPage(page, "/token?scope=chat,voip");
  expect(token.status).toBe(200);
  expect(token.body.token).toMatch(/^ey[A-Za-z0-9_-]+\./);
  expect(token.body.user.communicationUserId).toMatch(/^8:/);
  expect(token.headers.requestId).toBeTruthy();
});

test("refreshes a browser identity after a page reload", async ({ page }) => {
  await openApp(page);

  const issued = await fetchFromPage(page, "/token?scope=chat");
  expect(issued.status).toBe(200);
  const userId = issued.body.user.communicationUserId;

  const refreshed = await fetchFromPage(page, `/refreshToken/${encodeURIComponent(userId)}`, { method: "POST" });
  expect(refreshed.status).toBe(200);
  expect(refreshed.body.user.communicationUserId).toBe(userId);
  expect(refreshed.body.token).toMatch(/^ey[A-Za-z0-9_-]+\./);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 45_000 });
  const refreshedAfterReload = await fetchFromPage(page, `/refreshToken/${encodeURIComponent(userId)}`, { method: "POST" });
  expect(refreshedAfterReload.status).toBe(200);
  expect(refreshedAfterReload.body.user.communicationUserId).toBe(userId);
});

test("allows the configured public browser origin and blocks an untrusted browser origin", async ({ browser, page }) => {
  await page.goto(allowedOrigin, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const browserOrigin = new URL(page.url()).origin;
  const allowedResponsePromise = page.waitForResponse((response) => response.url() === `${baseUrl}/readyz` && response.request().method() === "GET");
  const allowed = await page.evaluate(async ({ endpoint }) => {
    const response = await fetch(`${endpoint}/readyz`, { headers: { "X-Request-Id": "ringomeet-browser-cors" } });
    return { status: response.status, body: await response.json() };
  }, { endpoint: baseUrl });
  const allowedResponse = await allowedResponsePromise;
  expect(allowed).toEqual({ status: 200, body: { status: "ready", service: "ringomeet" } });
  expect(allowedResponse.headers()["access-control-allow-origin"]).toBe(browserOrigin);

  const untrustedContext = await browser.newContext();
  const untrustedPage = await untrustedContext.newPage();
  await untrustedPage.goto(originUrl);
  const blocked = await untrustedPage.evaluate(async (endpoint) => {
    try {
      await fetch(`${endpoint}/readyz`, { headers: { "X-Request-Id": "ringomeet-browser-cors" } });
      return { blocked: false };
    } catch (error) {
      return { blocked: true, name: error.name };
    }
  }, baseUrl);
  expect(blocked.blocked).toBe(true);
  expect(blocked.name).toBe("TypeError");
  await untrustedContext.close();
});

test("keeps the calling surface usable at a mobile viewport", async ({ page }) => {
  await openApp(page, { width: 390, height: 844 });

  await expect(page.locator("#root")).toBeVisible();
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 45_000 });
  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    rootWidth: document.querySelector("#root")?.scrollWidth || 0
  }));
  expect(layout.viewportWidth).toBe(390);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  expect(layout.rootWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
});

test("creates a thread and adds a participant through the real ACS path", async ({ page }) => {
  test.skip(!liveWrites, "Set RINGOMEET_E2E_WRITE=1 to create disposable ACS test data.");
  await openApp(page);

  const participant = await fetchFromPage(page, "/token?scope=chat");
  expect(participant.status).toBe(200);
  const participantId = participant.body.user.communicationUserId;

  const created = await fetchFromPage(page, "/createThread", { method: "POST" });
  expect(created.status).toBe(200);
  expect(created.body).toMatch(/\S/);
  const threadId = created.body.trim();

  const added = await fetchFromPage(page, `/addUser/${encodeURIComponent(threadId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Id: participantId, DisplayName: `Playwright RingoMeet ${Date.now()}` })
  });
  expect(added.status).toBe(201);
});
