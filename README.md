# Global Enterprise

The Global Enterprise website, rebuilt as an original Astro 7 and Tailwind 4 static site inspired by the Looka corporate consulting theme.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run check
npm run build
npm run preview
```

The build is fully prerendered and deploys to GitHub Pages through `.github/workflows/deploy.yml`. The `public/CNAME` file preserves `globalenterprise.com` for Pages deployments. The Pages environment is intentionally gated to the `gh-pages` branch; the workflow mirrors that policy.

## Site capabilities

- Astro 7 static output with View Transitions and viewport prefetching
- Tailwind CSS 4 via the official Vite plugin
- Typed content collections for services, case studies, and insights
- MDX integration, RSS feed, sitemap, robots directives, canonical URLs, Open Graph, and ProfessionalService JSON-LD
- Responsive navigation, keyboard-visible focus states, reduced-motion support, accessible forms, and a custom 404
- Looka-style full-width exploration panel with complete capability, industry, company, work, and insight destinations
- Evidence-led editorial content grounded in public GAO, NIST, OMB, ONC, Stanford HAI, Verizon, CISA, and World Economic Forum sources
- Focused solution pages at `/solutions/` for enterprise AI, modernization, operating model, and healthcare transformation
- Privacy-first Plausible analytics with CTA, form, diagnostic, insight, and solution events
- Visual sitemap at `/visual-sitemap/` plus a live-preview compact map at `/visual-sitemap/compact.html`
- Public proof and trust surfaces at `/proof/` and `/trust/`, with abstract portfolio evidence and explicit data boundaries
- Edge-ready security headers in `public/_headers` and a public vulnerability-reporting path at `/.well-known/security.txt`; GitHub Pages requires these headers to be mirrored in the production edge/CDN

## Rendering and motion

The site is fully prerendered and uses no deployment adapter. `src/layouts/Base.astro` owns the document shell; route files and content collections remain server-rendered HTML with only small native-browser scripts for useful interaction.

`src/components/MotionSystem.astro` progressively adds the site-wide motion language. It discovers each route's editorial scenes, reveals primary content in reading order, staggers compact lists, art-directs media entrances, and updates the page progress cue. Keep route markup semantic and section-based so new pages inherit the system without motion-specific component props.

Motion is never required to read or use the site:

- without JavaScript, no motion attributes are added and all content stays visible;
- with `prefers-reduced-motion: reduce`, every scene is immediately visible and the ambient motion is suppressed;
- the observer disconnects and re-scans after Astro client navigation;
- long sections use a near-zero intersection threshold so an oversized index or article cannot remain hidden.

Use `data-motion-skip` on a direct scene item only when an element must not be animated. Avoid adding independent scroll libraries or one-off entrance effects unless the shared system cannot express a real editorial need.

## Layout and media contracts

The shared `--space-section` token controls major vertical rhythm. `IntelligenceStack.astro` owns its own section spacing, so place it inside a tone and container wrapper without adding `section-pad` to the wrapper. The production audit rejects that double-padding pattern.

`AssetImage.astro` emits responsive AVIF source sets for local editorial media. `MediaInterlude.astro` and `StartingPoint.astro` own the displayed aspect ratio of those images. Use the named `wide`, `cinematic`, or `tall` ratios to match the editorial column and use `position` on `MediaInterlude` to preserve the subject at narrow crops. Do not add filler photography to compensate for spacing or an unsuitable crop; fix the layout contract or art direction instead.

The regular and bold interface fonts are preloaded in `Base.astro` to prevent headline reflow during the first render. Keep intrinsic `width` and `height` on every image and reserve `loading="eager"` for above-the-fold media.

## Verification

```bash
npm run check
npm run build
npm run audit:evidence
node scripts/audit-site.mjs
npm run audit:live
```

The production audit requires the progressive motion runtime on every generated HTML route in addition to the existing heading, SEO, link, media, diagram, content, and sitemap checks. Browser review should cover normal motion, reduced motion, JavaScript disabled, keyboard focus, 320–390px mobile widths, and a production-build scroll through each route family.

`npm run audit:live` is a post-deploy smoke check for the primary public routes. Set `LIVE_SITE_URL` when validating a preview or alternate origin.
