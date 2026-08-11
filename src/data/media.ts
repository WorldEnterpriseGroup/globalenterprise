import aboutWorkshop from "@/assets/media/about-workshop.avif";
import careersApprentice from "@/assets/media/careers-apprentice.avif";
import contactWorkbench from "@/assets/media/contact-workbench.avif";
import energyGrid from "@/assets/media/energy-grid.avif";
import faqEmptyRoom from "@/assets/media/faq-empty-room.avif";
import heroCity from "@/assets/media/hero-city.avif";
import homeConsequenceField from "@/assets/media/home-consequence-field.avif";
import homeCapabilityWorkflow from "@/assets/media/home-capability-workflow.avif";
import homeEvidenceArchive from "@/assets/media/home-evidence-archive.avif";
import homeFieldControls from "@/assets/media/home-field-controls.avif";
import homeFieldNote from "@/assets/media/home-field-note.avif";
import homeIntelligenceWorkshop from "@/assets/media/home-intelligence-workshop.avif";
import homeListeningRoom from "@/assets/media/home-listening-room.avif";
import homeMandateBriefing from "@/assets/media/home-mandate-briefing.avif";
import homeSystemInfrastructure from "@/assets/media/home-system-infrastructure.avif";
import insightsFieldNotes from "@/assets/media/insights-field-notes.avif";
import servicesControlRoom from "@/assets/media/services-control-room.avif";
import solutionsCareHandoff from "@/assets/media/solutions-care-handoff.avif";
import teamStudioSession from "@/assets/media/team-studio-session.avif";
import workFieldVisit from "@/assets/media/work-field-visit.avif";

export const media = {
  "/media/original/careers-apprentice.avif": careersApprentice,
  "/media/generated/energy-grid.avif": energyGrid,
  "/media/original/faq-empty-room.avif": faqEmptyRoom,
  "/media/original/about-workshop.avif": aboutWorkshop,
  "/media/original/contact-workbench.avif": contactWorkbench,
  "/media/original/hero-city.avif": heroCity,
  "/media/original/home-consequence-field.avif": homeConsequenceField,
  "/media/original/home-capability-workflow.avif": homeCapabilityWorkflow,
  "/media/original/home-evidence-archive.avif": homeEvidenceArchive,
  "/media/original/home-field-controls.avif": homeFieldControls,
  "/media/original/home-field-note.avif": homeFieldNote,
  "/media/original/home-intelligence-workshop.avif": homeIntelligenceWorkshop,
  "/media/original/home-listening-room.avif": homeListeningRoom,
  "/media/original/home-mandate-briefing.avif": homeMandateBriefing,
  "/media/original/home-system-infrastructure.avif": homeSystemInfrastructure,
  "/media/original/insights-field-notes.avif": insightsFieldNotes,
  "/media/original/services-control-room.avif": servicesControlRoom,
  "/media/original/solutions-care-handoff.avif": solutionsCareHandoff,
  "/media/original/team-studio-session.avif": teamStudioSession,
  "/media/original/work-field-visit.avif": workFieldVisit,
} as const;

export type MediaPath = keyof typeof media;
