# Prism Construction Payroll — Reporting & Audit
## Feature Set for Epic 681945 (E10)

> **Source:** Reporting & Audit PRD — provides the payroll administrator, business owner, and external CPA with complete visibility into every payroll run, every tax obligation, and every dollar of labor cost — both in real time and historically. Includes the payroll register, labor cost and job costing reports, tax liability summaries, employer cost summary, 7-year payroll history archive, and the immutable change/activity audit trail.

---

## Feature Set Overview

| # | Feature Title | One-Line Summary |
|---|--------------|-----------------|
| E10-1 | Payroll Register | Earnings-line detail per employee per run with summary view, drill-down, and CSV/PDF export |
| E10-2 | Labor Cost & Job Costing Reports | Fully burdened labor cost by job, cost code, and trade type — with budget vs. actuals comparison |
| E10-3 | Tax Liability Reports | Tax withheld and owed by jurisdiction per run and per quarter, including 941 prep summary |
| E10-4 | Employer Cost Summary | Employer FICA, FUTA/SUTA, and WC cost per employee and as a run total |
| E10-5 | Payroll History & Archive | 7-year accessible archive of all payroll runs — filterable and exportable |
| E10-6 | Change Audit Trail | Immutable log of all payroll-sensitive data changes with who, what, when, and from/to values |

---

## E10-1 — Payroll Register

### Goal / Outcome
For every completed payroll run, the admin and CPA can open a payroll register that shows both a summary view (total employees, gross pay, taxes, net pay, employer cost) and a per-employee earnings-line detail view — broken down by rate, hours, trade type, job, and pay type. This eliminates the "single Regular Pay total" problem: every earnings line is visible, including WAOT breakdowns and per-job labor allocation required for audit defense. The register is exportable in CSV and PDF on demand, and the CPA can access it directly without the admin exporting and forwarding.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs complete register access for every run to answer employee questions, provide CPA with data, and support payroll audits
- **External CPA / Bookkeeper** — needs earnings-line detail, deduction itemization, and tax withholding breakdown to reconcile and prepare returns; currently waiting on manual admin exports

### Business & PRD Drivers
- G1 — Admin and CPA have complete payroll register access for every run, earnings-line level
- UC-1 — View payroll register (summary + earnings-line detail) per run (P0 — Beta)
- UC-2 — Export payroll register (CSV, PDF) (P0 — Beta)
- UC-10 — CPA read-only access to all payroll reports (P0 — Beta)
- PRD §3a — Payroll Register requirements

### Problem / Rationale
Generic payroll registers show gross and net pay but don't show which rate was applied per entry, WAOT breakdowns, or per-job labor allocation — all required for audit defense. When a CPA needs the register for a client review or IRS audit, the admin manually exports a partial summary and reformats it in a spreadsheet. There is no direct CPA access path; every data request requires admin involvement. The result is an unreliable, delayed, and incomplete audit record.

### In Scope
- Payroll register generated automatically for every completed payroll run — no admin trigger
- Summary view: total employees, total gross pay, total taxes withheld, total net pay, total employer cost
- Per-employee detail view: all earnings lines (rate, hours, trade type, job, pay type, amount); all deductions (pre-tax and post-tax, itemized); all tax withholding (by jurisdiction); net pay
- Export in CSV and PDF formats
- Filtering by pay period, employee, department, and pay type (P1)
- CPA role with read-only access to all registers — no admin delegation per request required

### Out of Scope (for this feature)
- Labor cost by job and cost code — E10-2
- Tax liability summary — E10-3
- Employer cost summary — E10-4
- Historical run access — E10-5
- Change audit trail — E10-6

