/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_REPO_NAME?: string;
  readonly PUBLIC_GITHUB_PAGES_KIND?: string;
  readonly PUBLIC_RUNNER_API_BASE?: string;
}

declare module "js-yaml" {
  export function load(input: string): unknown;
}
