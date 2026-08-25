# Audience-led site audit and game plan

Status: implemented · quiet routing
Prepared: 2026-08-25
Scope: full public site, shared shell, route families, content collections, calls to action, and conversion paths

## Executive decision

The site does not need a content deletion or a wholesale redesign. It needs an internal intent layer that helps the editorial system decide what each reader should see and do next.

The current site is strongest for executive and institutional transformation readers. It already has credible capabilities, solutions, industries, operating contexts, reports, insights, proof, trust material, and senior-talent content. The audit decision is to keep that center of gravity visible and let audience knowledge quietly shape page framing, CTA choice, and destination handoffs.

The recommended move is to preserve the existing content architecture and add six audience-intent pathways:

1. **Set direction** — political principals, cabinet and agency leaders, state and local executives, education-system leaders, CEOs, boards, CIOs, and executive sponsors.
2. **Design architecture** — FEAF practitioners, enterprise and solution architects, CIO/CTO/CDO offices, and architecture boards.
3. **Run service and change** — ITIL leaders, service owners, transformation offices, PMOs, DevSecOps, and platform operators.
4. **Specify and procure** — contracting officers, CORs, acquisition teams, primes, SMEs, capture teams, and teaming partners.
5. **Research, teach, and partner** — professors, labs, UN/NATO and multilateral readers, standards bodies, analysts, and technology partners.
6. **Learn and join** — experienced specialists, interns, apprentices, MBA/MPA/MPP and technical learners, fellows, and career switchers.

These are editorial routing rules, not new service categories. `/services/`, `/solutions/`, `/industries/`, `/insights/`, `/resources/`, `/work/`, `/proof/`, and `/careers/` remain the content destinations. The full taxonomy is retained in the internal registry and documentation; the shared header, footer, and homepage do not expose it as a chooser.

The only explicit map is the noindex `/audiences/` organization map, linked from site tools. Otherwise, handoffs appear where intent is unambiguous: careers can continue to Tao Staff or Ignite Curiosity, research foresight can continue to INSTAR Lab, and vendor/teaming work can continue to DreamLimited. Every other route stays first-party by default.

## Destination operating model

The organization-wide routing layer is represented by a single registry in [`src/data/audiences.ts`](../src/data/audiences.ts), rendered only on the quiet [`/audiences/`](../src/pages/audiences/index.astro) organization map and by context-specific handoffs. The shared header, footer, and homepage deliberately do not expose the full model. Careers, research foresight, vendor/teaming content, the visual sitemap, and the build audit use the parts relevant to their context.

The routing decision is additive: Global Enterprise remains the source layer for institutional content and direct advisory, while four explicit outbound destinations own the next experience for specific intents.

| Intent | Destination | Handoff behavior |
| --- | --- | --- |
| Early-career and professional learning | `https://ignitecuriosity.org/` | Global Enterprise explains the work; Ignite Curiosity owns the early-career/learning journey |
| Careers with the organization | `https://taostaff.com/` | Global Enterprise sets working context; Tao Staff owns the career destination |
| Professors and researchers | `https://instarlab.org/` | Global Enterprise supplies insights and context; INSTAR Lab owns research collaboration |
| Primes, subcontractors, SMEs, and teaming | `https://dreamlimited.org/` | Global Enterprise supplies trust, capability, and delivery boundaries; DreamLimited owns pursuit/teaming pathways |
| Governments, enterprises, architects, operators, acquisition officials, analysts, and other institutional readers | Global Enterprise internal routes | Keep the content, reports, trust material, and leadership engagement path first-party |

`dreamlimited.com` is intentionally not used: it resolves to a parked domain. The active canonical destination verified on August 24, 2026 is `dreamlimited.org`. No outbound card claims employment, partnership, endorsement, or guaranteed referral; each destination is labeled as a reader pathway.

## Prioritized audience model

The canonical priority order is maintained in [`docs/audience-definition.md`](./audience-definition.md). In practical site terms:

