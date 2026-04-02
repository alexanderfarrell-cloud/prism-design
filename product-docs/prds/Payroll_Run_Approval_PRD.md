# PRD: Prism Construction Payroll — Payroll Run & Approval Workflow

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection (E3), Earnings & Rate Calculation (E4), Tax Withholding & Deductions (E5), Disbursement (E6), Pay Stubs (E7), Employee Self-Service Portal (E7b), Tax Filing (E8), Tax Remittance (E8b), Prism Accounting Integration (E9), Reporting & Audit (E10), AI Assistance (E11), Security & RBAC (E12).*

---

# 1. Initiative Definition

### 1a. Overview

The Payroll Run & Approval Workflow is the operational core of Prism Construction Payroll — the experience through which a PR Admin moves a pay period from "time confirmed" to "payroll approved and ready for disbursement." It is the conductor between the engines: it orchestrates the handoff from reviewed time (E3) into the calculation layer (E4 + E5), presents the computed payroll results to the admin in a reviewable and actionable form, surfaces AI-generated anomalies (E11) as an interactive pre-submission checklist, governs the admin's approval action, and triggers disbursement (E6) and GL posting (E9). Without this Epic, the calculation engines exist in isolation — there is no user experience through which a payroll run begins, progresses, is reviewed, and is approved.

This Epic owns the payroll run as a **first-class workflow object** with defined states (Draft → Calculated → Under Review → Approved → Disbursed → Closed), a complete admin-facing review interface, and the approval action that has legal and financial weight. At Alpha, this is the simplified "Calculate and View Summary" experience powering the mock run. At Beta, it becomes the full pre-approval review screen with AI checklist integration. At GA, it delivers complete run state management, off-cycle run initiation, and the definitive approval workflow that gates real money movement.

### 1b. Problem Statement

In the construction SMB context, "running payroll" is not a button — it is a high-stakes weekly process that an overwhelmed owner or office manager conducts under time pressure, often on a Friday. The consequences of errors are immediate: employees don't get paid, job costs are wrong, and trust is damaged. Generic payroll tools handle this poorly: they collapse the review and approval steps, provide no drill-down into how pay was computed, and give admins no structured moment to catch errors before the run is finalized.

Current failure modes that this Epic must eliminate:

- **Black box calculations**: Admin clicks "Run Payroll," sees a total, and is expected to trust it. There is no structured way to verify that the right rate was applied to the right employee on the right job — the calculation is opaque
- **No pre-approval checkpoint**: Errors (wrong hours, wrong rate, new employee included accidentally, terminated employee included) are discovered post-disbursement — when reversing them is complex, expensive, and embarrassing
- **No run-level overrides**: If an admin catches a problem during review, current tools force a full payroll re-run rather than a targeted correction at the run level
- **Missing run state**: Admins lose track of where a payroll run is in the process ("Did I approve that?" / "Was this submitted?"). There is no persistent run object with visible status
- **Off-cycle friction**: Termination final pay, bonuses, and corrections require workarounds; most SMB tools require re-running the entire payroll rather than scoping a run to one employee or one pay type

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Give the PR Admin a structured, drill-down view of all computed payroll results before approval — eliminating the black box |
| G2 | Ensure all exceptions, anomalies, and pre-approval blockers are resolved before the admin can approve — no silent pass-throughs |
| G3 | Make the approval action explicit, intentional, and irreversible — with a clear state transition and audit record |
| G4 | Enable run-level adjustments (exclusions, overrides, off-cycle additions) without requiring a full payroll re-run |
| G5 | Maintain a persistent payroll run history so admins always know what was run, when, by whom, and for how much |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Payroll errors discovered post-approval (wrong pay, wrong employee, wrong rate) | <1% of runs — **Inferred** | Quality |
| Admin time spent on payroll review-and-approve step | <20 min per run — **Inferred** | Efficiency |
| Payroll runs approved with unresolved blocking exceptions | 0 | Compliance |
| AI anomaly checklist items acknowledged or dismissed before approval | 100% | Quality |
| Payroll run state accurately reflects actual run progress | 100% | Operational |
| Off-cycle runs initiated and completed without full payroll re-run | 100% of off-cycle scenarios | Operational |

