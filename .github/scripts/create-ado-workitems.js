/**
 * Create Azure DevOps work items from prototype metadata and screenshots.
 *
 * Accepts a JSON object with prototype entries. For each entry:
 * - Checks for existing work item with same slug + commit SHA (idempotency)
 * - Detects previous versions and increments version number
 * - Creates a User Story (or ADO_WORK_ITEM_TYPE) work item
 * - Links new version to previous version via ADO Related relation
 * - Sets title, description, tags, area path
 * - Attaches screenshot images
 *
 * Configured via env vars:
 *   AZDO_PAT            - Personal access token (required for API calls)
 *   ADO_ORG_URL         - e.g. https://dev.azure.com/myorg
 *   ADO_PROJECT         - Project name or ID
 *   ADO_AREA_PATH       - Area path for work items
 *   ADO_ITERATION_PATH  - Iteration path for work items
 *   (Board lane and column are managed by ADO board config, not set via API)
 *   ADO_WORK_ITEM_TYPE  - Default: "User Story"
 *   COMMIT_SHA          - Git commit SHA for idempotency checks
 *   REPO_URL            - GitHub repository URL (e.g. https://github.com/org/repo)
 *
 * Usage (in order of precedence):
 *   WORK_ITEM_INPUT='<json>' node .github/scripts/create-ado-workitems.js   (recommended)
 *   echo '<json-input>' | node .github/scripts/create-ado-workitems.js
 *   node .github/scripts/create-ado-workitems.js '<json-input>'              (fragile with embedded quotes)
 *
 * Writes workitems (JSON array of {id, url, action}) to GITHUB_OUTPUT when set.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const API_VERSION = "7.0";
const SLUG_TAG_PREFIX = "slug:";
const INGESTED_TAG = "proto-ingested";
const MAX_TITLE_LENGTH = 255;

/**
 * Returns the Authorization header value for ADO API (Basic auth with :PAT).
 */
