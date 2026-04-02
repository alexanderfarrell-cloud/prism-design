# PRD: Prism Construction Payroll — Payroll Dashboard & Command Center

**Initiative:** Payroll Dashboard & Command Center
**Epic:** 684212
**Product:** Prism Construction Payroll (Trimble Financials)
**Target Market:** U.S. SMB construction contractors, 5–100 employees, all 50 states
**Author:** Aaron Jost
**Last Updated:** March 2026
**Status:** Active

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Tax Filing, Reporting & Audit, Prism Accounting Integration, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Payroll Dashboard is the primary landing surface for the PR Admin every time they open Prism Payroll. It is the command center: a single screen that tells the admin the state of their payroll world — what needs their attention right now, where the current pay period stands, what's coming up, and the key numbers that matter most. The dashboard replaces the disorienting blank-slate or menu-only entry experience common in SMB payroll tools with an opinionated, actionable home base that reflects the rhythmic, deadline-driven nature of construction payroll. It is not a passive report — it is an active orchestration surface that surfaces the right information at the right time and routes the admin directly into the workflows they need.

### 1b. Problem Statement

**User problem:** The PR Admin ("Overwhelmed Operator") opens payroll software reactively — often because something needs to be done. Without a meaningful landing experience, they must mentally reconstruct their payroll state from memory: "Where am I in the pay period? Did I handle that exception? When is the next tax deposit due? Did last week's payroll disburse?" This forces unnecessary cognitive load onto the busiest person in a small construction office, increases the risk of missed actions, and creates the anxiety that a critical deadline has been overlooked.

**Business problem:** A dashboard-less or weak-landing-experience payroll product trains admins to avoid logging in until they absolutely must. This reduces engagement, reduces the chance that issues are caught early, and produces the exact downstream payroll failures (missed deadlines, unapproved runs, unresolved exceptions) that drive the highest support costs. The dashboard is the mechanism through which the platform builds the admin's daily habit and trust.

**Why existing tools fail:** Generic SMB payroll tools either land the admin on a blank home screen with a menu, or on a dense reporting dashboard not oriented to action. Neither reflects the reality that construction payroll admins are time-starved, interruption-prone, and managing multiple moving parts (open time, exceptions, upcoming pay dates, tax deposits) simultaneously. The dashboard must speak in operational terms — not financial report terms.

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Give the PR Admin instant situational awareness of their payroll state every time they open Prism Payroll |
| G2 | Surface all items requiring the admin's attention before they become missed deadlines or payroll failures |
| G3 | Reduce cognitive load by surfacing the right information at the right time — not everything, always |
| G4 | Provide direct entry points to the most common payroll workflows from a single surface |
| G5 | Make key payroll metrics and historical context immediately accessible without navigating to reports |
| G6 | Establish a daily engagement habit by making the dashboard the most useful place to start every session |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Admin sessions starting on the dashboard that result in a task completion (run started, exception resolved, etc.) | ≥ 60% at Beta | Engagement |
| Payroll runs missed or delayed due to admin not seeing open pay period status | < 1% of pay periods at GA | Operational |
| Tax deposit deadlines missed attributable to lack of visibility | 0 at GA | Compliance |
| Admin support tickets citing "didn't know where to start" or "didn't see the notification" | Declining trend vs. baseline | Support |
| Time from dashboard open to correct workflow entry point | < 30 seconds median — *Inferred* | Usability |
| Dashboard DAU/WAU ratio (stickiness) | > 0.5 at GA — *Inferred* | Engagement |

### 1e. Out of Scope

- Full payroll run execution — Payroll Run & Approval Workflow initiative (E-RP)
- Employee profile management — Employee Management initiative
- Full reporting, exports, and historical analytics — Reporting & Audit initiative (E10)
- Payroll configuration and settings management — Payroll Configuration Hub (Epic 668798)
- Multi-company switcher and cross-company dashboard — Platform-level; deferred post-GA
- Mobile-specific dashboard layout — desktop-first at Alpha/Beta; mobile responsive at GA *Inferred*

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin ("Overwhelmed Operator")** | Owner or Office Manager; primary payroll operator | Know exactly where payroll stands; act on issues fast; never miss a deadline | Reactive; time-pressured; can't remember where they left off | Desktop; weekly payroll rhythm with daily check-ins |
| **Owner / Exec** | Company owner; financial oversight | See payroll totals at a glance; confirm payroll was run; no surprises | Doesn't want deep detail; just needs signal vs. noise | Desktop; occasional — monthly or per-run |
| **External CPA / Bookkeeper** | Retained accountant | Confirm runs were completed; identify open items; view key compliance dates | Limited time; wants a quick health check without drilling into runs | Desktop; periodic — quarterly or at month-end |

