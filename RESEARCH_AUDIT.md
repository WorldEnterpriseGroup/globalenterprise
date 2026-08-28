# Evidence audit

Audited 30 articles in `src/content/insights/` for stale evidence and repeated quantified claims.

## Findings

The previous library concentrated evidence in a small set of studies:

- NIST AI Risk Management Framework: 7 insight articles.
- GAO legacy-systems review: 4 articles.
- Stanford HAI AI Index economy chapter and its adoption statistic: 3 articles.
- DOE/NREL clean-electricity scenario and DOE grid-project material: 3 articles each.
- World Economic Forum workforce material: 3 articles.
- OMB, CISA, GAO federal AI requirements, and CISA Zero Trust material: 2 articles each.

The repetition was not only a citation problem. It made several unrelated arguments sound like variations on the same headline: AI adoption, legacy modernization, workforce skills, and grid scale were repeatedly treated as the primary proof point.

## Remediation

The library was revised with distinct research and a more specific consulting implication:

- AI operating-model articles now draw on DOE, NATO, FDA, OECD, and current public-data infrastructure as separate lenses for delivery, assurance, skills, and scale.
- Clinical AI now separates workflow design and safety assurance (AHRQ and ONC) from postmarket performance and drift (FDA).
- Digital infrastructure and resilience now use current DOE grid, AI, data-center, and storage signals alongside FEMA for distinct operating questions.
- Workforce articles now use OECD AI-and-skills work for capability design.
- Federal/public-service articles now connect current Data.gov, UN, NATO, and service-management evidence.
- Platform, supplier, and responsible-AI articles now use NATO, NIST, and FDA material for distinct operating questions.
- The flagship 2035 article combines DOE, UN, NATO, and Data.gov into an original long-horizon thesis.
- The international cluster now adds cross-border operating-model, regional context, distributed leadership, AI sovereignty, and resilience perspectives without inventing local offices, clients, metrics, or regional outcomes.

After remediation, the insight library has zero cross-article duplicate quantified claims and zero stale pre-August 2026 references. Shared primary sources are intentionally reused when they establish a different domain constraint; the check reports those overlaps for editorial review instead of confusing citation reuse with repeated reasoning.

## Regression check

Run:

```sh
node scripts/audit-evidence.mjs
```

The check exits non-zero if a quantified claim is reused by multiple insight articles or if a stale pre-August 2026 reference returns. Shared source URLs are printed as a review queue. The broader site also contains shared evidence cards and service-page references; those are separate marketing/navigation surfaces and should be audited independently when the parallel site migration work lands.
