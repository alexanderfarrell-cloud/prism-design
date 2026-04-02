/**
 * Generate a GitHub Actions workflow summary for the prototype ingestion pipeline.
 *
 * Writes markdown to GITHUB_STEP_SUMMARY for native rendering in the Actions UI.
 *
 * Inputs (CLI args take precedence, then env vars):
 *   argv[2] / SUMMARY_SLUGS     - JSON array of changed slugs
 *   argv[3] / SUMMARY_WORKITEMS - JSON array of work item results [{id, url, slug, action}]
 *   argv[4] / SUMMARY_ERRORS    - JSON array of errors [{slug, error}]
 *
 * Spec ref: Section 7 (Workflow Summary)
 */

import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Parse a work item action string into a human-readable status and version.
 *
 * Actions from create-ado-workitems.js:
 *   "created"     -> { status: "Created", version: "v1" }
 *   "created-v2"  -> { status: "Created", version: "v2" }
 *   "created-v3"  -> { status: "Created", version: "v3" }
 *   "skipped"     -> { status: "Skipped (duplicate)", version: null }
 */
export function parseAction(action) {
  if (!action || typeof action !== "string") {
    return { status: "Unknown", version: null };
  }

  if (action === "skipped") {
    return { status: "Skipped (duplicate)", version: null };
  }

  const versionMatch = action.match(/^created-v(\d+)$/);
  if (versionMatch) {
    return { status: "Created", version: `v${versionMatch[1]}` };
  }

  if (action === "created") {
    return { status: "Created", version: "v1" };
  }

  return { status: action, version: null };
}

/**
 * Build a markdown link for an ADO work item, or a plain text fallback.
 */
export function formatAdoLink(workitem) {
  if (!workitem) return "-";
  const id = workitem.id;
  const url = workitem.url;
  if (url && id) return `[#${id}](${url})`;
  if (id) return `#${id}`;
  return "-";
}

/**
 * Generate the full markdown summary string.
 *
 * @param {string[]} slugs - Array of detected changed slugs
 * @param {Array<{id: number, url: string, slug: string, action: string}>} workitems - Successful results
 * @param {Array<{slug: string, error: string}>} errors - Failed results
 * @returns {string} Markdown summary
 */
export function generateSummary(slugs, workitems, errors) {
  const safeSlugList = Array.isArray(slugs) ? slugs : [];
  const safeWorkitems = Array.isArray(workitems) ? workitems : [];
  const safeErrors = Array.isArray(errors) ? errors : [];

  const totalDetected = safeSlugList.length;
  const totalCreated = safeWorkitems.filter(
    (w) => w.action && w.action !== "skipped"
  ).length;
  const totalSkipped = safeWorkitems.filter(
    (w) => w.action === "skipped"
  ).length;
  const totalErrors = safeErrors.length;

  const lines = [];

  lines.push("## Prototype Ingestion Summary");
  lines.push("");
  lines.push(`**Prototypes detected:** ${totalDetected}`);
  lines.push(`**Created:** ${totalCreated} | **Skipped:** ${totalSkipped} | **Errors:** ${totalErrors}`);
  lines.push("");

  if (totalDetected === 0 && safeWorkitems.length === 0 && safeErrors.length === 0) {
    lines.push("No prototype changes detected in this push.");
    return lines.join("\n");
  }

  const workitemsBySlug = new Map();
  for (const w of safeWorkitems) {
    workitemsBySlug.set(w.slug, w);
  }
  const errorsBySlug = new Map();
  for (const e of safeErrors) {
    errorsBySlug.set(e.slug, e);
  }

  const allSlugs = new Set([
    ...safeSlugList,
    ...safeWorkitems.map((w) => w.slug),
    ...safeErrors.map((e) => e.slug),
  ]);

  lines.push("| Prototype | Status | Version | ADO Link |");
  lines.push("|-----------|--------|---------|----------|");

  for (const slug of allSlugs) {
    const workitem = workitemsBySlug.get(slug);
    const error = errorsBySlug.get(slug);

    if (workitem) {
      const { status, version } = parseAction(workitem.action);
      const link = formatAdoLink(workitem);
      lines.push(`| ${slug} | ${status} | ${version || "-"} | ${link} |`);
    } else if (error) {
      lines.push(`| ${slug} | Error | - | - |`);
    } else {
      lines.push(`| ${slug} | Not processed | - | - |`);
    }
  }

  if (safeErrors.length > 0) {
    lines.push("");
    lines.push("### Errors");
    lines.push("");
    for (const e of safeErrors) {
      lines.push(`- **${e.slug}**: ${e.error}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const slugsArg = process.argv[2] || process.env.SUMMARY_SLUGS || "[]";
  const workitemsArg = process.argv[3] || process.env.SUMMARY_WORKITEMS || "[]";
  const errorsArg = process.argv[4] || process.env.SUMMARY_ERRORS || "[]";

  let slugs, workitems, errors;
  try {
    slugs = JSON.parse(slugsArg);
    workitems = JSON.parse(workitemsArg);
    errors = JSON.parse(errorsArg);
  } catch (err) {
    console.error(`Failed to parse summary inputs: ${err.message}`);
    process.exit(1);
  }

  const markdown = generateSummary(slugs, workitems, errors);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
    console.log("Workflow summary written to GITHUB_STEP_SUMMARY");
  } else {
    console.log(markdown);
  }
}
