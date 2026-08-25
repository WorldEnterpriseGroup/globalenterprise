export type DestinationOrganization = {
  name: string;
  href: string;
  external: boolean;
  description: string;
  audienceLabel: string;
  availability: "verified" | "internal";
  verificationNote: string;
};

export const destinationOrganizations = {
  globalEnterprise: {
    name: "Global Enterprise",
    href: "/",
    external: false,
    description: "Institutional strategy, enterprise architecture, ITIL service systems, and transformation advisory for governments, SLED institutions, and global enterprises.",
    audienceLabel: "Continue on Global Enterprise",
    availability: "internal",
    verificationNote: "First-party route on globalenterprise.com.",
  },
  igniteCuriosity: {
    name: "Ignite Curiosity",
    href: "https://ignitecuriosity.org/",
    external: true,
    description: "Experiential education, workforce training, mentorship, and early-career pathways for people beginning or reshaping their journey.",
    audienceLabel: "Explore Ignite Curiosity",
    availability: "verified",
    verificationNote: "Public destination verified August 24, 2026.",
  },
  taoStaff: {
    name: "Tao Staff",
    href: "https://taostaff.com/",
    external: true,
    description: "Talent, career, training, and apprenticeship pathways for people who want to work with the wider organization.",
    audienceLabel: "Explore Tao Staff",
    availability: "verified",
    verificationNote: "Public destination verified August 24, 2026.",
  },
  instarLab: {
    name: "INSTAR Lab",
    href: "https://instarlab.org/",
    external: true,
    description: "Independent nonprofit research across science, technology, education, acceleration, and community.",
    audienceLabel: "Explore INSTAR Lab",
    availability: "verified",
    verificationNote: "Public destination verified August 24, 2026.",
  },
  dreamLimited: {
    name: "DreamLimited",
    href: "https://dreamlimited.org/",
    external: true,
    description: "Business operations, strategic management, pursuit, and teaming pathways for primes, subcontractors, SMEs, and delivery partners.",
    audienceLabel: "Explore DreamLimited",
    availability: "verified",
    verificationNote: "Active canonical destination is dreamlimited.org; dreamlimited.com currently resolves to a parked domain.",
  },
} satisfies Record<string, DestinationOrganization>;

export type DestinationKey = keyof typeof destinationOrganizations;

export type AudiencePathway = {
  id: string;
  priority: "P0" | "P1" | "P2";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  destinationKey: DestinationKey;
  destinationLabel: string;
  external: boolean;
  audienceKeys: string[];
  supportingHref?: string;
  supportingLabel?: string;
};

