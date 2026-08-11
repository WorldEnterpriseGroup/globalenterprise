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

The live check currently exposes the remaining deployment gap: the public site returns HSTS without `includeSubDomains`, plus no deployed `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, cross-origin policies, or CSP. This is an edge configuration task, not an Astro source change.

The edge should mirror these response headers on HTML and static assets:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Permitted-Cross-Domain-Policies: none`
- The CSP in `public/_headers`, including the current `formsubmit.co` form action and Plausible endpoints.

The current CSP has an explicit `'unsafe-inline'` warning because Astro emits inline analytics, JSON-LD, and interaction scripts. Removing that warning requires moving inline code to hashed or external assets and then updating the CSP as part of a separate controlled change.