### 1e. Out of Scope

- Time entry review, exception resolution, and time adjustments — Time Collection PRD (E3)
- Gross pay calculation logic (rate lookup, WAOT, overtime rules) — Earnings & Rate Calculation PRD (E4)
- Tax withholding and deduction calculation — Tax Withholding & Deductions PRD (E5)
- ACH disbursement, check generation, and failed payment handling — Disbursement PRD (E6)
- Pay stub generation and delivery — Pay Stubs & Deliverables PRD (E7)
- GL journal entry generation and job cost posting — Prism Accounting Integration PRD (E9)
- Payroll reporting and historical run reports — Reporting & Audit PRD (E10)
- AI anomaly detection logic — AI-Powered Assistance PRD (E11); this Epic surfaces E11's output, not generates it

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Run payroll correctly, on time, every week without second-guessing the numbers | "I have no idea if the rates were right. I just hope it's correct." | Desktop; Friday deadline pressure; weekly cadence |
| **Owner / Exec** | Business owner | Understand total payroll cost before it hits the bank account | No pre-approval visibility into total outflow | Desktop or mobile; episodic |
| **External CPA / Bookkeeper** | Retained accountant | Confirm payroll was run, approved, and posted correctly | "Was this payroll actually approved or is it still pending?" | Desktop; read-only; periodic access |

### 2b. User Journeys / Workflows

**Primary: PR Admin Runs, Reviews, and Approves Payroll (Beta / GA)**

```
Time review complete — admin has confirmed time in E3
 │
 ├─ Admin navigates to "Run Payroll"
 │   └─ System presents: current open pay period, employee count, total hours ingested
 │
 ├─ Admin initiates the run
 │   ├─ Selects: pay period (pre-filled with current open period)
 │   ├─ Confirms: employee scope (all active employees, or specific subset for off-cycle)
 │   └─ Confirms: run type (Regular / Off-Cycle: Termination / Bonus / Correction)
 │
 ├─ Pre-run readiness gate
 │   ├─ System checks: time confirmed for this pay period? (E3 gate)
 │   ├─ System checks: all active employees have complete pay setup?
 │   ├─ System checks: any blocking exceptions still open in E3?
 │   └─ If all green → calculation triggered; if blockers → admin shown resolution list
 │
 ├─ Calculation executes (E4 + E5 engines)
 │   └─ System shows progress state: "Calculating payroll..." → "Review Ready"
 │
 ├─ Payroll Run Review Screen
 │   ├─ Employee roster with per-row: Name | Hours | Gross Pay | Deductions | Taxes | Net Pay
 │   ├─ Totals row: total gross, total deductions, total taxes, total net, total employer costs
 │   ├─ Per-employee drill-down:
 │   │   ├─ Earnings detail: each pay type, hours, rate, amount (regular, OT, DT, holiday, etc.)
 │   │   ├─ Trade/job breakdown: which rate applied to which time entry
 │   │   ├─ Deductions: pre-tax and post-tax, labeled
 │   │   ├─ Tax withholding: federal, state, local, FICA — line by line
 │   │   └─ Net pay and payment method (ACH account last-4 or "Check")
 │   └─ Employer cost panel: FICA employer, FUTA, SUTA, workers' comp per employee and total
 │
 ├─ AI Pre-Submission Checklist (E11 output surfaced here)
 │   ├─ Anomaly flags: gross pay deviation >X% from prior period, zero-pay employees,
 │   │   unusually high hours, duplicate-looking entries, new employees included
 │   ├─ Each flag: description, affected employee(s), recommended action (Dismiss / Review)
 │   └─ Admin must acknowledge or dismiss ALL flags before approval is enabled
 │
 ├─ Run-Level Override Options
 │   ├─ Exclude employee from this run (with reason code; exclusion logged)
 │   ├─ Flag employee for manual review (hold disbursement for that employee only)
 │   └─ Add off-cycle item to an active employee (bonus amount, correction amount)
 │
 ├─ Approval Action
 │   ├─ "Approve & Submit Payroll" button — enabled only when:
 │   │   └─ All AI checklist items acknowledged + no unresolved blockers
 │   ├─ Confirmation modal: "You are approving payroll for [N] employees, total net pay $X,XXX.XX
 │   │   for pay period [dates]. This action is irreversible."
 │   └─ Admin confirms → run state transitions to "Approved"
 │       ├─ Triggers: Disbursement (E6) — ACH and check instructions sent
 │       ├─ Triggers: GL journal entry generation (E9)
 │       └─ Triggers: Pay stub generation (E7)
 │
 └─ Post-Approval State
     ├─ Run summary page: "Payroll Approved — [date/time], Approved by [Admin Name]"
     ├─ Total net disbursement, employee count, scheduled pay date
     ├─ Run transitions to "Disbursed" when E6 confirms funds sent
     └─ Run transitions to "Closed" when pay period officially closed
```

