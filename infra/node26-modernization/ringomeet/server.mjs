import crypto from "node:crypto";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultBuildDir = path.join(here, "build");

const splitList = (value) => new Set(String(value || "").split(",").map((item) => item.trim()).filter(Boolean));

export function readConfig(env = process.env) {
  const endpoint = env.ACS_ENDPOINT || env.EndpointUrl || "";
  const connectionString = env.ACS_CONNECTION_STRING || env.ResourceConnectionString || "";
  const adminUserId = env.ACS_ADMIN_USER_ID || env.AdminUserId || "";
  const allowedOrigins = splitList(env.CORS_ORIGINS || "https://globalenterprise.com,https://www.globalenterprise.com");

  if (endpoint) {
    const parsed = new URL(endpoint);
    if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
      throw new Error("ACS endpoint must be a clean HTTP(S) origin");
    }
  }

  return {
    endpoint: endpoint.replace(/\/$/, ""),
    connectionString,
    adminUserId,
    allowedOrigins,
    port: Number.parseInt(env.PORT || "8080", 10),
    rateLimitPerMinute: Number.parseInt(env.TOKEN_RATE_LIMIT_PER_MINUTE || "30", 10)
  };
}

function requireConfig(config) {
  if (!config.connectionString) throw new Error("ACS connection string is not configured");
  if (!config.endpoint) throw new Error("ACS endpoint is not configured");
  if (!config.adminUserId) throw new Error("ACS admin user ID is not configured");
}

function normalizeScopes(value) {
  const requested = String(value || "voip").split(",").map((scope) => scope.trim()).filter(Boolean);
  const scopes = requested.length ? requested : ["voip"];
  if (!scopes.every((scope) => scope === "chat" || scope === "voip")) {
    const error = new Error("Only chat and voip scopes are supported");
    error.statusCode = 400;
    throw error;
  }
  return [...new Set(scopes)];
}

function safeDisplayName(value) {
  if (value == null) return undefined;
  const displayName = String(value).trim();
  if (!displayName || displayName.length > 256) {
    const error = new Error("DisplayName must be between 1 and 256 characters");
    error.statusCode = 400;
    throw error;
  }
  return displayName;
}

function safeCommunicationUserId(value) {
  const id = String(value || "").trim();
  // ACS communication user IDs can contain the `8:acs:` namespace plus
  // resource-scoped separators such as `:` and `_`.
  if (!/^8:[a-z0-9:_-]{8,}$/i.test(id)) {
    const error = new Error("Invalid ACS communication user ID");
    error.statusCode = 400;
    throw error;
  }
  return id;
}

function createRateLimiter(limit, windowMs = 60_000) {
  const buckets = new Map();
  return (request, response, next) => {
    const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
    const key = forwarded || request.socket.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) {
      buckets.set(key, { startedAt: now, count: 1 });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > limit) {
      response.setHeader("Retry-After", Math.ceil((windowMs - (now - bucket.startedAt)) / 1000));
      return response.status(429).json({ error: "Too many requests" });
    }
    return next();
  };
}

function requestId(request, response) {
  const id = String(request.headers["x-request-id"] || "").trim().slice(0, 128) || crypto.randomUUID();
  response.setHeader("X-Request-Id", id);
  return id;
}

