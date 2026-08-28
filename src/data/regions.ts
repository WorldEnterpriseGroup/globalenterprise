import { regionContexts } from "@/data/site";

export interface RegionRoadmapStep {
  label: string;
  title: string;
  text: string;
}

export interface RegionSector {
  label: "Commercial" | "Federal" | "SLED";
  title: string;
  text: string;
  moves: string[];
}

export interface RegionPage {
  slug: string;
  name: string;
  title: string;
  description: string;
  chapter: {
    label: string;
    title: string;
    text: string;
    signals: string[];
  };
  horizon: {
    title: string;
    text: string;
    steps: RegionRoadmapStep[];
  };
  sectors: RegionSector[];
  convergence: {
    title: string;
    text: string;
    moves: string[];
  };
  difference: {
    title: string;
    text: string;
    moves: string[];
  };
  leadership: {
    title: string;
    text: string;
  };
}

const context = (slug: string) => {
  const match = regionContexts.find((item) => item.slug === slug);
  if (!match) throw new Error(`Missing regional operating context: ${slug}`);
  return match;
};

export const regionPages: RegionPage[] = [
  {
    slug: "na",
    name: context("na").name,
    title: "Scale without losing the mission.",
    description: "A North American operating chapter for leaders joining enterprise scale, public missions, infrastructure, and the accountability required to make digital capability useful.",
    chapter: {
      label: "Current chapter · institutional scale",
      title: "The region is moving from platform accumulation to governed capability.",
      text: "North America has deep capital, technology, research, and public-sector capacity. The harder work is making those assets reinforce one another without creating new silos, brittle dependencies, or AI programs that cannot be governed in the workflow where decisions happen.",
      signals: ["AI portfolios need an accountable operating owner", "Infrastructure decisions now carry public-value and resilience questions", "Commercial speed and federal or SLED duty cycles rarely move at the same rhythm"],
    },
    horizon: {
      title: "A twenty-year path from scale to stewardship.",
      text: "The opportunity is not to centralize every decision. It is to build a common evidence spine and let commercial, federal, state, local, and education systems move with enough shared language to compound capability.",
      steps: [
        { label: "Now → 2031", title: "Make authority and evidence visible.", text: "Clarify AI portfolios, identity and data boundaries, infrastructure constraints, and the service owners who can make a bounded decision under pressure." },
        { label: "2031 → 2036", title: "Connect the regional service fabric.", text: "Turn interoperable platforms, workforce pathways, resilient communications, and shared procurement or partnership patterns into repeatable capability." },
        { label: "2036 → 2046", title: "Compound trusted autonomy.", text: "Use machine assistance and distributed operating cells to increase reach while preserving human accountability, recovery paths, and public legitimacy." },
      ],
    },
    sectors: [
      { label: "Commercial", title: "Turn enterprise advantage into a service customers can feel.", text: "Commercial leaders can connect capital, product, cloud, energy, customer systems, and talent around a promise that remains supportable across markets. The priority is fewer disconnected transformation programs and more shared operating outcomes.", moves: ["Map the capability and service boundary before the next investment", "Join customer, finance, data, and operations signals in one review cadence", "Build a workforce path from frontier experimentation to reliable service"] },
      { label: "Federal", title: "Make mission technology accountable at the point of use.", text: "Federal leaders need modernization that survives procurement, security, mission change, and public scrutiny. GE helps translate policy and architecture into decision rights, evidence, release discipline, and a degraded-mode service promise.", moves: ["Tie mission outcomes to platform and portfolio decisions", "Make identity, data provenance, AI evaluation, and human review explicit", "Design continuity across suppliers, facilities, communications, and workforce"] },
      { label: "SLED", title: "Bring capability closer to the communities it serves.", text: "State, local, and education leaders often carry the adoption consequence directly. Their systems can become a practical bridge between enterprise innovation and public trust when service design, affordability, learning, and local ownership are designed together.", moves: ["Start with resident, student, patient, or employee journeys", "Create shared patterns that smaller institutions can actually operate", "Use education and workforce systems as capability multipliers"] },
    ],
    convergence: {
      title: "One regional advantage: a shared learning loop.",
      text: "Commercial, federal, and SLED systems strengthen one another when they share evidence and talent without collapsing their mandates. A commercial platform can become more trustworthy through public-grade controls; a public mission can move faster through reusable commercial discipline; education can widen the talent and research base beneath both.",
      moves: ["A common vocabulary for service, risk, data, and recovery", "Cross-sector talent and research pathways", "Interoperability that allows local variation without losing accountability"],
    },
    difference: {
      title: "GE’s difference is integration at the consequence boundary.",
      text: "Global Enterprise helps leaders see where a capital decision becomes an infrastructure dependency, where an AI model becomes a service obligation, and where a policy becomes a workflow. We bring the enterprise, mission, and local operator into the same design surface.",
      moves: ["Frame the mandate and the decision that matters next", "Map dependencies, ownership, interfaces, and recovery paths", "Transfer the management rhythm so the institution can keep learning"],
    },
    leadership: {
      title: "Bring the decision that cannot stay in one silo.",
      text: "Leaders across North American commercial, federal, state, local, and education systems can start with a confidential mandate conversation. GE will validate the local context, clarify what is known, and shape the right first working session.",
    },
  },
  {
    slug: "eu",
    name: context("eu").name,
    title: "Turn principle into operating practice.",
    description: "A European operating chapter for leaders translating privacy, safety, resilience, competition, and digital sovereignty into useful everyday systems.",
    chapter: {
      label: "Current chapter · translation",
      title: "The question is no longer whether principles matter, but whether they travel into the workflow.",
      text: "Europe’s institutional strength is expressed through principles, standards, public trust, and cross-border coordination. The next task is practical translation: making governance visible in product decisions, data responsibilities, procurement, AI evaluation, and the exception paths operators use when reality refuses the template.",
      signals: ["Cross-border capability needs shared evidence and local legitimacy", "Digital sovereignty is an operating design choice, not only a policy phrase", "Trust is won through usable controls, transparent decisions, and recovery"],
    },
    horizon: {
      title: "A twenty-year path from compliance to civic advantage.",
      text: "The strongest European systems will make responsible practice a source of speed. They will share infrastructure and evidence where it helps, preserve local and national authority where it matters, and make the boundary legible to citizens, customers, and operators.",
      steps: [
        { label: "Now → 2031", title: "Translate principle into the product and service layer.", text: "Create ownership for data, models, identity, consent, security, procurement, and exceptions so responsible design is part of delivery rather than a late gate." },
        { label: "2031 → 2036", title: "Build interoperable public and commercial rails.", text: "Connect cross-border service patterns, research, energy, communications, and workforce capability while allowing local language, law, and institutional form to remain visible." },
        { label: "2036 → 2046", title: "Make trusted autonomy a regional capability.", text: "Use auditable machine assistance and federated service systems to improve public and commercial outcomes without turning sovereignty into isolation." },
      ],
    },
    sectors: [
      { label: "Commercial", title: "Make trust a differentiator customers can verify.", text: "Commercial enterprises can convert responsible data, AI, and resilience practice into a clearer product promise. GE helps join market ambition to the operating evidence that makes the promise credible across jurisdictions.", moves: ["Connect product, legal, security, and service ownership early", "Design reusable controls with a clear exception path", "Make multilingual customer and workforce adoption part of the operating case"] },
      { label: "Federal", title: "Turn policy intent into a service that holds under scrutiny.", text: "Federal and supranational institutions need architecture and delivery practices that carry mission, rights, security, and continuity together. GE works at the seam between policy intent and the workflow that must honor it.", moves: ["Map policy obligations to accountable operating decisions", "Design evidence, auditability, and human review into the change path", "Coordinate infrastructure and supplier resilience across borders"] },
      { label: "SLED", title: "Make public capability legible at the local edge.", text: "Regional, municipal, and education systems are where citizens experience interoperability and trust. GE helps them shape practical service boundaries, shared platforms, and capability transfer that do not assume one institution has the capacity of a national center.", moves: ["Design around resident, learner, and frontline-worker journeys", "Use shared patterns with local ownership and language", "Create learning loops between cities, regions, and institutions"] },
    ],
    convergence: {
      title: "Commercial strength and public trust can be the same operating asset.",
      text: "Europe can make the commercial, federal, and SLED connection visible through a common discipline of evidence, privacy, resilience, and capability transfer. The result is not slower innovation; it is innovation that can travel without repeatedly renegotiating its legitimacy.",
      moves: ["A shared evidence spine for responsible technology", "Federated services with explicit local decision rights", "Research, education, and procurement that widen capability"],
    },
    difference: {
      title: "GE turns principle into a sequence leaders can run.",
      text: "We help institutions move from a statement of intent to a boundary register, dependency map, service transition, and review cadence. The work keeps the source, caveat, owner, and consequence visible as the system changes.",
      moves: ["Translate obligations into operating choices", "Coordinate shared and local layers", "Transfer the method, not only the deliverable"],
    },
    leadership: {
      title: "Start with the principle that is not yet operational.",
      text: "European leaders can contact GE for a focused mandate session across enterprise, federal, regional, municipal, or education boundaries. The first conversation is about context, decision authority, and the evidence needed to proceed responsibly.",
    },
  },
  {
    slug: "mea",
    name: context("mea").name,
    title: "Build the platform and the capability together.",
    description: "A Middle East and Africa operating chapter for leaders building infrastructure, institutions, talent, and resilient digital services in the same sequence.",
    chapter: {
      label: "Current chapter · foundation building",
      title: "Ambition is becoming durable when capital is paired with local capability.",
      text: "The region contains sharply different markets, institutions, infrastructure conditions, and development paths. A strong program therefore cannot stop at financing or technology transfer. It must establish local ownership, delivery partners, workforce depth, and a sequence that makes each layer useful before adding complexity.",
      signals: ["Digital and physical infrastructure have to be planned as one service chain", "Capability transfer is as important as deployment", "Regional diversity requires bounded autonomy rather than a single playbook"],
    },
    horizon: {
      title: "A twenty-year path from platform access to platform authorship.",
      text: "The next chapter is about local institutions and enterprises becoming authors of the systems they operate. External capital and expertise can accelerate the build, but durable value comes from governance, talent, maintenance, and the ability to adapt the platform to the realities of each market.",
      steps: [
        { label: "Now → 2031", title: "Secure the foundations and the owners.", text: "Map power, connectivity, facilities, identity, data, procurement, skills, and partner dependencies; then assign the local owners who can operate the first reliable service." },
        { label: "2031 → 2036", title: "Scale through capable institutions.", text: "Build regional delivery networks, research and education pathways, shared standards, and procurement patterns that let successful systems travel without erasing context." },
        { label: "2036 → 2046", title: "Export locally authored capability.", text: "Use regional expertise to shape resilient infrastructure, digital public services, advanced industry, and intelligent systems for other contexts facing similar constraints." },
      ],
    },
    sectors: [
      { label: "Commercial", title: "Pair investment with an operating system that can stay.", text: "Commercial leaders can connect infrastructure investment, market access, local suppliers, talent, finance, and customer trust. GE helps build the capability map behind the growth case so scale does not outrun service ownership.", moves: ["Design the local capability and partner-transfer plan alongside the investment", "Make energy, connectivity, logistics, and maintenance part of the commercial promise", "Build multilingual leadership and technical pathways"] },
      { label: "Federal", title: "Make nation-scale ambition executable and accountable.", text: "Federal institutions need transformation that strengthens sovereignty, service continuity, public value, and local capability. GE helps translate mandate into architecture, portfolio choices, procurement boundaries, and operating cadence.", moves: ["Connect national priorities to a sequenced service portfolio", "Create shared controls with clear local decision rights", "Plan for degraded modes, supplier changes, and workforce continuity"] },
      { label: "SLED", title: "Let cities, regions, and schools carry the next layer.", text: "State, local, and education systems are where capability becomes lived experience. Their role is not downstream implementation; it is a source of intelligence about adoption, language, service reliability, and the workforce needed to keep the platform useful.", moves: ["Design services with local operators and communities", "Use education as a bridge into digital and infrastructure careers", "Share patterns while protecting local control and trust"] },
    ],
    convergence: {
      title: "The strongest platform is the one people can operate locally.",
      text: "Commercial capital, federal mandate, and SLED proximity become civilization-strengthening when they reinforce local agency. The commercial system provides reach and investment, public systems provide mission and legitimacy, and local and education systems provide feedback, talent, and adoption.",
      moves: ["A local capability transfer plan attached to every major build", "Shared infrastructure and data standards with practical entry points", "Workforce and research systems connected to operating demand"],
    },
    difference: {
      title: "GE helps turn ambition into an operating sequence.",
      text: "We bring capital, infrastructure, policy, digital systems, partners, and workforce questions into one mandate surface. Our contribution is to expose dependencies early, preserve local authority, and leave behind a system that can run beyond the initial program.",
      moves: ["Frame the service promise and local ownership", "Map the physical, digital, institutional, and partner layers", "Transfer the cadence, artifacts, and decision rights"]
    },
    leadership: {
      title: "Bring the platform that must become locally durable.",
      text: "Regional leaders can contact GE for a confidential conversation about infrastructure, public service, enterprise growth, capability transfer, or a cross-border integration. The route begins with local validation, not a prewritten answer.",
    },
  },
  {
    slug: "asia",
    name: context("asia").name,
    title: "Coordinate speed across a connected system.",
    description: "An Asia-Pacific operating chapter for leaders coordinating supply networks, platforms, research, health, infrastructure, and public systems across many jurisdictions.",
    chapter: {
      label: "Current chapter · network coordination",
      title: "The advantage is shifting from isolated speed to resilient interoperability.",
      text: "Asia-Pacific systems can move quickly because manufacturing, logistics, technology, finance, and public infrastructure are densely connected. That density also makes interfaces consequential. The next chapter is making handoffs, data rights, supplier exposure, and distributed decision-making visible before disruption forces a redesign.",
      signals: ["Supply networks are also data and communications networks", "Interoperability is a leadership and governance problem, not only an architecture problem", "Local language, regulation, and operating rhythm change what scale can mean"],
    },
    horizon: {
      title: "A twenty-year path from network velocity to network resilience.",
      text: "The region’s long horizon is a federation of high-performing operating cells: connected by standards, evidence, and recovery patterns, but close enough to local signals to make decisions before a central queue becomes the bottleneck.",
      steps: [
        { label: "Now → 2031", title: "Expose the interfaces that carry speed.", text: "Map suppliers, data, identity, facilities, energy, logistics, communications, and decision rights across the operating network; define the service that must not fail." },
        { label: "2031 → 2036", title: "Build resilient interoperability.", text: "Create common patterns for platform integration, workforce mobility, partner assurance, and recovery while retaining local operating intelligence." },
        { label: "2036 → 2046", title: "Coordinate distributed intelligence.", text: "Use trusted machine assistance and regional decision cells to improve planning, trade, health, and infrastructure without hiding the human and institutional boundary." },
      ],
    },
    sectors: [
      { label: "Commercial", title: "Make the network a capability, not just a footprint.", text: "Commercial enterprises can connect product, supplier, finance, data, logistics, and workforce decisions around resilience and customer promise. GE helps leadership see where local optimization creates a system-wide constraint.", moves: ["Model critical dependencies across markets and tiers", "Tie capital and customer promises to recovery capacity", "Build cross-border leadership and learning loops"] },
      { label: "Federal", title: "Coordinate national systems without losing strategic autonomy.", text: "Federal leaders need secure, interoperable, and resilient systems that can coordinate across partners while preserving mission authority. GE helps align policy, architecture, procurement, and service continuity.", moves: ["Define what must be shared, sovereign, or locally governed", "Connect infrastructure and communications resilience to mission outcomes", "Build exercises and evidence into the operating rhythm"] },
      { label: "SLED", title: "Turn dense local systems into feedback and capability.", text: "Cities, provinces, schools, universities, and local agencies hold the signals that a regional network needs. GE helps them design services that are adoptable, multilingual, interoperable, and connected to the talent pipeline.", moves: ["Use local service journeys to test regional assumptions", "Connect education, research, and workforce capacity to demand", "Design common platforms with clear local ownership"] },
    ],
    convergence: {
      title: "Speed compounds when every layer can see the handoff.",
      text: "Commercial networks provide scale, federal systems provide strategic direction, and SLED systems provide proximity to people and place. Together they can make digital and intellectual growth more durable by converting network density into shared learning rather than shared fragility.",
      moves: ["A dependency map that crosses company and government boundaries", "Shared evidence and recovery patterns", "A distributed talent and research system tied to real operating problems"],
    },
    difference: {
      title: "GE works at the interface where network advantage is won.",
      text: "We help leaders make cross-border dependencies actionable: which decision belongs where, which platform must interoperate, which promise needs local adaptation, and what evidence will show whether the system is getting stronger.",
      moves: ["Translate speed into an explicit service promise", "Coordinate the interfaces and the decision rights", "Adapt the model without losing the shared outcome"],
    },
    leadership: {
      title: "Bring the network that must move faster and recover better.",
      text: "Asia-Pacific leaders can contact GE for an operating-model, infrastructure, AI, workforce, or cross-border integration conversation. GE will start with the network boundary and the local signals that a generic regional playbook would miss.",
    },
  },
  {
    slug: "latam",
    name: context("latam").name,
    title: "Make trust part of the delivery architecture.",
    description: "A Latin America and Caribbean operating chapter for leaders building adoption, institutional trust, inclusive capability, and resilient services across languages and markets.",
    chapter: {
      label: "Current chapter · trust and adoption",
      title: "The next unit of progress is a service people can understand, use, and recover when it fails.",
      text: "The region’s transformation opportunity is substantial, but adoption cannot be separated from ownership, affordability, language, identity, and the lived experience of institutions. Trust is not a communications layer added after deployment. It is built into the service boundary and the feedback loop.",
      signals: ["Adoption depends on visible ownership and reliable service", "Inclusive digital capability requires language, access, skills, and human fallback", "Regional diversity makes translation and local partnership central to scale"],
    },
    horizon: {
      title: "A twenty-year path from access to agency.",
      text: "The long view is a region where digital systems expand the agency of people, enterprises, and institutions because the underlying service is understandable, maintainable, and connected to local capability—not because technology was deployed at scale.",
      steps: [
        { label: "Now → 2031", title: "Earn trust at the service boundary.", text: "Clarify ownership, identity, data use, accessibility, language, human support, and failure recovery in the services people touch first." },
        { label: "2031 → 2036", title: "Build inclusive regional capability.", text: "Connect public services, enterprise platforms, universities, local partners, and workforce pathways so adoption becomes a source of learning and economic mobility." },
        { label: "2036 → 2046", title: "Scale locally authored intelligence.", text: "Use regional knowledge, data, and research to build systems for health, climate, logistics, finance, education, and civic life that can travel without losing local meaning." },
      ],
    },
    sectors: [
      { label: "Commercial", title: "Turn market reach into durable customer trust.", text: "Commercial leaders can unite product, pricing, channels, operations, finance, and language around a promise that is actually deliverable. GE helps identify adoption friction before it is mistaken for demand failure.", moves: ["Design for local channels, language, affordability, and support", "Make customer and operational data useful without weakening trust", "Build partners and workforce capability into the growth model"] },
      { label: "Federal", title: "Make public digital service feel accountable.", text: "Federal and national institutions can strengthen trust by connecting policy, identity, data, procurement, service design, and human fallback. GE helps create a portfolio that improves reliability while keeping public purpose visible.", moves: ["Begin with the resident or institution’s service journey", "Create clear data ownership and escalation paths", "Sequence modernization around continuity and capability transfer"] },
      { label: "SLED", title: "Make the local edge the source of design intelligence.", text: "States, provinces, cities, municipalities, schools, and universities see where adoption works or fails. GE helps them turn those signals into service improvements, learning pathways, and local operating capability.", moves: ["Co-design with frontline teams and communities", "Connect education and workforce programs to the service system", "Share patterns across cities while protecting local relevance"] },
    ],
    convergence: {
      title: "Trust is the shared infrastructure between market and mission.",
      text: "Commercial, federal, and SLED leaders can strengthen civilization when they make service quality, data responsibility, education, and local agency compound. The shared goal is not a uniform platform; it is a reliable set of pathways into opportunity and public value.",
      moves: ["Common service and data principles with local ownership", "Public-private learning loops tied to real adoption", "Education and research connected to inclusive digital work"],
    },
    difference: {
      title: "GE makes the promise-to-capability gap visible.",
      text: "We connect the strategy, market promise, public mandate, platform, and frontline workflow. That allows leaders to see whether the proposed change can be adopted, supported, recovered, and transferred through local institutions.",
      moves: ["Frame the service promise in lived terms", "Map data, identity, partner, and operating boundaries", "Transfer ownership and improvement practices locally"],
    },
    leadership: {
      title: "Bring the service whose trust must be earned.",
      text: "Leaders across Latin America and the Caribbean can contact GE for a mandate conversation spanning enterprise growth, public service, education, digital infrastructure, or regional integration. The first step is a shared view of the people and institutions the system must serve.",
    },
  },
  {
    slug: "sa",
    name: context("sa").name,
    title: "Build capability around continuity.",
    description: "A South American operating chapter for leaders making infrastructure, logistics, energy, public service, and digital capability durable across uneven operating conditions.",
    chapter: {
      label: "Current chapter · continuity by design",
      title: "The region is proving that resilience is a local operating capability, not a central promise.",
      text: "South American systems often span difficult geography, uneven infrastructure, complex logistics, and diverse institutional conditions. The work is to design a service that can keep its promise in the real operating environment, with local decision rights and practical fallback rather than a dependence on perfect central availability.",
      signals: ["Infrastructure continuity shapes digital and economic opportunity", "Local operators need authority and tools, not only a central standard", "Logistics, energy, communications, finance, and public service are one dependency chain"],
    },
    horizon: {
      title: "A twenty-year path from resilience practice to regional advantage.",
      text: "The region’s long horizon is capability that can absorb disruption and still improve: locally operated services connected by shared evidence, infrastructure investment informed by real constraints, and institutions that turn hard-won adaptation into intellectual and economic advantage.",
      steps: [
        { label: "Now → 2031", title: "Design the degraded mode first.", text: "Map grid, connectivity, transport, facilities, suppliers, identity, data, and workforce constraints; then define what the service does when the preferred route is unavailable." },
        { label: "2031 → 2036", title: "Connect infrastructure and capability investment.", text: "Build partnerships, education pathways, digital public services, and regional operating patterns that let continuity knowledge travel across sectors and borders." },
        { label: "2036 → 2046", title: "Make adaptation a source of innovation.", text: "Use local data, research, and operating practice to create resilient models for energy, agriculture, logistics, health, cities, finance, and public institutions." },
      ],
    },
    sectors: [
      { label: "Commercial", title: "Make resilience part of the growth case.", text: "Commercial leaders can see infrastructure, finance, customer service, and supply networks as one operating system. GE helps them invest in the constraint that actually limits reliable growth rather than the most visible asset.", moves: ["Tie capital allocation to service continuity and recovery", "Map local supplier, energy, logistics, and workforce dependencies", "Build operating models that can adapt without losing customer trust"] },
      { label: "Federal", title: "Turn national infrastructure into dependable public capability.", text: "Federal leaders can align infrastructure, digital government, security, procurement, and economic development around services that remain accountable under constraint. GE helps sequence the portfolio and make the trade-offs legible.", moves: ["Define mission outcomes and continuity thresholds", "Join physical and digital infrastructure planning", "Create local authority, exercises, and evidence for recovery"] },
      { label: "SLED", title: "Let local institutions teach the system how to hold.", text: "State, provincial, municipal, and education systems understand where service promises meet geography, language, access, and workforce reality. GE helps turn those signals into better designs and stronger local capacity.", moves: ["Start with frontline and community operating conditions", "Connect education to infrastructure and digital careers", "Build shared platforms with local ownership and graceful fallback"] },
    ],
    convergence: {
      title: "Continuity makes digital and intellectual growth tangible.",
      text: "Commercial capital, federal coordination, and SLED proximity can create stronger civilization when they treat continuity as a shared learning problem. Every constraint becomes a chance to improve infrastructure, service design, local talent, and institutional trust together.",
      moves: ["A common view of the physical and digital dependency chain", "Local decision rights backed by shared evidence", "Research and education connected to the region’s real constraints"],
    },
    difference: {
      title: "GE brings the constraint into the strategy room.",
      text: "We help leaders connect the board-level growth case to the operator’s fallback path: the facility, route, supplier, policy, data, workforce, and decision that determine whether the system can keep serving people.",
      moves: ["Frame continuity as a service and investment question", "Map the dependencies and the owner for each boundary", "Transfer a cadence that improves with each disruption"],
    },
    leadership: {
      title: "Bring the capability that must keep working in the real world.",
      text: "South American leaders can contact GE for an infrastructure, operating-model, public-service, AI, workforce, or integration conversation. We will begin with the actual constraint, local authority, and service promise—not a generic maturity label.",
    },
  },
];

export const regionDirectory = regionPages.map(({ slug, name, title }) => ({ slug, name, title }));
