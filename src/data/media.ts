import aboutWorkshop from "@/assets/media/about-workshop.avif";
import careersApprentice from "@/assets/media/careers-apprentice.avif";
import contactWorkbench from "@/assets/media/contact-workbench.avif";
import energyGrid from "@/assets/media/energy-grid.avif";
import aiGovernance from "@/assets/media/ai-governance.avif";
import enterpriseHero from "@/assets/media/enterprise-hero.avif";
import federalMission from "@/assets/media/federal-mission.avif";
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
import homeGlobalDigitalInfrastructureV2 from "@/assets/media/home-global-digital-infrastructure-v2.avif";
import homeGlobalInstitutionV2 from "@/assets/media/home-global-institution-v2.avif";
import homeGlobalInstitutionsV2 from "@/assets/media/home-global-institutions-v2.avif";
import homeGlobalMandateV2 from "@/assets/media/home-mandate-global-v2.avif";
import homeGlobalNexusV2 from "@/assets/media/home-global-nexus-v2.avif";
import homeGlobalOutlookV2 from "@/assets/media/home-global-outlook-v2.avif";
import homeGlobalPortV2 from "@/assets/media/home-global-port-v2.avif";
import homePressurePoint from "@/assets/media/home-pressure-point.avif";
import homePlatformConvergence from "@/assets/media/home-platform-convergence.avif";
import homeHubMea from "@/assets/media/home-hub-mea.avif";
import homeHubNa from "@/assets/media/home-hub-na.avif";
import homeHubEu from "@/assets/media/home-hub-eu.avif";
import homeHubLatam from "@/assets/media/home-hub-latam.avif";
import homeHubSa from "@/assets/media/home-hub-sa.avif";
import homeHubAsia from "@/assets/media/home-hub-asia.avif";
import insightsFieldNotes from "@/assets/media/insights-field-notes.avif";
import servicesControlRoom from "@/assets/media/services-control-room.avif";
import solutionsCareHandoff from "@/assets/media/solutions-care-handoff.avif";
import teamStudioSession from "@/assets/media/team-studio-session.avif";
import workFieldVisit from "@/assets/media/work-field-visit.avif";
import technologyData from "@/assets/media/technology-data.avif";

export const media = {
  "/media/original/careers-apprentice.avif": careersApprentice,
  "/media/generated/energy-grid.avif": energyGrid,
  "/media/generated/ai-governance.avif": aiGovernance,
  "/media/generated/enterprise-hero.avif": enterpriseHero,
  "/media/generated/federal-mission.avif": federalMission,
  "/media/generated/technology-data.avif": technologyData,
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
  "/media/original/home-global-digital-infrastructure-v2.avif": homeGlobalDigitalInfrastructureV2,
  "/media/original/home-global-institution-v2.avif": homeGlobalInstitutionV2,
  "/media/original/home-global-institutions-v2.avif": homeGlobalInstitutionsV2,
  "/media/original/home-mandate-global-v2.avif": homeGlobalMandateV2,
  "/media/original/home-global-nexus-v2.avif": homeGlobalNexusV2,
  "/media/original/home-global-outlook-v2.avif": homeGlobalOutlookV2,
  "/media/original/home-global-port-v2.avif": homeGlobalPortV2,
  "/media/original/home-pressure-point.avif": homePressurePoint,
  "/media/original/home-platform-convergence.avif": homePlatformConvergence,
  "/media/original/home-hub-mea.avif": homeHubMea,
  "/media/original/home-hub-na.avif": homeHubNa,
  "/media/original/home-hub-eu.avif": homeHubEu,
  "/media/original/home-hub-latam.avif": homeHubLatam,
  "/media/original/home-hub-sa.avif": homeHubSa,
  "/media/original/home-hub-asia.avif": homeHubAsia,
  "/media/original/insights-field-notes.avif": insightsFieldNotes,
  "/media/original/services-control-room.avif": servicesControlRoom,
  "/media/original/solutions-care-handoff.avif": solutionsCareHandoff,
  "/media/original/team-studio-session.avif": teamStudioSession,
  "/media/original/work-field-visit.avif": workFieldVisit,
} as const;

export type MediaPath = keyof typeof media;
