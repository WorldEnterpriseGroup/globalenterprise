import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const auditScript = fileURLToPath(new URL("./audit-release-provenance.mjs", import.meta.url));
const releaseSha = "a".repeat(40);
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" });

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function signedAssertion(sha = releaseSha) {
  const assertion = {
    version: 1,
    issuer: "gitlab-ci",
    repository: "WorldEnterpriseGroup/globalenterprise",
    ref: "refs/heads/gh-pages",
    sha,
    pipeline_id: "1001",
    job_id: "2002",
  };
  const signature = sign(null, Buffer.from(canonicalize(assertion)), privateKey).toString("base64url");
  return { assertion, signature };
}

function runAudit(overrides = {}) {
  const { assertion, signature } = signedAssertion();
  const environment = {
    ...process.env,
    GITHUB_ACTIONS: "true",
    GITHUB_REF_NAME: "gh-pages",
    GITLAB_PROVENANCE_MODE: "mirror",
    RELEASE_SHA: releaseSha,
    GITLAB_PROVENANCE_ASSERTION: JSON.stringify(assertion),
    GITLAB_PROVENANCE_SIGNATURE: signature,
    GITLAB_PROVENANCE_PUBLIC_KEY: publicKeyPem,
    ...overrides,
  };
  for (const [key, value] of Object.entries(environment)) {
    if (value === undefined) delete environment[key];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [auditScript], { env: environment, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("accepts a signed GitLab assertion and ignores GITHUB_SHA as an authority", async () => {
  const result = await runAudit({ GITHUB_SHA: "b".repeat(40) });
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Signed GitLab mirror assertion/);
});

test("rejects mirror mode when the signed assertion is missing", async () => {
  const result = await runAudit({ GITLAB_PROVENANCE_ASSERTION: undefined, GITLAB_PROVENANCE_SIGNATURE: undefined, GITHUB_SHA: releaseSha });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /GITLAB_PROVENANCE_ASSERTION/);
});

test("rejects a tampered assertion", async () => {
  const { assertion } = signedAssertion();
  assertion.pipeline_id = "1002";
  const result = await runAudit({ GITLAB_PROVENANCE_ASSERTION: JSON.stringify(assertion) });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /signature verification failed/);
});

test("rejects arbitrary GitHub SHA provenance", async () => {
  const result = await runAudit({ RELEASE_SHA: undefined, GITHUB_SHA: "c".repeat(40), GITLAB_PROVENANCE_ASSERTION: undefined, GITLAB_PROVENANCE_SIGNATURE: undefined });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /explicit RELEASE_SHA/);
});
