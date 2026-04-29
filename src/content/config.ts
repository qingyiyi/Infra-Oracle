import { defineCollection, z } from "astro:content";

const radarItem = z.object({
  id: z.string(),
  category: z.enum(["model", "infra", "hpc", "paper", "tooling"]),
  title: z.string(),
  source_name: z.string(),
  source_url: z.string().url(),
  source_type: z.enum(["paper", "repo", "blog", "release_notes", "official_docs", "product_update"]),
  published_at: z.coerce.date(),
  summary: z.string(),
  why_it_matters: z.string(),
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
