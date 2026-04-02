# Payroll Run & Approval Workflow — Epic Set

> **Source Documents:** Payroll Run & Approval Workflow PRD (Mar 2), Construction Payroll User Insights Synthesis (Feb 4)
> **Parent Initiative:** Prism Construction Payroll — Payroll Run & Approval Workflow (E-RP)
> **Delivery Horizon:** Alpha (June 2026) → Beta (Trimble Dimensions) → GA

---

## Epic Set Overview

| # | Epic | One-Line Summary | Milestone |
|---|------|-----------------|-----------|
| E-RP-1 | **Run Initiation & Readiness Gate** | Admin scopes and launches a payroll run only when all pre-conditions are met | Alpha+ |
| E-RP-2 | **Payroll Calculation Trigger & Status** | System invokes the E4/E5 engines and keeps the admin informed through to review-ready | Alpha+ |
| E-RP-3 | **Payroll Run Review Screen** | Admin sees every employee's computed results — gross, deductions, taxes, net — in a single, scannable view | Beta/GA |
| E-RP-4 | **Employee Calculation Drill-Down** | Admin opens any employee record and traces every dollar back to its source time entry, rate, and trade | Beta/GA |
| E-RP-5 | **AI Pre-Submission Checklist** | AI-generated anomaly flags are surfaced and must be acknowledged or dismissed before approval is enabled | Beta/GA |
| E-RP-6 | **Run-Level Adjustments & Overrides** | Admin can exclude, hold, or add pay items for specific employees without re-running the entire payroll | Beta/GA |
| E-RP-7 | **Approval Action & Run Finalization** | Admin executes an explicit, irreversible approval that triggers disbursement, GL posting, and pay stub generation | Beta/GA |
| E-RP-8 | **Run State Management & History** | Every payroll run has a persistent, visible state and a full history that any authorized user can audit | Beta/GA |
| E-RP-9 | **Off-Cycle Run Workflow** | Admin initiates, calculates, reviews, and approves a scoped run for terminations, bonuses, or corrections — without touching the regular pay period | GA |

---

## Epic E-RP-1 — Run Initiation & Readiness Gate

### 1. Goal / Outcome
Give the PR Admin a structured, gated entry point for every payroll run. Before a single calculation is triggered, the system validates that time is confirmed, employee pay setup is complete, and no blocking exceptions remain open. This eliminates the most common source of downstream payroll errors — a run that begins on bad data — and replaces the current "just click Run and hope" experience with a deliberate, confidence-building launch sequence.

### 2. Primary Personas
- **PR Admin** ("Overwhelmed Operator") — primary actor; initiates and scopes the run
- **Owner / Exec** — episodic; may observe run status

### 3. Business & PRD Drivers
- **G2** — Ensure all pre-approval blockers are resolved before calculation begins
- **UC-1, UC-2** — P0 use cases for both Alpha and Beta/GA
- **FR: Run Initiation** (pay period pre-fill, run type selection, employee scope)
- **FR: Pre-Run Readiness Gate** (three-part validation: E3 lock, open exceptions, pay setup completeness)
- **User Insight 1** — SMB owners view payroll as high-stakes risk management; they want a "safety net" before committing

### 4. Problem / Rationale
Currently, admins click "Run Payroll" on unvalidated data. Errors in time collection, missing employee tax setup, or unresolved exceptions propagate silently into the calculation and are discovered only after disbursement — when reversing them is expensive and embarrassing. The construction "Friday Crunch" amplifies this: admins are under time pressure and cannot afford to chase down blockers mid-run.

### 5. In Scope
- "Run Payroll" entry point presenting the current open pay period as the default selection
- Run type selection: Regular, Off-Cycle (Termination, Bonus, Correction, Other)
- Employee scope selection for off-cycle runs (one or more specific employees)
- Pre-run display: employee count in scope, total confirmed hours
- Three-part readiness gate executed before calculation is triggered:
  1. Time review confirmed / pay period locked (E3 gate)
  2. No open blocking time exceptions in E3
  3. All in-scope employees have complete pay rate and tax setup
- Named blocker display: each failed check shown with a plain-language label and a direct resolution link (e.g., "2 employees have incomplete tax setup — click here to resolve")
- Hard gate: calculation cannot proceed while any P0 blocker is unresolved

### 6. Out of Scope (for this epic)
- Time entry review and exception resolution — owned by E3
- Employee pay rate and tax setup — owned by Company Setup / Employee Management
- Calculation engine invocation and progress state — E-RP-2
- Off-cycle run initiation wizard (full workflow) — E-RP-9
- Multi-user locking / concurrent run management — deferred to GA (noted in E-RP-8)

### 7. Example "Super Stories"
- As a PR Admin, I want to see the current pay period pre-filled when I open "Run Payroll" so that I can confirm scope at a glance without hunting for the right period.
- As a PR Admin, I want the system to show me exactly which blockers exist and how to resolve them before I can start the calculation, so that I never initiate a run on bad data.
- As a PR Admin, I want to see the employee count and total hours in scope before I trigger calculation, so that I can catch a scope error (wrong pay period, missing employees) before it becomes a problem.
- As a PR Admin running an off-cycle bonus run, I want to select specific employees and a run type without affecting the active regular pay period run.

### 8. Acceptance Criteria Themes
- The current open pay period is pre-populated as the default when the admin navigates to "Run Payroll" — no manual date entry required
- Run type options are presented and selectable: Regular, Off-Cycle (Termination, Bonus, Correction)
- Employee count in scope and total confirmed hours are displayed before the admin confirms initiation
- If any of the three readiness gate conditions are unmet, the "Calculate" action is disabled and each failing condition is shown with a named label and a resolution link
- The "Calculate" action becomes enabled only when all three gate conditions pass (green state)
- At Alpha: a simplified gate (time confirmed + active employees present) is sufficient; named blocker resolution paths are not required until Beta

### 9. Dependencies & Risks
- **E3 pay period lock / confirmation signal** — High risk; must be defined and testable at Alpha. This is the primary gate; if E3 cannot reliably expose a "confirmed" flag, the gate cannot function.
- **Employee Management / Company Setup** — Pay setup completeness check requires a queryable completeness status per employee; API contract needed before Beta
- **Risk:** If blockers are shown without clear resolution paths, admins may feel stuck and call support rather than self-serve — resolution links are P1 but should be treated as P0 for admin confidence

### 10. Success Metrics / KPIs
- Readiness gate blocker frequency by type (`readiness_blocker_surfaced` by `blocker_type`) — baseline metric; target: declining trend after launch as admins build better upstream habits
- Payroll runs that reach calculation with zero gate failures — target: >95% of runs after 3 months
- Admin time from "Run Payroll" click to calculation trigger — target: <2 minutes when no blockers exist

### 11. Assumptions
- E3 produces a persistent, queryable "locked" flag on a pay period that this epic can read synchronously at gate time
- Employee pay setup completeness is queryable as a boolean per employee from the Employee Management domain
- A single admin runs payroll per company at a given time; no concurrent initiation locking is needed at Alpha or Beta

---

## Epic E-RP-2 — Payroll Calculation Trigger & Status

