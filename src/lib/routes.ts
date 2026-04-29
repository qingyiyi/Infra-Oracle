export const siteRoutes = {
  home: "/",
  radar: "/radar/",
  runner: "/runner/",
  fortune: "/fortune/",
} as const;

export type SiteRouteKey = keyof typeof siteRoutes;

export function withBase(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
