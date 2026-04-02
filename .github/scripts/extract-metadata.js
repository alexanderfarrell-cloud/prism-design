/**
 * Generate Copilot CLI prompts for agent-based metadata extraction.
 *
 * Accepts a JSON array of slugs (from detect-changes.js output), determines source
 * file paths for each slug by scanning src/pages/, and generates prompts that
 * instruct an agent to extract: prototype name, component hierarchy, interactive
 * elements, with output as structured JSON.
 *
 * Usage:
 *   node .github/scripts/extract-metadata.js '["dashboard-page","payroll-onboarding"]'
 *   echo '["dashboard-page"]' | node .github/scripts/extract-metadata.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DEFAULT_PAGES_DIR = "src/pages";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PROMPT_PATH = path.resolve(
  __dirname,
  "../prompts/extract-metadata.prompt.md"
);

/**
 * Load prompt template from a .prompt.md file, stripping the YAML frontmatter.
 */
export function loadPromptTemplate(promptPath = DEFAULT_PROMPT_PATH) {
  const raw = fs.readFileSync(promptPath, "utf-8");
  return raw.replace(/^---[\s\S]*?---\s*/, "").trim();
}

/**
 * Convert kebab-case slug to PascalCase.
 * @param {string} slug - e.g. "dashboard-page"
 * @returns {string} - e.g. "DashboardPage"
 */
export function kebabToPascal(slug) {
  if (!slug || typeof slug !== "string") return "";
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Resolve a slug to a directory path under the pages directory.
 *
 * Tries the slug as a direct subdirectory first (backward compatible), then
 * splits at each "-" position to find a nested path. For example, slug
 * "payroll-employees" tries: src/pages/payroll-employees/, then
 * src/pages/payroll/employees/.
 *
 * @param {string} slug - e.g. "payroll-employees"
 * @param {string} resolvedPagesDir - absolute path to src/pages
 * @returns {string|null} - absolute directory path, or null
 */
export function resolveSlugToDir(slug, resolvedPagesDir) {
  const directPath = path.join(resolvedPagesDir, slug);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
    return directPath;
  }

  const parts = slug.split("-");
  for (let i = 1; i < parts.length; i++) {
    const parentDir = parts.slice(0, i).join("-");
    const childDir = parts.slice(i).join("-");
    const nestedPath = path.join(resolvedPagesDir, parentDir, childDir);
    if (fs.existsSync(nestedPath) && fs.statSync(nestedPath).isDirectory()) {
      return nestedPath;
    }
  }

  return null;
}

/**
 * Find source file paths for a slug by scanning the pages directory.
 * - Top-level slugs: reverse kebab-to-PascalCase, find matching .tsx file
 * - Directory slugs: find .tsx and .ts files in that subdirectory
 * - Compound slugs (e.g. "payroll-employees"): resolves to nested directories
 *   like payroll/employees/ when a direct match doesn't exist
 *
 * Depth-aware recursion: directories at depth 1 from src/pages/ (e.g. payroll/)
 * only include their own top-level files because subdirectories form separate
 * slugs. Directories at depth 2+ (e.g. payroll/employees/) recurse fully since
 * everything deeper belongs to the same slug.
 *
 * @param {string} slug - e.g. "dashboard-page" or "payroll-employees"
 * @param {string} [pagesDir] - path to src/pages
 * @returns {string[]} - array of file paths relative to project root
 */
