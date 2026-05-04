import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

export const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const draftPath = path.join(repoRoot, "src/content/radar/weekly-ai-infra-radar-draft.md");
export const contentDir = path.join(repoRoot, "src/content/radar");

export const allowedCategories = new Set(["model", "infra", "hpc", "paper", "tooling", "china_ai", "geopolitics"]);
export const allowedSourceTypes = new Set([
  "paper",
  "repo",
  "blog",
  "release_notes",
  "official_docs",
  "product_update",
  "company_announcement",
  "policy",
  "news",
]);
export const allowedLevels = new Set(["high", "medium", "low"]);

export function parseArgs(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      result._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (["dry-run", "mock", "overwrite", "help", "check-links"].includes(key)) {
      result[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    result[key] = value;
    index += 1;
  }
  return result;
}

export function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key) env[key] = value;
  }
  return env;
}

export function getSdkSettings() {
  const envPath = path.join(repoRoot, "runner-backend/.env");
  const fileEnv = loadDotEnv(envPath);
  const read = (name, fallback = "") => process.env[name] ?? fileEnv[name] ?? fallback;
  return {
    baseUrl: read("RUNNER_SDK_BASE_URL", "https://w.ciykj.cn/v1").replace(/\/$/, ""),
    apiKey: read("RUNNER_SDK_API_KEY"),
    model: read("RUNNER_SDK_MODEL", read("RUNNER_CODEX_MODEL", "gpt-5.5")),
    timeoutMs: Number(read("RUNNER_SDK_TIMEOUT_MS", "120000")),
    envPath,
  };
}

export function previousCompleteWeek(now = new Date()) {
  const local = new Date(now);
  const day = local.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const thisMonday = new Date(local);
  thisMonday.setHours(0, 0, 0, 0);
  thisMonday.setDate(local.getDate() - daysSinceMonday);
  const start = new Date(thisMonday);
  start.setDate(thisMonday.getDate() - 7);
  const end = new Date(thisMonday);
  end.setDate(thisMonday.getDate() - 1);
  return { start, end };
}

export function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function dateValue(value) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return null;
}

export function dateLabel(value) {
  const date = dateValue(value);
  return date && Number.isFinite(date.getTime()) ? dateOnly(date) : "?";
}

export function isoWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return { year: target.getUTCFullYear(), week };
}

export function issueNumberForWeek(start) {
  return isoWeek(start).week;
}

export function parseMarkdownFrontmatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    throw new Error("Draft must start with YAML frontmatter.");
  }
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) {
    throw new Error("Draft frontmatter closing marker not found.");
  }
  const rawYaml = markdown.slice(4, end);
  const body = markdown.slice(end + 4).replace(/^\r?\n/, "");
  return {
    data: yaml.load(rawYaml),
    body,
    rawYaml,
  };
}

export function dumpMarkdown(data, body) {
  return `---\n${yaml.dump(data, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  })}---\n\n${body.trim()}\n`;
}

export function readDraft() {
  if (!fs.existsSync(draftPath)) {
    throw new Error(`Draft not found: ${draftPath}`);
  }
  return parseMarkdownFrontmatter(fs.readFileSync(draftPath, "utf8"));
}

export function slugForIssue(data) {
  if (typeof data.slug === "string" && data.slug.trim()) {
    return data.slug.trim();
  }
  const id = typeof data.id === "string" ? data.id.replace(/^radar-/, "weekly-ai-infra-radar-") : "";
  return id || "weekly-ai-infra-radar-draft";
}

export function isPlaceholderDraft(data) {
  return data?.id === "radar-draft" || slugForIssue(data) === "weekly-ai-infra-radar-draft";
}