export const audiencePathways: AudiencePathway[] = [
  {
    id: "national-and-federal-leaders",
    priority: "P0",
    eyebrow: "Mandate owners",
    title: "National, federal & international leaders",
    description: "Presidents, prime ministers, ministers, federal CIO and architecture offices, and multilateral leaders looking for a path from mandate to a reliable national system.",
    href: "/industries/federal-public-service/",
    linkLabel: "Explore public-sector advisory",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["national-executive-leaders", "federal-architecture-leaders", "international-government-leaders", "multilateral-institutions"],
  },
  {
    id: "state-local-education-institutions",
    priority: "P0",
    eyebrow: "Public institutions",
    title: "State, local & education institutions",
    description: "Governors' offices, mayors, state and local agencies, public universities, colleges, and K–12 systems looking for services and operating models that work close to the people who depend on them.",
    href: "/operations/",
    linkLabel: "Explore public-institution operations",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["state-local-education-leaders", "government-transformation-operators", "government-service-management"],
    supportingHref: "/industries/education/",
    supportingLabel: "Explore education contexts",
  },
  {
    id: "enterprise-and-portfolio-leaders",
    priority: "P0",
    eyebrow: "Enterprise leaders",
    title: "Fortune 500 & portfolio leadership",
    description: "CEOs, boards, CIOs, COOs, CFOs, transformation offices, and portfolio leaders who need architecture, economics, service, and workforce decisions to hold together.",
    href: "/solutions/portfolio-delivery/",
    linkLabel: "Explore portfolio delivery",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["fortune-500-leadership", "corporate-transformation-and-portfolio", "capital-and-portfolio-stakeholders"],
  },
  {
    id: "architects-and-operators",
    priority: "P0",
    eyebrow: "Practitioners",
    title: "Architects, ITIL & platform operators",
    description: "Enterprise and solution architects, FEAF practitioners, service owners, DevSecOps teams, and technical authorities who have to turn intent into a system people can run.",
    href: "/services/operating-model/",
    linkLabel: "Inspect the architecture route",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["enterprise-architecture-practitioners", "government-service-management", "devsecops-and-platform-operators"],
  },
  {
    id: "transformation-operators",
    priority: "P0",
    eyebrow: "Delivery system",
    title: "Transformation & service operators",
    description: "Program, product, service, change, continuity, and mission teams who need a practical cadence for safe release, adoption, measurement, and capability transfer.",
    href: "/services/transformation-office/",
    linkLabel: "Explore ITIL change management",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["government-transformation-operators", "government-service-management", "corporate-transformation-and-portfolio"],
  },
  {
    id: "acquisition-evaluators",
    priority: "P0",
    eyebrow: "Procurement",
    title: "Contracting officers, CORs & acquisition teams",
    description: "Public-sector buyers and program officials who need clear scope, evidence, outcomes, security boundaries, and a procurement-safe starting point.",
    href: "/trust/vendor-pack/",
    linkLabel: "Review the vendor & trust pack",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["public-sector-acquisition"],
  },
  {
    id: "prime-and-subcontractor-teams",
    priority: "P0",
    eyebrow: "Teaming",
    title: "Primes, SMEs & subcontractors",
    description: "Capture, proposal, prime, subcontractor, and small-business teams looking for architecture, FEAF, ITIL, DevSecOps, AI/data, and transformation capability for a pursuit or delivery model.",
    href: destinationOrganizations.dreamLimited.href,
    linkLabel: "Explore teaming pathways at DreamLimited",
    destinationKey: "dreamLimited",
    destinationLabel: "DreamLimited",
    external: true,
    audienceKeys: ["federal-contracting-ecosystem", "international-and-technology-partners"],
    supportingHref: "/trust/vendor-pack/",
    supportingLabel: "Review Global Enterprise's delivery boundary",
  },
  {
    id: "research-and-academic-partners",
    priority: "P1",
    eyebrow: "Research",
    title: "Professors, researchers & labs",
    description: "Principal investigators, faculty, fellows, university labs, think tanks, and research partners looking for field-grounded questions, evidence, and collaboration.",
    href: destinationOrganizations.instarLab.href,
    linkLabel: "Explore research collaboration at INSTAR Lab",
    destinationKey: "instarLab",
    destinationLabel: "INSTAR Lab",
    external: true,
    audienceKeys: ["professors-and-researchers", "international-and-technology-partners"],
    supportingHref: "/insights/",
    supportingLabel: "Read Global Enterprise insights",
  },
  {
    id: "early-career-learners",
    priority: "P1",
    eyebrow: "Early career",
    title: "Interns, apprentices & new professionals",
    description: "Students, veterans, career switchers, interns, fellows, and professional learners entering consulting, architecture, ITIL, DevSecOps, research, or program delivery.",
    href: destinationOrganizations.igniteCuriosity.href,
    linkLabel: "Explore early-career pathways at Ignite Curiosity",
    destinationKey: "igniteCuriosity",
    destinationLabel: "Ignite Curiosity",
    external: true,
    audienceKeys: ["early-career-talent", "professional-learners"],
    supportingHref: "/careers/",
    supportingLabel: "Understand the work we do",
  },
  {
    id: "experienced-talent",
    priority: "P1",
    eyebrow: "Join the organization",
    title: "Experienced talent seeking a career",
    description: "Senior architects, ITIL consultants, FEAF consultants, researchers, strategists, proposal leaders, platform operators, and delivery professionals looking for meaningful work with us.",
    href: destinationOrganizations.taoStaff.href,
    linkLabel: "Explore career pathways at Tao Staff",
    destinationKey: "taoStaff",
    destinationLabel: "Tao Staff",
    external: true,
    audienceKeys: ["experienced-talent"],
    supportingHref: "/careers/",
    supportingLabel: "Read the Global Enterprise working standard",
  },
  {
    id: "direct-advisory-and-public-reading",
    priority: "P2",
    eyebrow: "Direct route",
    title: "Everyone else with a consequential question",
    description: "Analysts, public intellectuals, informed readers, and partners whose question belongs in Global Enterprise's own advisory, insight, report, or conversation pathways.",
    href: "/contact/",
    linkLabel: "Start a Global Enterprise conversation",
    destinationKey: "globalEnterprise",
    destinationLabel: "Global Enterprise",
    external: false,
    audienceKeys: ["analysts-and-public-intellectuals"],
    supportingHref: "/resources/",
    supportingLabel: "Browse reports and working material",
  },
];

export const externalAudiencePathways = audiencePathways.filter((pathway) => pathway.external);
