const formEndpoint = "https://formsubmit.co/info@globalenterprise.com";

export const site = {
  name: "Global Enterprise",
  shortName: "Global",
  url: "https://globalenterprise.com",
  description:
    "Global Enterprise helps leaders turn complex operations into durable advantage through strategy, intelligent automation, cloud architecture, and enterprise talent.",
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
    image: "/media/generated/enterprise-hero.avif",
  },
  {
    number: "2",
    slug: "intelligent-automation",
    title: "Intelligent automation",
    short: "Give good people better leverage.",
    description:
      "Remove repetitive work with practical AI, automation, and enterprise platforms that teams can actually adopt.",
    tags: ["AI", "ERP", "Workflow"],
    image: "/media/generated/ai-governance.avif",
  },
  {
    number: "3",
    slug: "cloud-data",
    title: "Cloud & data foundations",
    short: "Build the infrastructure behind better decisions.",
    description:
      "Design secure, observable cloud and data environments that keep the business moving as it grows.",
    tags: ["Cloud", "Data", "Security"],
    image: "/media/generated/technology-data.avif",
  },
  {
    number: "4",
    slug: "leadership-talent",
    title: "Leadership & talent",
    short: "Turn capability into capacity.",
    description:
      "Shape the culture, teams, and leadership systems required for sustained performance—not one-off change.",
    tags: ["People", "Culture", "Capability"],
    image: "/media/generated/education-future.avif",
  },
  {
    number: "5",
    slug: "transformation-office",
    title: "Transformation office",
    short: "Keep momentum after the kickoff.",
    description:
      "Stand up the cadence, measures, and operating rhythm that move transformation from plan to habit.",
    tags: ["Delivery", "Metrics", "Governance"],
    image: "/media/generated/federal-mission.avif",
  },
  {
    number: "6",
    slug: "research-foresight",
    title: "Research & foresight",
    short: "See around the next corner.",
    description:
      "Translate market signals, technology shifts, and policy change into decisions your leaders can act on.",
    tags: ["Signals", "Markets", "Scenarios"],
    image: "/media/generated/energy-grid.avif",
  },
];