### Example Super Stories
- As a PR Admin, I want to open the payroll register for any completed run and see each employee's earnings broken down by rate, hours, trade type, job, and pay type — not a single "Regular Pay" total — so that I can answer employee questions and support audits without manual spreadsheet work.
- As an External CPA, I want to access all payroll registers and tax summaries directly — without asking the admin to export and email me files — so that I can reconcile payroll to the GL and prepare returns on my own schedule.
- As a PR Admin, I want to export the payroll register in CSV and PDF formats so that I can share it with our CPA or retain a hard-copy record.

### Acceptance Criteria Themes
- Admin can open the payroll register for any completed run and see each employee's earnings broken down by rate, hours, trade type, job, and pay type — not a single "Regular Pay" total
- CPA can access all payroll registers and tax summaries directly without admin manually exporting and forwarding
- Register summary shows: total employees, total gross pay, total taxes withheld, total net pay, total employer cost
- Register detail per employee shows: all earnings lines, all deductions (pre-tax and post-tax, itemized), all tax withholding by jurisdiction, net pay
- The payroll register exports to CSV and PDF without loss of data or formatting
- Register is available immediately after payroll finalization — no delay or admin action required

### Dependencies & Risks
- **Upstream:** E4 (Earnings Engine) — register quality depends on E4 delivering earnings at the time-entry / job / trade level, not just employee totals; data contract must specify job-level earnings breakdown (High — PRD §5b)
- **Upstream:** E5 (Tax Withholding Engine) — tax and deduction lines sourced from E5 output post-run
- **Downstream:** E10-5 (Payroll History & Archive) — register records must be retained for 7-year archive access
- **Risk:** If E4 delivers gross pay only at the employee level (not at the time entry / job level), earnings-line detail cannot be shown — data contract between E4 and E10-1 must be confirmed before Beta (PRD §5b — High risk)

### Success Metrics / KPIs
- Payroll runs with complete register available (earnings-line detail): 100%
- CPA data requests fulfilled without admin manual export: >90%
- Admin-reported register accuracy issues: 0 critical

### Assumptions
- E4 delivers earnings at the time-entry / trade / job level — not aggregated at the employee level
- CPA role has read-only register access configured at company setup; no per-request admin delegation required
- Export service (PDF/CSV generation) is available as a shared platform service

---

## E10-2 — Labor Cost & Job Costing Reports

### Goal / Outcome
Immediately after each payroll run is finalized, the owner and CPA can open a labor cost by job report showing the fully burdened cost — gross wages, employer FICA, FUTA/SUTA, and WC — for each job and cost code worked in that run. Where Prism Accounting has budget data configured, the report shows budget vs. actuals variance per job. This is the single most requested report from construction contractors and the primary reporting gap relative to competitors: a payroll-originating report that shows what labor actually costs on each job — not just what employees were paid.

### Primary Personas
- **Owner / Exec** — needs to know total fully burdened labor cost per job to monitor profitability; currently has no reliable way to get this from payroll data
- **PR Admin ("Overwhelmed Operator")** — provides labor cost data to PMs and CPAs; currently requires manual Excel reconciliation
- **External CPA / Bookkeeper** — needs fully burdened labor cost per job to reconcile GL and prepare corporate returns; currently waiting on manual exports that don't tie to the GL

### Business & PRD Drivers
- G2 — Labor cost by job and cost code accessible immediately after each payroll run
- UC-3 — View labor cost by job, cost code, and trade type (P0 — GA)
- UC-4 — View fully burdened labor cost (gross + employer taxes + WC) by job (P0 — GA)
- UC-5 — View budget vs. actuals labor report per job (P1 — GA)
- PRD §3a — Labor Cost & Job Costing Reports requirements

### Problem / Rationale
There is no payroll-originating report showing labor cost (fully burdened) by job and cost code. Connecting payroll data to job costs requires a manual export to Excel. The CPA asks for a labor report by job and gets a spreadsheet that doesn't tie to the GL. When a project manager sees $10,000 in gross labor on a job, they're missing $1,500–$3,500 in true employer cost (FICA, FUTA/SUTA, WC) — making every job look more profitable than it is.

