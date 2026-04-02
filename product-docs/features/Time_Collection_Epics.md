# Epic Set: Prism Construction Payroll — Time Collection & Traqspera Integration

> *Generated from: Time_Collection_PRD_Mar2.md, System Development PlanLista.pdf, Construction Payroll User Insights Synthesis (2_4).pdf*
> *Date: March 2, 2026*

---

## Epic Set Overview

| # | Epic | One-Sentence Summary |
|---|------|----------------------|
| E3-1 | **Traqspera Integration Pipeline** | Establish reliable time data ingestion from Traqspera into Prism — file-based at Alpha, live API at Beta/GA — including employee ID mapping and ingest-time validation. |
| E3-2 | **Admin Time Review Dashboard** | Give the payroll admin a clear, organized view of all time entries for the current pay period, with approval state, coding status, and totals visible at a glance. |
| E3-3 | **Exception Management & Payroll Run Gate** | Surface every time-quality problem before a payroll run begins, make each one actionable, and enforce a hard gate that prevents run initiation while blocking exceptions remain. |
| E3-4 | **Time Adjustments & Immutable Audit Trail** | Allow authorized admins to manually correct or exclude time entries, with every change recorded in an append-only log accessible to admins and CPAs. |
| E3-5 | **Historical Time Access & Retroactive Pay Support** | Retain all prior-period time data and give the admin access to it for retroactive pay adjustments, prior-period audits, and compliance reviews at GA. |

---

## E3-1 — Traqspera Integration Pipeline

### 1. Goal / Outcome

Establish Traqspera as the authoritative source of time records in Prism Payroll by building a two-phase ingestion pipeline: a file-based import stub at Alpha and a live API connection at Beta/GA. This epic ensures that time data — including job code, cost code, trade type, and approval status — arrives in Prism without manual transcription, directly eliminating the primary error vector identified in the PRD and echoed in 31 SMB contractor interviews ("current tools don't speak to each other"). Eliminating manual re-entry eliminates the corruption of gross pay, overtime, and job cost data simultaneously.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — primary beneficiary; no longer re-keys data
- Engineering / Traqspera team — integration partner (not a user persona, but a delivery dependency)

### 3. Business & PRD Drivers

- **G1**: Eliminate manual time data re-entry between Traqspera and Prism Payroll
- **G4**: Preserve job, cost code, and trade type coding integrity through the full time-to-payroll chain
- **UC-1**: File import stub (Alpha)
- **UC-2**: Live Traqspera API integration (Beta/GA)
- **UC-6**: Employee ID mapping
- **FR-INT-1 through FR-INT-4** (file import requirements)
- **FR-API-1 through FR-API-4** (live API requirements)
- **FR-DATA-1 through FR-DATA-2** (time entry data requirements)
- System Dev Plan — Feed Manager / Ingest-Digest subsystem pattern; Transform Engine; Filter Engine

### 4. Problem / Rationale

Time currently travels from field (Traqspera) to payroll via spreadsheet or copy-paste. Every manual touchpoint is a liability: transcription errors corrupt gross pay, overtime calculations, and job cost allocations simultaneously. The User Insights synthesis confirms this as the defining pain point of the "Hodgepodge tech stack" — a chain of custody risk where an error at time collection cascades across the entire payroll and accounting system.

### 5. In Scope

**Alpha (file import):**
- Accept structured Traqspera time export in CSV or JSON format via file upload
- Map imported time records to Prism employees by employee ID; configurable name-match fallback
- Admin-configurable employee mapping table (Traqspera ID ↔ Prism employee ID), with bulk import for initial setup
- Reject malformed or incomplete files with a descriptive, field-level error message
- Surface unmatched records as named exceptions (not silently dropped)

**Beta / GA (live API):**
- Connect to Traqspera via API (push/webhook or pull/polling — architecture decision OQ-1)
- Auto-ingest approved time entries upon pay period close; no admin import action required
- Honor Traqspera's supervisor approval state at ingestion: only "Approved" entries enter the payroll-eligible pool
- Support re-ingestion when entries are updated or newly approved after the initial pull (GA)
- Graceful API failure handling: alert admin, retain last-known-good data state, allow manual file import as fallback (GA)

