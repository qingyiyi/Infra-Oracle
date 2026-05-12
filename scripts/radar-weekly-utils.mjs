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

export const radarSourceScoreThresholds = {
  publishMinimum: 55,
  highlightMinimum: 70,
  highImportanceMinimum: 70,
  lowSourceMaximum: 1,
};

const sourceTypeBaseScores = {
  paper: 82,
  repo: 78,
  release_notes: 80,
  official_docs: 82,
  product_update: 76,
  company_announcement: 80,
  policy: 82,
  blog: 58,
  news: 48,
};

const stableOfficialSources = [
  { label: "OpenAI", domains: ["openai.com", "platform.openai.com", "cookbook.openai.com"], prefixes: ["https://github.com/openai/"] },
  { label: "Anthropic", domains: ["anthropic.com"] },
  { label: "NVIDIA", domains: ["nvidia.com", "developer.nvidia.com", "blogs.nvidia.com", "investor.nvidia.com"], prefixes: ["https://github.com/nvidia/"] },
  { label: "AWS", domains: ["aws.amazon.com", "amazon.science"] },
  { label: "Google Cloud", domains: ["cloud.google.com", "googlecloudplatform.github.io"] },
  { label: "Google AI", domains: ["ai.google.dev", "research.google", "blog.google", "developers.googleblog.com"] },
  { label: "Microsoft", domains: ["microsoft.com", "azure.microsoft.com", "devblogs.microsoft.com", "blogs.microsoft.com"] },
  { label: "Meta AI", domains: ["ai.meta.com", "engineering.fb.com", "github.com/facebookresearch"] },
  { label: "Qwen", domains: ["qwen.ai", "alibabacloud.com"], prefixes: ["https://github.com/qwenlm/"] },
  { label: "DeepSeek", domains: ["deepseek.com", "api-docs.deepseek.com"], prefixes: ["https://github.com/deepseek-ai/"] },
  { label: "Khronos", domains: ["khronos.org"] },
  { label: "arXiv", domains: ["arxiv.org"] },
];

const trustedMediaSources = [
  { label: "Reuters", domains: ["reuters.com"] },
  { label: "Associated Press", domains: ["apnews.com"] },
  { label: "The Register", domains: ["theregister.com"] },
  { label: "The Verge", domains: ["theverge.com"] },
  { label: "TechCrunch", domains: ["techcrunch.com"] },
  { label: "MIT Technology Review", domains: ["technologyreview.com"] },
];

