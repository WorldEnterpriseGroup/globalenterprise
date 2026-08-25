# Audience destination operating model

Status: implemented routing baseline
Owner: World Enterprise Group / Global Enterprise
Last verified: 2026-08-24

## Decision

Global Enterprise remains the direct public home for institutional advisory: national and federal architecture, whole-of-government transformation, Fortune 500 operating models, ITIL/service systems, solution architecture, DevSecOps/platform operations, procurement-safe context, insights, reports, trust, and leadership conversations.

The site makes four specific handoffs only when the page context makes the reader's next experience clear:

| Audience intent | Destination | What Global Enterprise provides before the handoff |
| --- | --- | --- |
| Early-career talent and professional learners | [ignitecuriosity.org](https://ignitecuriosity.org/) | The work context, practice vocabulary, and a clearly labeled early-career route |
| Anyone seeking a career with the organization | [taostaff.com](https://taostaff.com/) | Working standards, discipline context, and a clear career-destination boundary |
| Professors, researchers, labs, and think tanks | [instarlab.org](https://instarlab.org/) | Research-relevant insights, evidence, questions, and a collaboration handoff |
| Primes, subcontractors, SMEs, capture, and teaming teams | [dreamlimited.org](https://dreamlimited.org/) | Vendor/trust boundaries, capability context, and pursuit/delivery framing |

The specific-intent precedence is an internal routing rule, not a public audience chooser:

`early-career / learning → research → teaming → career → Global Enterprise default`

This is a CTA decision, not a page redirect. Multi-audience pages remain on Global Enterprise and keep their primary material first-party; only careers, research foresight, and vendor/teaming pages expose the relevant outbound handoff.

## Hypermap grounding

The `tao` Hypermap universe maps Global Enterprise Standard Corporation, Curiosity Corporation, INSTAR Lab Inc., and United Dream Limited into the World Enterprise Group constellation. It maps Ravonics LLC separately as a WEG-owned company through Hakks Inc. The destination routing in this repository therefore treats the current Global Enterprise site as the source layer for this implementation; it does not redirect institutional readers to Ravonics.

Hypermap records the following public properties:

- `ignitecuriosity.org` is owned by Curiosity Corporation, an education and workforce-training organization.
- `instarlab.org` is owned by INSTAR Lab Inc., a nonprofit research institute.
- United Dream Limited is associated with the active `dreamlimited.org` property and the DreamLimited corporate site record.
- Tao Staff LLC is present as an active staffing organization; the public `taostaff.com` property is supplied by the organization and was verified directly on August 24, 2026.
- `dreamlimited.com` is not used because direct verification resolves it to a parked-domain marketplace. `dreamlimited.org` is the active destination.

These relationships inform routing; they do not, by themselves, authorize claims about contracts, employment, endorsement, referral guarantees, or a named client relationship.

## Infusion points

The routing model is intentionally implemented through shared surfaces instead of one isolated audience page:

| Surface | Infusion |
| --- | --- |
| Shared data | `src/data/audiences.ts` is the single registry for destinations, audience keys, priorities, CTA labels, external-link behavior, and verification notes. |
| Header / mega-menu | Explore remains content-led; the full audience taxonomy is not exposed in desktop or mobile navigation. |
| Homepage | The federal/national narrative remains first-party and mandate-led; there is no full audience-pathway block. |
| `/audiences/` | A noindex, low-prominence organization map explains the boundary between Global Enterprise content and the four outbound destinations; it is surfaced through site tools. |
| Footer | The footer remains first-party and task-led; external destinations appear only in context-specific page sections. |
| Careers | Experienced talent routes to Tao Staff; early-career readers route to Ignite Curiosity; Global Enterprise retains the honest working-context and availability boundary. |
| Contextual next step | Careers points to Tao Staff and Ignite Curiosity; research foresight points to INSTAR Lab; vendor/trust pack points to DreamLimited. Other route families remain first-party. |
| Contact | Role/intent choices now name FEAF, national/international architecture, ITIL, teaming, procurement, and research so first-party institutional inquiries can be routed accurately. |
| Visual sitemap / route audit | The organization map is in site tools and the compact map; the noindex route is excluded from the public XML sitemap. The build audit requires all four active external destinations while rejecting the parked DreamLimited domain. |
| Documentation | `audience-definition.md`, `audience-site-audit-and-game-plan.md`, and `audience-route-matrix.md` carry the priority, route, CTA, and preservation rules. |

## Ownership model

- Global Enterprise owns the audience taxonomy, first-party content, institutional CTA language, contact boundary, route matrix, and release validation.
- Each destination organization owns its own landing experience, availability, application or collaboration process, eligibility, and response expectations.
- A destination link is considered healthy only when its public URL is live, its visible promise is truthful, and its owner can receive the reader. The build validates presence of the canonical link; periodic live checks must verify availability again.
- External links are labeled as destinations, not endorsements. No source page should imply that a reader is guaranteed employment, a contract, a teaming role, research acceptance, or a referral outcome.

## Next implementation phases

1. Add destination-aware metadata to generated route records and the remaining route-family CTAs.
2. Add explicit FEAF, solution-architecture, procurement, research, and practice/careers resource assets as they become real and owned.
3. Add owner-level conversion events and reporting only under the approved privacy and analytics policy.
4. Re-verify the four destinations and the internal route graph on every release; update this record when ownership, canonical URLs, or availability changes.