**All phases:**
- Each ingested entry must carry: employee identifier, work date, hours, job code, cost code, trade type, approval status
- Ingest-time validation: entries missing required coding fields are classified as exceptions, not silently defaulted

### 6. Out of Scope (for this epic)

- Time clock / punch clock / geofencing (Traqspera owns)
- Gross pay calculation from time data (E4 — Earnings & Rate Calculation)
- Job cost GL posting (E9 — Prism Accounting Integration)
- Exception resolution UI (E3-3)
- Manual admin adjustment of entry values (E3-4)
- Historical / prior-period time access (E3-5)

### 7. Example Super Stories

- "As a PR Admin, I want to upload a Traqspera time export file so that my crew's hours are loaded into Prism without manual data entry."
- "As a PR Admin, I want Prism to automatically receive approved time from Traqspera when the pay period closes so that I don't need to initiate any import action."
- "As a PR Admin, I want to configure which Traqspera employee IDs map to which Prism employee records so that all time entries are correctly attributed."
- "As a PR Admin, I want Prism to alert me if the Traqspera API connection fails so that I can fall back to a manual file import without missing a payroll cycle."

### 8. Acceptance Criteria Themes

- Admin uploads a CSV/JSON time file and reaches the time review screen in under 5 minutes, with all entries either mapped to Prism employees or listed as named exceptions (Alpha)
- Each ingested entry carries all required fields: employee ID, work date, hours, job code, cost code, trade type, approval status
- Entries with missing required fields surface as exceptions — they are never silently defaulted to "General Labor" or any fallback value
- At Beta/GA, approved Traqspera time appears in the Prism time review dashboard without any manual admin action after pay period close
- The employee mapping table is admin-editable; a bulk import tool supports initial Traqspera-to-Prism ID mapping at launch
- API failures trigger a visible admin alert; the system retains the last-known-good data state; file upload is available as fallback

### 9. Dependencies & Risks

| Item | Type | Risk Level |
|------|------|-----------|
| Traqspera API specification and sandbox access | External / Traqspera team | **High** — Beta critical path |
| Employee Management module (Prism employee IDs established) | Internal / E2 team | **High** — needed before mapping works |
| Push (webhook) vs. pull (polling) model — OQ-1 | Architectural decision | **Medium** — affects infrastructure design and data freshness |
| Traqspera trade type nullability — OQ-2 | Data contract | **High** — if nullable, exception volume could be very high |
| Prism job/cost code registry API | Platform team | **Medium** — needed for ingest-time code validation |

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Manual time entries by admin for Traqspera employees | 0 per run |
| File import: admin reaches Time Review in <5 minutes from upload | 100% of imports (Alpha) |
| Time entries with complete coding at ingestion | 100% of entries used in payroll |
| API data freshness at Beta | Approved time visible in Prism within [SLA TBD with Traqspera] of pay period close |

### 11. Assumptions

- Traqspera is the sole source of field time data; admin manual entry is exception-only, not a primary workflow
- Traqspera time entries include job code, cost code, and trade type at the time-entry level (not post-hoc)
- A Traqspera API environment is available and accessible for Beta; Traqspera team is a willing integration partner
- Employee IDs in Traqspera and Prism Payroll may differ at launch; a mapping table is required

---

## E3-2 — Admin Time Review Dashboard

### 1. Goal / Outcome

Give the payroll admin a unified, organized view of all time entries for the current pay period so they can assess completeness, verify coding, and understand their payroll scope before initiating a run. The dashboard replaces the fragmented spreadsheet-and-report workflow that currently leaves admins unsure of whose time is missing until they're already in payroll. It serves as the command center connecting time ingestion, exception management, and run initiation.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — primary user; weekly cadence
- **External CPA / Bookkeeper** — periodic access to verify time allocations support job cost entries

### 3. Business & PRD Drivers

