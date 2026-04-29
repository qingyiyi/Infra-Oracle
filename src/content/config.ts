import { defineCollection, z } from "astro:content";

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
  }),
});

export const collections = {
  radar,
};