### 1. Goal / Outcome
Once the admin clears the readiness gate, the system reliably invokes the E4 (earnings) and E5 (gross-to-net) calculation engines and keeps the admin informed with a meaningful progress state — from "Calculating" through to "Review Ready." Calculation errors are surfaced descriptively and allow the admin to retry without losing the run. This epic closes the gap between "I clicked Run" and "I can see results," making the calculation layer visible and trustworthy rather than a black box the admin simply waits through.

### 2. Primary Personas
- **PR Admin** — primary actor; waits for and monitors calculation progress
- **System / Platform** — orchestrates the engine invocations

### 3. Business & PRD Drivers
- **G1** — Eliminate the black box; admin needs to see that calculation is progressing
- **UC-1** — P0 at Alpha (simplified calculation)
- **FR: Payroll Calculation Trigger and Status** — trigger E4/E5, display progress, handle errors gracefully
- **NFR: Performance** — full calculation completes within 60 seconds for up to 200 employees; review screen loads within 5 seconds
- **NFR: Reliability** — interrupted calculation restores the run to a recoverable Draft state without data loss

### 4. Problem / Rationale
Admins currently click "Run Payroll" and either wait on a spinner with no progress information, or receive a cryptic error with no recovery path. For a 50–150 person construction crew, calculation can take meaningful time. Without visible progress and graceful error handling, admins lose confidence and either abandon the run or re-initiate it — potentially creating duplicate or corrupt run states.

### 5. In Scope
- Invocation of the E4 gross pay calculation engine upon admin confirmation from a readiness-clear state
- Sequential invocation of the E5 gross-to-net engine upon receipt of E4 output
- Run state transition: Draft → Calculating (on trigger), Calculating → Under Review (on completion)
- Calculation progress display: "Calculating payroll for [N] employees..." with a visible status indicator
- Graceful error handling: descriptive error message surfaced to admin, run state preserved in Draft (not stuck in Calculating), retry action available
- Durable state machine: a server failure mid-calculation must not result in a run permanently stuck in "Calculating" — requires a recovery/timeout mechanism
- At Alpha: simplified calculation (E4 regular wages + federal withholding only); no full E5 chain required

### 6. Out of Scope (for this epic)
- Calculation logic and rules — E4 and E5 engines respectively
- Async notification delivery (email/in-app) for large-run calculation completion — noted as a UX decision (OQ-1); may be added at Beta if calculation exceeds 60s for large runs
- AI anomaly detection — E11; triggered post-calculation but owned separately (E-RP-5)
- Display of computed results — E-RP-3

### 7. Example "Super Stories"
- As a PR Admin, I want to see a clear "Calculating payroll for 47 employees..." indicator after I trigger the run so that I know the system is working and how far along it is.
- As a PR Admin, if calculation fails, I want to see a plain-language error message and a Retry button so that I can recover without re-entering my run parameters.
- As an engineering platform, I want the calculation state machine to be durable so that a server failure mid-run restores to Draft rather than leaving the run stuck in "Calculating."

### 8. Acceptance Criteria Themes
- Upon admin confirmation, the run transitions from Draft to Calculating and the calculation progress screen is displayed
- Progress state shows employee count being calculated; run ID and pay period are visible during calculation
- Upon successful completion of E4 and E5, the run transitions to Under Review and the admin is navigated to the Payroll Run Review Screen (E-RP-3)
- If calculation fails, the run state reverts to Draft, a descriptive error is displayed, and a Retry action is presented — no manual support required for a single-engine error
- A run stuck in Calculating for longer than a defined timeout threshold (e.g., 5 minutes) is automatically flagged for recovery and the admin is notified
- At Alpha: simplified calculation (regular wages + federal withholding) completes and produces a per-employee gross pay summary

### 9. Dependencies & Risks
- **E4 calculation API** — High risk; Beta critical path. API schema (inputs/outputs) must be agreed before UI build begins; mock API with schema contract needed for parallel development
- **E5 gross-to-net API** — High risk; Beta critical path; sequential dependency on E4 output
- **OQ-1 (Open Question):** Synchronous vs. asynchronous calculation UX decision must be resolved in Sprint 1. For runs >60s, async with notification is preferred but adds complexity
- **Risk:** If E4 or E5 APIs are undefined at Beta build start, the review screen (E-RP-3) cannot be built against real data shapes

### 10. Success Metrics / KPIs
- Calculation completion rate within 60 seconds for runs of up to 200 employees — target: >95%
- Calculation error rate requiring admin retry — target: <2% of runs
- Run recovery rate from "stuck Calculating" state — target: 100% within defined timeout window

### 11. Assumptions
- E4 and E5 are invocable as internal services accepting a `pay_period_id` + employee scope and returning computed results per employee
- E11 anomaly detection is triggered post-calculation and is non-blocking to the calculation state transition (it blocks approval, not the review screen display)
- Calculation for up to 200 employees is achievable within 60 seconds; above that, async notification will be considered

---

## Epic E-RP-3 — Payroll Run Review Screen

### 1. Goal / Outcome
Give the PR Admin a single, complete view of every employee's computed payroll results — before a dollar is approved. The review screen replaces the "black box total" with a structured roster showing gross pay, deductions, taxes, and net pay per employee, plus aggregate totals and employer costs. This is the primary pre-approval surface: the admin's opportunity to catch anything wrong before the run is finalized. It is designed for speed under Friday-deadline pressure and clarity for a non-accountant audience.

### 2. Primary Personas
- **PR Admin** — primary actor; reviews computed results for all employees
- **Owner / Exec** — secondary; may view run summary before approval
- **External CPA / Bookkeeper** — read-only; confirming payroll was computed and ready

### 3. Business & PRD Drivers
- **G1** — Eliminate the black box; structured drill-down view before approval
- **UC-3, UC-10** — P0 use cases for Beta/GA
- **FR: Payroll Run Review Screen** — roster with per-employee columns, totals row, employer cost panel
- **NFR: Usability** — usable for a 50-person run without horizontal scrolling at 1440px desktop; no tax jargon
- **NFR: Performance** — screen loads within 5 seconds for up to 200 employees
- **User Insight 3** — job costing is the strategic differentiator; labor cost visibility is paramount
- **User Insight 2** — eliminating the "hodgepodge" of disconnected systems by surfacing all data in one place

### 4. Problem / Rationale
Generic payroll tools present a single "total payroll" figure and expect the admin to trust it. Construction SMB admins — who are often non-accountants running payroll for 20–100 employees across multiple jobs, trades, and rates — have no structured mechanism to verify that the right rate was applied to the right employee on the right job. Errors are discovered post-disbursement: checks already cut, bank accounts already debited. The review screen is the single most important UI surface for eliminating post-approval errors.

### 5. In Scope
- Employee roster table — one row per employee in the run, with columns: Name, Hours, Gross Pay, Total Deductions, Total Taxes Withheld, Net Pay
- Totals summary row pinned to the table: Total Gross, Total Deductions, Total Taxes, Total Net Pay, Total Employer Costs
- Employer cost panel: per-employee and total FICA employer portion, FUTA, SUTA, workers' comp estimate (P1)
- Visual change indicator: flag when a value differs materially from the prior payroll run for the same employee (P1 — inferred)
- Employee search / filter by name within the roster
- Summary header: pay period dates, employee count, run type, run state
- Entry point to Employee Calculation Drill-Down (E-RP-4) — clicking any employee row opens the detail view
- Entry point to AI Pre-Submission Checklist (E-RP-5) — checklist visible and interactive on this screen
- Entry point to Run-Level Adjustments (E-RP-6) — adjustment actions accessible per employee row
- "Approve & Submit Payroll" button anchored on this screen (gated by E-RP-5 and E-RP-7 logic)

