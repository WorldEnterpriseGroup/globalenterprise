export type EvidenceSource = {
  label: string;
  url: string;
  published?: string;
  reviewed?: Date;
};

export type EvidenceSourceWithRouting = EvidenceSource & {
  displayUrl: string;
  officialSourceUrl?: string;
  officialSourceLabel?: string;
};

const evidenceSourceRoutes: Record<string, { officialLabel: string; officialUrl: string; internalPath: string }> = {
  "https://www.un.org/esa/foresight/chapter-three.html": {
    officialLabel: "UN DESA, Future in Focus: Preparing for What Lies Ahead",
    officialUrl: "https://www.un.org/esa/foresight/chapter-three.html",
    internalPath: "/insights/un-desa-population-scale-is-an-operating-constraint/",
  },
  "https://www.itu.int/en/mediacentre/Pages/PR-2025-11-17-Facts-and-Figures.aspx": {
    officialLabel: "ITU, Facts and Figures (latest global estimate)",
    officialUrl: "https://www.itu.int/en/mediacentre/Pages/PR-2025-11-17-Facts-and-Figures.aspx",
    internalPath: "/insights/itu-connectivity-is-not-access/",
  },
  "https://www.iea.org/reports/energy-and-ai": {
    officialLabel: "IEA, Energy and AI",
    officialUrl: "https://www.iea.org/reports/energy-and-ai",
    internalPath: "/insights/iea-energy-and-ai-grid-capacity/",
  },
};

export const resolveEvidenceSource = <T extends EvidenceSource>(source: T): EvidenceSourceWithRouting & T => {
  const route = evidenceSourceRoutes[source.url];
  if (!route) return { ...source, displayUrl: source.url };
  return {
    ...source,
    displayUrl: route.internalPath,
    officialSourceLabel: route.officialLabel,
    officialSourceUrl: route.officialUrl,
  };
};