export const industries = [
  {
    number: "1",
    title: "Enterprise services",
    slug: "enterprise-services",
    description: "Align operating models, enterprise platforms, and leadership systems as the organization grows more complex.",
    signal: "The World Economic Forum expects 39% of workers’ core skills to change by 2030.",
    source: "https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed/",
    sourceLabel: "World Economic Forum · Future of Jobs 2025",
    focus: ["Operating model clarity", "Service and process design", "Leadership capacity"],
    image: "/media/generated/enterprise-hero.avif",
    direction: "The next advantage for enterprise services is not another layer of process. It is an operating model that makes judgment faster, service promises explicit, and scarce expertise easier to move to the work that matters.",
    plays: [
      { label: "Service architecture", title: "Make the invisible handoffs visible.", text: "We map the moments where a customer, employee, or executive experiences the enterprise—not just the boxes in the org chart—then design ownership around the promise." },
      { label: "Capability portfolio", title: "Treat skills as an operating asset.", text: "With 39% of core skills expected to change by 2030, the answer is a portfolio of role design, leadership practice, and learning loops tied to measurable work." },
      { label: "Decision velocity", title: "Move authority closer to the signal.", text: "We clarify which decisions belong at the center, which belong in the business, and which should be encoded into a platform or workflow." },
    ],
    href: "/industries/enterprise-services/",
  },
  {
    number: "2",
    title: "Healthcare & life sciences",
    slug: "healthcare-life-sciences",
    description: "Connect clinical, administrative, and technology decisions so healthcare organizations can improve care without adding operational drag.",
    signal: "ONC found that 70% of hospitals engaged in all four interoperability domains in 2023, but only 42% said clinicians often used external information at the point of care.",
    source: "https://healthit.gov/data/data-briefs/interoperable-exchange-patient-health-information-among-us-hospitals-2023/",
    sourceLabel: "ONC · Interoperable Exchange of Patient Health Information",
    focus: ["Interoperability strategy", "Clinical and administrative workflows", "Data governance"],
    image: "/media/generated/healthcare-data.avif",
    direction: "Healthcare’s next frontier is not more data in the abstract. It is less distance between a reliable signal and a clinical, operational, or financial decision—with privacy, safety, and human accountability designed in.",
    plays: [
      { label: "Interoperability", title: "Design for use, not exchange.", text: "ONC data shows that access has outpaced point-of-care use. We trace the workflow from outside information to decision, then remove the friction that keeps good data passive." },
      { label: "Clinical operations", title: "Protect attention as a scarce resource.", text: "We redesign handoffs, queues, and escalation paths so automation reduces cognitive load rather than adding another dashboard to a clinician’s day." },
      { label: "Life sciences", title: "Turn evidence into a repeatable operating rhythm.", text: "We connect research, quality, supply, and commercial teams around evidence flows that can withstand regulatory scrutiny and still move at the speed of discovery." },
    ],
    href: "/industries/healthcare-life-sciences/",
  },
  {
    number: "3",
    title: "Federal & public service",
    slug: "federal-public-service",
    description: "Turn mission, policy, and legacy technology into an operating system that can deliver trusted public outcomes at scale.",
    signal: "GAO identified 69 federal legacy systems in need of modernization in 2025, with agencies needing clearer plans, milestones, and disposition decisions.",
    source: "https://www.gao.gov/products/gao-25-107795",
    sourceLabel: "U.S. GAO · Modernizing Critical Legacy Systems",
    focus: ["Mission and solution strategy", "ITIL change management", "Modernization governance"],
    image: "/media/generated/federal-mission.avif",
    direction: "Public value is delivered through operating systems: policy translated into services, services carried by people, and technology that stays accountable to mission. Modernization is the work of reconnecting those layers.",
    plays: [
      { label: "Mission architecture", title: "Start with the outcome a resident can feel.", text: "We translate statutory intent and executive priorities into service promises, decision rights, and measurable outcomes that can guide technology and procurement." },
      { label: "Legacy portfolio", title: "Choose the right future for each system.", text: "GAO’s 69-system finding is a portfolio signal. We help leaders decide what to retire, re-platform, wrap, or redesign—without pretending every system needs the same answer." },
      { label: "Change at scale", title: "Make adoption part of the control environment.", text: "A decade of ITIL change-management practice informs our cadence: controlled releases, visible dependencies, accountable owners, and feedback from the people who deliver the mission." },
    ],
    href: "/industries/federal-public-service/",
  },
  {
    number: "4",
    title: "Technology & data",
    slug: "technology-data",
    description: "Create cloud, data, security, and automation foundations that make technology a business advantage rather than a growing dependency.",
    signal: "Verizon’s 2025 DBIR found third-party involvement in 30% of breaches and vulnerability exploitation in 20% of breaches.",
    source: "https://www.verizon.com/about/news/2025-data-breach-investigations-report",
    sourceLabel: "Verizon · 2025 Data Breach Investigations Report",
    focus: ["Cloud and data architecture", "Third-party risk", "Responsible automation"],
    image: "/media/generated/technology-data.avif",
    direction: "Technology leaders are being asked to create speed without creating fragility. The answer is a platform strategy that treats architecture, security, data quality, and developer experience as one operating system.",
    plays: [
      { label: "Platform economics", title: "Make the paved road the rational road.", text: "We align reusable platform capabilities to the decisions the business needs to make, so teams gain speed without multiplying hidden dependencies." },
      { label: "Security by design", title: "Extend accountability through the supply chain.", text: "With third-party involvement in 30% of breaches, vendor risk cannot remain an annual questionnaire. We connect controls, evidence, contracts, and operational response." },
      { label: "Data products", title: "Give ownership a job to do.", text: "A data catalog is not a strategy. We design domain ownership, quality measures, access patterns, and decision use cases that make data trustworthy because it is useful." },
    ],
    href: "/industries/technology-data/",
  },
  {
    number: "5",
    title: "Education",
    slug: "education",
    description: "Help education leaders connect mission, operations, and the technology that supports learning communities.",
    signal: "The workforce is asking institutions to treat capability-building as a system: 63% of employers in the WEF survey called skills gaps a major barrier to transformation.",
    source: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/",
    sourceLabel: "World Economic Forum · Skills Outlook 2025",
    focus: ["Institutional operating models", "Student and staff experience", "Digital capability"],
    image: "/media/generated/education-future.avif",
    direction: "Education is being asked to do two jobs at once: preserve the human purpose of learning while building the capabilities a changing economy will demand. Institutions need operating models that make both possible.",
    plays: [
      { label: "Learner experience", title: "Design the journey across the seams.", text: "We connect academic, advising, enrollment, and technology decisions around the moments where learners experience the institution as one system." },
      { label: "Workforce readiness", title: "Make capability-building measurable.", text: "The skills gap is not solved by a course catalog alone. We tie emerging skills to curriculum, faculty enablement, employer signal, and outcomes." },
      { label: "Digital trust", title: "Use AI to deepen learning, not dilute it.", text: "We help leaders establish clear use cases, guardrails, and human review so technology supports pedagogy and institutional trust." },
    ],
    href: "/industries/education/",
  },
  {
    number: "6",
    title: "Enterprise AI",
    slug: "enterprise-ai",
    description: "Move from scattered pilots to a governed portfolio of AI-enabled work that leaders can measure, improve, and trust.",
    signal: "Stanford HAI reports that 88% of surveyed organizations used AI in 2025, while agent use remains early—an adoption curve that now requires operating discipline.",
    source: "https://hai.stanford.edu/ai-index/2026-ai-index-report/economy",
    sourceLabel: "Stanford HAI · 2026 AI Index, Economy",
    focus: ["AI portfolio strategy", "Human-in-the-loop workflows", "Governance and adoption"],
    image: "/media/generated/ai-governance.avif",
    direction: "Enterprise AI has crossed the pilot threshold. The differentiator now is not access to a model; it is the ability to select valuable work, redesign the workflow, govern the risk, and learn faster than the portfolio changes.",
    plays: [
      { label: "Portfolio design", title: "Fund workflows, not demos.", text: "We rank opportunities by decision value, data readiness, adoption friction, and control requirements, then sequence a portfolio leaders can actually govern." },
      { label: "AI security", title: "Build for continuous challenge.", text: "NIST’s emerging AI-security work makes the point: fixed guardrails are not enough. We design evaluation, red-teaming, monitoring, and recovery into the operating rhythm." },
      { label: "Adoption system", title: "Give every new capability a home.", text: "The real product is a changed way of working. We define human accountability, exception paths, measures, and the leadership cadence that keeps adoption useful." },
    ],
    href: "/industries/enterprise-ai/",
  },
  {
    number: "7",
    title: "Energy & infrastructure",
    slug: "energy-infrastructure",
    description: "Align capital, grid modernization, digital operations, and resilience as infrastructure becomes the platform for economic growth.",
    signal: "DOE/NREL modeled a 2035 clean-electricity system requiring roughly three times 2020 generation capacity, substantial storage, and one to almost three times today’s transmission capacity.",
    source: "https://www.energy.gov/cmei/examining-supply-side-options-achieve-100-clean-electricity-2035",
    sourceLabel: "DOE / NREL · Clean Electricity by 2035",
    focus: ["Grid and asset strategy", "Resilience and supply chain", "Capital-to-operations translation"],
    image: "/media/generated/energy-grid.avif",
    direction: "DOE/NREL’s 2035 scenarios describe a system built at unprecedented scale: more generation, storage, transmission, and operational intelligence. The hard part is turning capital ambition into reliable service.",
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
    value: "88%",
    label: "organizational AI use",
    text: "Stanford HAI reports that 88% of surveyed organizations used AI in 2025. The question is no longer whether to experiment; it is how to make adoption governable and useful.",
    source: "https://hai.stanford.edu/ai-index/2026-ai-index-report/economy",
    sourceLabel: "Stanford HAI · 2026 AI Index",
  },
  {
    value: "69",
    label: "federal legacy systems",
    text: "GAO’s 2025 review identified 69 federal legacy systems in need of modernization. Modernization is a portfolio decision, not a software refresh.",
    source: "https://www.gao.gov/products/gao-25-107795",
    sourceLabel: "U.S. GAO · GAO-25-107795",
  },
  {
    value: "42%",
    label: "clinical use at the point of care",
    text: "ONC found that 71% of hospitals had routine access to outside clinical information, yet only 42% said clinicians often used it when treating patients.",
    source: "https://healthit.gov/data/data-briefs/interoperable-exchange-patient-health-information-among-us-hospitals-2023/",
    sourceLabel: "ONC · Data Brief 71",
  },
  {
    value: "30%",
    label: "breaches with third-party involvement",
    text: "Verizon’s 2025 DBIR doubled the prior year’s third-party involvement finding. Supplier architecture and operating accountability now belong in the security conversation.",
    source: "https://www.verizon.com/about/news/2025-data-breach-investigations-report",
    sourceLabel: "Verizon · 2025 DBIR",
  },
  {
    value: "39%",
    label: "of core skills changing by 2030",
    text: "The WEF expects 39% of workers’ current core skills to be transformed or outdated by 2030. Capability building cannot remain a late-stage training workstream.",
    source: "https://www.weforum.org/press/2025/01/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed/",
    sourceLabel: "World Economic Forum · Future of Jobs 2025",
  },
];

