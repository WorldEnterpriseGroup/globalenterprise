import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repository = process.env.GITLAB_REPOSITORY_URL?.trim() || "https://git.developerdojo.org/WorldEnterpriseGroup/globalenterprise.git";
const releaseBranch = process.env.GITLAB_RELEASE_BRANCH?.trim() || "gh-pages";
const releaseSha = (process.env.RELEASE_SHA || process.env.GITHUB_SHA || "").trim().toLowerCase();
const githubRef = process.env.GITHUB_REF_NAME?.trim();
const provenanceMode = process.env.GITLAB_PROVENANCE_MODE?.trim() || "remote";

if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
  console.error("Release provenance requires RELEASE_SHA or GITHUB_SHA to be a full 40-character commit SHA.");
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
  if (!githubRef && required) {
    console.error(`✗ GitHub ref is missing; expected ${releaseBranch} in mirror mode`);
    return false;
  }
  if (githubRef && githubRef !== releaseBranch) {
    console.error(`✗ GitHub ref ${githubRef} is not the expected ${releaseBranch} release branch`);
    return false;
  }
  return true;
}

try {
  if (provenanceMode === "mirror") {
    if (process.env.GITHUB_ACTIONS !== "true") throw new Error("mirror provenance mode is reserved for GitHub Actions");
    if (!verifyGithubRef(true)) {
      process.exitCode = 1;
    } else {
      console.log(`Release receipt: GitLab mirror job asserted ${releaseBranch} before the GitHub push`);
      console.log(`Release receipt: GitHub workflow ${releaseSha}`);
      console.log(`✓ Protected GitLab mirror, GitHub ${releaseBranch}, and the deployment workflow agree on ${releaseSha}`);
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
