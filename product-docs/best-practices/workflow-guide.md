# Workflow Guide: AI-Enhanced Product Management with Cursor & Azure DevOps

**Target Audience:** Product Managers (Aaron) & Engineering Leads
**Last Updated:** Feb 18, 2026
**Status:** Live

---

## 1. Executive Summary

We have enabled a new workflow for Product Management that leverages **Cursor** (AI Editor) and the **Model Context Protocol (MCP)** to interact directly with **Azure DevOps (ADO)**.

### What is Cursor?

Cursor is an AI-powered code and text editor that allows you to write, edit, and generate content using natural language commands. You do not need to be a developer to use it. For Product Managers, it serves as a single workspace where you can draft documentation, query your project's codebase, and interact with tools like Azure DevOps — all without switching between multiple applications.

### Why use Cursor beyond ADO automation?

While the most immediate benefit is eliminating manual copy-paste steps between tools, Cursor provides a broader strategic advantage: it gives PMs a persistent, local workspace where AI assistance is embedded directly into your everyday writing and planning process.

Instead of opening a browser-based AI tool*, copying output, reformatting it, and pasting it into ADO, you stay in one place. Cursor also allows you to provide richer context to the AI — such as referencing prior specs, existing work items, and codebase details simultaneously — producing higher-quality, more consistent outputs than isolated chat tools can offer.

> *The Gemini Gem apps used in the previous workflow are browser-based and do not support MCP, meaning they cannot communicate directly with ADO — making the copy-paste step unavoidable in that workflow.*

Notably, we have converted the instructions from the Gemini Gem apps (created by McKinsey) into direct Cursor commands. This eliminates the need for PMs to manually copy and paste output from the Gem into a document, and then subsequently copy and paste it into ADO.

Additionally, this approach empowers PMs to easily update and iterate on these commands since they are stored locally. There is also a roadmap plan to host these in a shared GitHub repository, enabling all Product Managers to collaborate on and share a unified library of commands.

### This setup allows the PM to:

1. **Draft Documentation:** Generate comprehensive PRDs, prototypes, epics, and stories using your own existing documents and files (prior PRDs, meeting notes, existing specs or requirements, etc.) alongside AI, replacing the disconnected Gem workflow. Rather than opening a separate AI tool, writing a prompt, copying the result, and then pasting it into a document, you stay entirely within Cursor. You can reference prior specs, meeting notes, or any local file as context using `@filename`, and the AI will generate structured, consistent documentation on demand.

2. **Pull Context:** Chat with the codebase and existing ADO work items to ensure technical feasibility. This means you can ask questions like *"does this feature conflict with how the current system works?"* or *"what stories already exist for this initiative?"* and get answers grounded in real project data — without needing to hunt through ADO manually or wait on an engineer to respond.

3. **Push Updates:** Create User Stories, Features, and Bugs in ADO directly from the text editor without navigating the web UI.

---

## 2. The Tech Stack

| Tool | Role | Function |
|------|------|----------|
| Cursor | AI Interface | The primary workspace. Uses Composer (`Ctrl+I`) and Chat (`Ctrl+L`) to generate text. |
| Azure DevOps MCP | Connector | A local server that translates Cursor's AI requests into ADO API calls. |
| ADO OAuth | Security | Authentication is handled via standard OAuth (no PATs required). |

---

## 3. Setup & Configuration

There are three things to get set up before you can use this workflow: installing Cursor, installing Node.js (a behind-the-scenes requirement), and dropping in a small configuration file that connects Cursor to Azure DevOps. Each step is covered below with full detail.

---

### Step 1: Install Cursor

Cursor is the application you will do all of your work in. Think of it like installing Microsoft Word — you download it once and then open it like any other program.

