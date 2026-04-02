# Triad AI-PDLC Playbook
## How PM, UX, and Engineering Work Together Using AI as the Accelerant

**Product:** Prism Construction Payroll (Lista)
**Last Updated:** March 17, 2026 (rev. 2)
**Audience:** Internal team, adjacent teams evaluating this model
**Status:** Living document — iterate as the process evolves

---

## The Problem We Solved

The PM–UX–Engineering triad is supposed to be the most productive unit in product development. In practice, it is often the slowest. Requirements live in one tool, designs in another, code in a third. Handoffs between roles are lossy. Specs go stale the moment they are written. Engineers rebuild what designers already sketched. Designers polish things that engineers will re-implement anyway. Everyone is in too many meetings trying to compensate for artifacts that don't talk to each other.

We built a different model for the Lista team. It is faster, tighter, and more honest about where AI can carry load versus where human judgment is irreplaceable.

---

## What We Do Differently

**We use one repository as the center of gravity.** Requirements, design documentation, prototypes, and process guides all live in the same GitHub repo. Nothing lives in a wiki that can drift. Nothing is emailed. When the repo moves, everything moves.

**We prototype before we polish.** The PM generates a rough, functional prototype in Cursor before UX begins hi-fi design work. This makes the feature's flow concrete immediately — exposing gaps in the requirements, grounding ADO story creation, and giving UX something real to react to rather than a blank canvas. Iteration starts on day one, not after the design is "done."

**The iteration loop is tight and role-specific.** Viability — the design and validation phase — runs as a fast PM + UX cycle. The front end engineer is not in the daily back-and-forth. They get a single feasibility checkpoint, then step back in when a validated prototype merges to `main` and the build pipeline activates.

**Cursor connects all the tools.** ADO (work items), Figma (design), and GitHub (code and docs) all feed into Cursor. AI agents can read a user story, interpret a design reference, scaffold a React component, and write acceptance criteria — without switching applications. The triad works in their primary tools; Cursor handles the translation between them.

**The prototype is the handoff.** Because prototypes are built in the production tech stack from day one (React + Modus 2 design system), the gap between "design done" and "buildable" is small. When the design branch merges to `main`, an agentic pipeline activates — automatically mapping prototype components to ADO stories, generating test scaffolding, and giving the FE a running start rather than a blank file.

**AI handles the boilerplate; humans make the decisions.** Story generation, acceptance criteria drafting, prototype scaffolding, spec documentation — AI produces first drafts of all of it. The triad's time goes to reviewing, validating, and deciding — not to mechanical generation.

---

## The Results

Compared to a traditional triad workflow:

- Features move from concept to working prototype in hours, not weeks
- ADO stories are grounded in validated prototype behavior, not aspirational descriptions
- The FE begins implementation with a working scaffold, not a Figma file and a conversation
- There is no separate spec document to maintain — the prototype plus ADO acceptance criteria are the spec
- Every artifact is version-controlled, recoverable, and searchable

---

## What This Document Is

This playbook is the operational reference for how the Lista triad works. It documents the three phases — Discovery, Viability, and Build & Test — with enough detail that the team can execute against it and other teams can evaluate whether the model fits their context.

This is not a rigid process. It is a set of shared patterns that reduce coordination overhead, keep artifacts close to the work, and let AI handle the scaffolding so humans can focus on the decisions.

---

## The Core Idea: Cursor as the Hub

The foundational shift in our workflow is treating **Cursor** as the single integration point across all our tools.

```
Azure DevOps (ADO)  ──┐
Figma               ──┼──▶  Cursor  ──▶  GitHub
GitHub              ──┘
```

Rather than bouncing between four tools and manually syncing context across them, Cursor becomes the place where product context (ADO), design context (Figma), and code (GitHub) converge. AI agents operating inside Cursor can read work items, interpret design files, scaffold code, and generate documentation — all from a single interface.

**Why this matters for the triad:** Each role still works in their primary tool, but handoffs between roles happen through a shared repository, not through meetings or copy-paste. Cursor bridges the gap.

---

## The Three Phases

Our process follows a McKinsey AI-PDLC-inspired model adapted for our triad context. The phases operate at different levels of granularity: project, feature, and story.

```
┌─────────────────────────┐         ┌─────────────────────────┐         ┌──────────────────────────┐
│   DISCOVERY             │ SELECT  │   VIABILITY             │ MERGE   │   BUILD & TEST           │
│   Project Level         │──FEAT──▶│   Feature Level         │──TO───▶ │   Feature & Story Level  │
│                         │         │                         │  MAIN   │                          │
└─────────────────────────┘         └─────────────────────────┘         └──────────────────────────┘
```

### A Note on Terminology

The McKinsey AI-PDLC model and ADO use different words for the same levels of work. Here is how they map:

| McKinsey Level | ADO Work Item | What It Means |
|---|---|---|
| Project | Initiative / Epic | Bounded area of product capability |
| Feature | **Feature** (child of Epic) | Specific deliverable within an epic |
| Story | User Story (child of Feature) | Single implementable unit of work |

Viability primarily operates at the **ADO Feature level**. In some cases — particularly when related features are tightly coupled — the iteration loop may expand to encompass the full **ADO Epic level** before narrowing back to individual features for Build & Test.

---

## Gates and Deliverables at a Glance

Every phase transition in this model is governed by an explicit gate — a condition that must be true before the next phase can begin — and produces named deliverables that the receiving role or system depends on. This table is the authoritative quick reference.