export const experienceHighlights = [
  { number: "10+", label: "years of ITIL change management", text: "We have helped organizations make change repeatable across the systems, services, and people that carry it." },
  { number: "AI", label: "enterprise AI perspective", text: "We treat AI as an operating model question: where judgment stays human, where work can be automated, and how leaders govern the portfolio." },
  { number: "4", label: "contexts that shape our work", text: "Federal agencies, healthcare enterprises, technology companies, and education institutions all demand a different expression of the same discipline: clarity." },
];

export const engagements = [
  {
    number: "01",
    title: "Executive working session",
    duration: "90 minutes",
    fit: "When the room needs a sharper decision.",
    deliverable: "A decision frame, working hypotheses, and a next-move brief.",
    href: "/contact/",
  },
  {
    number: "02",
    title: "System diagnostic",
    duration: "2–4 weeks",
    fit: "When the drag is real but the cause is distributed.",
    deliverable: "A prioritized diagnostic across operating model, workflow, technology, and capability.",
    href: "/contact/",
  },
  {
    number: "03",
    title: "Transformation partnership",
    duration: "Quarter-scale",
    fit: "When the organization needs momentum that survives kickoff.",
    deliverable: "Strategy, delivery governance, architecture, change cadence, and capability transfer.",
    href: "/contact/",
  },
];