| Priority | Audience groups | Site obligation |
| --- | --- | --- |
| P0 · 01–06 | National/federal principals, federal EA/FEAF leaders, SLED leaders, international government leaders, Fortune 500 leadership, UN/NATO and other multilateral institutions | Make the executive mandate, institutional scale, architecture, sovereignty, interoperability, local service reality, and operating consequence explicit. Preserve the existing senior voice, while treating named institutions as target audiences unless a relationship is substantiated. |
| P0 · 07–11 | Government transformation operators, ITIL/service-management leaders, enterprise and solution architects, corporate transformation/portfolio leaders, DevSecOps/platform operators | Give practitioners artifacts, methods, controls, service transitions, architecture decisions, and implementation routes—not only leadership language. |
| P0 · 12–13 | Contracting officers/CORs/acquisition teams and federal-contract SMEs/primes/teaming partners | Make procurement, diligence, capability statements, teaming boundaries, and delivery evidence discoverable and procurement-safe. |
| P1 · 14–18 | Professors/researchers, international and technology partners, experienced talent, early-career talent, professional learners | Add collaboration, learning, and career paths with clear ownership and realistic response expectations. International government, multilateral, and SLED mandate pathways remain P0 even when partner/research content is P1. |
| P2 · 19–20 | Capital/portfolio stakeholders, analysts, media, and informed public readers | Serve through strong M&A, operating-model, evidence, reports, and insight content without adding more top-level taxonomy. |

## What the audit found

### Strong existing coverage to preserve

- The homepage is aimed at federal, national, G7/NATO/UN-relevant institutional readers and routes to federal/public service, architecture, ITIL, interoperability, operations, resources, and contact. Named government and multilateral relationships must remain evidence-gated; audience relevance is not proof of client, partner, member-state, or endorsement status.
- Seven capability routes cover operating model and enterprise architecture, M&A, AI/ML labs, data and AI cost management, leadership/talent, ITIL change management, and quantum/foresight.
- Strategic solution routes organize challenges such as enterprise AI, modernization, operating models, healthcare transformation, data labs, quantum intelligence, digital infrastructure resilience, supply networks, and portfolio delivery.
- Nine industry contexts, six regional operating contexts, three case studies, three decision reports, and a large insight library provide substantial editorial depth.
- SLED language and operating patterns already appear in the regional and education content; the audience model now names the institutions directly so those routes are easier to frame and measure.
- Proof, trust, and the vendor pack establish a conservative diligence boundary rather than making unsupported claims.
- Careers and team pages provide a credible senior-talent foundation.

### Missing or too implicit

| Audience need | Current state | Missing pathway or content |
| --- | --- | --- |
| FEAF implementation | FEAF is named in positioning and audience material; federal/public-service content exists | A dedicated federal enterprise architecture route, FEAF-to-capability/investment mapping, working artifacts, and a federal architecture report or checklist |
| Solution architecture | Business, technology, platform, data, and transition architecture are described indirectly | A clear solution-architecture route with reference architecture, integration patterns, security/data boundaries, trade-offs, and architect-facing artifacts |
| National and international government | Operations and regional pages are strong but framed largely through global enterprise/M&A language | Whole-of-government architecture, national service management, digital sovereignty, cross-ministry interoperability, and local capability-transfer route |
| SLED institutions | Regional and education content already addresses local capability, adoption, and workforce realities | A named state/local/education audience route, public-institution operating examples, and contact language for state CIOs, local leaders, public universities, and K–12 systems |
| UN/NATO and multilateral readers | Institutions are used as evidence sources | A multilateral/international-partners route with interoperability, standards translation, mission coordination, resilience, and collaboration CTA |
| Contracting officers and CORs | Trust and vendor-pack material exists but is several clicks deep and the vendor pack is `noindex` | Procurement landing page, acquisition-safe language, capability statement, scope boundaries, evidence, and dedicated procurement inquiry |
| Federal SMEs, primes, and teaming partners | Diligence and proof content exists; teaming language is sparse | Partner/teaming route, capture/proposal support boundaries, subcontracting posture, partner criteria, and delivery evidence |
| Professors and researchers | Research/foresight, insights, sources, and INSTAR Lab partnership are present | Research collaboration page, research agenda, methods/evidence note, seminar/working-paper inquiry, and collaboration criteria |
| Students, interns, and early-career readers | Careers is senior-oriented and says there are no public openings | Early-career practice page, internship/fellowship/apprenticeship status, disciplines, mentoring model, learning resources, and expression-of-interest route |
| Experienced talent | Senior inquiry exists, but roles and discipline pathways are broad | Role families for solution/enterprise architecture, FEAF, ITIL, DevSecOps, research, proposals, and delivery operations |
| Cross-audience wayfinding | Existing navigation is organized by content type: Explore, Industries, Work, Insights, Resources | Keep content-led navigation; use contextual handoffs and the low-prominence organization map instead of global segmentation |

