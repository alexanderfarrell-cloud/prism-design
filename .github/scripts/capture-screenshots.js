/**
 * Generate Copilot CLI prompts for screenshot capture via Playwright MCP.
 *
 * Accepts:
 *   - JSON object mapping slugs to route path arrays (from resolve-routes.js)
 *   - Optional base URL (default: http://localhost:5173)
 *
 * For each slug, outputs a prompt listing all routes and instructing the
 * Copilot agent to use Playwright MCP browser tools (browser_navigate,
 * browser_take_screenshot, etc.) to capture screenshots.
 *
 * Outputs JSON array: [{ slug, routes, prompt }]
 * When GITHUB_OUTPUT exists, writes prompts output for downstream steps.
 *
 * Usage:
 *   node .github/scripts/capture-screenshots.js '{"employees":["/employees","/employees/new"]}'
 *   node .github/scripts/capture-screenshots.js '{"a":["/x"]}' http://localhost:3000
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DEFAULT_BASE_URL = "http://localhost:5173";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PROMPT_PATH = path.resolve(
  __dirname,
  "../prompts/capture-screenshot.prompt.md"
);

/**
 * Load prompt template from a .prompt.md file, stripping the YAML frontmatter.
 */
export function loadPromptTemplate(promptPath = DEFAULT_PROMPT_PATH) {
  const raw = fs.readFileSync(promptPath, "utf-8");
  return raw.replace(/^---[\s\S]*?---\s*/, "").trim();
}

/**
 * Build a formatted route list string for the prompt.
 * Each route becomes a line like: - /employees -> http://localhost:5173/employees
 * Routes with dynamic segments (e.g. :id) are annotated.
 */
export function buildRoutesList(routes, baseUrl) {
  return routes
    .map((route) => {
      const hasParams = /:[\w]+/.test(route);
      const url = new URL(route, baseUrl).href;
      const note = hasParams ? " (has dynamic parameters)" : "";
      return `- ${route} -> ${url}${note}`;
    })
    .join("\n");
}

/**
 * Build the prompt for a single slug by hydrating the template with all its routes.
 */
export function buildPrompt(slug, routes, baseUrl, template) {
  const routesList = buildRoutesList(
    Array.isArray(routes) ? routes : [routes],
    baseUrl
  );
  return template
    .replace(/\{\{ROUTES_LIST\}\}/g, routesList)
    .replace(/\{\{SLUG\}\}/g, slug);
}

/**
 * Generate prompts from a slug->routes mapping.
 * Accepts both array values (new format) and string values (legacy).
 */
export function generatePrompts(
  routes,
  baseUrl = DEFAULT_BASE_URL,
  promptPath = DEFAULT_PROMPT_PATH
) {
  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    return [];
  }

  const template = loadPromptTemplate(promptPath);
  const prompts = [];
  for (const [slug, routeValue] of Object.entries(routes)) {
    if (typeof slug !== "string") continue;

    const routeArray = Array.isArray(routeValue) ? routeValue : [routeValue];
    const validRoutes = routeArray.filter((r) => typeof r === "string");
    if (validRoutes.length === 0) continue;

    prompts.push({
      slug,
      routes: validRoutes,
      prompt: buildPrompt(slug, validRoutes, baseUrl, template),
    });
  }
  return prompts;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  let routesJson = process.argv[2];
  if (!routesJson && process.env.INPUT_ROUTES) {
    routesJson = process.env.INPUT_ROUTES.trim();
  }
  const baseUrl = process.argv[3] || DEFAULT_BASE_URL;

  if (!routesJson) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    routesJson = Buffer.concat(chunks).toString().trim();
  }

  let routes = {};
  if (routesJson) {
    try {
      routes = JSON.parse(routesJson);
    } catch {
      console.error(`Invalid JSON input: ${routesJson}`);
      process.exit(1);
    }
  }

  const prompts = generatePrompts(routes, baseUrl);
  const output = JSON.stringify(prompts);
  console.log(output);

  if (process.env.GITHUB_OUTPUT) {
    const delimiter = `EOFPROMPTS${Date.now()}`;
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `prompts<<${delimiter}\n${output}\n${delimiter}\n`
    );
  }
}
