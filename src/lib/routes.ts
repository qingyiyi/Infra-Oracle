export const siteRoutes = {
  home: "/",
  radar: "/radar/",
  runner: "/runner/",
  fortune: "/fortune/",
} as const;

export type SiteRouteKey = keyof typeof siteRoutes;

const fallbackSite = "https://example.github.io";
const fallbackRepo = "github-page";

function getBasePath(): string {
  if (import.meta.env.DEV) {
    return "/";
  }

  const site = import.meta.env.PUBLIC_SITE_URL ?? fallbackSite;
  const repoName = import.meta.env.PUBLIC_REPO_NAME ?? fallbackRepo;
  const hostname = new URL(site).hostname;
  const githubOwner = hostname.endsWith(".github.io")
    ? hostname.replace(/\.github\.io$/, "")
    : null;
  const usesCustomDomain = !hostname.endsWith(".github.io");
  const isUserSite =
    import.meta.env.PUBLIC_GITHUB_PAGES_KIND === "user" ||
    (githubOwner !== null && repoName === `${githubOwner}.github.io`);

  return usesCustomDomain || isUserSite ? "/" : `/${repoName}/`;
}

export function withBase(path: string): string {
  if (!path) {
    return getBasePath();
  }

  if (path.startsWith("#") || /^[a-z]+:/i.test(path)) {
    return path;
  }

  const base = getBasePath();
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path === "/" ? "" : path.replace(/^\/+/, "");

  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}
