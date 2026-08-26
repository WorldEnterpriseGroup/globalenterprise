const formEndpoint = "https://formsubmit.co/info@globalenterprise.com";

export const site = {
  name: "Global Enterprise",
  shortName: "Global",
  url: "https://globalenterprise.com",
  description:
    "Global Enterprise is a senior strategy, AI/ML, data, frontier research, and enterprise change partner for institutions shaping the next order of complexity.",
  email: "info@globalenterprise.com",
  phone: "+1 929 229 2918",
  location: "New York · Remote-first · Built for the world",
  formEndpoint,
  analytics: {
    plausibleDomain: "globalenterprise.com",
  },
  social: {
    linkedin: "",
  },
};

export const navItems = [
  { label: "Capabilities", href: "/services/" },
  { label: "Approach", href: "/about/" },
  { label: "Industries", href: "/industries/" },
  { label: "Work", href: "/case-studies/" },
  { label: "Insights", href: "/insights/" },
  { label: "Careers", href: "/careers/" },
];

export const services = [
  {
    number: "1",
    slug: "operating-model",
    title: "Operating model design",
    short: "Make the work make sense.",
    description:
      "Clarify decision rights, accountability, and the way teams move from intent to execution.",
    tags: ["Strategy", "Policy", "Change"],
  },
  {
    number: "2",
    slug: "intelligent-automation",
    title: "Enterprise AI & ML labs",
    short: "Put intelligence inside the operating model.",
    description:
      "Stand up AI labs, ML portfolios, agentic workflows, evaluation systems, and human accountability that can survive enterprise risk and scale.",
    tags: ["AI/ML", "AI Labs", "Governance"],
  },
  {
    number: "3",
    slug: "cloud-data",
    title: "Data labs & AI cost management",
    short: "Make intelligence economically durable.",
    description:
      "Build the data lab, platform, governance, FinOps, and AI cost controls required to turn data and compute into a managed strategic asset.",
    tags: ["Data Labs", "AI Cost", "FinOps"],
  },
  {
    number: "4",
    slug: "leadership-talent",
    title: "Leadership & talent",
    short: "Turn capability into capacity.",
    description:
      "Shape the culture, teams, and leadership systems required for sustained performance—not one-off change.",
    tags: ["People", "Culture", "Capability"],
  },
  {
    number: "5",
    slug: "transformation-office",
    title: "ITIL change management",
    short: "Make high-stakes change repeatable.",
    description:
      "Bring decades of ITIL change practice to modernization, AI adoption, mission transformation, release governance, and executive decision cadence.",
    tags: ["ITIL", "Change", "Mission"],
  },
  {
    number: "6",
    slug: "research-foresight",
    title: "Quantum intelligence & foresight",
    short: "Work at the edge of the possible.",
    description:
      "Translate frontier research, quantum intelligence, market signals, technology shifts, and policy change into decisions leaders can act on before the signal becomes noise.",
    tags: ["Quantum", "Research", "Scenarios"],
  },
];