| Phase | Gate In | Key Deliverables | Gate Out |
|---|---|---|---|
| **Discovery** | Decision to build | Bounded epic set in ADO; `Lista-Backlog-Definition.md` on GitHub; user journey maps | ADO Epic + at least one Feature defined; backlog doc committed |
| **Viability — PM Bootstrap** | ADO Feature defined | Sloppy prototype on `design/` branch; initial ADO story drafts | UX has something concrete to react to |
| **Viability — PM + UX Iteration** | Sloppy prototype exists | Figma hi-fi frames; refined prototype; ADO stories with acceptance criteria | Internal + user validation complete; design review checklist signed off |
| **→ Build & Test** | Design review checklist complete | **Validated prototype merged to `main`**; ADO Feature set to "In Review"; all stories have AC | GitHub Action triggers; ingestion pipeline activates |
| **Ingestion Pipeline** *(automated)* | Prototype files changed on `main` | **UI Story on ADO board** per changed prototype — with screenshots, component hierarchy, interactive elements, source link, and route | UI Story visible on ADO board; FE picks it up via Lista Beads |
| **Build & Test — Story** | FE pulls UI Story into bead | Implemented story in `prism-ui-react-payroll`; PM acceptance | ADO user story marked `Closed` |
| **Build & Test — Feature** | All stories `Closed` | Lint clean; UX visual QA sign-off; PM has accepted all stories | Feature PR merged to production MFE |

**Two deliverables to call out specifically:**

> **Design delivery:** When PM + UX merge the `design/[feature-name]` branch to `main`, that merge *is* the design deliverable. It is not a document, a presentation, or a Figma handoff — it is a validated, working prototype in the production tech stack, with ADO stories and acceptance criteria ready for engineering. The merge is the signal.

> **Pipeline delivery:** The ingestion pipeline's output is a **UI Story on the ADO board**, automatically created and tagged (`proto-ingested`, `slug:[name]`). It carries everything the FE needs to begin integration: rendered screenshots of every screen and wizard step, a parsed component hierarchy with props, a typed list of interactive elements, a direct link to the source at the triggering commit, and the resolved application route. The PM or FE links the UI Story to its parent ADO Feature after it appears — the pipeline creates the story in the right area and iteration, but the Feature linkage is a manual step that completes the ADO hierarchy connection.

---

## Phase 1 — Discovery (Project Level)

> **Who leads:** PM (with UX input on research and journey mapping)
> **Primary tools:** ADO, Miro, GitHub (docs), Cursor (AI synthesis)
> **Gate in:** Decision to build
> **Gate out:** ADO Epic + at least one Feature defined; `Lista-Backlog-Definition.md` committed to GitHub
> **Key deliverables:** Bounded epic set in ADO; backlog definition doc; user journey maps

### What Happens Here

Discovery is where we move from open-ended questions to a shaped backlog. It runs at the **project level** — we are not designing individual features yet, we are defining what the product needs to do and in what order.

#### Foundational Discovery

| Activity | Owner | Where |
|---|---|---|
| User insight synthesis | PM + UX | Research docs in `product-docs/` |
| Competitor research | PM | Research docs |
| SMB / domain research | PM + SMEs | Research docs |
| Market Requirements Document (MRD) | PM | `product-docs/` |

**AI role here:** Cursor accelerates synthesis. Given interview notes, competitive analysis, and domain research as inputs, an AI agent can draft the MRD, extract recurring themes, and identify gaps. PM reviews and owns the output — AI generates the scaffolding.

#### Discovery to Backlog

| Activity | Owner | Where |
|---|---|---|
| User Journey Mapping | UX + PM | Miro board |
| Initiative identification (TBDs) | PM | ADO |
| Epic/Feature definition | PM | ADO + `product-docs/backlog/` |
| User Story Design + Expand | PM + UX | ADO |
| Stack / technology selection | FE + PM | Architecture docs |

---

> **Deliverable — Discovery Complete**
>
> | Artifact | Where | What It Contains |
> |---|---|---|
> | Bounded epic set | ADO project `Lista` | Each epic has a goal statement, feature area list, and Alpha/Beta/GA milestone phasing |
> | Backlog definition doc | `product-docs/backlog/Lista-Backlog-Definition.md` on GitHub | Authoritative written record of in-scope epics; linked from ADO |
> | Milestone summary | `product-docs/backlog/Milestone-Stakeholder-Summary.md` | Plain-language milestone scope for stakeholder communication |
> | User journey maps | Miro board | Journey-level flows that inform Feature definition and story authoring |

### How We Know Discovery Is Done

- Every epic in the backlog has a clear goal statement, feature area list, and milestone phasing
- The backlog document is committed to GitHub and linked from ADO
- No feature-level design work has started without a parent epic in ADO

---

## Phase 2 — Viability (Feature Level)

> **Who leads:** PM + UX (FE consulted on feasibility, not in the iteration loop)
> **Primary tools:** Figma, ADO, GitHub, Cursor
> **Gate in:** ADO Epic and Feature defined; backlog doc committed to GitHub
> **Gate out:** Validated prototype merged to `main`; all ADO stories under the Feature have acceptance criteria; design review checklist complete
> **Key deliverables:** Sloppy prototype; Figma hi-fi frames; refined prototype; ADO stories with AC; **prototype merged to `main`**

### What Happens Here

Viability is where we prove a feature is worth building — and how it should be built — before engineering effort scales up. It runs primarily at the **ADO Feature level**, and the iteration loop is a tight PM + UX cycle. FE is not in the daily back-and-forth; they are consulted on technical feasibility at key checkpoints and become the primary driver when the prototype merges to `main`.

In some cases, Viability is scoped across a full **ADO Epic** — particularly when features within an epic are tightly interdependent and need to be designed as a coherent whole before any individual feature is handed off.

#### Step 1 — Doc Setup

Before any design work starts, the PM sets up the documentation and tracking scaffold:

| Activity | Who | Where |
|---|---|---|
| Create ADO Feature (child of epic) | PM | ADO |
| Create GitHub branch: `design/[feature-name]` | PM | GitHub |
| Link ADO Feature to GitHub branch | PM | ADO + GitHub |
| Add feature folder to `product-docs/` | PM | GitHub |

**Convention:** Branch names follow `design/[epic-tag]-[feature-slug]`, e.g. `design/e1-company-setup-wizard`.

