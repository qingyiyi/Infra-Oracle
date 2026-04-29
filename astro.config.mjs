import { defineConfig } from "astro/config";

const fallbackSite = "https://example.github.io";
const fallbackRepo = "github-page";

export default defineConfig(({ command }) => {
  const site = process.env.PUBLIC_SITE_URL ?? fallbackSite;
  const repoName = process.env.PUBLIC_REPO_NAME ?? fallbackRepo;
  const hostname = new URL(site).hostname;
  const githubOwner = hostname.endsWith(".github.io")
    ? hostname.replace(/\.github\.io$/, "")
    : null;
  const usesCustomDomain = !hostname.endsWith(".github.io");
  const isUserSite =
    process.env.PUBLIC_GITHUB_PAGES_KIND === "user" ||
    (githubOwner !== null && repoName === `${githubOwner}.github.io`);
  const base =
    command === "dev" || usesCustomDomain || isUserSite ? "/" : `/${repoName}`;

  return {
    site,
    base,
    output: "static",
  };
});
