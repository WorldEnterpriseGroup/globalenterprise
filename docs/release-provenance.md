# Release provenance handoff

The GitLab `mirror` job pushes the GitLab `gh-pages` commit to GitHub without
rewriting the source commit. The GitHub Pages workflow accepts that push only
when the GitLab release handoff provides a signed receipt for the exact commit.

Configure these protected GitHub repository inputs before the Pages workflow is
allowed to run. A manual `workflow_dispatch` may provide the assertion and
signature as run inputs instead of using the two repository secrets:

- `GITLAB_PROVENANCE_PUBLIC_KEY` (Actions variable): the PEM-encoded Ed25519
  public key used to verify the GitLab signer.
- `GITLAB_PROVENANCE_ASSERTION` (Actions secret): canonical JSON for the
  current mirror commit.
- `GITLAB_PROVENANCE_SIGNATURE` (Actions secret): the detached Ed25519
  signature over the canonical assertion, encoded as base64url.

The GitLab-controlled handoff must refresh the assertion and signature for
each mirrored commit. The receipt has this schema:

```json
{
  "version": 1,
  "issuer": "gitlab-ci",
  "repository": "WorldEnterpriseGroup/globalenterprise",
  "ref": "refs/heads/gh-pages",
  "sha": "<40-character-lowercase-commit-sha>",
  "pipeline_id": "<positive-gitlab-pipeline-id>",
  "job_id": "<positive-gitlab-job-id>"
}
```

The signer signs the assertion after recursively sorting object keys and
serializing it as compact JSON. The audit compares the signed `sha`, repository,
and ref with the received release context, then verifies the Ed25519 signature.
It does not use `GITHUB_SHA` or a branch name as a provenance assertion.

Missing inputs, a stale or arbitrary SHA, an altered field, an untrusted key, or
an invalid signature fails the Pages build before dependencies are installed.
The receipt and signature are not printed by the audit. Keep the private
signing key in GitLab protected CI storage and never commit it or place it in a
workflow file.

For a direct, network-backed check outside GitHub Actions, provide an explicit
SHA rather than relying on an ambient CI variable:

```bash
RELEASE_SHA=<full-commit-sha> npm run audit:provenance
```
