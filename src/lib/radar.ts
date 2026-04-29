import { getCollection, type CollectionEntry } from "astro:content";
import { withBase } from "./routes";

export type RadarEntry = CollectionEntry<"radar">;

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
