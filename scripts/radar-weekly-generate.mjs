#!/usr/bin/env node
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import {
  dateOnly,
  dateValue,
  draftPath,
  dumpMarkdown,
  getSdkSettings,
  issueNumberForWeek,
  numberFromArgs,
  parseArgs,
  previousCompleteWeek,
  timeoutMsFromArgs,
} from "./radar-weekly-utils.mjs";

function usage() {
  console.log(`Usage: scripts/radar-weekly.sh generate [--week-start YYYY-MM-DD --week-end YYYY-MM-DD] [--issue-number N] [--dry-run] [--mock] [--mock-fail MODE] [--timeout-ms N] [--retries N] [--retry-delay-ms N]`);
}

function buildMockItems({ start, year, issue, failMode }) {
  const weekDates = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return dateOnly(date);
  });
  const items = [
    {
      id: `radar-${year}-w${issue}-item-01`,
      category: "infra",
      title: "Mock cloud inference control plane update",
      source_name: "OpenAI News",
      source_url: "https://openai.com/news/",
      source_type: "company_announcement",
      published_at: weekDates[0],
      summary: "A mock infrastructure update with enough structure to validate automated publishing.",
      why_it_matters: "It checks whether the Radar workflow can promote high-impact infrastructure items without manual review.",
      background: "The mock item represents a realistic weekly signal about model distribution, governance, and cloud runtime boundaries.",
      details: "It includes a stable source URL, weekly date, detailed context, and explicit operational implications for AI infrastructure teams.",
      impact: "Teams can use it to verify auto-publish gates, highlight normalization, and static content rendering before live SDK calls.",
      image_url: "https://avatars.githubusercontent.com/u/14957082?s=400&v=4",
      image_alt: "OpenAI GitHub organization avatar used as a mock public image source.",
      image_source_url: "https://github.com/openai",
      watch_points: ["Confirm live SDK output replaces mock content before real publishing.", "Validate cloud control-plane claims against official sources."],
      highlight: true,
      credibility: "high",
      importance: "high",
      review_status: "candidate",
      tags: ["mock", "infra", "cloud"],
    },
    {
      id: `radar-${year}-w${issue}-item-02`,
      category: "model",
      title: "Mock multimodal model release",
      source_name: "NVIDIA Blog",
      source_url: "https://blogs.nvidia.com/",
      source_type: "company_announcement",
      published_at: weekDates[1],
      summary: "A mock model release signal focused on deployment, throughput, and multimodal agent workloads.",
      why_it_matters: "It ensures the automated gate sees a second high-importance item with strong source structure.",
      background: "Model releases often affect inference cost, serving architecture, and vendor stack choices for production teams.",
      details: "The item carries complete analysis fields so the auto highlighter can rank it above lower-impact candidates.",
      impact: "Maintainers can validate that exactly three highlights are selected from credible, reachable, high-value items.",
      image_url: "https://avatars.githubusercontent.com/u/1728152?s=400&v=4",
      image_alt: "NVIDIA GitHub organization avatar used as a mock public image source.",
      image_source_url: "https://github.com/NVIDIA",
      watch_points: ["Compare throughput claims with independent benchmarks.", "Check whether release artifacts are available to developers."],
      highlight: true,
      credibility: "high",
      importance: "high",
      review_status: "candidate",
      tags: ["mock", "model", "inference"],
    },
    {
      id: `radar-${year}-w${issue}-item-03`,
      category: "tooling",
      title: "Mock serving framework release notes",
      source_name: "GitHub",
      source_url: "https://github.com/",
      source_type: "release_notes",
      published_at: weekDates[2],
      summary: "A mock tooling update describing release-note style changes for serving and observability.",
      why_it_matters: "Serving framework releases can change migration effort, runtime stability, and operational defaults.",
      background: "The item models project release notes rather than a company announcement, exercising the source type mix.",
      details: "It includes enough field depth for the automated ranker to select it as a highlight if higher-ranked items are unsuitable.",
      impact: "The workflow can preserve a balanced issue without requiring every highlighted item to include an official product image.",
      watch_points: ["Review compatibility notes before adopting a serving release.", "Track regressions in latency and memory behavior."],
      highlight: true,
      credibility: "medium",
      importance: "medium",
      review_status: "candidate",
      tags: ["mock", "tooling", "serving"],
    },
    {
      id: `radar-${year}-w${issue}-item-04`,
      category: "hpc",
      title: "Mock GPU systems availability signal",
      source_name: "AWS News",
      source_url: "https://aws.amazon.com/news/",
      source_type: "product_update",
      published_at: weekDates[3],
      summary: "A mock GPU capacity and systems update for validating category and source diversity.",
      why_it_matters: "Capacity updates influence where AI teams can place training, fine-tuning, and inference workloads.",
      background: "Availability and region changes often matter more to deployment planning than raw benchmark announcements.",
      details: "The item is intentionally medium-importance so the gate can pass with mixed priority levels.",
      impact: "It confirms the issue can include operationally useful non-highlight items after the automatic quality gate.",
      watch_points: ["Check regional availability and quota behavior.", "Compare pricing against existing reserved capacity."],
      credibility: "medium",
      importance: "medium",
      review_status: "candidate",
      tags: ["mock", "gpu", "capacity"],
    },
    {
      id: `radar-${year}-w${issue}-item-05`,
      category: "paper",
      title: "Mock inference efficiency paper",
      source_name: "arXiv",
      source_url: "https://arxiv.org/",
      source_type: "paper",
      published_at: weekDates[4],
      summary: "A mock research paper item for checking paper category handling in automated publishing.",
      why_it_matters: "Efficiency papers can shift batching, memory, or kernel choices even before production-ready code appears.",
      background: "The item models early research with useful engineering implications but lower certainty than official releases.",
      details: "It contains full explanatory fields and a stable URL while staying non-highlight unless the ranker needs it.",
      impact: "This gives the gate enough items to pass without forcing every entry to be high importance.",
      watch_points: ["Look for reproducible code or independent benchmarks.", "Assess whether assumptions match production serving workloads."],
      credibility: "medium",
      importance: "low",
      review_status: "candidate",
      tags: ["mock", "paper", "efficiency"],
    },
    {
      id: `radar-${year}-w${issue}-item-06`,
      category: "china_ai",
      title: "Mock China AI platform update",
      source_name: "Qwen",
      source_url: "https://qwen.ai/",
      source_type: "product_update",
      published_at: weekDates[5],
      summary: "A mock China AI platform update for maintaining the Radar regional coverage mix.",
      why_it_matters: "China AI platform changes affect model availability, domestic deployment choices, and ecosystem compatibility.",
      background: "The weekly Radar tracks China AI only when it directly intersects model platforms or infrastructure decisions.",
      details: "The item includes complete fields and one low-confidence marker to exercise the relaxed automated gate.",
      impact: "The quality gate allows at most one low-credibility item and prevents it from being highlighted.",
      watch_points: ["Replace low-confidence mock content with stronger official sources for real issues.", "Track whether tooling support follows the platform update."],
      credibility: "low",
      importance: "low",
      review_status: "candidate",
      tags: ["mock", "china-ai", "platform"],
    },
  ];

  if (failMode === "few-items") return items.slice(0, 4);
  if (failMode === "low-credibility") {
    return items.map((item, index) => (index >= 4 ? { ...item, credibility: "low" } : item));
  }
  if (failMode === "low-highlight") {
    return items.map((item, index) => (index === 5 ? { ...item, highlight: true } : item));
  }
  if (failMode === "bad-url") {
    return items.map((item, index) => (index >= 4 ? { ...item, source_url: `https://invalid.invalid/radar-${index}` } : item));
  }
  if (failMode === "weak-source") {
    return items.map((item, index) =>
      index < 2
        ? {
            ...item,
            source_name: "Example Aggregator",
            source_url: `https://example.org/radar/secondary-summary-${index}`,
            source_type: "news",
          }
        : item,
    );
  }
  return items;
}

