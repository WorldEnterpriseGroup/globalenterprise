# Release provenance handoff

The GitLab `mirror` job pushes the GitLab `gh-pages` commit to GitHub without
rewriting the source commit, then publishes a unique annotated release tag
containing a detached Ed25519 receipt. The GitHub Pages workflow listens only
for those tags and accepts a release only when the tag binds the exact commit
and the signed receipt verifies.

Configure the signing key once before the first mirrored release:

- `GITLAB_PROVENANCE_PUBLIC_KEY` (GitHub Actions variable): the PEM-encoded
  Ed25519 public key used to verify the GitLab signer.
- `GITLAB_PROVENANCE_PRIVATE_KEY_B64` (protected, masked GitLab CI variable):
  the base64-encoded matching PEM private key. It is decoded only in the
  GitLab mirror job.
- The two receipt values are carried in the annotated tag and are not stored as
  long-lived GitHub secrets. A manual `workflow_dispatch` may still provide
  them as emergency inputs.

The GitLab-controlled handoff refreshes the assertion and signature for each
mirrored commit. The receipt has this schema:

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

Missing inputs, a stale or arbitrary SHA, a tag that does not name the received
commit, an altered field, an untrusted key, or an invalid signature fails the
Pages build before dependencies are installed.
The receipt and signature are not printed by the audit. Keep the private
signing key in GitLab protected CI storage and never commit it or place it in a
workflow file.

The Cloudflare edge reconciler supports the same contract for both sites. Run
`CLOUDFLARE_SITE_PROFILE=hardmagic` for HardMagic; the default profile is
`globalenterprise`. The all-zone baseline remains available with the
`--all-zones` CLI flag and is intentionally separate from site-specific
content-security policies.

For a direct, network-backed check outside GitHub Actions, provide an explicit
SHA rather than relying on an ambient CI variable:

```bash
RELEASE_SHA=<full-commit-sha> npm run audit:provenance
```