- **G2**: Ensure only supervisor-approved time flows into payroll runs
- **G3**: Surface all time exceptions before a payroll run
- **UC-3**: View time review dashboard
- **UC-8**: View per-entry approval status; block unapproved from payroll
- **FR-DASH-1 through FR-DASH-3**; **NFR-PERF** (dashboard loads <3 seconds)
- User Insights — Insight 2 (data silos / "one envelope"), Insight 4 (field-to-office disconnect), Insight 1 (admins need clarity, not complexity)

### 4. Problem / Rationale

Admins currently have no unified view of time — they piece together Traqspera reports and spreadsheets to determine whether all employees have submitted hours, whether coding is correct, and whether supervisors have approved. This creates the "Friday Crunch" described in both the PRD and user research: data quality problems surface only at run time, creating rework under deadline pressure.

### 5. In Scope

- Display all time entries for the current pay period, grouped by employee
- Per-employee totals: regular hours, flagged hours, approved hours vs. pending hours split
- Summary header: total employees with time, total hours this period, count of open exceptions
- Approval status indicator per entry: Approved / Pending / Excluded
- Visual distinction between Traqspera-sourced entries and admin-adjusted entries (badge or visual indicator)
- Employees with zero hours surfaced in a "Missing Employees" section (linking to E3-3 exceptions)
- Filtering by employee, job, trade type, approval status, and exception type (Beta)
- Dashboard load time ≤3 seconds for up to 500 time entries
- Display time in hours-and-minutes format (not raw clock-in/out timestamps)
- RBAC: Admin = full read + action access; Supervisor = view-only (own crew only); Employee = no access

### 6. Out of Scope (for this epic)

- Exception resolution actions (E3-3)
- Manual time adjustment controls (E3-4)
- Historical / prior-period time views (E3-5)
- Supervisor time-entry or approval interface (Traqspera)
- Mobile-optimized view (future consideration)

### 7. Example Super Stories

- "As a PR Admin, I want to see all my employees' hours for this pay period on one screen so that I can quickly assess whether everyone has submitted time."
- "As a PR Admin, I want to see each employee's approved vs. pending hours at a glance so that I can prioritize which issues need my attention before I run payroll."
- "As a PR Admin, I want to filter the time list by job or trade type so that I can verify time is correctly coded across my active projects."
- "As an External CPA, I want to view time by job and trade to verify that labor allocations support my client's job cost entries for the period."

### 8. Acceptance Criteria Themes

- Dashboard displays all employees with time for the pay period; employees with zero hours are surfaced (not hidden)
- Per-employee approved vs. pending split is visible in the employee row without requiring a drill-down
- Admin can filter by employee, job, trade type, approval status, and exception type; filters are combinable
- Dashboard loads in ≤3 seconds at p95 for a full pay period with 500 time entries
- Traqspera-sourced entries are visually distinct from admin-adjusted entries throughout the dashboard
- Unapproved entries are visible in the dashboard with a "Pending" indicator and are explicitly not eligible for payroll run inclusion

### 9. Dependencies & Risks

| Item | Type | Risk Level |
|------|------|-----------|
| E3-1 must deliver time data | Upstream | **High** — dashboard has nothing to show without ingest |
| E3-3 exception counts must surface on the dashboard | Cross-epic integration | **Medium** |
| RBAC model (Security & RBAC PRD) | Platform | **Medium** — supervisor view-only scope must be defined |

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Admin time spent on time review per pay cycle | <15 minutes |
| Dashboard load time at p95 | <3 seconds for 500 entries |
| % of payroll runs where admin opens Time Review before initiating | 100% (target post-GA) |

### 11. Assumptions

- Time entries are displayed in hours-and-minutes format; raw clock-in/out timestamps are Traqspera's concern
- Dashboard is desktop-first; responsive mobile is a future epic, not in scope here
- CPA role has the same read access as Admin but no action capabilities

---

## E3-3 — Exception Management & Payroll Run Gate

### 1. Goal / Outcome

