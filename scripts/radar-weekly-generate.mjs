#!/usr/bin/env node
import fs from "node:fs";
import {
  dateOnly,
  draftPath,
  dumpMarkdown,
  getSdkSettings,
  issueNumberForWeek,
  parseArgs,
  previousCompleteWeek,
} from "./radar-weekly-utils.mjs";

function usage() {
  console.log(`Usage: scripts/radar-weekly.sh generate [--week-start YYYY-MM-DD --week-end YYYY-MM-DD] [--issue-number N] [--dry-run] [--mock]`);
}

function buildMockDraft({ start, end, issueNumber }) {
  const year = start.getFullYear();
  return dumpMarkdown(
    {
      id: `radar-${year}-w${String(issueNumber).padStart(2, "0")}`,
      slug: `weekly-ai-infra-radar-${year}-w${String(issueNumber).padStart(2, "0")}`,
      title: `Weekly AI Infra Radar #${issueNumber}`,
      week_label: `${year} W${String(issueNumber).padStart(2, "0")}`,
      week_start: dateOnly(start),
      week_end: dateOnly(end),
      published_at: dateOnly(end),
      summary: "Mock draft for validating the Radar weekly workflow. Replace with SDK generated and human-reviewed content before publishing.",
      editorial_status: "draft",
      topics: ["ai-infra", "models", "gpu"],
      hero_note: "Mock draft generated without SDK calls.",
      editor_name: "qingyiyi",
      items: [
        {
          id: `radar-${year}-w${String(issueNumber).padStart(2, "0")}-item-01`,
          category: "model",
          title: "Mock model release signal",
          source_name: "Official Source",
          source_url: "https://openai.com/news/",
          source_type: "company_announcement",
          published_at: dateOnly(start),
          summary: "A placeholder item used only to validate local draft parsing and preview.",
          why_it_matters: "It verifies that the weekly workflow can produce structured Radar items before live SDK search is configured.",
          background: "This mock item is intentionally generic and should never be published as real editorial content.",
          details: "The generated structure matches the Astro content schema, including deep-analysis fields and watch points.",
          impact: "Maintainers can test preview and publish dry-runs without spending SDK budget or exposing credentials.",
          watch_points: ["Replace mock items with real source-checked weekly signals before publishing."],
          credibility: "low",
          importance: "low",
          review_status: "candidate",
          tags: ["mock", "workflow"],
        },
      ],
    },
    "## Editorial Draft\n\nThis is a mock draft. Generate real candidates with SDK search and complete manual review before publishing.",
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
    "Mark each item `review_status: candidate`; a human editor must verify sources and change selected items to approved before publishing.",
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
    "Image fields are optional. Only include image_url/image_alt/image_source_url when the image is from an official or publicly licensed source.",
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
    throw new Error(`SDK Responses request failed with status ${response.status}: ${raw.slice(0, 240)}`);
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

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const defaultWeek = previousCompleteWeek();
const start = new Date(args["week-start"] ?? dateOnly(defaultWeek.start));
const end = new Date(args["week-end"] ?? dateOnly(defaultWeek.end));
const issueNumber = Number(args["issue-number"] ?? issueNumberForWeek(start));
if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || !Number.isFinite(issueNumber)) {
  throw new Error("Invalid week-start, week-end, or issue-number.");
}

let markdown;
if (args.mock) {
  markdown = buildMockDraft({ start, end, issueNumber });
} else {
  const settings = getSdkSettings();
  if (!settings.apiKey) {
    throw new Error(`RUNNER_SDK_API_KEY is not configured. Set it in ${settings.envPath} or pass --mock for local workflow validation.`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number.isFinite(settings.timeoutMs) ? settings.timeoutMs : 120000);
  try {
    markdown = await postResponses(settings, buildPrompt({ start, end, issueNumber }), controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

if (!markdown.startsWith("---")) {
  throw new Error("Generated content did not start with YAML frontmatter. Draft was not written.");
}

if (args["dry-run"]) {
  console.log(markdown);
} else {
  fs.writeFileSync(draftPath, `${markdown.trim()}\n`);
  console.log(`Draft written: ${draftPath}`);
}