export const industries = [
  {
    number: "1",
    title: "Global enterprises & operating systems",
    slug: "enterprise-services",
    description: "Align operating models, enterprise platforms, and leadership systems as the organization grows more complex.",
    signal: "The UN’s 2026 SDG report says progress is meaningful but uneven, with technology, data, energy transition, and international cooperation requiring a decisive push before 2030.",
    source: "https://unstats.un.org/sdgs/report/2026/",
    sourceLabel: "United Nations · Sustainable Development Goals Report 2026",
    focus: ["Operating model clarity", "Service and process design", "Leadership capacity"],
    direction: "The next advantage for enterprise services is not another layer of process. It is an operating model that makes judgment faster, service promises explicit, and scarce expertise easier to move to the work that matters.",
    plays: [
      { label: "Service architecture", title: "Make the invisible handoffs visible.", text: "We map the moments where a customer, employee, or executive experiences the enterprise—not just the boxes in the org chart—then design ownership around the promise." },
      { label: "Capability portfolio", title: "Treat skills as an operating asset.", text: "The current workforce challenge is not a course catalog. It is a portfolio of role design, leadership practice, and learning loops tied to measurable work." },
      { label: "Decision velocity", title: "Move authority closer to the signal.", text: "We clarify which decisions belong at the center, which belong in the business, and which should be encoded into a platform or workflow." },
    ],
    href: "/industries/enterprise-services/",
  },
  {
    number: "2",
    title: "Bio & health systems",
    slug: "healthcare-life-sciences",
    description: "Connect clinical, administrative, and technology decisions so healthcare organizations can improve care without adding operational drag.",
    signal: "ONC’s February 2026 brief reports that about nine in ten hospitals enabled patient access to health information through an API, while most third-party exchange still used non-standards-based approaches.",
    source: "https://healthit.gov/data/data-briefs/hospital-use-of-apis-to-enable-data-sharing-between-ehrs-and-third-party-technology/",
    sourceLabel: "ONC · Hospital APIs and Third-Party Technology · February 2026",
    focus: ["Interoperability strategy", "Clinical and administrative workflows", "Data governance"],
    direction: "Healthcare’s next frontier is not more data in the abstract. It is less distance between a reliable signal and a clinical, operational, or financial decision—with privacy, safety, and human accountability designed in.",
    plays: [
      { label: "Interoperability", title: "Design for use, not exchange.", text: "ONC’s current API evidence shows that access is common while coherent, standards-based exchange remains uneven. We trace the workflow from source to decision, then remove the friction that keeps good data passive." },
      { label: "Clinical operations", title: "Protect attention as a scarce resource.", text: "We redesign handoffs, queues, and escalation paths so automation reduces cognitive load rather than adding another dashboard to a clinician’s day." },
      { label: "Life sciences", title: "Turn evidence into a repeatable operating rhythm.", text: "We connect research, quality, supply, and commercial teams around evidence flows that can withstand regulatory scrutiny and still move at the speed of discovery." },
    ],
    href: "/industries/healthcare-life-sciences/",
  },
  {
    number: "3",
    title: "Digital public institutions",
    slug: "federal-public-service",
    description: "Turn mission, policy, and legacy technology into an operating system that can deliver trusted public outcomes at scale.",
    signal: "Data.gov’s July 2026 catalog lists more than 363,000 public datasets, making stewardship, discoverability, and API quality part of the public-service operating model.",
    source: "https://data.gov/",
    sourceLabel: "Data.gov · catalog updated July 29, 2026",
    focus: ["Mission and solution strategy", "ITIL change management", "Modernization governance"],
    direction: "Public value is delivered through operating systems: policy translated into services, services carried by people, and technology that stays accountable to mission. Modernization is the work of reconnecting those layers.",
    plays: [
      { label: "Mission architecture", title: "Start with the outcome a resident can feel.", text: "We translate statutory intent and executive priorities into service promises, decision rights, and measurable outcomes that can guide technology and procurement." },
      { label: "Legacy portfolio", title: "Choose the right future for each system.", text: "A large public data estate is a portfolio signal. We help leaders decide what to retire, re-platform, wrap, or redesign—without pretending every system needs the same answer." },
      { label: "Change at scale", title: "Make adoption part of the control environment.", text: "A decade of ITIL change-management practice informs our cadence: controlled releases, visible dependencies, accountable owners, and feedback from the people who deliver the mission." },
    ],
    href: "/industries/federal-public-service/",
  },
  {
    number: "4",
    title: "Technology & data infrastructure",
    slug: "technology-data",
    description: "Create cloud, data, security, and automation foundations that make technology a business advantage rather than a growing dependency.",
    signal: "NATO’s 2026 Alliance Digital Strategy calls for standardized data labeling, metadata, access controls, federated identity, and interoperable digital platforms through 2035.",
    source: "https://www.nato.int/en/about-us/official-texts-and-resources/official-texts/2026/01/13/alliance-digital-strategy",
    sourceLabel: "NATO · Alliance Digital Strategy · Vision for 2035",
    focus: ["Cloud and data architecture", "Third-party risk", "Responsible automation"],
    direction: "Technology leaders are being asked to create speed without creating fragility. The answer is a platform strategy that treats architecture, security, data quality, and developer experience as one operating system.",
    plays: [
      { label: "Platform economics", title: "Make the paved road the rational road.", text: "We align reusable platform capabilities to the decisions the business needs to make, so teams gain speed without multiplying hidden dependencies." },
      { label: "Security by design", title: "Extend accountability through the supply chain.", text: "NATO’s 2035 digital direction makes data labeling, access control, interoperability, and mission assurance strategic capabilities. We connect controls, evidence, contracts, and operational response." },
      { label: "Data products", title: "Give ownership a job to do.", text: "A data catalog is not a strategy. We design domain ownership, quality measures, access patterns, and decision use cases that make data trustworthy because it is useful." },
    ],
    href: "/industries/technology-data/",
  },
  {
    number: "8",
    title: "Frontier intelligence & autonomous systems",
    slug: "frontier-intelligence-autonomous-systems",
    description: "Connect advanced computation, autonomy, intelligence workflows, and enterprise change when the margin for error is narrow.",
    signal: "The next generation of organizations will be defined by how well they combine human judgment with autonomous systems, advanced computation, and trustworthy data.",
    source: "https://www.nasa.gov/",
    sourceLabel: "NASA · mission and technology",
    focus: ["Autonomy and mission assurance", "Intelligence data and decision flow", "Secure change at program scale"],
    direction: "The highest-consequence organizations do not need more disconnected innovation. They need an intelligence architecture that joins mission intent, data provenance, advanced computation, program economics, and change control without compromising judgment or trust.",
    plays: [
      { label: "Mission architecture", title: "Keep the mission visible through the stack.", text: "We connect strategic intent to program architecture, decision rights, operational telemetry, and the controls required to maintain assurance over time." },
      { label: "Intelligence advantage", title: "Move from data volume to decision superiority.", text: "We design data labs and AI/ML workflows around the decisions that matter, with provenance, access, evaluation, and human accountability built in." },
      { label: "Program change", title: "Make transformation survivable at program scale.", text: "Decades of ITIL change-management practice help leaders sequence releases, expose dependencies, and protect continuity across complex portfolios." },
    ],
    href: "/industries/frontier-intelligence-autonomous-systems/",
  },
  {
    number: "5",
    title: "Learning & human capability",
    slug: "education",
    description: "Help education leaders connect mission, operations, and the technology that supports learning communities.",
    signal: "OECD’s 2026 AI and skills research ties positive AI outcomes to training, evaluation ability, and a workplace that gives new capability somewhere useful to land.",
    source: "https://www.oecd.org/en/publications/ai-and-skills_f843b352-en/full-report.html",
    sourceLabel: "OECD · AI and Skills · 2026",
    focus: ["Institutional operating models", "Student and staff experience", "Digital capability"],
    direction: "Education is being asked to do two jobs at once: preserve the human purpose of learning while building the capabilities a changing economy will demand. Institutions need operating models that make both possible.",
    plays: [
      { label: "Learner experience", title: "Design the journey across the seams.", text: "We connect academic, advising, enrollment, and technology decisions around the moments where learners experience the institution as one system." },
      { label: "Workforce readiness", title: "Make capability-building measurable.", text: "OECD’s current research reinforces the point: capability is not solved by a course catalog alone. We tie emerging skills to curriculum, faculty enablement, employer signal, and outcomes." },
      { label: "Digital trust", title: "Use AI to deepen learning, not dilute it.", text: "We help leaders establish clear use cases, guardrails, and human review so technology supports pedagogy and institutional trust." },
    ],
    href: "/industries/education/",
  },
  {
    number: "9",
    title: "State, local & education (SLED)",
    slug: "sled",
    description: "Help state agencies, local governments, and K–12/higher-ed institutions modernize services, govern data, and adopt AI in a way that is accountable to residents and communities.",
    signal: "The National League of Cities 2026 State of Cities report finds that municipal leaders cite digital service delivery, workforce readiness, and data governance as the top three cross-sector priorities for the current fiscal cycle.",
    source: "https://www.nlc.org/resource/state-of-cities-2026/",
    sourceLabel: "National League of Cities · State of Cities Report · 2026",
    focus: ["Digital service delivery", "Data governance and resident trust", "Workforce and AI readiness"],
    direction: "State and local governments and educational institutions carry a unique accountability: they must modernize quickly, serve every resident, and preserve public trust—all at once. The pathway forward is not the same as the federal or commercial path; it is a community-grounded operating model that connects mission, budget, data, and people.",
    plays: [
      { label: "Digital services", title: "Design services residents can actually use.", text: "We map the resident journey, not the agency org chart, then redesign the handoffs, forms, queues, and escalation paths that create friction at the point of need." },
      { label: "Data governance", title: "Make public data a public trust asset.", text: "We help SLED leaders establish data ownership, quality, access controls, and transparency practices that build resident confidence and enable better decisions." },
      { label: "AI readiness", title: "Adopt AI in a way the community can hold accountable.", text: "From K–12 to state IT, we sequence AI adoption around measurable outcomes, clear human accountability, and the regulatory and ethical guardrails public-sector leaders require." },
    ],
    href: "/industries/sled/",
  },
  {
    number: "6",
    title: "AI-native operations",
    slug: "enterprise-ai",
    description: "Move from scattered pilots to a governed portfolio of AI-enabled work that leaders can measure, improve, and trust.",
    signal: "DOE’s 2026 grid modernization agenda proposes AI-enabled planning, interconnection, operations, and security that could make decision cycles 20–100 times faster while improving cost and reliability.",
    source: "https://www.energy.gov/undersecretaryforscience/genesis-mission/scaling-grid-power-american-economy",
    sourceLabel: "U.S. Department of Energy · Scaling the Grid to Power the American Economy",
    focus: ["AI portfolio strategy", "Human-in-the-loop workflows", "Governance and adoption"],
    direction: "Enterprise AI has crossed the pilot threshold. The differentiator now is not access to a model; it is the ability to select valuable work, redesign the workflow, govern the risk, and learn faster than the portfolio changes.",
    plays: [
      { label: "Portfolio design", title: "Fund workflows, not demos.", text: "We rank opportunities by decision value, data readiness, adoption friction, and control requirements, then sequence a portfolio leaders can actually govern." },
      { label: "AI security", title: "Build for continuous challenge.", text: "Current AI systems sit inside critical workflows and infrastructure. We design evaluation, red-teaming, monitoring, and recovery into the operating rhythm rather than treating assurance as a final gate." },
      { label: "Adoption system", title: "Give every new capability a home.", text: "The real product is a changed way of working. We define human accountability, exception paths, measures, and the leadership cadence that keeps adoption useful." },
    ],
    href: "/industries/enterprise-ai/",
  },
  {
    number: "7",
    title: "Resilient infrastructure & energy",
    slug: "energy-infrastructure",
    description: "Align capital, grid modernization, digital operations, and resilience as infrastructure becomes the platform for economic growth.",
    signal: "DOE’s July 2026 Paducah partnership pairs a 1.8 GW AI campus with new generation, 2.6 GW of battery storage, and transmission upgrades—an operating-model problem disguised as a facilities project.",
    source: "https://www.energy.gov/articles/energy-department-announces-partnership-expand-reliable-affordable-energy-access-and-power",
    sourceLabel: "U.S. Department of Energy · Paducah AI and Energy Partnership · July 2026",
    focus: ["Grid and asset strategy", "Resilience and supply chain", "Capital-to-operations translation"],
    direction: "DOE’s current AI-and-energy projects make the 2035 question concrete: how do leaders turn generation, storage, transmission, digital operations, and public accountability into reliable service rather than disconnected capital programs?",
    plays: [
      { label: "System planning", title: "Sequence the grid before the grid sequences you.", text: "We translate demand, reliability, resilience, and affordability goals into an investment roadmap with explicit dependencies across assets, data, permitting, and operations." },
      { label: "Digital operations", title: "Make the control room an enterprise capability.", text: "We connect asset data, workforce readiness, cybersecurity, and decision rights so new complexity becomes observable and manageable." },
      { label: "Supply chain resilience", title: "Treat critical components as strategy.", text: "DOE’s current electricity strategy emphasizes component availability and supply-chain security. We help leaders model the exposure, alternatives, and operating response." },
    ],
    href: "/industries/energy-infrastructure/",
  },
];