export function buildMockDraft({ start, end, issueNumber, failMode }) {
  const year = start.getFullYear();
  const issue = String(issueNumber).padStart(2, "0");
  return dumpMarkdown(
    {
      id: `radar-${year}-w${issue}`,
      slug: `weekly-ai-infra-radar-${year}-w${issue}`,
      title: `Weekly AI Infra Radar #${issueNumber}`,
      week_label: `${year} W${issue}`,
      week_start: dateOnly(start),
      week_end: dateOnly(end),
      published_at: dateOnly(end),
      summary: "Mock draft for validating the automated Radar weekly workflow. Replace with SDK generated content before real publishing.",
      editorial_status: "draft",
      topics: ["ai-infra", "models", "gpu"],
      hero_note: "Mock draft generated without SDK calls for local auto-publish validation.",
      editor_name: "qingyiyi",
      items: buildMockItems({ start, year, issue, failMode }),
    },
    "## Editorial Draft\n\nThis is a mock draft for automated workflow validation. Generate real candidates with SDK search before production publishing.",
  );
}

function buildPrompt({ start, end, issueNumber }) {
  const year = start.getFullYear();
  const issue = String(issueNumber).padStart(2, "0");
  return [
    `Generate a human-review draft for Weekly AI Infra Radar #${issueNumber}.`,
    `Time window: ${dateOnly(start)} through ${dateOnly(end)} inclusive. Do not include events outside this complete week.`,
    "Focus: AI lab model/product releases, AI infrastructure, NVIDIA/GPU/CUDA/inference/datacenter, China AI dynamics.",
    "International geopolitics should be about 10%: include at most one major event only if it affects chips, energy, supply chain, markets, or AI infrastructure.",
    "Use web search and prioritize official sources, release notes, company announcements, papers, regulatory/government originals, and credible primary reporting.",
    "For high-importance items, prefer source_url from official domains, primary docs, project releases, papers, government/regulatory originals, or a trusted primary media source such as Reuters/AP when no original source is available.",
    "Avoid secondary aggregators for highlights. A high-importance highlight with only a weak news/blog/aggregator URL will fail the auto-publish source-score gate.",
    "Mark each item `review_status: candidate`; the auto-publish script will validate sources, normalize highlights, and promote passing items.",
    "Return only Markdown with YAML frontmatter. No code fences.",
    "The frontmatter must match this structure:",
    `id: radar-${year}-w${issue}`,
    `slug: weekly-ai-infra-radar-${year}-w${issue}`,
    `title: "Weekly AI Infra Radar #${issueNumber}"`,
    `week_label: ${year} W${issue}`,
    `week_start: ${dateOnly(start)}`,
    `week_end: ${dateOnly(end)}`,
    `published_at: ${dateOnly(end)}`,
    "summary: Chinese summary, 1-2 sentences",
    "editorial_status: draft",
    "topics: string[]",
    "hero_note: Chinese one-line editorial note",
    "editor_name: qingyiyi",
    "items: 6-8 items. Each item requires id, category, title, source_name, source_url, source_type, published_at, summary, why_it_matters, background, details, impact, watch_points, credibility, importance, review_status, tags.",
    "Allowed categories: model, infra, hpc, paper, tooling, china_ai, geopolitics.",
    "Allowed source_type: paper, repo, blog, release_notes, official_docs, product_update, company_announcement, policy, news.",
    "Use Chinese content by default. Keep titles factual. Do not invent URLs. Do not use example.com.",
    "Image fields are optional. Only include image_url/image_alt/image_source_url when the URL is valid and the source page explains the image context.",
    "After frontmatter, write a short Chinese editorial intro with 2-4 bullets.",
  ].join("\n");
}

