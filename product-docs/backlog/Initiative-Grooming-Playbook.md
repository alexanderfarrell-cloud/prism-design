# Initiative Grooming Playbook
## Prism Construction Payroll — Backlog Refinement Methodology

> *Trimble Financials | Prism Payroll | U.S. SMB Construction Contractors*
> *Last Updated: Feb 2026*
> *Use this document as a repeatable guide after an initiative's features and stories have been generated. See `docs/documentation/workflow-guide.md` for the upstream story generation workflow (`/prd-draft`, `/epic-draft`, `/user-story-design`, `/user-story-expand`).*

---

## Prerequisites

Before starting this playbook, the following should already be true:

- [ ] An Epic exists in ADO with a clear goal and description
- [ ] Features have been created under the Epic and are linked as children
- [ ] User Stories exist under each Feature and are linked as children
- [ ] Stories have been reviewed for basic quality (persona, AC, context) during the `/user-story-expand` checkpoint

If any of the above are missing, complete the story generation workflow first (`docs/documentation/workflow-guide.md`).

---

## The Four-Step Grooming Sequence

| Step | Activity | Output |
|------|----------|--------|
| 1 | Gap Analysis | Missing stories identified and created in ADO |
| 2 | Categorize: Setup vs. Setting *(if applicable)* | Tags applied to all stories |
| 3 | Target Mapping: Alpha / Beta / GA | `Custom.Target` field set on all stories |
| 4 | Target Conformance Review | Descriptions and AC updated to match milestone scope |

Work through these steps in order. Earlier steps inform decisions in later ones — in particular, you cannot do a meaningful conformance review (Step 4) without first knowing each story's target (Step 3).

---

## Step 1 — Gap Analysis

### Goal
Identify what's missing after initial story generation. Even with a thorough `/user-story-expand` run, the generated stories tend to cover the happy path well and underweight compliance edge cases, integration failure modes, and construction-specific nuance. A gap analysis surfaces those blind spots before they become sprint-time surprises.

### How to Run It

**1. Get the current state of the Epic**

Pull all stories from ADO to get a ground-level view of what exists. You can prompt:

> *"Retrieve all stories under Epic [ID] and give me a list organized by Feature — title and one-sentence summary for each."*

**2. Walk the full user journey**

Don't review story-by-story. Instead, simulate the actual experience end-to-end:

> *"If a U.S. SMB construction contractor tried to [run their first payroll / onboard their first employee / etc.] using only what's in ADO today, what would actually fail? What would they hit that isn't covered?"*

This "pressure-test" framing consistently surfaces more gaps than a checklist review because it forces scenario-based thinking rather than coverage-based thinking.

**3. Cross-reference against known gap domains**

For payroll specifically, scan explicitly against these categories — they are reliably under-represented after story generation:

| Domain | Common Gaps |
|--------|-------------|
| **Tax compliance** | State-specific SUI rates, income tax withholding accounts, local jurisdiction detection, new hire reporting, 944 vs. 941 edge cases, deposit schedule (monthly vs. semi-weekly) |
| **Trade & Pay Type** | NCCI code mapping to trades, overtime rules by state (FLSA + state daily OT), shift differentials, pay type library, supplemental pay withholding methods |
| **Integration** | GL account mapping, job/phase code sync validation from Prism Accounting, time entry rate resolution test, Traqspera integration handoff |
| **Data integrity** | YTD migration for mid-year activations, W-2 reconciliation, tax deposit credit carryover |
| **Calendar & scheduling** | Multiple pay schedules (field vs. office), banking holiday date shifting, retroactive schedule change guardrails |
| **Compliance audit trails** | Authorization signatory (Form 8655), local tax check audit logging, new hire report confirmation |
| **Multi-state nexus** | Adding work-state nexus, state reciprocity agreements, compliance cascade per state |
| **ESS / Employee-facing** | Self-service for W-4, direct deposit, pay stub access, address updates |

**4. Propose, review, then create**

Summarize proposed new features and/or stories — organized by which existing Feature they belong under (or flagging that a new Feature is warranted). Get stakeholder agreement before pushing to ADO.

### Useful Prompts

> *"Run a gap analysis on Epic [ID] against its features and stories. Assume the target is a U.S. SMB construction contractor running payroll across all 50 states. What's missing? Focus specifically on [trade and pay type / state tax compliance / Prism Accounting integration]."*

> *"Good. Now do a genuine pressure-test rather than a list review. The right question is: if you tried to run the very first payroll with only what's in ADO today, what would actually fail?"*

> *"Review the gap list above. Which of these are missing stories under an existing feature, and which require a new feature entirely?"*

### ADO: Creating Gap-Fill Stories

When creating new stories and linking them to their parent Feature:

