# Audience route and CTA matrix

Status: planning baseline  
Prepared: 2026-08-24  
Source: latest local static build plus public static assets

This is the exhaustive route-family matrix for the audience audit. Dynamic families enumerate every generated slug. A shared row means every URL listed in that row receives the same initial audience/CTA policy; page-specific metadata can add secondary audiences and related routes later.

## Mapping rules

| Field | Meaning |
| --- | --- |
| Audience | The first reader the page should orient; this does not exclude secondary readers. |
| Current move | The strongest existing CTA or next route observed in the current site. |
| Target move | The audience-aware CTA/pathway to add or clarify. |
| Preservation | `keep` means retain the existing URL/content; `canonicalize` means preserve the old URL while choosing a preferred discovery route; `utility` means retain for navigation, legal, confirmation, or distribution purposes. |

Pathway keys: `set-direction`, `design-architecture`, `run-service-change`, `specify-procure`, `research-teach-partner`, and `learn-join`.

## Core and utility routes

| Route | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/` | P0 national/federal leaders, international government, Fortune 500 leadership | Contact, reports, services, federal/public-service, operations | Add “Start with your role or mandate” → six pathways; retain executive CTA | keep |
| `/about/` | P0 mandate owners and economic buyers | Read thesis; contact | Add audience/pathway cards; retain principal conversation | keep |
| `/operations/` | P0 international government, multilateral, enterprise operations | Regional chapters; international mandate → contact | Add government/multilateral lens and set-direction route | keep |
| `/region/` | P0 international government and regional operators | Directory is reachable indirectly | Add to sitemap, header/footer, and operations navigation | keep |
| `/region/asia/`, `/region/eu/`, `/region/latam/`, `/region/mea/`, `/region/na/`, `/region/sa/` | P0 international government, enterprises, regional partners | Bring context to GE; return to operations | Add public-institution, commercial, and partner next moves | keep |
| `/contact/` | All P0 readers; P1 partners/research/talent | Leadership engagement form → contact endpoint | Add role, intent, pathway, audience owner, and availability routing | keep |
| `/contact/thanks/` | Recent inquirer | Return routes | Confirm next step based on inquiry role; avoid promising an owner or response time that is not staffed | utility |
| `/faq/` | P0 buyers, practitioners, procurement evaluators | Contact | Add audience-specific FAQs for FEAF, ITIL, procurement, research, and careers | keep |
| `/proof/` | P0 enterprise/public buyers, acquisition evaluators | Diligence engagement | Add audience/engagement-type filters and procurement-safe evidence routes | keep |
| `/team/` | P1 experienced talent, P0 buyers, partners | Qualification dossier; careers | Add practice-family and pathway links | keep |
| `/careers/` | P1 experienced talent, early-career talent, learners | Senior talent email; no public openings | Split experienced, early-career, and learning routes; preserve honest availability | keep |
| `/trust/` | P0 acquisition, enterprise risk, sensitive-mandate readers | Leadership engagement; vendor pack | Add procurement/partner route and a clear public-versus-secure boundary | keep |
| `/trust/vendor-pack/` | P0 contracting officers, CORs, procurement teams, primes | Procurement engagement | Keep diligence content, link from a public procurement pathway, retain `noindex` if appropriate | keep |
| `/visual-sitemap/` | All readers needing a complete map | Compact view; page directory | Add pathway group and ensure all route families appear | utility |
| `/visual-sitemap/compact.html` | All readers/tooling | Static compact map | Regenerate from the route manifest; remove legacy references from the map without deleting the tool | utility |
| `/404.html` | Any lost reader | Home; visual sitemap | Add six pathway choices and search/discovery language | utility |
| `/privacy/`, `/terms/` | All readers with data/legal questions | Legal links | Add relevant form, report, and public-channel boundaries; no sales CTA required | utility |
| `/global/` | Legacy visitors | Redirect to `/operations/` | Preserve redirect and record legacy relationship | utility |
| `/rss.xml` | Analysts, researchers, subscribers, syndication tools | Feed distribution | Add audience/category metadata where supported; no conversion CTA | utility |

## Capabilities

| Generated URLs | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/services/` | P0 executives, architects, service/change operators | Inspect capability atlas; contact | Add six pathway entry points and audience/stage metadata | keep |
| `/services/operating-model/` | P0 federal/national EA, solution architects, enterprise leaders | Read route; working artifacts; contact | `design-architecture` → architecture working set; add explicit FEAF/solution-architecture framing | keep |
| `/services/mergers-acquisitions/` | P0 Fortune 500 leadership, corp dev, portfolio stakeholders | Read route; integration artifact; contact | `set-direction` → integration thesis/diligence route | keep |
| `/services/intelligent-automation/` | P0 AI/technology executives, architects, DevSecOps/platform operators | Read route; AI lifecycle; contact | `design-architecture` or `run-service-change` → evaluate governed AI workflow | keep |
| `/services/cloud-data/` | P0 CIO/CDO/CFO, data/cloud architects, platform operators | Read route; sovereignty/FinOps artifact; contact | `design-architecture` → data/compute working set | keep |
| `/services/leadership-talent/` | P0 executives, transformation leaders; P1 talent/learners | Read route; workforce artifact; contact | `run-service-change` or `learn-join` → capability/role pathway | keep |
| `/services/transformation-office/` | P0 ITIL/service leaders, PMOs, DevSecOps, transformation offices | Read route; service/change artifact; contact | `run-service-change` → service readiness or change working set | keep |
| `/services/research-foresight/` | P0 strategic principals; P1 professors, labs, partners | Read route; research artifact; contact | `research-teach-partner` → research inquiry only when staffed | keep |

