import { getCollection, type CollectionEntry } from "astro:content";
import { withBase } from "./routes";

export type RadarEntry = CollectionEntry<"radar">;
export type RadarItem = RadarEntry["data"]["items"][number];

export const radarCategoryLabels: Record<RadarItem["category"], string> = {
  model: "Model",
  infra: "AI Infra",
  hpc: "HPC / GPU",
  paper: "Paper",
  tooling: "Tooling",
  china_ai: "China AI",
  geopolitics: "Geopolitics",
};

export const radarSourceTypeLabels: Record<RadarItem["source_type"], string> = {
  paper: "paper",
  repo: "repo",
  blog: "blog",
  release_notes: "release notes",
  official_docs: "official docs",
  product_update: "product update",
  company_announcement: "company announcement",
  policy: "policy",
  news: "news",
};

const importanceRank: Record<RadarItem["importance"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function byPublishedDateDesc(left: RadarEntry, right: RadarEntry): number {
  return right.data.published_at.getTime() - left.data.published_at.getTime();
}

export async function getAllRadarEntries(): Promise<RadarEntry[]> {
  return (await getCollection("radar")).sort(byPublishedDateDesc);
}

export async function getPublishedRadarEntries(): Promise<RadarEntry[]> {
  return (await getCollection("radar", ({ data }) => data.editorial_status === "published")).sort(
    byPublishedDateDesc,
  );
}

export function formatRadarDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getRadarIssuePath(slug: string): string {
  return withBase(`/radar/${slug}/`);
}

export function getRadarItemImage(item: RadarItem): { url: string | null; alt: string; sourceUrl: string | null } {
  return {
    url: item.image_url ?? null,
    alt: item.image_alt ?? `${item.title} visual marker`,
    sourceUrl: item.image_source_url ?? item.source_url ?? null,
  };
}

export function getRadarWeekRange(entry: RadarEntry): string {
  const start = entry.data.week_start ? formatRadarDate(entry.data.week_start) : "";
  const end = entry.data.week_end ? formatRadarDate(entry.data.week_end) : "";
  if (start && end) return `${start} - ${end}`;
  return entry.data.week_label;
}

export function getRadarHighlights(entry: RadarEntry, limit = 5): RadarItem[] {
  return entry.data.items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const highlightDelta = Number(Boolean(right.item.highlight)) - Number(Boolean(left.item.highlight));
      if (highlightDelta !== 0) return highlightDelta;
      if (left.item.highlight && right.item.highlight) return left.index - right.index;
      const importanceDelta = importanceRank[right.item.importance] - importanceRank[left.item.importance];
      if (importanceDelta !== 0) return importanceDelta;
      const dateDelta = right.item.published_at.getTime() - left.item.published_at.getTime();
      if (dateDelta !== 0) return dateDelta;
      return left.index - right.index;
    })
    .map(({ item }) => item)
    .slice(0, limit);
}