1. Open a browser and go to **[cursor.com](https://www.cursor.com)**
2. Click **Download** — it will detect that you are on Windows and offer the correct installer
3. Run the downloaded `.exe` file and follow the prompts to install
4. When installation is complete, launch Cursor from the Start menu or desktop shortcut

> **What you will see:** Cursor looks similar to a code editor (it is built on VS Code), but you do not need to write any code. Think of the left panel as your file explorer and the main area as your document workspace.

---

### Step 2: Install Node.js (Required Background Component)

Node.js is not something you will interact with directly — it is a behind-the-scenes requirement that allows the ADO connector (MCP) to run on your machine. The easiest way to install it on Windows is through a tool called **nvm-windows**, which manages Node versions for you.

**2a. Install nvm-windows**

1. Go to [github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2. Under the latest release, click **`nvm-setup.exe`** to download it
3. Run the installer and follow the prompts — default options are fine
4. **Reboot your machine** after installation completes (this is required for nvm to work correctly)

**2b. Install Node.js via nvm**

1. After rebooting, open **PowerShell** (press `Windows key`, type `PowerShell`, hit Enter)
2. Run the following command and press Enter:
   ```
   nvm install lts
   ```
3. Once it finishes installing, run:
   ```
   nvm use lts
   ```
4. Verify it worked by running:
   ```
   node --version
   ```
   You should see a version number like `v22.x.x`. If you do, Node.js is installed correctly.

> **If you see an error:** Make sure you rebooted after installing nvm-windows. If the issue persists, reach out to the Engineering team for a quick assist.

---

### Step 3: Find Your ADO Organization URL

You will need this in the configuration file in Step 5.

1. Open a browser and go to [dev.azure.com](https://dev.azure.com)
2. Sign in with your work credentials if prompted
3. Your Organization URL is displayed in the browser address bar — it follows the format:
   ```
   https://dev.azure.com/YourOrgName
   ```
   For Viewpoint, this is `https://dev.azure.com/ViewpointVSO`

---

### Step 4: Authentication

No additional setup is needed for authentication. This workflow uses **OAuth** — the same standard sign-in method used by most Microsoft tools — so there are no passwords or tokens to generate or manage.

When you use an ADO-connected command for the first time in a Cursor session, a browser window will open and prompt you to sign in with your work account. Once signed in, the connection stays active for that session. If you see a `"401 Unauthorized"` error later, it just means your session expired — see Section 6 (Troubleshooting) for the fix.

---

### Step 5: Configure Cursor to Connect to ADO

This step adds a small configuration file to your project that tells Cursor how to connect to Azure DevOps. You only need to do this once per project.

**5a. Open your project folder in Cursor**

1. Launch Cursor
2. Go to **File → Open Folder**
3. Navigate to and select the folder where your project files live (e.g., your `_Lista` project folder)
4. The folder contents will appear in the left-hand Explorer panel

**5b. Create the `.cursor` folder**

1. In the Explorer panel, right-click on the top-level folder name (the root of your project)
2. Select **New Folder**
3. Name it exactly: `.cursor` (including the dot at the start)
4. Press Enter

> **Note:** On Windows, folders starting with a `.` are hidden by default in File Explorer, but Cursor will display them normally.

**5c. Create the `mcp.json` file**

1. Click on the `.cursor` folder you just created to select it
2. Right-click and select **New File**
3. Name it exactly: `mcp.json`
4. Press Enter — the file will open in the main editing area

**5d. Paste the configuration**

Click inside the empty `mcp.json` file and paste the following:

```json
{
  "mcpServers": {
    "ado": {
      "command": "npx",
      "args": [
        "-y",
        "@azure-devops/mcp",
        "ViewpointVSO",
        "-d",
        "core",
        "search",
        "work",
        "work-items"
      ]
    }
  }
}
```

> **Note:** `ViewpointVSO` is the Viewpoint organization name in ADO. Do not change this value unless directed by the Engineering team.

Save the file with `Ctrl+S`.

**5e. Restart Cursor and verify the connection**

1. Close and reopen Cursor
2. Go to **Settings** (gear icon, bottom-left) → search for **MCP** or navigate to the MCP section
3. You should see an `ado` entry with a **green dot** indicating the server is active

> **If you see a red dot or no entry:** Hit the **Refresh** button next to the server entry. If it still does not connect, confirm that Node.js is installed correctly (Step 2) and that `mcp.json` is saved in the `.cursor` folder at the root of your open project.

---

## 4. Daily Workflow Scenarios

### Scenario A: Drafting a PRD

**Goal:** Write a detailed spec for a new "Reporting Dashboard" feature using the full context of your discovery work.

**Before you start — gather your inputs:**
The PRD command is most effective when you provide it with relevant context from your discovery phase. Based on the AI-PDLC process, the key inputs are:
- **MRD** — market requirements document (if available)
- **User research & insights** — interview synthesis, customer feedback, support tickets
- **Prioritized ideas/hypotheses** — from your idea tracker or discovery sessions
- **User journey map** — if available
- **Additional context** — ideation/design sprint outputs, starting feature list, high-level wireframes

Add these files to your project folder and reference them using `@filename` in your prompt.

**Steps:**
1. Open Cursor Composer (`Ctrl+I`)
2. Reference your input files: e.g. `@mrd.md @user-research.md @journey-map.md`
3. Type `/prd-draft` and hit Enter
4. Behind the scenes: The command structures your inputs into a standardized PRD draft covering initiative definition, personas & use cases, functional requirements, user workflows, delivery plan, and risks/dependencies
5. Refine: Iterate within Cursor until the PRD is solid
6. **Save:** Ask Cursor to save the document to your project — e.g.: *"Save this PRD as `docs/prd-reporting-dashboard.md`"* — Cursor will write the file directly into your project folder, making it available to reference with `@` in future sessions

**Output:** A structured PRD draft including:
- Initiative overview, problem statement, goals, and success metrics
- Personas, high-level use cases, and acceptance criteria
- Functional & non-functional requirements and user workflows
- Release plan, risks, dependencies, and assumptions

---

### Scenario B: Creating a Set of Epics

**Goal:** Transform your PRD into a coherent, outcome-oriented set of product epics that can be handed off to Engineering for sprint planning — without opening the browser.

**Before you start — gather your inputs:**
The epic command produces the best results when grounded in your full discovery and planning context. Based on the AI-PDLC process, the key inputs are:
- **PRD** — the primary source of truth for goals, personas, and requirements (`@prd.md`)
- **User insights synthesis** — interview findings, customer feedback, and research summaries
- **User journey map** — to ensure epics are journey-centric rather than system-centric
- **Prototype screenshots or screen recordings** — if available, these sharpen epic scope and acceptance criteria themes
- **KPIs / OKRs / business targets** — so each epic can be traced to a measurable business outcome
- **Architecture notes or constraints** — to flag technical boundaries and dependencies upfront

Add these files to your project folder and reference them using `@filename` in your prompt.

**Steps:**
1. Open Cursor Composer (`Ctrl+I`)
2. Reference your input files: e.g. `@prd.md @user-insights.md @journey-map.md`
3. Type `/epic-draft.  save this as docs/documentation/features/Pay Stubs Deliverables Feeatures.md and create the features in ADO under epic XXX` and hit Enter
4. Behind the scenes: The command reads your inputs, clusters requirements into value chunks, maps them to user journeys, and generates a structured Epic Set — typically 5–12 epics for a substantial product scope
5. **Review & refine** *(Human-in-the-Loop checkpoint):* The output includes an Epic Set Overview (numbered list with one-sentence summaries) followed by full detail for each epic. Review for scope, boundaries, and traceability. Iterate with follow-up prompts to split, merge, or adjust any epics before proceeding
6. **Save:** Ask Cursor to save the epic set — e.g.: *"Save this as `docs/epics-reporting-dashboard.md`"* — making it available to reference with `@` when generating stories in Scenario C
7. **Push to ADO:** Once satisfied, explicitly instruct Cursor to create the epics — e.g.: *"Create these epics in ADO under the Reporting Dashboard initiative in the Product\Reporting area path."* The MCP will handle the API calls and confirm each Work Item ID created (e.g., *Created Epic #1234*)

**Output:** A full Epic Set including, for each epic:
- Epic ID & title, goal/outcome, and primary personas
- Business & PRD drivers with requirement traceability
- In-scope capabilities and explicit out-of-scope boundaries
- High-level "super stories" and acceptance criteria themes
- Dependencies, risks, success metrics/KPIs, and assumptions
- A traceability table mapping key requirements to epics

---

### Scenario C: Creating User Stories from an Epic

**Goal:** Break down a specific epic from your PRD into actionable ADO tickets — without opening the browser.

**Before you start — gather your inputs:**
- **PRD** — the source of truth for requirements and context (`@prd.md`)
- **Systems architecture** — for understanding technical constraints (ask an Engineering Lead to share the relevant doc)
- **Specific epic** — identify which epic you want to decompose into stories
- **Prototype or wireframes** — if available, reference them for UI/UX context
- **Codebase** — Cursor can reference the actual codebase to understand file structures and locate relevant modules

**Steps:**
1. Open Cursor Composer (`Ctrl+I`)
2. Reference your inputs: e.g. `@prd.md @architecture.md`
3. Type `/user-story-design` and hit Enter — this generates a Story Overview Table with story titles, one-sentence summaries, priority, and effort sizing
4. **Review & approve** *(Human-in-the-Loop checkpoint #1):* Confirm the story list is correct, adjust priorities or scope, and explicitly tell Cursor the list is approved before proceeding
5. Type `/user-story-expand` — this takes the approved list and generates full stories in the CMS template, including: user goal, acceptance criteria (Gherkin), constraints, dependencies, definition of ready/done, and out of scope
6. **Review expanded stories** *(Human-in-the-Loop checkpoint #2):* Read through each expanded story. Iterate with follow-up prompts to adjust any stories that need refinement
7. **Push to ADO:** Once satisfied, explicitly instruct Cursor to create the tickets — e.g.: *"Create these stories in ADO under the Reporting Dashboard epic in the Product\Reporting area path."* The MCP will handle the API calls and confirm each Work Item ID created (e.g., *Created User Story #1234*)

---

### Scenario D: Rapid Prototyping

**Goal:** Generate an interactive, clickable prototype from your PRD and design inputs to communicate product behavior to engineers and gather early customer feedback — without waiting for a designer.

**Before you start — gather your inputs:**
- **PRD** — the primary input (`@prd.md`)
- **User journey map** — to define flows and screen transitions (`@journey-map.md`)
- **Wireframes or preliminary sketches** — if available (`@wireframes.md` or image files)
- **User insights** — from iterative customer feedback loops
- **Code structure context** — reference the codebase so Cursor understands service boundaries and implementation constraints

**Steps:**
1. Open Cursor Composer (`Ctrl+I`)
2. Reference your inputs: e.g. `@prd.md @journey-map.md @wireframes.md`
3. Describe what you want: *"Generate a clickable prototype for the Reporting Dashboard feature based on these inputs. Include key UI/UX flows, state transitions, and user paths."*
4. Behind the scenes: Cursor uses your PRD and design inputs to generate front-end code representing the key screens, interactions, and user paths
5. Review the output and iterate with follow-up prompts to refine specific flows or states
6. **Save the prototype:** Ask Cursor to write the output to a dedicated folder — e.g.: *"Save this prototype to `prototypes/reporting-dashboard/`"* — Cursor will create the necessary files in your project, making the prototype available to reference with `@` in future sessions (e.g., as an input to the Story Agent in Scenario C)

**Sharing with stakeholders:**
- **Engineering:** Share the prototype folder directly (e.g., via Teams or email as a zip, or by committing it to the shared GitHub repository when available). Engineers can open the files locally in a browser for an implementation-ready reference, or import them into their development environment
- **Design review:** Reference the saved prototype files in your next Cursor session to iterate further — e.g.: *"@prototypes/reporting-dashboard — update the dashboard flow based on this feedback..."*
- **Broader stakeholders / customers:** Run the prototype locally and use a screen-sharing tool (Teams, Zoom) to walk stakeholders through the flows in real time, or record a short walkthrough video to share asynchronously
- **Future sessions:** Because the prototype is saved in your project folder, it can be pulled into any future Cursor prompt using `@prototypes/reporting-dashboard` — making it a living reference that feeds back into PRD refinement, story generation, or design iteration

**Output:** An interactive prototype containing:
- Front-end UI/UX flows and interactions
- Key states, transitions, and user paths
- An engineering-ready reference for implementation planning
- A reusable project asset stored locally and committable to the shared GitHub repository

---

### Scenario E: Checking Status & Blockers

**Goal:** Quick status check before a stakeholder meeting.

1. Open Chat (`Ctrl+L`)
2. Type `/ado-bugs`
3. Behind the scenes: This triggers the query: *"@azure-devops list all active bugs in the current iteration..."*
4. **Result:** You get a clean summary table of active bugs instantly

---

## 5. Tips for Aaron

- **@ Mentions are Key:** Always use `@azure-devops` in the chat to explicitly invoke the tool.
- **Context is King:** You can reference local files (like previous PRDs) AND live ADO items in the same prompt.
  - Example: *"Compare the requirements in @old_spec.md with the acceptance criteria in ADO Work Item #5501."*
- **Dry Runs:** If you are nervous about creating tickets, ask the AI to *"Draft the JSON payload for the tickets you would create"* first, approve it, and then say *"Go ahead and create them."*

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| "Tool not found" | Ensure the MCP server is green in Settings. Hitting "Refresh" usually fixes this. |
| "401 Unauthorized" | Your OAuth session may have expired. Try refreshing the MCP server or re-authenticating via the prompt. |
| "Project not found" | Ensure your ADO URL includes the project name if your org structure requires it, or specify the project name in your prompt. |
