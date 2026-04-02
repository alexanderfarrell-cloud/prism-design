# PRD: Prism Construction Payroll — Time Collection & Traqspera Integration

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Pay Stubs, Tax Filing, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Time Collection & Traqspera Integration module bridges field time data and the Prism Payroll calculation engine. It establishes Traqspera as the authoritative source of time records, enabling supervisor-approved hours — coded to job, cost code, and trade type — to flow directly into payroll without manual transcription. The integration evolves across milestones: a file-based import stub at Alpha, a live API connection at Beta, and a fully operational real-time feed with robust exception handling at GA. The module owns the time review experience within Prism Payroll but does not own time entry or clock-in/out (Traqspera's domain).

### 1b. Problem Statement

The most common and costly payroll errors in construction originate at the time collection layer — not from calculation failures, but from bad input data. In SMB contractors, time travels a fragmented path: field workers track on paper or a standalone app, supervisors verify via text or spreadsheet, and office staff manually re-key data into payroll. This transcription is the primary error vector, corrupting gross pay, overtime, and job cost data simultaneously.

Current failure modes:

- **Manual re-entry**: Data moves from Traqspera to payroll via spreadsheet or copy-paste; every keystroke is a liability
- **Lost coding context**: Time arrives without job code or trade type, forcing payroll staff to guess or default to "General Labor" — poisoning job cost data
- **Approval blindness**: Unapproved time enters payroll runs because the admin has no visibility into the supervisor approval state
- **Late exception discovery**: Missing entries, unmatched employees, and unresolved hours surface only *after* a payroll run is initiated — creating a "Friday Crunch" re-work cycle

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Eliminate manual time data re-entry between Traqspera and Prism Payroll |
| G2 | Ensure only supervisor-approved time flows into payroll runs |
| G3 | Surface all time exceptions before a payroll run is initiated — not during or after |
| G4 | Preserve job, cost code, and trade type coding integrity through the full time-to-payroll chain |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Manual time entries by payroll admin for Traqspera employees | 0 entries per run | Operational |
| Time exceptions surfaced before payroll run | 100% | Quality |
| Time entries with complete coding (job + cost code + trade type) | 100% of entries used in payroll | Compliance |
| Admin time spent on time review per pay cycle | <15 min — **Inferred** | Efficiency |
| Payroll runs blocked by unresolved time exceptions | 0 (all resolved before run) | Quality |

### 1e. Out of Scope

- Time clock / punch clock functionality (Traqspera owns)
- Mobile time entry for field workers (Traqspera)
- Geofencing, biometrics, buddy-punch prevention (Traqspera)
- Foreman crew time entry mode (Traqspera)
- Gross pay calculation from time data (Earnings & Rate Calculation PRD — E4)
- Job cost allocation and GL posting (Prism Accounting Integration PRD — E9)
- Tax withholding or deductions (E5)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | See all time for the period; resolve issues before running payroll | "I don't know whose time is missing until I'm already in payroll" | Desktop; weekly cadence |
| **Field Supervisor** ("Muddy Boots") | Crew lead / foreman | Approve crew time quickly and accurately | Doesn't know approval matters for payroll timing; mobile, harsh conditions |
| **External CPA / Bookkeeper** | Retained accountant | Verify time allocations support correct job cost entries | Limited visibility into time coding decisions; periodic access |

### 2b. User Journeys / Workflows

**Primary: Admin Reviews Time Before Payroll Run (Beta / GA)**

```
Pay period closes
 │
 ├─ Traqspera pushes approved time → Prism Payroll ingests automatically
 │   └─ Each entry arrives with: employee ID, date, hours, job code, cost code, trade type, approval status
 │
 ├─ Admin opens "Time Review" dashboard
 │   └─ Sees all employees' hours for the pay period
 │       └─ Totals: regular hours, exception count, approval status breakdown
 │
 ├─ Exception panel surfaces actionable issues:
 │   ├─ Missing employees (active employees with 0 hours this period)
 │   ├─ Unapproved time entries (time exists but supervisor has not approved)
 │   ├─ Unmatched records (Traqspera ID not linked to a Prism Payroll employee)
 │   └─ Incomplete coding (missing cost code or trade type)
 │
 ├─ Admin resolves exceptions:
 │   ├─ Contacts supervisor for unapproved entries (notification)
 │   ├─ Manually adjusts hours where needed (audit logged)
 │   └─ Excludes or flags entries for the run
 │
 └─ Admin confirms time → payroll run unlocked
```

**Alpha Workflow (File Import Stub)**

```
Admin exports time file from Traqspera
→ Uploads to Prism Payroll (CSV/JSON)
→ System maps entries to Prism employees
→ Admin reviews exceptions and totals
→ Admin confirms → payroll run enabled
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Import time from Traqspera via file upload (Alpha) | P0 — Alpha |
| UC-2 | Live Traqspera API integration; auto-ingest approved time | P0 — Beta/GA |
| UC-3 | View time review dashboard (hours by employee, job, trade) | P0 |
| UC-4 | Surface and resolve time exceptions before payroll run | P0 |
| UC-5 | Manually adjust time entries with full audit log | P1 |
| UC-6 | Map Traqspera employee records to Prism Payroll employees | P0 |
| UC-7 | Access historical time data for prior-period adjustments | P1 — GA |
| UC-8 | View per-entry approval status; block unapproved from payroll | P0 |

---

# 3. Requirements

### 3a. Functional Requirements

#### Integration — File Import (Alpha)

- The system shall accept a structured time export file from Traqspera in CSV or JSON format — **P0**
- The system shall map imported time records to Prism Payroll employees by employee ID or configurable name-match fallback — **P0**
- The system shall surface all unmatched records as exceptions requiring admin resolution before payroll — **P0**
- The system shall reject malformed or incomplete file uploads with a descriptive error message — **P1**

#### Integration — Live API (Beta / GA)

- The system shall connect to Traqspera via API to receive time entries automatically upon pay period close — **P0**
- The system shall honor Traqspera's supervisor approval state: only entries with "Approved" status are eligible for payroll — **P0**
- The system shall support re-ingestion when entries are updated or newly approved in Traqspera after initial pull — **P1**
- The system shall handle API connection failures gracefully: alert admin, retain last successful data state, allow manual file import as fallback — **P1**

#### Time Entry Data Requirements

- Each ingested time entry shall carry: employee identifier, work date, hours, job code, cost code, trade type, and approval status — **P0**
- The system shall validate that all required coding fields (job code, cost code, trade type) are present; incomplete entries shall surface as exceptions, not silently default — **P0**
- The system shall display time in hours-and-minutes format (not raw clock-in/out timestamps) — **P0** — *Inferred*

#### Time Review Dashboard

- The system shall display all time entries for the current pay period, grouped by employee — **P0**
- The system shall show per-employee totals: regular hours, flagged hours, and approved/pending split — **P0**
- The system shall allow filtering by: employee, job, trade type, approval status, and exception type — **P1**
- The system shall display an exception panel with counts and detail for: missing employees, unapproved entries, unmatched records, incomplete coding — **P0**
- The system shall block payroll run initiation while one or more "blocking" exceptions remain unresolved — **P0**

#### Adjustments & Overrides

- An authorized admin shall be able to manually adjust hours on any entry; adjustments logged with original value, new value, admin user, timestamp, and reason code — **P0**
- An admin shall be able to flag a specific entry to exclude it from the payroll run — **P1**
- The system shall visually distinguish Traqspera-sourced entries from admin-adjusted entries — **P1**

#### Historical Time Access (GA)

- The system shall retain time data from all prior pay periods — **P1**
- An admin shall be able to access prior-period time entries to support retroactive pay adjustments — **P1**

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Time review dashboard loads <3 seconds for up to 500 time entries |
| **Availability** | Time ingestion pipeline available 99.9% during payroll processing windows |
| **Security** | RBAC: Admin full access; Supervisor view-only (own crew only); Employee no access to time review |
| **Audit** | All manual adjustments to time entries logged immutably; accessible to Admin and CPA roles |
| **Integration resilience** | API failures alert admin; file import fallback available at GA |
| **Usability** | Exception panel is actionable — each exception shows resolution path, not just a flag |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| TimeEntry | employee_id, work_date, hours, job_code, cost_code, trade_type, approval_status, source, adjustment_flag | Core payload from Traqspera |
| TimePeriod | pay_period_id, start_date, end_date, status | Ties entries to a payroll run |
| EmployeeMapping | traqspera_id, prism_payroll_employee_id | Required for record matching |
| TimeAdjustmentLog | entry_id, field, original_value, new_value, changed_by, timestamp, reason | Append-only audit log |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Traqspera | Source of all field time records | Pay period close (Alpha: manual upload; Beta/GA: API push or poll) | **Critical path** — API spec needed Sprint 1 |
| Prism Earnings Engine (E4) | Consumes reviewed time entries as payroll run input | On payroll run initiation | Internal handoff — read-only |
| Prism Job/Cost Code registry | Validate incoming job/cost codes against known Prism Accounting records | On time ingestion | Internal |

#### Platform / Infrastructure Constraints

- Time entries shall be immutable once a payroll run is finalized; adjustments create audit records, not overwrites
- Employee mapping table must be admin-configurable; Traqspera IDs may not match Prism employee IDs at launch
- ⚠️ **Requires human review**: Traqspera push (webhook) vs. Prism pull (polling) model — affects data freshness and infrastructure design

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E3-1: Traqspera Integration Pipeline** | File import stub (Alpha) → live API (Beta/GA); employee mapping; data ingestion and validation | G1, G4 | UC-1, UC-2, UC-6 |
| **E3-2: Time Review Dashboard** | Admin view of all period time by employee, job, trade; totals; filtering | G2, G3 | UC-3, UC-8 |
| **E3-3: Exception Management** | Surface and resolve missing, unapproved, unmatched, and incomplete entries; block payroll on unresolved blocking exceptions | G2, G3 | UC-4 |
| **E3-4: Time Adjustments & Audit** | Admin override of entries with immutable change log; exclusion flagging | G3, G4 | UC-5 |
| **E3-5: Historical Time Access** | Prior-period data access for retroactive adjustments | G1, G4 | UC-7 |

### 3e. High-Level Acceptance Criteria

- An admin can complete a Traqspera file import and reach the time review screen in under 5 minutes at Alpha, with all entries either mapped to employees or surfaced as named exceptions
- At Beta/GA, approved Traqspera time appears in the Prism Payroll time review dashboard without any manual import action by the admin
- No payroll run can be initiated while any blocking exception (unmatched employee, missing job/cost code) remains unresolved
- Time entries with "Pending" approval status are visible in the dashboard but explicitly excluded from payroll run eligibility
- All manual adjustments to time entries are logged with original value, new value, admin user, and timestamp — retrievable via the audit trail
- The time review dashboard loads in under 3 seconds for a full pay period with up to 500 time entries
- An admin-adjusted time entry is visually distinguishable from a Traqspera-sourced entry in the dashboard

### 3f. Links to Prototypes

- Time Review Dashboard — [TBD]
- Time Exception Resolution Flow — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- File-based time import (CSV/JSON upload from Traqspera export)
- Employee ID mapping (admin-configurable)
- Basic time review: hours by employee, regular hours only
- Exception list: unmatched employees, missing records
- Admin confirmation step to enable mock payroll run

**Beta (Trimble Dimensions)**
- Live Traqspera API integration (pull or push — TBD with Traqspera team)
- Approval state honored: only "Approved" entries eligible for payroll
- Full exception panel: missing, unapproved, unmatched, incomplete coding
- Filtering by employee / job / trade / status
- Admin manual adjustment with audit log
- Exclusion flagging

**GA (Generally Available)**
- Full real-time Traqspera connection; re-ingestion on updates
- Historical time data access for prior-period adjustments
- Retroactive pay adjustment support (feeds into E4 retroactive pay)
- Complete exception audit trail
- API failure fallback handling

---

# 5. Supporting Information

### 5a. Assumptions

- Traqspera is the sole source of field time data; admin manual entry is exception-only, not a primary workflow
- Traqspera time entries include job code, cost code, and trade type attached at the time-entry level (not post-hoc)
- A Traqspera API is available and accessible for Beta integration; Traqspera team is a willing partner
- Employee IDs in Traqspera and Prism Payroll may differ; a mapping table is required at launch

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Traqspera API specification and sandbox access | Engineering / Traqspera team | **High** — Beta critical path |
| Employee Management module (Prism employee IDs established) | E2 team | **High** — needed for mapping |
| Prism job/cost code registry API | Platform team | **Medium** — needed for code validation |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Traqspera API undocumented or unavailable at Beta | Medium | High | File import fallback maintained through Beta; early API discovery sprint | Yes — Traqspera partnership |
| Time entries arrive without trade type coding (lazy cost coding in field) | High | High | Exception surfaced to admin; silent defaults blocked; supervisor training | No |
| Supervisors unaware their approval blocks payroll | High | Medium | In-app admin alert with supervisor notification capability | No |
| Employee ID mismatch (Traqspera vs. Prism) at scale | Medium | Medium | Admin-managed mapping table; bulk import tool for initial setup | No |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Exception resolution rate | `time_exception_resolved` / `time_exception_dismissed` | Product |
| Import completion time (Alpha) | `time_import_initiated` → `time_import_complete` | Operations |
| Unapproved time rate at payroll initiation | `time_entries_unapproved_count` at `payroll_run_initiated` | Compliance |
| Manual adjustment frequency | `time_entry_adjusted` (entry_id, reason) | Operations |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Is the Traqspera integration push (webhook) or pull (polling)? What are rate limits? | Engineering / Traqspera | Sprint 1 |
| OQ-2 | Does Traqspera provide trade type on every time entry, or is it optional/nullable? | Traqspera team | Sprint 1 |
| OQ-3 | How are Traqspera time corrections (post-approval edits) surfaced to Prism after a payroll run? | Product | Sprint 2 |
| OQ-4 | Is a single pay period per Traqspera workspace, or can contractors have multiple schedules in Traqspera? | Traqspera team | Sprint 1 |
