# Payroll Dashboard & Command Center — Epic Set

> **Source Documents:** Payroll Dashboard PRD (Mar 2026), Construction Payroll User Insights Synthesis (Feb 4)
> **Parent Initiative:** Prism Construction Payroll — Payroll Dashboard & Command Center (E-PD)
> **Delivery Horizon:** Alpha (June 2026) → Beta (Trimble Dimensions) → GA

---

## Epic Set Overview

| # | Epic | One-Line Summary | Milestone |
|---|------|-----------------|-----------|
| E-PD-1 | **Current Pay Period Status & Run Entry** | Admin sees exactly where the current pay period stands and can launch or resume a run from a single panel | Alpha+ |
| E-PD-2 | **Attention Required Panel** | Every open item that could block payroll or cause a missed deadline is aggregated in one scannable, action-linked panel | Beta |
| E-PD-3 | **Upcoming Dates & Deadline Tracker** | A 60-day rolling view of pay dates, tax deposits, and compliance deadlines — urgency-ranked and always current | Beta |
| E-PD-4 | **Recent Activity & Run History Summary** | The last completed payroll run surfaces on the dashboard with key financials and a direct click-through to full history | Beta |
| E-PD-5 | **Payroll Metrics & Data Highlights** | Curated YTD and current-period metrics — gross, employer costs, headcount, weekly average — in scannable data cards | Beta |
| E-PD-6 | **Quick Actions & Navigation Hub** | Context-sensitive shortcuts to the most common admin workflows anchor the dashboard as the operational home base | Beta |
| E-PD-7 | **Notifications & AI Insights** | System notifications and AI-generated insights surface proactively on the dashboard for admins who want early signals | GA |

---

## Epic E-PD-1 — Current Pay Period Status & Run Entry

### 1. Goal / Outcome
Give the PR Admin an unambiguous, always-visible status of the current pay period — whether a run is not yet started, in progress, under review, approved, or disbursed — and provide a single-click entry point to initiate or continue that run. This eliminates the most common disorienting experience in SMB payroll: opening the tool and not knowing where you left off. The pay period panel is the anchor of the dashboard; everything else on the screen is context around it.

### 2. Primary Personas
- **PR Admin** ("Overwhelmed Operator") — primary actor; monitors run state and initiates/resumes runs
- **Owner / Exec** — secondary; reads run status for financial oversight

### 3. Business & PRD Drivers
- **G1** — Instant situational awareness; current pay period state visible without navigation
- **G4** — Direct run entry point from dashboard surface
- **UC-1, UC-3** — P0 use cases for Alpha and beyond
- **FR: Current Pay Period Status Panel** — live run state, pay dates, employee count, CTA
- **E-RP Run State Machine** — this epic consumes E-RP's run state and surfaces it on the dashboard

### 4. Problem / Rationale
Construction payroll admins open payroll software reactively, often mid-task. Without a clear "here's where you are" panel, they must click through multiple screens to reconstruct state. The Friday Crunch reality — tight deadlines, multiple interruptions — makes this discovery cost significant. A persistent, accurate status panel eliminates the reconstruction work.

### 5. In Scope
- Pay period header: current period start date, end date, scheduled pay date
- Live run state indicator: plain-language label (e.g., "Not Started," "Calculating," "Ready to Review," "Approved," "Disbursed") with visual state indicator
- Employee count in scope for the current period
- Context-sensitive primary CTA:
  - "Run Payroll" — when no run is active (Draft/Not Started)
  - "Resume Run" / "View Run" — when Calculating or Under Review
  - "Run Approved ✓" with approver and timestamp — when Approved
  - "Payroll Disbursed ✓" with disbursement date — when Disbursed
- Last-run quick summary when current period is in early states (last approved run: total net, pay date) — *Inferred*
- Next pay period preview (upcoming period start/end/pay date) — P1

### 6. Out of Scope (for this epic)
- Full payroll run initiation wizard — E-RP-1
- Run calculation progress — E-RP-2
- Payroll run review screen — E-RP-3
- Full run history — E-RP-8
- Attention Required items — E-PD-2

### 7. Example "Super Stories"
- As a PR Admin, I want to see the current pay period dates, scheduled pay date, and run state on my dashboard the moment I open Prism Payroll, so that I know immediately where I stand without clicking anything.
- As a PR Admin, I want a "Run Payroll" button that is context-aware — showing "Resume Run" when I already started one — so I can re-enter the right workflow with one click.
- As a PR Admin, I want to see who approved the current run and when once payroll is approved, so that I can confirm the right person authorized it before disbursement.
- As an Owner, I want to see the run state and approved total on the dashboard so that I know payroll is handled without logging into the detail screens.