### In Scope
- Labor cost by job and cost code report, sourced from E9 Prism Accounting Integration labor burden data
- Per job: gross wages, employer FICA, FUTA/SUTA, WC cost, and total fully burdened labor cost
- Breakdown by cost code and trade type within each job
- Date range selection across multiple payroll runs
- Budget vs. actuals variance where budget data is available from Prism Accounting (P1)
- Export in CSV and PDF
- Report available within 15 minutes of payroll finalization

### Out of Scope (for this feature)
- Labor burden calculation — E9-3 (data is consumed here, not calculated)
- Non-labor job costs (materials, equipment, subcontractors) — Prism Accounting
- Job budget setup and management — Prism Accounting
- BI/analytics platform views — out of scope entirely

### Example Super Stories
- As an Owner, I want to open a "Labor Cost by Job" report after payroll finalizes and see the total fully burdened cost for each active job — including employer taxes and WC — so that I know what labor actually costs on each project.
- As an External CPA, I want to download a labor cost by job report in CSV format covering the full quarter so that I can reconcile payroll to the GL and prepare corporate returns without manual data collection.
- As an Owner, I want to see budget vs. actuals labor variance for each job — where budgets are configured in Prism Accounting — so that I can catch job overruns before they compound.

### Acceptance Criteria Themes
- The labor cost by job report shows fully burdened cost (gross + all employer obligations) for each job, available within 15 minutes of payroll finalization
- Per-job breakdown includes: gross wages, employer FICA, employer FUTA/SUTA, WC cost, and total fully burdened cost — each component separately enumerated
- Report supports date range selection spanning multiple payroll runs
- Budget vs. actuals column shown where Prism Accounting budget data is available; actuals-only view shown when no budget is configured
- Report is exportable in CSV and PDF without data loss
- Labor cost data traces to E9-3 labor burden calculation — no independent recalculation in this feature

### Dependencies & Risks
- **Critical dependency:** E9 (Prism Accounting Integration) — labor burden by job/cost code data sourced from E9-3; this report cannot function without E9's labor burden output (High — PRD §5b)
- **Upstream:** E4 (Earnings Engine) — job-level gross pay breakdown must flow through E9-3 to this report
- **Budget dependency:** Budget vs. actuals comparison requires Prism Accounting to expose budget data per job via API — confirmed as open question (OQ-1); actuals-only view is the GA fallback (PRD §5c)
- **Risk:** If Prism Accounting doesn't expose budget data at GA, budget vs. actuals view is deferred — actuals-only report is shipped and the feature is flagged for future enhancement (PRD OQ-1)

### Success Metrics / KPIs
- Labor cost by job available within 15 minutes of payroll finalization: 100% of runs at GA
- Admin-reported job cost reporting errors: 0 critical at GA
- CPA data requests fulfilled without manual export: >90%

### Assumptions
- Labor cost data is sourced from E9 Prism Accounting Integration labor burden calculation — not independently calculated in E10
- Budget data for budget vs. actuals comparison comes from Prism Accounting; if not available, the actuals-only view is shown without error
- Report covers all jobs worked in the selected date range across all payroll runs in that range

---

## E10-3 — Tax Liability Reports

### Goal / Outcome
After every payroll run and at the close of each quarter, the CPA can access a complete tax liability summary — FIT withheld, SS/Medicare withheld (employee and employer), state income tax per state, SUTA per state, and local tax per locality — without waiting on admin exports. A 941 pre-population summary is generated per quarter for CPA review, downloadable as a PDF. This allows the CPA to reconcile payroll to tax obligations and prepare corporate returns using Prism data directly, without manual data assembly.

### Primary Personas
- **External CPA / Bookkeeper** — primary consumer; needs complete tax liability data by jurisdiction to prepare returns and verify deposits; currently waits on manual admin exports that may be incomplete
- **PR Admin ("Overwhelmed Operator")** — uses tax liability summary to verify tax deposits are correct and to respond to IRS/state agency inquiries

