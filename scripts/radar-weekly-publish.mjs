#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  contentDir,
  dumpMarkdown,
  isPlaceholderDraft,
  parseArgs,
  readDraft,
  slugForIssue,
  validateDraftData,
  validatePublishReady,
} from "./radar-weekly-utils.mjs";

function usage() {
  console.log("Usage: scripts/radar-weekly.sh publish [--dry-run] [--overwrite]");
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const { data, body } = readDraft();
const { errors, warnings } = validateDraftData(data);
if (errors.length) {
  console.error("Draft validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
if (warnings.length) {
  console.log("Warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
const publishReady = validatePublishReady(data);
if (publishReady.warnings.length) {
  console.log("Publish warnings:");
  for (const warning of publishReady.warnings) console.log(`- ${warning}`);
}
if (publishReady.errors.length) {
  console.error("Draft is not publish-ready:");
  for (const error of publishReady.errors) console.error(`- ${error}`);
  process.exit(1);
}

const publishedData = {
  ...data,
  editorial_status: "published",
  reviewed_by: data.reviewed_by ?? data.editor_name ?? "qingyiyi",
  reviewed_at: data.reviewed_at ?? new Date().toISOString().slice(0, 10),
};
const slug = slugForIssue(publishedData);
if (isPlaceholderDraft(data)) {
  throw new Error("Refusing to publish the placeholder draft. Run generate for a real weekly issue first.");
}
const target = path.join(contentDir, `${slug}.md`);
if (fs.existsSync(target) && !args.overwrite) {
  throw new Error(`Target already exists: ${target}. Re-run with --overwrite if this is intentional.`);
}

const markdown = dumpMarkdown(publishedData, body);
if (args["dry-run"]) {
  console.log(`Would publish: ${target}`);
  console.log(markdown.slice(0, 1200));
} else {
  fs.writeFileSync(target, markdown);
  console.log(`Published: ${target}`);
}
