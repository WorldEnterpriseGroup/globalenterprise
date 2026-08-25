# Production edge security

`public/_headers` is the source-of-truth contract for the static artifact, but GitHub Pages does not apply that file as an HTTP header policy. The production CDN/DNS edge must mirror it.

Run the repository check before deployment:

```bash
npm run audit:security
```

Run the live check after the edge configuration changes:

```bash
LIVE_SITE_URL=https://globalenterprise.com npm run audit:security
```

The live check exposes any remaining deployment gap at the CDN/DNS edge. GitHub Pages can publish the artifact, but it cannot apply `public/_headers`; the production edge must mirror the contract before the live check can pass. This is an edge configuration task, not an Astro source change.

The edge should mirror these response headers on HTML and static assets:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-Frame-Options: SAMEORIGIN` (the compact visual sitemap uses a same-origin preview frame)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Permitted-Cross-Domain-Policies: none`
- The CSP in `public/_headers`, including the current `formsubmit.co` form action and Plausible endpoints.

The shipped CSP has no executable `script-src 'unsafe-inline'` allowance. Analytics and interaction code are external assets; JSON-LD remains data, not executable JavaScript. Inline styles are still permitted because Astro pages intentionally use component-scoped style blocks and a small number of inline style attributes. The built-output audit rejects executable inline scripts before deployment.