export const publicSignals = [
  {
    value: "363k+",
    label: "public datasets in the current catalog",
    text: "Data.gov reported more than 363,000 datasets in its July 2026 catalog. The strategic question is not whether data exists; it is whether leaders can find, trust, govern, and use it for a decision.",
    source: "https://data.gov/",
    sourceLabel: "Data.gov · catalog updated July 29, 2026",
  },
  {
    value: "2035",
    label: "NATO’s digital horizon",
    text: "NATO’s 2026 Alliance Digital Strategy extends its digital transformation trajectory to 2035, emphasizing secure interoperability, metadata, federated access, mission assurance, and responsible use.",
    source: "https://www.nato.int/en/about-us/official-texts-and-resources/official-texts/2026/01/13/alliance-digital-strategy",
    sourceLabel: "NATO · Alliance Digital Strategy · Vision for 2035",
  },
  {
    value: "9 in 10",
    label: "hospitals enabling patient API access",
    text: "ONC’s February 2026 brief reports that about nine in ten hospitals enabled patient access to health information through an API, while third-party exchange remains unevenly standardized.",
    source: "https://healthit.gov/data/data-briefs/hospital-use-of-apis-to-enable-data-sharing-between-ehrs-and-third-party-technology/",
    sourceLabel: "ONC · Hospital APIs and Third-Party Technology · February 2026",
  },
  {
    value: "20–100x",
    label: "DOE’s AI-enabled grid decision ambition",
    text: "DOE’s 2026 Genesis grid strategy proposes AI-enabled planning, interconnection, operations, and security that could accelerate decision-making by 20–100 times while improving cost and reliability.",
    source: "https://www.energy.gov/undersecretaryforscience/genesis-mission/scaling-grid-power-american-economy",
    sourceLabel: "U.S. Department of Energy · Scaling the Grid · 2026",
  },
  {
    value: "2030",
    label: "the UN’s remaining SDG decision window",
    text: "The UN’s 2026 SDG report says progress is meaningful but insufficient and calls for stronger investment, technology and data access, faster energy transition, and renewed international cooperation before 2030.",
    source: "https://unstats.un.org/sdgs/report/2026/",
    sourceLabel: "United Nations · Sustainable Development Goals Report 2026",
  },
];

