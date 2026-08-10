import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const authoredDate = z.coerce.date().transform((value) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 12)));

const shared = {
  title: z.string(),
  description: z.string(),
  date: authoredDate.optional(),
  updatedDate: authoredDate.optional(),
  eyebrow: z.string().optional(),
  image: z.string().optional(),
  author: z.string().default("Global Enterprise"),
  keywords: z.array(z.string()).default([]),
  industry: z.string().optional(),
  related: z.array(z.string()).default([]),
  sources: z.array(z.object({ label: z.string(), url: z.url(), published: z.string().optional(), reviewed: authoredDate.optional() })).default([]),
  lastReviewed: authoredDate.optional(),
};

const insights = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/insights" }),
  schema: z.object({
    ...shared,
    category: z.string(),
    readingTime: z.string(),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    ...shared,
    sector: z.string(),
    service: z.string(),
    result: z.string(),
  }),
});

const servicePages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: z.object({
    ...shared,
    number: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { insights, caseStudies, servicePages };