### Business & PRD Drivers
- G5 — Tax liability reports enable CPA to reconcile and prepare corporate returns without data gaps
- UC-6 — View tax liability summary per run and per quarter (P0 — GA)
- PRD §3a — Tax Liability Reports requirements

### Problem / Rationale
Without a structured tax liability report, CPAs must manually aggregate withholding data from payroll exports across multiple runs to prepare quarterly returns. Generic payroll summaries show total taxes withheld but not the jurisdiction-level breakdown required for Form 941 or state return preparation. The result: CPAs spend hours at quarter-end assembling data that the system already has, and the data they assemble is often an approximation — not an exact reconciliation.

### In Scope
- Tax liability summary per run: FIT withheld, SS withheld (employee + employer), Medicare withheld (employee + employer), state income tax per state, SUTA per state, local tax per locality
- Tax liability summary per quarter — aggregated across all runs in the quarter
- 941 pre-population summary per quarter for CPA review
- CPA and admin can download the quarterly tax summary in PDF
- CPA read-only access to all tax liability reports — no admin delegation per request

### Out of Scope (for this feature)
- Tax remittance / payment filing — separate module (Tax Remittance)
- Tax filing (941, W-2, 1099) — separate module (Tax Filing)
- Tax withholding calculations — E5 (Tax Withholding & Deductions)
- AI-generated narrative summaries — E11

### Example Super Stories
- As an External CPA, I want to open a quarterly tax liability summary for my client and see every tax withheld and owed by jurisdiction — FIT, SS/Medicare, state income tax per state, SUTA per state — so that I can reconcile the payroll data to the GL and prepare quarterly returns without manual data collection.
- As an External CPA, I want to download a 941 pre-population summary for the quarter so that I have a structured starting point for preparing the federal quarterly tax return.
- As a PR Admin, I want to view the tax liability summary for each payroll run so that I can verify that the correct amounts were withheld and confirm our deposit obligations.

### Acceptance Criteria Themes
- Tax liability summary is available per run and per quarter: FIT withheld, SS withheld (employee + employer), Medicare withheld (employee + employer), state income tax per state, SUTA per state, local tax per locality
- 941 pre-population summary is generated per quarter and downloadable as PDF
- CPA can access tax liability reports directly — no admin export or delegation required
- Quarterly tax summary data matches run-level totals: sum of per-run amounts equals the quarterly total for every category and jurisdiction
- PDF export is available for the quarterly tax summary without data loss

### Dependencies & Risks
- **Upstream:** E5 (Tax Withholding & Deductions) — all tax liability amounts sourced from E5 output per run; jurisdiction-level breakdown must be available from E5
- **Upstream:** E10-1 (Payroll Register) — tax withholding data is part of the payroll register; tax liability report aggregates across runs
- **Risk:** If E5 doesn't deliver jurisdiction-level tax withholding (per state, per locality), the tax liability report cannot provide the required granularity — data contract with E5 must specify jurisdiction-level output

### Success Metrics / KPIs
- CPA data requests for tax liability fulfilled without admin manual export: >90% at GA
- Tax liability report accuracy vs. E5 output: 100% — zero discrepancy
- 941 pre-population summary generated: 100% of quarters with payroll activity

### Assumptions
- Tax withholding data at the jurisdiction level is available from E5's output per payroll run
- CPA role has read-only access to all tax liability reports configured at company setup
- 941 pre-population summary is a data summary (not a filed form) — the CPA uses it as input to their own tax preparation workflow

---

## E10-4 — Employer Cost Summary

### Goal / Outcome
After every payroll run, the admin sees a clear breakdown of total employer cost for that run — employer FICA, FUTA, SUTA per state, and WC estimate — per employee and as a run total. This gives the admin immediate visibility into total payroll cost (not just gross wages), allows for payroll-to-budget comparison, and surfaces the employer tax obligations that will drive cash reserve decisions. Available at Beta as a companion to the payroll register.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs total employer cost per run to reconcile against payroll budget and plan cash for tax deposits
- **Owner / Exec** — needs to see total payroll cost (including employer taxes) to compare against job budgets and overall labor cost targets