export const businessReports = [
  {
    slug: "enterprise-decision-readiness",
    eyebrow: "Operating system",
    title: "Enterprise Decision Readiness Report",
    summary: "A practical readout of mandate clarity, data trust, AI readiness, and capability ownership so leaders can decide what to fix first.",
    description:
      "This evergreen operating report keeps the focus on public evidence. It helps leaders separate a genuine bottleneck from an avoidable delay, then sequence decisions that improve execution speed without adding fragility.",
    highlights: ["Mandate definition, ownership, and escalation mechanics", "Evidence pathways for operational decisions", "Where AI and human review should remain explicitly coupled", "How capability gaps show up before cost or compliance gaps"],
    takeaways: ["A decision stack is legible when owners are explicit.", "Most modernization risk sits in handoffs, not the code stack.", "Data is only useful when it is governed to the point of work."],
    file: "/reports/enterprise-decision-readiness.txt",
    sources: [
      { label: "UN SDG Report 2026", url: "https://unstats.un.org/sdgs/report/2026/" },
      { label: "Data.gov catalog", url: "https://data.gov/" },
    ],
  },
  {
    slug: "ai-governance-controls",
    eyebrow: "Governance",
    title: "AI Governance and Interoperability Controls Report",
    summary: "A decision-friendly guide to designing controlled AI, exchange, and human oversight in high-friction institutions.",
    description:
      "Use this report to move from tool-level questions to workflow-level control. It translates publicly observed interoperability and security expectations into a practical operating rhythm.",
    highlights: ["Signals for API and interoperability readiness", "Control boundaries for human-in-the-loop workflows", "Measure, monitor, and recovery patterns that keep trust intact"],
    takeaways: ["Control design should be anchored in the workflow, not the model stack.", "Governance should preserve useful authority at every layer.", "Public institutions and enterprise systems both need a deliberate exception process."],
    file: "/reports/ai-governance-controls.txt",
    sources: [
      { label: "ONC API access brief", url: "https://healthit.gov/data/data-briefs/hospital-use-of-apis-to-enable-data-sharing-between-ehrs-and-third-party-technology/" },
      { label: "NATO Digital Strategy 2026", url: "https://www.nato.int/en/about-us/official-texts-and-resources/official-texts/2026/01/13/alliance-digital-strategy" },
    ],
  },
  {
    slug: "modernization-investment-priority",
    eyebrow: "Modernization",
    title: "Modernization and Investment Priority Report",
    summary: "A long-cycle planning tool for institutions balancing mission, risk, and capital across infrastructure, cloud, and data decisions.",
    description:
      "The report converts complex modernization choices into a staged sequence. It helps teams spot what should be retired, wrapped, replaced, or redesigned first.",
    highlights: ["Portfolio-level sequencing across mission, systems, and skills", "Cost, dependency, and continuity risks in one view", "Capital-to-operations transition plans that preserve capability"],
    takeaways: ["Modernization is a management problem before it is a technology problem.", "Resilience starts with explicit transition design between legacy and new systems.", "The first durable win is usually in decision rights, not tooling."],
    file: "/reports/modernization-investment-priority.txt",
    sources: [
      { label: "DOE AI-enabled grid planning context", url: "https://www.energy.gov/undersecretaryforscience/genesis-mission/scaling-grid-power-american-economy" },
      { label: "NIST AI risk and reliability work", url: "https://www.nist.gov/" },
    ],
  },
];