Ensure that every time-quality problem — missing employees, unapproved entries, unmatched Traqspera records, and incomplete coding — is surfaced to the admin before a payroll run begins. This epic makes every exception actionable (not just visible) and enforces a hard payroll gate that prevents run initiation while blocking exceptions remain unresolved. It directly attacks the "Friday Crunch" and the "approval blindness" failure modes identified in the PRD and corroborated by every data source.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — primary actor; resolves exceptions
- **Field Supervisor ("Muddy Boots")** — indirect; receives notifications about their unapproved time

### 3. Business & PRD Drivers

- **G2**: Only supervisor-approved time flows into payroll runs
- **G3**: All exceptions surfaced before payroll run — not during or after
- **UC-4**: Surface and resolve time exceptions before payroll run
- **UC-8**: Block unapproved time from payroll eligibility
- **FR-DASH-4, FR-DASH-5** (exception panel; payroll run block)
- **NFR-USAB**: Exception panel must show resolution path, not just a flag
- User Insights — Insight 1 (compliance trap / risk aversion), Insight 4 ("Friday Crunch"), Theme 3 (automation of correction workflows)

### 4. Problem / Rationale

The "Friday Crunch" is the defining stressor of construction payroll operations: data quality problems surface at run time, after the office is under deadline pressure. Every exception that surfaces during a run creates cascading rework. This epic moves the discovery point to before the run — with specific, actionable resolution paths — so the admin arrives at run initiation with a clean, verified time set.

### 5. In Scope

**Exception panel — four exception types:**
- **Missing employees**: active Prism employees with 0 hours this period (non-blocking by default — may be legitimately off)
- **Unapproved entries**: time entries exist but Traqspera approval status is "Pending" (blocking)
- **Unmatched records**: Traqspera records not linked to a Prism Payroll employee (blocking)
- **Incomplete coding**: entries missing job code, cost code, or trade type (blocking)

**Resolution paths per exception type:**
- Missing employees: admin acknowledges or contacts employee; resolution logged
- Unapproved entries: admin sends in-app supervisor notification with entry details; supervisor approves in Traqspera; Prism refreshes status
- Unmatched records: admin maps Traqspera ID to Prism employee from within the exception row
- Incomplete coding: admin routes to E3-4 manual adjustment, or flags entry for exclusion

**Payroll gate enforcement:**
- Payroll run initiation button disabled while any blocking exception remains unresolved
- UI communicates clearly what is blocking and why, with a direct link to each unresolved item
- Non-blocking exceptions (missing employees) are visible but do not prevent run initiation

**Unapproved time handling:**
- Visible in dashboard with "Pending" status indicator
- Explicitly excluded from payroll run eligibility; cannot be included without approval update from Traqspera
- Admin can exclude (E3-4) or notify supervisor

**Audit:**
- Exception resolution and dismissal actions are logged (`time_exception_resolved`, `time_exception_dismissed`)

### 6. Out of Scope (for this epic)

- Manual adjustment of entry hour values or coding fields (E3-4)
- Supervisor approval interface (Traqspera owns; Prism sends notification, does not replace approval)
- Historical exception data for prior pay periods (E3-5)
- Automated AI-based anomaly detection (System Dev Plan Analysis Manager — future epic)

### 7. Example Super Stories

- "As a PR Admin, I want to see a summary of all exception types with counts so that I immediately understand what stands between me and running payroll."
- "As a PR Admin, I want to send a notification to a field supervisor about their unapproved entries directly from the exception panel so that I don't have to make a separate phone call."
- "As a PR Admin, I want the system to prevent me from initiating a payroll run while unmatched records or missing coding remain so that I cannot accidentally process bad data."
- "As a PR Admin, I want to see which employees have zero hours this period so that I can confirm they were legitimately off or follow up."

### 8. Acceptance Criteria Themes