### 8. Acceptance Criteria Themes
- Current pay period dates and scheduled pay date are displayed on dashboard load without additional navigation
- Run state is one of six defined states and reflects the live E-RP state machine; state updates within 60 seconds of a change in the underlying run
- The primary CTA is contextually correct for the current run state; "Run Payroll" and "Resume Run" route to the correct E-RP screens
- When the run is Approved, the approver name and approval timestamp are displayed
- When no run has ever been completed (new company), a first-run prompt replaces the last-run summary
- Dashboard panel loads without error for companies with 0–200 employees

### 9. Dependencies & Risks
- **E-RP Run State Machine** — High risk at Alpha; this epic is entirely dependent on E-RP's run state being queryable; mock data required if E-RP is not ready at Alpha
- **Pay Schedule / Calendar Engine** — Pay period dates and next pay date must be computed and available at dashboard load; dependency on Company Setup (E1)
- **Risk:** If run state is stale (>60s), admin may see a misleading state (e.g., "Not Started" when run is Calculating) — staleness window must be agreed and communicated via a "last refreshed" indicator

### 10. Success Metrics / KPIs
- Admin time from dashboard open to payroll run entry (`dashboard_loaded` → `run_payroll_clicked`) — target: <30 seconds
- Run state accuracy — target: displayed state matches actual state within 60 seconds 100% of the time
- "Resume Run" click-through rate — indicates admin is landing on dashboard mid-run and re-entering correctly

### 11. Assumptions
- E-RP run state is queryable as a structured API endpoint returning current run state per company/pay period
- Pay period and pay date computations are owned by the pay schedule engine (E1); the dashboard reads pre-computed values
- At Alpha, a simplified version (run state + "Run Payroll" CTA + next pay date) is sufficient; full CTA context-sensitivity is Beta

---

## Epic E-PD-2 — Attention Required Panel

### 1. Goal / Outcome
Aggregate every open item across all payroll modules — unresolved time exceptions, employees with incomplete setup, unsigned authorization forms, expiring compliance artifacts — into one scannable, prioritized, action-linked panel on the dashboard. The admin should never miss a payroll blocker because it was buried in a module they didn't navigate to. Attention Required is the system's commitment to proactively surfacing what matters, not waiting for the admin to find it.

### 2. Primary Personas
- **PR Admin** — primary actor; views and resolves attention items
- **Owner / Exec** — secondary; reads the count as a signal of operational health

### 3. Business & PRD Drivers
- **G2** — Surface all items requiring attention before they become missed deadlines or payroll failures
- **G3** — Right information at the right time; only actionable items appear
- **UC-2** — P0 use case for Beta
- **FR: Attention Required Panel** — aggregated cross-module items with resolution links
- **User Insight 1** — SMB owners want a "safety net" that catches issues before they cascade

### 4. Problem / Rationale
Payroll failures in construction SMBs are rarely caused by one big mistake — they are caused by a collection of small oversights: a time exception no one resolved, a new hire whose bank account isn't verified, a state tax form that expired. These issues live in different screens and no current tool aggregates them into a single proactive view. By the time the admin discovers the issue (often at run initiation), the Friday Crunch is in full force and recovery is stressful.

### 5. In Scope
- Dedicated "Attention Required" panel with a count badge in the panel header
- Item types surfaced (minimum set at Beta):
  - **Unresolved time exceptions** — count, pay period, direct link to E3 exception resolution
  - **Employees with incomplete pay setup** — count + employee names, direct link to each employee's setup
  - **Unsigned authorization forms** — type (Form 8655, state form), jurisdiction, direct link to authorization
  - **Banking verification incomplete** — direct link to banking step
  - **Tax deposit due within 3 business days** — jurisdiction, amount due *Inferred*, due date, direct link to tax section
  - **State tax registration missing for a nexus state** — state name, direct link to state tax setup
- Item display format: category icon + plain-language label + affected entity + "Resolve →" action link
- "All clear" affirmative state when no items exist: "✓ No open items — you're ready to run payroll"
- Navigation badge on Payroll nav item showing total Attention Required count — P1

### 6. Out of Scope (for this epic)
- Resolving the underlying items — each resolution is handled in the owning module (E1, E2, E3, etc.)
- AI-generated risk flags (anomaly detection) — E-PD-7 / E11
- Notifications for completed actions — E-PD-7
- Items that are informational only (no required action) — these belong in Upcoming Dates or Notifications