#### Step 2 — PM Sloppy Prototype + Initial Story Buildout

Before UX begins hi-fi design work, the PM uses Cursor to generate a quick, low-fidelity prototype — enough to make the flow tangible and to ground the ADO story buildout in something concrete.

| Activity | Who | Where |
|---|---|---|
| "Sloppy" rapid prototype (functional skeleton) | PM + Cursor | GitHub branch |
| ADO Feature story draft and expansion | PM + Cursor | ADO |
| Initial ADO story review | PM + UX | ADO |

**What "sloppy" means:** This is not a polished prototype. It is a clickable skeleton — real components from the Modus 2 design system, real screen sequences, but placeholder content and no visual polish. Its purpose is to externalize the PM's mental model of the flow so that UX has something to react to and push back on, rather than starting from a blank canvas. It also directly informs the ADO story structure — seeing the flow renders visible which steps need stories and which edge cases have been missed.

**AI role here:** Cursor reads the ADO Feature goal and any existing story drafts, then scaffolds a prototype based on the described flow. PM directs, reviews, and iterates. The output is intentionally rough — speed over fidelity.

> **Deliverable — PM Bootstrap Complete**
> - Sloppy prototype on `design/[feature-name]` branch (clickable skeleton, all happy-path screens)
> - Initial ADO user story drafts under the Feature (scope-visible, not yet AC-complete)
> - UX has been briefed and has the prototype branch to react to

#### Step 3 — UX Design + PM Iteration Loop

The primary Viability iteration is a tight PM + UX loop. FE is not part of the daily back-and-forth during this phase.

| Activity | Who | Where |
|---|---|---|
| Figma hi-fi frames (building on PM prototype) | UX | Figma |
| Prototype refinement based on Figma | PM + Cursor | GitHub branch |
| Scope review and story refinement | PM + UX | ADO |
| Interaction spec generation | PM + AI | ADO acceptance criteria |
| Repeat until flow is validated | PM + UX | — |

**The iteration dynamic:** UX owns the visual language and interaction design in Figma. PM owns the prototype and the ADO stories. The two surfaces inform each other in a fast cycle — Figma frames sharpen the prototype; prototype behavior reveals gaps in Figma. Neither waits for the other to be "done."

**Interaction specs in ADO:** Rather than writing specs in a separate document, AI generates interaction specifications directly from the user stories in ADO. Each story gets an acceptance criteria block that reflects the validated prototype behavior. The prototype *is* the spec — Figma is the visual reference.

**FE checkpoint:** At least once during this loop, FE is brought in to sanity-check implementation feasibility. This is a brief review — not a design session — focused on surfacing anything that would require a significant rethink before the prototype merges.

#### Step 4 — Validation (Two Stages)

| Stage | Audience | Method |
|---|---|---|
| Internal validation | PM + UX | Walk through live prototype on GitHub branch |
| User validation | Target users (PR Admins, owners) | Moderated prototype sessions using Figma or hosted prototype |

**Revision protocol:** Feedback from validation goes back into the prototype branch. The Figma file and ADO stories are updated to reflect any scope changes. Validation operates at the **ADO Feature level** by default — if a feature's validation surfaces issues that touch the broader epic flow, the loop may temporarily expand to evaluate adjacent features before re-narrowing.

#### Step 5 — Design Review and Merge Gate

Before the design branch can merge to `main` — the trigger for Build & Test — the following checklist must be complete:

- [ ] Prototype matches all ADO stories for the feature
- [ ] All edge cases and error states are represented in the prototype
- [ ] Interaction specs are written in ADO acceptance criteria for every story
- [ ] PM has signed off on scope (nothing added mid-viability without a new story)
- [ ] FE has confirmed implementation approach is feasible
- [ ] ADO Feature is updated to "In Review" state
- [ ] UX has approved the prototype as representative of the intended design

**The merge to `main` is the gate.** It is not a soft checkpoint — it is the explicit trigger that hands the feature from the PM + UX iteration loop to the FE-led Build & Test pipeline. Nothing enters the agentic pipeline until this merge occurs.

**ADO as the running thread:** Throughout Viability, ADO stories are being created, refined, and linked to prototype work. ADO is the single source of truth for what is in scope — Figma and GitHub are delivery surfaces.

> **Deliverable — Design Delivery (Viability Complete)**
>
> The merge of `design/[feature-name]` to `main` is the design team's formal delivery. At the moment of merge, the following must all be true:
>
> | Deliverable | Location | State at Merge |
> |---|---|---|
> | Validated prototype | `src/pages/[feature-slug]/` on `main` | All screens and wizard steps present; pipeline-convention-compliant (named, routed) |
> | ADO Feature | ADO project `Lista` | State: "In Review"; linked to parent Epic |
> | ADO user stories | Under the ADO Feature | Every story has acceptance criteria derived from the prototype |
> | Figma file | Figma | Final validated design; approved by UX |
> | Design review checklist | Step 5 above | All items checked and signed off |
>
> This is not a Figma export. It is not a handoff document. It is a working prototype in the production tech stack, with the ADO story structure and acceptance criteria ready for the FE to begin integration.

### How We Know Viability Is Done

- The prototype is merged to `main`
- Every story in the ADO Feature has acceptance criteria derived from the prototype
- The design review checklist is complete and signed off
- Figma file reflects the final validated design
- FE has been briefed and has no open feasibility blockers

---

## Phase 3 — Build & Test (Feature and Story Level)

> **Who leads:** FE (with PM validating acceptance, UX validating fidelity)
> **Primary tools:** GitHub, ADO, Cursor, Lista Beads (`bd` tooling), QA tooling
> **Gate in:** Validated prototype merged to `main`; GitHub Action triggers automatically
> **Gate out:** All ADO user stories `Closed`; lint clean; UX sign-off; feature PR merged to `prism-ui-react-payroll`
> **Key deliverables:** UI Story on ADO board (pipeline); implemented feature in production MFE (FE)

