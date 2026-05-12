#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import {
  checkUrlReachability,
  contentDir,
  dateOnly,
  dumpMarkdown,
  issueNumberForWeek,
  normalizeAutoPublishData,
  parseArgs,
  parseMarkdownFrontmatter,
  previousCompleteWeek,
  scoreRadarSource,
  repoRoot,
  slugForIssue,
  validateAutoPublishReady,
  validateDraftData,
  dateValue,
  timeoutMsFromArgs,
  numberFromArgs,
} from "./radar-weekly-utils.mjs";
import { generateWeeklyDraftMarkdown } from "./radar-weekly-generate.mjs";

const allowedCommitPatterns = [
  /^src\/content\/radar\/[^/]+\.md$/,
  /^src\/data\/radar\/[^/]+\.yaml$/,
  /^scripts\/radar-weekly.*\.mjs$/,
  /^scripts\/radar-weekly\.sh$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^\.gitignore$/,
  /^README\.md$/,
  /^docs\/radar-editorial-workflow\.md$/,
  /^docs\/development-roadmap\.md$/,
  /^docs\/content-model\.md$/,
  /^docs\/user-guide\.md$/,
  /^docs\/developer\.md$/,
  /^docs\/reference\/document-map\.md$/,
];

function usage() {
  console.log(`Usage: scripts/radar-weekly.sh auto-publish [options]

Options:
  --week-start YYYY-MM-DD   Override the Monday start date.
  --week-end YYYY-MM-DD     Override the Sunday end date.
  --issue-number N          Override issue number.
  --mock                    Generate deterministic local mock content.
  --mock-fail MODE          Mock a failing gate: few-items, low-credibility, low-highlight, bad-url, weak-source.
  --dry-run                 Do not write the official issue, commit, or push.
  --no-push                 Commit locally but skip git push.
  --timeout-ms N            Override SDK generation timeout for this run.
  --retries N               Override SDK generation retry count.
  --retry-delay-ms N        Override SDK generation retry delay.
  --help                    Show command help.`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
    env: process.env,
  });
  if (result.error && result.status === null) {
    throw new Error(`${command} failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const output = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
    throw new Error(`${command} ${args.join(" ")} failed${output ? `:\n${output}` : "."}`);
  }
  return result.stdout ?? "";
}

function git(args, options = {}) {
  const output = run("git", args, options);
  return options.trim === false ? output : output.trim();
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function isAllowedCommitPath(filePath) {
  return allowedCommitPatterns.some((pattern) => pattern.test(filePath));
}

function parseGitStatus(raw) {
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.startsWith("## "))
    .map((line) => line.slice(3))
    .flatMap((entry) => (entry.includes(" -> ") ? entry.split(" -> ") : [entry]));
}

function assertCleanCommitScope(context) {
  const paths = parseGitStatus(git(["status", "--porcelain", "--untracked-files=all"], { trim: false }));
  const disallowed = paths.filter((filePath) => !isAllowedCommitPath(filePath));
  if (disallowed.length) {
    throw new Error(`${context} found dirty paths outside the Radar auto-publish allowlist:\n${disallowed.map((filePath) => `- ${filePath}`).join("\n")}`);
  }
  return paths;
}

function assertGitReady({ dryRun }) {
  const branch = git(["branch", "--show-current"]);
  const remotes = git(["remote"]).split(/\r?\n/).filter(Boolean);
  const statusBranch = git(["status", "--porcelain=v1", "-b"]).split(/\r?\n/)[0] ?? "";

  const warnings = [];
  if (branch !== "main") {
    const message = `Radar auto-publish commit/push requires branch main; current branch is ${branch || "(detached)"}.`;
    if (dryRun) warnings.push(message);
    else throw new Error(message);
  }
  if (!remotes.includes("origin")) {
    const message = "Radar auto-publish commit/push requires an origin remote.";
    if (dryRun) warnings.push(message);
    else throw new Error(message);
  }
  if (!dryRun && /\[(?:ahead|behind|gone|diverged)/.test(statusBranch)) {
    throw new Error(`Refusing to auto-publish while branch tracking state is not clean: ${statusBranch}`);
  }

  return { branch, warnings };
}

function assertWeek(start, end) {
  const startDay = start.getDay();
  const endDay = end.getDay();
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (startDay !== 1 || endDay !== 0 || diffDays !== 6) {
    throw new Error("Auto-publish week window must be one complete Monday-through-Sunday week.");
  }
}

function mockSourceResult(item) {
  try {
    const url = new URL(item.source_url);
    return { ok: url.hostname !== "invalid.invalid", status: url.hostname === "invalid.invalid" ? null : 200 };
  } catch {
    return { ok: false, status: null };
  }
}

async function checkSources(items, { mock }) {
  const results = new Map();
  for (const [index, item] of items.entries()) {
    const result = mock ? mockSourceResult(item) : await checkUrlReachability(item.source_url);
    results.set(item.id, result);
    results.set(index, result);
  }
  return results;
}

function summarizeSourceResults(items, sourceResults) {
  return items.map((item, index) => {
    const result = sourceResults.get(item.id) ?? sourceResults.get(index) ?? { ok: false };
    const status = result.status ?? (result.ok ? "ok" : "failed");
    const sourceScore = scoreRadarSource(item, result);
    return `${result.ok ? "ok" : "fail"} ${status} score=${sourceScore.score}/${sourceScore.level} ${item.source_url}`;
  });
}

function publishMarkdown(data, body) {
  const publishedData = {
    ...data,
    editorial_status: "published",
    reviewed_by: "radar-auto-publish",
    reviewed_at: new Date().toISOString().slice(0, 10),
    items: data.items.map((item) => ({
      ...item,
      review_status: "approved",
    })),
  };
  return {
    data: publishedData,
    markdown: dumpMarkdown(publishedData, body),
    target: path.join(contentDir, `${slugForIssue(publishedData)}.md`),
  };
}

function printGateResult({ data, sourceResults, target, commitMessage, dryRun, noPush }) {
  const items = data.items ?? [];
  console.log(`Radar auto-publish gate passed: ${data.title}`);
  console.log(`Week: ${dateOnly(new Date(data.week_start))} -> ${dateOnly(new Date(data.week_end))}`);
  console.log(`Items: ${items.length}`);
  console.log(`High importance: ${items.filter((item) => item.importance === "high").length}`);
  console.log(`Low credibility: ${items.filter((item) => item.credibility === "low").length}`);
  console.log(`Highlights: ${items.filter((item) => item.highlight).map((item) => item.id).join(", ")}`);
  console.log(`Source score: min=${Math.min(...items.map((item, index) => scoreRadarSource(item, sourceResults.get(item.id) ?? sourceResults.get(index)).score))}`);
  console.log(`Target: ${rel(target)}`);
  console.log("\nSource URL check:");
  for (const line of summarizeSourceResults(items, sourceResults)) console.log(`- ${line}`);
  if (dryRun) {
    console.log("\nDry run: would write the official issue with overwrite enabled.");
    console.log("Dry run: would run npm run check and git diff --check before committing.");
    console.log(`Dry run: would commit with message: ${commitMessage}`);
    console.log(`Dry run: would ${noPush ? "skip push because --no-push is set" : "push to origin main"}.`);
  }
}

function commitAndMaybePush({ commitMessage, noPush }) {
  const paths = assertCleanCommitScope("Pre-commit guard");
  if (!paths.length) {
    console.log("No changed files to commit after publishing.");
    return;
  }
  git(["add", "--", ...paths]);
  git(["commit", "-m", commitMessage], { stdio: "inherit" });
  if (noPush) {
    console.log("Committed locally; skipped push because --no-push is set.");
    return;
  }
  git(["push", "origin", "main"], { stdio: "inherit" });
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const dryRun = Boolean(args["dry-run"]);
const mock = Boolean(args.mock);
const noPush = Boolean(args["no-push"]);
const timeoutMs = timeoutMsFromArgs(args, undefined);
const retries = numberFromArgs(args, "retries", undefined, 0);
const retryDelayMs = numberFromArgs(args, "retry-delay-ms", undefined, 0);
const defaultWeek = previousCompleteWeek();
const start = dateValue(args["week-start"] ?? dateOnly(defaultWeek.start));
const end = dateValue(args["week-end"] ?? dateOnly(defaultWeek.end));
const issueNumber = Number(args["issue-number"] ?? issueNumberForWeek(start));

if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || !Number.isFinite(issueNumber)) {
  throw new Error("Invalid week-start, week-end, or issue-number.");
}
assertWeek(start, end);

const gitReady = assertGitReady({ dryRun });
for (const warning of gitReady.warnings) console.warn(`Dry-run warning: ${warning}`);
let baselineDirtyPaths = [];
try {
  baselineDirtyPaths = assertCleanCommitScope("Pre-generation guard");
} catch (error) {
  if (!dryRun) throw error;
  console.warn(`Dry-run warning: ${error.message}`);
}
if (baselineDirtyPaths.length) {
  const message = `Pre-generation guard found existing allowed dirty paths:\n${baselineDirtyPaths.map((filePath) => `- ${filePath}`).join("\n")}`;
  if (dryRun) {
    console.warn(`Dry-run warning: ${message}`);
  } else {
    throw new Error(`${message}\nRefusing to auto-commit because these changes predate this publish run.`);
  }
}

const markdown = await generateWeeklyDraftMarkdown({
  start,
  end,
  issueNumber,
  mock,
  mockFail: args["mock-fail"],
  timeoutMs,
  retries,
  retryDelayMs,
});
const { data, body } = parseMarkdownFrontmatter(markdown);
const draftValidation = validateDraftData(data);
if (draftValidation.errors.length) {
  console.error("Generated draft validation failed:");
  for (const error of draftValidation.errors) console.error(`- ${error}`);
  process.exit(1);
}
if (draftValidation.warnings.length) {
  console.log("Draft warnings:");
  for (const warning of draftValidation.warnings) console.log(`- ${warning}`);
}

const sourceResults = await checkSources(data.items ?? [], { mock });
const normalizedData = normalizeAutoPublishData(data, { sourceResults });
const gate = validateAutoPublishReady(normalizedData, { sourceResults });
if (gate.warnings.length) {
  console.log("Auto-publish warnings:");
  for (const warning of gate.warnings) console.log(`- ${warning}`);
}
if (gate.errors.length) {
  console.error("Auto-publish quality gate failed:");
  for (const error of gate.errors) console.error(`- ${error}`);
  process.exit(1);
}

const { data: publishedData, markdown: publishedMarkdown, target } = publishMarkdown(normalizedData, body);
const commitMessage = `chore: publish weekly radar ${publishedData.week_label}`;
printGateResult({ data: publishedData, sourceResults, target, commitMessage, dryRun, noPush });

if (!dryRun) {
  fs.writeFileSync(target, publishedMarkdown);
  console.log(`Published with overwrite: ${rel(target)}`);
  run("npm", ["run", "check"], { stdio: "inherit" });
  git(["diff", "--check"], { stdio: "inherit" });
  commitAndMaybePush({ commitMessage, noPush });
}