### Business & PRD Drivers
- G1 — Admin and CPA have complete payroll register access including employer cost
- UC-7 — View employer cost summary (FICA, FUTA/SUTA, WC) per run (P0 — Beta)
- PRD §3a — Employer Cost Summary requirements

### Problem / Rationale
Generic payroll systems show gross wages and net pay but don't surface employer tax obligations as a consolidated cost view per run. The admin knows what employees were paid but has no immediate view of what the company owes in employer taxes — FICA match, FUTA, SUTA per state, and WC. This information is needed to plan cash for tax deposits, verify the run total against payroll budget, and identify anomalies (e.g., unexpectedly high SUTA cost indicating a termination or wage base issue).

### In Scope
- Total employer cost per run: employer FICA (SS + Medicare match), FUTA, SUTA per state, and WC estimate (by WC classification code)
- Employer cost shown per employee and as a run total
- Available immediately after payroll finalization
- Displayed as part of the payroll register summary view (employer cost section)

### Out of Scope (for this feature)
- Employer cost allocation to jobs by cost code — E10-2 and E9-3
- Historical employer cost trend analysis — E10-5
- Employer tax remittance / payment — Tax Remittance module

### Example Super Stories
- As a PR Admin, I want to see the total employer cost for each payroll run — FICA match, FUTA, SUTA, and WC — broken down per employee and as a run total so that I can plan our tax deposit cash requirements immediately after running payroll.
- As an Owner, I want to see the full employer cost per run in addition to gross wages so that I understand the true total cost of payroll — not just what we paid employees.

### Acceptance Criteria Themes
- Employer cost summary displays per run: employer FICA (SS and Medicare match separately), FUTA, SUTA per state, WC estimate — per employee and as run total
- Employer cost summary is available immediately after payroll finalization — no delay or admin action required
- SUTA cost is broken down per state for companies with employees in multiple states
- WC estimate is broken down by WC classification code for companies with employees in multiple trades
- Run total employer cost reconciles to the sum of per-employee employer cost lines — zero variance