export function parseArgs(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      result._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (["dry-run", "mock", "overwrite", "help", "check-links", "no-push"].includes(key)) {
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

function loadCodexToml(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const root = {};
  let current = root;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const cleaned = line.replace(/#.*$/, "").trim();
    if (!cleaned) continue;
    const section = cleaned.match(/^\[([^\]]+)\]$/);
    if (section) {
      current = root;
      for (const part of section[1].split(".")) {
        current[part] ??= {};
        current = current[part];
      }
      continue;
    }
    const separator = cleaned.indexOf("=");
    if (separator === -1) continue;
    const key = cleaned.slice(0, separator).trim();
    const rawValue = cleaned.slice(separator + 1).trim();
    let value;
    if (/^".*"$/.test(rawValue)) {
      value = rawValue.slice(1, -1);
    } else if (rawValue === "true" || rawValue === "false") {
      value = rawValue === "true";
    } else if (/^\d+$/.test(rawValue)) {
      value = Number(rawValue);
    } else {
      value = rawValue;
    }
    current[key] = value;
  }
  return root;
}

function normalizeBaseUrl(value) {
  if (!value) return "";
  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

function getCodexSettings() {
  const codexHome = process.env.CODEX_HOME || path.join(process.env.HOME || "", ".codex");
  const configPath = path.join(codexHome, "config.toml");
  const authPath = path.join(codexHome, "auth.json");
  const config = loadCodexToml(configPath);
  if (!config) return {};
  const providerName = config.model_provider;
  const provider = providerName ? config.model_providers?.[providerName] : null;
  if (!provider) return {};
  let apiKey = "";
  if (fs.existsSync(authPath)) {
    const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
    apiKey = auth[`${providerName}_api_key`] || auth.api_key || "";
  }
  return {
    baseUrl: normalizeBaseUrl(provider.base_url || ""),
    apiKey,
    model: config.model || "",
    timeoutMs: Number(provider.stream_idle_timeout_ms || ""),
    retries: Number(provider.request_max_retries || ""),
    retryDelayMs: 5000,
    source: `codex:${providerName}`,
    configPath,
  };
}

export function getSdkSettings() {
  const envPath = path.join(repoRoot, "runner-backend/.env");
  const fileEnv = loadDotEnv(envPath);
  const codexSettings = getCodexSettings();
  const read = (name, fallback = "") => process.env[name] ?? fileEnv[name] ?? fallback;
  const explicitApiKey = read("RUNNER_SDK_API_KEY");
  const explicitBaseUrl = read("RUNNER_SDK_BASE_URL");
  const usingCodexFallback = !explicitApiKey && Boolean(codexSettings.apiKey);
  return {
    baseUrl: normalizeBaseUrl(read("RUNNER_SDK_BASE_URL", usingCodexFallback ? codexSettings.baseUrl : "https://w.ciykj.cn/v1")),
    apiKey: explicitApiKey || codexSettings.apiKey || "",
    model: read("RUNNER_SDK_MODEL", read("RUNNER_CODEX_MODEL", usingCodexFallback ? codexSettings.model : "gpt-5.5")),
    timeoutMs: Number(read("RUNNER_SDK_TIMEOUT_MS", usingCodexFallback ? codexSettings.timeoutMs : "120000")),
    retries: Number(read("RUNNER_SDK_RETRIES", usingCodexFallback ? codexSettings.retries : "2")),
    retryDelayMs: Number(read("RUNNER_SDK_RETRY_DELAY_MS", usingCodexFallback ? codexSettings.retryDelayMs : "5000")),
    envPath,
    source: explicitApiKey || explicitBaseUrl ? "runner-env" : codexSettings.source || "defaults",
  };
}

export function timeoutMsFromArgs(args, fallback) {
  if (args["timeout-ms"] === undefined) return fallback;
  const timeoutMs = Number(args["timeout-ms"]);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
    throw new Error("--timeout-ms must be a number greater than or equal to 1000.");
  }
  return timeoutMs;
}

export function numberFromArgs(args, key, fallback, minimum = 0) {
  if (args[key] === undefined) return fallback;
  const value = Number(args[key]);
  if (!Number.isFinite(value) || value < minimum) {
    throw new Error(`--${key} must be a number greater than or equal to ${minimum}.`);
  }
  return value;
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateValue(value) {
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
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

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeDateField(value) {
  const date = dateValue(value);
  return date && Number.isFinite(date.getTime()) ? dateOnly(date) : value;
}

function sourceResultFor(sourceResults, item, index) {
  if (!sourceResults) return { ok: true };
  if (sourceResults instanceof Map) {
    return sourceResults.get(item.id) ?? sourceResults.get(item.source_url) ?? sourceResults.get(index) ?? { ok: true };
  }
  if (Array.isArray(sourceResults)) {
    return sourceResults[index] ?? { ok: true };
  }
  return sourceResults[item.id] ?? sourceResults[item.source_url] ?? sourceResults[index] ?? { ok: true };
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function hostnameFor(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function hostMatchesDomain(hostname, domain) {
  const normalized = domain.toLowerCase().replace(/^www\./, "");
  return hostname === normalized || hostname.endsWith(`.${normalized}`);
}

function sourceMatchFromList(hostname, url, sources) {
  if (!hostname) return null;
  const normalizedUrl = typeof url === "string" ? url.toLowerCase() : "";
  return (
    sources.find(
      (source) =>
        source.domains.some((domain) => hostMatchesDomain(hostname, domain)) ||
        (source.prefixes ?? []).some((prefix) => normalizedUrl.startsWith(prefix.toLowerCase())),
    ) ?? null
  );
}

function isOriginalSourceType(sourceType) {
  return ["paper", "repo", "release_notes", "official_docs", "product_update", "company_announcement", "policy"].includes(sourceType);
}

export function scoreRadarSource(item, sourceResult = { ok: true }) {
  const sourceType = item?.source_type;
  const hostname = hostnameFor(item?.source_url);
  const officialSource = sourceMatchFromList(hostname, item?.source_url, stableOfficialSources);
  const trustedMedia = sourceMatchFromList(hostname, item?.source_url, trustedMediaSources);
  let score = sourceTypeBaseScores[sourceType] ?? 40;
  const reasons = [];

  if (officialSource) {
    score += 12;
    reasons.push(`stable-official:${officialSource.label}`);
  } else if (trustedMedia) {
    score += 8;
    reasons.push(`trusted-media:${trustedMedia.label}`);
  } else if (sourceType === "news") {
    score -= 8;
    reasons.push("news-not-in-trusted-list");
  } else if (sourceType === "blog") {
    score -= 4;
    reasons.push("blog-not-in-stable-list");
  }

  if (isOriginalSourceType(sourceType)) reasons.push("original-source-type");
  if (sourceResult?.ok === false) {
    score -= 30;
    reasons.push("unreachable-source-url");
  }
  if (item?.credibility === "high") score += 8;
  if (item?.credibility === "medium") score += 2;
  if (item?.credibility === "low") {
    score -= 24;
    reasons.push("low-credibility");
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  let level = "medium";
  if (clampedScore >= 70) level = "high";
  if (clampedScore < 55) level = "low";
  return {
    score: clampedScore,
    level,
    hostname,
    stable: Boolean(officialSource),
    sourceLabel: officialSource?.label ?? trustedMedia?.label ?? hostname,
    reasons,
  };
}

function textLength(value) {
  return typeof value === "string" ? value.trim().length : 0;
}

function stringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[；;]\s*|\n+/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function completenessScore(item) {
  let score = 0;
  for (const field of ["summary", "why_it_matters", "background", "details", "impact"]) {
    if (textLength(item[field]) >= 48) score += 1;
  }
  if (Array.isArray(item.watch_points) && item.watch_points.length >= 2) score += 1;
  if (item.image_url && item.image_alt && item.image_source_url) score += 1;
  return score;
}

function autoHighlightScore(item, sourceResult) {
  const sourceScore = scoreRadarSource(item, sourceResult);
  let score = 0;
  if (item.importance === "high") score += 60;
  if (item.importance === "medium") score += 25;
  if (item.credibility === "high") score += 40;
  if (item.credibility === "medium") score += 18;
  if (sourceResult?.ok !== false) score += 20;
  score += Math.round(sourceScore.score / 4);
  score += completenessScore(item);
  return score;
}

export function normalizeAutoPublishData(data, options = {}) {
  const normalized = cloneData(data);
  normalized.week_start = normalizeDateField(normalized.week_start);
  normalized.week_end = normalizeDateField(normalized.week_end);
  normalized.published_at = normalizeDateField(normalized.published_at);
  normalized.topics = stringList(normalized.topics);
  normalized.items = Array.isArray(normalized.items) ? normalized.items : [];

  for (const item of normalized.items) {
    item.published_at = normalizeDateField(item.published_at);
    item.watch_points = stringList(item.watch_points);
    item.tags = stringList(item.tags);
    for (const field of ["id", "category", "title", "source_name", "source_url", "source_type", "summary", "why_it_matters", "background", "details", "impact", "credibility", "importance", "review_status", "image_url", "image_alt", "image_source_url", "review_notes"]) {
      if (item[field] !== undefined && item[field] !== null && typeof item[field] !== "string") {
        item[field] = String(item[field]);
      }
    }
    item.highlight = false;
  }

  const ranked = normalized.items
    .map((item, index) => ({
      item,
      index,
      score: autoHighlightScore(item, sourceResultFor(options.sourceResults, item, index)),
      sourceResult: sourceResultFor(options.sourceResults, item, index),
    }))
    .filter(({ item, sourceResult }) => {
      const sourceScore = scoreRadarSource(item, sourceResult);
      return (
        item.credibility !== "low" &&
        sourceResult?.ok !== false &&
        sourceScore.score >= radarSourceScoreThresholds.highlightMinimum
      );
    })
    .sort((left, right) => right.score - left.score || left.index - right.index);

  for (const entry of ranked.slice(0, 3)) {
    entry.item.highlight = true;
  }

  return normalized;
}

export function validateAutoPublishReady(data, options = {}) {
  const errors = [];
  const warnings = [];
  const items = Array.isArray(data.items) ? data.items : [];

  if (isPlaceholderDraft(data)) {
    errors.push("Refusing to auto-publish the placeholder draft. Generate a real weekly issue first.");
  }
  if (!["draft", "review", "published"].includes(data.editorial_status)) {
    errors.push(`Invalid editorial_status for auto-publish: ${data.editorial_status}`);
  }
  if (items.length < 5) {
    errors.push(`Auto-publish requires at least 5 items; received ${items.length}.`);
  }

  const sourceScores = items.map((item, index) => ({
    item,
    index,
    sourceResult: sourceResultFor(options.sourceResults, item, index),
    sourceScore: scoreRadarSource(item, sourceResultFor(options.sourceResults, item, index)),
  }));
  const lowSourceScores = sourceScores.filter(({ sourceScore }) => sourceScore.score < radarSourceScoreThresholds.publishMinimum);
  if (lowSourceScores.length > radarSourceScoreThresholds.lowSourceMaximum) {
    errors.push(
      `Auto-publish allows at most ${radarSourceScoreThresholds.lowSourceMaximum} low source-score item; received ${lowSourceScores.length}.`,
    );
  }
  for (const { item, index, sourceScore } of sourceScores) {
    if (item.highlight && sourceScore.score < radarSourceScoreThresholds.highlightMinimum) {
      errors.push(`items[${index}] source score ${sourceScore.score} is too low for highlight; minimum is ${radarSourceScoreThresholds.highlightMinimum}.`);
    }
    if (item.importance === "high" && sourceScore.score < radarSourceScoreThresholds.highImportanceMinimum) {
      errors.push(
        `items[${index}] is high importance but source score ${sourceScore.score} is below ${radarSourceScoreThresholds.highImportanceMinimum}; use official, primary, paper, release, government, or trusted primary reporting.`,
      );
    }
  }

  const highImportanceCount = items.filter((item) => item.importance === "high").length;
  if (highImportanceCount < 2) {
    errors.push(`Auto-publish requires at least 2 high-importance items; received ${highImportanceCount}.`);
  }

  const lowCredibility = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.credibility === "low");
  if (lowCredibility.length > 1) {
    errors.push(`Auto-publish allows at most 1 low-credibility item; received ${lowCredibility.length}.`);
  }
  for (const { item, index } of lowCredibility) {
    if (item.highlight) {
      errors.push(`items[${index}] has low credibility and cannot be highlighted.`);
    }
  }

  const sourceFailures = [];
  items.forEach((item, index) => {
    const result = sourceResultFor(options.sourceResults, item, index);
    if (result?.ok === false) {
      sourceFailures.push({ item, index });
    }
  });
  if (sourceFailures.length > 1) {
    errors.push(`Auto-publish allows at most 1 unreachable source_url; received ${sourceFailures.length}.`);
  }
  for (const { item, index } of sourceFailures) {
    if (item.highlight) {
      errors.push(`items[${index}] has an unreachable source_url and cannot be highlighted.`);
    }
  }

  const highlightCount = items.filter((item) => item.highlight).length;
  if (highlightCount !== 3) {
    errors.push(`Auto-publish requires exactly 3 highlights after normalization; received ${highlightCount}.`);
  }

  items.forEach((item, index) => {
    const label = `items[${index}]`;
    if (item.image_url) {
      if (!isValidUrl(item.image_url)) errors.push(`${label} image_url is not a valid URL.`);
      if (!item.image_alt) errors.push(`${label} has image_url but lacks image_alt.`);
      if (!item.image_source_url) {
        errors.push(`${label} has image_url but lacks image_source_url.`);
      } else if (!isValidUrl(item.image_source_url)) {
        errors.push(`${label} image_source_url is not a valid URL.`);
      }
    }
  });

  if (items.length > 8) {
    warnings.push(`Auto-publish will keep ${items.length} items; normal editorial target is 6-8.`);
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