### 7. Example "Super Stories"
- As a PR Admin, I want to open my payroll dashboard and immediately see a list of everything blocking or endangering my next payroll run, with a direct link to fix each one, so that I can act before the Friday Crunch.
- As a PR Admin, I want the Attention Required panel to show "All clear" when there's nothing to fix, so I can proceed to run payroll with confidence rather than wondering if I missed something.
- As an Owner, I want to see the count of open attention items when I glance at the dashboard, so that I can gauge whether the office manager has everything under control.

### 8. Acceptance Criteria Themes
- Every Attention Required item type has a plain-language label understandable by a non-accountant admin
- Each item includes a working "Resolve" link that routes to the correct remediation screen in the owning module
- Items are removed from the panel within 60 seconds of being resolved in their source module
- When zero items exist, the panel displays an affirmative "all clear" state — not empty space
- Tax deposit items surface 3 business days before the due date; items past due surface immediately (overdue)
- The panel count badge in the navigation reflects the same count as the panel itself

### 9. Dependencies & Risks
- **Cross-module API contracts** — High risk; each of E1, E2, E3, E5, and tax engine must expose a structured "open items" API; this is a significant coordination effort
- **Risk:** If modules expose inconsistent or latent data, the Attention Required panel will feel unreliable and admins will lose trust in it — API contract and SLA agreements are critical before Beta launch
- **Risk:** Item overload — if too many item types are included at launch, the panel becomes noise. Start with the minimum set and expand based on admin feedback.

### 10. Success Metrics / KPIs
- Attention item resolution rate from dashboard vs. module-direct navigation (`attention_item_resolved_from_dashboard` / total `attention_item_resolved`) — target: >50% resolved from dashboard link
- Mean time from attention item surfaced to resolved — target: <24 hours for blocking items
- Payroll run failures attributable to items that were surfaced but not resolved — tracked for audit and product iteration

### 11. Assumptions
- Each module (E1, E2, E3, E5, tax) will expose a structured API returning open items in a defined format: `{ item_type, description, affected_entity_id, severity, action_url }`
- The dashboard aggregation layer assembles these into a unified list — it does not own the business logic for determining when an item is "open"
- At Alpha, a simplified Attention Required panel (time exceptions only + incomplete setup) is sufficient; full item set is Beta

---

## Epic E-PD-3 — Upcoming Dates & Deadline Tracker

### 1. Goal / Outcome
Give the PR Admin a reliable, 60-day forward view of every payroll-relevant date — pay dates, tax deposit deadlines, state filing deadlines, and compliance expiration dates. Deadlines in construction payroll are non-negotiable: missed federal tax deposits carry immediate penalties. The Upcoming Dates panel is the admin's pre-emptive awareness layer, allowing them to plan ahead rather than react.

### 2. Primary Personas
- **PR Admin** — primary actor; monitors upcoming deadlines and plans accordingly
- **Owner / Exec** — secondary; checks next pay date and major tax deadlines

### 3. Business & PRD Drivers
- **G2** — Surface upcoming deadlines before they become missed deadlines
- **G3** — Only relevant dates surfaced; not a calendar dump
- **UC-4** — P0 use case for Beta
- **FR: Upcoming Dates Panel** — chronological, urgency-ranked date list
- **User Insight — Compliance Trap** — SMBs are most afraid of compliance failures; visibility into deadlines is a direct anxiety reducer

### 4. Problem / Rationale
Construction SMB admins manage multiple overlapping payroll calendars: weekly pay cycles, semi-weekly or monthly federal tax deposits, quarterly FUTA filings, state withholding deadlines that vary by state. These dates are currently scattered across the payroll system (if visible at all), the IRS website, state tax authority websites, and the admin's personal calendar. Aggregating them into one forward-looking view is a meaningful reduction in compliance risk.