## Page and content audit

All existing pages remain in scope. The following is the steering treatment for each route family.

| Route family | Current job | Audience steering to add | Primary next move |
| --- | --- | --- | --- |
| `/` Home | Establish the mandate and brand position | Keep the mandate-led first-party narrative; let the service, proof, insights, and contact CTAs do the steering without a visible audience chooser | Follow the work or request a leadership engagement |
| `/about/` | Explain point of view, credibility, and operating model | Add audience entry cards for public institutions, global enterprises, practitioners, partners/research, and talent | Read the relevant pathway or request a principal conversation |
| `/services/` and `/services/[slug]/` | Explain disciplines and artifacts | Add `audiences`, `readerJob`, `readerStage`, related pathways, and role-specific artifacts to each service; make FEAF and solution architecture language explicit where accurate | Inspect the working set, then choose a pathway-specific action |
| `/solutions/` and `/solutions/[slug]/` | Organize by consequential challenge | Keep as challenge-led destinations; add audience badges and links to the relevant intent pathway | Follow a challenge into architecture, service/change, procurement, or direction |
| `/industries/` and `/industries/[slug]/` | Show how context changes the answer | Add public institution, national government, enterprise, multilateral, and infrastructure reader prompts without duplicating industry copy | Move to the relevant solution/service and context route |
| `/operations/`, `/region/`, `/region/[slug]/` | Explain regional operating contexts | Add a government/multilateral lens alongside commercial/federal/SLED; expose the `/region/` directory in the sitemap and navigation | Bring an international mandate or choose a regional context |
| `/work/`, `/case-studies/`, `/proof/` | Establish evidence and diligence | Add audience/engagement-type labels: federal/public, enterprise, architecture, service/change, research, partner, and procurement | Read the field note, request diligence, or start a scoped conversation |
| `/insights/`, `/insights/[slug]/`, `/insights/topics/` | Build thought leadership and discovery | Add audience and stage metadata, filters, and explicit topic hubs for federal EA/FEAF, solution architecture, procurement, research, and practice/careers | Read, follow, download, or move to a relevant working set |
| `/resources/`, `/resources/[slug]/` | Give readers reports and working tools | Add “best for” role, access level, use case, and pathway fields; create FEAF, architecture, procurement, research, and learning assets over time | Read in browser, request a report, or request an artifact |
| `/contact/` | Route a mandate | Add role and intent fields for executive, architecture, service/change, procurement, teaming, research, partnership, experienced talent, and early career | Route the inquiry to the right owner without exposing sensitive data |
| `/trust/`, `/trust/vendor-pack/` | Establish trust and procurement boundaries | Add a public procurement/partner landing page; keep deeper diligence materials appropriately gated or `noindex` | Request procurement, diligence, or secure-channel conversation |
| `/team/` | Establish disciplines and credibility | Add practice families and links to the relevant audience pathways; preserve qualification dossier route | Request qualification material or explore careers |
| `/careers/` | Attract senior talent | Split experienced talent from emerging talent and learning; preserve honest “no openings” status until roles are real | View practice pathways, current roles, or talent inquiry |
| `/faq/`, legal, 404, site tools | Reduce friction and support discovery | Add audience-aware answers, procurement language, and links to the visual sitemap/pathways; correct sitemap omissions without deleting utility routes | Find the right route |

The exact generated route inventory, current CTA treatment, target audience, pathway, and preservation rule are recorded in [`docs/audience-route-matrix.md`](./audience-route-matrix.md). It includes standalone report HTML, RSS, confirmations, redirects, utility routes, and every dynamic content family.

### Route hygiene found during the audit

