import { createPublicKey, verify as verifySignature } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repository = process.env.GITLAB_REPOSITORY_URL?.trim() || "https://git.developerdojo.org/WorldEnterpriseGroup/globalenterprise.git";
const expectedRepository = process.env.GITLAB_REPOSITORY_PATH?.trim() || "WorldEnterpriseGroup/globalenterprise";
const releaseBranch = process.env.GITLAB_RELEASE_BRANCH?.trim() || "gh-pages";
const releaseSha = (process.env.RELEASE_SHA || "").trim().toLowerCase();
const githubRef = process.env.GITHUB_REF_NAME?.trim();
const githubRefType = process.env.GITHUB_REF_TYPE?.trim();
const githubEvent = process.env.GITHUB_EVENT_NAME?.trim();
const provenanceMode = process.env.GITLAB_PROVENANCE_MODE?.trim() || "remote";

if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
  console.error("Release provenance requires an explicit RELEASE_SHA containing a full 40-character commit SHA.");
  process.exit(2);
}
if (!["remote", "mirror"].includes(provenanceMode)) {
  console.error(`Release provenance mode must be remote or mirror, received ${provenanceMode}.`);
  process.exit(2);
}

async function remoteBranchSha(branch) {
  try {
    const { stdout } = await exec("git", ["ls-remote", repository, `refs/heads/${branch}`], {
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    const [sha] = stdout.trim().split(/\s+/);
    if (!/^[0-9a-f]{40}$/.test(sha || "")) throw new Error(`branch ${branch} did not return a commit SHA`);
    return sha;
  } catch (error) {
    throw new Error(`could not read GitLab ${branch}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function verifyGithubRef(required = false) {
  if (provenanceMode === "mirror") {
    if (githubRefType === "tag") {
      const match = githubRef?.match(/^release-provenance-([0-9a-f]{40})-[1-9][0-9]*-[1-9][0-9]*$/i);
      if (!match || match[1].toLowerCase() !== releaseSha) {
        console.error(`✗ GitHub provenance tag ${githubRef || "(missing)"} does not bind ${releaseSha}`);
        return false;
      }
      return true;
    }
    if (githubEvent === "workflow_dispatch" && githubRef === releaseBranch) return true;
    if (required) {
      console.error(`✗ GitHub mirror ref must be a signed release tag or a manual ${releaseBranch} dispatch`);
      return false;
    }
    return true;
  }
  if (!githubRef && required) {
    console.error(`✗ GitHub ref is missing; expected ${releaseBranch}`);
    return false;
  }
  if (githubRef && githubRef !== releaseBranch) {
    console.error(`✗ GitHub ref ${githubRef} is not the expected ${releaseBranch} release branch`);
    return false;
  }
  return true;
}

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error("assertion contains a non-finite number");
  if (value === undefined) throw new Error("assertion contains an unsupported undefined value");
  return JSON.stringify(value);
}

function decodeSignature(encoded) {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)) throw new Error("GitLab provenance signature is not valid base64");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const signature = Buffer.from(padded, "base64");
  if (signature.length !== 64) throw new Error("GitLab provenance signature must be an Ed25519 signature");
  return signature;
}

function verifyGitlabAssertion() {
  const rawAssertion = process.env.GITLAB_PROVENANCE_ASSERTION?.trim();
  const encodedSignature = process.env.GITLAB_PROVENANCE_SIGNATURE?.trim();
  const publicKeyValue = process.env.GITLAB_PROVENANCE_PUBLIC_KEY?.trim();

  if (!rawAssertion) throw new Error("mirror provenance requires GITLAB_PROVENANCE_ASSERTION");
  if (!encodedSignature) throw new Error("mirror provenance requires GITLAB_PROVENANCE_SIGNATURE");
  if (!publicKeyValue) throw new Error("mirror provenance requires GITLAB_PROVENANCE_PUBLIC_KEY");

  let assertion;
  try {
    assertion = JSON.parse(rawAssertion);
  } catch {
    throw new Error("GitLab provenance assertion is not valid JSON");
  }
  if (!assertion || typeof assertion !== "object" || Array.isArray(assertion)) {
    throw new Error("GitLab provenance assertion must be a JSON object");
  }

  if (assertion.version !== 1) throw new Error("GitLab provenance assertion version is unsupported");
  if (assertion.issuer !== "gitlab-ci") throw new Error("GitLab provenance assertion issuer is not GitLab CI");
  if (assertion.repository !== expectedRepository) throw new Error("GitLab provenance assertion repository does not match");
  if (assertion.ref !== `refs/heads/${releaseBranch}`) throw new Error("GitLab provenance assertion ref does not match");
  if (!/^[0-9a-f]{40}$/i.test(assertion.sha || "") || assertion.sha.toLowerCase() !== releaseSha) {
    throw new Error("GitLab provenance assertion SHA does not match RELEASE_SHA");
  }
  for (const field of ["pipeline_id", "job_id"]) {
    if (!/^[1-9][0-9]*$/.test(String(assertion[field] ?? ""))) {
      throw new Error(`GitLab provenance assertion ${field} is missing or invalid`);
    }
  }

  let publicKey;
  try {
    publicKey = createPublicKey(publicKeyValue);
  } catch {
    throw new Error("GitLab provenance public key is invalid");
  }
  if (publicKey.asymmetricKeyType !== "ed25519") throw new Error("GitLab provenance public key must be Ed25519");

  const signature = decodeSignature(encodedSignature);
  if (!verifySignature(null, Buffer.from(canonicalize(assertion), "utf8"), publicKey, signature)) {
    throw new Error("GitLab provenance assertion signature verification failed");
  }

  return assertion;
}

try {
  if (provenanceMode === "mirror") {
    if (process.env.GITHUB_ACTIONS !== "true") throw new Error("mirror provenance mode is reserved for GitHub Actions");
    if (!verifyGithubRef(true)) {
      process.exitCode = 1;
    } else {
      const assertion = verifyGitlabAssertion();
      console.log(`Release receipt: signed GitLab ${assertion.repository} ${assertion.ref} ${assertion.sha.toLowerCase()}`);
      console.log(`Release receipt: GitHub workflow ${releaseSha}`);
      console.log(`✓ Signed GitLab mirror assertion, GitHub ${releaseBranch}, and the deployment workflow agree on ${releaseSha}`);
    }
  } else {
    const gitlabReleaseSha = await remoteBranchSha(releaseBranch);
    console.log(`Release receipt: GitLab ${releaseBranch} ${gitlabReleaseSha}`);
    console.log(`Release receipt: GitHub workflow ${releaseSha}`);
    verifyGithubRef();
    if (gitlabReleaseSha !== releaseSha) {
      console.error(`✗ GitLab ${releaseBranch} ${gitlabReleaseSha} does not match GitHub workflow ${releaseSha}`);
      process.exitCode = 1;
    } else {
      console.log(`✓ GitLab ${releaseBranch}, GitHub ${releaseBranch}, and the deployment workflow agree on ${releaseSha}`);
    }
  }
} catch (error) {
  console.error(`✗ Release provenance check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
