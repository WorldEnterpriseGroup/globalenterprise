export type VisualKind = "photo" | "diagram" | "none";

export type VisualRecord = {
  kind: VisualKind;
  src: string;
  imageId: string;
  alt: string;
  role: string;
  focalPoint: string;
  promptIntent: string;
  createdAt: string;
  source: "generated" | "migrated" | "code-native";
  signature: string;
  modes: string[];
};

type PhotoDefinition = Omit<VisualRecord, "kind" | "src" | "imageId" | "signature" | "modes"> & { src: string };

export const imageManifest: Record<string, PhotoDefinition> = {
  "about-workshop": {
    src: "/media/original/about-workshop.avif",
    alt: "Three colleagues reviewing printed process maps around a workshop table",
    role: "working method and collaboration",
    focalPoint: "people and marked-up papers in the right two-thirds; clear window light at left",
    promptIntent: "candid documentary workshop photograph with paper, human posture, and natural window light",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "careers-apprentice": {
    src: "/media/original/careers-apprentice.avif",
    alt: "Senior practitioners reviewing enterprise operating plans at a strategy workshop",
    role: "careers and capability transfer",
    focalPoint: "hands and prototype in the right half; quiet workshop light at left",
    promptIntent: "documentary workshop photograph of enterprise capability planning and role alignment",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "contact-workbench": {
    src: "/media/original/contact-workbench.avif",
    alt: "Hands arranging working papers and a notebook on a wooden table",
    role: "conversation and first move",
    focalPoint: "hands and papers toward the center-right with open wood surface at left",
    promptIntent: "quiet documentary still life of a real working session before it starts",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "energy-grid": {
    src: "/media/generated/energy-grid.avif",
    alt: "Operators watching an energy landscape through a control-room window",
    role: "infrastructure and resilience",
    focalPoint: "grid horizon and operators in the lower middle; room edges create depth",
    promptIntent: "documentary control-room view of energy infrastructure at dusk",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "faq-empty-room": {
    src: "/media/original/faq-empty-room.avif",
    alt: "An empty meeting room with two chairs, folders, and morning light",
    role: "questions before the first conversation",
    focalPoint: "round table and two chairs in the center; window light opens the left side",
    promptIntent: "quiet, expectant editorial still life for a serious first conversation",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "federal-mission": {
    src: "/media/generated/federal-mission.avif",
    alt: "A briefing room with maps and working papers arranged around a shared mission",
    role: "international mission and context",
    focalPoint: "maps and working papers across the center; open negative space at the upper right",
    promptIntent: "documentary mission-planning room with maps, working papers, and human scale",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "hero-city": {
    src: "/media/original/hero-city.avif",
    alt: "A global city skyline in clear morning light",
    role: "global context and orientation",
    focalPoint: "skyline across the lower third with open sky for the thesis",
    promptIntent: "migrated city photograph retained as the single home-route image",
    createdAt: "2026-08-10",
    source: "migrated",
  },
  "home-consequence-field": {
    src: "/media/original/home-consequence-field.avif",
    alt: "A technician standing on a walkway above the basins and pipes of a water treatment facility",
    role: "the consequence in the field",
    focalPoint: "technician in the right third; pipes and railings create leading lines through the frame",
    promptIntent: "documentary water infrastructure photograph showing human scale and operating consequence",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-capability-workflow": {
    src: "/media/original/home-capability-workflow.avif",
    alt: "Two systems technicians comparing a wiring diagram and components beside an open industrial cabinet",
    role: "capability and architecture in practice",
    focalPoint: "technicians and component table on the right; open cabinet provides technical texture at left",
    promptIntent: "documentary photograph of architecture being checked against physical operation",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-evidence-archive": {
    src: "/media/original/home-evidence-archive.avif",
    alt: "A researcher selecting a worn folder from shelves in a quiet archive",
    role: "evidence and public record",
    focalPoint: "researcher and folder in the left third; archive shelves create depth to the right",
    promptIntent: "slow documentary archive photograph with tactile paper and patient investigation",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-field-controls": {
    src: "/media/original/home-field-controls.avif",
    alt: "A field engineer checking an old utility control cabinet with a paper checklist",
    role: "starting from the real operating condition",
    focalPoint: "engineer and cabinet across the center; worn metal and daylight carry the detail",
    promptIntent: "close documentary field photograph of physical controls and human judgment",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-field-note": {
    src: "/media/original/home-field-note.avif",
    alt: "A hard hat, notebook, and work gloves resting on a steel railing above an industrial facility",
    role: "field note and operational proof",
    focalPoint: "notebook and gloves in the lower left; working plant and crew recede into the background",
    promptIntent: "restrained field-note still life with a real industrial site behind it",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-intelligence-workshop": {
    src: "/media/original/home-intelligence-workshop.avif",
    alt: "Two engineers examining an unfinished mechanical component at a scarred workshop bench",
    role: "frontier intelligence becoming practical",
    focalPoint: "component and hands in the lower center; task lamp and second engineer create depth",
    promptIntent: "real materials workshop photograph showing careful experimentation without technology theater",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-listening-room": {
    src: "/media/original/home-listening-room.avif",
    alt: "A researcher listening at an analog audio console with printed notes",
    role: "attention and interpretation",
    focalPoint: "listener on the right and analog console in the lower left; studio depth remains visible",
    promptIntent: "focused documentary listening-room photograph that makes attention physical",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-mandate-briefing": {
    src: "/media/original/home-mandate-briefing.avif",
    alt: "A senior planner tracing a route across a large paper map while colleagues watch",
    role: "mandate and direction",
    focalPoint: "planner and map in the right half; bright windows leave negative space at left",
    promptIntent: "candid civic infrastructure planning photograph with paper, posture, and consequence",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "home-global-institutions-v2": {
    src: "/media/original/home-global-institutions-v2.avif",
    alt: "A major international capital where government institutions, corporate towers, transit, bridges, and waterways meet",
    role: "global institutional scale and consequence",
    focalPoint: "civic institutions in the foreground and corporate skyline across the middle third",
    promptIntent: "grand documentary cityscape connecting government, enterprise, transit, and metropolitan systems",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-global-digital-infrastructure-v2": {
    src: "/media/original/home-global-digital-infrastructure-v2.avif",
    alt: "A hyperscale digital infrastructure campus connected to the energy and skyline of a major city",
    role: "enterprise digital capability at metropolitan scale",
    focalPoint: "infrastructure campus and energy corridors leading toward the skyline",
    promptIntent: "credible aerial view of hyperscale digital, energy, logistics, and metropolitan infrastructure",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-global-institution-v2": {
    src: "/media/original/home-global-institution-v2.avif",
    alt: "The grand interior of an international institution overlooking a global city",
    role: "evidence entering consequential institutions",
    focalPoint: "monumental council atrium opening toward the panoramic city view",
    promptIntent: "grand international policy and financial institution interior with city-scale context",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-mandate-global-v2": {
    src: "/media/original/home-mandate-global-v2.avif",
    alt: "A monumental international government and corporate district in morning light",
    role: "mandate across major public and corporate institutions",
    focalPoint: "monumental civic architecture leading toward a dense international skyline",
    promptIntent: "grand government and corporate district at dawn with credible global institutional scale",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-global-nexus-v2": {
    src: "/media/original/home-global-nexus-v2.avif",
    alt: "A major international transport nexus connecting an airport, rail corridors, and a global city",
    role: "connected metropolitan operating system",
    focalPoint: "airport, rail, and roadway lines converging toward the financial skyline",
    promptIntent: "sweeping international airport, rail, and financial-city transport nexus",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-global-port-v2": {
    src: "/media/original/home-global-port-v2.avif",
    alt: "A vast international container port and intermodal logistics network beside a global city",
    role: "selected work and systems operating across borders",
    focalPoint: "port basins, cranes, and logistics corridors leading toward the city",
    promptIntent: "grand aerial of a global port and intermodal logistics system",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-global-outlook-v2": {
    src: "/media/original/home-global-outlook-v2.avif",
    alt: "A major international financial and civic skyline illuminated across the water at twilight",
    role: "global perspective and institutional outlook",
    focalPoint: "financial and civic skyline reflected across the water",
    promptIntent: "majestic credible international skyline at twilight without technology effects",
    createdAt: "2026-08-13",
    source: "generated",
  },
  "home-system-infrastructure": {
    src: "/media/original/home-system-infrastructure.avif",
    alt: "Rail, utility pipes, and power lines crossing a river at dawn",
    role: "the system view made physical",
    focalPoint: "rail and pipes lead from foreground toward the horizon; open sky provides scale",
    promptIntent: "wide documentary infrastructure photograph showing interconnection and resilience",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "insights-field-notes": {
    src: "/media/original/insights-field-notes.avif",
    alt: "A marked-up report, notebook, and pen on a researcher’s desk",
    role: "evidence and interpretation",
    focalPoint: "annotated report and pen in the lower left; books and window recede to the right",
    promptIntent: "quiet documentary research desk with tactile paper and restrained color",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "services-control-room": {
    src: "/media/original/services-control-room.avif",
    alt: "An operator walking through a real utility control room lined with analog meters",
    role: "capability in operation",
    focalPoint: "operator in the middle distance; meters, binders, and windows form a deep corridor",
    promptIntent: "documentary control-room photograph with physical systems and operational discipline",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "solutions-care-handoff": {
    src: "/media/original/solutions-care-handoff.avif",
    alt: "Two hospital staff members comparing a paper checklist beside a supply cart",
    role: "pathway and handoff",
    focalPoint: "staff and checklist in the left third; corridor opens toward the right",
    promptIntent: "candid service handoff photograph showing a consequential workflow",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "team-studio-session": {
    src: "/media/original/team-studio-session.avif",
    alt: "An interdisciplinary team reviewing strategy maps at a coordination floor",
    role: "enterprise bench and shared judgment",
    focalPoint: "team on the right beyond a doorway edge; daylight and worktable establish context",
    promptIntent: "documentary team photograph showing enterprise operating posture",
    createdAt: "2026-08-10",
    source: "generated",
  },
  "work-field-visit": {
    src: "/media/original/work-field-visit.avif",
    alt: "An operations team walking through an industrial control room during a site visit",
    role: "field work and operational proof",
    focalPoint: "team in the middle distance with equipment and daylight creating a deep path",
    promptIntent: "documentary site-visit photograph in a real industrial operations environment",
    createdAt: "2026-08-10",
    source: "generated",
  },
};

const photo = (imageId: keyof typeof imageManifest, signature: string, modes: string[]): VisualRecord => ({
  kind: "photo",
  ...imageManifest[imageId],
  imageId,
  signature,
  modes,
});

const route = (signature: string, modes: string[], role = "authored route composition", alt = "Content-led advisory route composition"): VisualRecord => ({
  kind: "none",
  src: "",
  imageId: "none",
  alt,
  role,
  focalPoint: "not applicable; this route uses content and code-native visuals",
  promptIntent: "no photographic visual assigned",
  createdAt: "2026-08-10",
  source: "code-native",
  signature,
  modes,
});

const exactVisuals: Record<string, VisualRecord> = {
  "/": photo("hero-city", "thesis · proof strip · diagnostic · route chooser", ["orientation", "evidence", "diagnostic", "connection"]),
  "/about/": photo("about-workshop", "photo-led intro · system map · principles · invitation", ["orientation", "observation", "sequence", "connection"]),
  "/operations/": photo("federal-mission", "international operations thesis · context index · delivery model · invitation", ["orientation", "observation", "comparison", "sequence", "connection"]),
  "/region/": route("regional directory · chapter index · sector bridge · invitation", ["orientation", "index", "comparison", "connection"], "regional operating contexts", "Regional operating contexts for commercial, federal, and SLED leaders"),
  "/proof/": route("confidential proof · built systems · evidence basis · discretion · invitation", ["orientation", "evidence", "sequence", "boundary", "connection"], "proof of practice", "Confidential proof of practice presented through abstract operating patterns"),
  "/careers/": photo("careers-apprentice", "photo-led manifesto · role cards · working agreement · invitation", ["orientation", "observation", "participation", "connection"]),
  "/team/": photo("team-studio-session", "photo-led discipline index · bench note · capability grid · invitation", ["orientation", "observation", "index", "connection"]),
  "/contact/": photo("contact-workbench", "question stack · workbench photo · engagement path · form", ["orientation", "observation", "participation", "sequence"]),
  "/contact/thanks/": route("confirmation · next reads · return path", ["orientation", "connection"], "confirmation route"),
  "/faq/": photo("faq-empty-room", "photo-led question stack · native disclosure · compact action", ["orientation", "observation", "participation", "connection"]),
  "/privacy/": route("summary · policy sections · escape route", ["orientation", "boundary", "connection"]),
  "/terms/": route("summary · terms sections · escape route", ["orientation", "boundary", "connection"]),
  "/trust/": route("identity · discretion · delivery assurance · data boundary · procurement", ["orientation", "evidence", "boundary", "connection", "action"], "trust center", "Global Enterprise trust center and public delivery boundaries"),
  "/trust/vendor-pack/": route("legal identity · public controls · diligence map · procurement path", ["orientation", "comparison", "boundary", "action"], "vendor and trust pack", "Public procurement and trust snapshot"),
  "/case-studies/": route("legacy work index · proof list · evidence boundary · invitation", ["orientation", "evidence", "boundary", "connection"], "legacy work index"),
  "/work/": photo("work-field-visit", "field photo · proof index · evidence band · invitation", ["orientation", "observation", "evidence", "connection"]),
  "/industries/": photo("energy-grid", "sector photo · context index · signal chart · invitation", ["orientation", "observation", "comparison", "connection"]),
  "/insights/": photo("insights-field-notes", "research photo · filterable index · topic rail · evidence", ["orientation", "observation", "participation", "connection"]),
  "/services/": photo("services-control-room", "photo-led capability index · architecture map · evidence rail", ["orientation", "observation", "index", "diagram", "evidence"]),
  "/solutions/": photo("solutions-care-handoff", "photo-led question index · solution chooser · compact invitation", ["orientation", "observation", "participation", "connection"]),
  "/resources/": photo("home-intelligence-workshop", "workshop-led thesis · editorial report index · subscription", ["orientation", "observation", "index", "participation"]),
  "/visual-sitemap/": route("site map · page directory · route preview", ["orientation", "index", "connection"]),
};

const generatedPath = (path: string) => path.endsWith("/") ? path : `${path}/`;

export function visualForPath(pathname: string): VisualRecord {
  const normalized = generatedPath(pathname);
  if (exactVisuals[normalized]) return exactVisuals[normalized];
  if (normalized.startsWith("/services/")) return route(`capability detail · ${normalized.split("/")[2]} · technical map · next move`, ["orientation", "prose", "diagram", "connection"], "capability detail");
  if (normalized.startsWith("/solutions/")) return route(`solution detail · ${normalized.split("/")[2]} · architecture · engagement`, ["orientation", "promise", "diagram", "participation"], "solution detail");
  if (normalized.startsWith("/industries/")) return route(`industry detail · ${normalized.split("/")[2]} · public signal · sequence`, ["orientation", "evidence", "diagram", "connection"], "industry detail");
  if (normalized.startsWith("/region/")) return route(`regional context · ${normalized.split("/")[2]} · current chapter · twenty-year roadmap · sector convergence`, ["orientation", "comparison", "sequence", "evidence", "connection"], "regional operating context", "Regional operating context for commercial, federal, and SLED leaders");
  if (normalized.startsWith("/insights/topics/")) return route(`topic index · ${normalized.split("/")[3]} · argument list · next question`, ["orientation", "index", "connection"], "topic index");
  if (normalized.startsWith("/insights/")) return route(`article · ${normalized.split("/")[2]} · reading map · evidence visual`, ["thesis", "prose", "diagram", "connection"], "article");
  if (normalized.startsWith("/case-studies/")) return route(`case study · ${normalized.split("/")[2]} · field note · architecture`, ["context", "prose", "diagram", "consequence"], "case study");
  if (normalized.startsWith("/resources/")) return route(`report · ${normalized.split("/")[2]} · field note · request`, ["orientation", "observation", "preview", "participation"], "business report");
  if (normalized.startsWith("/contact/")) return exactVisuals["/contact/"];
  return route("utility route · summary · next action", ["orientation", "connection"], "utility route");
}

export const routeVisuals = exactVisuals;
