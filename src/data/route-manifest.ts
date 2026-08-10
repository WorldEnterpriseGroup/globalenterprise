import { industries, services } from "@/data/site";

export type VisualRecord = {
  src: string;
  imageId: string;
  alt: string;
  role: string;
  focalPoint: string;
  promptIntent: string;
  createdAt: string;
  source: "generated" | "migrated";
  signature: string;
  modes: string[];
};

export const imageManifest: Record<string, Omit<VisualRecord, "src" | "imageId" | "signature" | "modes">> = {
  "ai-governance": { alt: "Leaders reviewing an enterprise AI governance model", role: "evidence and accountability", focalPoint: "people and bright screen at the right third", promptIntent: "quiet executive review of an AI operating model, editorial documentary light", createdAt: "2026-08-10", source: "generated" },
  circuit: { alt: "A close view of a connected enterprise technology system", role: "systems and infrastructure", focalPoint: "central circuitry with negative space around the edges", promptIntent: "existing brand asset migrated to the Astro image pipeline", createdAt: "2026-08-10", source: "migrated" },
  cloud: { alt: "Cloud infrastructure represented as a calm architectural landscape", role: "platform architecture", focalPoint: "layered cloud forms across the upper half", promptIntent: "existing brand asset migrated to the Astro image pipeline", createdAt: "2026-08-10", source: "migrated" },
  consulting: { alt: "A strategy team working together around a table", role: "approach and collaboration", focalPoint: "working hands and notes in the foreground", promptIntent: "existing brand asset migrated to the Astro image pipeline", createdAt: "2026-08-10", source: "migrated" },
  data: { alt: "Abstract data patterns forming a connected field", role: "data and signal", focalPoint: "bright data field across the center", promptIntent: "existing brand asset migrated to the Astro image pipeline", createdAt: "2026-08-10", source: "migrated" },
  "education-future": { alt: "Researchers and learners collaborating in a modern space", role: "capability and workforce", focalPoint: "collaborators at the center with open space above", promptIntent: "diverse future-of-work collaboration in a quiet learning environment", createdAt: "2026-08-10", source: "generated" },
  "energy-grid": { alt: "A resilient energy grid viewed as a connected operating system", role: "energy transition and resilience", focalPoint: "grid lines leading toward the horizon", promptIntent: "future energy infrastructure with human-scale context, restrained editorial palette", createdAt: "2026-08-10", source: "generated" },
  "enterprise-hero": { alt: "Modern city skyline seen from a strategy room", role: "enterprise orientation", focalPoint: "horizon and city edge in the lower third", promptIntent: "quiet global city at first light, sophisticated consulting editorial image", createdAt: "2026-08-10", source: "generated" },
  "federal-mission": { alt: "Public service leaders reviewing a mission portfolio", role: "public mission and governance", focalPoint: "leaders and portfolio wall at the center", promptIntent: "public-sector strategy review, composed documentary realism, no logos", createdAt: "2026-08-10", source: "generated" },
  "healthcare-data": { alt: "A care team reviewing a connected clinical data signal", role: "healthcare and life sciences", focalPoint: "care team and clinical display in the right half", promptIntent: "healthcare operations team reviewing trustworthy data, human and calm", createdAt: "2026-08-10", source: "generated" },
  "hero-city": { alt: "A global city viewed as a network of systems", role: "global context", focalPoint: "city geometry with open sky", promptIntent: "existing brand asset migrated to the Astro image pipeline", createdAt: "2026-08-10", source: "migrated" },
  "technology-data": { alt: "A technology team working with a secure data platform", role: "technology and data", focalPoint: "platform display and hands in the lower right", promptIntent: "technology leadership reviewing a secure data foundation, controlled light", createdAt: "2026-08-10", source: "generated" },
};

const visual = (imageId: string, signature: string, modes: string[]): VisualRecord => {
  const path = imageId.includes("-") && ["ai-governance", "education-future", "energy-grid", "enterprise-hero", "federal-mission", "healthcare-data", "technology-data"].includes(imageId)
    ? `/media/generated/${imageId}.avif`
    : `/media/original/${imageId}.avif`;
  return { ...imageManifest[imageId], src: path, imageId, signature, modes };
};

const exactVisuals: Record<string, VisualRecord> = {
  "/": visual("hero-city", "orientation · evidence · diagnostic · connection", ["orientation", "evidence", "diagnostic", "connection"]),
  "/about/": visual("consulting", "orientation · belief · connection", ["orientation", "belief", "connection"]),
  "/careers/": visual("education-future", "orientation · participation · connection", ["orientation", "participation", "connection"]),
  "/team/": visual("cloud", "observation · connection · participation", ["observation", "connection", "participation"]),
  "/contact/": visual("circuit", "participation · sequence · connection", ["participation", "sequence", "connection"]),
  "/faq/": visual("data", "orientation · evidence · participation", ["orientation", "evidence", "participation"]),
  "/privacy/": visual("data", "orientation · boundary · connection", ["orientation", "boundary", "connection"]),
  "/terms/": visual("cloud", "orientation · boundary · connection", ["orientation", "boundary", "connection"]),
  "/case-studies/": visual("federal-mission", "orientation · evidence · contrast", ["orientation", "evidence", "contrast"]),
  "/industries/": visual("federal-mission", "orientation · contrast · connection", ["orientation", "contrast", "connection"]),
  "/insights/": visual("data", "orientation · evidence · sequence", ["orientation", "evidence", "sequence"]),
  "/services/": visual("circuit", "orientation · comparison · connection", ["orientation", "comparison", "connection"]),
  "/solutions/": visual("ai-governance", "orientation · diagnostic · connection", ["orientation", "diagnostic", "connection"]),
};

const generatedPath = (path: string) => path.endsWith("/") ? path : `${path}/`;

export function visualForPath(pathname: string): VisualRecord {
  const normalized = generatedPath(pathname);
  if (exactVisuals[normalized]) return exactVisuals[normalized];
  const service = services.find((entry) => normalized === `/services/${entry.slug}/`);
  if (service) {
    const imageId = service.image.split("/").at(-1)?.replace(".avif", "") ?? "enterprise-hero";
    return visual(imageId, "orientation · evidence · sequence · connection", ["orientation", "evidence", "sequence", "connection"]);
  }
  const industry = industries.find((entry) => normalized === `/industries/${entry.slug}/`);
  if (industry) {
    const imageId = industry.image.split("/").at(-1)?.replace(".avif", "") ?? "enterprise-hero";
    return visual(imageId, "orientation · evidence · contrast · connection", ["orientation", "evidence", "contrast", "connection"]);
  }
  if (normalized.startsWith("/insights/topics/")) return visual("energy-grid", "orientation · sequence · comparison", ["orientation", "sequence", "comparison"]);
  if (normalized.startsWith("/insights/")) return visual("technology-data", "thesis · evidence · counterpoint · next move", ["thesis", "evidence", "counterpoint", "next move"]);
  if (normalized.startsWith("/case-studies/")) return visual("federal-mission", "context · evidence · consequence", ["context", "evidence", "consequence"]);
  if (normalized.startsWith("/contact/")) return exactVisuals["/contact/"];
  return exactVisuals["/"];
}

export const routeVisuals = exactVisuals;