### What Happens Here

Build & Test is where the validated prototype becomes production code in the Prism payroll MFE (`prism-ui-react-payroll`). This phase operates at the **ADO story level** — individual user stories move through a defined ingest-integrate-test sequence. The FE is now the primary driver; PM and UX shift to review and acceptance roles.

The key structural difference from a traditional engineering handoff: **the pipeline does the translation work automatically.** The FE is not rebuilding from a Figma file or a conversation — they are integrating a prototype whose components, screenshots, and interactions have already been extracted and attached to an ADO story before they touch a line of code.

---

#### The Gate: Prototype Merged to `main`

Build & Test begins the moment the `design/[feature-name]` branch is merged to `main`. This merge is not just a code event — it is the explicit signal that Viability is complete and the automated ingestion pipeline can activate.

```
design/[feature-name]  ──PR + Design Review Checklist Complete──▶  main
                                                                      │
                                                             GitHub Action triggers
                                                         (src/pages/** changed on main)
                                                                      │
                                                                      ▼
                                                         Ingestion Pipeline Runs
                                                                      │
                                                                      ▼
                                                       UI Story created on ADO board
                                                                      │
                                                                      ▼
                                                    FE pulls story into bead via bd tooling
                                                                      │
                                                                      ▼
                                                  Integration into prism-ui-react-payroll
```

**Zero designer friction.** The PM and UX team do not move files, write metadata, or manage versions. They build and merge — the pipeline does the rest.

---

#### Prototype Conventions: Building Pipeline-Compatible Prototypes

The pipeline requires no authored metadata and has no separate folder to manage — but it does rely on consistent file and folder conventions to derive prototype identity, routes, and display names automatically. **PM and UX need to follow these conventions when building prototypes.** Cursor rules enforce them in the editor automatically, so in practice this is guardrail-driven rather than memory-driven.

**Two page patterns, one rule: everything lives in `src/pages/`**

| Pattern | When to Use | Example |
|---|---|---|
| **Single-file page** | Simple screens with no sub-components | `src/pages/DashboardPage.tsx` |
| **Folder-based page** | Multi-step flows, wizards, screens with sub-components | `src/pages/payroll-setup/` |

For single-file pages, the `Page` suffix is stripped for the display name (`DashboardPage.tsx` → "Dashboard"). For folder-based pages, the folder name is the slug directly (`payroll-setup` → "Payroll Setup").

**Wizard and multi-step flow structure**

Wizard prototypes follow a specific folder layout that the pipeline understands as a single prototype slug:

```
src/pages/payroll-setup/
  PayrollSetupPage.tsx       ← main entry component, routed in App.tsx
  steps/                     ← individual step components
    CompanyProfileStep.tsx
    FederalTaxStep.tsx
    ReviewStep.tsx
  components/                ← shared wizard chrome (optional)
    WizardFooter.tsx
    WizardProgressRail.tsx
  hooks/                     ← wizard-specific hooks (optional)
  types/                     ← wizard-specific types (optional)
```

Any change to any file in the folder triggers re-ingestion of the full wizard prototype. The pipeline captures each step individually — the screenshot agent clicks through "Next" / "Continue" buttons and uses visible progress indicators to confirm all steps are visited.

**Every page needs a route in `App.tsx`**

The pipeline derives each prototype's URL by parsing `App.tsx` import statements and `<Route>` elements. If a page exists in `src/pages/` but has no corresponding route, the pipeline skips screenshot capture for that page (metadata extraction still runs, but without screenshots).

A `lint:routes` CI check — part of `npm run lint:all` — catches this automatically before the pipeline runs. If it fails, you'll see output like:

```
Route validation failed:
src/pages/payroll-settings/ -- no route found in App.tsx
Add a route in src/App.tsx or remove the unused page.
```

The pipeline also runs this check as its first step, so a missing route never silently degrades a run — it surfaces before ingestion begins.

**Cursor rules that enforce all of this**

Three always-applied Cursor rules in `.cursor/rules/` guide prototype structure in the editor:
- `page-structure-convention` — single-file vs. folder-based page patterns
- `wizard-structure-convention` — `steps/`, `components/`, `hooks/`, `types/` layout for multi-step flows
- `page-naming-convention` — `PascalCase` with `Page` suffix for files, `kebab-case` for folders

These activate automatically when working in `src/pages/` — no checklist to remember.

**Excluding a prototype from ingestion**

Slugs can be excluded from the pipeline via `.github/config/prototype-ingestion.json`. Use this for in-progress pages that aren't ready for engineering consideration, or for reference/demo pages that shouldn't generate UI Stories:

```json
{ "exclude": ["not-found-page", "dev-*"] }
```

---

#### Phase 3a — Ingestion (Automated)

When files under `src/pages/` change on `main`, a GitHub Action triggers automatically. The pipeline runs in five phases — CI checks, change detection, agentic extraction, ADO integration, and workflow summary — and for each changed prototype, two separate AI agents run in parallel: one drives a headless Playwright browser to capture screenshots, another reads source files to extract the component hierarchy. Separating these concerns means a screenshot failure doesn't block metadata extraction, and each can retry independently.

The pipeline extracts four categories of structured metadata per prototype:

| What Gets Extracted | How | Result in ADO |
|---|---|---|
| **Screenshots** | GitHub Copilot CLI agent with Playwright MCP — renders the prototype at 1440×900, clicks through wizard steps, captures each screen | Image attachments on the UI Story |
| **Component Hierarchy** | Copilot agent reads source files and follows imports — produces a recursive JSON tree of all Modus and custom components with their props | Component tree attached to UI Story |
| **Page / Feature Name** | Derived from the file or folder name in `src/pages/` — no manual tagging required | Story title and description |
| **Interactive Elements** | Agent identifies all buttons, forms, inputs, and navigation with their types, labels, and positions | Typed list attached to UI Story |

