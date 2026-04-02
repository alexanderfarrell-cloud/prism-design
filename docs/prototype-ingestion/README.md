# Prototype Ingestion Pipeline

Automated pipeline that detects changed prototype pages, captures screenshots, extracts component metadata via an AI agent, and creates Azure DevOps (ADO) work items -- all triggered by a push to `main`.

## Table of Contents

- [Overview](#overview)
- [Trigger Conditions](#trigger-conditions)
- [Pipeline Phases](#pipeline-phases)
  - [Phase 1: CI Checks](#phase-1-ci-checks)
  - [Phase 2: Change Detection and Route Resolution](#phase-2-change-detection-and-route-resolution)
  - [Phase 3: Screenshot and Metadata Extraction](#phase-3-screenshot-and-metadata-extraction)
  - [Phase 4: ADO Integration](#phase-4-ado-integration)
  - [Phase 5: Workflow Summary](#phase-5-workflow-summary)
- [Scripts](#scripts)
- [Prompt Templates](#prompt-templates)
- [Configuration](#configuration)
- [Environment Variables and Secrets](#environment-variables-and-secrets)
- [ADO Work Item Structure](#ado-work-item-structure)
- [Error Handling](#error-handling)
- [Architecture Diagram](#architecture-diagram)

## Overview

Prototypes live as React pages in `src/pages/`. When a developer merges changes to `main`, this pipeline:

1. Detects which prototype pages changed
2. Resolves their application routes from `App.tsx`
3. Captures full-page screenshots via Playwright (driven by a Copilot agent)
4. Extracts component metadata (hierarchy, props, interactive elements) via a Copilot agent
5. Creates or updates ADO User Story work items with the metadata, screenshots, and source links
6. Posts a summary to the GitHub Actions workflow UI

Each prototype is identified by its **slug** -- a short, URL-safe identifier derived from the page's file or folder name. The slug serves as the prototype's unique key throughout the pipeline (change detection, metadata files, ADO tags, screenshot filenames). For single-file pages, the PascalCase file name (minus extension) is converted to kebab-case (e.g. `DashboardPage.tsx` becomes `dashboard-page`). For folder-based pages, the folder name is the slug directly (e.g. `payroll-onboarding/`).

## Trigger Conditions

```yaml
on:
  push:
    branches: [main]
    paths:
      - "src/pages/**"
```

The pipeline runs when:

- A push lands on `main` (direct push or merged PR)
- The push includes changes to files under `src/pages/`
- Changes to other directories (`src/components/`, `src/contexts/`, etc.) do **not** trigger the pipeline

Change detection uses `git diff --name-only HEAD~1 HEAD -- src/pages/` to identify affected files, then groups them by slug. Deleted files are ignored.

**Concurrency control:** The workflow uses `concurrency: { group: prototype-ingestion-${{ github.ref }}, cancel-in-progress: true }`. If two pushes land in quick succession, the earlier run is cancelled in favor of the newer one.

**Runner:** `ubuntu-latest`. The Checkout step uses `fetch-depth: 2` so that `git diff HEAD~1 HEAD` has sufficient commit history.

## Pipeline Phases

### Phase 1: CI Checks

Standard quality gates run before any pipeline-specific work:

| Step | Command | Purpose |
|------|---------|---------|
| Install Dependencies | `npm ci` | Deterministic dependency install |
| Lint & Validate | `npm run lint:all` | Type checking, design system compliance, route validation |
| Run Tests | `npm test` | Full Vitest test suite |

### Phase 2: Change Detection and Route Resolution

**Detect Changes** (`detect-changes.js`)

Compares the current commit against its parent to find changed prototype pages. Outputs:
- `has_changes` -- `"true"` or `"false"`
- `slugs` -- JSON array of changed slugs, e.g. `["dashboard-page","payroll-onboarding"]`

Slug derivation:
- Single-file page `DashboardPage.tsx` --> slug `dashboard-page` (PascalCase converted to kebab-case)
- Folder-based page `payroll-onboarding/` --> slug `payroll-onboarding` (folder name used as-is)
- Files in subdirectories are grouped by their first-level folder under `src/pages/`

Slugs listed in `.github/config/prototype-ingestion.json` under `"exclude"` are skipped.

**Resolve Routes** (`resolve-routes.js`)

Parses `src/App.tsx` to map each slug to its application route. Reads import statements and `<Route>` elements to build the mapping.

Output: JSON object, e.g. `{"dashboard-page": "/dashboard", "payroll-onboarding": "/payroll/setup"}`

If a route cannot be resolved for a slug, screenshot capture is skipped but metadata extraction still runs.

### Phase 3: Screenshot and Metadata Extraction

This phase uses AI agents (Copilot CLI) with Playwright for browser automation.

**Infrastructure setup:**
- Playwright Chromium is installed (`npx playwright install --with-deps chromium`)
- Copilot CLI is installed globally (`npm install -g @github/copilot`)
- The Vite dev server is started and health-checked (up to 30 seconds)

**Screenshot Capture** (`capture-screenshots.js`)

Generates prompts for the Copilot agent to navigate to each prototype URL and capture full-page screenshots at 1440x900 viewport. Screenshots are saved as `screenshots/{slug}.png`. For multi-step flows (wizards), additional screenshots are captured as `screenshots/{slug}-R-step-S.png` (where R is the route number and S is the step number).

The agent is restricted to Playwright MCP tools (`--allow-tool='playwright'`) with explicit hard denials on file writes (`--deny-tool='write'`) and shell commands (`--deny-tool='shell'`). File reads are implicitly available per Copilot CLI's permission model (reads are not modification/execution operations) and are used for dynamic route parameter discovery under `src/pages/`. After all screenshots are captured, a verification step checks for both modified and untracked files under `src/` and restores originals if the agent violated the restrictions.

Screenshots are uploaded as GitHub Actions artifacts (retained for 30 days).

**Metadata Extraction** (`extract-metadata.js` + `run-metadata-extraction.js`)

1. `extract-metadata.js` generates prompts from the template at `.github/prompts/extract-metadata.prompt.md`, injecting the slug, name, and source file paths
2. `run-metadata-extraction.js` orchestrates the Copilot CLI invocations with validation and retry:
   - Calls the Copilot agent with each prompt
   - Validates the output against a Zod schema (`validate-metadata.js`)
   - On validation failure, builds a retry prompt with error feedback
   - Retries up to `METADATA_MAX_RETRIES` times (default: 2)
   - Writes validated JSON to the `metadata/` directory

The metadata schema captures:
- `name` -- human-readable prototype name
- `slug` -- prototype identifier
- `components` -- recursive tree of Modus and custom components with props
- `interactiveElements` -- buttons, inputs, navigation with type, label, and position

### Phase 4: ADO Integration

**Compose Work Item Input** (inline bash step)

Assembles a JSON object per slug by combining:
- Validated metadata from `metadata/{slug}.json`
- Screenshot file paths from `screenshots/{slug}*.png`
- Resolved route from Phase 2

**Create ADO Work Items** (`create-ado-workitems.js`)

For each prototype:

1. **Idempotency check** -- queries ADO via WIQL (Work Item Query Language) for existing work items matching the slug tag and commit SHA. If found, skips (prevents duplicates on re-runs).
2. **Version detection** -- queries ADO for all work items with the slug tag to determine the next version number (v1, v2, ...).
3. **Screenshot upload** -- uploads screenshot files as ADO attachments via the REST API.
4. **Work item creation** -- creates a User Story with title, rich HTML description, tags, area path, and iteration path.
5. **Attachment linking** -- links uploaded screenshots to the created work item.
6. **Version linking** -- links the new work item to the previous version via an ADO "Related" relation.

Outputs `workitems` (JSON array of results) and `errors` (JSON array of failures) to `GITHUB_OUTPUT`.

### Phase 5: Workflow Summary

**Generate Workflow Summary** (`generate-summary.js`)

Runs with `if: always()` so it executes even if prior steps failed. Reads the slugs, work item results, and errors, then writes a markdown summary to `GITHUB_STEP_SUMMARY` containing:

- Total prototypes detected
- Counts: created, skipped (duplicate), errors
- Per-prototype table with status, version number, and ADO link
- Error details section (if any failures occurred)

## Scripts

All scripts live in `.github/scripts/` and are ESM modules (Node.js 20+).

| Script | Purpose | Inputs | Outputs |
|--------|---------|--------|---------|
| `detect-changes.js` | Find changed prototype pages via git diff | Optional base/head refs | `has_changes`, `slugs` to GITHUB_OUTPUT |
| `resolve-routes.js` | Map slugs to routes by parsing App.tsx | JSON array of slugs | JSON slug-to-route map to GITHUB_OUTPUT |
| `capture-screenshots.js` | Generate Copilot prompts for screenshot capture | JSON slug-to-route map | JSON array of prompts to GITHUB_OUTPUT |
| `extract-metadata.js` | Generate Copilot prompts for metadata extraction | JSON array of slugs | JSON array of prompts to GITHUB_OUTPUT |
| `validate-metadata.js` | Sanitize and validate agent output against Zod schema | Raw agent output | Validated JSON or error |
| `run-metadata-extraction.js` | Orchestrate metadata extraction with retries | JSON array of prompts | `metadata/{slug}.json` files |
| `create-ado-workitems.js` | Create/update ADO work items with metadata and screenshots | JSON object of prototypes | `workitems`, `errors` to GITHUB_OUTPUT |
| `generate-summary.js` | Render workflow summary markdown | Slugs, workitems, errors | Markdown to GITHUB_STEP_SUMMARY |

Tests for each script live in `.github/scripts/__tests__/`.

## Prompt Templates

Templates live in `.github/prompts/` and use `{{PLACEHOLDER}}` syntax.

### `capture-screenshot.prompt.md`

Instructs the Copilot agent to:
- Set viewport to 1440x900 before navigating (ensures correct layout on first render)
- Navigate to the prototype URL using Playwright MCP tools
- Wait 2 seconds for the page to fully render
- Capture a screenshot as-is, even if the page is blank or a placeholder
- For multi-step flows, advance through steps and capture `screenshots/{slug}-R-step-S.png`
- Skip silently if the page returns 404

The prompt includes an explicit ALLOWED TOOLS section listing the Playwright MCP tools (`browser_navigate`, `browser_resize`, `browser_take_screenshot`, `browser_click`, `browser_snapshot`) plus scoped read-only file access for dynamic route resolution. File writes and shell commands are hard-denied via `--deny-tool` flags, giving the agent an immediate "unavailable" signal rather than an ambiguous approval loop. The agent may read source files under `src/pages/` to find mock data values for route parameters like `:id`, but cannot modify files under any circumstances.

### `extract-metadata.prompt.md`

Instructs the Copilot agent to:
- Read the listed source files and follow relative imports up to 4 levels deep
- Do not follow imports from `node_modules` or external packages
- Build a nested component tree with parent-child relationships
- Extract Modus and custom components with their props
- Identify interactive elements (buttons, inputs, navigation)
- Do not modify files or run shell commands
- Output valid JSON only (no markdown fences or extra text)

## Configuration

### `.github/config/prototype-ingestion.json`

```json
{
  "exclude": []
}
```

Add slug names to the `exclude` array to skip specific prototypes from ingestion.

## Environment Variables and Secrets

### Workflow-Level Variables

Set in the workflow YAML `env:` block:

| Variable | Value | Purpose |
|----------|-------|---------|
| `ADO_ORG_URL` | `https://dev.azure.com/ViewpointVSO` | ADO organization URL |
| `ADO_PROJECT` | `Lista` | ADO project name |
| `ADO_AREA_PATH` | `Lista` | Area path for created work items |
| `ADO_ITERATION_PATH` | `Lista` | Iteration path for work items |
| `ADO_WORK_ITEM_TYPE` | `User Story` | ADO work item type to create |

### Step-Level Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `COMMIT_SHA` | `${{ github.sha }}` | Git commit SHA for idempotency |
| `REPO_URL` | `${{ github.server_url }}/${{ github.repository }}` | Repository URL for source links |
| `COPILOT_GITHUB_TOKEN` | `${{ secrets.GITHUB_TOKEN }}` | Auth for Copilot CLI |
| `METADATA_MAX_RETRIES` | `"2"` | Max retry attempts for metadata extraction |
| `METADATA_OUTPUT_DIR` | `"metadata"` | Directory for validated metadata JSON |

### Secrets

| Secret | Purpose |
|--------|---------|
| `AZDO_PAT` | Personal access token for ADO REST API |
| `GITHUB_TOKEN` | Provided automatically; used for Copilot CLI auth |

## ADO Work Item Structure

### Title

```
Prototype: <name>           (v1, first version)
Prototype: <name> (v2)      (subsequent versions)
```

### Tags

```
proto-ingested; slug:<slug-name>
```

The `proto-ingested` tag identifies pipeline-created work items. The `slug:` tag enables WIQL queries for idempotency and version detection.

### Description (HTML)

The description is rendered as HTML with these sections:

1. **Prototype name** -- header with the human-readable name
2. **Source link** -- link to the GitHub source at the specific commit
3. **Commit SHA** -- embedded in a `data-commit-sha` attribute for WIQL idempotency queries
4. **Route** -- application route path (e.g. `/payroll/setup`)
5. **Component hierarchy** -- recursive nested `<ul>` with component names and props
6. **Interactive elements** -- list of buttons, inputs, navigation with type, label, and position
7. **Screenshots** -- links to ADO attachment URLs
8. **Previous versions** -- link to prior ADO work item (when version > 1)

### Attachments

Screenshot PNG files are uploaded as ADO attachments and linked to the work item.

### Version Linking

When a new version is created (v2, v3, ...), the pipeline:
- Links the new work item to the previous version via an ADO "Related" relation
- Includes the previous version in the description's "Previous versions" section

## Error Handling

The pipeline follows a **skip-and-continue** pattern:

1. If a prototype fails at any step (route resolution, screenshot capture, metadata extraction, ADO API error), the pipeline logs the error, skips that prototype, and continues with the remaining ones.
2. Errors are tracked in a structured `errors` array and included in the workflow summary.
3. The workflow fails if a critical infrastructure error occurs (e.g. cannot authenticate to ADO, dev server won't start) or if the source integrity guard detects agent modifications to `src/`.
4. Idempotency checks prevent duplicate work items on workflow re-runs.
5. Metadata extraction retries up to `METADATA_MAX_RETRIES` times with error feedback to the agent.
6. WIQL queries use `escapeWiql()` to prevent injection via slug values containing single quotes.
7. **Source modification guard:** After screenshot capture, the workflow checks for both modified files (`git diff --exit-code -- src/`) and new untracked files (`git ls-files --others -- src/`). If either is detected, originals are restored, new files are removed, and the step fails. This provides defense-in-depth alongside the tool restriction (`--allow-tool='playwright'`).

## Architecture Diagram

```
         Push to main (src/pages/**)
                    |
                    v
            +--------------+
            | Detect       |
            | Changes      |
            +--------------+
             |            |
        (slugs)      (slugs)
             |            |
             v            v
    +----------------+  +------------------+
    | Resolve Routes |  | Metadata         |
    | (App.tsx)      |  | Extraction       |
    +----------------+  | (Copilot + Zod)  |
             |          +------------------+
        (routes)              |
             |          (metadata/*.json)
             v                |
    +-------------+           |
    | Screenshot  |           |
    | Capture     |           |
    | (Playwright)|           |
    +-------------+           |
             |                |
      (screenshots/)          |
             |                |
             v                v
    +------------------------------+
    | Compose Work Item Input      |
    | (merge metadata + screenshots|
    |  + routes)                   |
    +------------------------------+
                    |
                    v
    +------------------------------+
    | Create ADO Work Items        |
    | (idempotency, versioning,    |
    |  attachments, linking)       |
    +------------------------------+
                    |
                    v
    +------------------------------+
    | Generate Workflow Summary    |
    | (GITHUB_STEP_SUMMARY)       |
    +------------------------------+
```