## Strategic solutions

| Generated URLs | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/solutions/` | P0 executives and challenge owners | Decision-led pathway map; contact | Add “start by intent” and audience/stage labels | keep |
| `/solutions/enterprise-ai/`, `/solutions/modernization/`, `/solutions/operating-model/`, `/solutions/healthcare-transformation/`, `/solutions/data-labs-ai-cost-management/`, `/solutions/quantum-intelligence/`, `/solutions/digital-infrastructure-resilience/`, `/solutions/supply-network-operations/`, `/solutions/portfolio-delivery/` | P0 challenge owners; secondary architecture, service, industry, and partner readers | Related services, field notes, contact | Add `pathways[]`, reader job, role-specific artifact, and pathway CTA; retain challenge-led structure | keep |

## Industries and contexts

| Generated URLs | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/industries/` | P0 leaders choosing context | Industry directory; contact | Add “Who is carrying this decision?” prompts | keep |
| `/industries/enterprise-services/`, `/industries/enterprise-ai/`, `/industries/energy-infrastructure/`, `/industries/federal-public-service/`, `/industries/healthcare-life-sciences/`, `/industries/frontier-intelligence-autonomous-systems/`, `/industries/logistics-and-supply-networks/`, `/industries/technology-data/`, `/industries/education/` | P0 enterprise, public-service, national, infrastructure, and technology leaders; P1 education/research readers | Related services, insights, contact | Add audience/pathway entry cards; explicitly route federal, multilateral, research, and learner readers where relevant | keep |

## Work, proof, and case studies