### 6. Out of Scope (for this epic)
- Per-employee earnings line detail, trade/job breakdown — E-RP-4
- AI anomaly checklist logic and acknowledgment flow — E-RP-5
- Run-level adjustment mechanics (exclusion, hold, add item) — E-RP-6
- Approval action mechanics and confirmation modal — E-RP-7
- Payroll reporting and historical run report exports — E10

### 7. Example "Super Stories"
- As a PR Admin, I want to see every employee in the run on a single screen with their gross pay, deductions, taxes, and net pay so that I can scan for anything that looks wrong before I approve.
- As a PR Admin, I want to see the total net pay and employer cost at the bottom of the roster so that I know the full cash outflow before I commit.
- As a PR Admin, I want employees whose pay looks materially different from last period to be visually flagged so that I can investigate before approving.
- As an Owner, I want to view the run summary (total net pay, employee count, pay period) without accessing individual employee details.

### 8. Acceptance Criteria Themes
- All employees in scope are displayed in a single roster — no pagination that hides employees from view by default
- Roster columns are visible without horizontal scrolling on a 1440px desktop for runs up to 50 employees
- Totals row is always visible (pinned footer or equivalent) showing: total gross, total deductions, total taxes, total net, total employer costs
- Each employee row is clickable and opens the drill-down view (E-RP-4)
- Employees with a material change vs. prior period are visually indicated (e.g., icon or highlighted cell) — threshold defined by product/E11
- Screen loads within 5 seconds from "Under Review" state for a 200-employee run
- Employer cost panel is visible on the screen for authorized roles
- The AI checklist and Approve button are present on this screen and respond to E-RP-5 / E-RP-7 gate logic

### 9. Dependencies & Risks
- **E-RP-2** — Review screen cannot render until calculation is complete and results are stored in `PayrollRunEmployee` and `PayrollRunEarningsLine`
- **E4 / E5 API schema** — Column data (gross pay, deductions, taxes, net pay) must be shaped by the agreed API response schema; schema freeze needed before UI build
- **OQ-2 (Open Question):** Whether employer-side cost totals can be displayed here or are report-only (E10) must be resolved before Beta design
- **OQ-4 (Open Question):** Whether the "this payroll is $X more/less than last period" comparison header is owned by this epic or by E11
- **Risk:** A poorly designed roster (too many columns, no visual hierarchy) will slow admin review time and increase the risk that errors are missed — UX testing needed before Beta

### 10. Success Metrics / KPIs
- Admin time spent on payroll review-and-approve step — target: <20 minutes per run
- Employee drill-down engagement rate (`employee_detail_viewed` / total employees in run) — baseline metric; indicates admin is actually reviewing, not just approving
- Payroll errors discovered post-approval — target: <1% of runs
- Review screen load time for 200-employee run — target: <5 seconds

### 11. Assumptions
- The employer-side cost totals are available from E4/E5 output (not exclusively from E10 reporting) — flagged as OQ-2 for resolution
- Material change threshold (what constitutes a "flag-worthy" variance vs. prior period) will be defined by product in collaboration with E11

---

## Epic E-RP-4 — Employee Calculation Drill-Down

### 1. Goal / Outcome
Give the PR Admin (and authorized reviewers) the ability to open any employee's record during a payroll run and see a complete, human-readable breakdown of how that employee's pay was calculated — from each time entry through to net pay. Every dollar is traceable: which rate applied to which hours, on which job and trade, with all deductions and tax withholdings itemized by type. This directly eliminates the "black box" failure mode and gives admins the evidence they need to either trust a result or escalate a correction — without leaving the payroll review workflow.

### 2. Primary Personas
- **PR Admin** — primary actor; investigates individual employee computations
- **External CPA / Bookkeeper** — read-only reviewer; confirming calculations for specific employees

### 3. Business & PRD Drivers
- **G1** — Full drill-down into computed results; rate/job traceability
- **UC-4** — P0 use case for Beta/GA
- **FR: Payroll Run Review Screen** — per-employee drill-down: earnings by pay type, trade/job breakdown, deductions, taxes, net pay
- **User Insight 3** — job costing is the strategic differentiator; rate-to-job traceability is what generalist tools cannot provide
- **User Insight — Pay Stub as Trust Artifact** — transparency in how pay was computed builds workforce trust and prevents disputes

### 4. Problem / Rationale
When a construction SMB admin sees that an employee's gross pay looks wrong, they currently have no way to investigate within the payroll tool. They exit to their time tracking spreadsheet, manually cross-reference hours, and try to reverse-engineer the calculation. This takes 10–30 minutes per employee, often kills the Friday payroll run timeline, and frequently results in approving a questionable run anyway due to time pressure. The drill-down view eliminates this loop by bringing the source data to the admin.

### 5. In Scope
- Earnings detail panel: each pay type listed separately — Regular, Overtime, Double-Time, Holiday, PTO, Supplemental — with hours, rate, and amount per line
- Trade / job breakdown: each earnings line shows which trade type and job code the rate was applied to, traceable to the source time entries
- Deductions panel: pre-tax deductions (401k, HSA, etc.) and post-tax deductions (garnishments, benefits) listed line by line with labels and amounts
- Tax withholding panel: federal income tax, state income tax, local taxes, employee FICA (Social Security, Medicare) — each on its own line with jurisdiction label
- Net pay display with payment method (ACH — last 4 digits of account, or "Check")
- Employer cost breakdown per employee: FICA employer portion, FUTA, SUTA, workers' comp estimate (P1)
- Read-only view for prior runs (accessed from run history — E-RP-8) — GA
- Navigation back to the run review roster without losing position

### 6. Out of Scope (for this epic)
- Editing time entries from the drill-down — time entries are locked at this stage; corrections require E3 and a recalculation
- Run-level adjustment actions (exclusion, hold) — E-RP-6 (though entry points to E-RP-6 may be surfaced in the drill-down UI)
- Pay stub generation or delivery — E7
- Tax calculation logic — E5

### 7. Example "Super Stories"
- As a PR Admin, I want to open any employee's drill-down and see exactly which rate was applied to each time entry on each job, so that I can verify the right rate was used without leaving the payroll review screen.
- As a PR Admin, I want to see the employee's deductions and tax withholdings listed line by line so that I can confirm the gross-to-net calculation looks correct before approving.
- As an External CPA reviewing a run, I want to view an employee's earnings breakdown in read-only mode so that I can confirm the calculation for an employee whose pay was questioned.

### 8. Acceptance Criteria Themes
- Clicking any employee row on the review roster opens that employee's drill-down detail
- Earnings are listed by pay type with hours, rate, and dollar amount — each pay type on its own row
- Each earnings line identifies the job code and trade type associated with the rate applied
- Deductions are listed separately by type: pre-tax and post-tax, each labeled in plain language
- Tax withholding is listed by jurisdiction (federal, state, local) and component (income tax, FICA) — no unexplained line items
- Net pay and payment method are displayed prominently at the bottom of the panel
- Navigation back to the full roster is available and returns the admin to their position in the list
- For prior-run drill-down (GA): the view is read-only; no approval or adjustment actions are available