export const startingPoints = [
  {
    id: "decisions",
    label: "Decisions are slow or unclear",
    text: "Start with operating model design and make ownership, measures, and handoffs visible.",
    href: "/services/operating-model/",
    linkLabel: "Explore operating model design",
  },
  {
    id: "ai",
    label: "AI pilots are not becoming capability",
    text: "Start with intelligent automation and design the workflow, guardrails, and adoption rhythm together.",
    href: "/services/intelligent-automation/",
    linkLabel: "Explore intelligent automation",
  },
  {
    id: "foundation",
    label: "Platforms or data cannot support the next move",
    text: "Start with cloud and data foundations that connect architecture to the decisions the business needs.",
    href: "/services/cloud-data/",
    linkLabel: "Explore cloud and data foundations",
  },
  {
    id: "capability",
    label: "People need more capacity to carry the change",
    text: "Start with leadership and talent systems that turn new strategy into repeatable capability.",
    href: "/services/leadership-talent/",
    linkLabel: "Explore leadership and talent",
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
    image: "/media/generated/ai-governance.avif",
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
    image: "/media/generated/federal-mission.avif",
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
    image: "/media/generated/enterprise-hero.avif",
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
    image: "/media/generated/healthcare-data.avif",
  },
];

export const navigationPanel = {
  explore: [
    { label: "Our approach", href: "/about/", description: "How we turn complex change into a system people can use." },
    { label: "Selected work", href: "/case-studies/", description: "Field notes from operating models, AI, and data foundations." },
    { label: "Insights", href: "/insights/", description: "Public evidence, original analysis, and useful questions." },
    { label: "Solutions", href: "/solutions/", description: "Focused starting points for the problems leaders are carrying now." },
  ],
  capabilities: services.map((service) => ({ ...service, href: `/services/${service.slug}/` })),
  industries,
  company: [
    { label: "Team", href: "/team/", description: "The disciplines we bring close to the work." },
    { label: "Careers", href: "/careers/", description: "Thoughtful operators are always welcome." },
    { label: "FAQ", href: "/faq/", description: "Practical answers before the first meeting." },
    { label: "Contact", href: "/contact/", description: "Bring us the hard thing." },
  ],
  feature: {
    label: "Point of view",
    title: "AI adoption is now an operating model problem.",
    description: "Stanford’s latest AI Index points to scale. Our work starts where the statistic stops: decisions, workflows, controls, and capability.",
    href: "/insights/ai-at-scale/",
  },
};

export const faqItems = [
  { question: "What does a first conversation look like?", answer: "A short working session about the change in front of you, the constraint behind it, and what a better system would make possible. You do not need a polished brief." },
  { question: "Do you work with internal teams or take over delivery?", answer: "Usually both, in the right proportion. We can shape the strategy, support delivery, or embed alongside an existing team. The goal is to leave capability behind, not dependency." },
  { question: "Can you support technology implementation?", answer: "Yes. Our technology work is grounded in operating outcomes, from cloud and data foundations through intelligent automation and enterprise platforms." },
  { question: "Where do you work?", answer: "We are based in New York and work with distributed teams across North America and beyond." },
  { question: "How do you approach AI in a regulated environment?", answer: "We begin with the decision and the risk boundary, not the model. We map the workflow, define human accountability, establish controls, and use NIST and agency or sector requirements as operating inputs." },
  { question: "Can you help with a legacy modernization decision?", answer: "Yes. We help leaders distinguish the parts to retire, re-platform, wrap, or redesign, then connect those decisions to funding, service continuity, architecture, and change adoption." },
];

export const principles = [
  {
    marker: "Clarity",
    title: "Make it legible",
    text: "Complexity is not a strategy. We make the choices, tradeoffs, and next moves visible.",
  },
  {
    marker: "Human judgment",
    title: "Build with the people",
    text: "The people closest to the work should help design the system that changes it.",
  },
  {
    marker: "Capability",
    title: "Leave capability behind",
    text: "The best engagement makes your team stronger after we leave the room.",
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
      { label: "Capabilities", href: "/services/" },
      { label: "Solutions", href: "/solutions/" },
      { label: "Team", href: "/team/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Visual sitemap", href: "/visual-sitemap/" },
      { label: "Careers", href: "/careers/" },
    ],
  },
];