export const experienceHighlights = [
  { number: "20+", label: "years at the frontier of change", text: "Our work has evolved with emerging technology and ITIL change practice for more than two decades, always translating new capability into durable operating advantage." },
  { number: "AI", label: "award-recognized AI leadership", text: "Our founders have been recognized repeatedly for AI leadership. We bring that research posture to enterprise AI/ML, AI cost management, and governed adoption." },
  { number: "501c3", label: "research institute partnership", text: "Through our partnership with INSTAR Lab Inc, a 501(c)(3) research institute, we contribute to cutting-edge research across frontier intelligence and emerging systems." },
];

export const engagements = [
  {
    number: "Clarity",
    title: "Principal mandate session",
    duration: "Private session",
    fit: "When a consequential decision needs a sharper frame.",
    deliverable: "A decision surface, working hypotheses, and a disciplined next-move brief.",
    href: "/contact/",
  },
  {
    number: "Diagnosis",
    title: "Intelligence system diagnostic",
    duration: "Targeted 2–4 weeks",
    fit: "When the constraint is distributed across the institution.",
    deliverable: "A prioritized diagnostic across intelligence, economics, operating model, architecture, and capability.",
    href: "/contact/",
  },
  {
    number: "Partnership",
    title: "Institutional transformation partnership",
    duration: "Long-horizon",
    fit: "When the institution needs a new capability, not another program.",
    deliverable: "Strategy, research, architecture, cost governance, change cadence, and capability transfer.",
    href: "/contact/",
  },
];