### 9. Dependencies & Risks
- **E-RP-2 / E4 & E5 schema** — The drill-down is only as detailed as the `PayrollRunEarningsLine` data returned by E4; if E4 does not return job code and trade type per earnings line, this view cannot show traceability
- **Risk:** If construction-specific rate traceability (job/trade breakdown) is not in E4's output schema, this epic loses its primary differentiating value — schema negotiation with E4 team is critical before Beta build
- **E5 output schema** — Deduction and tax line items must be structured (not aggregated) to support the line-by-line display

### 10. Success Metrics / KPIs
- Employee drill-down engagement rate — target: admins view drill-down for at least 20% of employees in each run (indicating active review, not rubber-stamp approval)
- Post-approval payroll errors attributable to wrong rate / wrong job — target: <0.5% of runs after drill-down is available (compared to baseline)
- Admin time per employee investigated — target: <2 minutes to answer "was this employee paid correctly?"

### 11. Assumptions
- E4 returns earnings results at the earnings-line level (not aggregated by employee), with `job_code`, `cost_code`, `trade_type`, `pay_type`, `hours`, `rate`, `amount` per line — as reflected in the `PayrollRunEarningsLine` data model
- E5 returns deductions and tax withholdings in a structured, line-by-line format per employee, not as a single aggregated gross-to-net delta

---

## Epic E-RP-5 — AI Pre-Submission Checklist

### 1. Goal / Outcome
Surface all AI-generated anomaly flags from E11 as an interactive, mandatory checklist on the Payroll Run Review screen. Every flag must be acknowledged or dismissed — with a reason — before the "Approve & Submit" button becomes active. This creates a structured, documented pre-approval moment that catches high-probability errors (gross pay spikes, zero-pay employees, unusually high hours, new employees included unexpectedly) before money moves — without adding cognitive overhead for healthy runs with no flags.

### 2. Primary Personas
- **PR Admin** — primary actor; reviews and acts on each checklist item
- **External CPA / Bookkeeper** — indirect; dismissed flags and reason codes are part of the audit record they review

### 3. Business & PRD Drivers
- **G2** — All exceptions, anomalies, and pre-approval blockers resolved before approval; no silent pass-throughs
- **UC-5** — P0 use case for Beta/GA
- **FR: AI Pre-Submission Checklist** — surface E11 flags; require 100% acknowledgment/dismissal before approval
- **NFR: Usability** — checklist items in plain language; no tax jargon
- **NFR: Audit** — dismissed items and reason codes logged immutably
- **User Insight 1** — SMBs want a "safety net" that catches errors before they become compliance problems
- **User Insight — Idea Zone A (Safety Net)** — AI-driven "Payroll Health Check" agents that flag variances before processing

### 4. Problem / Rationale
Anomaly detection without a structured acknowledgment requirement is decoration. Admins under Friday deadline pressure will scroll past warnings. The AI checklist is only valuable if it creates a mandatory, traceable decision point: the admin must either confirm "I see this and it's correct" or confirm "I see this and I'm dismissing it because X." The risk of the opposite design pattern — a "click to dismiss" fatigue loop — is explicitly documented in the PRD's risk register and must be designed against.

### 5. In Scope
- Display of all anomaly flags generated by E11 as a visible, interactive checklist on the review screen
- Per-flag display: anomaly type label, affected employee name(s), plain-language description, and action options
- Action options per flag: **Acknowledge** ("I reviewed this; it's correct") or **Dismiss** (requires a reason code from a defined list)
- "Approve & Submit" button is disabled until every flag has been either acknowledged or dismissed
- Dismissed items logged immutably: anomaly type, affected employee, dismiss reason, actor, timestamp — part of the run audit record
- Flags that require employee drill-down: "View employee detail" link surfaces the drill-down (E-RP-4) from within the checklist item
- Empty state: when no anomaly flags are present, the checklist section displays a clear "No anomalies detected" confirmation — approval is not silently bypassed
- Flag types supported at Beta: gross pay deviation >X% from prior period, zero-pay employees, unusually high hours, duplicate-looking entries, new employees included in the run

### 6. Out of Scope (for this epic)
- AI anomaly detection logic and model — E11; this epic surfaces E11's structured output, it does not generate flags
- Configuring anomaly sensitivity thresholds — E11 / product configuration; not an admin-facing setting in this epic
- AI recommendations for corrections — E11; this epic surfaces flags and requires a decision, not a recommended fix

### 7. Example "Super Stories"
- As a PR Admin, I want to see a list of all payroll anomalies flagged by the AI before I approve, so that I can make an informed decision on each one rather than being surprised by errors after disbursement.
- As a PR Admin, I want to acknowledge that a flagged high-hours entry is correct (I know this employee worked overtime this week) so that the system records my decision and moves on.
- As a PR Admin, I want to dismiss a flagged anomaly with a reason code so that my decision is documented and the auditor can see I didn't just ignore it.
- As a CPA reviewing a completed run, I want to see all dismissed flags and their reason codes in the audit record so that I can confirm the admin made deliberate decisions.

### 8. Acceptance Criteria Themes
- All anomaly flags from E11 are displayed on the review screen before the approval button is active
- Each flag displays: anomaly type, affected employee(s), a plain-language description (no tax codes or jargon), and action buttons
- "Approve & Submit" button remains disabled until every flag has received an Acknowledge or Dismiss action
- Dismiss action requires selection of a reason code from a defined list; free text may accompany but is not required
- All dismissed flags are written to `AIChecklistItem` with immutable audit fields (actor, timestamp, dismiss reason)
- When zero anomaly flags are present, the checklist section displays a "No anomalies detected" confirmation and the approve button is enabled (subject to other gates)
- The checklist does not use technical jargon — each flag description is understandable by a non-accountant admin

### 9. Dependencies & Risks
- **E11 anomaly detection API** — Medium risk; Beta critical path. Output schema (anomaly type, affected employee IDs, plain-language description) must be agreed before this epic can be built; AI model can be a placeholder at Beta with schema-conformant mock output
- **Risk: Dismiss fatigue** — if flags are too numerous, too low-confidence, or triggered by expected behavior, admins will develop a habit of mass-dismissing without review. Mitigation: limit to high-confidence, high-impact anomaly types; monitor dismiss rate by anomaly type and adjust E11 sensitivity
- **Risk:** If E11 output is delayed post-calculation, the transition from "Calculating" to "Under Review" must gate on E11 completion or display the checklist asynchronously — coordination needed with E-RP-2

### 10. Success Metrics / KPIs
- AI checklist acknowledgment vs. dismissal rate by anomaly type (`ai_checklist_acknowledged` / `ai_checklist_dismissed`) — baseline metric for E11 calibration
- Runs approved with dismissed (not acknowledged) flags — tracked via `payroll_run_approved` where `ai_dismissed_count > 0` — compliance indicator
- Post-approval errors on runs with zero anomaly flags vs. runs with flags — quality indicator for E11 value
- Admin time spent on checklist per run — target: <3 minutes for runs with ≤5 flags

### 11. Assumptions
- E11 generates anomaly flags asynchronously post-calculation but before the review screen is displayed to the admin; flags are available when the admin first sees the review screen
- E11 output conforms to a structured schema: `{ anomaly_type, affected_employee_id[], description, confidence_level }` — confidence filtering (only high-confidence flags surface) is applied by E11 before output, not by this epic
- Dismiss reason codes are defined and agreed by product before Beta; the list is finite and auditor-appropriate

