---
name: ui-iteration
description: Start the dev server, connect Playwright to the running app, and enter a collaborative UI iteration loop with the human. Use when the user wants to visually inspect, tweak, or iterate on the UI in real time.
---

# UI Iteration Loop

Launch the local dev server, connect the Playwright MCP browser to it, and enter a human-steered iteration loop for collaborative UI development.

## When to Use

- User wants to see the app running and iterate on the UI
- User says "let's iterate", "show me the app", "open the browser", or "ui iteration"
- User wants to visually verify changes in the browser after code edits
- User wants a live feedback loop: edit code, see result, repeat

## Prerequisites

- The `playwright` MCP server must be configured in `.cursor/mcp.json`
- Node.js and project dependencies must be installed (`npm install`)

## Startup Procedure

Follow these steps **in order**. Do not skip steps.

### Step 1: Check for an existing dev server

Look for a running terminal that is already serving the Vite dev server (`npm run dev`).
Read the terminal files in the terminals folder to check.

- If the dev server is **already running**, note the URL (default `http://localhost:5173`) and skip to Step 3.
- If not running, continue to Step 2.

### Step 2: Start the dev server

Run the dev server in the background from the `lista-payroll-design` project root:

```bash
npm run dev
```

Use `block_until_ms: 0` so the command runs in the background.

Then poll the terminal output until you see Vite's "Local:" URL line (e.g. `Local: http://localhost:5173/`). This confirms the server is ready. Typical startup is under 5 seconds.

### Step 3: Connect Playwright to the dev server

Use the Playwright MCP tool `browser_navigate` to open the dev server URL:

```
tool: playwright > browser_navigate
url: http://localhost:5173
```

This launches a headed browser window pointed at the running app.

### Step 4: Take an initial snapshot

Use `browser_snapshot` to capture the page's accessibility tree. This gives you a structured view of what rendered. Share a brief summary with the user:

- Confirm the page loaded
- Note key visible elements or the current route
- Report any console errors (use `browser_console_messages` if relevant)

### Step 5: Announce readiness and wait

Tell the user:

> The dev server is running and the browser is connected at `http://localhost:5173`. I can see the page. What would you like to change?

Then **stop and wait** for the user's instructions. Do NOT make changes unprompted.

## Iteration Loop

Once the user gives direction, follow this cycle:

1. **Make the code change** the user requested (edit files, add components, etc.)
2. **Wait for HMR** -- Vite's hot module replacement will auto-update the browser. Wait ~2 seconds after saving.
3. **Snapshot the page** with `browser_snapshot` to see the updated state.
4. **Report back** to the user with a brief summary of what changed visually.
5. **Wait for next instruction** -- do not continue without user direction.

### If navigation is needed

If the user asks to view a different route or page, use `browser_navigate` to go there, then snapshot and report.

### If the user asks to inspect something

- Use `browser_snapshot` for the accessibility tree (preferred for structure)
- Use `browser_take_screenshot` if the user wants a visual capture
- Use `browser_console_messages` to check for errors or warnings
- Use `browser_evaluate` to run JS in the page context if needed

### If HMR fails or the page looks stale

1. Try `browser_navigate` back to the same URL to force a full reload
2. If that doesn't work, check the terminal output for build errors
3. Report any errors to the user before proceeding

## Important Rules

- **Human steers the session.** Never make speculative changes. Always wait for explicit user direction.
- **Keep reports concise.** Don't dump full snapshots unless asked. Summarize what you see.
- **Don't shut down the dev server** unless the user explicitly asks to stop.
- **Don't close the browser** unless the user explicitly asks.
- **Follow all project rules** -- design system colors, Modus icons, div-only HTML, etc. still apply to any code changes.
- **Run lint checks** (`npm run lint:all`) when the user is satisfied with a round of changes, or when they ask.

## Ending the Session

When the user signals they're done iterating:

1. Ask if they want to run lint checks on the changes made
2. Summarize what was changed during the session
3. Leave the dev server running unless told otherwise