export const startingPoints = [
  {
    id: "decisions",
    label: "The institution needs a clearer decision architecture",
    text: "Start with operating model design that makes authority, evidence, measures, and cross-boundary accountability visible.",
    href: "/services/operating-model/",
    linkLabel: "Explore operating model design",
  },
  {
    id: "ai",
    label: "AI/ML is not yet an operating capability",
    text: "Start with an AI lab and design the workflow, evaluation, guardrails, human role, and adoption rhythm together.",
    href: "/services/intelligent-automation/",
    linkLabel: "Explore enterprise AI labs",
  },
  {
    id: "foundation",
    label: "Data and compute economics are not governed",
    text: "Start with a data lab and AI cost-management model that connect architecture, unit economics, provenance, and decision value.",
    href: "/services/cloud-data/",
    linkLabel: "Explore data labs and AI cost management",
  },
  {
    id: "capability",
    label: "The institution needs a new capability model",
    text: "Start with leadership, talent, and change systems that let emerging capability become a durable way of working.",
    href: "/services/leadership-talent/",
    linkLabel: "Explore human capability",
  },
];

export const solutionPages = [
  {
    slug: "enterprise-ai",
    eyebrow: "Enterprise AI",
    title: "Move AI from scattered pilots to a system leaders can govern.",
    description: "Choose the workflows worth changing, make accountability visible, and build the evidence loop that turns adoption into durable operating value.",
    promise: "AI becomes useful when the organization can decide where it belongs, how it is supervised, and what better looks like.",
    focus: ["Portfolio and use-case sequencing", "Human-in-the-loop workflow design", "Evaluation, governance, and adoption"],
    moves: ["Rank workflows by decision value and risk", "Design the service around the people who carry the outcome", "Measure quality, latency, adoption, and exceptions together"],
    serviceSlugs: ["intelligent-automation", "transformation-office", "research-foresight"],
  },
  {
    slug: "modernization",
    eyebrow: "Modernization",
    title: "Make the next modernization decision with the whole system in view.",
    description: "Connect legacy portfolio choices to mission continuity, architecture, funding, risk, and the people who will operate the future state.",
    promise: "Modernization is not a software refresh; it is a portfolio of decisions about what to retire, wrap, re-platform, or redesign.",
    focus: ["Legacy portfolio strategy", "Target architecture and sequencing", "Change, funding, and service continuity"],
    moves: ["Make dependencies and disposition options visible", "Choose the smallest release that creates evidence", "Transfer the cadence and capability needed to keep improving"],
    serviceSlugs: ["operating-model", "cloud-data", "transformation-office"],
  },
  {
    slug: "operating-model",
    eyebrow: "Operating model",
    title: "Turn leadership intent into a system teams can actually run.",
    description: "Clarify decision rights, service promises, handoffs, measures, and management rhythms so the organization can move with more consistency without flattening expertise.",
    promise: "The model is real when the next decision is easier, the next handoff is cleaner, and accountability holds at the point of work.",
    focus: ["Decision rights and accountability", "Service and process architecture", "Measures and operating cadence"],
    moves: ["Map where work and decisions actually travel", "Design ownership around the promise", "Make the new rhythm observable and improvable"],
    serviceSlugs: ["operating-model", "leadership-talent", "transformation-office"],
  },
  {
    slug: "healthcare-transformation",
    eyebrow: "Healthcare transformation",
    title: "Reduce the distance between reliable signal and better care.",
    description: "Connect clinical, administrative, technology, and governance decisions so healthcare organizations can improve outcomes without adding operational drag.",
    promise: "Healthcare transformation works when data is not merely exchanged; it is usable at the moment a person has to decide.",
    focus: ["Interoperability that reaches the point of care", "Clinical and administrative workflow design", "Safety, privacy, and adoption"],
    moves: ["Trace information from source to decision", "Protect attention as a scarce clinical resource", "Build human accountability into every new capability"],
    serviceSlugs: ["operating-model", "cloud-data", "intelligent-automation"],
  },
  {
    slug: "data-labs-ai-cost-management",
    eyebrow: "Data labs & AI cost management",
    title: "Turn data and compute into a strategic asset leaders can govern.",
    description: "Build the data lab, FinOps discipline, AI cost controls, and operating model required to scale intelligence without losing economic or architectural control.",
    promise: "The data lab becomes an enterprise capability when every important signal has an owner, every unit of compute has a reason, and every investment creates evidence for the next decision.",
    focus: ["Data lab strategy and build-out", "AI cost, FinOps, and unit economics", "Data products, lineage, access, and stewardship"],
    moves: ["Map the decision portfolio and the data products behind it", "Make model, platform, and inference cost visible by use case", "Establish the governance and delivery rhythm that keeps the lab useful"],
    serviceSlugs: ["cloud-data", "intelligent-automation", "transformation-office"],
  },
  {
    slug: "quantum-intelligence",
    eyebrow: "Quantum intelligence",
    title: "Give frontier intelligence a disciplined path into strategy.",
    description: "Explore quantum intelligence, advanced optimization, sensing, and scenario design through a research-to-decision model built for leaders with long horizons and real constraints.",
    promise: "Frontier research earns its place when it clarifies a strategic option, improves a high-value decision, or gives an institution time to prepare before the capability becomes ordinary.",
    focus: ["Quantum and advanced-intelligence research", "Scenario, sensing, and optimization strategy", "Research partnerships and enterprise readiness"],
    moves: ["Define the strategic question before selecting the frontier technology", "Test the signal, economics, and organizational readiness together", "Create a path from research insight to a governed enterprise experiment"],
    serviceSlugs: ["research-foresight", "cloud-data", "intelligent-automation"],
  },
];