export function buildAuthHeader(pat) {
  if (!pat || typeof pat !== "string") return null;
  const encoded = Buffer.from(`:${pat.trim()}`, "utf-8").toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Escape a value for safe embedding in a WIQL string literal.
 * WIQL uses single-quoted strings; single quotes inside must be doubled.
 */
export function escapeWiql(value) {
  return String(value).replace(/'/g, "''");
}

/**
 * Builds a WIQL query string to find work items by slug tag and optional commit SHA.
 * Layer 1 (idempotency): includes commit SHA in description search.
 * Layer 2 (versioning): omits commit SHA, finds all versions of a slug.
 */
export function buildWiqlQuery(project, slug, commitSha = null) {
  const slugTag = `${SLUG_TAG_PREFIX}${escapeWiql(slug)}`;
  const safeProject = escapeWiql(project);
  let wiql =
    `SELECT [System.Id], [System.Title], [System.Description] ` +
    `FROM WorkItems ` +
    `WHERE [System.TeamProject] = '${safeProject}' ` +
    `AND [System.Tags] CONTAINS '${INGESTED_TAG}' ` +
    `AND [System.Tags] CONTAINS '${slugTag}'`;

  if (commitSha) {
    wiql += ` AND [System.Description] CONTAINS '${escapeWiql(commitSha)}'`;
  }

  wiql += ` ORDER BY [System.Id] DESC`;
  return wiql;
}

/**
 * Executes a WIQL query against the ADO API. Returns the array of work item stubs
 * (each has { id, url }).
 */
export async function runWiqlQuery(orgUrl, project, wiql, authHeader) {
  const base = orgUrl.replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=${API_VERSION}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({ query: wiql }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WIQL query failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.workItems || [];
}

/**
 * Checks if a work item already exists for this slug + commit SHA (idempotency).
 * Returns the existing work item stub ({ id, url }) or null.
 */
export async function checkIdempotency(orgUrl, project, slug, commitSha, authHeader) {
  if (!commitSha) return null;

  const wiql = buildWiqlQuery(project, slug, commitSha);
  const items = await runWiqlQuery(orgUrl, project, wiql, authHeader);
  return items.length > 0 ? items[0] : null;
}

/**
 * Finds existing work items for a slug to determine the next version number.
 * Returns { nextVersion, previousId } where:
 *   - nextVersion is 1 if no prior items, otherwise count of existing items + 1
 *   - previousId is the ID of the most recent prior version (for linking), or null
 */
export async function detectVersion(orgUrl, project, slug, authHeader) {
  const wiql = buildWiqlQuery(project, slug);
  const items = await runWiqlQuery(orgUrl, project, wiql, authHeader);

  if (items.length === 0) {
    return { nextVersion: 1, previousId: null };
  }

  return { nextVersion: items.length + 1, previousId: items[0].id };
}

/**
 * Adds an ADO Related link between two work items.
 */
export async function addRelatedLink(orgUrl, project, sourceId, targetId, authHeader) {
  const base = orgUrl.replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${sourceId}?api-version=${API_VERSION}`;

  const targetUrl = `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${targetId}`;

  const payload = [
    {
      op: "add",
      path: "/relations/-",
      value: {
        rel: "System.LinkTypes.Related",
        url: targetUrl,
        attributes: { comment: "Previous prototype version" },
      },
    },
  ];

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ADO link add ${res.status}: ${text}`);
  }
}

/**
 * Render a component tree as nested HTML <ul> lists.
 * Each component shows its name and non-empty props. Children are nested recursively.
 */
export function renderComponentTree(components) {
  if (!Array.isArray(components) || components.length === 0) return "";

  const items = [];
  for (const comp of components) {
    if (typeof comp === "string") {
      items.push(`<li>${escapeHtml(comp)}</li>`);
      continue;
    }
    const name = comp?.name ?? String(comp);
    const props = comp?.props || {};
    const propEntries = Object.entries(props).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    );
    const propStr = propEntries
      .map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(JSON.stringify(v))}`)
      .join(", ");
    const label = propStr ? `${escapeHtml(name)} (${propStr})` : escapeHtml(name);
    const childHtml = renderComponentTree(comp?.children);
    items.push(`<li>${label}${childHtml}</li>`);
  }
  return `<ul>${items.join("")}</ul>`;
}

/**
 * Format a single interactive element as an HTML string.
 */
export function formatInteractiveElement(el) {
  if (typeof el === "string") return escapeHtml(el);
  const type = el?.type ?? "";
  const label = el?.label ?? el?.selector ?? "";
  const position = el?.position ?? "";
  const parts = [];
  if (type) parts.push(escapeHtml(type));
  if (label) parts.push(escapeHtml(label));
  if (position) parts.push(`(${escapeHtml(position)})`);
  return parts.join(" - ") || "(unknown element)";
}

/**
 * Returns HTML description from prototype metadata matching the tech spec Section 6 structure.
 *
 * Sections (in order):
 *   1. Header: prototype name
 *   2. Source: link to GitHub source at commit
 *   3. Commit SHA (with data-commit-sha for WIQL idempotency)
 *   4. Route: application route derived from App.tsx
 *   5. Component hierarchy: recursive nested <ul> with props
 *   6. Interactive elements: type, label, position
 *   7. Screenshots: attachment URLs for downstream agent access
 *   8. Previous versions: link to prior ADO story
 *
 * @param {object} prototype - { name, slug, metadata: { components, interactiveElements }, screenshots }
 * @param {object} [options]
 * @param {string} [options.commitSha] - Git commit SHA for idempotency
 * @param {string} [options.route] - App route (e.g. "/payroll/setup")
 * @param {string} [options.sourceUrl] - GitHub URL to source at commit
 * @param {{id: number, url: string}|null} [options.previousVersion] - Prior ADO story
 * @param {string[]} [options.attachmentUrls] - ADO attachment REST API URLs
 */
export function formatDescription(prototype, options = {}) {
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    options = typeof options === "string" ? { commitSha: options } : {};
  }

  const {
    commitSha = null,
    route = null,
    sourceUrl = null,
    previousVersion = null,
    attachmentUrls = [],
  } = options;

  const meta = prototype?.metadata || {};
  const components = meta.components || [];
  const interactiveElements = meta.interactiveElements || [];
  const screenshots = prototype?.screenshots || [];
  const name = prototype?.name ?? prototype?.slug ?? "";

  const parts = [];

  if (name) {
    parts.push(`<div><strong>Prototype: ${escapeHtml(name)}</strong></div>`);
  }

  if (sourceUrl) {
    parts.push(`<div><strong>Source:</strong> <a href="${escapeHtml(sourceUrl)}">${escapeHtml(sourceUrl)}</a></div>`);
  }

  if (commitSha) {
    parts.push(`<div data-commit-sha="${escapeHtml(commitSha)}"><strong>Commit:</strong> <code>${escapeHtml(commitSha)}</code></div>`);
  }

  if (route) {
    parts.push(`<div><strong>Route:</strong> <code>${escapeHtml(route)}</code></div>`);
  }

  if (components.length > 0) {
    parts.push(`<div><strong>Component hierarchy</strong>${renderComponentTree(components)}</div>`);
  }

  if (interactiveElements.length > 0) {
    parts.push("<div><strong>Interactive elements</strong><ul>");
    for (const el of interactiveElements) {
      parts.push(`<li>${formatInteractiveElement(el)}</li>`);
    }
    parts.push("</ul></div>");
  }

  if (screenshots.length > 0 || attachmentUrls.length > 0) {
    parts.push("<div><strong>Screenshots</strong><ul>");
    for (let i = 0; i < screenshots.length; i++) {
      const filename = path.basename(screenshots[i]);
      const url = attachmentUrls[i] || null;
      if (url) {
        parts.push(`<li><a href="${escapeHtml(url)}">${escapeHtml(filename)}</a></li>`);
      } else {
        parts.push(`<li>${escapeHtml(filename)}</li>`);
      }
    }
    for (let i = screenshots.length; i < attachmentUrls.length; i++) {
      parts.push(`<li><a href="${escapeHtml(attachmentUrls[i])}">attachment-${i + 1}</a></li>`);
    }
    parts.push("</ul></div>");
  }

  if (previousVersion && previousVersion.id) {
    const prevUrl = previousVersion.url || "";
    const prevId = String(previousVersion.id);
    parts.push(`<div><strong>Previous versions</strong><ul>`);
    if (prevUrl) {
      parts.push(`<li><a href="${escapeHtml(prevUrl)}">Work item ${escapeHtml(prevId)}</a></li>`);
    } else {
      parts.push(`<li>Work item ${escapeHtml(prevId)}</li>`);
    }
    parts.push("</ul></div>");
  }

  if (parts.length === 0) {
    return "<div>No metadata available.</div>";
  }

  return parts.join("");
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(text).replace(/[&<>"']/g, (c) => map[c]);
}

/**
 * Extracts human-readable page names from a comma-separated route string.
 * The base route (matching the slug) becomes "Home"; sub-routes are derived
 * from their last path segment converted from kebab-case to Title Case.
 *
 * Returns null if there are fewer than 2 distinct routes (no enrichment needed).
 *
 * @param {string} route - Comma-separated routes (e.g. "/payroll, /payroll/tax-settings")
 * @param {string} slug - The prototype slug (e.g. "payroll")
 * @returns {string[] | null}
 */
export function extractPageNames(route, slug) {
  if (!route || typeof route !== "string") return null;

  const routes = route.split(",").map((r) => r.trim()).filter(Boolean);
  if (routes.length < 2) return null;

  const slugSegments = slug.replace(/^\//, "").split("/");
  const basePath = "/" + slugSegments.join("/");

  const names = [];
  for (const r of routes) {
    const normalized = r.replace(/\/$/, "") || "/";
    if (normalized === basePath || normalized === basePath + "/") {
      names.push("Home");
    } else {
      const lastSegment = normalized.split("/").pop() || "";
      const titleCased = lastSegment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      if (titleCased) names.push(titleCased);
    }
  }

  return names.length >= 2 ? names : null;
}

/**
 * Builds the work item title, including version number when > 1.
 * When pageNames are provided (multi-page slugs), appends them to the title
 * or falls back to a page count if the full list would exceed ADO's limit.
 */
export function buildTitle(name, version, pageNames) {
  let base = `Prototype: ${name}`;

  if (pageNames && pageNames.length >= 2) {
    const withNames = `${base} (${pageNames.join(", ")})`;
    if (withNames.length <= MAX_TITLE_LENGTH) {
      base = withNames;
    } else {
      base = `${base} (${pageNames.length} pages)`;
    }
  }

  if (version && version > 1) return `${base} (v${version})`;
  return base;
}

/**
 * Returns the JSON Patch array for ADO work item creation.
 * Includes slug tag for WIQL matching and optional commit SHA in description for idempotency.
 */
export function buildWorkItemPayload(prototype, { areaPath, iterationPath, commitSha, version, route, sourceUrl, previousVersion, attachmentUrls } = {}) {
  const name = prototype?.name ?? prototype?.slug ?? "Unnamed";
  const slug = prototype?.slug ?? "";
  const pageNames = extractPageNames(route, slug);
  const title = buildTitle(name, version, pageNames);
  const description = formatDescription(prototype, { commitSha, route, sourceUrl, previousVersion, attachmentUrls });

  const tagParts = [INGESTED_TAG];
  if (slug) tagParts.push(`${SLUG_TAG_PREFIX}${slug}`);
  const tags = tagParts.join("; ");

  const ops = [
    { op: "add", path: "/fields/System.Title", value: title },
    { op: "add", path: "/fields/System.Description", value: description },
    { op: "add", path: "/fields/System.Tags", value: tags },
  ];

  if (areaPath && typeof areaPath === "string" && areaPath.trim()) {
    ops.push({ op: "add", path: "/fields/System.AreaPath", value: areaPath.trim() });
  }

  if (iterationPath && typeof iterationPath === "string" && iterationPath.trim()) {
    ops.push({ op: "add", path: "/fields/System.IterationPath", value: iterationPath.trim() });
  }

  return ops;
}

/**
 * Build the ADO REST API URL for creating a work item.
 * ADO requires a "$" prefix on the work item type in the URL path.
 */
export function buildWorkItemUrl(orgUrl, project, workItemType) {
  const base = orgUrl.replace(/\/$/, "");
  const typeInPath = "$" + String(workItemType).replace(/ /g, "%20");
  return `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${typeInPath}?api-version=${API_VERSION}`;
}

/**
 * Creates a work item via the ADO REST API.
 */
export async function createWorkItem(orgUrl, project, workItemType, payload, authHeader) {
  const url = buildWorkItemUrl(orgUrl, project, workItemType);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ADO API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    url: data._links?.html?.href ?? data.url ?? `${orgUrl.replace(/\/$/, "")}/${project}/_workitems/edit/${data.id}`,
  };
}

async function uploadAttachment(orgUrl, project, filePath, authHeader) {
  const base = orgUrl.replace(/\/$/, "");
  const fileName = path.basename(filePath);
  const url = `${base}/${encodeURIComponent(project)}/_apis/wit/attachments?fileName=${encodeURIComponent(fileName)}&api-version=${API_VERSION}`;

  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (err) {
    throw new Error(`Cannot read file ${filePath}: ${err.message}`);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      Authorization: authHeader,
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ADO attachment upload ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.url;
}

async function addAttachmentToWorkItem(orgUrl, project, workItemId, attachmentUrl, authHeader) {
  const base = orgUrl.replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${workItemId}?api-version=${API_VERSION}`;

  const payload = [
    {
      op: "add",
      path: "/relations/-",
      value: {
        rel: "AttachedFile",
        url: attachmentUrl,
        attributes: { comment: "Screenshot from prototype ingestion" },
      },
    },
  ];

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ADO relation add ${res.status}: ${text}`);
  }
}

/**
 * Upload screenshots to ADO and return an array of attachment URLs (or null per failed upload).
 * Maintains 1:1 index alignment with the input screenshots array.
 */
export async function uploadScreenshots(screenshots, orgUrl, project, authHeader) {
  const cwd = process.cwd();
  const attachmentUrls = [];

  for (const fp of screenshots) {
    const absolutePath = path.isAbsolute(fp) ? fp : path.join(cwd, fp);
    if (!fs.existsSync(absolutePath)) {
      console.warn(`WARNING: Screenshot not found, skipping: ${fp}`);
      attachmentUrls.push(null);
      continue;
    }
    try {
      const attUrl = await uploadAttachment(orgUrl, project, absolutePath, authHeader);
      attachmentUrls.push(attUrl);
    } catch (err) {
      console.warn(`WARNING: Failed to upload ${fp}: ${err.message}`);
      attachmentUrls.push(null);
    }
  }

  return attachmentUrls;
}

/**
 * Link uploaded attachments to a work item. Skips null entries (failed uploads).
 */
export async function linkAttachments(attachmentUrls, orgUrl, project, workItemId, authHeader) {
  for (const attUrl of attachmentUrls) {
    if (!attUrl) continue;
    try {
      await addAttachmentToWorkItem(orgUrl, project, workItemId, attUrl, authHeader);
    } catch (err) {
      console.warn(`WARNING: Failed to link attachment to ${workItemId}: ${err.message}`);
    }
  }
}

/**
 * Fetches the Kanban board configuration for a given team and board name.
 * Returns the WEF extension field reference names for column and row (lane).
 *
 * @param {string} orgUrl - ADO org URL
 * @param {string} project - Project name
 * @param {string} team - Team name
 * @param {string} boardName - Board name (e.g. "Stories" for User Story backlog)
 * @param {string} authHeader - Authorization header value
 * @returns {{ columnField: string|null, rowField: string|null } | null}
 */
export async function fetchBoardConfig(orgUrl, project, team, boardName, authHeader) {
  const base = orgUrl.replace(/\/$/, "");
  const url =
    `${base}/${encodeURIComponent(project)}/${encodeURIComponent(team)}` +
    `/_apis/work/boards/${encodeURIComponent(boardName)}?api-version=${API_VERSION}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Board config fetch failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  const columnField = data?.fields?.columnField?.referenceName ?? null;
  const rowField = data?.fields?.rowField?.referenceName ?? null;

  if (!columnField && !rowField) return null;
  return { columnField, rowField };
}

