/**
 * Route Validation Lint Script for React + Vite
 *
 * Validates that all page files in src/pages/ have corresponding routes
 * (imports) in src/App.tsx. Reports unmatched pages that exist on disk
 * but are not imported.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const APP_PATH = path.join(process.cwd(), "src", "App.tsx");
const PAGES_DIR = path.join(process.cwd(), "src", "pages");

/**
 * Extract page imports from App.tsx.
 * Returns a Set of page identifiers (e.g. "DashboardPage", "payroll-onboarding")
 * used for matching against disk pages.
 */
export function extractPageImports(appContent) {
  const imported = new Set();

  const importRegex = /from\s+["']\.\/pages\/([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(appContent)) !== null) {
    const importPath = match[1];
    const segments = importPath.split("/");
    if (segments.length === 1) {
      const name = segments[0].replace(/\.tsx?$/, "");
      imported.add(name);
    } else {
      imported.add(segments[0]);
    }
  }

  return imported;
}

/**
 * Extract component names from page import statements.
 * Returns a Set of component names (e.g. "DashboardPage", "PayrollOnboardingPage")
 * used for matching against routed components.
 */
export function extractImportedComponentNames(appContent) {
  const names = new Set();
  const regex = /import\s+(\w+)\s+from\s+["']\.\/pages\/[^"']+["']/g;
  let match;
  while ((match = regex.exec(appContent)) !== null) {
    names.add(match[1]);
  }
  return names;
}

/**
 * Extract Route elements and their path props from App.tsx.
 */
export function extractRoutes(appContent) {
  const routes = [];
  const routeRegex = /<Route\s+path=["']([^"']*)["']/g;
  let match;
  while ((match = routeRegex.exec(appContent)) !== null) {
    routes.push({ path: match[1] || "index" });
  }
  const indexRegex = /<Route\s+index\b/g;
  while (indexRegex.exec(appContent) !== null) {
    routes.push({ path: "(index)" });
  }
  return routes;
}

/**
 * Extract component names used in Route element props.
 * Returns a Set of component names (e.g. "DashboardPage", "NotFoundPage").
 */
export function extractRoutedComponents(appContent) {
  const components = new Set();
  const regex = /<Route\s[^>]*element=\{<(\w+)/g;
  let match;
  while ((match = regex.exec(appContent)) !== null) {
    components.add(match[1]);
  }
  return components;
}

/**
 * Get top-level page identifiers from src/pages/.
 * - Top-level .tsx files -> filename without extension
 * - Top-level directories -> directory name
 */
export function getDiskPages(pagesDir = PAGES_DIR) {
  const pages = [];

  if (!fs.existsSync(pagesDir)) {
    return pages;
  }

  const entries = fs.readdirSync(pagesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      pages.push({
        type: "file",
        name: entry.name.replace(/\.tsx$/, ""),
        path: path.join(pagesDir, entry.name),
      });
    } else if (entry.isDirectory()) {
      pages.push({
        type: "directory",
        name: entry.name,
        path: path.join(pagesDir, entry.name),
      });
    }
  }

  return pages;
}

async function main() {
  console.log(
    "🛣️  Validating that all pages in src/pages/ have routes in App.tsx...\n"
  );

  try {
    // Read App.tsx
    if (!fs.existsSync(APP_PATH)) {
      console.error("❌ App.tsx not found at src/App.tsx");
      process.exit(1);
    }

    const appContent = fs.readFileSync(APP_PATH, "utf8");

    const importedPages = extractPageImports(appContent);
    const importedComponents = extractImportedComponentNames(appContent);
    const routes = extractRoutes(appContent);
    const routedComponents = extractRoutedComponents(appContent);
    const diskPages = getDiskPages();

    const notImported = diskPages.filter((page) => !importedPages.has(page.name));

    const importedButNotRouted = [...importedComponents].filter(
      (name) => !routedComponents.has(name)
    );

    console.log("📋 Found in App.tsx:");
    console.log(`   Imports from ./pages/: ${[...importedPages].sort().join(", ")}`);
    console.log(`   Route paths: ${routes.map((r) => r.path).join(", ")}`);
    console.log(`   Routed components: ${[...routedComponents].sort().join(", ")}`);
    console.log("");

    console.log("📁 Pages on disk (top-level):");
    console.log(`   ${diskPages.map((p) => `${p.name} (${p.type})`).join(", ")}`);
    console.log("");

    const hasErrors = notImported.length > 0 || importedButNotRouted.length > 0;

    if (!hasErrors) {
      console.log("✅ All pages are imported and routed in App.tsx!");
      process.exit(0);
    }

    if (notImported.length > 0) {
      console.log(`❌ Found ${notImported.length} page(s) not imported in App.tsx:\n`);
      for (const page of notImported) {
        const relativePath = path.relative(process.cwd(), page.path);
        console.log(`   📄 ${relativePath}`);
        const importPath =
          page.type === "directory"
            ? `"./pages/${page.name}/YourPage"`
            : `"./pages/${page.name}"`;
        const componentName = page.type === "file" ? page.name : "XxxPage";
        console.log(`      → Add: import ${componentName} from ${importPath};`);
      }
      console.log("");
    }

    if (importedButNotRouted.length > 0) {
      console.log(`❌ Found ${importedButNotRouted.length} imported page(s) not used in any <Route>:\n`);
      for (const name of importedButNotRouted) {
        console.log(`   📄 ${name}`);
        console.log(`      → Add a <Route> element using ${name} in App.tsx`);
      }
      console.log("");
    }

    console.log("💡 Every page in src/pages/ must be imported AND used in a <Route> in App.tsx.");

    process.exit(1);
  } catch (error) {
    console.error("💥 Error running route validation:", error.message);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
