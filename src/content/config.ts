import { defineCollection, z } from "astro:content";

const radarItem = z.object({
  id: z.string(),
  category: z.enum(["model", "infra", "hpc", "paper", "tooling", "china_ai", "geopolitics"]),
  title: z.string(),
  source_name: z.string(),
  source_url: z.string().url(),
  source_type: z.enum([
    "paper",
    "repo",
    "blog",
    "release_notes",
    "official_docs",
    "product_update",
    "company_announcement",
    "policy",
    "news",
  ]),
  published_at: z.coerce.date(),
  summary: z.string(),
  why_it_matters: z.string(),
  background: z.string().optional(),
  details: z.string().optional(),
  impact: z.string().optional(),
  watch_points: z.array(z.string()).default([]),
  image_url: z.string().url().optional(),
  image_alt: z.string().optional(),
  image_source_url: z.string().url().optional(),
  highlight: z.boolean().optional(),
  credibility: z.enum(["high", "medium", "low"]),
  importance: z.enum(["high", "medium", "low"]),
  review_status: z.enum(["candidate", "approved", "deferred", "rejected"]),
  review_notes: z.string().optional(),
  tags: z.array(z.string()),
});

const radar = defineCollection({
  type: "content",
  schema: z.object({
    id: z.string(),
    title: z.string(),
    week_label: z.string(),
    week_start: z.coerce.date().optional(),
    week_end: z.coerce.date().optional(),
    published_at: z.coerce.date(),
    summary: z.string(),
    editorial_status: z.enum(["draft", "review", "published"]),
    topics: z.array(z.string()),
    hero_note: z.string(),
    editor_name: z.string(),
    reviewed_by: z.string().optional(),
    reviewed_at: z.coerce.date().optional(),
    items: z.array(radarItem),
  }),
});

export const collections = {
  radar,
};