- Exception panel displays all four exception types with counts and individual record detail on drill-in
- Each exception row includes at least one explicit resolution action (notify, map, adjust, exclude, acknowledge)
- Payroll run initiation is disabled while any blocking exception (unmatched records, incomplete coding, unapproved entries) is unresolved; the UI states precisely what is blocking and provides a direct path to resolve it
- Unapproved entries are visible with a "Pending" status indicator and are not sent to the payroll calculation engine under any circumstances
- Admin can initiate a supervisor notification from within the exception panel without leaving the workflow
- Exception resolution and dismissal events are logged with timestamp and admin identity

### 9. Dependencies & Risks

| Item | Type | Risk Level |
|------|------|-----------|
| E3-1 must classify exceptions at ingest time | Upstream | **High** |
| E3-2 dashboard must surface exception counts and drill-in links | Cross-epic | **Medium** |
| Supervisor notification requires Notification Manager infrastructure (System Dev Plan) | Platform | **Medium** |
| Supervisors unaware their approval blocks payroll | User behavior risk | **High** — mitigation: in-app notification; supervisor training is out of scope |
| Trade type missing at field level (lazy coding) | Data quality risk | **High** — exception volume could be large at launch |

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Time exceptions surfaced before payroll run | 100% |
| Payroll runs blocked by unresolved time exceptions | 0 (all resolved before run) |
| Exception resolution rate per cycle | Tracked via `time_exception_resolved` / `time_exception_dismissed` |
| Unapproved time rate at payroll initiation | Tracked via `time_entries_unapproved_count` at `payroll_run_initiated` — target: trending to 0 |

### 11. Assumptions

- "Missing employee" is non-blocking by default; admin can acknowledge that an employee was legitimately off
- "Unapproved" entries are excluded from the payroll run but retained in the record — they are never deleted
- Supervisor notification is sent via the Notification Manager (email or in-app); the specific channel is configurable per notification preferences (System Dev Plan)

---

## E3-4 — Time Adjustments & Immutable Audit Trail

### 1. Goal / Outcome

Allow authorized payroll admins to manually correct, override, or exclude specific time entries before a payroll run is finalized — while preserving an immutable, append-only record of every change. This gives admins the operational flexibility to handle real-world data imperfections while giving auditors and CPAs a complete, trustworthy paper trail. It directly addresses the compliance risk of opacity in payroll corrections and closes the exception resolution loop for cases where a Traqspera re-approval is not possible.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — creates adjustments and exclusions
- **External CPA / Bookkeeper** — reads the audit log; verifies corrections are authorized and documented

### 3. Business & PRD Drivers

- **G3**: Resolve all exceptions before payroll run (adjustments are the resolution path for some exceptions)
- **G4**: Preserve coding integrity — adjustments allow correcting wrong job code, cost code, or trade type
- **UC-5**: Manual time adjustment with full audit log
- **FR-ADJ-1 through FR-ADJ-3** (adjustment, exclusion, visual distinction)
- **NFR-AUDIT**: All manual adjustments logged immutably; accessible to Admin and CPA roles
- User Insights — Theme 3 ("Automation of Nuisance Work" / correction workflows; transparency as a trust mechanism)

### 4. Problem / Rationale

Real-world time data is imperfect even with a strong integration. A supervisor enters the wrong trade type, a worker is coded to the wrong job, or Traqspera sends a value that can't be corrected in time for payroll. Admins need the ability to fix these — but every fix without a trace is a compliance liability. The absence of an audit trail is one of the core trust problems identified in user research: "transparency and trust" on the pay stub are only possible if the data feeding it is verifiably correct and corrected properly.

### 5. In Scope

- Authorized admin can edit the following fields on any entry: hours, job code, cost code, trade type
- Every edit creates an immutable adjustment log record with: original value, new value, admin user identity, timestamp, and a required reason code (selectable from a predefined list; optional free-text note)
- Admin can flag specific entries as "Excluded" from the payroll run (entry is retained in the record but not sent to the payroll calculation engine)
- Exclusion flags are reversible before a payroll run is finalized
- Time entries are locked once a payroll run is finalized; further corrections require creating new records — not overwriting existing ones
- Visual distinction in the dashboard between Traqspera-sourced (original) entries and admin-adjusted entries
- Adjustment log is accessible to Admin and CPA roles in read-only mode; no log record can be deleted or edited post-creation