1. Use `wit_create_work_item` with `workItemType: "User Story"` and `fields` including `System.Parent`
2. **Always follow up with `wit_work_items_link`** to explicitly link each new story to its Feature parent with `type: "parent"` — setting `System.Parent` during creation alone does not reliably establish the ADO hierarchy

---

## Step 2 — Categorize: Setup vs. Setting

### Goal
For Epics that involve onboarding or configuration workflows, classify each story as either **Setup** or **Setting** to guide UX prioritization and wizard design decisions. This step defines the difference between *must-do-now* and *must-do-before-first-payroll*.

> **Applicability:** This step is most relevant for setup/configuration Epics (e.g., "Setting Up Companies for Payroll", "Employee Onboarding & Profile"). Skip this step for operational or transactional Epics where the distinction doesn't apply (e.g., "Run Payroll", "Reporting").

### Definitions

| Tag | Plain Language | UX Treatment |
|-----|----------------|--------------|
| **Setup** | Wizard-blocking. Must be completed in the initial onboarding session before the user can proceed. Foundational to the system operating at all. | Required wizard step; blocks progression until complete |
| **Setting** | Must be done before the first payroll *run*, but not during the initial wizard session. Can be deferred and returned to from a settings or checklist view. | Non-blocking in initial wizard; surfaced via dashboard checklist |

### Decision Criteria

**Mark as Setup if:**
- Without it, the system cannot be configured at all (e.g., EIN, pay frequency, federal filer status)
- Every downstream step depends on this data
- Getting it wrong creates a compliance or data integrity failure affecting all future operations
- The contractor is blocked from running *any* payroll without it

