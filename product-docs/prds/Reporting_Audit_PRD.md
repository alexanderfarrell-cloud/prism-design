# PRD: Prism Construction Payroll — Reporting & Audit

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Pay Stubs, Tax Filing, Tax Remittance, Prism Accounting Integration, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Reporting & Audit module provides the payroll administrator, business owner, and external CPA with complete visibility into every payroll run, every tax obligation, and every dollar of labor cost — both in real time and historically. It includes the payroll register, labor cost and job costing reports, tax liability summaries, compliance audit reports, and the change/activity audit trail. At Beta, it delivers the core payroll register and basic labor summary. At GA, it provides the full report suite with export capabilities, job cost actuals vs. budget views, and the 7-year audit trail required for FLSA and IRS compliance.

### 1b. Problem Statement

SMB construction contractors have no reliable way to answer operational and compliance questions using their current payroll tools. The typical experience: QuickBooks Payroll produces a payroll summary, but connecting that data to job costs requires a manual export to Excel. The CPA asks for a labor report by job and gets a spreadsheet that doesn't tie to the GL.

Current failure modes:

- **Payroll register gaps**: Generic payroll registers show gross and net pay but don't show which rate was applied per entry, WAOT breakdowns, or per-job labor allocation — all required for audit defense
- **No job cost report**: There is no payroll-originating report showing labor cost (fully burdened) by job and cost code. This is the single most requested report from construction contractors and the biggest gap relative to competitors
- **Audit exposure**: FLSA record-keeping requirements require 2-year retention of wage records and 3-year retention of payroll records. SMB owners using generic tools rarely know this and have no enforced retention mechanism
- **No change audit trail**: When a pay rate or withholding election changes, there is no log of who made the change, when, and what it changed from

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Admin and CPA have complete payroll register access for every run — down to the earnings-line level |
| G2 | Labor cost by job and cost code is accessible immediately after each payroll run |
| G3 | All payroll data retained and accessible for minimum 7 years |
| G4 | Complete change audit trail for all payroll-sensitive data changes (rates, elections, deductions) |
| G5 | Tax liability reports enable CPA to reconcile and prepare corporate returns without data gaps |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Payroll runs with complete register available (earnings-line detail) | 100% | Quality |
| Labor cost by job available within 15 min of payroll finalization | 100% | Operational |
| Data retention coverage (7-year accessible archive) | 100% | Compliance |
| Change audit events captured (rate, election, deduction changes) | 100% | Compliance |
| CPA data requests fulfilled without admin manual export | >90% — **Inferred** | Efficiency |

### 1e. Out of Scope

- Data analytics / business intelligence platform (not a BI tool — structured payroll reports only)
- Third-party reporting integrations (Power BI, Tableau) — future
- AI-generated narrative summaries (AI Assistance — E11)
- Real-time dashboard for field supervisors (separate experience)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** | Owner or Office Manager | Quick access to run summary; export for CPA; answer employee questions | Can't export useful data without manual reformatting | Desktop; weekly |
| **Owner / Exec** | Business owner | Know total payroll cost; compare to budget; see labor by job | "I have no idea if Job 12 is profitable based on labor alone" | Mobile + Desktop; episodic |
| **External CPA / Bookkeeper** | Retained accountant | All withholding data to prepare returns; reconcile GL to payroll | Waiting on manual exports; data doesn't tie to the GL | Desktop; quarterly/annual |

### 2b. User Journeys / Workflows

**Primary: Admin Reviews Payroll Run Register**

```
Payroll run finalized
 │
 ├─ Admin opens Payroll Register for the run
 │   ├─ Summary view: total employees, total gross, total taxes, total net
 │   └─ Detail view per employee:
 │       ├─ Earnings lines (rate, hours, trade, job, pay type, amount)
 │       ├─ Pre-tax deductions (itemized)
 │       ├─ Tax withholding (federal, state per state, local per locality)
 │       ├─ Post-tax deductions (itemized)
 │       └─ Net pay
 │
 ├─ Admin exports register:
 │   └─ CSV or PDF; filtered by: date range, employee, department
 │
 └─ CPA access: read-only view of register (no admin involvement required)
```

**Secondary: Owner Views Labor Cost by Job**

