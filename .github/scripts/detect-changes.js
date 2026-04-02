/**
 * Detect which prototype pages changed in the most recent commit.
 *
 * Runs `git diff --name-only` against src/pages/ and maps each changed
 * .tsx/.ts file to a prototype slug:
 *   - Top-level files:  PascalCase filename -> kebab-case slug
 *       DashboardPage.tsx -> dashboard-page
 *   - Nested (folder-based) pages:  up to first 2 directory segments, joined with "-"
 *       payroll/PayrollHomePage.tsx              -> payroll
 *       payroll/employees/PayrollEmployeesPage.tsx -> payroll-employees
 *       payroll/employees/sections/TimecardPage.tsx -> payroll-employees
 *       payroll/onboarding/steps/TaxSetupStep.tsx   -> payroll-onboarding
 *
 * Outputs a deduplicated JSON array of slugs and a filesBySlug mapping that
 * tracks which specific files changed for each slug. Slugs matching patterns
 * in .github/config/prototype-ingestion.json "exclude" array are filtered out.
 *
 * Usage:
 *   node .github/scripts/detect-changes.js                  # HEAD~1..HEAD (default)
 *   node .github/scripts/detect-changes.js <base> <head>    # custom range
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export const PAGES_DIR = "src/pages/";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_PATH = resolve(__dirname, "../config/prototype-ingestion.json");

export function pascalToKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function getChangedFiles(base, head) {
  const cmd = `git diff --diff-filter=ACMR --name-only ${base} ${head} -- ${PAGES_DIR}`;
  try {
    const output = execSync(cmd, { encoding: "utf-8" }).trim();
    if (!output) return [];
    return output.split("\n");
  } catch {
    return [];
  }
}

export function fileToSlug(filePath) {
  const relative = filePath.replace(PAGES_DIR, "");
  if (!/\.tsx?$/.test(relative)) return null;

  const parts = relative.split("/");

  if (parts.length === 1) {
    const baseName = parts[0].replace(/\.tsx?$/, "");
    return pascalToKebab(baseName);
  }

  const dirParts = parts.slice(0, -1);
  return dirParts.slice(0, 2).join("-");
}

export function loadExcludePatterns(configPath = CONFIG_PATH) {
  try {
    const raw = readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw);
    return Array.isArray(config.exclude)
      ? config.exclude.filter((p) => typeof p === "string" && p.length > 0)
      : [];
  } catch {
    return [];
  }
}

export function slugMatchesPattern(slug, pattern) {
  if (!pattern.includes("*")) return slug === pattern;
  const escaped = pattern
    .split("*")
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp("^" + escaped + "$").test(slug);
}

export function filterExcluded(slugs, patterns) {
  if (!patterns.length) return [...slugs];
  return slugs.filter(
    (slug) => !patterns.some((p) => slugMatchesPattern(slug, p))
  );
}

/**
 * Build a mapping from slug to the specific files that changed for that slug.
 * @param {string[]} files - changed file paths
 * @returns {Object<string, string[]>} - slug -> sorted array of changed file paths
 */
export function buildFilesBySlug(files) {
  const map = {};
  for (const file of files) {
    const slug = fileToSlug(file);
    if (!slug) continue;
    if (!map[slug]) map[slug] = [];
    map[slug].push(file);
  }
  for (const slug of Object.keys(map)) {
    map[slug].sort();
  }
  return map;
}

export function detectChanges(base = "HEAD~1", head = "HEAD") {
  const changedFiles = getChangedFiles(base, head);
  const allFilesBySlug = buildFilesBySlug(changedFiles);

  const allSlugs = Object.keys(allFilesBySlug).sort();
  const excludePatterns = loadExcludePatterns();
  const filtered = filterExcluded(allSlugs, excludePatterns);

  const excluded = allSlugs.filter((s) => !filtered.includes(s));
  if (excluded.length) {
    console.warn(
      `Excluded ${excluded.length} slug(s) via prototype-ingestion.json: ${excluded.join(", ")}`
    );
  }

  const filesBySlug = {};
  for (const slug of filtered) {
    filesBySlug[slug] = allFilesBySlug[slug];
  }

  return { slugs: filtered, filesBySlug };
}

const isMain = process.argv[1] === __filename;

if (isMain) {
  const [customBase, customHead] = process.argv.slice(2);
  const base = customBase || "HEAD~1";
  const head = customHead || "HEAD";

  const { slugs, filesBySlug } = detectChanges(base, head);
  const slugsOutput = JSON.stringify(slugs);
  const filesBySlugOutput = JSON.stringify(filesBySlug);

  console.log(slugsOutput);

  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import("fs");
    appendFileSync(process.env.GITHUB_OUTPUT, `slugs=${slugsOutput}\n`);
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `has_changes=${slugs.length > 0}\n`
    );
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `files_by_slug=${filesBySlugOutput}\n`
    );
  }
}
