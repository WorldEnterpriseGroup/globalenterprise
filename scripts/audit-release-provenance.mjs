import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repository = process.env.GITLAB_REPOSITORY_URL?.trim() || "https://git.developerdojo.org/WorldEnterpriseGroup/globalenterprise.git";
const sourceBranch = process.env.GITLAB_SOURCE_BRANCH?.trim() || "demo";
const releaseBranch = process.env.GITLAB_RELEASE_BRANCH?.trim() || "gh-pages";
const releaseSha = (process.env.RELEASE_SHA || process.env.GITHUB_SHA || "").trim().toLowerCase();
const githubRef = process.env.GITHUB_REF_NAME?.trim();

if (!/^[0-9a-f]{40}$/.test(releaseSha)) {
  console.error("Release provenance requires RELEASE_SHA or GITHUB_SHA to be a full 40-character commit SHA.");
  process.exit(2);
}

async function remoteBranchSha(branch) {
  try {
    const { stdout } = await exec("git", ["ls-remote", repository, `refs/heads/${branch}`], { timeout: 15_000, maxBuffer: 1024 * 1024 });
    const [sha] = stdout.trim().split(/\s+/);
    if (!/^[0-9a-f]{40}$/.test(sha || "")) throw new Error(`branch ${branch} did not return a commit SHA`);
    return sha;
  } catch (error) {
    throw new Error(`could not read GitLab ${branch}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

try {
  const [sourceSha, gitlabReleaseSha] = await Promise.all([remoteBranchSha(sourceBranch), remoteBranchSha(releaseBranch)]);
  console.log(`Release receipt: GitLab ${sourceBranch} ${sourceSha}`);
  console.log(`Release receipt: GitLab ${releaseBranch} ${gitlabReleaseSha}`);
  console.log(`Release receipt: GitHub workflow ${releaseSha}`);
  if (githubRef && githubRef !== releaseBranch) {
    console.error(`✗ GitHub ref ${githubRef} is not the expected ${releaseBranch} release branch`);
    process.exitCode = 1;
  }
  if (gitlabReleaseSha !== releaseSha) {
    console.error(`✗ GitLab ${releaseBranch} ${gitlabReleaseSha} does not match GitHub workflow ${releaseSha}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ GitLab ${releaseBranch}, GitHub ${releaseBranch}, and the deployment workflow agree on ${releaseSha}`);
  }
} catch (error) {
  console.error(`✗ Release provenance check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