```
Owner opens "Labor Cost by Job" report
 │
 ├─ Selects: date range, job(s), cost code(s)
 │
 ├─ Report shows per job:
 │   ├─ Gross wages by cost code and trade type
 │   ├─ Employer taxes (FICA, FUTA/SUTA)
 │   ├─ WC cost
 │   └─ Total fully burdened labor cost
 │       └─ vs. budget (if budget is configured in Prism Accounting)
 │
 └─ Export to CSV / PDF
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | View payroll register (summary + earnings-line detail) per run | P0 — Beta |
| UC-2 | Export payroll register (CSV, PDF) | P0 — Beta |
| UC-3 | View labor cost by job, cost code, and trade type | P0 — GA |
| UC-4 | View fully burdened labor cost (gross + employer taxes + WC) by job | P0 — GA |
| UC-5 | View budget vs. actuals labor report per job | P1 — GA |
| UC-6 | View tax liability summary (all taxes withheld and owed) per run and per quarter | P0 — GA |
| UC-7 | View employer cost summary (FICA, FUTA/SUTA, WC) per run | P0 — Beta |
| UC-8 | Access 7-year payroll history (all runs, all employees) | P0 — GA |
| UC-9 | View change audit trail (who changed what, when, from/to) | P0 — GA |
| UC-10 | CPA read-only access to all payroll reports | P0 — Beta |
| UC-11 | View new hire and termination activity report | P1 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Payroll Register (Beta)

- The system shall generate a payroll register for every completed payroll run — **P0**
- The register summary shall show: total employees, total gross pay, total taxes withheld, total net pay, total employer cost — **P0**
- The register detail view per employee shall show: all earnings lines (rate, hours, trade type, job, pay type, amount); all deductions (pre-tax, post-tax, itemized); all tax withholding (by jurisdiction); net pay — **P0**
- The system shall allow export of the register in CSV and PDF formats — **P0**
- The system shall allow filtering by: pay period, employee, department, pay type — **P1**

#### Labor Cost & Job Costing Reports (GA)

- The system shall display labor cost by job and cost code, sourced from E9 Prism Accounting Integration labor burden data — **P0** (GA)
- The report shall show per job: gross wages, employer taxes (FICA, FUTA/SUTA), WC cost, and total fully burdened cost — **P0** (GA)
- The report shall support date range selection across multiple payroll runs — **P0** (GA)
- Where budget data is available from Prism Accounting, the system shall display budget vs. actuals variance — **P1** (GA)
- The system shall allow export in CSV and PDF — **P0** (GA)

#### Tax Liability Reports (GA)

- The system shall provide a tax liability summary per run and per quarter: FIT withheld, SS/Medicare withheld (employee + employer), state income tax per state, SUTA per state, local tax per locality — **P0** (GA)
- The system shall provide a 941 pre-population summary per quarter for CPA review — **P0** (GA)
- The system shall allow CPA to download the quarterly tax summary in PDF — **P0** (GA)

#### Employer Cost Summary (Beta)

- The system shall display total employer cost per run: employer FICA, FUTA, SUTA per state, WC estimate — **P0** (Beta)
- Employer cost shall be presented per employee and as a run total — **P0** (Beta)

#### Payroll History & Archive (GA)

- The system shall retain all payroll run data for a minimum of 7 years — **P0** (GA)
- The system shall allow admin and CPA to access any historical payroll run, filter by date range, and export — **P0** (GA)

#### Change Audit Trail (GA)

- The system shall log all changes to payroll-sensitive data with: field changed, old value, new value, user who made the change, timestamp, and reason if provided — **P0** (GA)
- Auditable data types include: pay rates, withholding elections, deductions, employee classification, payment method — **P0** (GA)
- Admin and CPA shall be able to search and export the audit trail — **P1** (GA)

#### CPA Access (Beta)

- The system shall provide a CPA role with read-only access to all payroll reports, payroll registers, and tax summaries without requiring admin delegation per request — **P0** (Beta)

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Retention** | 7-year minimum retention for all payroll run data and audit trail |
| **Performance** | Payroll register for 100 employees loads in <5 seconds — *Inferred* |
| **Security** | Pay rate and withholding data accessible to Admin and CPA roles only; employee view limited to own data |
| **Export** | CSV and PDF exports available for all primary reports |
| **Audit** | Change audit trail is append-only; no deletion or modification after creation |
| **Accessibility** | Reports meet WCAG 2.1 AA standards — *Inferred* |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| PayrollRegister | run_id, employee_id, earnings_lines, deduction_lines, tax_lines, net_pay | Assembled from E4/E5 outputs |
| LaborCostByJob | run_id, job_id, cost_code, trade_type, gross_wages, burden_total | From E9 labor burden allocation |
| TaxLiabilitySummary | run_id, quarter, jurisdiction, tax_type, withheld_amount, employer_amount | From E5 outputs |
| AuditTrailEntry | record_type, record_id, field_name, old_value, new_value, changed_by, timestamp, reason | Append-only |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Earnings Engine (E4) | Source of earnings lines for payroll register | Post-run | Internal |
| Tax Withholding Engine (E5) | Source of tax and deduction lines | Post-run | Internal |
| Prism Accounting Integration (E9) | Source of labor cost by job data | Post-run | Internal |
| Document/Export Service | PDF and CSV generation | On admin/CPA export request | Internal |

#### Platform / Infrastructure Constraints

- 7-year retention requires archive storage that remains queryable (not just cold archive)
- Audit trail records must be immutable at the storage level; no application-level deletion

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E10-1: Payroll Register** | Earnings-line detail per employee per run; summary + drill-down; CSV/PDF export | G1 | UC-1, UC-2 |
| **E10-2: Labor Cost & Job Costing Reports** | Fully burdened labor by job/cost code/trade; budget vs. actuals | G2 | UC-3, UC-4, UC-5 |
| **E10-3: Tax Liability Reports** | Tax withheld and owed by jurisdiction per run and quarter; 941 prep summary | G5 | UC-6 |
| **E10-4: Employer Cost Summary** | Employer FICA, FUTA/SUTA, WC per employee and run total | G1, G5 | UC-7 |
| **E10-5: Payroll History & Archive** | 7-year run history; filterable and exportable | G3 | UC-8 |
| **E10-6: Change Audit Trail** | Immutable log of all payroll-sensitive data changes | G4 | UC-9 |

### 3e. High-Level Acceptance Criteria

- Admin can open the payroll register for any completed run and see each employee's earnings broken down by rate, hours, trade type, job, and pay type — not a single "Regular Pay" total
- CPA can access all payroll registers and tax summaries directly without admin manually exporting and forwarding
- The labor cost by job report shows fully burdened cost (gross + all employer obligations) for each job, available within 15 minutes of payroll finalization
- All payroll data for runs from the past 7 years is accessible and exportable
- Every change to a pay rate, withholding election, or deduction generates an audit trail entry with the old value, new value, and the identity of the user who made the change
- The payroll register exports to CSV and PDF without loss of data or formatting

### 3f. Links to Prototypes

- Payroll Register — [TBD]
- Labor Cost by Job Report — [TBD]
- Change Audit Trail — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- Basic mock run output display (gross pay totals only)

**Beta (Trimble Dimensions)**
- Full payroll register: earnings-line detail per employee
- Employer cost summary per run
- CSV and PDF export
- CPA read-only access

**GA (Generally Available)**
- Labor cost by job and cost code (fully burdened)
- Budget vs. actuals labor (if Prism Accounting budget data available)
- Tax liability reports and 941 prep summary
- 7-year payroll history access
- Change audit trail for all payroll-sensitive data
- New hire / termination activity report

---

# 5. Supporting Information

### 5a. Assumptions

- Labor cost data is sourced from E9 Prism Accounting Integration labor burden calculation — not independently calculated in this module
- CPA role has read-only access to all reports configured at company setup; admin does not need to grant per-report access each time
- Budget data for budget vs. actuals comparison comes from Prism Accounting; if not available, the actuals-only view is shown

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| E4 earnings line detail (multiple lines per employee per entry) | E4 team | **High** — register quality depends on E4 granularity |
| E9 labor burden by job/cost code | E9 team | **High** — job costing report depends on E9 |
| 7-year archive storage infrastructure | Engineering / Platform | **Medium** |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Report performance slow for large historical datasets | Medium | Medium | Pagination, date-range pre-filtering, async export for large reports | No |
| Budget vs. actuals unavailable if Prism Accounting doesn't expose budget data | Medium | Low | Actuals-only view available; flag as future enhancement | Yes — platform API |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Report access frequency by type | `report_viewed` (report_type, user_role) | Product |
| Export volume | `report_exported` (format, report_type) | Operations |
| Audit trail query frequency | `audit_trail_accessed` | Compliance |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Does Prism Accounting expose budget data per job via API for budget vs. actuals comparison? | Platform team | Sprint 1 |
| OQ-2 | What is the archive storage strategy for 7-year payroll history retention? (Hot vs. warm vs. cold) | Engineering | Sprint 1 |
| OQ-3 | Is a change audit trail required at Beta (for compliance testing), or is GA sufficient? | Legal / Compliance | Sprint 1 |
