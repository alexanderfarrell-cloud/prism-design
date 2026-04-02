/**
 * Resolve prototype slugs to their application route paths.
 *
 * Given a JSON array of slugs (from detect-changes.js), parses src/App.tsx
 * to build a slug -> route path mapping by:
 *   1. Parsing import statements to map slugs to component names
 *   2. Parsing <Route> elements to map component names to route paths
 *   3. Combining the two maps
 *
 * Edge cases:
 *   - Wildcard routes (path="*") are excluded
 *   - Each slug maps to ALL routes for its components (returned as arrays)
 *   - Unrouted slugs log a warning and are omitted from output
 *
 * When the FILES_BY_SLUG env var is set (JSON object mapping slug -> file paths),
 * routes are filtered to only those whose source file actually changed. Falls
 * back to all routes when any changed file has no matching routed component.
 *
 * Usage:
 *   node .github/scripts/resolve-routes.js '["dashboard-page","payroll-onboarding"]'
 *   echo '["dashboard-page"]' | node .github/scripts/resolve-routes.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pascalToKebab } from "./detect-changes.js";

const DEFAULT_APP_PATH = path.join(process.cwd(), "src", "App.tsx");

/**
 * Build a map from prototype slug to component names by parsing App.tsx imports.
 *
 * Top-level:  import DashboardPage from "./pages/DashboardPage"
 *             -> slug "dashboard-page" => ["DashboardPage"]
 *
 * Nested:     import PayrollHomePage from "./pages/payroll/PayrollHomePage"
 *             -> slug "payroll" => ["PayrollHomePage"]
 *
 *             import PayrollEmployeesPage from "./pages/payroll/employees/PayrollEmployeesPage"
 *             -> slug "payroll-employees" => ["PayrollEmployeesPage"]
 *
 * Uses up to the first 2 directory segments (excluding the component filename),
 * joined with "-", to form the slug.
 */
export function buildSlugToComponentMap(appContent) {
  const map = new Map();
  const regex = /import\s+(\w+)\s+from\s+["']\.\/pages\/([^"']+)["']/g;
  let match;

  while ((match = regex.exec(appContent)) !== null) {
    const componentName = match[1];
    const importPath = match[2].replace(/\.tsx?$/, "");
    const segments = importPath.split("/");

    let slug;
    if (segments.length === 1) {
      slug = pascalToKebab(segments[0]);
    } else {
      const dirSegments = segments.slice(0, -1);
      slug = dirSegments.slice(0, 2).join("-");
    }

    if (!map.has(slug)) {
      map.set(slug, [componentName]);
    } else {
      map.get(slug).push(componentName);
    }
  }

  return map;
}

/**
 * Build a map from component name to route path by parsing <Route> elements.
 *
 * Excludes wildcard routes (path="*").
 * For components with both an index route and a named route, prefers the named route.
 */