**Mark as Setting if:**
- Required before the first payroll *run*, but not before the system is *configured*
- Adds real complexity that would lengthen or confuse the initial wizard flow
- Applies to some but not all customers (e.g., local taxes, workers' comp, YTD migration)
- A missing value here doesn't block setup, but would block or corrupt a live payroll run

### Useful Prompt

> *"Review all stories under Epic [ID]. Our goal is to make onboarding as straightforward as possible for contractors who are not payroll experts. Categorize each story as either 'Setup' (must be done immediately in the wizard, blocking) or 'Setting' (must be done before first payroll but can be deferred from the wizard). Show your reasoning for any borderline cases."*

### ADO: Applying Tags

Apply tags via `wit_update_work_items_batch`:
- `path: "/fields/System.Tags"`
- `op: "Add"`
- `value: "Setup"` or `value: "Setting"`

Batch all "Setup" tag updates together, then all "Setting" tag updates, to minimize API calls.

---

## Step 3 — Target Mapping: Alpha / Beta / GA

### Goal
Assign each story a release milestone using the `Custom.Target` field in ADO. This drives sprint planning, engineering prioritization, and realistic expectations for each release phase. Every story in the Epic should have a target set before moving to Step 4.

### Milestone Definitions (Summary)

See `docs/documentation/Milestone_Statements_of_Scope.md` for the full scope statements.

| Milestone | Audience | Purpose | Key Constraints |
|-----------|----------|---------|-----------------|
| **Alpha** | Internal (Trimble) | Demonstrable thin slice; validate direction | Single company, single state; no real ACH disbursement; no live tax filing; mock payroll run only |
| **Beta** | Customers / Prospects (Trimble Dimensions) | Expanded working solution; drive engagement and feedback | Broad state coverage; real but supervised payroll; key integrations live; known limitations documented |
| **GA** | All customers | Full production-ready payroll for U.S. contractors | All 50 states; full compliance; self-service capable; no known critical gaps |

### Alpha Assignment — Use This Test
> *"Would the internal demo fail or be embarrassing without this story?"*

Alpha is a thin slice through the end-to-end workflow, not a complete system. Only stories required for the demo to make sense belong at Alpha. When in doubt, push to Beta.

Alpha stories typically cover:
- Company identity, federal tax elections, pay schedule (single company, single state)
- Basic employee add with W-4 and payment method
- Time data flow from Traqspera (even as a file-based stub)
- Mock payroll run producing expected output
- Wizard framework (navigation, save/resume, empty state)
- Primary state detection (detection and display only — no tax account entry)

### Beta Assignment — Use This Test
> *"Would a real customer trying to run their first payroll hit a wall without this?"*

Beta expands Alpha's single-state simplicity to real-world complexity. Stories that handle the configuration and edge cases a paying customer in their first cohort will encounter belong at Beta.

Beta stories typically cover:
- State tax account IDs, SUI rates, local tax detection
- Banking verification (IAV or micro-deposit)
- Workers' comp policy entry
- Trade library, NCCI mapping, overtime rules
- GL account mapping, job cost routing, Prism Accounting sync validation
- Multi-schedule support, YTD migration for mid-year activations
- Multi-state nexus, 1099 configuration

### GA Assignment — Use This Test
> *"Is there a documented acceptable workaround for Alpha or Beta, or is this low-frequency enough that first customers won't hit it?"*

GA completes the full compliance picture and handles edge cases that early customers are unlikely to encounter.

GA stories typically cover:
- Advanced calendar handling (banking holiday shifting, retroactive guardrails)
- Shift differentials, holiday calendar pay policies
- State new hire reporting integration for all states
- Full ACH origination configuration
- Supplemental pay withholding methods
- State reciprocity agreements across all nexus combinations

### Useful Prompt

> *"Using @docs/documentation/Milestone_Statements_of_Scope.md as the scope reference, categorize each story under Epic [ID] into Alpha, Beta, or GA. For each story, briefly state which milestone it belongs to and why. Flag any borderline cases with your reasoning so I can make a final call."*

### ADO: Setting the Target Field

Update `Custom.Target` via `wit_update_work_items_batch`:
- `path: "/fields/Custom.Target"`
- `op: "Add"`
- `value: "Alpha"`, `"Beta"`, or `"GA"`

Batch by milestone (all Alphas together, all Betas together, all GAs together) to minimize API calls.

---

## Step 4 — Target Conformance Review

### Goal
Read each story's description and acceptance criteria and update any content that contradicts or misrepresents its assigned milestone. A story's text should *read* like it belongs to its milestone — a developer opening an Alpha story should see Alpha-appropriate scope, not a story that implies multi-state complexity or references Beta wizard steps that don't exist yet.

This is the most nuanced step and is best done after target mapping is complete and confirmed.

### How to Run It

**1. Fetch all stories with full content**

Use `wit_get_work_items_batch_by_ids` with fields:
- `System.Id`
- `System.Title`
- `Custom.Target`
- `System.Description`
- `Microsoft.VSTS.Common.AcceptanceCriteria`

Batch in groups of 20–25 IDs to stay within API limits.

**2. Group by milestone and review Alpha stories first**

Alpha stories carry the highest risk of scope mismatch because they were often written before milestone assignments existed.

**3. For each story, ask one question**

> *"If a developer read only this story and its AC, would they build the right thing for the right milestone?"*

If the answer is no — or even "maybe not" — flag it for update.

### What to Look For by Milestone

#### Alpha Stories — Common Mismatch Patterns

| Pattern | Example | Fix |
|---------|---------|-----|
| Multi-state language in a single-state story | "across all 50 states" in a state detection story | Scope to primary state; note multi-state is Beta |
| Wizard advances to a Beta-scope step | "wizard advances to the Federal Tax Deposit Schedule step (story 681026)" when 681026 is Beta | Update to advance to next Alpha step; note Beta step is added later |
| Step count reflects full wizard, not Alpha | "5 of 8 steps complete" | Update example to Alpha step count (~5 steps: Company Profile, Federal Tax, Pay Schedule, State ID, Setup Review) |
| Review screen lists Beta/GA setup items | "banking, digital authorization, WC policy" in the Alpha setup review | Keep only Alpha-scope items on the Alpha review screen |
| Context examples reference Beta-scope tasks | "call your insurance broker for a WC policy number" in a Save & Resume story | Replace with Alpha-scope examples (EIN letter, SUI rate notice) |
| State-blocking behavior ("safe list" approach) | Hard modal blocking users from states not in TX/FL/TN/WA/NV/SD/WY | Remove entirely — all 50 states are in scope; no blocking or waitlisting by state |
| Read-only field described as editable in AC | "Manual Override (One-Way Sync)" scenario on a Prism-sourced read-only field | Remove override scenario; corrections flow through Prism only |

#### Beta Stories — Common Mismatch Patterns

| Pattern | Example | Fix |
|---------|---------|-----|
| Implies full 50-state completeness | "all U.S. states are fully supported" | Qualify: "broad state coverage; complex edge cases are GA scope" |
| No scope notes for edge cases | Complex local tax story with no mention that certain locals are GA | Add a note: "complex local jurisdictions not on the support list are GA scope" |
| Doesn't reference Alpha predecessor story | Beta story jumps into full configuration without noting Alpha did a subset | Add context: "At Alpha, [step X] was detection-only; this story adds full configuration" |

#### GA Stories — Common Mismatch Patterns

| Pattern | Example | Fix |
|---------|---------|-----|
| Describes full production behavior but AC is thin | No error handling, no audit trail, no edge case coverage | Add production-grade AC scenarios: audit logging, all-state coverage, failure modes |
| Story should actually be Beta | GA story that first-cohort customers will clearly need | Discuss with team; may need to move Target to Beta |

### Useful Prompt

> *"Review all stories for Epic [ID]. For each story, read the description and AC against its assigned Target (Alpha/Beta/GA) and flag any content that doesn't conform to that milestone's scope. Use @docs/documentation/Milestone_Statements_of_Scope.md as the reference. Propose specific updates for any flagged stories — only update what's actually misaligned, preserve all well-written content."*

### ADO: Applying Updates

Use `wit_update_work_items_batch` with:
- `path: "/fields/System.Description"` or `"/fields/Microsoft.VSTS.Common.AcceptanceCriteria"`
- `op: "Replace"`
- `value`: full replacement HTML for the field

> **Important:** The API replaces the entire field — it does not support partial/diff updates. Always provide the complete HTML content for the field, preserving all well-written sections and modifying only the misaligned parts.

---

## ADO API Quick Reference

### Tools Used in This Workflow

| Task | Tool | Key Parameters |
|------|------|----------------|
| Create a new story (gap fill) | `wit_create_work_item` | `project`, `workItemType`, `fields[]` |
| Link child to parent (required after creation) | `wit_work_items_link` | `updates[].id`, `linkToId`, `type: "parent"` |
| Fetch Epic with child Feature IDs | `wit_get_work_item` | `id`, `project`, `expand: "relations"` |
| Fetch Feature with child Story IDs | `wit_get_work_item` | `id`, `project`, `expand: "relations"` |
| Fetch full story content in bulk | `wit_get_work_items_batch_by_ids` | `ids[]`, `fields[]` |
| Batch update tags, targets, descriptions | `wit_update_work_items_batch` | `updates[].op`, `id`, `path`, `value` |

### Key Field Paths

| Field | ADO Path |
|-------|----------|
| Title | `/fields/System.Title` |
| Description | `/fields/System.Description` |
| Acceptance Criteria | `/fields/Microsoft.VSTS.Common.AcceptanceCriteria` |
| Tags | `/fields/System.Tags` |
| Release Target | `/fields/Custom.Target` |
| PI (Program Increment) | `/fields/Custom.PI` |

### Navigating the Epic Hierarchy

ADO does not support deep hierarchical fetches in a single call. To retrieve all stories under an Epic:

1. `wit_get_work_item` on the Epic with `expand: "relations"` → collect child Feature IDs from `relations[]` where `rel = "System.LinkTypes.Hierarchy-Forward"`
2. `wit_get_work_item` on each Feature with `expand: "relations"` → collect child Story IDs
3. `wit_get_work_items_batch_by_ids` with all Story IDs and the fields you need (batch 20–25 at a time)

---

## Product Context for Prompting

Paste this block at the start of a new chat session when working on a grooming pass:

```
Product: Prism Construction Payroll — a payroll solution built natively within Trimble Financials (Prism),
purpose-built for U.S.-based SMB construction contractors across all 50 states.

Target customer: Small-to-medium construction contractors (5–100 employees). Primary persona is the
owner or office manager ("PR Admin") who handles payroll without a dedicated HR or payroll function.
Personas in use: PR Admin, Office Manager, Owner-Operator, Compliance Officer.

Integration partners in scope:
- Traqspera — Time collection; source of field time data
- Prism Accounting — Core financials; source of jobs, cost codes, chart of accounts, GL
- Tax jurisdiction provider (e.g., Symmetry / Vertex / Avalara) — 50-state withholding, local tax
- Bank / ACH partner (e.g., Plaid / Stripe) — Bank verification and disbursement

Excluded from scope: union/certified payroll, employee-level payroll processing administration,
employer benefits & deduction plan library.

Milestone targets:
- Alpha (June 2026, internal Trimble): single company, single state, mock payroll run only
- Beta (Trimble Dimensions conference, customer-facing): broad state coverage, real payroll runs
- GA (production-ready): all 50 states, full compliance, self-service capable

Milestone scope details: @docs/documentation/Milestone_Statements_of_Scope.md
```

---

## Initiative Tracking

Update this table as each initiative completes the grooming sequence.

| Epic ID | Initiative | Gap Analysis | Setup/Setting | Targets Set | Conformance Review |
|---------|------------|:------------:|:-------------:|:-----------:|:------------------:|
| 668778 | Setting Up Companies for Payroll | ✅ | ✅ | ✅ | ✅ |
| 672405 | Employee Management | ✅ | ✅ | ✅ | ✅ |
| 681144 | Employee Self-Service (ESS) Portal | — | N/A | — | — |
| 681929 | Time Collection & Traqspera Integration | ✅ | UX tag ✅ | ✅ | ✅ |
| 682274 | Payroll Run & Approval Workflow | ✅ | UX tag ✅ | ✅ | ✅ |

*Stories generated via the workflow guide (`/epic-draft` + `/user-story-expand`) are the assumed starting point for all rows.*