---

## Epic E-RP-6 — Run-Level Adjustments & Overrides

### 1. Goal / Outcome
Give authorized admins a targeted correction mechanism during the pre-approval review phase: exclude a specific employee from the current run, place an employee's disbursement on hold, or add an off-cycle pay item (bonus, correction) to an in-scope employee. Each adjustment is scoped to that employee, logged with a reason, and triggers a scoped recalculation — so the admin can resolve a specific issue without tearing down and re-running the entire payroll. This eliminates the "full re-run or nothing" pattern that plagues current SMB payroll tools.

### 2. Primary Personas
- **PR Admin** — primary actor; authorizes and executes run-level adjustments
- **Owner / Exec** — may have approval authority for adjustments above a threshold (OQ-3 — open question)

### 3. Business & PRD Drivers
- **G4** — Enable run-level adjustments without requiring a full payroll re-run
- **UC-6** — P1 use case for Beta/GA
- **FR: Run-Level Adjustments** — employee exclusion with reason code, disbursement hold, off-cycle item addition, scoped recalculation
- **NFR: Audit** — every adjustment logged immutably with actor, timestamp, reason
- **User Insight — Theme 3 (Automation of Nuisance Work)** — correction workflows are a major pain point; guided workflows to fix mistakes without breaking GL integrity

### 4. Problem / Rationale
In current SMB payroll tools, if an admin spots an issue with one employee during review, their options are: approve the run anyway (accepting the error), or void the entire run and start over. Both options are bad. The first propagates the error; the second costs 30–60 minutes and may miss the Friday deadline. Run-level adjustments give the admin surgical control — handle the specific problem without restarting.

### 5. In Scope
- **Employee Exclusion:** Admin can remove a specific employee from the current run. Requires a reason code (from a defined list). Exclusion is logged. Excluded employee is not paid in this run and must be handled in a subsequent run or off-cycle run.
- **Disbursement Hold:** Admin can flag a specific employee's disbursement to be held for manual review without excluding them from the payroll calculation. Employee is calculated and approved; disbursement is held at E6 level until manually released. (P1)
- **Off-Cycle Item Addition:** Admin can add a one-time pay item (bonus amount, correction amount) to an in-scope employee during run review. Amount, type, and rationale are logged. (P1 — GA)
- **Scoped Recalculation:** Any adjustment that affects an employee's pay (exclusion removes them; off-cycle addition changes their total) triggers a scoped recalculation for that employee only — not a full run restart
- Adjustment actions accessible from employee rows on the review roster and from the employee drill-down view
- All adjustments logged immutably in `PayrollRunAuditLog` and `PayrollRunEmployee.state`

### 6. Out of Scope (for this epic)
- Time entry corrections — must be done in E3 before payroll run initiation; admins cannot edit time from this epic
- Rate or setup corrections — require changes to employee setup; the run must be re-initiated after setup is corrected
- Full payroll re-run — this epic specifically avoids that; re-run is a separate admin action through E-RP-1
- Off-cycle run initiation (full off-cycle workflow for a separate pay period) — E-RP-9
- Releasing a disbursement hold — this is an E6 / disbursement management action, not a payroll run action

### 7. Example "Super Stories"
- As a PR Admin, I want to exclude an employee from this run because their time entries look wrong, so that I can pay everyone else on time and correct that employee's pay in an off-cycle run next week.
- As a PR Admin, I want to hold one employee's disbursement while letting the rest of the run proceed, so that I can investigate a bank account issue without delaying everyone else's payday.
- As a PR Admin, I want to add a bonus amount for one employee directly in the run review screen without restarting the entire run, so that I can handle a last-minute bonus without missing the payroll deadline.

### 8. Acceptance Criteria Themes
- Employee exclusion is available as an action on any employee row in the review roster
- Exclusion requires selection of a reason code; the action is rejected without one
- Excluded employees are removed from totals calculations and visually marked as excluded in the roster
- Any adjustment affecting pay triggers a scoped recalculation for the affected employee(s) only; other employees' results are not recalculated
- After scoped recalculation, the totals row updates to reflect the adjusted amounts
- All adjustments (exclusion, hold, off-cycle addition) are written to the audit log with actor, timestamp, and reason
- The disbursement hold flag is passed to E6 at approval time; E6 withholds payment for held employees without blocking the rest of the run
- Off-cycle item addition (GA) requires amount, pay type, and reason; triggers recalculation for that employee

### 9. Dependencies & Risks
- **E-RP-2 / E4 + E5** — Scoped recalculation must be supported by the E4/E5 engines (ability to recalculate a subset of employees by `employee_id` list within an existing run context); this is a non-trivial API requirement
- **E6 (Disbursement)** — Disbursement hold flag must be passed in the approval payload and honored by E6; coordination required on the data contract
- **Risk:** If E4/E5 do not support scoped (single-employee) recalculation, the only options are full re-run or no recalculation — engineering dependency must be confirmed early
- **Risk:** Adjustment actions must be RBAC-gated; if any user can exclude an employee from a run, this becomes a compliance and fraud risk

### 10. Success Metrics / KPIs
- Run-level exclusions per run (`employee_excluded_from_run` by `reason_code`) — operations metric; high exclusion rates indicate upstream data quality issues
- Runs requiring a full restart due to inability to make targeted adjustments — target: <5% of runs after E-RP-6 is available
- Admin time to resolve a single-employee issue during review — target: <5 minutes including recalculation

### 11. Assumptions
- E4 and E5 engines support scoped recalculation by employee ID subset within an existing run context — this must be confirmed before Beta build
- RBAC for adjustment actions is defined: Admin role can exclude and hold; off-cycle item addition may require Owner co-approval above a threshold (OQ-3 — open question)
- Disbursement hold is a flag passed to E6, not a mechanism owned by this epic; E6 owns the release workflow

---

## Epic E-RP-7 — Approval Action & Run Finalization

### 1. Goal / Outcome
Make the payroll approval action explicit, intentional, and irreversible — and ensure it carries the legal and financial weight it deserves. The "Approve & Submit Payroll" button is enabled only when all pre-conditions are satisfied, presents a clear confirmation modal with the full financial commitment, and upon confirmation executes an irreversible state transition that creates an immutable audit record and triggers disbursement (E6), GL posting (E9), and pay stub generation (E7). No payroll moves without a deliberate, documented human decision.

### 2. Primary Personas
- **PR Admin** — primary actor; executes the approval
- **Owner / Exec** — may be required as a second approver above a company size threshold (OQ-3 — open question for GA)
- **External CPA / Bookkeeper** — audit consumer; verifies that an approval occurred and who authorized it

### 3. Business & PRD Drivers
- **G3** — Approval action explicit, intentional, and irreversible with clear state transition and audit record
- **G2** — No approval while any blocking exception or unresolved AI flag is open
- **UC-7** — P0 use case for Beta/GA
- **FR: Approval Action** — gated enable, confirmation modal, irreversible close, downstream triggers, idempotency
- **NFR: Audit** — every approval logged immutably with approver, timestamp, amounts
- **NFR: Security / RBAC** — Admin role required to approve
- **User Insight 1** — Owners need liability protection; an explicit, auditable approval record is the system's "safety net" for the admin