### Dependencies & Risks
- **Upstream:** E5-3 (FICA, FUTA, SUTA) — employer tax amounts sourced from E5 output per employee per run
- **Upstream:** E5-6 (Workers' Comp Estimation) — WC cost by trade/classification sourced from E5-6 output
- **Risk:** WC estimate accuracy depends on WC classification rates being correctly configured in company setup; misconfigured rates produce incorrect employer cost totals

### Success Metrics / KPIs
- Employer cost summary available for 100% of payroll runs at Beta
- Admin-reported employer cost accuracy issues: 0 critical
- Employer cost run total reconciles to per-employee sum: 100% of runs

### Assumptions
- Employer tax amounts (FICA, FUTA, SUTA) are calculated by E5 and consumed here — not independently calculated
- WC classification rates are configured by the admin in company setup based on the company's WC policy
- Employer cost summary is part of the payroll register summary view — not a separate standalone report at Beta

---

## E10-5 — Payroll History & Archive

### Goal / Outcome
Every payroll run record — register, employer cost, tax withholding, earnings lines, and deduction lines — is retained and remains accessible and exportable for a minimum of 7 years. Admin and CPA can access any historical payroll run, filter by date range, and export records on demand. No payroll record is ever unavailable due to archiving. This satisfies FLSA (2-year wage records, 3-year payroll records) and IRS requirements, and eliminates the risk of SMB owners being unable to produce records in an audit.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs to retrieve historical payroll run records for employee disputes, IRS inquiries, and workers' compensation audits
- **External CPA / Bookkeeper** — needs access to multi-year payroll history for corporate return preparation, amended returns, and audit defense

### Business & PRD Drivers
- G3 — All payroll data retained and accessible for minimum 7 years
- UC-8 — Access 7-year payroll history (all runs, all employees) (P0 — GA)
- PRD §3a — Payroll History & Archive requirements
- PRD §3b — Retention: 7-year minimum for all payroll run data and audit trail

### Problem / Rationale
SMB owners using generic payroll tools rarely know about FLSA record-keeping requirements (2-year wage records, 3-year payroll records) and have no enforced retention mechanism. Data often lives in exported spreadsheets or is lost when an account lapses. When an IRS or state agency inquiry arrives, the owner may not be able to produce records for prior periods — creating serious compliance exposure. An enforced, queryable 7-year archive closes this gap entirely.

### In Scope
- All payroll run data retained for minimum 7 years: register, earnings lines, deduction lines, tax withholding, employer cost, finalization metadata
- Admin and CPA can access any historical payroll run by date or date range
- Filter historical runs by: pay period, employee, department
- Export of any historical run in CSV and PDF
- Archive remains queryable (not cold/unindexed storage) — historical runs must be accessible in <5 seconds for a 100-employee dataset

### Out of Scope (for this feature)
- Change audit trail — E10-6 (separate feature, though also retained for 7 years)
- Business intelligence / analytics on historical data — not a BI tool
- Cross-period aggregated reporting — future

### Example Super Stories
- As a PR Admin, I want to access any payroll run from the past 7 years and export it in CSV or PDF so that I can respond to IRS inquiries and workers' compensation audits without scrambling to find old records.
- As an External CPA, I want to filter payroll history by date range and employee to pull the data I need for an amended return — without needing to request anything from the admin.
- As a PR Admin, I want all payroll run data to be automatically retained for 7 years — without me having to export or back up anything — so that I know we're compliant with FLSA and IRS record-keeping requirements.

### Acceptance Criteria Themes
- All payroll data for runs from the past 7 years is accessible and exportable
- Admin and CPA can access any historical payroll run, filter by date range, and export in CSV or PDF — no admin action required beyond the initial access
- Historical payroll register for 100 employees loads in <5 seconds
- Archive is queryable — not cold or write-only storage; historical records are indexed and searchable
- 7-year retention is enforced by the system — data is not eligible for deletion before 7 years have elapsed

### Dependencies & Risks
- **Infrastructure dependency:** 7-year retention requires archive storage that remains queryable — not just cold archive; archive storage strategy must be confirmed (PRD OQ-2 — Engineering / Platform, Sprint 1; Medium risk)
- **Upstream:** E10-1 (Payroll Register) — register records are the primary content retained in archive; archive completeness depends on register generation for every run
- **Risk:** Archive storage strategy (hot vs. warm vs. cold) affects query performance for historical runs — mitigation: define retention tiers with query SLA; ensure <5 second load for recent history (PRD §5c)

### Success Metrics / KPIs
- Data retention coverage (7-year accessible archive): 100%
- Historical payroll register load time (100 employees): <5 seconds — 100% of queries
- CPA access to historical data without admin involvement: >90%

### Assumptions
- Archive storage infrastructure can maintain queryable access for up to 7 years — not just write-once cold storage
- No payroll record is eligible for deletion or modification after finalization; retention is system-enforced
- CPA role has full read access to all historical runs as part of the standard CPA role configuration at company setup

---

## E10-6 — Change Audit Trail

### Goal / Outcome
Every change to payroll-sensitive data — pay rates, withholding elections, deductions, employee classification, payment method — is logged with: field changed, old value, new value, user who made the change, timestamp, and reason (if provided). The audit trail is append-only and immutable at the storage level; no application-level deletion is possible. Admin and CPA can search the audit trail and export it for compliance reviews, IRS audits, and internal investigations. This eliminates the "no log of who changed what" failure mode that creates serious audit exposure for SMB contractors.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs to answer "who changed this employee's pay rate?" or "when did this withholding election change?" without manually reviewing system logs
- **External CPA / Bookkeeper** — needs to verify that payroll changes were authorized and documented for compliance reviews and audits
- **Owner / Exec** — needs assurance that unauthorized pay rate or deduction changes are logged and traceable

### Business & PRD Drivers
- G4 — Complete change audit trail for all payroll-sensitive data changes (rates, elections, deductions)
- UC-9 — View change audit trail (who changed what, when, from/to) (P0 — GA)
- PRD §3a — Change Audit Trail requirements
- PRD §3b — Audit: change audit trail is append-only; no deletion or modification after creation

### Problem / Rationale
When a pay rate or withholding election changes, there is currently no log of who made the change, when it was made, or what it changed from. This creates two exposure points: (1) unauthorized changes go undetected until the next payroll run (or longer), and (2) when an IRS or state agency auditor asks "why did this employee's withholding change in Q3?", there is no answer. FLSA and IRS audit defense requires a demonstrable change history for wage rates and deductions — a gap that generic payroll tools consistently fail to close.

### In Scope
- Log all changes to payroll-sensitive data: pay rates, withholding elections (federal and state), deductions (pre-tax and post-tax), employee classification, payment method
- Each audit log entry includes: record type, record ID, field changed, old value, new value, user who made the change, timestamp, and reason (if provided by the user)
- Audit trail is append-only and immutable: no application-level deletion or modification after creation
- Audit trail records are retained for a minimum of 7 years (consistent with E10-5 payroll run retention)
- Admin and CPA can search the audit trail by: employee, field type, date range, user who made the change
- Admin and CPA can export the audit trail in CSV and PDF (P1)

### Out of Scope (for this feature)
- System event logging (login, access, security events) — Security & RBAC module
- Change audit trail for non-payroll data (job setup, chart of accounts) — Prism Accounting
- Automated alerts on sensitive field changes — future (notification system)
- Audit trail for E9 GL account mapping changes — may be in scope for E9 or this feature; to be confirmed

### Example Super Stories
- As a PR Admin, I want to search the audit trail for any changes to an employee's pay rate — seeing who made the change, when, what it changed from, and what it changed to — so that I can answer employee disputes or IRS questions without hunting through system logs.
- As an External CPA, I want to export the full change audit trail for the past 12 months so that I can include it in our payroll compliance documentation and verify that all changes were authorized.
- As an Owner, I want every change to a pay rate, withholding election, or deduction to generate an audit trail entry — even for changes I make myself — so that there is always a complete, immutable record of what changed and when.

### Acceptance Criteria Themes
- Every change to a pay rate, withholding election, or deduction generates an audit trail entry with the old value, new value, and the identity of the user who made the change
- Audit trail entries include: record type, record ID, field changed, old value, new value, changed_by (user identity), timestamp, reason (if provided)
- Audit trail is append-only and immutable: no deletion or modification is possible at the application level after creation
- Admin and CPA can search the audit trail by employee, field type, date range, and user who made the change
- Audit trail records are retained for a minimum of 7 years
- Export to CSV and/or PDF is available for audit trail results (P1)

### Dependencies & Risks
- **Infrastructure dependency:** Immutable audit trail requires append-only storage at the infrastructure level — no application-level deletion capability; storage architecture must be confirmed before GA (Engineering, Sprint 1; Medium risk)
- **Upstream:** All payroll-sensitive data fields (pay rates, withholding elections, deductions, classification, payment method) must emit change events that are captured by the audit trail — requires instrumentation across E1 (Company Setup), E2 (Employee Management), E4 (Earnings), and E5 (Tax Withholding)
- **Open Question:** Is a change audit trail required at Beta (for compliance testing), or is GA sufficient? (Legal / Compliance — PRD OQ-3, Sprint 1)
- **Risk:** If payroll-sensitive field changes don't emit events consistently, audit trail will have gaps — mitigation: audit trail completeness is a GA acceptance criterion; testing must verify coverage across all auditable field types

### Success Metrics / KPIs
- Change audit events captured (rate, election, deduction changes): 100%
- Audit trail completeness: zero payroll-sensitive changes in production that do not generate an audit entry
- Admin-reported audit trail search accuracy issues: 0 critical

### Assumptions
- All payroll-sensitive field changes are instrumented to emit audit events — this requires coordination with E1, E2, E4, and E5 feature teams
- Audit trail immutability is enforced at the storage level, not just the application level — the application cannot delete or modify audit records even with admin-level access
- Reason field is optional — users may leave it blank; the audit entry is generated regardless

---

## Traceability Table

| Requirement / PRD Reference | Description | Feature(s) |
|---|---|---|
| G1 — Complete register access, earnings-line level | Admin and CPA see every earnings line per run | E10-1 |
| G2 — Labor cost by job immediately post-run | Fully burdened labor by job/cost code | E10-2 |
| G3 — 7-year data retention | All payroll data accessible and exportable | E10-5 |
| G4 — Change audit trail | Who changed what, when, from/to | E10-6 |
| G5 — Tax liability for CPA reconciliation | Tax withheld and owed by jurisdiction | E10-3 |
| UC-1 — Payroll register summary + detail | P0 Beta | E10-1 |
| UC-2 — Register export (CSV, PDF) | P0 Beta | E10-1 |
| UC-3 — Labor cost by job/cost code/trade | P0 GA | E10-2 |
| UC-4 — Fully burdened labor cost by job | P0 GA | E10-2 |
| UC-5 — Budget vs. actuals per job | P1 GA | E10-2 |
| UC-6 — Tax liability per run and quarter | P0 GA | E10-3 |
| UC-7 — Employer cost summary per run | P0 Beta | E10-4 |
| UC-8 — 7-year payroll history access | P0 GA | E10-5 |
| UC-9 — Change audit trail | P0 GA | E10-6 |
| UC-10 — CPA read-only access | P0 Beta | E10-1, E10-3 |
| UC-11 — New hire / termination activity report | P1 GA | Future / E10 scope TBD |
| PRD §3a — Register: earnings-line detail per employee | All earnings lines visible per run | E10-1 |
| PRD §3a — Register: CSV and PDF export | All formats available | E10-1 |
| PRD §3a — Labor cost: fully burdened per job/cost code | Gross + FICA + FUTA/SUTA + WC | E10-2 |
| PRD §3a — Labor cost: budget vs. actuals | Where Prism Accounting budget available (P1) | E10-2 |
| PRD §3a — Tax liability: per run and quarter | Jurisdiction-level detail | E10-3 |
| PRD §3a — Tax liability: 941 pre-pop summary | Quarterly, CPA downloadable PDF | E10-3 |
| PRD §3a — Employer cost: per employee and run total | FICA, FUTA, SUTA, WC | E10-4 |
| PRD §3a — Payroll history: 7-year retention | All runs accessible and exportable | E10-5 |
| PRD §3a — Change audit trail: append-only, immutable | All payroll-sensitive fields | E10-6 |
| PRD §3b — Performance: register loads in <5 seconds | NFR — 100 employees | E10-1, E10-5 |
| PRD §3b — Retention: 7-year minimum | NFR | E10-5, E10-6 |
| PRD §3b — Security: pay/withholding data admin + CPA only | NFR | E10-1, E10-2, E10-3 |
| PRD §3b — Export: CSV and PDF for all primary reports | NFR | E10-1, E10-2, E10-3 |
| PRD §3b — Audit: change trail is append-only | NFR | E10-6 |
| PRD OQ-2 — Archive storage strategy (hot vs. warm) | Engineering, Sprint 1 | E10-5 |
| PRD OQ-3 — Change audit trail required at Beta or GA? | Legal / Compliance, Sprint 1 | E10-6 |