export function createApp({ config = readConfig(), buildDir = defaultBuildDir } = {}) {
  const app = express();
  const identityClient = config.connectionString ? new CommunicationIdentityClient(config.connectionString) : null;
  const limiter = createRateLimiter(config.rateLimitPerMinute);
  const adminUser = () => ({ communicationUserId: safeCommunicationUserId(config.adminUserId) });
  const token = async (user, scopes) => identityClient.getToken(user, scopes);

  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use((request, response, next) => {
    request.requestId = requestId(request, response);
    response.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Request-Id"],
    maxAge: 600
  }));
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: false, limit: "32kb" }));

  app.get("/healthz", (_request, response) => response.json({ status: "ok", service: "ringomeet", runtime: process.version }));
  app.get("/readyz", (_request, response) => {
    try {
      requireConfig(config);
      return response.json({ status: "ready", service: "ringomeet" });
    } catch (error) {
      return response.status(503).json({ status: "not-ready", error: error.message });
    }
  });

  app.post("/token", limiter, async (request, response, next) => {
    try {
      requireConfig(config);
      const scopes = normalizeScopes(request.body?.scope || request.query.scope || "voip");
      response.json(await identityClient.createUserAndToken(scopes));
    } catch (error) {
      next(error);
    }
  });

  app.get("/token", limiter, async (request, response, next) => {
    try {
      requireConfig(config);
      const scopes = normalizeScopes(request.query.scope || "voip");
      response.json(await identityClient.createUserAndToken(scopes));
    } catch (error) {
      next(error);
    }
  });

  app.post("/refreshToken/:id", limiter, async (request, response, next) => {
    try {
      requireConfig(config);
      const user = { communicationUserId: safeCommunicationUserId(request.params.id) };
      response.json({ user, ...(await token(user, ["chat", "voip"])) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/getEndpointUrl", (_request, response) => {
    try {
      requireConfig(config);
      response.type("text/plain").send(config.endpoint);
    } catch (error) {
      response.status(503).json({ error: error.message });
    }
  });

  app.post("/createThread", limiter, async (request, response, next) => {
    try {
      requireConfig(config);
      const user = adminUser();
      const credential = new AzureCommunicationTokenCredential({
        tokenRefresher: async () => (await token(user, ["chat", "voip"])).token,
        // These credentials are scoped to one short server-side operation;
        // avoid scheduling a long-lived proactive-refresh timer per request.
        refreshProactively: false
      });
      const chatClient = new ChatClient(config.endpoint, credential);
      const result = await chatClient.createChatThread({ topic: "Your Chat sample" }, {
        participants: [{ id: user }]
      });
      const threadId = result.chatThread?.id;
      if (!threadId) throw new Error("ACS did not return a chat thread ID");
      response.send(threadId);
    } catch (error) {
      next(error);
    }
  });

  app.post("/addUser/:threadId", limiter, async (request, response, next) => {
    try {
      requireConfig(config);
      const threadId = String(request.params.threadId || "").trim();
      if (!threadId || threadId.length > 256) {
        const error = new Error("Invalid chat thread ID");
        error.statusCode = 400;
        throw error;
      }
      const id = safeCommunicationUserId(request.body?.Id || request.body?.id);
      const displayName = safeDisplayName(request.body?.DisplayName || request.body?.displayName);
      const user = adminUser();
      const credential = new AzureCommunicationTokenCredential({
        tokenRefresher: async () => (await token(user, ["chat", "voip"])).token,
        refreshProactively: false
      });
      const chatThreadClient = await new ChatClient(config.endpoint, credential).getChatThreadClient(threadId);
      await chatThreadClient.addParticipants({ participants: [{ id: { communicationUserId: id }, ...(displayName ? { displayName } : {}) }] });
      response.sendStatus(201);
    } catch (error) {
      next(error);
    }
  });

  const userConfig = new Map();
  app.post("/userConfig/:userId", (request, response) => {
    const userId = safeCommunicationUserId(request.params.userId);
    const emoji = String(request.body?.Emoji || request.body?.emoji || "").trim().slice(0, 16);
    const threadId = String(request.body?.threadId || request.body?.ThreadId || "").trim().slice(0, 256);
    userConfig.set(userId, { emoji, id: threadId });
    response.sendStatus(200);
  });
  app.get("/userConfig/:userId", (request, response) => {
    const userId = safeCommunicationUserId(request.params.userId);
    response.json(userConfig.get(userId) || null);
  });

  app.use(express.static(buildDir, { index: "index.html", redirect: false }));
  app.get(/.*/, (_request, response) => response.sendFile(path.join(buildDir, "index.html")));

  app.use((error, request, response, _next) => {
    const status = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 500;
    if (status >= 500) console.error(JSON.stringify({ requestId: request.requestId, error: error.name || "Error", message: error.message }));
    response.status(status).json({ error: status >= 500 ? "The request could not be completed" : error.message, requestId: request.requestId });
  });

  return app;
}

export function start(options = {}) {
  const config = options.config || readConfig();
  const server = http.createServer(createApp({ ...options, config }));
  server.listen(config.port, "0.0.0.0", () => console.log(`ringomeet listening on ${config.port}`));
  const close = () => server.close(() => process.exit(0));
  process.once("SIGTERM", close);
  process.once("SIGINT", close);
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) start();