function withinInclusive(date, start, end) {
  const value = dateValue(date);
  const startDate = dateValue(start);
  const endDate = dateValue(end);
  if (!value || !startDate || !endDate) return true;
  if (!Number.isFinite(value.getTime()) || !Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return true;
  return value.getTime() >= startDate.getTime() && value.getTime() <= endDate.getTime();
}

export function validateDraftData(data) {
  const errors = [];
  const warnings = [];
  const required = [
    "id",
    "title",
    "week_label",
    "week_start",
    "week_end",
    "published_at",
    "summary",
    "editorial_status",
    "topics",
    "hero_note",
    "editor_name",
    "items",
  ];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`Missing issue field: ${field}`);
    }
  }
  if (!["draft", "review", "published"].includes(data.editorial_status)) {
    errors.push(`Invalid editorial_status: ${data.editorial_status}`);
  }
  if (data.week_start && data.week_end) {
    const start = dateValue(data.week_start);
    const end = dateValue(data.week_end);
    if (!start || !end || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      errors.push("week_start or week_end is not a valid date.");
    } else if (start.getTime() > end.getTime()) {
      errors.push("week_start must be before or equal to week_end.");
    }
  }
  if (!Array.isArray(data.items) || data.items.length < 1) {
    errors.push("Issue must contain at least one item.");
    return { errors, warnings };
  }
  if (data.items.length < 6) warnings.push(`Issue has ${data.items.length} items; expected 6-8 for real weekly issues.`);
  if (data.items.length > 8) warnings.push(`Issue has ${data.items.length} items; expected 6-8 for real weekly issues.`);

  const geoCount = data.items.filter((item) => item.category === "geopolitics").length;
  if (geoCount > 1 || geoCount / data.items.length > 0.2) {
    warnings.push(`Geopolitics appears ${geoCount} times; target is about 10% and normally no more than one item.`);
  }

  data.items.forEach((item, index) => {
    const label = `items[${index}]`;
    for (const field of ["id", "category", "title", "source_name", "source_url", "source_type", "published_at", "summary", "why_it_matters", "credibility", "importance", "review_status", "tags"]) {
      if (item[field] === undefined || item[field] === null || item[field] === "") {
        errors.push(`${label} missing field: ${field}`);
      }
    }
    if (!allowedCategories.has(item.category)) errors.push(`${label} invalid category: ${item.category}`);
    if (!allowedSourceTypes.has(item.source_type)) errors.push(`${label} invalid source_type: ${item.source_type}`);
    if (!allowedLevels.has(item.credibility)) errors.push(`${label} invalid credibility: ${item.credibility}`);
    if (!allowedLevels.has(item.importance)) errors.push(`${label} invalid importance: ${item.importance}`);
    if (!["candidate", "approved", "deferred", "rejected"].includes(item.review_status)) {
      errors.push(`${label} invalid review_status: ${item.review_status}`);
    }
    try {
      new URL(item.source_url);
    } catch {
      errors.push(`${label} source_url is not a valid URL.`);
    }
    if (!withinInclusive(item.published_at, data.week_start, data.week_end)) {
      warnings.push(`${label} published_at ${dateLabel(item.published_at)} is outside issue week ${dateLabel(data.week_start)} -> ${dateLabel(data.week_end)}.`);
    }
    for (const field of ["background", "details", "impact"]) {
      if (!item[field] || String(item[field]).trim().length < 24) {
        warnings.push(`${label} ${field} is short or missing.`);
      }
    }
    if (!Array.isArray(item.watch_points) || item.watch_points.length < 1) {
      warnings.push(`${label} watch_points should contain at least one follow-up point.`);
    }
    if (item.image_url && (!item.image_alt || !item.image_source_url)) {
      warnings.push(`${label} has image_url but lacks image_alt or image_source_url.`);
    }
  });

  return { errors, warnings };
}

export function validatePublishReady(data) {
  const errors = [];
  const warnings = [];
  if (isPlaceholderDraft(data)) {
    errors.push("Refusing to publish the placeholder draft. Run generate for a real weekly issue first.");
  }
  if (!["draft", "review"].includes(data.editorial_status)) {
    warnings.push(`Draft editorial_status is ${data.editorial_status}; publish will still write editorial_status=published.`);
  }
  for (const [index, item] of (data.items ?? []).entries()) {
    if (item.review_status !== "approved") {
      errors.push(`items[${index}] is not approved: ${item.review_status}`);
    }
    if (item.credibility === "low") {
      errors.push(`items[${index}] has low credibility; keep it in candidate review instead of publishing.`);
    }
  }
  return { errors, warnings };
}

async function fetchUrl(url, method, timeoutMs) {
  return fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "user-agent": "Mozilla/5.0 Infra-Oracle-Radar-Link-Check/1.0",
    },
  });
}

export async function checkUrlReachability(url, timeoutMs = 8000) {
  const attempts = ["HEAD", "GET"];
  let lastError = "";
  for (const method of attempts) {
    try {
      const response = await fetchUrl(url, method, timeoutMs);
      if (response.ok || [401, 403].includes(response.status)) {
        return {
          ok: true,
          status: response.status,
          finalUrl: response.url,
        };
      }
      lastError = `HTTP ${response.status}`;
      if (![405, 406, 429, 500, 502, 503, 504].includes(response.status)) {
        return {
          ok: false,
          status: response.status,
          finalUrl: response.url,
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  return {
    ok: false,
    status: null,
    error: lastError,
  };
}