The pipeline then creates a **UI Story** on the ADO board. A UI Story is a distinct ADO work item — separate from the product user stories authored by PM — that represents a unit of design work ready for engineering consideration. It carries all extracted metadata, screenshots (as ADO attachments), a direct link to the source file on GitHub at the triggering commit SHA, and the resolved route.

**What a UI Story gives the FE that a Figma file doesn't:** The component hierarchy is already parsed and structured. The screenshots show the actual rendered prototype — not a design approximation. The interactive elements are typed and labeled with their positions. The source link goes directly to the exact commit that was ingested.

> **Deliverable — Pipeline Output (UI Story)**
>
> For each prototype page changed on `main`, the pipeline creates one UI Story on the ADO board. Its contents:
>
> | Element | Content |
> |---|---|
> | **Title** | `Prototype: [Feature Name]` (e.g., "Prototype: Payroll Setup") — versioned as `(v2)`, `(v3)` on subsequent merges |
> | **Tags** | `proto-ingested` (filters automated vs. manual stories); `slug:[slug-name]` (enables WIQL queries and idempotency) |
> | **Screenshots** | Rendered captures of every screen and wizard step, attached as images |
> | **Component hierarchy** | Recursive tree of all Modus and custom components with props (see example below) |
> | **Interactive elements** | Typed list of all buttons, inputs, forms, and navigation with labels and positions |
> | **Source link** | Direct GitHub URL to the prototype source at the exact triggering commit |
> | **Route** | The resolved application route (e.g., `/payroll/setup`) |
> | **Previous version link** | ADO relation to the prior UI Story (v2+ only) |
>
> **After the UI Story appears, PM or FE links it to its parent ADO Feature.** The pipeline creates the story in the correct ADO area and iteration (`Lista`), but the Feature-level parent link is a manual step — typically done by the FE when they pull the story into a bead, or by the PM when they see it on the board. This completes the ADO hierarchy: Epic → Feature → UI Story.

To make this concrete, here is what the component hierarchy looks like for a payroll setup wizard:

```json
{
  "name": "PayrollSetupPage",
  "children": [
    {
      "name": "ModusStepper",
      "children": [
        {
          "name": "CompanyProfileStep",
          "children": [
            { "name": "ModusTextInput", "props": { "label": "Company Name" } },
            { "name": "ModusTextInput", "props": { "label": "EIN" } }
          ]
        }
      ]
    }
  ]
}
```

The FE receives this tree before touching a line of code — knowing exactly which Modus components were used, how they're composed, and what props they carry. This is the context that makes integration fast.

**Pipeline reliability behaviors the team should know:**

- **Idempotency:** The pipeline embeds the triggering commit SHA in each UI Story. If the workflow is re-run (e.g., manually triggered after a transient failure), it checks for an existing story with that SHA and skips duplicates automatically.
- **Concurrency:** If two pushes land in quick succession, the earlier pipeline run is cancelled in favor of the newer one. The ADO board always reflects the most recent merged state.
- **Error handling:** A failure on one prototype (unresolvable route, screenshot error, metadata extraction exhausting retries) is logged and skipped. The pipeline continues processing remaining prototypes. The workflow only hard-fails on critical infrastructure errors — the dev server failing to start, or ADO authentication failing entirely.
- **Metadata validation and retry:** AI-extracted metadata is validated against a strict schema. If the agent output is malformed, the pipeline automatically retries with error feedback injected into the prompt — up to two retries before logging a failure and moving on.
- **Manual trigger:** The pipeline supports manual re-runs via GitHub Actions `workflow_dispatch`. You can specify a comma-separated list of prototype slugs to process (e.g., `employees,payroll-setup`) without waiting for a merge, or leave it empty to re-process the last commit's changes.
- **Workflow summary:** After every run, GitHub posts a summary to the Actions tab — total prototypes detected, counts of created / skipped / errored, a per-prototype table with status, version, and ADO link, and an error details section if any failures occurred. PM and UX can check this to confirm their merge was picked up correctly.

---

#### Phase 3b — Integration (FE-Led)

The FE sees the UI Story appear on the ADO board. Using the **Lista Beads extension** (available in both VS Code and Cursor), they pull the story into beads directly from their IDE — no context-switching to a browser required.

The bead carries all prototype context forward: screenshots, component hierarchy, interaction notes. The FE uses this context to integrate the prototype into `prism-ui-react-payroll`, mapping the design's Modus components and interactions to the production MFE architecture.

| Activity | Who | What They're Working From |
|---|---|---|
| Pull UI Story into bead | FE | ADO board → Lista Beads extension |
| Integrate prototype into production MFE | FE | Bead context (screenshots, component tree, interaction notes) |
| Design fidelity review | UX | Side-by-side: production build vs. Figma |
| Story-level acceptance review | PM | Against ADO acceptance criteria |
| QA (automated + manual) | QA / FE | Lint, type-check, visual regression |

**ADO story flow:** Product user stories (authored by PM in Viability) move through `Active → In Review → Resolved` as implementation completes. PM validates each resolved story against its acceptance criteria before it is marked `Closed`. UI Stories (created by the pipeline) are closed when integration is complete.

> **Deliverable — Story Complete**
>
> A product user story is `Closed` when:
> - FE has implemented the behavior described in the story
> - `npm run lint:all` passes (no design system violations)
> - PM has validated the implemented behavior against the story's acceptance criteria
> - Story is marked `Closed` in ADO

> **Deliverable — Feature Integration Complete**
>
> The feature is done when:
> - All product user stories under the ADO Feature are `Closed`
> - The UI Story for the feature is `Closed`
> - UX has done a visual QA pass — production build side-by-side against Figma
> - `npm run build` passes (no TypeScript errors)
> - Feature PR is merged to `prism-ui-react-payroll`

---

#### Handling Prototype Revisions Mid-Pipeline

Prototypes are not always one-and-done. If the PM or UX updates a prototype after it has already been ingested — from user validation feedback, a scope change, or a design revision — the pipeline handles versioning automatically.