/**
 * Updates a work item's board position (column and/or swim lane) using WEF
 * extension fields discovered from the board configuration.
 *
 * This is a best-effort operation: failures are logged as warnings and do not
 * break the pipeline.
 *
 * @param {string} orgUrl
 * @param {string} project
 * @param {number} workItemId
 * @param {{ columnField: string|null, rowField: string|null }} boardFields
 * @param {{ column?: string, lane?: string }} placement
 * @param {string} authHeader
 */
export async function updateBoardPosition(orgUrl, project, workItemId, boardFields, placement, authHeader) {
  const ops = [];

  if (placement.column && boardFields.columnField) {
    ops.push({
      op: "add",
      path: `/fields/${boardFields.columnField}`,
      value: placement.column,
    });
  }

  if (placement.lane && boardFields.rowField) {
    ops.push({
      op: "add",
      path: `/fields/${boardFields.rowField}`,
      value: placement.lane,
    });
  }

  if (ops.length === 0) return;

  const base = orgUrl.replace(/\/$/, "");
  const url = `${base}/${encodeURIComponent(project)}/_apis/wit/workitems/${workItemId}?api-version=${API_VERSION}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json-patch+json",
      Authorization: authHeader,
    },
    body: JSON.stringify(ops),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Board position update ${res.status}: ${text}`);
  }
}