- The visual sitemap omits `/region/` and its six regional routes even though the site links to them.
- `/work/` and `/case-studies/` are parallel indexes backed by the same component; the site should choose a canonical discovery route while preserving both URLs.
- The compact sitemap is maintained separately and contains the legacy `/global/` route; it should be brought into the same route manifest or clearly marked as a legacy tool.
- `ContextualNext` sends most page families to the same leadership-engagement contact route. Its surrounding copy changes, but the conversion destination often does not.
- The contact form distinguishes subject matter but not reader role, acquisition, teaming, teaching/research, learning, or talent intent.
- Careers currently offers only senior inquiry by email and explicitly states that no public openings are listed.

## CTA inventory and target system

### Existing CTA families

| Current CTA family | Current destination | Current role | Problem |
| --- | --- | --- | --- |
| Leadership engagement / principal dialogue / bring the mandate | `/contact/` | Executive conversion | Correct for P0 executive readers, overused for every other audience |
| Explore capabilities / solutions / industries / operations | Internal route families | Discovery | Strong destinations, but no audience intent layer |
| Read insight / follow topic / read field note | `/insights/`, `/work/`, related routes | Learn | Good editorial loop; needs audience/stage metadata |
| Get report / read in browser / preview | Report form or report HTML | Learn/evaluate | Strong resource loop; report gating may exclude students, professors, and independent experts |
| Request diligence / open vendor pack / start procurement engagement | `/proof/`, `/trust/`, `/trust/vendor-pack/`, `/contact/` | Procurement and partner evaluation | Valuable content is buried and not consistently discoverable |
| Open senior talent inquiry / explore careers | Email or `/careers/` | Experienced talent | No early-career or learning route |
| Request The Signal | Newsletter form | Ongoing editorial relationship | Useful low-commitment route; should be tagged by audience/topic where appropriate |

### Target three-level CTA system

Every page should have one primary CTA and one lower-commitment secondary CTA, selected from these levels:

| Level | Purpose | Example labels |
| --- | --- | --- |
| Learn | Help the reader understand the issue or method | `Read the architecture working set`, `Read the field guide`, `Follow federal service insights`, `Explore the practice` |
| Evaluate | Let the reader assess fit, evidence, or readiness when the artifact and owner exist | `Request procurement information`, `Open the vendor/trust pack`, `Review the diligence boundary`, `Assess service readiness`, `Ask about research collaboration` |
| Act | Route a live mandate or relationship when the receiving workflow is staffed | `Request a principal mandate session`, `Start a procurement conversation`, `Propose a research collaboration`, `Discuss a teaming path`, `Register interest in future opportunities` |

The universal leadership CTA remains available for executive pages, but it should not be the automatic CTA for procurement, research, partner, learner, or talent pages.

## Quiet intent routing

The six pathways remain useful as internal editorial rules, but they are not a second public information architecture. A visitor should encounter the work in the language of the page they chose, not be asked to classify themselves before reading it.

The shared `Explore` mega-menu, mobile directory, footer, and homepage therefore stay content-led. They retain capabilities, challenges, evidence, operations, careers, and contact routes without a global audience block. The visual sitemap carries the low-prominence `/audiences/` organization map for readers who explicitly need the broader constellation.

Context-specific handoffs are allowed when the reader's next intent is clear and the destination is real:

- Careers provides the working-context boundary, then points experienced candidates to Tao Staff and early-career learners to Ignite Curiosity.
- Research & foresight provides the Global Enterprise record, then points research collaboration to INSTAR Lab.
- Vendor/trust material provides the public delivery boundary, then points pursuit and teaming conversations to DreamLimited.
- Government, enterprise, architecture, ITIL/service, acquisition, insight, and general leadership pages remain first-party Global Enterprise routes.

## Content data model

Keep audience metadata in the shared registry and route/content records rather than hand-maintaining audience links in every page:

- `audiences`: one or more audience keys from `docs/audience-definition.md`
- `readerJob`: the task the page helps the reader complete
- `readerStage`: `learn`, `evaluate`, or `act`
- `pathways`: one or more of the six intent routes; content may serve multiple audiences without being forced into one parent
- `primaryCta`: label and destination key
- `secondaryCta`: lower-commitment label and destination key
- `artifact`: the working output or evidence type
- `relatedRoutes`: typed links to services, solutions, industries, work, insights, reports, trust, careers, or utility routes
- `audienceOwner`: the team or workflow responsible for the next step
- `availability`: `live`, `interest-only`, `gated`, or `not-open`