When a previously ingested prototype is modified and merged to `main` again, the pipeline creates a **new, versioned UI Story** rather than updating the original. Version numbers are assigned automatically (v1, v2, v3...) and appear in the story title (e.g., "Prototype: Tax Wizard (v2)"). The new story links back to the previous version via an ADO relation.

The decision of what to do with the superseded story stays with the team, not the pipeline:

| Scenario | What the Pipeline Does | What the Team Decides |
|---|---|---|
| **Nobody has started work yet** | New versioned story created | Close or deprioritize the original |
| **Developer is actively integrating** | New versioned story created | Continue with original, switch to new version, or reconcile the two |
| **Already in production** | New versioned story created as a follow-up | Treat as a design revision to an existing production screen |

This approach keeps the ADO board honest — every version of a prototype that was ever ingested is traceable, and no developer is surprised mid-integration by silently changing requirements.

---

#### QA Gates

Before any product user story is marked `Resolved`, the FE runs:

```bash
npm run lint:all   # Design system compliance (Modus 2 color, icon, border rules)
npm run build      # TypeScript type-check + production build
```

Before a feature integration is complete and the UI Story is closed:
- All product user stories under the ADO Feature are `Closed`
- No open lint violations
- Visual QA against Figma (UX sign-off on production fidelity)
- PM has accepted all stories against acceptance criteria

---

## How the Tools Connect

### ADO — Source of Truth for Scope and Build Handoff

- All epics, features, and product user stories live in ADO project `Lista`
- Every design decision that changes scope creates or updates a product user story
- Prototype branches are linked to ADO features
- Story acceptance criteria are the authoritative spec (not Figma annotations)
- **UI Stories** (created automatically by the ingestion pipeline) are a distinct ADO work item type — they represent a unit of design-ready-for-engineering and carry extracted prototype metadata, not written requirements

### Figma — Visual Source of Truth

- Figma holds the hi-fi design and the design system component library
- Figma frames are referenced (not duplicated) in documentation
- Figma is updated to reflect validated designs, not aspirational designs
- UX owns Figma; FE reads Figma; PM reviews Figma

### GitHub — Code and Documentation

- The repository (`lista-payroll-design`) holds:
  - Prototypes (React + Modus 2)
  - Product documentation (`product-docs/`)
  - Process documentation (`process-docs/`)
  - AI rules and patterns (`.cursor/rules/`)
- Branch naming conventions enforce phase clarity (`design/`, `feat/`, `fix/`)
- PR descriptions reference ADO feature IDs

### Cursor — The Integration Hub

- Cursor reads ADO context via MCP integration
- Cursor reads Figma via MCP integration
- Cursor writes to GitHub (code, docs, specs)
- AI agents in Cursor handle: prototype scaffolding, spec generation, lint/review, documentation, and ingestion pipeline extraction (screenshots via Playwright MCP, component hierarchy parsing)

**Cursor is not a replacement for judgment.** Every AI-generated output is reviewed by the appropriate role owner before it moves forward. Cursor reduces the cost of creating first drafts — it does not replace the triad's expertise or ownership.

### Lista Beads (`bd` tooling) — IDE-Native Build Handoff

- Available as an extension in both VS Code and Cursor
- Bridges the ADO board and the FE's local development environment
- FE pulls a UI Story from ADO into a bead directly from their IDE — no browser context-switching
- The bead carries screenshots, component hierarchy, and interaction notes forward into integration
- The developer works from bead context, not from a Figma file or a verbal brief

---

## Roles and Responsibilities

| Role | Owns | Reviews | Inputs To |
|---|---|---|---|
| **PM** | Scope (ADO), milestone decisions, story acceptance, sloppy prototype | Every phase output | Discovery docs, sloppy prototype, ADO stories, acceptance criteria, design review checklist |
| **UX Designer** | Visual design (Figma), user research, design fidelity | Prototype quality, implementation fidelity | Figma files, user research synthesis, design review sign-off |
| **FE Engineer** | Code (GitHub), production implementation, agentic pipeline | Feasibility (Viability checkpoint), acceptance criteria, build quality | Feasibility input, production components, lint/build gates |

### Decision Authority

| Decision | Who Decides | Who Must Be Consulted |
|---|---|---|
| What's in scope for a milestone | PM | UX, FE |
| How a feature looks and flows | UX | PM, FE |
| How a feature is built | FE | UX (fidelity), PM (behavior) |
| When a story is accepted | PM | — |
| When a design is approved | UX | PM |
| When code is production-ready | FE | PM, UX |

---

## Velocity Patterns: What Makes This Faster

### No Separate Spec Documents

Interaction specs are written as ADO acceptance criteria, generated from the validated prototype. There is no separate spec document to maintain and sync. The prototype + ADO stories are the spec.

### PM-Led Sloppy Prototype Unlocks Parallel Work

The PM uses Cursor to generate a rough prototype before UX begins hi-fi design work. This does two things simultaneously: it grounds ADO story creation in a concrete flow (making gaps and missing edge cases visible), and it gives UX something to react to rather than starting from a blank canvas. Figma and the prototype then sharpen each other in a fast PM + UX iteration loop — neither waits for the other.

### AI Handles the Boilerplate

Roughly 60–70% of prototype scaffolding, spec generation, documentation stubs, and test scaffolding is AI-generated. The triad spends its time on decisions, validation, and refinement — not on mechanical generation tasks.

### Artifacts Travel with the Code

Documentation, rules, and process guides live in the same repository as the code. Nothing is in a wiki that can get out of sync. When the repo moves, everything moves.

### The Merge to `main` Is the Handoff

Merging the design branch to `main` is not just a version control step — it is the explicit gate from Viability to Build & Test. It signals that PM + UX have signed off, the checklist is complete, and the FE can begin the agentic pipeline. Because the prototype is already in the production stack (React + Modus 2), the FE is refining and hardening, not rebuilding from scratch.

