# Team Workspace Setup Guide: Lista × Cursor
**Target Audience:** All Lista team members — Product Managers, UX/UI Designers, and Engineering Leads  
**Last Updated:** Mar 9, 2026  
**Status:** Live

---

## Overview

This guide covers how to set up and use the **shared Lista team workspace** in Cursor — a single Google Drive folder that serves as the collaboration hub for PM documentation, design artifacts, AI-assisted workflows, and the ADO backlog.

The team workspace is separate from any personal workspace you may already be using. You can work in both simultaneously; just open the appropriate folder in Cursor when you switch contexts.

**If you are a PM already using a personal workspace:** this guide explains how the team space is structured so you can contribute finished artifacts to it from your personal space, and what conventions to follow so everything stays organized.

**If you are a Designer new to Cursor:** start at [Section 2: First-Time Setup](#2-first-time-setup) and follow the steps in order.

---

## 1. Team Workspace Folder Structure

The team workspace lives in Google Drive and follows this structure. Understanding what goes where is the most important orientation step.

```
_Lista-Team/                             ← Root (Google Drive, shared with full team)
│
├── .cursor/
│   ├── commands/                        ← AI slash commands (prd-draft, epic-draft, etc.)
│   ├── rules/                           ← Workspace-wide AI context (product domain, conventions)
│   └── mcp.json                         ← ADO connector configuration
│
├── docs/
│   ├── product/                         ← PM-owned
│   │   ├── prds/                        ← Finalized Product Requirements Documents
│   │   ├── features/                    ← Feature lists and epic breakdowns
│   │   └── backlog/                     ← Grooming outputs, briefings, story docs
│   │
│   ├── design/                          ← Designer-owned
│   │   ├── flows/                       ← User flow diagrams, annotated screen exports
│   │   ├── annotations/                 ← Design decision notes per feature area
│   │   └── assets/                      ← Images referenced in prototypes or docs
│   │
│   ├── research/                        ← Shared source material (read-only reference)
│   │   └── (interview synthesis, MRDs, user insights, competitive analysis)
│   │
│   └── best-practices/                  ← Team conventions and guides (this file lives here)
│
├── prototypes/                          ← Shared: interactive HTML prototypes
│   └── {feature-name}/                  ← One folder per feature area
│       ├── index.html                   ← The prototype itself
│       └── README.md                    ← ADO story links + design rationale (required)
│
└── README.md                            ← Team entry point — start here if you are new
```

### Ownership at a Glance

| Folder | Primary Owner | Who Else Uses It |
|--------|--------------|-----------------|
| `docs/product/` | PM | Designers reference PRDs for design context |
| `docs/design/` | Designer | PM references for story ACs and grooming |
| `docs/research/` | Shared | Both — read-only source material |
| `prototypes/` | Shared | Designer builds, PM links to ADO stories |
| `.cursor/` | PM (initial setup) | Inherited by everyone who opens the workspace |

---

## 2. First-Time Setup

Follow these steps the first time you use the team workspace. Steps 1–3 are one-time; after that, you just open the folder and go.

### Step 1: Install Cursor

1. Go to **[cursor.com](https://www.cursor.com)** and click **Download**
2. Run the installer and follow the prompts
3. Launch Cursor from the Start menu or desktop shortcut

> Cursor looks like a code editor (it is built on VS Code), but you do not need to write code. Think of the left panel as a file explorer and the main area as your document workspace.

---

### Step 2: Install Node.js (Required for ADO Connection)

Node.js runs in the background and is required for the ADO connector to work. You do not interact with it directly.

**2a. Install nvm-windows**

1. Go to [github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2. Click **`nvm-setup.exe`** under the latest release and run the installer (default options are fine)
3. **Reboot your machine** after installation (required)

**2b. Install Node.js via nvm**

1. Open **PowerShell** (press `Windows key`, type `PowerShell`, hit Enter)
2. Run: `nvm install lts` then press Enter
3. Run: `nvm use lts`
4. Verify: `node --version` — you should see something like `v22.x.x`

> If you see an error, confirm you rebooted after Step 2a. If the issue persists, ping the Engineering team.

---

### Step 3: Open the Team Workspace in Cursor

1. Launch Cursor
2. Go to **File → Open Folder**
3. Navigate to the `_Lista-Team` folder in Google Drive and select it
4. The folder contents will appear in the left-hand Explorer panel

The `.cursor/` folder at the root of the workspace automatically activates all shared AI commands and rules. No additional configuration is needed for the AI features.

---

### Step 4: Connect to Azure DevOps (ADO)

The workspace already contains a pre-configured `.cursor/mcp.json` file that connects Cursor to ADO. You do not need to create this file — it is already there.

**What you do need to do:**

1. After opening the workspace in Cursor, go to **Settings** (gear icon, bottom-left)
2. Search for **MCP** in settings
3. You should see an `ado` entry — confirm it shows a **green dot**
4. If it shows a red dot, click **Refresh** next to the entry

**Authentication:** When you use an ADO-connected command for the first time, a browser window will open and ask you to sign in with your Viewpoint work account. Sign in once and the connection stays active for that session.

> For detailed ADO setup troubleshooting, see [`workflow-guide.md`](./workflow-guide.md) — Section 6 (Troubleshooting).

---

## 3. How the Team Workspace Connects to ADO

The ADO connection enables any team member to query and update the backlog without leaving Cursor. Here is what this looks like in practice for each role:

### For PMs
- Generate PRDs and epics, then push them directly to ADO as structured work items
- Query existing stories: *"What stories exist under the Employee Hub epic?"*
- Update story descriptions or acceptance criteria from within Cursor

### For Designers
- Pull story context while building prototypes: *"@azure-devops get the acceptance criteria for story #1234"*
- Add design notes or prototype links as comments on ADO work items: *"Add a comment to ADO story #1234 linking to the prototype in `prototypes/employee-hub/`"*
- Query what is in scope for a sprint before starting design work

### Linking Prototypes to ADO Stories (Required Convention)

Every prototype folder **must** contain a `README.md` that maps the prototype to its ADO work items. This is the bridge between design work and the backlog.

Use this template for `prototypes/{feature-name}/README.md`:

```markdown
# Prototype: {Feature Name}

## ADO Story Links
| Story ID | Title | Notes |
|----------|-------|-------|
| #XXXX | Story title here | What this prototype covers for this story |
| #XXXX | Story title here | |

## Design Rationale
Brief notes on key decisions made in this prototype (optional but encouraged).

## Status
[ ] In Progress  [ ] Ready for Review  [ ] Approved
```

---

## 4. Day-to-Day Conventions

These conventions keep the workspace clean and useful for everyone.

### What Goes in `docs/design/`

Designers contribute artifacts here that inform story acceptance criteria and PM grooming work. Use this folder for:

- **Flows:** Exported screen flows, annotated wireframe sequences, interaction maps. Name files descriptively: `employee-hub-add-employee-flow.png`
- **Annotations:** Written design decision docs, edge case notes, interaction specifications. These often become acceptance criteria inputs.
- **Assets:** Images embedded in prototypes (keep assets co-located with the prototype if possible, or here if shared across features)

> **Do not** put Figma file links as the only artifact. Export or annotate for offline reference — not everyone has Figma access.

### What Goes in `prototypes/`

Interactive HTML prototypes built in Cursor, one folder per feature area. The folder name should match the feature area used in ADO (e.g., `employee-hub`, `pay-scheduling-calendar`). Always include the `README.md` with ADO story links.

### What Goes in `docs/product/prds/`

Finalized PRDs only — not drafts. Drafts live in your personal workspace until they are ready to be the team source of truth. When a PRD is ready, copy (not move) it into the team workspace so your personal workspace retains its history.

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| PRDs | `{Feature-Area}_PRD.md` | `Employee_PRD.md` |
| Feature lists | `{Feature-Area} Features.md` | `Employee Hub Features.md` |
| Prototype folders | `{feature-area-kebab-case}` | `employee-hub` |
| Design flows | `{feature}-{screen}-flow.{ext}` | `employee-add-flow.png` |

---

## 5. Using AI Commands in the Team Workspace

The `.cursor/commands/` folder contains the team's shared slash commands. These work for everyone who opens the team workspace — no individual setup required.

| Command | What It Does | Typical User |
|---------|-------------|-------------|
| `/prd-draft` | Generates a structured PRD from discovery inputs | PM |
| `/epic-draft` | Converts a PRD into a set of product epics | PM |
| `/user-story-design` | Generates a story overview table from an epic | PM |
| `/user-story-expand` | Expands approved stories into full CMS template format | PM |

### For Designers: AI in the Team Workspace

You do not need to use the PM slash commands. As a designer, the most useful AI interactions are:

- **Pull context before designing:** `@docs/product/prds/Employee_PRD.md` — "Summarize the key user flows for the add employee feature"
- **Check what's in scope:** `@azure-devops` — "List the acceptance criteria for stories in the Employee Hub epic"
- **Generate prototype scaffolding:** Reference a PRD and describe the flow you want — Cursor will generate an HTML prototype skeleton you can iterate on
- **Link your work back:** After building a prototype, ask Cursor to add a comment to the relevant ADO story with the prototype path

---

## 6. Keeping Personal and Team Workspaces in Sync

You can have both your personal workspace and the team workspace open simultaneously in Cursor by using **multiple windows** (File → New Window).

**General rule:** 
- Personal workspace = where you draft, experiment, and iterate
- Team workspace = where finished, team-ready artifacts live

When something in your personal workspace is ready for the team:
1. Copy the file into the appropriate team workspace folder
2. Update the prototype `README.md` if you are adding or updating a prototype
3. If the artifact was pushed to ADO, no additional sync is needed — ADO is the source of truth for backlog items

There is no automated sync between personal and team workspaces — this is intentional. The deliberate copy step is your quality gate.

---

## 7. Quick-Start Checklist

Use this checklist the first time you set up the team workspace.

- [ ] Cursor installed and launched
- [ ] Node.js installed via nvm-windows, `node --version` returns a version number
- [ ] Team workspace folder (`_Lista-Team`) opened in Cursor via File → Open Folder
- [ ] ADO MCP server shows a green dot in Cursor Settings
- [ ] Authenticated to ADO (triggered automatically on first ADO command)
- [ ] Confirmed you can see `docs/`, `prototypes/`, and `.cursor/` in the Explorer panel
- [ ] Read the `README.md` at the workspace root

---

## 8. Getting Help

| Issue | Who to Ask |
|-------|-----------|
| Cursor installation or Node.js issues | Engineering team (quick assist) |
| ADO connection (red dot, 401 errors) | See `workflow-guide.md` Section 6, or ask PM lead |
| Questions about what folder to use | PM lead |
| Questions about prototype conventions | Designer lead |
| AI command not producing expected output | Refine your `@` context references and retry; ask PM lead if still stuck |