export async function processPrototype(prototype, slug, config) {
  const { orgUrl, project, workItemType, areaPath, iterationPath, authHeader, commitSha, repoUrl } = config;

  const existing = await checkIdempotency(orgUrl, project, slug, commitSha, authHeader);
  if (existing) {
    const portalUrl = `${orgUrl.replace(/\/$/, "")}/${project}/_workitems/edit/${existing.id}`;
    return { id: existing.id, url: portalUrl, action: "skipped" };
  }

  const { nextVersion, previousId } = await detectVersion(orgUrl, project, slug, authHeader);

  const base = orgUrl.replace(/\/$/, "");
  let previousVersion = null;
  if (previousId) {
    previousVersion = {
      id: previousId,
      url: `${base}/${project}/_workitems/edit/${previousId}`,
    };
  }

  const screenshots = prototype?.screenshots || [];
  const attachmentUrls = await uploadScreenshots(screenshots, orgUrl, project, authHeader);

  const route = prototype?.route || null;
  let sourceUrl = null;
  if (repoUrl && commitSha) {
    const sourcePath = prototype?.sourcePath || `src/pages/${prototype?.slug || slug}`;
    sourceUrl = `${repoUrl}/tree/${commitSha}/${sourcePath}`;
  }

  const payload = buildWorkItemPayload(prototype, {
    areaPath,
    iterationPath,
    commitSha,
    version: nextVersion,
    route,
    sourceUrl,
    previousVersion,
    attachmentUrls,
  });

  const result = await createWorkItem(orgUrl, project, workItemType, payload, authHeader);

  await linkAttachments(attachmentUrls, orgUrl, project, result.id, authHeader);

  if (previousId) {
    try {
      await addRelatedLink(orgUrl, project, result.id, previousId, authHeader);
      console.log(`Linked work item ${result.id} to previous version ${previousId}`);
    } catch (err) {
      console.warn(`WARNING: Failed to link ${result.id} to ${previousId}: ${err.message}`);
    }
  }

  if (config.boardFields && config.boardPlacement) {
    try {
      await updateBoardPosition(orgUrl, project, result.id, config.boardFields, config.boardPlacement, authHeader);
      const parts = [];
      if (config.boardPlacement.column && config.boardFields.columnField) {
        parts.push(`column="${config.boardPlacement.column}"`);
      }
      if (config.boardPlacement.lane && config.boardFields.rowField) {
        parts.push(`lane="${config.boardPlacement.lane}"`);
      }
      console.log(`Board position set for ${result.id}: ${parts.join(", ")}`);
    } catch (err) {
      console.warn(`WARNING: Failed to set board position for ${result.id}: ${err.message}`);
    }
  }

  return { ...result, action: nextVersion > 1 ? `created-v${nextVersion}` : "created" };
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  (async () => {
    let inputJson = process.argv[2];
    if (!inputJson && process.env.WORK_ITEM_INPUT) {
      inputJson = process.env.WORK_ITEM_INPUT.trim();
    }
    if (!inputJson) {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      inputJson = Buffer.concat(chunks).toString().trim();
    }

    if (!inputJson) {
      console.error(
        "Usage: set WORK_ITEM_INPUT env var, pipe JSON to stdin, or pass as CLI arg"
      );
      process.exit(1);
    }

    let input;
    try {
      input = JSON.parse(inputJson);
    } catch {
      console.error("Invalid JSON input");
      process.exit(1);
    }

    const orgUrl = process.env.ADO_ORG_URL;
    const project = process.env.ADO_PROJECT;
    const areaPath = process.env.ADO_AREA_PATH;
    const iterationPath = process.env.ADO_ITERATION_PATH;
    const workItemType = process.env.ADO_WORK_ITEM_TYPE || "User Story";
    const pat = process.env.AZDO_PAT;
    const commitSha = process.env.COMMIT_SHA || null;

    if (!orgUrl || !project) {
      console.error("Missing ADO_ORG_URL or ADO_PROJECT");
      process.exit(1);
    }

    const authHeader = buildAuthHeader(pat);
    if (!authHeader) {
      console.error("Missing or invalid AZDO_PAT");
      process.exit(1);
    }

    if (!commitSha) {
      console.warn("WARNING: COMMIT_SHA not set, idempotency checks disabled");
    }

    const repoUrl = process.env.REPO_URL || null;
    const boardColumn = process.env.ADO_BOARD_COLUMN || null;
    const boardLane = process.env.ADO_BOARD_LANE || null;
    const team = process.env.ADO_TEAM || null;
    const boardName = process.env.ADO_BOARD_NAME || "Stories";

    let boardFields = null;
    let boardPlacement = null;

    if ((boardColumn || boardLane) && team) {
      try {
        boardFields = await fetchBoardConfig(orgUrl, project, team, boardName, authHeader);
        if (boardFields) {
          boardPlacement = {};
          if (boardColumn) boardPlacement.column = boardColumn;
          if (boardLane) boardPlacement.lane = boardLane;
          console.log(`Board config resolved: column field=${boardFields.columnField}, row field=${boardFields.rowField}`);
        } else {
          console.warn("WARNING: Board config returned no field references, skipping board placement");
        }
      } catch (err) {
        console.warn(`WARNING: Could not fetch board config: ${err.message}. Board placement will be skipped.`);
      }
    } else if (boardColumn || boardLane) {
      console.warn("WARNING: ADO_BOARD_COLUMN or ADO_BOARD_LANE set but ADO_TEAM is missing. Board placement skipped.");
    }

    const config = { orgUrl, project, workItemType, areaPath, iterationPath, authHeader, commitSha, repoUrl, boardFields, boardPlacement };

    const entries = typeof input === "object" && input !== null && !Array.isArray(input)
      ? Object.entries(input)
      : [];

    const workitems = [];
    const errors = [];

    for (const [slug, prototype] of entries) {
      if (!prototype || typeof prototype !== "object") {
        console.warn(`WARNING: Skipping invalid entry: ${slug}`);
        errors.push({ slug, error: "Invalid entry (not an object)" });
        continue;
      }
      const merged = { slug, ...prototype };
      try {
        const result = await processPrototype(merged, slug, config);
        workitems.push({ id: result.id, url: result.url, slug, action: result.action });
        if (result.action === "skipped") {
          console.log(`Skipped ${slug}: already ingested for this commit`);
        } else {
          console.log(`${result.action} work item ${result.id} for ${slug}`);
        }
      } catch (err) {
        console.warn(`WARNING: Failed to create work item for ${slug}: ${err.message}`);
        errors.push({ slug, error: err.message });
      }
    }

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `workitems=${JSON.stringify(workitems)}\n`
      );
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `errors=${JSON.stringify(errors)}\n`
      );
    }
  })();
}