---

## A Strategic Choice: Backlog-First vs. Prototype-First

Any team adopting this model will face a fundamental sequencing question early on: do you build a thorough story backlog first and let it drive prototyping — or do you prototype first and let the prototype drive story creation? Both approaches are defensible. Neither is universally correct. Understanding the tradeoffs is what lets you choose deliberately rather than by default.

---

### Backlog-First: Stories Drive the Prototype

In this approach, the team invests in a complete or near-complete set of epics, features, and user stories in ADO before any prototyping begins. The prototype is then built to express what the stories describe.

**How it works in practice:**
- PM and UX complete story generation and grooming (gap analysis, milestone targeting, acceptance criteria) before Figma or prototyping starts
- Stories become the design brief — prototyping is the act of visualizing agreed-upon requirements
- The prototype validates that the stories are buildable, not that the stories are right

**Where it works well:**
- The domain is well understood and requirements are relatively stable (regulatory requirements, established workflows, known integrations)
- Multiple teams need to plan and estimate in parallel before design is complete
- Stakeholders require written scope approval before design investment is justified
- The feature is a variation of something already built — not a novel interaction

**Where it breaks down:**
- Stories written without any visual or interactive context tend to be aspirational — they describe an imagined ideal rather than a buildable behavior
- Detail added too early gets thrown away: story AC written before anyone has seen the flow often needs significant rework after the prototype reveals what actually makes sense
- The backlog becomes a constraint on creativity — prototypers feel obligated to execute the story rather than discover the right solution
- Slower to a first interactive artifact; stakeholders don't see anything tangible until late in the cycle

---

### Prototype-First: The Prototype Drives the Stories

In this approach, the team uses discovery outputs, epics, and feature definitions — but not a detailed story backlog — to begin prototyping immediately. Stories are created from the prototype, not before it.

**How it works in practice:**
- PM generates a sloppy prototype from the feature definition and any available design context (research, journey maps, competitive references)
- The act of prototyping surfaces what the stories need to cover — edge cases, error states, empty states, and branching logic that never appear in a feature definition
- Stories are written to describe what the prototype does (and validated against it), rather than what the PM imagined before seeing it
- Acceptance criteria are grounded in observable prototype behavior — they are specific and testable from day one

**Where it works well:**
- The problem space has significant UX complexity or uncertainty — you need to see it to know what it should do
- User research is still informing the design — the prototype is a hypothesis, not a commitment
- Speed to a validated, interactive artifact is more valuable than detailed upfront planning
- The feature has no strong precedent — novel interactions that can't be specified from memory

**Where it breaks down:**
- Without an anchoring epic and feature definition, scope drift is a real risk — the prototype can expand in directions that aren't aligned with milestone goals
- Other teams (engineering, QA, program management) can't plan in parallel without some story-level visibility
- Requires discipline: someone has to actively prevent the prototype from outrunning the ADO hierarchy that governs what's actually in scope
- Prototype-derived stories can occasionally inherit prototype decisions that were wrong — a bad interaction in the prototype can become a bad AC

---

### How We Think About It

The Lista model is deliberately **prototype-first at the story level, backlog-first at the epic and feature level.**

The epic and feature hierarchy in ADO is established before prototyping begins — this bounds the scope and connects every prototype branch to a known parent in the product plan. But individual user stories are not written until the prototype gives us something concrete to describe. This sequencing captures the best of both approaches:

| Level | Our Approach | Why |
|---|---|---|
| Epic | Defined before Viability begins | Bounds scope; connects to milestone plan |
| Feature | Defined before Viability begins | Anchors the design branch; sets the Viability goal |
| User Story | Derived from the prototype | Grounded in validated behavior; acceptance criteria are testable |

**The PM sloppy prototype is the bridge.** It lets story creation and design happen in parallel — the prototype makes the flow concrete enough to write stories against, while UX is simultaneously refining the design in Figma. Neither waits for the other to be "done."

The practical implication: if you find yourself writing detailed, edge-case-level user stories before anyone has touched a prototype, you are probably investing too early. If you find yourself prototyping freely without a feature definition anchoring the work in ADO, you are probably drifting. The line between those two failure modes is where this model operates.

---

## Common Failure Modes to Avoid

| Failure Mode | What It Looks Like | Prevention |
|---|---|---|
| FE pulled into Viability iteration | FE attending PM + UX design sessions, slowing the loop | FE gets a single feasibility checkpoint, not ongoing design involvement |
| Sloppy prototype treated as final | PM prototype shipped to users or treated as the design deliverable | PM prototype is explicitly a skeleton for story grounding — UX owns the final design |
| Scope drift in Viability | Features added to a design branch without ADO stories | Every design decision that adds scope gets a story first |
| Merge to `main` before checklist is done | Design branch merged early, triggering an incomplete pipeline on a half-baked prototype | Merge is gated on the design review checklist — no partial merges |
| Prototype pages outside `src/pages/` | Prototype built in a non-standard location, invisible to the ingestion pipeline | All prototype pages live in `src/pages/` — no exceptions |
| Page exists but no route in `App.tsx` | Pipeline skips screenshot capture for that page; FE gets a UI Story with metadata but no visual context | `lint:routes` (part of `lint:all`) catches this before merge; Cursor rules guide correct setup |
| Generic page names (`index.tsx`, `page.tsx`) | Pipeline slug derivation produces meaningless UI Story titles in ADO | Use descriptive `PascalCase` + `Page` suffix (e.g., `PayrollSetupPage.tsx`) — `page-naming-convention` Cursor rule enforces this |
| Figma as the spec | FE implementing from Figma annotations instead of ADO acceptance criteria | Acceptance criteria are written before FE begins implementation; bead context supplements but does not replace AC |
| ADO staleness | Stories and features not updated as design evolves | ADO updates are part of every validation step, not an afterthought |
| AI hallucination on scope | AI generating features or specs that weren't validated | Every AI output is reviewed by the role owner before moving forward |
| Figma + prototype diverging | Figma and prototype drifting apart with no reconciliation point | Design review checklist requires both to align before merge |
| Superseded UI Story not actioned | An old versioned UI Story left open while a developer integrates the newer version | When a new versioned UI Story is created, the team explicitly decides to close, continue, or reconcile — no silent abandonment |