### 2b. User Journeys / Workflows

**Primary: Weekly Payroll Rhythm (PR Admin)**

```
Admin opens Prism Payroll
 │
 ├─ Lands on Dashboard
 │   ├─ Scans "Attention Required" panel:
 │   │   ├─ 0 items → all clear signal → proceeds to Run Payroll or checks upcoming dates
 │   │   └─ N items → reviews each item, clicks through to resolution workflow
 │   │
 │   ├─ Checks Current Pay Period panel:
 │   │   ├─ Draft/Not Started → clicks "Run Payroll" (pre-populates from dashboard context)
 │   │   ├─ Calculating / Under Review → navigates to run in progress
 │   │   └─ Approved → confirms approval; checks Upcoming Dates for next deadline
 │   │
 │   └─ Glances at Upcoming Dates panel:
 │       ├─ Next pay date visible → confirms timeline
 │       └─ Tax deposit due this week → routes to tax section
 │
 └─ Proceeds to appropriate workflow
```

**Secondary: Quick Check-In (Owner / Exec)**

```
Owner opens Prism Payroll
 │
 ├─ Lands on Dashboard
 │   ├─ Sees "Last Payroll Run" summary: total net, employee count, approval date, approver
 │   ├─ Sees 0 items in Attention Required → no action needed
 │   └─ Notes next pay date in Upcoming Dates → confirms timeline
 │
 └─ Exits without further action (no issues found)
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Admin lands on dashboard and sees current payroll state at a glance | P0 |
| UC-2 | Admin sees and acts on "Attention Required" items (exceptions, missing setup, blockers) | P0 |
| UC-3 | Admin launches payroll run directly from dashboard | P0 |
| UC-4 | Admin views upcoming pay dates and tax deadlines | P0 |
| UC-5 | Admin views last completed payroll run summary | P1 |
| UC-6 | Admin sees key payroll metrics (YTD, employee count, avg weekly cost) | P1 |
| UC-7 | Admin accesses quick links to common tasks (Add Employee, View Reports, etc.) | P1 |
| UC-8 | Owner or CPA views dashboard in read-only mode for oversight | P1 |
| UC-9 | Admin receives and dismisses system notifications and compliance alerts | P1 |
| UC-10 | Admin sees AI-generated insights or flags on the dashboard surface | P2 |

---

# 3. Requirements with Supporting Material

### 3a. Functional Requirements

#### Current Pay Period Status Panel (UC-1, UC-3)

- The dashboard shall display the current open pay period's dates, run state, and employee count in a prominent, always-visible panel — **P0**
- Run state shall reflect the live payroll run state machine (Draft, Calculating, Under Review, Approved, Disbursed, Closed) with a plain-language label and visual indicator — **P0**
- When no run is in progress, the panel shall display a "Run Payroll" action that pre-populates the run initiation flow with the current pay period — **P0**
- When a run is in progress (Calculating, Under Review), the panel shall display a "Resume / View Run" action that navigates directly to the in-progress run screen — **P0**
- When the pay period is Approved or Disbursed, the panel shall display a summary: total net pay, employee count, approval timestamp, approver name — **P1**
- The panel shall surface the scheduled pay date for the current pay period — **P0**

#### Attention Required Panel (UC-2)

- The dashboard shall display a dedicated "Attention Required" panel listing all open items that require the admin's action before payroll can proceed or a deadline will be missed — **P0**
- Attention items shall include (at minimum):
  - Unresolved time exceptions blocking pay period confirmation (E3) — **P0**
  - Employees with incomplete pay setup (missing rate, missing W-4, missing bank account) — **P0**
  - Unsigned tax authorization forms (Form 8655 or state equivalents) — **P0**
  - Banking verification incomplete — **P0**
  - Tax deposit due within 3 business days with no action taken — **P1**
  - WC policy expiring within 30 days — **P1** — *Inferred*
  - State tax registration missing for a nexus state — **P1**
- Each item shall display: item type label, plain-language description, affected entity (employee name or jurisdiction), and a direct action link ("Resolve") that routes to the correct remediation screen — **P0**
- When zero attention items exist, the panel shall display an affirmative "You're all clear" state — not an empty panel — **P0**
- The count of open attention items shall be visible in the panel header and in any navigation badge — **P1** — *Inferred*

#### Upcoming Dates Panel (UC-4)

- The dashboard shall display a chronological list of upcoming payroll-relevant dates within the next 60 days — **P0**
- Date types included:
  - Next scheduled pay date — **P0**
  - Federal tax deposit due dates (941 semi-weekly, monthly, or quarterly per company's deposit schedule) — **P0**
  - State withholding deposit/filing deadlines (per registered nexus states) — **P1**
  - FUTA/SUTA quarterly deadlines — **P1**
  - Pay period end dates for upcoming pay periods — **P1** — *Inferred*
  - WC policy expiration date (if within 60 days) — **P1** — *Inferred*
- Dates within 7 days shall be visually emphasized (urgency indicator) — **P0**
- Overdue dates (past due, not completed) shall be surfaced as Attention Required items, not in the Upcoming Dates panel — **P0**

#### Recent Activity / Last Run Summary (UC-5)

- The dashboard shall display a summary of the most recently completed payroll run: run type, pay period dates, total gross pay, total net pay, employee count, approver name, approval date — **P1**
- Admin can click through to the full run detail in run history (E-RP-8) — **P1**
- For companies that have never run payroll, the panel shall display a first-run prompt — **P1** — *Inferred*

#### Payroll Metrics Panel (UC-6)

- The dashboard shall display a concise set of current-cycle and YTD payroll metrics — **P1**
- Metrics at Beta:
  - Total YTD gross payroll — **P1**
  - Total YTD employer tax cost — **P1** — *Inferred*
  - Current active employee count — **P1**
  - Average weekly net payroll (last 8 weeks) — **P1** — *Inferred*
- Metrics shall be presented as data cards or a summary bar — not as a full report table — **P1**
- Owner and CPA roles shall see the same metrics panel in read-only mode — **P1**

#### Quick Actions (UC-7)

- The dashboard shall provide a persistent quick-action area with links to the most common payroll workflows — **P1**
- Quick actions at Beta (minimum set):
  - Run Payroll
  - Add Employee
  - View Reports
  - Manage Pay Schedules
  - View Tax Calendar
- Quick actions shall be context-sensitive where feasible (e.g., "Resume Run" replaces "Run Payroll" when a run is in progress) — **P1** — *Inferred*

#### Notifications & Alerts (UC-9)

- The dashboard shall surface system-generated notifications for compliance and operational events — **P1**
- Notification types:
  - Payroll run completed successfully (post-disbursement)
  - Tax deposit submitted
  - Employee added or removed
  - Form 8655 signed
  - Banking verification completed or failed
- Notifications shall be dismissible and logged — **P1**
- A notification history (last 30 days) shall be accessible from the dashboard — **P2** — *Inferred*

#### AI Insights Panel (UC-10)

- The dashboard shall surface a curated set of AI-generated insights from E11 (AI Assistance initiative) — **P2** — *Inferred*
- Insight types (at GA):
  - "Your labor cost this period is running X% higher than the prior 8-week average — driven by Job 14"
  - "2 employees are approaching overtime thresholds this week — action before time closes can prevent OT liability"
  - "Your Q2 FUTA liability is tracking toward the $500 threshold — deposit may be required earlier than your annual filing"
- Insights shall be surfaced only when actionable; not generated for informational noise — **P2**
- Admin can dismiss an insight; dismissed insights are not re-surfaced for the same condition — **P2**

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Dashboard loads within 3 seconds from navigation click for companies up to 200 employees |
| **Availability** | Dashboard must be available whenever Prism Payroll is accessible; no additional downtime window |
| **Usability** | All attention items, upcoming dates, and run status visible without scrolling at 1440px desktop standard resolution |
| **Accessibility** | WCAG 2.1 AA compliance on all dashboard surfaces |
| **Security / RBAC** | PR Admin: full dashboard with all action links; Owner: read-only metrics and run status; CPA: read-only run status and metrics; no financial amounts visible to non-authorized roles |
| **Accuracy** | Attention Required items reflect live state — items resolved in other modules must clear from dashboard within 60 seconds — *Inferred* |
| **Audit** | Notification dismissals logged with actor and timestamp |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| PayrollRun | run_id, pay_period_dates, state, employee_count, total_gross, total_net, approver, approval_date | Sourced from E-RP run state machine |
| PayPeriod | period_start, period_end, pay_date, schedule_id, state | Current and upcoming periods from pay schedule |
| AttentionItem | item_type, description, affected_entity, severity, resolved_flag, action_url | Aggregated from E3, E2, E1, E5, tax modules |
| TaxDepositDeadline | jurisdiction, deposit_type, due_date, status | From tax engine / compliance calendar |
| EmployeeSetupStatus | employee_id, completeness_flag, missing_fields | Queryable from Employee Management domain |
| Notification | notification_type, message, created_at, dismissed_by, dismissed_at | System-generated events |
| DashboardMetrics | ytd_gross, ytd_employer_taxes, active_employee_count, avg_weekly_net | Computed aggregates |

#### Integration Requirements

| System | Purpose | Key Inputs/Outputs | Trigger | Notes |
|--------|---------|-------------------|---------|-------|
| E-RP (Payroll Run State Machine) | Current run state and last run summary | RunState, PayrollRunSummary | Real-time query | Internal |
| E3 (Time Collection) | Open exceptions blocking pay period | ExceptionCount, ExceptionList | Real-time query | Internal |
| Employee Management (E2) | Employee setup completeness | EmployeeSetupStatus per employee | Real-time query | Internal |
| Company Setup (E1) | Authorization status, banking verification | AuthorizationStatus, BankingStatus | Real-time query | Internal |
| Tax Engine (E5) | Upcoming tax deposit deadlines | TaxDepositCalendar | Periodic refresh | Internal |
| E11 (AI Assistance) | AI-generated insights | InsightList | Post-calculation trigger + periodic | Internal; P2 |

#### Platform / Infrastructure Constraints

- Dashboard must aggregate state from multiple internal modules in a single page load; a backend aggregation layer (BFF or similar) is *Inferred* to avoid N+1 query patterns
- ⚠️ **Requires human review:** Aggregation strategy for Attention Required items across modules — each module must expose a structured "open items" API endpoint or event stream; coordination across E1, E2, E3, E5, and tax modules required
- Dashboard must reflect real-time state changes (e.g., exception resolved in E3 should clear from Attention Required without a page refresh); event-driven or polling approach TBD

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E-PD-1: Current Pay Period Status & Run Entry** (684213) | Prominent panel showing current pay period state, run status, and direct "Run Payroll" or "Resume Run" entry point | G1, G3, G4 | UC-1, UC-3 |
| **E-PD-2: Attention Required Panel** (684214) | Aggregated action-required items from all modules with plain-language descriptions and direct resolution links | G2, G3, G4 | UC-2 |
| **E-PD-3: Upcoming Dates & Deadline Tracker** (684215) | Chronological view of upcoming pay dates, tax deposits, and compliance deadlines within a rolling 60-day window | G2, G3 | UC-4 |
| **E-PD-4: Recent Activity & Run History Summary** (684216) | Last completed run summary card with key financials and click-through to full run history | G1, G5 | UC-5 |
| **E-PD-5: Payroll Metrics & Data Highlights** (684217) | Curated current and YTD metrics (gross, employer costs, headcount, avg weekly) presented as scannable data cards | G1, G5 | UC-6 |
| **E-PD-6: Quick Actions & Navigation Hub** (684218) | Context-sensitive quick-action area for the most common workflows; entry point for all primary admin tasks | G4, G6 | UC-7 |
| **E-PD-7: Notifications & AI Insights** (684219) | System notification center and AI-generated insight cards on the dashboard surface | G2, G6 | UC-9, UC-10 |

### 3e. High-Level Acceptance Criteria

- The PR Admin can land on the dashboard and determine the state of their payroll (current period status, open attention items, next deadline) within 30 seconds without navigating away
- When one or more Attention Required items exist, each item displays a plain-language description and a working "Resolve" link that routes to the correct screen
- When zero Attention Required items exist, the panel displays an affirmative "all clear" state — not an empty or blank panel
- The current pay period panel accurately reflects the live run state; clicking "Run Payroll" or "Resume Run" navigates to the correct run initiation or in-progress run screen
- Upcoming dates within 7 days are visually distinguished from later dates; overdue items are shown in the Attention Required panel instead
- Dashboard loads within 3 seconds for companies up to 200 employees on a standard 1440px desktop browser
- Owner and CPA roles see the dashboard in read-only mode; no action links are available for their role; financial metrics are visible per RBAC
- AI insights (P2/GA) are surfaced only when actionable; dismissed insights do not re-appear for the same condition

### 3f. Links to Prototypes

- \<Link to Figma prototypes when available\>
- Miro Board (Visual Backlog): [Full Visual Backlog](https://miro.com/app/board/uXjVJglUVR0=/?share_link_id=128266091116)

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

| Milestone | Timing | Scope |
|-----------|--------|-------|
| **Alpha** | June 2026 | Current Pay Period Status panel (run state + "Run Payroll" CTA); minimal Attention Required (time exceptions + incomplete setup); next pay date. Dashboard is functional but spartan — purpose is to establish the shell and the run entry point. |
| **Beta** | Trimble Dimensions | Full Attention Required panel (all item types); Upcoming Dates (60-day window with tax deadlines); Recent Activity / Last Run summary; Payroll Metrics panel (YTD, headcount, avg weekly); Quick Actions; system notifications. Dashboard is the designed, customer-facing command center. |
| **GA** | Generally Available | AI Insights panel (E11 integration); notification history; real-time state refresh (sub-60s); mobile responsive layout; RBAC-tuned views for Owner and CPA roles. |

---

# 5. Supporting Information

### 5a. Assumptions

- The dashboard is the default landing page when a user navigates to Prism Payroll — not a secondary screen
- All "Attention Required" data is available via structured, queryable APIs from each contributing module (E1, E2, E3, E5, tax engine); no scraping or heuristic inference
- Pay period and tax deadline data is computed and cached by a backend service; the dashboard does not compute these values directly
- AI insights (E-PD-7) depend on the E11 initiative being available; E-PD-7 is deferred to GA if E11 is not ready at Beta

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| E-RP run state machine (current run state + last run summary) | E-RP team | **High** — core to E-PD-1; must be available before Beta |
| E3 open exceptions API | E3 team | **High** — core to E-PD-2; must be available before Beta |
| Employee Management setup completeness API | E2 team | **Medium** — needed for E-PD-2; Beta |
| Tax deposit deadline calendar | Tax / compliance team | **Medium** — needed for E-PD-3; Beta |
| E11 AI Insights API | E11 team | **Low risk at Beta** — P2/GA only |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Attention Required aggregation requires cross-module API contracts not yet defined | High | High | Define API contracts for "open items" endpoint per module in Sprint 0; mock data for dashboard Alpha | Yes — cross-team alignment |
| Dashboard data staleness if real-time refresh is not implemented | Medium | Medium | Implement optimistic UI with explicit "last refreshed" timestamp; auto-refresh on tab focus | No |
| Cognitive overload from too many dashboard panels at Beta | Medium | Medium | UX test with admins before Beta launch; progressive disclosure for secondary panels | No |
| AI insights generating low-value or noisy signals | Medium | Low at Beta | AI panel is P2/GA; E11 team owns quality; dismiss mechanism prevents re-surfacing | No |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Dashboard session engagement rate | `dashboard_session_start` → `task_completed_from_dashboard` | Product |
| Attention Required item resolution time | `attention_item_surfaced` → `attention_item_resolved` | Operations |
| Run Payroll CTA click-through rate | `dashboard_run_payroll_clicked` | Product |
| Upcoming date acknowledgment | `upcoming_date_viewed` (implicit scroll/view event) | Product |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | What is the agreed API contract for each module's "open items" output? Who owns the aggregation layer? | Platform / Engineering | Sprint 0 |
| OQ-2 | Should Attention Required items be prioritized / ranked? If so, what is the prioritization logic? | Product | Sprint 1 |
| OQ-3 | What is the acceptable staleness window for dashboard data? Real-time (< 30s) vs. periodic refresh (e.g., 5 min)? | Engineering / Product | Sprint 1 |
| OQ-4 | Does the Owner role see financial totals on the dashboard? Or only run status? | Product / Legal | Sprint 1 |
| OQ-5 | Is the dashboard a separate navigation destination or the default route on Prism Payroll entry? | UX / Platform | Sprint 0 |
| OQ-6 | Should the AI Insights panel be gated behind a feature flag at Beta for selected customers only? | Product / E11 | Beta planning |