### 6. Out of Scope (for this epic)

- Retroactive adjustments to prior finalized payroll runs (E3-5)
- Bulk edit of multiple entries simultaneously (future/GA)
- Supervisor approval of admin adjustments — admin has override authority within the system
- Creating net-new time entries from scratch (not a primary workflow; out of scope per PRD Section 1e)

### 7. Example Super Stories

- "As a PR Admin, I want to correct the hours on a specific time entry and record why I made the change so that my audit trail is complete."
- "As a PR Admin, I want to exclude a suspicious entry from the current payroll run without deleting it so that I can investigate it later without affecting this cycle."
- "As an External CPA, I want to review the full adjustment log for a pay period so that I can verify all manual changes were authorized and justified."
- "As a PR Admin, I want adjusted entries to look visually different from Traqspera-sourced entries so that I always know which records reflect original field data."

### 8. Acceptance Criteria Themes

- Admin can edit hours, job code, cost code, or trade type on any entry before a payroll run is finalized
- Every edit is logged with: original value, new value, admin identity, timestamp, and a required reason code — no save action is permitted without completing these fields
- Adjustment log is append-only and immutable — no record can be deleted, edited, or overwritten post-creation
- Excluded entries remain visible in the dashboard with an explicit "Excluded" indicator; they are not sent to the payroll calculation engine
- Entries modified by admin are visually distinguishable from unmodified Traqspera-sourced entries throughout the dashboard
- CPA role can view the full adjustment log but cannot make changes
- Entries are locked once the associated payroll run is finalized; this state is communicated clearly in the UI and the lock is enforced at the data layer

### 9. Dependencies & Risks

| Item | Type | Risk Level |
|------|------|-----------|
| E3-2 dashboard must expose adjustment UI and visual indicators | Cross-epic | **Medium** |
| E3-3 exception resolution links into adjustment workflow | Cross-epic | **Medium** — many exceptions are resolved via adjustment |
| Immutability requires append-only data model (TimeAdjustmentLog entity) | Infrastructure | **Low** — well-understood pattern; see System Dev Plan |
| Risk: adjustments used to conceal payroll errors | Compliance risk | **Medium** — mitigation: full audit trail with reason codes, CPA visibility |

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Audit trail completeness | 100% of manual adjustments logged with reason code |
| Manual adjustment frequency | Tracked per `time_entry_adjusted` (baseline TBD; target: declining trend as data quality improves) |
| Time for CPA to locate a specific adjustment record | <2 minutes |

### 11. Assumptions

- Reason codes are selectable from a predefined admin-managed list (with optional free-text notes); the initial list is determined by Product and Legal
- "Finalized payroll run" is a discrete, admin-confirmed state change; the system must clearly communicate when entries transition to locked
- Adjustment log records are retained for the lifetime of the associated time entry / payroll record (indefinitely)

---

## E3-5 — Historical Time Access & Retroactive Pay Support

### 1. Goal / Outcome

Retain all prior-period time data and make it accessible to admins for retroactive pay adjustments, prior-period audits, and compliance reviews at GA. This closes the time-to-payroll chain for corrections that surface after a pay cycle has closed — a scenario that is especially common in growing SMBs dealing with late supervisor approvals, multi-state complications, or certified payroll reviews. It feeds directly into the retroactive pay capability in the Earnings & Rate Calculation PRD (E4).

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — accesses and corrects prior-period time
- **External CPA / Bookkeeper** — conducts period audits and reviews adjustment history across cycles

### 3. Business & PRD Drivers

- **G1**: Eliminate manual re-entry, including retroactive corrections
- **G4**: Coding integrity preserved across all pay periods
- **UC-7**: Historical time access for prior-period adjustments
- **FR-HIST-1, FR-HIST-2** (retain prior-period data; support retroactive adjustments)
- User Insights — Insight 5 ("Scale-Up Cliff": growing SMBs face retroactive compliance exposure); Hypothesis 3 (Certified Payroll automation critical for growth-oriented SMBs)