**Alpha Workflow (Simplified Mock Run)**

```
Admin uploads time file (E3) → confirms time
 │
 ├─ Admin clicks "Calculate Payroll"
 ├─ System runs simplified gross pay calculation (regular wages, federal withholding only)
 ├─ Admin sees: per-employee gross pay, estimated deductions, estimated net pay (mock)
 └─ No approval action — mock run; no disbursement triggered
```

**Off-Cycle Run Workflow (GA)**

```
Admin selects "New Off-Cycle Run"
 ├─ Selects run type: Termination / Bonus / Correction
 ├─ Selects employee(s) in scope
 ├─ Enters or confirms: effective date, pay period for this run
 ├─ System calculates scoped payroll (same E4/E5 engines, scoped to this run)
 ├─ Admin reviews calculated results (same review screen, scoped)
 ├─ Approves → triggers scoped disbursement (E6) and GL posting (E9)
 └─ Off-cycle run stored in run history, linked to affected employee records
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Initiate a regular payroll run for the current pay period | P0 — Alpha |
| UC-2 | View pre-run readiness gate; resolve blockers before calculation | P0 — Beta/GA |
| UC-3 | View payroll run review screen — all employees, computed results | P0 — Beta/GA |
| UC-4 | Drill into any employee's calculation detail (earnings, deductions, taxes) | P0 — Beta/GA |
| UC-5 | Review and acknowledge/dismiss AI anomaly checklist | P0 — Beta/GA |
| UC-6 | Exclude an employee or hold disbursement for one employee | P1 — Beta/GA |
| UC-7 | Approve payroll run with explicit confirmation action | P0 — Beta/GA |
| UC-8 | View payroll run status and history | P1 — Beta/GA |
| UC-9 | Initiate and approve an off-cycle run (termination, bonus, correction) | P0 — GA |
| UC-10 | View employer cost totals (FICA, FUTA, SUTA, workers' comp) in run summary | P1 — Beta/GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Run Initiation

- The system shall present the current open pay period as the default selection when "Run Payroll" is initiated — **P0**
- The system shall allow the admin to select a run type: Regular, Off-Cycle (Termination, Bonus, Correction) — **P0**
- The system shall allow the admin to scope an off-cycle run to one or more specific employees — **P0**
- The system shall display the number of employees in scope and total confirmed hours before the calculation is triggered — **P1**

#### Pre-Run Readiness Gate

- The system shall validate the following before triggering calculation, and surface any failures as named blockers: (1) time review confirmed for the pay period (E3 gate), (2) no open blocking exceptions in time review, (3) all in-scope employees have complete pay rate and tax setup — **P0**
- The system shall prevent calculation from proceeding while any P0 blocker is unresolved — **P0**
- The system shall display a clear resolution path for each blocker (e.g., "2 employees have incomplete tax setup — click here to resolve") — **P1**

#### Payroll Calculation Trigger and Status

- The system shall trigger the E4 and E5 calculation engines upon admin initiation from a readiness-clear state — **P0**
- The system shall display a calculation progress state ("Calculating payroll for [N] employees...") and transition to the review screen upon completion — **P1**
- The system shall handle calculation errors gracefully: surface a descriptive error, preserve the draft run state, and allow the admin to retry — **P1**

#### Payroll Run Review Screen

- The system shall display a roster view of all employees in the run, with per-employee columns: hours, gross pay, total deductions, total taxes withheld, and net pay — **P0**
- The system shall display a totals summary row: total gross, total deductions, total taxes, total net pay, and total employer costs — **P0**
- The system shall allow the admin to drill into any employee's record to view: earnings by pay type (regular, OT, DT, holiday, PTO, supplemental), trade/job breakdown showing which rate applied to which time entry, pre-tax and post-tax deductions line by line, tax withholding by jurisdiction (federal, state, local, FICA), and net pay with payment method — **P0**
- The system shall display employer-side costs per employee and in total: FICA employer portion, FUTA, SUTA, and workers' comp estimate — **P1**
- The system shall visually indicate when a value differs materially from the prior payroll run for the same employee — **P1** — *Inferred*

#### AI Pre-Submission Checklist

- The system shall surface all anomaly flags generated by E11 (AI-Powered Assistance) as a visible, interactive checklist on the Payroll Run Review screen — **P0**
- Each checklist item shall display: anomaly type, affected employee(s), a plain-language description, and action options (Dismiss with reason / View employee detail) — **P0**
- The system shall prevent the "Approve & Submit" action from being enabled until all AI checklist items have been acknowledged or dismissed — **P0**
- Dismissed items and their reason codes shall be logged immutably as part of the run audit record — **P1**

#### Run-Level Adjustments

- An authorized admin shall be able to exclude a specific employee from the current run, with a required reason code; the exclusion shall be logged — **P1**
- An authorized admin shall be able to flag a specific employee's disbursement to be held pending manual review, without excluding them from the payroll calculation — **P1**
- An authorized admin shall be able to add an off-cycle pay item (bonus amount, correction amount) to an in-scope employee during run review — **P1 — GA**
- Any run-level adjustment shall trigger a recalculation scoped to the affected employee(s) before the admin can approve — **P1**

#### Approval Action

- The system shall display an "Approve & Submit Payroll" button enabled only when: all AI checklist items are acknowledged, no blocking exceptions are open, and the run is in "Under Review" state — **P0**
- The approval action shall present a confirmation modal stating: employee count, total net pay amount, pay period dates, and a statement that the action is irreversible — **P0**
- Upon confirmation, the system shall: transition the run state to "Approved," create an immutable approval audit record (approver, timestamp, total amounts), and trigger downstream workflows (E6 disbursement, E9 GL posting, E7 pay stub generation) — **P0**
- The system shall prevent a second approval action on the same run — approving an already-approved run shall display a clear error — **P0**

#### Run State Management

- A payroll run shall maintain one of the following states: Draft, Calculating, Under Review, Approved, Disbursed, Closed — **P0**
- State transitions shall be: Draft → Calculating (on run initiation), Calculating → Under Review (on calculation complete), Under Review → Approved (on admin approval), Approved → Disbursed (on E6 confirmation), Disbursed → Closed (on pay period close) — **P0**
- The system shall display the current run state prominently in the run dashboard — **P0**
- Only one regular payroll run per pay period per company shall be allowed in "Draft," "Calculating," or "Under Review" state simultaneously; off-cycle runs are separate — **P0** — *Inferred*

#### Payroll Run History

- The system shall maintain a history of all payroll runs: run ID, pay period, run type, employee count, total gross, total net, approver, approval timestamp, and final state — **P0**
- An admin shall be able to view any prior run's summary from the run history list — **P1**
- An admin shall be able to drill into a prior run's employee-level detail (read-only) — **P1 — GA**

#### Off-Cycle Run Initiation (GA)

- The system shall provide an "Off-Cycle Run" initiation flow with: run type selection (Termination, Bonus, Correction, Other), employee selection, and effective date — **P0 — GA**
- Off-cycle runs shall use the same E4 and E5 calculation engines scoped to the selected employees and run type — **P0 — GA**
- Off-cycle runs shall follow the same review-and-approve workflow as regular runs — **P0 — GA**
- Termination off-cycle runs shall surface the applicable state final pay rules (from E4) and the required pay date — **P0 — GA**

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Payroll Run Review screen loads within 5 seconds for a run with up to 200 employees |
| **Performance** | Full payroll calculation completes within 60 seconds for up to 200 employees — **Inferred** |
| **Availability** | Payroll run initiation and approval workflow available 99.9% during payroll processing windows |
| **Reliability** | An interrupted calculation (e.g., connectivity loss) shall restore the run to a recoverable Draft state without data loss |
| **Security** | RBAC: Admin role required to initiate, review, and approve runs; Owner role read-only access to run summary; Employee has no access to run management |
| **Audit** | Every state transition, approval action, AI checklist dismissal, and run-level adjustment logged immutably with user, timestamp, and relevant amounts |
| **Usability** | The Payroll Run Review screen shall be usable for a 50-person run without horizontal scrolling on a standard 1440px-wide desktop display |
| **Usability** | AI anomaly checklist items shall be written in plain language — no tax jargon or calculation codes |

### 3c. Technical Dependencies

#### Payroll Run Object — Data Model

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| PayrollRun | run_id, company_id, pay_period_id, run_type, state, initiated_by, initiated_at, approved_by, approved_at, total_gross, total_net, total_employer_cost | Core orchestration object |
| PayrollRunEmployee | run_id, employee_id, gross_pay, total_deductions, total_taxes_withheld, net_pay, employer_cost, state (included/excluded/held), exclusion_reason | Per-employee run record |
| PayrollRunEarningsLine | run_id, employee_id, pay_type, rate, hours, amount, job_code, cost_code, trade_type | Detail line from E4 calculation |
| PayrollRunAuditLog | run_id, event_type, actor, timestamp, before_value, after_value, notes | Append-only; covers all state transitions and adjustments |
| AIChecklistItem | run_id, anomaly_type, affected_employee_id(s), description, state (pending/acknowledged/dismissed), dismissed_reason, actioned_by, actioned_at | Surfaced from E11; logged immutably |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Time Collection (E3) | Confirm time is locked for pay period; pass approved time entries to calculation | Pre-run readiness gate | Blocking — run cannot proceed without E3 confirmation |
| Earnings & Rate Calculation (E4) | Execute gross pay calculation for all in-scope employees | Run initiation (post readiness gate) | Synchronous or async with status polling |
| Tax Withholding & Deductions (E5) | Execute gross-to-net calculation for all in-scope employees | Immediately following E4 output | Sequential — requires E4 output |
| AI-Powered Assistance (E11) | Generate anomaly checklist for the current computed run | Post-calculation, before review screen displayed | Non-blocking calculation but blocking approval |
| Disbursement (E6) | Receive approval signal; initiate ACH and check disbursement | On admin approval confirmation | Async; run transitions to Disbursed on E6 confirmation |
| Prism Accounting / Job Costing (E9) | Generate GL journal entries and labor cost allocation | On admin approval confirmation | Async; parallel to E6 |
| Pay Stubs (E7) | Generate digital pay stubs per employee | On admin approval confirmation | Async; parallel to E6 and E9 |

#### Platform / Infrastructure Constraints

- The payroll run state machine must be durable and recoverable — a server failure mid-calculation must not result in a run stuck in "Calculating" without recovery path
- The approval action must be idempotent — submitting the approval twice (e.g., double-click, network retry) must not trigger duplicate disbursements
- Audit log entries must be written atomically with their corresponding state transitions — no partial records
- ⚠️ **Requires human review**: Calculation execution model — synchronous (admin waits on screen) vs. asynchronous (admin notified when review-ready). For large runs, async with email/in-app notification is preferred but adds UX complexity at Alpha

### 3d. Feature Areas (Children of this Epic)

| Feature Area | Description | Goals Supported | Milestone |
|---|---|---|---|
| **E-RP-1: Run Initiation & Readiness Gate** | Run type and scope selection; pre-run validation checks; blocker resolution | G2 | Alpha+ |
| **E-RP-2: Payroll Calculation Trigger & Status** | Trigger E4/E5 engines; progress state; error recovery | G1 | Alpha+ |
| **E-RP-3: Payroll Run Review Screen** | Full employee roster with computed results; totals; employer costs | G1, G4 | Beta/GA |
| **E-RP-4: Employee Calculation Drill-Down** | Per-employee earnings line detail; trade/job breakdown; deductions/taxes; net pay | G1 | Beta/GA |
| **E-RP-5: AI Pre-Submission Checklist** | Surface E11 anomaly flags; require acknowledgment or dismissal before approval | G2 | Beta/GA |
| **E-RP-6: Run-Level Adjustments & Overrides** | Employee exclusion; disbursement hold; off-cycle item addition; scoped recalculation | G4 | Beta/GA |
| **E-RP-7: Approval Action & Run Finalization** | "Approve & Submit" with confirmation modal; irreversible close; downstream triggers | G3 | Beta/GA |
| **E-RP-8: Run State Management & History** | Run state machine; run history list; prior-run summary access | G5 | Beta/GA |
| **E-RP-9: Off-Cycle Run Workflow** | Initiation wizard for termination, bonus, correction; scoped review and approval | G4, G5 | GA |

### 3e. High-Level Acceptance Criteria

- At Alpha: Admin can initiate a mock payroll calculation and view a per-employee summary of gross pay, estimated deductions, and estimated net pay for a single-state, straight-time run
- At Beta/GA: Admin cannot proceed to the approval screen while any pre-run readiness blocker is open
- At Beta/GA: Payroll Run Review screen displays all in-scope employees with correct gross pay, total deductions, total taxes, and net pay, consistent with E4 and E5 calculation outputs
- At Beta/GA: Admin can drill into any employee's record and see the earnings breakdown by pay type, trade, and rate — traceable to the source time entries
- At Beta/GA: All AI anomaly checklist items must be acknowledged or dismissed before the "Approve & Submit" button becomes active
- At GA: "Approve & Submit" action is idempotent — a duplicate submission (network retry, double-click) does not create a duplicate disbursement trigger
- At GA: Approved payroll run creates an immutable audit record containing: approver identity, timestamp, employee count, total gross, total net, pay period dates
- At GA: An off-cycle run (termination) can be scoped, calculated, reviewed, and approved for a single employee without affecting or re-running the regular pay period

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- Run initiation: "Calculate Payroll" action with current pay period pre-filled
- Pre-run readiness: basic gate — time confirmed + active employees present
- Simplified calculation trigger (E4 regular wages + federal withholding only)
- Payroll run summary: per-employee gross pay, estimated deductions, estimated net pay
- Mock / simulated run — no approval action, no disbursement triggered
- No AI checklist, no drill-down detail at Alpha

**Beta (Trimble Dimensions)**
- Full run initiation flow: pay period selection, employee scope, run type (Regular)
- Pre-run readiness gate with named blockers and resolution paths
- Payroll Run Review Screen: full roster with computed results, totals, employer costs
- Employee calculation drill-down: earnings lines, trade/job breakdown, deductions, taxes
- AI Pre-Submission Checklist: E11 anomaly flags surfaced; acknowledgment required
- Run-level employee exclusion with reason code
- Approval action: "Approve & Submit" with confirmation modal (Beta: triggers calculation record; disbursement still manual/stubbed per E6 Beta scope)
- Run state management: Draft → Calculating → Under Review → Approved
- Basic run history list

**GA (Generally Available)**
- Full run state machine: Draft → Calculating → Under Review → Approved → Disbursed → Closed
- Approval triggers live downstream: E6 (ACH/check), E9 (GL posting), E7 (pay stubs)
- Off-cycle run workflow: Termination, Bonus, Correction initiation wizard
- Termination run surfaces state final pay rules and required pay date
- Run-level disbursement hold per employee
- Add off-cycle item to active employee during run review
- Full prior-run drill-down in run history
- Calculation idempotency and audit log completeness production-hardened

---

# 5. Supporting Information

### 5a. Assumptions

- The calculation engines (E4, E5) are invocable as internal services that accept a pay period ID + employee scope and return computed results per employee
- Time review confirmation (E3) produces a persistent "locked" flag on the pay period that this Epic can read as a readiness gate
- AI anomaly detection (E11) produces structured output (anomaly type, affected employee, description) that can be consumed and displayed by this Epic's review screen
- A single payroll admin will run payroll for a given company (no concurrent run workflow needed at Beta; multi-user locking considered for GA)
- The approval action in this Epic is the authoritative trigger for disbursement — E6 should not initiate disbursement without a confirmed "Approved" run state from this Epic

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| E3 pay period lock / confirmation signal | E3 team | **High** — gates all payroll runs; must be defined and testable at Alpha |
| E4 calculation API (invocable service with defined response schema) | E4 team | **High** — Beta critical path; schema must be agreed before UI build |
| E5 gross-to-net API (invocable service, chained from E4 output) | E5 team | **High** — Beta critical path; must be sequenced correctly |
| E11 anomaly detection API (structured output per run) | E11 team | **Medium** — Beta critical path; output schema must be agreed; AI model can be placeholder at Beta |
| E6 disbursement trigger (async, receives run_id on approval) | E6 team | **High** — GA critical path; idempotency requirements must be agreed |
| E9 GL posting trigger (async, receives run_id on approval) | E9 team | **Medium** — GA critical path; parallel to E6 |
| E7 pay stub generation trigger (async, receives run_id on approval) | E7 team | **Medium** — GA |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Calculation takes >60 seconds for large runs, blocking the admin on the review screen | Medium | High | Async calculation with in-app notification + email when review-ready; progress indicator during calc | Yes — UX decision |
| Double-submission of approval (network retry) triggers duplicate ACH disbursement | Low | Critical | Idempotency key on approval action; E6 deduplication on run_id | Yes — Engineering |
| AI checklist becomes "click to dismiss" fatigue without driving real review behavior | High | Medium | Limit anomaly flags to high-confidence, high-impact items; require reason code on dismissal; track dismiss patterns | No |
| Calculation engine API contract undefined until late in Beta | Medium | High | Define schema contract (inputs/outputs) before UI build begins; use mock API with schema contract for parallel UI development | Yes — Engineering |
| Off-cycle run interleaved with in-progress regular run creates data conflicts | Low | High | Enforce run-level concurrency rules: one active regular run per pay period; off-cycle runs must be for completed pay periods or a separate scope | Yes — Engineering |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Time from run initiation to admin approval | `payroll_run_initiated` → `payroll_run_approved` (duration) | Product |
| AI checklist acknowledgment vs. dismissal rate | `ai_checklist_acknowledged` / `ai_checklist_dismissed` (by anomaly_type) | Product / AI |
| Pre-run readiness gate blocker frequency | `readiness_blocker_surfaced` (blocker_type) | Operations |
| Employee drill-down engagement | `employee_detail_viewed` (employee_id, run_id) | Product |
| Run-level exclusions per run | `employee_excluded_from_run` (reason_code) | Operations |
| Runs approved with anomaly flags dismissed (not acknowledged) | `payroll_run_approved` where `ai_dismissed_count > 0` | Compliance |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Is payroll calculation synchronous (admin waits) or asynchronous (admin notified)? What is the UX at the calculation boundary? | Engineering / Product | Sprint 1 |
| OQ-2 | Can the employer-side cost totals (FICA employer, FUTA, SUTA, workers' comp) be displayed on the run review screen, or are they only available in reports (E10)? | E4/E5 teams | Sprint 2 |
| OQ-3 | What is the approval authority model? Is a single Admin role sufficient, or does GA require a two-person approval (Admin initiates, Owner confirms) for companies above a size threshold? | Product / Legal | Beta planning |
| OQ-4 | Should the run review screen surface a "this payroll is $X more/less than last period" comparison header before the AI checklist, or is that considered an E11 AI output? | Product / E11 | Sprint 2 |
| OQ-5 | How are payroll runs for companies with multiple pay schedules (e.g., weekly field + bi-weekly office) scoped and managed — one run per schedule or one combined run? | Product | Sprint 1 |
| OQ-6 | What happens if a run is approved but disbursement (E6) fails for all employees? Is there a "roll back" or "void" capability on an approved run, or is it always corrected via off-cycle run? | Engineering / Product | GA planning |