---

## Artifact Index

| Artifact | Location | Owner | Updated When |
|---|---|---|---|
| Backlog Definition | `product-docs/backlog/Lista-Backlog-Definition.md` | PM | Epic scope changes |
| Milestone Summary | `product-docs/backlog/Milestone-Stakeholder-Summary.md` | PM | Milestone decisions |
| Prototype Iteration Guide | `product-docs/best-practices/Prototype-Iteration-and-Flow-Docs.md` | FE + PM | Process evolves |
| **Ingestion Pipeline Vision Doc** | `product-docs/supporting/Prototype Ingestion Pipeline -- Vision Document (v2).pdf` | FE | Pipeline implementation changes |
| **Ingestion Pipeline Technical Spec** | `process-docs/Prototype Ingestion Pipeline -- Technical Spec (v2).pdf` | FE | Pipeline implementation changes |
| This Playbook | `process-docs/Triad-AI-Playbook.md` | PM | Process evolves |
| ADO Backlog | ADO project `Lista` | PM | Ongoing |
| Figma Design System | Figma (Modus 2 library) | UX | Design updates |
| Visual Backlog (Miro) | [Miro Board](https://miro.com/app/board/uXjVJglUVR0=/?share_link_id=128266091116) | PM | Sprint planning |
| AI Rules (Cursor) | `.cursor/rules/` | FE | Patterns identified |

---

## Pipeline Terminology Reference

Terms used in Phase 3 that have specific technical meanings in the Lista workflow:

| Term | Meaning |
|---|---|
| **Prototype** | A UI/UX screen or flow built by the PM + UX team using Modus Web Components in the `lista-payroll-design` repo |
| **Slug** | A URL-safe identifier for a prototype, derived automatically from its file or folder name in `src/pages/` |
| **Ingestion** | The automated process of detecting merged prototype changes, extracting metadata (screenshots, component tree, interactive elements), and creating a UI Story in ADO |
| **UI Story** | The ADO work item created by the ingestion pipeline — distinct from product user stories authored by the PM. Carries prototype screenshots, component hierarchy, and interaction notes as the build handoff artifact |
| **Bead** | The FE's local unit of work, created by pulling a UI Story from ADO into the `bd` tooling via the Lista Beads extension. The bead carries all prototype context into the integration session |
| **Integrate** | The FE's work of taking a prototype's design and wiring it into the production MFE architecture (`prism-ui-react-payroll`) |
| **Lista Beads** | The VS Code / Cursor extension that bridges the ADO board and the FE's IDE, enabling UI Stories to be pulled into beads without leaving the editor |
| **Slug** | A URL-safe identifier for a prototype, derived automatically from its location in `src/pages/`. Single-file pages: `DashboardPage.tsx` → `dashboard-page`. Folder-based pages: folder name is the slug directly (`payroll-setup`) |
| **Slug exclusion** | A list of slugs in `.github/config/prototype-ingestion.json` that the pipeline skips. Used for in-progress or non-engineering pages |
| **`lint:routes`** | A CI check (part of `npm run lint:all`) that validates every page in `src/pages/` has a corresponding route in `App.tsx`. Fails the build if any page is unrouted |
| **Workflow summary** | A markdown report posted to the GitHub Actions tab after each pipeline run — counts of created / skipped / errored stories, per-prototype status, and ADO links |

---

## How to Get Started on a New Feature

1. **PM:** Confirm the feature has a parent epic in ADO. If not, add it to `Lista-Backlog-Definition.md` and create the epic in ADO first.
2. **PM:** Create the ADO Feature work item, set state to `Active`, and write an initial goal statement.
3. **PM:** Create the `design/[feature-name]` branch in GitHub. Link it to the ADO Feature.
4. **PM + Cursor:** Build the sloppy prototype — a clickable skeleton through the feature's core flow. Use this to draft and expand ADO stories.
5. **UX:** Review the sloppy prototype. Begin Figma hi-fi design. Share frames early.
6. **PM + UX:** Iterate on the prototype and Figma together until the flow is validated. PM drives ADO story refinement in parallel.
7. **FE:** At a designated checkpoint, review the prototype for implementation feasibility. Flag any blockers.
8. **PM + UX:** Complete the design review checklist.
9. **PM:** Merge the design branch to `main`. This is the explicit gate — Build & Test begins here.
10. **FE + Cursor:** Run the agentic pipeline. Begin production implementation story by story.

---

## Open Questions and Evolving Areas

As the playbook matures, these are the areas we are still learning:

- **How "sloppy" is too sloppy?** We are calibrating what the PM prototype needs to cover to be useful without over-investing before UX begins. Current hypothesis: it needs to show the full happy-path flow and at least one error state.
- **How much AI-generated spec review is enough?** We are calibrating how much validation is needed before AI-generated acceptance criteria are treated as authoritative.
- **Figma-to-prototype fidelity expectations:** When is it acceptable for the prototype to diverge from Figma? (Working hypothesis: prototype wins if it's been user-validated; Figma is updated to match.)
- **Feature vs. epic scoping for Viability:** We expect most Viability loops to operate at the ADO Feature level, but some tightly coupled epic flows may need to be designed together. We are building intuition for when to expand the scope.
- **When to involve QA early:** We currently bring QA in at Build & Test. Should QA be present at the design review stage to review testability of acceptance criteria?
- **Scaling the model:** This playbook is written for a single triad. How does it change with two features running in Viability simultaneously?

---

*For questions about this playbook, bring them to the team and propose an update. This document is in version control — changes are tracked, and every iteration is recoverable.*
