# Production edge security

`public/_headers` is the source-of-truth contract for the static artifact, but GitHub Pages does not apply that file as an HTTP header policy. The production CDN/DNS edge must mirror it.

The artifact also includes `public/.nojekyll`. GitHub Pages uses its presence to preserve dot-prefixed metadata, including `/.well-known/security.txt`; the repository security audit fails if that preservation marker is removed.

Run the repository check before deployment:

```bash
npm run audit:security
```

Run the live check after the edge configuration changes:

```bash
LIVE_SITE_URL=https://globalenterprise.com npm run audit:security
```

The live check exposes any remaining deployment gap at the CDN/DNS edge. GitHub Pages can publish the artifact, but it cannot apply `public/_headers`; the production edge must mirror the contract before the live check can pass. This is an edge configuration task, not an Astro source change.

The repository includes an idempotent Cloudflare API helper for response-header rules. Preview the site-specific contract with `npm run edge:security -- --dry-run`, then run `CLOUDFLARE_API_TOKEN=… npm run edge:security` from a secure environment with `Transform Rules > Edit` and `Account Rulesets > Read` permissions. It resolves `globalenterprise.com`, creates or updates only the named response-header rule, uses the per-rule Ruleset API for existing rules, verifies the resulting owned rule, and verifies that every non-owned rule is unchanged. Never commit or paste the token into the repository or chat.

The global rollout is explicit: preview it with `npm run edge:security:global -- --dry-run`, then run `CLOUDFLARE_API_TOKEN=… npm run edge:security:global`. It enumerates every active zone visible to the token and adds the domain-neutral baseline (`X-Content-Type-Options`, `Referrer-Policy`, and `X-Permitted-Cross-Domain-Policies`) to each zone. The helper never deletes rulesets or rules; when a transform ruleset already exists, it preserves every existing rule and only appends or updates its own namespaced rule. Site-specific controls such as CSP, HSTS, framing, cross-origin isolation, and Permissions-Policy remain opt-in so a shared Cloudflare token does not break unrelated applications.

The production Cloudflare Insights/Web Analytics beacon is allowed narrowly by the CSP: `script-src` includes `https://static.cloudflareinsights.com`, and `connect-src` includes `https://cloudflareinsights.com` for the manually embedded beacon endpoint. Proxied automatic injection reports to the site origin (`'self'`). These are the only Cloudflare beacon origins added; `script-src` still has no inline execution allowance. Cloudflare Browser Insights should remain disabled while Plausible is the approved analytics system unless the production telemetry choice explicitly enables it. If it is disabled, remove the injected beacon at the Cloudflare setting or add a zone Configuration Rule with `disable_rum: true` and an all-request expression; that path requires `Zone > Config Rules > Edit`. After the edge rule and telemetry choice are applied, run `LIVE_SITE_URL=https://globalenterprise.com npm run audit:security` and a browser console check.

The edge should mirror these response headers on HTML and static assets:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-Frame-Options: SAMEORIGIN` (the compact visual sitemap uses a same-origin preview frame)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Permitted-Cross-Domain-Policies: none`
- The CSP in `public/_headers`, including the current `formsubmit.co` form action, Plausible endpoints, and the Cloudflare Insights beacon origins above.

The shipped CSP has no executable `script-src 'unsafe-inline'` allowance. Analytics and interaction code are external assets; JSON-LD remains data, not executable JavaScript. Inline styles are still permitted because Astro pages intentionally use component-scoped style blocks and a small number of inline style attributes. The built-output audit rejects executable inline scripts before deployment.

Astro pages also emit the same executable/resource directives as a document-level meta fallback because the current host is GitHub Pages. Browser-unsupported controls such as `frame-ancestors` remain HTTP-only; the fallback protects script execution in browsers but does not replace the production edge header.
