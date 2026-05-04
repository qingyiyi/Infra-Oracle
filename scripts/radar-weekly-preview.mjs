#!/usr/bin/env node
import {
  checkUrlReachability,
  dateLabel,
  parseArgs,
  readDraft,
  validateDraftData,
} from "./radar-weekly-utils.mjs";

function usage() {
  console.log("Usage: scripts/radar-weekly.sh preview [--check-links]");
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

const { data } = readDraft();
const { errors, warnings } = validateDraftData(data);
const items = Array.isArray(data.items) ? data.items : [];
const categories = new Map();
for (const item of items) {
  categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
}

console.log(`Radar draft: ${data.title ?? "Untitled"}`);
console.log(`Status: ${data.editorial_status ?? "unknown"}`);
console.log(`Week: ${dateLabel(data.week_start)} -> ${dateLabel(data.week_end)}`);
console.log(`Items: ${items.length}`);
console.log(`Categories: ${Array.from(categories.entries()).map(([key, value]) => `${key}=${value}`).join(", ") || "none"}`);
console.log(`High importance: ${items.filter((item) => item.importance === "high").length}`);
console.log(`With images: ${items.filter((item) => item.image_url).length}`);
console.log(`Highlights: ${items.filter((item) => item.highlight).length}`);

if (args["check-links"]) {
  console.log("\nLink check:");
  for (const item of items) {
    const result = await checkUrlReachability(item.source_url);
    const status = result.status ?? "failed";
    const suffix = result.ok ? "" : result.error ? ` (${result.error})` : "";
    console.log(`- ${result.ok ? "ok" : "fail"} ${status} ${item.source_url}${suffix}`);
    if (!result.ok) warnings.push(`Source URL may be unreachable: ${item.title}`);
    if (item.image_url) {
      const imageResult = await checkUrlReachability(item.image_url);
      const imageStatus = imageResult.status ?? "failed";
      console.log(`- image ${imageResult.ok ? "ok" : "fail"} ${imageStatus} ${item.image_url}`);
      if (!imageResult.ok) warnings.push(`Image URL may be unreachable: ${item.title}`);
    }
  }
}

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}
if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("\nPreview passed. Manual source review is still required before publishing.");
