# Evidence audit

The audit snapshot covered the 22 insight articles present in the shared working tree on August 10, 2026. It checked repeated source URLs and repeated quantified claims.

## Findings

The original library concentrated evidence in a small set of studies:

- NIST AI Risk Management Framework: 7 insight articles.
- GAO legacy-systems review (GAO-25-107795): 4 articles.
- Stanford HAI 2026 AI Index economy chapter and its 88% adoption statistic: 3 articles.
- DOE/NREL clean-electricity scenario and DOE grid-project material: 3 articles each.
- World Economic Forum Future of Jobs 2025: 3 articles.
- OMB M-24-10, CISA Performance Goals, GAO federal AI requirements, and CISA Zero Trust Maturity Model: 2 articles each.

The repetition was not only a citation problem. It made several unrelated arguments sound like variations on the same headline: AI adoption, legacy modernization, workforce skills, and grid scale were repeatedly treated as the primary proof point.

## Remediation

The isolated commit revises 10 tracked articles with distinct research and a more specific consulting implication:

- AI adoption and operating models now use Stanford HAI, the U.S. Census Bureau, and MIT CISR as separate lenses for adoption, diffusion depth, and enterprise platform design.
- Clinical AI now separates postmarket performance and drift (FDA) from workflow design and safety assurance in the parallel article work.
- Digital infrastructure and resilience now use distinct evidence rather than reusing DOE/NREL scenarios.
- Workforce articles now use OECD research for access and skills matching rather than repeating WEF.
- Public-service, supplier, responsible-AI, and execution arguments now use distinct operating guidance and research.
- The cost-of-unclear article now uses MIT CISR’s digital operating-model research instead of repeating the GAO legacy-systems review.

After the full working-tree remediation, the insight library has zero cross-article duplicate source URLs and zero exact duplicate quantified claims. Repetition inside an individual article between inline links, its bibliography, and the shared source panel is intentional citation presentation, not reuse of a study across articles.

## Regression check

Run:

```sh
node scripts/audit-evidence.mjs
```

The check exits non-zero if a source URL or quantified claim is reused by multiple insight articles. The broader site also contains shared evidence cards and service-page references; those are separate marketing/navigation surfaces and should be audited independently when the parallel site migration work lands.