export function buildComponentToRouteMap(appContent) {
  const map = new Map();
  const indexComponents = [];

  const tagRegex = /<Route\s((?:[^{}]|\{[^}]*\})*?)\/?>/g;
  let tag;

  while ((tag = tagRegex.exec(appContent)) !== null) {
    const attrs = tag[1];
    const pathMatch = attrs.match(/path=["']([^"']+)["']/);
    const elementMatch = attrs.match(/element=\{<(\w+)[\s/]/);
    const isIndex = /\bindex\b/.test(attrs);

    if (!elementMatch) continue;
    const componentName = elementMatch[1];

    if (pathMatch) {
      const routePath = pathMatch[1];
      if (routePath === "*") continue;
      if (!map.has(componentName)) {
        map.set(componentName, "/" + routePath.replace(/^\//, ""));
      }
    } else if (isIndex) {
      indexComponents.push(componentName);
    }
  }

  for (const componentName of indexComponents) {
    if (!map.has(componentName)) {
      map.set(componentName, "/");
    }
  }

  return map;
}

/**
 * Build a map from component name to its normalized source file path
 * (without extension) by parsing App.tsx import statements.
 *
 * Example: import PersonalInfoPage from "./pages/payroll/employees/sections/PersonalInfoPage"
 *          -> "PersonalInfoPage" => "src/pages/payroll/employees/sections/PersonalInfoPage"
 */
export function buildComponentToSourceMap(appContent) {
  const map = new Map();
  const regex = /import\s+(\w+)\s+from\s+["']\.\/pages\/([^"']+)["']/g;
  let match;

  while ((match = regex.exec(appContent)) !== null) {
    const componentName = match[1];
    const importPath = match[2].replace(/\.tsx?$/, "");
    map.set(componentName, `src/pages/${importPath}`);
  }

  return map;
}

/**
 * Find a parent listing route for a route with dynamic parameters.
 * Strips everything from the first dynamic segment onward and checks
 * if that parent path exists in the available routes.
 *
 * Example: "/payroll/employees/:employeeId/personal-info"
 *          -> checks for "/payroll/employees" in availableRoutes
 *
 * @returns {string|null} parent route path, or null if not found
 */
export function findParentListingRoute(route, availableRoutes) {
  const segments = route.split("/").filter(Boolean);
  const staticPrefix = [];
  let sawDynamic = false;
  for (const seg of segments) {
    if (seg.startsWith(":")) {
      sawDynamic = true;
      break;
    }
    staticPrefix.push(seg);
  }
  if (!sawDynamic || staticPrefix.length === 0) return null;
  const parentPath = "/" + staticPrefix.join("/");
  return availableRoutes.includes(parentPath) ? parentPath : null;
}

/**
 * Resolve an array of slugs to a slug -> routes mapping object.
 * Each slug maps to an array of route paths.
 * Unrouted slugs are collected in a warnings array.
 *
 * When filesBySlug is provided, routes are filtered to only those whose
 * source component file actually changed. Fallback to all routes when:
 *   - Any changed file has no matching routed component (e.g. internal components)
 *   - No changed files produce any routes
 * When a filtered route has dynamic parameters, its parent listing route
 * is automatically included so the screenshot agent can discover valid IDs.
 */
export function resolveRoutes(slugs, appContent, filesBySlug = null) {
  const slugToComponents = buildSlugToComponentMap(appContent);
  const componentToRoute = buildComponentToRouteMap(appContent);
  const componentToSource = filesBySlug
    ? buildComponentToSourceMap(appContent)
    : null;

  const resolved = {};
  const warnings = [];

  for (const slug of slugs) {
    const components = slugToComponents.get(slug);
    if (!components) {
      warnings.push(`No import found for slug "${slug}"`);
      continue;
    }

    const allRoutes = [];
    for (const component of components) {
      const route = componentToRoute.get(component);
      if (route) allRoutes.push(route);
    }

    if (allRoutes.length === 0) {
      const names = components.join(", ");
      warnings.push(
        `Components "${names}" (slug "${slug}") have no routes in App.tsx`
      );
      continue;
    }

    const changedFiles = filesBySlug?.[slug];
    if (!changedFiles || !componentToSource) {
      resolved[slug] = allRoutes;
      continue;
    }

    const matchedRoutes = [];
    let hasUnmatchedFile = false;

    for (const file of changedFiles) {
      const normalized = file.replace(/\.tsx?$/, "");
      let matched = false;

      for (const comp of components) {
        const source = componentToSource.get(comp);
        if (source && normalized === source) {
          const route = componentToRoute.get(comp);
          if (route && !matchedRoutes.includes(route)) {
            matchedRoutes.push(route);
          }
          matched = true;
          break;
        }
      }

      if (!matched) hasUnmatchedFile = true;
    }

    if (hasUnmatchedFile || matchedRoutes.length === 0) {
      resolved[slug] = allRoutes;
      continue;
    }

    for (const route of [...matchedRoutes]) {
      if (/:[\w]+/.test(route)) {
        const parent = findParentListingRoute(route, allRoutes);
        if (parent && !matchedRoutes.includes(parent)) {
          matchedRoutes.push(parent);
        }
      }
    }

    resolved[slug] = matchedRoutes;
  }

  return { resolved, warnings };
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

  if (!slugsJson) {
    console.error("Usage: set INPUT_SLUGS env var, pipe JSON to stdin, or pass as CLI arg");
    process.exit(1);
  }

  let slugs;
  try {
    slugs = JSON.parse(slugsJson);
  } catch {
    console.error(`Invalid JSON input: ${slugsJson}`);
    process.exit(1);
  }
  const appPath = process.argv[3] || DEFAULT_APP_PATH;
  const appContent = fs.readFileSync(appPath, "utf-8");

  let filesBySlug = null;
  if (process.env.FILES_BY_SLUG) {
    try {
      filesBySlug = JSON.parse(process.env.FILES_BY_SLUG);
    } catch {
      console.warn("WARNING: Could not parse FILES_BY_SLUG, falling back to all routes");
    }
  }

  const { resolved, warnings } = resolveRoutes(slugs, appContent, filesBySlug);

  for (const w of warnings) {
    console.warn(`WARNING: ${w}`);
  }

  const output = JSON.stringify(resolved);
  console.log(output);

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `routes=${output}\n`);
  }
}