### 5. In Scope
- Rolling 60-day upcoming date list, chronologically sorted
- Date types included at Beta:
  - Next pay date(s) — per active pay schedule
  - Federal 941 tax deposit due dates (semi-weekly, monthly per company's deposit schedule)
  - State withholding deposit and filing deadlines (per registered nexus states)
  - FUTA quarterly filing / payment deadlines
  - Upcoming pay period end dates (when time must be confirmed)
- Urgency visual treatment: dates within 7 days highlighted with a visual urgency indicator
- Overdue items are NOT shown here — they are surfaced in Attention Required (E-PD-2)
- Clicking a date item shows a brief tooltip/detail: date name, jurisdiction (if applicable), brief action guidance
- WC policy expiration (if within 60 days) — P1 — *Inferred*

### 6. Out of Scope (for this epic)
- Full tax calendar and historical filing records — Reporting & Audit (E10)
- Overdue deadlines — Attention Required (E-PD-2)
- Actions to complete tax deposits or filings — Tax Remittance initiative
- External calendar integration (export to Outlook/Google Calendar) — post-GA — *Inferred*

### 7. Example "Super Stories"
- As a PR Admin, I want to see my next pay date, the upcoming federal tax deposit deadline, and any state filing deadlines in one panel so that I can plan my week without visiting three different websites.
- As a PR Admin, I want dates within 7 days to stand out visually so that my eye goes there first without having to scan the entire list.
- As an Owner, I want to see when the next payday is at a glance when I check the dashboard, so I know when payroll cash needs to be available.

### 8. Acceptance Criteria Themes
- The 60-day date list is populated at dashboard load and reflects the company's actual pay schedule and tax deposit schedule
- Dates within 7 calendar days are visually distinguished from later dates (e.g., color or icon treatment)
- Federal tax deposit dates reflect the company's deposit schedule (semi-weekly vs. monthly) as configured in Company Setup
- State deadlines display only for registered nexus states
- No overdue dates appear in this panel; they are reflected in Attention Required
- Date detail tooltip correctly describes the deadline and its jurisdiction (if applicable)

### 9. Dependencies & Risks
- **Tax Engine / Compliance Calendar** — Must generate a structured, forward-looking deadline list per company; High risk if this data is not already computed; may require a dedicated "payroll compliance calendar" service
- **Pay Schedule Engine (E1)** — Source of pay dates and period end dates
- **Risk:** Tax deposit schedule accuracy depends on correct configuration in Company Setup; if the deposit schedule is misconfigured, deadlines will be wrong — validation step at Company Setup is a mitigation

### 10. Success Metrics / KPIs
- Upcoming Dates panel view rate per dashboard session — target: >80% of sessions (indicates admins are checking it)
- Tax deposit deadlines missed (deposits not made before due date) — compliance KPI; target: 0 at GA
- Admin-reported anxiety reduction around deadlines — qualitative; captured in Beta user research

### 11. Assumptions
- The tax engine can generate a forward-looking deadline list per company, per jurisdiction, based on the company's registered deposit schedule
- Pay dates are computed by the pay schedule engine (E1) and are available as a queryable list of future dates
- At Alpha, Upcoming Dates shows only the next pay date; full tax deadline integration is Beta

---

## Epic E-PD-4 — Recent Activity & Run History Summary

### 1. Goal / Outcome
Surface the most recently completed payroll run as a summary card on the dashboard: total net pay, employee count, pay period, approver, and approval date. This gives the admin (and owner) immediate confirmation that last payroll ran correctly, without navigating to run history. It also serves as a persistent audit signal — "payroll was run, approved by [name], for [amount], on [date]" — visible at a glance.

### 2. Primary Personas
- **PR Admin** — primary actor; confirms last run completed correctly
- **Owner / Exec** — confirms payroll was run and by whom; reconciles against bank
- **External CPA / Bookkeeper** — confirms completed run exists for the period

### 3. Business & PRD Drivers
- **G1** — Situational awareness: admin knows last run status without navigating
- **G5** — Key metrics and historical context immediately accessible
- **UC-5** — P1 use case for Beta
- **FR: Recent Activity / Last Run Summary** — last completed run card with financials and click-through

### 4. Problem / Rationale
A recurring admin anxiety: "Did last week's payroll actually go through? Was it approved?" Currently, admins must navigate to run history to confirm. The Recent Activity card brings that confirmation to the surface — especially valuable for owners who log in episodically and just need a status check.

### 5. In Scope
- Summary card for the most recently completed (Approved or Disbursed) payroll run:
  - Run type (Regular, Off-Cycle)
  - Pay period start / end dates
  - Total gross pay and total net pay
  - Employee count
  - Approver name and approval timestamp
  - Disbursement date (if Disbursed)
  - Run state badge (Approved / Disbursed)
- "View Full Run" link → navigates to E-RP-8 run history detail for that run
- "View All Runs" link → navigates to E-RP-8 full run history list
- First-run state: when no run has ever been completed, card shows "No payroll runs yet — run your first payroll to get started" with a CTA
- Off-cycle run: if the most recent completed run was off-cycle, it is shown with the off-cycle label; the most recent regular run is shown below it — P1 — *Inferred*

### 6. Out of Scope (for this epic)
- Full run history list and pagination — E-RP-8
- Per-employee drill-down from dashboard — E-RP-4
- Payroll reports and exports — E10
- Run state machine management — E-RP-8

### 7. Example "Super Stories"
- As a PR Admin, I want to see a summary of the last payroll run (total net, employee count, who approved it, when) on my dashboard so that I can confirm it ran correctly without navigating to history.
- As an Owner, I want to see who approved last week's payroll and for how much, so that I can reconcile the disbursement with our bank statement without asking the office manager.
- As a CPA doing a monthly review, I want to see the most recent run summary on the dashboard to confirm all pay periods in the month have a corresponding completed run.

### 8. Acceptance Criteria Themes
- Most recently completed run (Approved or Disbursed) is displayed as a summary card on dashboard load
- Card displays: run type, pay period dates, total gross, total net, employee count, approver, approval date
- "View Full Run" click navigates to the correct run in E-RP-8 run history
- First-run state is handled gracefully with an appropriate prompt and CTA
- If the most recent completed run was off-cycle, it is labeled as such; the most recent regular run is also visible — P1

### 9. Dependencies & Risks
- **E-RP-8 Run History** — Card data sourced from E-RP's run record; API must return the most recently completed run per company
- **Risk:** If E-RP does not store approver identity in the run record, the card cannot display who approved — data model requirement must be confirmed before Beta build

### 10. Success Metrics / KPIs
- "View Full Run" click-through rate from dashboard — baseline metric; indicates admins are using the card as an entry point, not just passive confirmation
- Owner and CPA dashboard engagement (session time, click-through to run detail) — indicates value for non-admin roles

### 11. Assumptions
- E-RP run records store approver identity (name), approval timestamp, total gross, and total net — surfaced via a "last completed run" API endpoint
- "Most recently completed" is defined as the run with the latest `approval_date` in Approved or Disbursed state

---

## Epic E-PD-5 — Payroll Metrics & Data Highlights

### 1. Goal / Outcome
Present a curated set of current and YTD payroll metrics — total gross payroll, employer tax costs, active headcount, average weekly net pay — as scannable data cards on the dashboard. These metrics give the admin (and owner) the financial pulse of their payroll operation without requiring a report run. They are contextual, not analytical: designed for a 10-second scan, not a 30-minute review.

### 2. Primary Personas
- **PR Admin** — monitors current payroll economics; flags unexpected changes
- **Owner / Exec** — primary audience for YTD totals; reconciles against budget/forecast

### 3. Business & PRD Drivers
- **G1** — Situational awareness: key financials visible without navigating to reports
- **G5** — Key payroll metrics immediately accessible from the dashboard
- **UC-6** — P1 use case for Beta
- **FR: Payroll Metrics Panel** — YTD gross, employer tax, headcount, avg weekly

### 4. Problem / Rationale
Construction SMB owners want to know: "Is payroll costing what I expected?" They currently must run a payroll report, export it, and manually compute YTD figures. The metrics panel brings these to the surface — not for deep analysis (that's E10), but for the ambient financial awareness that building owners expect from modern financial tools.

### 5. In Scope
- Data card set at Beta (minimum):
  - **YTD Gross Payroll** — total gross wages paid year-to-date
  - **YTD Employer Tax Cost** — employer FICA + FUTA/SUTA year-to-date — *Inferred*
  - **Active Employees** — current active employee count
  - **Avg Weekly Net Payroll (8-week trailing)** — rolling average of net pay over last 8 pay periods — *Inferred*
- Cards presented as a summary bar or card row — not a table
- Cards are non-interactive at Beta (display only); drill-down to E10 reports links at GA — *Inferred*
- Metrics reset at calendar year boundary; YTD label includes the current year
- Owner and CPA roles see the same metrics in read-only mode (no action links)

### 6. Out of Scope (for this epic)
- Full payroll reports, exports, or detailed analytics — E10
- Job-level labor cost metrics — covered in Prism Accounting integration (E9)
- Budget vs. actuals comparison — E10
- Employee-level pay detail — E-RP-4

### 7. Example "Super Stories"
- As an Owner, I want to see YTD gross payroll and employer tax cost on the dashboard so that I can tell at a glance whether we're on track with our payroll budget.
- As a PR Admin, I want to see the current active employee count on my dashboard so that I can quickly spot if someone was accidentally inactivated before I run payroll.
- As an Owner, I want the 8-week average weekly payroll to be visible so that I can catch if payroll is running materially higher than normal without diving into reports.

### 8. Acceptance Criteria Themes
- YTD Gross and YTD Employer Tax Cost metrics are computed correctly through the most recent completed payroll run
- Active Employee Count reflects the current count of active employees in Employee Management
- Avg Weekly Net (8-week trailing) is computed from the last 8 completed pay periods, not just the last 8 calendar weeks
- Metrics reset at January 1 of each year; the year is labeled (e.g., "2026 YTD")
- All metrics display in under 3 seconds on dashboard load
- Owner and CPA roles see all metrics; no action links are exposed to those roles

### 9. Dependencies & Risks
- **E-RP / Payroll Run Records** — YTD and trailing average metrics require querying all completed run records for the current year; a pre-computed aggregate or cached value is strongly preferred for performance
- **Employee Management** — Active employee count sourced from Employee Management module
- **Risk:** If aggregate computation happens at query time (not pre-cached), dashboard load performance will degrade for companies with many runs in the year — caching strategy required before Beta

### 10. Success Metrics / KPIs
- Dashboard engagement with metrics panel — time-on-page, click-through (GA) to reports
- Owner-role dashboard session rate — indicates whether the metrics panel is driving executive engagement
- Metric accuracy vs. E10 report figures — target: zero discrepancy between dashboard metrics and E10 equivalents

### 11. Assumptions
- YTD and trailing metrics are pre-computed by a backend aggregation service and refreshed on each run completion — not computed at dashboard load time
- "Active employees" is a queryable boolean attribute on each employee record in the Employee Management domain
- At Alpha, the metrics panel is not included; Beta is the minimum delivery milestone for this epic

---

## Epic E-PD-6 — Quick Actions & Navigation Hub

### 1. Goal / Outcome
Provide a persistent, context-sensitive quick-action area on the dashboard that surfaces the most common admin workflows as one-click entry points. The Quick Actions hub is the operational accelerator: it routes the admin directly into the right workflow without requiring navigation menu use. Over time, it becomes the muscle memory entry point that makes Prism Payroll the first place the admin goes — not a menu they have to remember.

### 2. Primary Personas
- **PR Admin** — primary actor; uses quick actions to navigate to the most frequent tasks
- **Owner / Exec** — secondary; may use read-only links (View Reports, View Run History)

### 3. Business & PRD Drivers
- **G4** — Direct entry points to the most common payroll workflows from a single surface
- **G6** — Daily engagement habit; dashboard becomes the operational home base
- **UC-7** — P1 use case for Beta
- **FR: Quick Actions** — context-sensitive, role-appropriate action links

### 4. Problem / Rationale
SMB admins who must navigate a menu to find "Add Employee" or "View Reports" are less likely to do so proactively. Quick actions reduce the friction cost of each individual workflow entry to near zero — a measurable contributor to admin engagement and operational hygiene. Context-sensitivity (e.g., "Resume Run" replacing "Run Payroll" when a run is active) prevents the cognitive dissonance of clicking a wrong action.

### 5. In Scope
- Quick action buttons / cards at Beta (minimum set):
  - **Run Payroll** (context-sensitive: changes to "Resume Run" when a run is in progress)
  - **Add Employee**
  - **View Reports**
  - **Manage Pay Schedules**
  - **View Tax Calendar**
- Role-appropriate visibility: Owner role sees View Reports and View Run History; action buttons requiring Admin role are hidden for Owner/CPA
- Actions link directly to the correct entry-point screen in the target module
- Visual treatment: quick actions are visually distinct from the informational panels; designed for scanning and clicking

### 6. Out of Scope (for this epic)
- The actual execution of each workflow — those are owned by their respective modules
- Custom quick action configuration by the admin — post-GA feature — *Inferred*
- Mobile quick action layout — GA

### 7. Example "Super Stories"
- As a PR Admin, I want to click "Add Employee" from the dashboard without navigating through a menu, so that when I think "I need to add someone," I can act on it immediately.
- As a PR Admin who is mid-payroll-run, I want the "Run Payroll" button to show "Resume Run" so I know I have an active run and am directed to the right place.
- As an Owner, I want to click "View Reports" from the dashboard so that I can get to financial summaries without navigating through payroll-admin screens.

### 8. Acceptance Criteria Themes
- All quick action buttons route to the correct entry-point screen in the target module with no intermediate steps
- "Run Payroll" changes to "Resume Run" (or equivalent) when a run is in Calculating or Under Review state
- Owner and CPA roles do not see Admin-only actions (Run Payroll, Add Employee) in the quick actions panel
- Quick actions are visible without scrolling on a 1440px desktop alongside other dashboard panels
- All actions are keyboard-navigable and screen-reader-compatible (WCAG 2.1 AA)

### 9. Dependencies & Risks
- **E-RP Run State** — Context-sensitivity of the Run Payroll/Resume Run button depends on E-PD-1's run state query
- **RBAC** — Role-appropriate visibility requires RBAC service integration; must be confirmed before Beta
- **Risk:** If quick actions route to wrong entry points (e.g., adding an employee starts on the wrong step), the actions lose trust and get abandoned — deep-link routing must be tested before Beta launch

### 10. Success Metrics / KPIs
- Quick action click-through rate per action type (`quick_action_clicked` by `action_type`) — indicates which actions are most-used; informs future prioritization
- Sessions in which admin uses a quick action vs. main navigation — target: >40% of sessions use at least one quick action

### 11. Assumptions
- Each target module has a stable deep-link URL for its primary entry point (e.g., `/payroll/run/initiate`, `/employees/add`)
- RBAC role information is available at dashboard render time from the session/auth service

---

## Epic E-PD-7 — Notifications & AI Insights

### 1. Goal / Outcome
Surface two complementary signal types on the dashboard: (1) system-generated notifications for completed and notable events (payroll approved, tax deposit submitted, employee added) that give the admin a running operational log without leaving the dashboard; and (2) AI-generated insights from E11 (AI Assistance) that proactively identify patterns, risks, or optimization opportunities — surfaced only when actionable, dismissed with a single click. Together, these make the dashboard a proactive partner rather than a passive status screen.

### 2. Primary Personas
- **PR Admin** — primary consumer of both notifications and AI insights
- **Owner / Exec** — secondary; may receive high-level notifications (payroll approved, large run variance flagged)

### 3. Business & PRD Drivers
- **G2** — Proactively surface issues and opportunities before admin must seek them out
- **G6** — Daily engagement habit; AI insights give admins a reason to check the dashboard even when no run is active
- **UC-9, UC-10** — P1 and P2 use cases respectively
- **E11 AI Assistance initiative** — AI insights are sourced from E11
- **User Insight — AI Safety Net** — Admins want proactive AI support that catches issues before they cascade

### 4. Problem / Rationale
Without a notification layer, completed events (tax deposit submitted, payroll disbursed) are invisible to the admin unless they navigate to the relevant screen. Without AI insights, patterns that should trigger action ("your labor cost is up 15% this period") remain hidden in reports that admins rarely open proactively. Notifications close the "I didn't know that happened" gap; AI insights close the "I wouldn't have thought to look at that" gap.

### 5. In Scope

**Notifications (P1 — Beta):**
- System notification list (most recent first) surfaced on dashboard
- Notification types at Beta:
  - Payroll run approved
  - Payroll disbursed (ACH sent)
  - Tax deposit submitted
  - Employee added or status changed
  - Form 8655 signed / authorization completed
  - Banking verification completed or failed
- Notifications are dismissible; dismissed state persists per user
- "View All" link → notification history (last 30 days) — P2

**AI Insights (P2 — GA):**
- AI insight cards sourced from E11, surfaced on dashboard
- Insight types at GA:
  - Labor cost variance vs. trailing average (e.g., "This period's payroll is 12% above your 8-week average")
  - Overtime risk alert (e.g., "2 employees are approaching OT thresholds with 2 days left in the period")
  - Tax liability milestone (e.g., "Your FUTA liability is approaching the $500 quarterly deposit threshold")
- Insights surface only when the condition is materially actionable; no informational noise
- Admin can dismiss an insight; dismissed insights are not re-surfaced for the same condition within the same period
- Dismissed insights logged with actor and timestamp

### 6. Out of Scope (for this epic)
- AI anomaly detection on a payroll run (that's E-RP-5 / E11 within the run workflow)
- Push notifications (email, SMS) — *Inferred* as a post-GA enhancement
- Notification preferences / configuration — post-GA
- AI insight configuration or threshold tuning by admin — owned by E11

### 7. Example "Super Stories"
- As a PR Admin, I want to see a notification that last week's payroll was disbursed on my dashboard, so that I don't have to navigate to run history to confirm it went through.
- As a PR Admin, I want to see an AI insight that says "Your payroll cost this week is 14% above your recent average — driven by overtime on Job 7" so that I can investigate before it becomes a larger problem.
- As an Owner, I want to be notified when payroll is approved so that I know the cash will clear our account on the scheduled pay date.
- As a PR Admin, I want to dismiss an AI insight I've already acted on so that it doesn't take up space on my dashboard.

### 8. Acceptance Criteria Themes
- All notification types listed in scope are generated correctly and appear on the dashboard within 5 minutes of the triggering event — *Inferred*
- Dismissed notifications remain dismissed across sessions (persistent, per-user)
- Notification history (P2) shows all notifications from the last 30 days regardless of dismissed state, with dismiss actor and timestamp
- AI insights (GA) appear only when the triggering condition meets E11's confidence threshold; no insight appears for a condition that was already dismissed this period
- Dismiss action for AI insights is a single click; no confirmation required
- All AI insight text is plain-language, understandable by a non-accountant admin (no tax codes or jargon)

### 9. Dependencies & Risks
- **E11 AI Assistance initiative** — High risk for GA; if E11 is not delivering at GA, the AI Insights panel is not delivered; notifications-only is the Beta deliverable
- **Event / messaging system** — Notifications require a backend event bus or notification service that emits structured events for each triggering action; if not already in place, this is a platform engineering dependency
- **Risk:** Notification fatigue — if too many low-value notifications are generated, admins will ignore them. Notification types must be curated and tested for signal-to-noise before Beta launch.

### 10. Success Metrics / KPIs
- Notification engagement rate — `notification_viewed` / `notification_surfaced` — target: >60%
- AI insight action rate — `insight_action_taken` / `insight_surfaced` — *Inferred* target: >30%
- AI insight dismiss rate by insight type — fed back to E11 for model calibration
- Admin sessions with at least one notification interaction — engagement baseline

### 11. Assumptions
- E11 generates structured AI insights with a defined schema: `{ insight_type, description, affected_entity, confidence_level, action_url }` — consistent with the E-RP-5 schema
- The platform already has or will have an event/notification service before Beta; this epic consumes it, not owns it
- AI Insights panel is gated behind a feature flag at Beta if E11 is not production-ready; notifications are delivered independently

---

## Traceability Table

| Requirement / UC ID | Short Description | Epic(s) |
|---------------------|-------------------|---------|
| G1 | Instant situational awareness of payroll state | E-PD-1, E-PD-4, E-PD-5 |
| G2 | Surface all attention-required items proactively | E-PD-2, E-PD-3, E-PD-7 |
| G3 | Right information at the right time; reduce cognitive load | E-PD-1, E-PD-2 |
| G4 | Direct entry points to common workflows | E-PD-1, E-PD-6 |
| G5 | Key metrics immediately accessible | E-PD-4, E-PD-5 |
| G6 | Daily engagement habit | E-PD-6, E-PD-7 |
| UC-1 | Admin sees current payroll state at a glance | E-PD-1 |
| UC-2 | Admin sees and acts on Attention Required items | E-PD-2 |
| UC-3 | Admin launches payroll run from dashboard | E-PD-1, E-PD-6 |
| UC-4 | Admin views upcoming dates and deadlines | E-PD-3 |
| UC-5 | Admin views last completed run summary | E-PD-4 |
| UC-6 | Admin sees key payroll metrics | E-PD-5 |
| UC-7 | Admin accesses quick links to common tasks | E-PD-6 |
| UC-8 | Owner / CPA views dashboard in read-only mode | E-PD-1, E-PD-4, E-PD-5 |
| UC-9 | Admin receives and manages notifications | E-PD-7 |
| UC-10 | Admin sees AI-generated insights | E-PD-7 |
| FR: Current Pay Period Status Panel | Live run state, pay dates, employee count, CTA | E-PD-1 |
| FR: Attention Required Panel | Cross-module items with resolution links | E-PD-2 |
| FR: Upcoming Dates | 60-day deadline tracker, urgency-ranked | E-PD-3 |
| FR: Recent Activity | Last run card with financials and click-through | E-PD-4 |
| FR: Payroll Metrics Panel | YTD gross, employer costs, headcount, avg weekly | E-PD-5 |
| FR: Quick Actions | Context-sensitive workflow entry points | E-PD-6 |
| FR: Notifications | System event notifications, dismissible | E-PD-7 |
| FR: AI Insights | E11 insights surfaced on dashboard | E-PD-7 |
| NFR: Performance | Dashboard loads <3s for 200-employee companies | E-PD-1, E-PD-5 |
| NFR: Accuracy | Attention items resolve within 60s of source change | E-PD-2 |
| NFR: RBAC | Role-appropriate visibility for Owner/CPA | E-PD-1, E-PD-5, E-PD-6 |
| NFR: Accessibility | WCAG 2.1 AA compliance | E-PD-6 |
| OQ-1 | Cross-module open items API contract | E-PD-2 |
| OQ-2 | Attention Required prioritization logic | E-PD-2 |
| OQ-3 | Dashboard data staleness window | E-PD-1, E-PD-2 |
| OQ-4 | Owner role financial visibility scope | E-PD-5 |
| OQ-5 | Dashboard as default landing page | E-PD-1 |
| OQ-6 | AI Insights feature flag at Beta | E-PD-7 |
