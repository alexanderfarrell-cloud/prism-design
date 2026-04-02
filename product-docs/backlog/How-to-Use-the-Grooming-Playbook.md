# How to Use the Initiative Grooming Playbook

> *Quick reference for applying the grooming methodology to new initiatives.*

---

## The Short Answer

Use it as `@` context in every new grooming chat.

When you start a new Cursor session to groom an initiative, open with something like:

```
@docs/supporting/best-practices/Initiative-Grooming-Playbook.md
@docs/documentation/Milestone_Statements_of_Scope.md

I want to run a grooming pass on Epic [ID] — [initiative name].
Features and stories are already in ADO from the story generation workflow.
Let's start with Step 1: Gap Analysis.
```

That's it. The AI now has the full methodology, the milestone definitions, the decision criteria, the ADO field names, and the prompts — all in context from the start. You're not re-explaining the process each time; you're just pointing at the playbook and saying "follow this."

---

## Grooming Steps — Quick Reference

Work these in order. Each step informs the next.

---

### Step 1 — Gap Analysis

**Goal:** Find what's missing after story generation — especially compliance edge cases, integration failure modes, and construction-specific nuance the happy path doesn't cover.

**Run it:**
1. Pull all stories: *"Retrieve all stories under Epic [ID] organized by Feature — title and one-sentence summary."*
2. Pressure-test: *"If a U.S. SMB construction contractor tried to [run their first payroll] using only what's in ADO today, what would actually fail?"*
3. Cross-reference against: Tax compliance · Trade & Pay Type · Integration · Data integrity · Calendar · Compliance audit trails · Multi-state nexus · ESS

**Key prompt:**
> *"Run a gap analysis on Epic [ID]. Assume a U.S. SMB construction contractor running payroll across all 50 states. What's missing? Focus on [domain]."*

**ADO:** `wit_create_work_item` → then always follow with `wit_work_items_link` (type: `"parent"`) to establish the hierarchy.

---

### Step 2 — Categorize: Setup vs. Setting *(skip for non-setup Epics)*

**Goal:** Classify each story as **Setup** (wizard-blocking, must complete in initial session) or **Setting** (required before first payroll run, but deferrable from the wizard).

| Tag | When to apply |
|-----|---------------|
| **Setup** | Without it, the system can't be configured at all. Blocks *any* payroll. |
| **Setting** | Required before first *run*, but not before the wizard completes. Applies to some but not all customers. |

**Key prompt:**
> *"Categorize each story under Epic [ID] as 'Setup' (wizard-blocking) or 'Setting' (must-do before first payroll, but deferrable). Show reasoning for borderline cases."*

**ADO:** `wit_update_work_items_batch` · path: `/fields/System.Tags` · op: `Add` · value: `"Setup"` or `"Setting"`

---

### Step 3 — Target Mapping: Alpha / Beta / GA

**Goal:** Set `Custom.Target` on every story. Every story needs a target before Step 4.

| Milestone | Decision test |
|-----------|---------------|
| **Alpha** | "Would the internal demo fail or be embarrassing without this?" — thin slice only, push doubt to Beta |
| **Beta** | "Would a real customer trying to run their first payroll hit a wall without this?" |
| **GA** | "Is there a documented acceptable workaround, or is this low-frequency enough that first customers won't hit it?" |

**Key prompt:**
> *"Using @docs/documentation/Milestone_Statements_of_Scope.md, categorize each story under Epic [ID] into Alpha, Beta, or GA. State why for each and flag borderline cases."*

**ADO:** `wit_update_work_items_batch` · path: `/fields/Custom.Target` · op: `Add` · value: `"Alpha"`, `"Beta"`, or `"GA"` — batch by milestone.

---

### Step 4 — Target Conformance Review

**Goal:** Read each story's description and AC and update any content that contradicts its assigned milestone. A developer opening an Alpha story should see Alpha-scope content — not multi-state complexity or Beta wizard steps.

**What to scan for:**

| Milestone | Common mismatches to fix |
|-----------|--------------------------|
| **Alpha** | "All 50 states" in a single-state story · Wizard advancing to a Beta step · Step counts reflecting full wizard · Review screen listing Beta/GA items · State-blocking / safe-list approach |
| **Beta** | Implies full 50-state completeness · No scope notes for edge cases · Doesn't reference Alpha predecessor |
| **GA** | Thin AC for what should be production-grade · Story that first-cohort customers will clearly need (consider moving to Beta) |

**Key prompt:**
> *"Review all stories for Epic [ID]. For each, read description and AC against its Target and flag misaligned content. Use @docs/documentation/Milestone_Statements_of_Scope.md as reference. Propose specific updates — preserve well-written content, only change what's misaligned."*

**ADO:** `wit_update_work_items_batch` · path: `/fields/System.Description` or `/fields/Microsoft.VSTS.Common.AcceptanceCriteria` · op: `Replace` · value: full HTML replacement (API replaces the entire field — always include the complete content).

---

## The Practical Flow for a New Initiative

1. Run `/epic-draft` + `/user-story-expand` to generate and push features and stories *(your existing workflow — see `docs/documentation/workflow-guide.md`)*
2. Open a **new chat** in Cursor *(keeps context clean)*
3. Reference `@Initiative-Grooming-Playbook.md` + `@Milestone_Statements_of_Scope.md` + the Epic ID
4. Say **"Step 1: Gap Analysis"** — the AI knows what to do, what questions to ask, and what domains to scan
5. Work through Steps 2–4 in the same session or across sessions — the playbook is the thread that connects them

---

## Three Things Worth Knowing

**The tracking table at the bottom of the playbook** is your at-a-glance status board. Update it as each initiative completes each step so you always know where things stand across the whole backlog.

**The product context block** at the bottom of the playbook is designed to be pasted verbatim at the top of any chat where the AI needs grounding — especially useful when starting fresh sessions mid-grooming so you don't have to re-establish persona vocabulary, integration partners, or milestone constraints from scratch.

**New chat sessions = fresh context.** If a grooming session runs long or you're coming back the next day, start a new chat and re-reference the playbook. A clean context window produces more focused responses than a session that has drifted through hours of back-and-forth.

---

## Related Docs

| Document | Location | Purpose |
|----------|----------|---------|
| Initiative Grooming Playbook | `docs/supporting/best-practices/Initiative-Grooming-Playbook.md` | The full 4-step methodology |
| Milestone Statements of Scope | `docs/documentation/Milestone_Statements_of_Scope.md` | Alpha / Beta / GA scope definitions |
| Workflow Guide | `docs/documentation/workflow-guide.md` | Story generation commands (`/prd-draft`, `/epic-draft`, `/user-story-expand`) |