### 4. Problem / Rationale
In generic payroll tools, approval is often implicit — clicking "Submit" is treated the same as "Approve," with no structured confirmation of what is being authorized. For a construction SMB admin authorizing $50K–$500K in weekly payroll, this is inadequate. An accidental double-click, a confused admin, or a test run mistakenly submitted can trigger real ACH disbursements. The approval action must be a distinct, friction-appropriate moment with full financial disclosure.

### 5. In Scope
- **Approval Gate Logic:** "Approve & Submit Payroll" button is enabled only when: (1) all AI checklist items are acknowledged or dismissed (E-RP-5), (2) no blocking exceptions are open, (3) run is in "Under Review" state
- **Confirmation Modal:** Displayed on button press, containing: number of employees being paid, total net pay amount, pay period start and end dates, scheduled pay date, and an explicit statement that the action is irreversible
- **Approval Execution:** On admin confirmation — run state transitions to "Approved"; an immutable approval audit record is created containing: approver identity, timestamp, employee count, total gross, total net, pay period dates
- **Downstream Triggers (on Approval):** Async trigger to E6 (ACH/check disbursement); async trigger to E9 (GL journal entry and job cost posting); async trigger to E7 (pay stub generation)
- **Idempotency:** A second submission of the same approval (network retry, double-click) must not trigger a duplicate downstream event; idempotency enforced via idempotency key on the approval action
- **Duplicate Prevention:** If an admin attempts to approve an already-approved run, a clear error is displayed — "This payroll run has already been approved on [date] by [name]"
- **Post-Approval State Display:** Immediately after approval, the run summary screen shows: "Payroll Approved — [date/time], Approved by [Admin Name]," total net disbursement, employee count, and scheduled pay date

### 6. Out of Scope (for this epic)
- Disbursement execution and ACH/check generation — E6
- GL journal entry generation — E9
- Pay stub generation — E7
- Run state transitions beyond "Approved" (Disbursed, Closed) — triggered by E6/E9/E7 confirmation events; state machine managed in E-RP-8
- Two-person approval workflow (Admin initiates, Owner confirms) — noted as a GA consideration (OQ-3); not in scope for Beta

### 7. Example "Super Stories"
- As a PR Admin, I want the Approve button to be clearly disabled until I've resolved all anomaly flags and blockers, so that I cannot accidentally approve a run I haven't fully reviewed.
- As a PR Admin, I want a confirmation dialog that shows me exactly how many employees I'm paying, the total net amount, and the pay period dates before I commit, so that I can catch a scope error at the last moment.
- As a PR Admin, I want to know that if I click Approve twice by accident, the system only submits one payroll — not two disbursements.
- As an Owner reviewing an approved run, I want to see who approved it and when, with the exact amounts authorized.

### 8. Acceptance Criteria Themes
- "Approve & Submit Payroll" button is disabled (visually and functionally) if any AI checklist item is unresolved or any blocking exception is open
- Button is enabled when the run is in "Under Review" state with all gates cleared
- Confirmation modal displays: employee count, total net pay, pay period dates, scheduled pay date, and an irreversibility statement — before the admin can confirm
- Admin must explicitly confirm (second click / "I Understand" action) — the modal does not auto-dismiss
- Upon confirmation, run state transitions to "Approved" atomically with the creation of the audit record
- Audit record contains: approver user ID and name, timestamp (UTC), employee count, total gross, total net, pay period dates
- Downstream triggers (E6, E9, E7) are fired within 5 seconds of approval confirmation
- A second approval attempt on the same run returns an error message; no duplicate downstream triggers are fired
- The post-approval summary is immediately displayed showing the run's approved state, approver, and amounts

### 9. Dependencies & Risks
- **E-RP-5** — Approval gate logic depends on AI checklist state; checklist must expose a "all items resolved" boolean queryable by this epic
- **E6 (Disbursement)** — High risk; the approval trigger to E6 must be idempotent end-to-end; E6 must deduplicate on `run_id`. Idempotency contract must be agreed before GA.
- **E9, E7** — Async parallel triggers; failures in E9 or E7 must not roll back the approval. Compensation/retry strategies needed.
- **Risk: Double-submission creating duplicate ACH** — Low probability but critical impact; idempotency key implementation is non-negotiable for GA
- **OQ-3 (Open Question):** Two-person approval authority model for GA — if required, this is a significant scope addition; must be resolved before GA planning

### 10. Success Metrics / KPIs
- Payroll runs approved with unresolved blocking exceptions — target: 0 (enforced by gate logic)
- AI anomaly checklist items acknowledged or dismissed before approval — target: 100% (enforced)
- Duplicate approval events / duplicate disbursement triggers — target: 0
- Admin time from "review complete" to approval confirmation — target: <2 minutes (confirmation should be fast once review is done)

### 11. Assumptions
- The approval action in this epic is the authoritative trigger for E6 disbursement; E6 will not initiate disbursement without a confirmed "Approved" run state from this epic
- E6, E9, and E7 downstream triggers are asynchronous; failures in those systems do not roll back the Approved state (they are handled by their respective retry/compensation mechanisms)
- At Beta, disbursement triggering to E6 is still stubbed/manual per E6's Beta scope; the approval action creates the audit record and signals intent, but live ACH is a GA behavior

---

## Epic E-RP-8 — Run State Management & History

### 1. Goal / Outcome
Give every payroll run a persistent, visible state and give every authorized user a reliable run history. Admins always know where a run is in the process — Draft, Calculating, Under Review, Approved, Disbursed, or Closed — without needing to remember or ask. Past runs are accessible with their full summary, and at GA, individual employee-level detail is browsable for any prior run. This eliminates the "Did I approve that?" confusion that plagues the current experience and gives CPAs and owners the audit trail they need.

### 2. Primary Personas
- **PR Admin** — primary actor; monitors run state and accesses run history
- **Owner / Exec** — reviews run history for financial oversight
- **External CPA / Bookkeeper** — reads run history for audit and reconciliation

### 3. Business & PRD Drivers
- **G5** — Persistent payroll run history; always know what was run, when, by whom, and for how much
- **UC-8** — P1 use case for Beta/GA
- **FR: Run State Management** — six-state machine, enforced transitions, single active regular run per pay period
- **FR: Payroll Run History** — history list with run summary; prior-run drill-down at GA
- **NFR: Audit** — every state transition logged immutably
- **User Insight 2** — eliminating "Did I approve that?" confusion; single source of truth for payroll status

### 4. Problem / Rationale
Admins in current SMB tools lose track of run state constantly: "Is this payroll approved or still pending?" "Did I submit last week's or just calculate it?" There is no persistent run object with visible status — just a "last run" timestamp. Multi-week historical access is typically locked behind reports that require specific date filters. The run state machine and history give payroll the same operational clarity that financial systems provide for AP/AR.

### 5. In Scope
- **Run State Machine:** Six defined states with enforced, unidirectional transitions:
  - Draft → Calculating (on run initiation, post readiness gate)
  - Calculating → Under Review (on calculation complete)
  - Under Review → Approved (on admin approval confirmation)
  - Approved → Disbursed (on E6 disbursement confirmation received)
  - Disbursed → Closed (on pay period official close)