export const navigationPanel = {
  explore: [
    { label: "Our point of view", href: "/about/", description: "How a future-facing advisory house makes complexity governable." },
    { label: "Selected work", href: "/case-studies/", description: "Field notes from operating models, AI, and institutional change." },
    { label: "Insights", href: "/insights/", description: "Evidence and original analysis for the moment when the signal becomes a decision." },
    { label: "Business reports", href: "/resources/", description: "Research-backed, decision-ready reports for leaders carrying institutional consequence." },
    { label: "Strategic pathways", href: "/solutions/", description: "Focused entry points for consequential decisions across the system." },
  ],
  capabilities: services.map((service) => ({ ...service, href: `/services/${service.slug}/` })),
  industries,
  company: [
    { label: "Team", href: "/team/", description: "The senior disciplines we bring close to the decision." },
    { label: "Careers", href: "/careers/", description: "Thoughtful operators with range are always welcome." },
    { label: "FAQ", href: "/faq/", description: "The essentials for a senior partnership." },
    { label: "Contact", href: "/contact/", description: "Request a private principal dialogue." },
  ],
  feature: {
    label: "Research partnership",
    title: "Frontier intelligence needs an enterprise path.",
    description: "Our 501(c)(3) research institute partnership with INSTAR Lab Inc keeps cutting-edge inquiry connected to responsible experimentation and high-consequence decisions.",
    href: "/solutions/quantum-intelligence/",
  },
};

