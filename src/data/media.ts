import aiGovernance from "@/assets/media/ai-governance.avif";
import circuit from "@/assets/media/circuit.avif";
import cloud from "@/assets/media/cloud.avif";
import consulting from "@/assets/media/consulting.avif";
import data from "@/assets/media/data.avif";
import educationFuture from "@/assets/media/education-future.avif";
import energyGrid from "@/assets/media/energy-grid.avif";
import enterpriseHero from "@/assets/media/enterprise-hero.avif";
import federalMission from "@/assets/media/federal-mission.avif";
import healthcareData from "@/assets/media/healthcare-data.avif";
import heroCity from "@/assets/media/hero-city.avif";
import technologyData from "@/assets/media/technology-data.avif";

export const media = {
  "/media/generated/ai-governance.avif": aiGovernance,
  "/media/original/circuit.avif": circuit,
  "/media/original/cloud.avif": cloud,
  "/media/original/consulting.avif": consulting,
  "/media/original/data.avif": data,
  "/media/generated/education-future.avif": educationFuture,
  "/media/generated/energy-grid.avif": energyGrid,
  "/media/generated/enterprise-hero.avif": enterpriseHero,
  "/media/generated/federal-mission.avif": federalMission,
  "/media/generated/healthcare-data.avif": healthcareData,
  "/media/original/hero-city.avif": heroCity,
  "/media/generated/technology-data.avif": technologyData,
} as const;

export type MediaPath = keyof typeof media;

export const insightMedia = {
  "Enterprise AI": "/media/generated/ai-governance.avif",
  Modernization: "/media/generated/federal-mission.avif",
  Healthcare: "/media/generated/healthcare-data.avif",
  Cybersecurity: "/media/generated/technology-data.avif",
  Workforce: "/media/generated/education-future.avif",
  "Energy & infrastructure": "/media/generated/energy-grid.avif",
  "Operating model": "/media/generated/enterprise-hero.avif",
  "Federal & public service": "/media/generated/federal-mission.avif",
  "Healthcare & life sciences": "/media/generated/healthcare-data.avif",
  "Technology & data": "/media/generated/technology-data.avif",
  "Enterprise services": "/media/generated/enterprise-hero.avif",
} satisfies Record<string, MediaPath>;