### 4. Problem / Rationale

Construction payroll corrections do not always happen within the same pay cycle. A missed shift, a late supervisor approval, a wrong rate, or a certified payroll audit can surface weeks after the original run. Without retained, accessible prior-period time data, admins are forced back to spreadsheets to reconstruct what was paid and why — exactly the fragmented, error-prone workflow that Prism exists to replace.

### 5. In Scope

- Retain all time entries from all prior pay periods (no data expiry at launch)
- Admin can navigate to and view any historical pay period using the same time review UI conventions as the current period
- Prior-period entries display full data: hours, coding fields, approval status, and complete adjustment history for that entry
- Admin can create a retroactive time adjustment tied to a specific prior period; this adjustment generates a feed to E4 (retroactive/off-cycle payroll)
- Complete exception audit trail: all exceptions surfaced and their resolution status are accessible across all historical periods
- CPA role has read-only access to all historical time data and adjustment logs
- Historical data is accessible since system go-live; no arbitrary cutoff

### 6. Out of Scope (for this epic)

- Retroactive payroll calculation (E4 — Earnings & Rate Calculation)
- GL corrections from retroactive pay (E9 — Prism Accounting Integration)
- Re-processing or voiding a finalized payroll run (beyond this module's scope; compliance boundary)
- Data retention policy configuration (future Admin settings item)

### 7. Example Super Stories

- "As a PR Admin, I want to view time entries from a prior pay period so that I can identify what was paid and create a retroactive correction."
- "As a PR Admin, I want to create a retroactive time adjustment tied to a specific prior period so that the correction flows into an off-cycle payroll run correctly."
- "As an External CPA, I want to view all exception resolutions and adjustments across prior periods so that I can conduct a complete payroll audit."

### 8. Acceptance Criteria Themes

- Admin can select any prior pay period and view its time entries in the same format and with the same filtering capabilities as the current period
- Prior-period time data includes the full adjustment history for every entry in that period
- Admin can initiate a retroactive time adjustment tied to a prior period; this generates a valid input to E4 off-cycle payroll processing
- All exceptions surfaced during each historical period, and their resolution status, are accessible and filterable
- CPA can access all historical time and adjustment data in read-only mode; no write access is granted
- All time records since system go-live are retained and accessible (no records are purged at launch)

### 9. Dependencies & Risks

| Item | Type | Risk Level |
|------|------|-----------|
| E3-4 adjustment log must be complete before prior-period audit is meaningful | Upstream | **High** |
| E4 (Earnings & Rate Calculation) must expose a retroactive pay input interface | Downstream | **High** — scope boundary must be formally aligned |
| Data volume at scale: historical queries across 10,000+ entries | Infrastructure | **Medium** — performance testing required before GA |
| "Retroactive" creates complexity in tax/deduction recalculations | Scope boundary risk | **High** — Prism supplies the corrected time record; tax recalculation is E4/E5 responsibility |

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Admin can locate and access a prior-period time record | <2 minutes from dashboard navigation |
| Retroactive adjustment successfully feeds into E4 off-cycle payroll run | End-to-end validation pass (integration test) |
| Historical time records retained since go-live | 100% — no data loss |

### 11. Assumptions

- "Historical access" in this epic means read access + retroactive adjustment creation; it does not mean re-running or voiding prior payroll batches
- Data retention policy is indefinite at launch; a configurable retention window is a future Admin settings item
- Performance requirements for historical queries will be defined and tested before GA

---

## Traceability Table

| Requirement ID | Short Description | Epic(s) |
|----------------|-------------------|---------|
| UC-1 | File import from Traqspera (Alpha) | E3-1 |
| UC-2 | Live API integration; auto-ingest approved time (Beta/GA) | E3-1 |
| UC-3 | View time review dashboard | E3-2 |
| UC-4 | Surface and resolve time exceptions before payroll run | E3-3 |
| UC-5 | Manual time adjustment with full audit log | E3-4 |
| UC-6 | Employee ID mapping (Traqspera ↔ Prism) | E3-1 |
| UC-7 | Historical time access for prior-period adjustments | E3-5 |
| UC-8 | Per-entry approval status; block unapproved from payroll | E3-2, E3-3 |
| FR-INT-1 | Accept CSV/JSON file upload from Traqspera | E3-1 |
| FR-INT-2 | Map time records by employee ID or name fallback | E3-1 |
| FR-INT-3 | Surface unmatched records as exceptions | E3-1, E3-3 |
| FR-INT-4 | Reject malformed uploads with descriptive error | E3-1 |
| FR-API-1 | Live API connection; auto-ingest on pay period close | E3-1 |
| FR-API-2 | Honor Traqspera approval state; only "Approved" entries eligible | E3-1, E3-3 |
| FR-API-3 | Support re-ingestion on updated/newly approved entries | E3-1 |
| FR-API-4 | Graceful API failure; alert admin; file import fallback | E3-1 |
| FR-DATA-1 | Required entry payload: employee ID, date, hours, job code, cost code, trade type, approval status | E3-1 |
| FR-DATA-2 | Validate required coding fields; surface incomplete as exceptions | E3-1, E3-3 |
| FR-DATA-3 | Display time in hours-and-minutes format | E3-2 |
| FR-DASH-1 | Display all entries for current pay period, grouped by employee | E3-2 |
| FR-DASH-2 | Per-employee totals: regular, flagged, approved/pending split | E3-2 |
| FR-DASH-3 | Filter by employee, job, trade type, approval status, exception type | E3-2 |
| FR-DASH-4 | Exception panel with counts and detail for all four exception types | E3-3 |
| FR-DASH-5 | Block payroll run while blocking exceptions remain unresolved | E3-3 |
| FR-ADJ-1 | Admin can manually adjust hours; adjustment immutably logged | E3-4 |
| FR-ADJ-2 | Admin can flag entry as excluded from payroll run | E3-4 |
| FR-ADJ-3 | Visual distinction: Traqspera-sourced vs. admin-adjusted entries | E3-2, E3-4 |
| FR-HIST-1 | Retain time data from all prior pay periods | E3-5 |
| FR-HIST-2 | Admin can access prior-period entries for retroactive pay adjustments | E3-5 |
| NFR-PERF | Dashboard loads <3 seconds for 500 time entries | E3-2 |
| NFR-AVAIL | Time ingestion pipeline 99.9% availability during payroll windows | E3-1 |
| NFR-SEC | RBAC: Admin full access; Supervisor view-own-crew only; Employee none | E3-2, E3-3 |
| NFR-AUDIT | All manual adjustments logged immutably; accessible to Admin and CPA | E3-4 |
| NFR-RESIL | API failures alert admin; file import fallback available at GA | E3-1 |
| NFR-USAB | Exception panel shows resolution path, not just a flag | E3-3 |
| G1 | Eliminate manual time re-entry between Traqspera and Prism | E3-1, E3-5 |
| G2 | Only supervisor-approved time flows into payroll runs | E3-1, E3-2, E3-3 |
| G3 | Surface all exceptions before payroll run — not during or after | E3-2, E3-3, E3-4 |
| G4 | Preserve job, cost code, and trade type coding integrity | E3-1, E3-4, E3-5 |

---

## Open Questions (pre-DoR resolution required)

| OQ | Question | Impacts |
|----|----------|---------|
| OQ-1 | Push (webhook) vs. pull (polling) from Traqspera? Rate limits? | E3-1 architecture, data freshness SLA |
| OQ-2 | Is trade type mandatory or nullable on every Traqspera entry? | E3-3 exception volume at launch |
| OQ-3 | How are post-approval Traqspera corrections surfaced to Prism after a payroll run is finalized? | E3-1, E3-5 retroactive scope |
| OQ-4 | Single or multiple pay schedules per Traqspera workspace? | E3-1 ingestion logic, E3-2 period filtering |