export const faqItems = [
  { question: "What belongs in an executive brief?", answer: "The mandate, the consequence, the decision that is blocked, and the scale of the system around it. Do not send classified, export-controlled, or otherwise sensitive material through the public form; we establish the right channel for that context." },
  { question: "What level of work do you take on?", answer: "We advise at the level where strategy becomes operational: enterprise AI/ML portfolios, AI cost management, data lab build-outs, mission systems, modernization, quantum intelligence, and the change architecture that makes the result durable." },
  { question: "Do you work with internal teams or take over delivery?", answer: "Both, in the right proportion. We can shape the strategy, stand up the lab or transformation office, support delivery, or embed alongside an existing team. The goal is stronger institutional capability, not dependency." },
  { question: "How do you approach AI in a regulated or mission-critical environment?", answer: "We begin with the decision and the risk boundary, not the model. We map the workflow, define human accountability, establish evaluation and recovery controls, and use NIST plus agency or sector requirements as operating inputs." },
  { question: "What is the INSTAR Lab partnership?", answer: "INSTAR Lab Inc is our 501(c)(3) research institute partner. Together we contribute to cutting-edge research and keep a live bridge between frontier inquiry, responsible experimentation, and enterprise decisions." },
  { question: "Where do you work?", answer: "We work with leaders whose decisions shape complex institutions, infrastructure, technology, and human systems across North America and beyond. Sensitive engagements are scoped through an appropriate secure channel." },
];

export const principles = [
  {
    marker: "Clarity",
    title: "Make consequence legible",
    text: "Complexity is not a strategy. We make the choices, tradeoffs, evidence, and next moves visible to the people accountable for them.",
  },
  {
    marker: "Frontier + discipline",
    title: "Explore with control",
    text: "Research, AI, and quantum intelligence need room to move and a management system strong enough to make the risk explicit.",
  },
  {
    marker: "Institutional strength",
    title: "Leave the system stronger",
    text: "The best engagement makes the institution more capable after we leave the room: clearer ownership, better evidence, and a cadence that holds.",
  },
];

export const footerColumns = [
  {
    title: "Explore",
    links: navItems,
  },
  {
    title: "Start here",
    links: [
      { label: "Book a conversation", href: "/contact/" },
      { label: "Case studies", href: "/case-studies/" },
      { label: "Solutions", href: "/solutions/" },
      { label: "Team", href: "/team/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Visual sitemap", href: "/visual-sitemap/" },
    ],
  },
  {
    title: "Resources",
    links: businessReports.map((report) => ({ label: report.title, href: `/resources/${report.slug}/` })),
  },
];
