#!/usr/bin/env bash
if [ -z "${BASH_VERSION:-}" ]; then
  exec bash "$0" "$@"
fi

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage: scripts/radar-weekly.sh <generate|preview|publish|full|auto-publish> [options]

Commands:
  generate   Use the SDK web search path to overwrite the fixed Radar draft.
  preview    Validate the fixed Radar draft and print an editorial summary.
  publish    Publish the fixed draft to a stable weekly issue file.
  full       Run generate and preview. It never publishes automatically.
  auto-publish
             Generate, quality-gate, overwrite the weekly issue, validate, commit, and push.

Common options:
  --week-start YYYY-MM-DD   Override the Monday start date.
  --week-end YYYY-MM-DD     Override the Sunday end date.
  --issue-number N          Override issue number, for example 18.
  --dry-run                 Do not write files when supported.
  --mock                    Generate a local mock draft without SDK calls.
  --mock-fail MODE          Auto-publish/generate mock failure mode for local gate validation.
  --timeout-ms N            Auto-publish/generate SDK timeout override.
  --check-links             Preview only: probe source and image URLs.
  --overwrite               Allow publish to overwrite an existing issue file.
  --no-push                 Auto-publish only: commit locally but skip git push.
  --help                    Show command help.
EOF
}

command="${1:-}"
case "${command}" in
  generate)
    shift
    node "${REPO_DIR}/scripts/radar-weekly-generate.mjs" "$@"
    ;;
  preview)
    shift
    node "${REPO_DIR}/scripts/radar-weekly-preview.mjs" "$@"
    ;;
  publish)
    shift
    node "${REPO_DIR}/scripts/radar-weekly-publish.mjs" "$@"
    ;;
  full)
    shift
    node "${REPO_DIR}/scripts/radar-weekly-generate.mjs" "$@"
    node "${REPO_DIR}/scripts/radar-weekly-preview.mjs"
    ;;
  auto-publish)
    shift
    node "${REPO_DIR}/scripts/radar-weekly-auto-publish.mjs" "$@"
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