| Generated URLs | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/work/`, `/case-studies/` | P0 buyers, acquisition evaluators, partners | Shared work index; mandate/contact | Choose `/work/` as discovery canonical, preserve `/case-studies/`, and add audience/engagement filters | canonicalize |
| `/case-studies/operating-model/`, `/case-studies/cloud-data-foundation/`, `/case-studies/automation-at-scale/` | P0 enterprise/public buyers; P0 practitioners | Read field note; contact | Label the audience, decision, evidence boundary, and relevant pathway | keep |

## Insights and topics

| Generated URLs | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/insights/` | All readers, especially P0/P1 discovery audiences | Search/filter; read arguments; contact | Add audience and stage filters; expose pathway entry points | keep |
| `/insights/2035-is-a-design-constraint/`, `/insights/ai-at-scale/`, `/insights/ai-sovereignty-is-an-operating-model/`, `/insights/clinical-ai-needs-a-change-system/`, `/insights/clinical-ai-needs-real-world-evidence/`, `/insights/compute-is-a-governance-problem/`, `/insights/cybersecurity-is-an-operating-outcome/`, `/insights/data-center-permitting-is-an-operating-model/`, `/insights/designing-for-adoption/`, `/insights/energy-transition-is-an-operating-model/`, `/insights/enterprise-as-a-product/`, `/insights/federal-ai-should-be-a-service/`, `/insights/future-of-work-is-workflow-design/`, `/insights/global-operating-model-is-translation/`, `/insights/governance-is-a-product/`, `/insights/iea-energy-and-ai-grid-capacity/`, `/insights/interoperability-is-a-workflow/`, `/insights/itu-connectivity-is-not-access/`, `/insights/legacy-is-a-product-decision/`, `/insights/platform-teams-are-a-contract/`, `/insights/productivity-is-a-workflow-outcome/`, `/insights/public-service-is-a-product/`, `/insights/quantum-intelligence-needs-an-operating-model/`, `/insights/regional-context-is-a-control/`, `/insights/resilience-crosses-borders/`, `/insights/resilience-is-a-capital-allocation-decision/`, `/insights/responsible-ai-is-management/`, `/insights/skills-are-a-system/`, `/insights/the-cost-of-unclear/`, `/insights/the-path-to-2050-is-an-operating-model/`, `/insights/third-party-is-your-operating-model/`, `/insights/time-zones-are-a-capability/`, `/insights/transformation-metrics-are-management/`, `/insights/un-desa-population-scale-is-an-operating-constraint/` | P0/P1 readers depending on topic | Read argument, source, related service/insight | Add `audiences`, `readerStage`, and `pathways[]`; use Learn CTAs before Act CTAs | keep |
| `/insights/topics/ai-cost-management/`, `/insights/topics/energy-and-infrastructure/`, `/insights/topics/enterprise-ai/`, `/insights/topics/execution/`, `/insights/topics/federal-and-public-service/`, `/insights/topics/governance/`, `/insights/topics/healthcare/`, `/insights/topics/leadership/`, `/insights/topics/modernization/`, `/insights/topics/operating-model/`, `/insights/topics/quantum-intelligence/`, `/insights/topics/research-and-foresight/`, `/insights/topics/resilience/`, `/insights/topics/technology-and-data/`, `/insights/topics/workforce/` | P0 practitioners and P1 researchers/learners | Topic listing; contact | Add explicit federal EA/FEAF, solution architecture, procurement, research, and practice/careers topic pathways over time | keep |
| `/insights/thanks/` | Newsletter/report readers | Return to insights/home | Offer the next relevant Learn route; do not force a leadership CTA | utility |

## Resources and standalone reports

| Generated URLs | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| `/resources/` | P0 executives, practitioners, acquisition; P1 researchers/learners | Report directory; request report | Add “best for,” pathway, access, and use-case labels | keep |
| `/resources/enterprise-decision-readiness/`, `/resources/ai-governance-controls/`, `/resources/modernization-investment-priority/` | P0 executives, architecture, service/change, data/AI, public institutions | Get/read/preview report | Add role-specific use cases and audience-aware report routing | keep |
| `/reports/enterprise-decision-readiness.html`, `/reports/ai-governance-controls.html`, `/reports/modernization-investment-priority.html`, `/reports/global-operating-model-brief.html` | Public report readers, researchers, learners, analysts | Read standalone report | Preserve public distribution; add related pathway links and source/availability metadata | keep |
| `/resources/thanks/` | Report requesters | Return to reports; contact | Confirm delivery state and offer relevant pathway; do not promise delivery without endpoint status | utility |

## Confirmation and distribution surfaces

| Route/artifact | Audience | Current move | Target move | Preservation |
| --- | --- | --- | --- | --- |
| Newsletter form / The Signal | P1 researchers, learners, analysts; any reader | Request The Signal | Add optional audience/topic consent and route metadata | keep |
| `/rss.xml` | Researchers, analysts, syndication tools | Feed | Preserve; expose categories/topics when possible | utility |
| `/privacy/`, `/terms/` | All form and report readers | Legal boundary | Preserve; link from every new CTA and intake path | utility |

## Implementation requirement

The matrix is a planning baseline, not permission to expose every proposed CTA immediately. Each target action requires a live route or artifact, an owner, a delivery channel, an availability state, and a verified analytics event. Until then, use a truthful interest-only CTA or the existing general route.