export function findSourceFiles(slug, pagesDir = DEFAULT_PAGES_DIR) {
  if (!slug || typeof slug !== "string") return [];
  const resolved = path.resolve(process.cwd(), pagesDir);

  if (!fs.existsSync(resolved)) return [];

  const pascalName = kebabToPascal(slug);
  const topLevelPath = path.join(resolved, `${pascalName}.tsx`);
  const topLevelPathTs = path.join(resolved, `${pascalName}.ts`);

  if (fs.existsSync(topLevelPath)) {
    return [
      path.join(pagesDir, `${pascalName}.tsx`).replace(/\\/g, "/"),
    ];
  }
  if (fs.existsSync(topLevelPathTs)) {
    return [
      path.join(pagesDir, `${pascalName}.ts`).replace(/\\/g, "/"),
    ];
  }

  const dirPath = resolveSlugToDir(slug, resolved);
  if (dirPath) {
    const relToPages = path.relative(resolved, dirPath);
    const depth = relToPages.split(path.sep).filter(Boolean).length;
    const shouldRecurse = depth >= 2;

    const files = [];
    function walk(dir, recurse) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(resolved, fullPath);
        if (entry.isDirectory()) {
          if (recurse) walk(fullPath, true);
        } else if (/\.(tsx?)$/.test(entry.name)) {
          files.push(path.join(pagesDir, relPath).replace(/\\/g, "/"));
        }
      }
    }
    walk(dirPath, shouldRecurse);
    return files.sort();
  }

  return [];
}

/**
 * Build a Copilot CLI prompt instructing the agent to extract metadata from source files.
 *
 * @param {string} slug - prototype slug
 * @param {string[]} sourceFiles - array of source file paths
 * @returns {string} - prompt string for Copilot CLI
 */
export function buildMetadataPrompt(slug, sourceFiles, promptPath = DEFAULT_PROMPT_PATH) {
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace(/\s+Page$/i, "");

  const fileList = sourceFiles
    .map((f) => `  - ${f}`)
    .join("\n");

  const template = loadPromptTemplate(promptPath);
  return template
    .replace(/\{\{NAME\}\}/g, name)
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{SOURCE_FILES\}\}/g, fileList);
}

/**
 * Generate prompts for all slugs.
 *
 * When filesBySlug is provided, only the changed files are used for metadata
 * extraction instead of walking the entire slug directory. This reduces
 * the amount of source code the metadata agent needs to process.
 *
 * @param {string[]} slugs - array of slugs
 * @param {string} [pagesDir] - path to src/pages
 * @param {Object<string, string[]>} [filesBySlug] - optional slug -> changed files mapping
 * @returns {{slug: string, sourceFiles: string[], prompt: string}[]}
 */
export function generatePrompts(slugs, pagesDir = DEFAULT_PAGES_DIR, filesBySlug = null) {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];

  return slugs
    .filter((s) => typeof s === "string" && s.trim())
    .map((slug) => {
      const trimmed = slug.trim();
      let sourceFiles = [];

      if (filesBySlug && Array.isArray(filesBySlug[trimmed])) {
        sourceFiles = filesBySlug[trimmed].filter((filePath) => {
          try {
            return typeof filePath === "string" && filePath && fs.existsSync(filePath);
          } catch {
            return false;
          }
        });
      }

      if (sourceFiles.length === 0) {
        sourceFiles = findSourceFiles(trimmed, pagesDir);
      }

      const prompt = buildMetadataPrompt(trimmed, sourceFiles);
      return {
        slug: trimmed,
        sourceFiles,
        prompt,
      };
    })
    .filter((item) => item.sourceFiles.length > 0);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  let slugsJson = process.argv[2];
  if (!slugsJson && process.env.INPUT_SLUGS) {
    slugsJson = process.env.INPUT_SLUGS.trim();
  }
  if (!slugsJson) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    slugsJson = Buffer.concat(chunks).toString().trim();
  }

  let slugs = [];
  if (slugsJson) {
    try {
      slugs = JSON.parse(slugsJson);
    } catch {
      console.error(`Invalid JSON input: ${slugsJson}`);
      process.exit(1);
    }
  }

  let filesBySlug = null;
  if (process.env.FILES_BY_SLUG) {
    try {
      filesBySlug = JSON.parse(process.env.FILES_BY_SLUG);
    } catch {
      console.warn("WARNING: Could not parse FILES_BY_SLUG, falling back to directory scan");
    }
  }

  const prompts = generatePrompts(slugs, DEFAULT_PAGES_DIR, filesBySlug);
  const output = JSON.stringify(prompts);

  console.log(output);

  if (process.env.GITHUB_OUTPUT) {
    const delimiter = `EOPROMPTS${Date.now()}`;
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `prompts<<${delimiter}\n${output}\n${delimiter}\n`
    );
  }
}