- Current run state displayed prominently in the run dashboard and run header
- State transition logged immutably in `PayrollRunAuditLog` for every transition: actor, timestamp, from-state, to-state
- Concurrency rule: only one regular payroll run per pay period per company may exist in Draft, Calculating, or Under Review simultaneously; off-cycle runs are separate
- **Run History List:** Paginated list of all payroll runs for the company — run ID, pay period dates, run type, employee count, total gross, total net, approver name, approval timestamp, final state
- Admin can view any prior run's summary from the history list (P1)
- Admin can drill into a prior run's employee-level detail in read-only mode (P1 — GA)
- Run state visible to Owner and CPA in read-only mode per RBAC

### 6. Out of Scope (for this epic)
- Payroll reporting, exports, and historical run reports — E10
- Voiding or rolling back an approved run — noted as OQ-6; not in scope for Beta or GA (correction via off-cycle run)
- Multi-company run management (company-switcher) — platform-level feature; not scoped here

### 7. Example "Super Stories"
- As a PR Admin, I want to see the current run's state (e.g., "Under Review") prominently on the payroll dashboard so that I always know where I am in the process without having to click through screens.
- As an Owner, I want to browse the last 12 months of payroll runs and see total net pay, employee count, and who approved each one, so that I can reconcile payroll outflows with my bank statements.
- As a CPA, I want to view the run history and confirm that every pay period has a corresponding "Approved" or "Closed" run, so that I can account for all payroll periods in the fiscal year.
- As a PR Admin, I want the system to prevent me from accidentally creating a second regular run for the same pay period that already has an active run in progress.

### 8. Acceptance Criteria Themes
- Every payroll run has exactly one of six defined states at any point in time; invalid state transitions are rejected
- Current run state is displayed prominently in the payroll dashboard for any in-progress run
- Every state transition is written atomically to the audit log with actor, timestamp, and state change
- Only one regular run per company per pay period may be in Draft, Calculating, or Under Review at any time; a second initiation attempt returns a clear blocking error
- The run history list displays all runs with run type, pay period, employee count, total net, approver, and final state
- Prior run summaries are accessible from the history list in read-only mode
- Prior run employee-level drill-down (GA) opens the same drill-down view as E-RP-4 in read-only mode

### 9. Dependencies & Risks
- **E6 (Disbursement)** — The Approved → Disbursed transition is triggered by an inbound confirmation from E6; this epic must subscribe to E6's disbursement confirmation event
- **Risk:** If E6 confirmation events are delayed or missing, runs may remain in "Approved" indefinitely without transitioning to "Disbursed" — a timeout / manual override mechanism may be needed for GA
- **OQ-6 (Open Question):** What happens if a run is approved but E6 disbursement fails for all employees? Void/rollback vs. off-cycle correction — must be resolved for GA planning. Current assumption: correction via off-cycle run; no void capability at GA.

### 10. Success Metrics / KPIs
- Payroll run state accurately reflects actual run progress — target: 100% (operational SLA)
- Admin "Did I approve that?" support tickets or confusion events — target: near-zero after E-RP-8 is available
- Run history accessibility — target: 100% of prior runs accessible from the history list within the company's data retention window

### 11. Assumptions
- E6 emits a reliable, structured disbursement confirmation event keyed on `run_id` that this epic can consume to drive the Approved → Disbursed transition
- "Pay period official close" (the Disbursed → Closed trigger) is defined by a system-level or admin-level close action; not automatically time-based at Beta
- The platform supports durable state machine storage such that a server failure does not result in a run stuck in an intermediate state without a recovery path

---

## Epic E-RP-9 — Off-Cycle Run Workflow

### 1. Goal / Outcome
Give PR Admins a first-class, scoped workflow for initiating, calculating, reviewing, and approving payroll runs outside the regular weekly cycle — covering termination final pay, ad-hoc bonuses, and payroll corrections. Off-cycle runs use the same calculation engines and review-and-approve workflow as regular runs, but are scoped to specific employees and a specific run type. This eliminates the most friction-heavy workaround in construction SMB payroll: re-running the entire payroll just to issue one final paycheck or bonus — and ensures termination final pay is handled correctly per applicable state rules.

### 2. Primary Personas
- **PR Admin** — primary actor; initiates, reviews, and approves off-cycle runs
- **Owner / Exec** — may initiate or observe off-cycle runs for executive-level compensation
- **External CPA / Bookkeeper** — audit consumer; off-cycle runs must be clearly identified in run history

### 3. Business & PRD Drivers
- **G4** — Enable off-cycle run initiation without requiring a full payroll re-run
- **G5** — Off-cycle runs stored in run history, linked to affected employee records
- **UC-9** — P0 use case for GA
- **FR: Off-Cycle Run Initiation** — type selection (Termination, Bonus, Correction, Other), employee selection, effective date, same E4/E5 engines, same review/approve workflow
- **FR: Termination run** — surfaces applicable state final pay rules and required pay date
- **User Insight 5 (Scale-Up Cliff)** — growing SMBs face increasing off-cycle complexity; a native workflow prevents them from outgrowing the platform
- **User Insight — Theme 3 (Automation of Nuisance Work)** — correction workflows are a major pain point; guided workflows must be built in from the start

### 4. Problem / Rationale
Construction SMBs have a high turnover rate and project-based staffing, which means terminations, mid-cycle bonuses, and payroll corrections are frequent — not edge cases. Current SMB tools require a full payroll re-run to handle these, which is disruptive, time-consuming, and error-prone. Termination final pay has strict statutory deadlines in many states; missing them exposes the employer to penalties. An off-cycle run workflow gives the admin the right tool for the job without touching the regular pay period.

### 5. In Scope
- **Off-Cycle Initiation Wizard:** Step-by-step flow:
  1. Run type selection: Termination, Bonus, Correction, Other
  2. Employee selection (one or more specific employees)
  3. Effective date and pay period for this off-cycle run
  4. Pre-initiation summary: employee count, run type, effective date
- **Termination Run — State Final Pay Surfacing:** For termination off-cycle runs, the system surfaces applicable state final pay rules (from E4) and the legally required pay date for the affected employee(s) — plain-language display, not legal advice
- **Calculation:** Same E4 and E5 engines invoked, scoped to selected employees and run type; same calculation trigger and status (E-RP-2) behavior
- **Review & Approve:** Same review screen (E-RP-3), drill-down (E-RP-4), AI checklist (E-RP-5), and approval action (E-RP-7) as regular runs — scoped to this run's employees
- **Run Storage:** Off-cycle run stored in run history (E-RP-8), clearly identified by run type; linked to affected employee records
- **Concurrent with Regular Run:** Off-cycle runs may be initiated independently of the regular pay period run; they do not share state with the regular run concurrency constraint

### 6. Out of Scope (for this epic)
- Termination pay rules themselves (calculation logic) — E4
- Multi-state final pay rule management — E4 / compliance configuration
- Correction to a prior payroll period that has already been Closed (amended return scenarios) — requires coordination with E5/E10; not in scope for GA
- Certified payroll (WH-347) generation — future capability identified in User Insights as a Phase 2 priority
- Union final pay rules — complex; deferred beyond GA