Apply only the fields that improve a route's actual job. RSS, legal/noindex routes, redirects, and static report artifacts retain an explicit preservation/visibility status without being forced into a public audience taxonomy. Generate contextual CTA labels and related content from the same data; do not generate a sitewide audience chooser.

## Phased implementation plan

### Baseline completed — taxonomy and quiet wayfinding

- Freeze the prioritized audience keys and six intent pathways in [`docs/audience-definition.md`](./audience-definition.md) and [`src/data/audiences.ts`](../src/data/audiences.ts).
- Keep the taxonomy internal to editorial/routing decisions; remove the global header, footer, and homepage audience chooser.
- Preserve `/audiences/` as a noindex organization map, linked only from site tools, and add it to the compact visual sitemap.
- Add truthful, context-specific destination handoffs for careers, research foresight, and vendor/teaming work.
- Keep existing route families and content intact; the build audit now checks the quiet shared shell and contextual destinations.

### Next — P0 content pathways

- Publish federal EA/FEAF and solution-architecture working-set pathways using existing service content.
- Publish a SLED public-institution pathway using the existing operations, education, regional, ITIL, and capability-transfer content.
- Publish service/change and DevSecOps implementation pathways using ITIL, transformation, cloud/data, and AI content.
- Expand procurement/teaming content for contracting officers, CORs, SMEs, primes, and capture teams where owned artifacts are real.
- Publish the international-government and multilateral-institution pathway as a P0 institutional route, separate from the later research/partner pathway; use audience framing without implying named-client or partner relationships.
- Add role/intent routing to the contact form while keeping the existing public-information boundary.

### Next — P1 relationship pathways

- Publish research/teach/partner content with research themes, evidence standards, and collaboration criteria.
- Split careers into experienced talent, early-career talent, and professional learning without inventing openings.

### Phase 4 — editorial and resource integration

- Tag existing insights, topics, reports, services, solutions, industries, work, and proof with audience/stage metadata.
- Add federal EA/FEAF, solution-architecture, procurement, research, and practice/careers resource assets.
- Add related-content and next-step blocks that follow each reader's pathway.
- Only introduce a CTA when its artifact, owner, delivery channel, and availability are real; otherwise use an interest-only CTA or a clearly stated not-open status.
- Make reports useful for public-sector readers, professors, students, and independent experts without weakening privacy or abuse controls.

### Phase 5 — validation and measurement

- Test desktop/mobile mega-menu behavior, keyboard navigation, Escape/focus behavior, no-JavaScript links, and responsive layout.
- Audit every indexable route for one audience assignment, one reader job, one primary CTA, and one valid next route.
- Test contact/report/talent/procurement/research delivery and consent boundaries.
- Add analytics events for pathway entry, CTA level, role, and conversion destination.
- Re-run build, type checks, content/evidence audits, route audits, sitemap checks, and live HTTP/visual QA.

## Non-deletion rule

Do not delete existing service, solution, industry, insight, report, work, proof, trust, region, careers, RSS, confirmation, legal, redirect, visual-sitemap, or standalone static-report content as part of this strategy. Add pathways, metadata, cross-links, and audience-specific framing. If a duplicate route needs canonicalization, preserve the old URL with a redirect or canonical link and record the relationship in the route manifest.

## Success criteria

- Every P0 audience has a credible first-party route selected by page intent; it does not need a visible audience label in the header or homepage.
- Every outbound destination link appears only where its context and availability are truthful.
- Careers, research, teaming, and procurement readers have a relevant next move instead of being forced into a generic executive contact path.
- Audience, reader-job, stage, CTA, and related-route metadata remain available to the editorial system without making every page look like a directory.
- The visual sitemap includes every real route family, including regional contexts and canonical work discovery.
- Existing executive and institutional messaging remains prominent and credible.
- No page implies FEAF/ITIL certification, NATO/UN endorsement, client relationship, or partner status without evidence.
- The route matrix accounts for every generated URL and static artifact, with an explicit audience, CTA/preservation, and visibility policy.