async function postResponses(settings, input, signal) {
  const response = await fetch(`${settings.baseUrl}/responses`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${settings.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: settings.model,
      input,
      tools: [{ type: "web_search" }],
    }),
    signal,
  });
  const raw = await response.text();
  if (!response.ok) {
    const error = new Error(`SDK Responses request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  const body = raw ? JSON.parse(raw) : {};
  if (typeof body.output_text === "string" && body.output_text.trim()) {
    return body.output_text.trim();
  }
  const parts = [];
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableSdkError(error) {
  return error?.name === "AbortError" || [429, 502, 503, 504].includes(error?.status);
}

function sdkFailureMessage(error, { timeoutMs, retries }) {
  if (error?.name === "AbortError") {
    return `SDK Responses request timed out after ${timeoutMs}ms. Increase RUNNER_SDK_TIMEOUT_MS or pass --timeout-ms for this run.`;
  }
  if (error?.status === 504) {
    return `SDK Responses gateway timed out with status 504 after ${retries + 1} attempt(s). The SDK gateway/model web-search request did not finish in time; retry later, reduce prompt scope, or check the private SDK service.`;
  }
  if ([429, 502, 503].includes(error?.status)) {
    return `SDK Responses request failed with retryable status ${error.status} after ${retries + 1} attempt(s). Retry later or check the private SDK service.`;
  }
  return error?.message ?? String(error);
}

export async function generateWeeklyDraftMarkdown({ start, end, issueNumber, mock = false, mockFail = "", timeoutMs, retries, retryDelayMs }) {
  if (mock) {
    return buildMockDraft({ start, end, issueNumber, failMode: mockFail });
  }
  const settings = getSdkSettings();
  if (!settings.apiKey) {
    throw new Error("No SDK API key found. Set RUNNER_SDK_API_KEY in the local Radar SDK environment or configure ~/.codex auth; pass --mock for local workflow validation.");
  }
  const effectiveTimeoutMs = Number.isFinite(timeoutMs) ? timeoutMs : Number.isFinite(settings.timeoutMs) ? settings.timeoutMs : 120000;
  const effectiveRetries = Number.isFinite(retries) ? retries : Number.isFinite(settings.retries) ? settings.retries : 2;
  const effectiveRetryDelayMs = Number.isFinite(retryDelayMs) ? retryDelayMs : Number.isFinite(settings.retryDelayMs) ? settings.retryDelayMs : 5000;
  const input = buildPrompt({ start, end, issueNumber });
  console.log(`SDK settings: source=${settings.source}, base=${settings.baseUrl}, model=${settings.model}, key=<redacted>`);
  let lastError;
  for (let attempt = 0; attempt <= effectiveRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), effectiveTimeoutMs);
    try {
      return await postResponses(settings, input, controller.signal);
    } catch (error) {
      lastError = error;
      if (!isRetryableSdkError(error) || attempt === effectiveRetries) break;
      console.warn(`SDK generation attempt ${attempt + 1} failed with ${error.status ?? error.name}; retrying in ${effectiveRetryDelayMs}ms.`);
      await sleep(effectiveRetryDelayMs);
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(sdkFailureMessage(lastError, { timeoutMs: effectiveTimeoutMs, retries: effectiveRetries }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }

  const defaultWeek = previousCompleteWeek();
  const start = dateValue(args["week-start"] ?? dateOnly(defaultWeek.start));
  const end = dateValue(args["week-end"] ?? dateOnly(defaultWeek.end));
  const issueNumber = Number(args["issue-number"] ?? issueNumberForWeek(start));
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || !Number.isFinite(issueNumber)) {
    throw new Error("Invalid week-start, week-end, or issue-number.");
  }

  const markdown = await generateWeeklyDraftMarkdown({
    start,
    end,
    issueNumber,
    mock: Boolean(args.mock),
    mockFail: args["mock-fail"],
    timeoutMs: timeoutMsFromArgs(args, undefined),
    retries: numberFromArgs(args, "retries", undefined, 0),
    retryDelayMs: numberFromArgs(args, "retry-delay-ms", undefined, 0),
  });

  if (!markdown.startsWith("---")) {
    throw new Error("Generated content did not start with YAML frontmatter. Draft was not written.");
  }

  if (args["dry-run"]) {
    console.log(markdown);
  } else {
    fs.writeFileSync(draftPath, `${markdown.trim()}\n`);
    console.log(`Draft written: ${draftPath}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
