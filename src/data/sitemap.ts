import { industries, services, solutionPages } from "@/data/site";

export const sitemapGroups = [
  {
    title: "Start here",
    pages: [
      { label: "Home", href: "/", description: "The advisory partner for the next order of complexity.", kind: "front door" },
      { label: "Our approach", href: "/about/", description: "How we make future complexity governable.", kind: "company" },
      { label: "Selected work", href: "/case-studies/", description: "Field notes from the work.", kind: "proof" },
      { label: "Insights", href: "/insights/", description: "Evidence and original analysis for leaders shaping what comes next.", kind: "thinking" },
      { label: "Solutions", href: "/solutions/", description: "Strategic pathways for consequential decisions.", kind: "start" },
      { label: "Team", href: "/team/", description: "The disciplines close to the work.", kind: "company" },
      { label: "Contact", href: "/contact/", description: "Request a private principal dialogue.", kind: "start" },
    ],
  },
  {
    title: "Capabilities",
    pages: [
      { label: "All capabilities", href: "/services/", description: "The connected transformation system.", kind: "capability" },
      ...services.map((service) => ({ label: service.title, href: `/services/${service.slug}/`, description: service.short, kind: "capability" })),
    ],
  },
  {
    title: "Solutions",
    pages: [
      { label: "All solutions", href: "/solutions/", description: "Focused entry points for high-consequence work.", kind: "solution" },
      ...solutionPages.map((solution) => ({ label: solution.eyebrow, href: `/solutions/${solution.slug}/`, description: solution.title, kind: "solution" })),
    ],
  },
  {
    title: "Industries",
    pages: [
      { label: "All industries", href: "/industries/", description: "Context changes the answer.", kind: "industry" },
      ...industries.map((industry) => ({ label: industry.title, href: industry.href, description: industry.description, kind: "industry" })),
    ],
  },
  {
    title: "Work",
    pages: [
      { label: "Operating model", href: "/case-studies/operating-model/", description: "A clearer operating model for a distributed enterprise.", kind: "case study" },
      { label: "Cloud & data foundation", href: "/case-studies/cloud-data-foundation/", description: "A decision-ready data environment.", kind: "case study" },
      { label: "Automation at scale", href: "/case-studies/automation-at-scale/", description: "Automation people choose to use.", kind: "case study" },
    ],
  },
  {
    title: "Insights",
    pages: [
      { label: "AI at scale is an operating model decision", href: "/insights/ai-at-scale/", description: "Adoption is no longer the scarce resource.", kind: "insight" },
      { label: "Legacy modernization is a product decision", href: "/insights/legacy-is-a-product-decision/", description: "What to retire, wrap, and redesign.", kind: "insight" },
      { label: "Interoperability is not access; it is use", href: "/insights/interoperability-is-a-workflow/", description: "The last mile of healthcare data.", kind: "insight" },
      { label: "Your third parties are part of your operating model", href: "/insights/third-party-is-your-operating-model/", description: "Security beyond the org chart.", kind: "insight" },
      { label: "Skills are a system, not a seminar", href: "/insights/skills-are-a-system/", description: "Capability designed into the work.", kind: "insight" },
      { label: "Responsible AI is a management system", href: "/insights/responsible-ai-is-management/", description: "Trust produced through evidence and accountability.", kind: "insight" },
      { label: "The adoption gap is an operating model problem", href: "/insights/designing-for-adoption/", description: "Designing the new default.", kind: "insight" },
      { label: "Treat the enterprise like a product", href: "/insights/enterprise-as-a-product/", description: "Release the operating model.", kind: "insight" },
      { label: "The cost of unclear is compounding", href: "/insights/the-cost-of-unclear/", description: "Make ambiguity visible.", kind: "insight" },
      { label: "The energy transition is an operating model challenge", href: "/insights/energy-transition-is-an-operating-model/", description: "The 2035 grid agenda is a coordination problem.", kind: "insight" },
      { label: "Federal AI should be managed as a public service", href: "/insights/federal-ai-should-be-a-service/", description: "Operate AI as an accountable public capability.", kind: "insight" },
      { label: "Clinical AI needs a change system, not a launch plan", href: "/insights/clinical-ai-needs-a-change-system/", description: "Design the workflow, evidence, and adoption rhythm together.", kind: "insight" },
      { label: "Platform teams are a contract with the enterprise", href: "/insights/platform-teams-are-a-contract/", description: "Make the safe path the easy path.", kind: "insight" },
      { label: "Transformation metrics are management, not reporting", href: "/insights/transformation-metrics-are-management/", description: "See whether change is becoming capability.", kind: "insight" },
      { label: "The future of work is workflow design", href: "/insights/future-of-work-is-workflow-design/", description: "Recompose roles, decisions, and learning loops.", kind: "insight" },
      { label: "Governance is a product people have to use", href: "/insights/governance-is-a-product/", description: "Make decisions clearer and safe action faster.", kind: "insight" },
      { label: "Data center growth is a coordination problem", href: "/insights/data-center-permitting-is-an-operating-model/", description: "Coordinate compute, power, permitting, and trust.", kind: "insight" },
      { label: "Compute is a governance problem before it is a cost problem", href: "/insights/compute-is-a-governance-problem/", description: "Connect every unit of compute to a decision, a control, and an outcome.", kind: "insight" },
      { label: "Quantum intelligence needs an operating model", href: "/insights/quantum-intelligence-needs-an-operating-model/", description: "Give frontier research a disciplined path into strategy.", kind: "insight" },
      { label: "Enterprise AI topic page", href: "/insights/topics/enterprise-ai/", description: "Follow the AI arguments across the library.", kind: "topic" },
      { label: "Operating model topic page", href: "/insights/topics/operating-model/", description: "Follow the operating model arguments across the library.", kind: "topic" },
      { label: "Leadership topic page", href: "/insights/topics/leadership/", description: "Follow the leadership arguments across the library.", kind: "topic" },
      { label: "Healthcare topic page", href: "/insights/topics/healthcare/", description: "Follow the healthcare arguments across the library.", kind: "topic" },
      { label: "Modernization topic page", href: "/insights/topics/modernization/", description: "Follow the modernization arguments across the library.", kind: "topic" },
      { label: "Governance topic page", href: "/insights/topics/governance/", description: "Follow the governance arguments across the library.", kind: "topic" },
      { label: "Resilience topic page", href: "/insights/topics/resilience/", description: "Follow the resilience arguments across the library.", kind: "topic" },
      { label: "Execution topic page", href: "/insights/topics/execution/", description: "Follow the execution arguments across the library.", kind: "topic" },
      { label: "Energy & infrastructure topic page", href: "/insights/topics/energy-and-infrastructure/", description: "Follow the energy and infrastructure arguments across the library.", kind: "topic" },
      { label: "Federal & public service topic page", href: "/insights/topics/federal-and-public-service/", description: "Follow the federal and public service arguments across the library.", kind: "topic" },
      { label: "Technology & data topic page", href: "/insights/topics/technology-and-data/", description: "Follow the technology and data arguments across the library.", kind: "topic" },
      { label: "Workforce topic page", href: "/insights/topics/workforce/", description: "Follow the workforce arguments across the library.", kind: "topic" },
      { label: "AI Cost Management topic page", href: "/insights/topics/ai-cost-management/", description: "Follow the arguments about compute economics and governance.", kind: "topic" },
      { label: "Quantum Intelligence topic page", href: "/insights/topics/quantum-intelligence/", description: "Follow the arguments about frontier intelligence and readiness.", kind: "topic" },
    ],
  },
  {
    title: "Company & guidance",
    pages: [
      { label: "Careers", href: "/careers/", description: "Bring your point of view to the hard stuff.", kind: "company" },
      { label: "FAQ", href: "/faq/", description: "Useful before the first meeting.", kind: "guidance" },
      { label: "Privacy", href: "/privacy/", description: "How information is handled.", kind: "legal" },
      { label: "Terms", href: "/terms/", description: "Site terms and conditions.", kind: "legal" },
    ],
  },
  {
    title: "Site tools",
    pages: [
      { label: "Visual sitemap", href: "/visual-sitemap/", description: "The full site architecture.", kind: "site tool" },
      { label: "Compact sitemap", href: "/visual-sitemap/compact.html", description: "A live page map with an in-context preview.", kind: "site tool" },
    ],
  },
];

export const sitemapPages = sitemapGroups.flatMap((group) => group.pages.map((page) => ({ ...page, group: group.title })));