### 7. Example "Super Stories"
- As a PR Admin, I want to initiate a termination off-cycle run for one employee, see the state's final pay deadline displayed, and approve that employee's final check without touching the regular weekly payroll.
- As a PR Admin, I want to run a bonus off-cycle run for three employees after a project closes, calculate their bonus pay, review it on the same screen I use for regular payroll, and approve it in one workflow.
- As a CPA reviewing the run history, I want to see all off-cycle runs clearly labeled by type (Termination, Bonus, Correction) alongside regular runs so that I can reconcile all payroll activity for the period.
- As a PR Admin, I want to initiate a correction off-cycle run to address an underpayment from a prior week without worrying that it will interfere with the current week's regular run.

### 8. Acceptance Criteria Themes
- The off-cycle initiation wizard guides the admin through run type, employee selection, and effective date in a distinct flow from regular run initiation
- Termination off-cycle runs surface the applicable state final pay deadline in plain language before calculation is triggered
- Off-cycle calculations use the same E4/E5 engines scoped to the selected employees and run type; results are correct for the run type (e.g., termination final pay includes PTO payout where applicable per state rules)
- The off-cycle review screen, drill-down, AI checklist, and approval action behave identically to regular runs but scoped to this run's employees
- Off-cycle runs appear in run history clearly labeled by type; clicking a history item shows the off-cycle run's summary
- An off-cycle run can be initiated and completed without affecting the state of any concurrent regular pay period run
- A termination off-cycle run can be scoped, calculated, reviewed, and approved for a single employee without the regular pay period being re-run

### 9. Dependencies & Risks
- **E4 (Earnings & Rate Calculation)** — Must support off-cycle run types and return the correct earnings for termination (including PTO payout where applicable), bonus, and correction scenarios; state final pay rule data must be available from E4
- **E5 (Tax Withholding)** — Must handle supplemental rate withholding for bonus runs; must handle final pay tax scenarios
- **E-RP-2, E-RP-3, E-RP-4, E-RP-5, E-RP-7, E-RP-8** — This epic is a consumer of all core workflow epics; it must not deviate from the established patterns to avoid a fragmented UX
- **Risk:** State-specific termination final pay rules vary significantly; if E4's rule library is incomplete at GA, the "required pay date" surfacing may be inaccurate — must be clearly scoped to supported states
- **Risk: Concurrency** — An off-cycle run interleaved with an in-progress regular run for overlapping employees creates data conflicts; concurrency rules must be enforced (off-cycle runs for completed pay periods or employees not in an active regular run scope)

### 10. Success Metrics / KPIs
- Off-cycle runs initiated and completed without requiring a full regular payroll re-run — target: 100% of off-cycle scenarios
- Termination runs completed within the state-required final pay window — target: >99% (compliance metric)
- Admin time to initiate and approve a single-employee termination off-cycle run — target: <15 minutes

### 11. Assumptions
- E4 provides state final pay rules as a queryable attribute (state, pay-on-termination rules, final pay deadline) for at least the states in Prism's initial launch geography
- Off-cycle bonus runs use the supplemental federal withholding rate (22% flat); E5 handles this automatically based on run type
- Off-cycle runs for a pay period that has already been Closed are not supported at GA; admins are directed to open a new pay period or contact support for amended scenarios

---

## Traceability Table

| Requirement / UC ID | Short Description | Epic(s) |
|---------------------|-------------------|---------|
| G1 | Structured drill-down view before approval | E-RP-3, E-RP-4 |
| G2 | All exceptions resolved before approval | E-RP-1, E-RP-5, E-RP-7 |
| G3 | Explicit, irreversible approval with audit record | E-RP-7 |
| G4 | Run-level adjustments without full re-run | E-RP-6, E-RP-9 |
| G5 | Persistent run history | E-RP-8 |
| UC-1 | Initiate regular payroll run | E-RP-1 |
| UC-2 | Pre-run readiness gate; resolve blockers | E-RP-1 |
| UC-3 | View run review screen — all employees | E-RP-3 |
| UC-4 | Drill into employee calculation detail | E-RP-4 |
| UC-5 | Review and acknowledge/dismiss AI anomaly checklist | E-RP-5 |
| UC-6 | Exclude employee or hold disbursement | E-RP-6 |
| UC-7 | Approve payroll run with explicit confirmation | E-RP-7 |
| UC-8 | View payroll run status and history | E-RP-8 |
| UC-9 | Initiate and approve off-cycle run | E-RP-9 |
| UC-10 | View employer cost totals in run summary | E-RP-3 |
| FR: Run Initiation | Pay period pre-fill, run type, scope selection | E-RP-1 |
| FR: Pre-Run Readiness Gate | Three-part validation, blocker resolution | E-RP-1 |
| FR: Calculation Trigger & Status | E4/E5 invocation, progress state, error recovery | E-RP-2 |
| FR: Payroll Run Review Screen | Roster, totals, employer costs, change indicators | E-RP-3 |
| FR: Employee Drill-Down | Earnings lines, trade/job, deductions, taxes, net | E-RP-4 |
| FR: AI Pre-Submission Checklist | Surface E11 flags, mandatory acknowledgment, audit | E-RP-5 |
| FR: Run-Level Adjustments | Exclusion, hold, off-cycle addition, scoped recalc | E-RP-6 |
| FR: Approval Action | Gated button, confirmation modal, downstream triggers, idempotency | E-RP-7 |
| FR: Run State Management | Six-state machine, concurrency rule | E-RP-8 |
| FR: Payroll Run History | History list, prior-run summary and drill-down | E-RP-8 |
| FR: Off-Cycle Run Initiation | Wizard, type selection, state final pay rules | E-RP-9 |
| NFR: Performance | 5s review screen load; 60s calculation | E-RP-2, E-RP-3 |
| NFR: Availability | 99.9% during payroll windows | E-RP-2, E-RP-7 |
| NFR: Reliability | Interrupted calculation recovers to Draft | E-RP-2, E-RP-8 |
| NFR: Security / RBAC | Admin to run/approve; Owner read-only | E-RP-7, E-RP-8 |
| NFR: Audit | Immutable log for all transitions, dismissals, adjustments | E-RP-5, E-RP-6, E-RP-7, E-RP-8 |
| NFR: Usability | No horizontal scroll at 1440px; plain language | E-RP-3, E-RP-5 |
| OQ-1 | Sync vs. async calculation UX | E-RP-2 |
| OQ-2 | Employer costs in review vs. reports-only | E-RP-3 |
| OQ-3 | Two-person approval model at GA | E-RP-7 |
| OQ-4 | Period-over-period comparison header ownership | E-RP-3, E-RP-5 |
| OQ-5 | Multi-schedule run scoping | E-RP-1, E-RP-8 |
| OQ-6 | Approved run with failed disbursement — void vs. correct | E-RP-7, E-RP-8 |
| User Insight 1 (Compliance Trap) | Safety net; risk aversion | E-RP-1, E-RP-5, E-RP-7 |
| User Insight 2 (Data Silos) | Single source of truth; run history | E-RP-3, E-RP-8 |
| User Insight 3 (Job Costing) | Rate/trade traceability in drill-down | E-RP-4 |
| User Insight — Friday Crunch | Speed of review; targeted corrections | E-RP-3, E-RP-6 |
| User Insight — Nuisance Automation | Correction workflows; off-cycle runs | E-RP-6, E-RP-9 |
| User Insight — Scale-Up Cliff | Off-cycle complexity; termination rules | E-RP-9 |
