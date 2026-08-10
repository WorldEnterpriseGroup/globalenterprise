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

The build is fully prerendered and deploys to GitHub Pages through `.github/workflows/deploy.yml`. The `public/CNAME` file preserves `globalenterprise.com` for Pages deployments.

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
