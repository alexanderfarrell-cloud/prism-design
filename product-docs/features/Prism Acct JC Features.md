# Prism Construction Payroll — Prism Accounting Integration & Job Costing
## Feature Set for Epic 681943 (E9)

> **Source:** Prism Accounting Integration & Job Costing PRD — the bi-directional integration layer that syncs jobs and cost codes from Prism Accounting into Prism Payroll, and posts fully burdened labor cost allocations and GL journal entries back to Prism Accounting after each payroll run.

---

## Feature Set Overview

| # | Feature Title | One-Line Summary |
|---|--------------|-----------------|
| E9-1 | Job & Cost Code Sync | Receive and maintain a live, current list of jobs and cost codes from Prism Accounting in Prism Payroll — no manual re-entry |
| E9-2 | GL Account Mapping | Admin maps payroll expense and liability categories to Prism Accounting chart of accounts during company setup |
| E9-3 | Labor Burden Calculation | Calculate fully burdened labor cost per job/cost code/trade after each payroll run: gross wages + employer FICA + FUTA/SUTA + WC |
| E9-4 | GL Journal Entry Generation | Auto-generate balanced debit/credit GL journal entries on payroll finalization — zero manual journal entries |
| E9-5 | Prism Accounting Posting | Post GL journal entries and job cost allocations to Prism Accounting automatically upon payroll finalization |
| E9-6 | Reconciliation Support | Payroll register vs. GL journal entry reconciliation report — zero variance confirmed after every clean run |

---

## E9-1 — Job & Cost Code Sync

### Goal / Outcome
Prism Payroll maintains a live, accurate list of jobs and cost codes sourced from Prism Accounting — updated without manual re-entry or spreadsheet workarounds. When a new job is created or a cost code is modified in Prism Accounting, that change is reflected in Prism Payroll within the configured sync window, making it immediately available for time entry coding. Inactive jobs are flagged and suppressed from time entry selection. Admins and field supervisors never have to maintain a separate list of jobs in Prism Payroll.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs the job list in Prism Payroll to always match what's in Prism Accounting without any manual sync or copy-paste
- **Field Supervisor / Project Manager** — codes time entries by job; needs the current, active job list available without a lag

### Business & PRD Drivers
- G5 — Jobs and cost codes flow from Prism Accounting into Prism Payroll without manual re-entry
- UC-1 — Sync jobs and cost codes from Prism Accounting to Prism Payroll (P0 — Beta stub)
- PRD §3a — Inbound Sync requirements
- PRD §1a — Strategic differentiator: full bi-directional data flow between Prism Payroll and Prism Accounting

### Problem / Rationale
Without an automated sync, job and cost code lists are maintained separately in Prism Payroll and Prism Accounting — and diverge over time. Admins manually copy job numbers from Prism Accounting into Prism Payroll configuration; cost codes are re-entered manually. When a new job is created in Prism Accounting mid-pay-period, time entries cannot be coded to it until someone remembers to add it in Prism Payroll — causing last-minute corrections, miscoded time, and job cost reporting gaps.

### In Scope
- Receive and maintain a current list of active jobs from Prism Accounting: job number, job name, active/inactive status
- Receive and maintain cost codes per job from Prism Accounting: cost code, description, job association, active/inactive status
- Job and cost code data synced within a defined window after changes in Prism Accounting (real-time via webhook or near-real-time via polling — per OQ-2)
- Inactive jobs flagged in Prism Payroll and excluded from time entry selection
- Inactive cost codes suppressed from time entry coding at the job level
- Sync status visible to admin (last synced timestamp, any sync errors)

### Out of Scope (for this feature)
- Job setup, configuration, and management UI — Prism Accounting module
- Cost code configuration and management — Prism Accounting module
- Time entry coding UI — Time Collection (E3)
- Union fringe benefit job cost allocation (Tier 2+)
- Prevailing wage job cost coding (Tier 2+)

### Example Super Stories
- As a PR Admin, I want jobs created in Prism Accounting to automatically appear in Prism Payroll for time entry coding so that I never have to manually re-enter job numbers in two places.
- As a Field Supervisor, I want the active job list in the time entry system to always reflect what's currently in Prism Accounting so that I'm not coding time to outdated or closed jobs.
- As a PR Admin, I want inactive jobs to be suppressed from time entry selection so that field workers can't code new time to a job that's been closed in Prism Accounting.

### Acceptance Criteria Themes
- Jobs and cost codes added or modified in Prism Accounting are reflected in Prism Payroll within the sync window (TBD per OQ-2) — no admin action required
- Inactive jobs are not available for time entry coding in Prism Payroll; active jobs are available immediately after sync
- Sync status is visible to admin: last successful sync timestamp and any error alerts
- Job data includes: job number, job name, active/inactive status, and associated cost codes
- Cost code data includes: cost code identifier, description, active/inactive status, job association
- If the sync fails, the admin receives an alert and the previous job list remains available — no silent data loss

### Dependencies & Risks
- **Critical dependency:** Prism Accounting API (read access to jobs and cost codes) — owned by Prism platform team; API availability and data model must be confirmed before Beta (OQ-1, PRD §5b — High risk)
- **Downstream:** E3 (Time Collection) consumes the job/cost code list for time entry coding — time entry coding accuracy depends on sync completeness
- **Open Question (OQ-2):** Is job/cost code sync real-time (webhook) or scheduled (polling)? What is the acceptable latency? (Platform team, Sprint 1)
- **Risk:** Prism Accounting API doesn't support read access at Beta — mitigation: early API discovery Sprint 0; escalate if blocked (PRD §5c — Medium probability, High impact)

### Success Metrics / KPIs
- Jobs/cost codes in sync between Prism Accounting and Prism Payroll: real-time or within configured sync window — 100% of active jobs available
- Sync failures per week: tracked; target < 1% of sync attempts
- Admin-reported job list discrepancies between Prism Accounting and Prism Payroll: 0 at GA

### Assumptions
- Prism Accounting is the system of record for jobs, cost codes, and their statuses — Prism Payroll consumes this data and does not maintain it independently
- The Prism platform team owns and will provide read access to the Prism Accounting Jobs API
- Sync window latency is acceptable for operational use (not sub-second) — confirmed with product and field operations

---

## E9-2 — GL Account Mapping

### Goal / Outcome
During company setup, the admin maps each payroll expense and liability category to the corresponding GL account in Prism Accounting's chart of accounts — once, without engineering involvement. This mapping is the foundational configuration that enables all subsequent automatic GL journal entry generation. Once mapped, every payroll run's journal entries are posted to the correct accounts automatically. No accountant or engineer is required per run.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — completes GL mapping during onboarding; does not want to need a developer to configure accounting integration
- **External CPA / Bookkeeper** — may advise on the correct GL account assignments; needs to verify that the mapping matches the company's chart of accounts

### Business & PRD Drivers
- G1 — Every payroll run automatically generates a fully burdened labor cost allocation to Prism Accounting — no manual journal entries
- G4 — Payroll register and GL entries are always reconcilable — zero discrepancies
- UC-2 — Map GL accounts during company setup (P0 — Beta stub)
- PRD §3a — GL Account Mapping requirements
- PRD §4a — Beta: GL account mapping configured; GA: mapping drives live posting

### Problem / Rationale
Without a configured GL account mapping, the system cannot automatically determine which account to debit for labor costs or which account to credit for tax liabilities — forcing manual journal entry creation every pay period. Without separation of direct labor (COGS) from overhead labor (Overhead Expense), job cost reporting in Prism Accounting produces misleading profitability data. Requiring an engineer to set up or change the mapping creates operational dependency that is unacceptable for a configurable payroll product.

### In Scope
- Admin maps payroll expense and liability categories to Prism Accounting GL accounts: wages expense, employer tax expense (FICA, FUTA, SUTA), WC expense, net pay liability, federal tax liability, state tax liability (per jurisdiction), employer tax liability
- Support mapping of direct labor to Cost of Goods Sold accounts and overhead labor to Overhead Expense accounts — distinct mappings for job-coded vs. non-job-coded hours
- GL account options populated from Prism Accounting's chart of accounts (read via Prism Accounting API)
- Admin can update GL account mapping without engineering involvement
- Mapping is company-level, with optional entity-level override for multi-entity companies (P1)
- Configured mapping persisted and versioned: prior runs remain traceable to the mapping in effect at the time

### Out of Scope (for this feature)
- Chart of accounts creation, editing, or management — Prism Accounting module
- Union fringe GL account mapping (Tier 2+)
- Prevailing wage fringe GL mapping (Tier 2+)
- Per-run mapping overrides (mapping is set once at company setup)

### Example Super Stories
- As a PR Admin, I want to complete the GL account mapping during company setup by selecting from a dropdown of my Prism Accounting chart of accounts so that journal entries automatically post to the correct accounts without me configuring them every run.
- As an External CPA, I want to review and advise on the GL mapping configuration so that the automated journal entries match our established chart of accounts structure.
- As a PR Admin, I want direct labor (field hours on a job) to post to our COGS accounts and overhead hours (office staff) to post to our Overhead Expense accounts — automatically — without configuring this each pay period.

### Acceptance Criteria Themes
- Admin can configure GL account mapping for all required payroll categories during company setup — no engineering ticket or support request required
- GL account options are sourced from Prism Accounting's chart of accounts (not manually typed)
- Mapping supports: wages expense, employer FICA expense, employer FUTA/SUTA expense, WC expense, net pay liability, federal tax liability, state tax liability per jurisdiction, employer tax liability
- Direct labor and overhead labor map to separate GL accounts (COGS vs. Overhead Expense)
- Mapping is saved and versioned; historical payroll runs are traceable to the mapping that was active at the time of the run
- Admin can update the mapping post-setup; changes take effect on the next payroll run — prior runs are unaffected

### Dependencies & Risks
- **Critical dependency:** Prism Accounting chart of accounts API (read access) — account list must be retrievable for admin to select accounts; owned by Prism platform team (OQ-1)
- **Upstream:** Company Setup (E1) — GL account mapping is a company setup step; must be integrated into the E1 onboarding flow
- **Downstream:** E9-4 (GL Journal Entry Generation) consumes the mapping to generate correctly targeted journal entries
- **Risk:** If Prism Accounting chart of accounts API is not available at Beta, admin will need to manually enter GL account codes — noted as Beta limitation (OQ-1)

### Success Metrics / KPIs
- GL mapping completion rate at onboarding: target 100% of companies that reach payroll run stage
- Manual journal entries required post-payroll for companies with GL mapping configured: 0 at GA
- Admin-reported GL mapping configuration support tickets: tracked; target < 1% of onboarding companies

### Assumptions
- The chart of accounts is maintained in Prism Accounting and read by Prism Payroll via API — Prism Payroll does not host its own chart of accounts
- GL mapping is a one-time company setup task with occasional updates; it does not require reconfiguration per payroll run
- Multi-entity GL mapping (entity-level account overrides) is a P1 enhancement; single-entity mapping is GA minimum

---

## E9-3 — Labor Burden Calculation

### Goal / Outcome
After every payroll run, Prism calculates the fully burdened labor cost for each unique job/cost code/trade combination worked in that run — including gross wages, proportional employer FICA, proportional FUTA/SUTA, and WC cost by WC classification code. Office and administrative hours not coded to a job are allocated to overhead. Project managers and owners see the true cost of labor on each job — not just gross wages — immediately after each payroll run. This is the data that drives accurate job profitability analysis in Prism Accounting.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs labor burden calculated automatically; cannot manually allocate employer taxes and WC cost across dozens of jobs after every run
- **Project Manager / Owner** — needs fully burdened labor cost per job to monitor project profitability in real time
- **External CPA / Bookkeeper** — needs accurate labor burden data to support correct GL entries and job cost reporting

### Business & PRD Drivers
- G2 — Project managers can see real labor costs by job and cost code immediately after each payroll run
- G3 — Labor burden includes all employer costs (FICA, FUTA/SUTA, WC, benefits) — not just gross wages
- UC-3 — Calculate fully burdened labor cost per job/cost code/trade per payroll run (P0 — Beta stub; GA full)
- PRD §3a — Labor Burden Calculation per Job/Cost Code requirements
- PRD §1b — Problem: "Gross wage only — when payroll does post to accounting, it often posts only gross wages — not the fully burdened cost"

### Problem / Rationale
When a payroll system posts only gross wages to job costs, project profitability is systematically understated. Employer FICA (7.65%), FUTA/SUTA (variable), and WC premiums (5–25% of wages depending on trade risk) routinely add 15–35% on top of gross wages. A project manager who sees $10,000 in gross labor posted to a job is missing $1,500–$3,500 in true employer cost — making every project look more profitable than it actually is. Manual allocation of employer taxes proportionally across jobs after every payroll run is error-prone and too time-consuming to perform consistently.

### In Scope
- Fully burdened labor cost per unique job/cost code/trade combination worked in the run
- Labor burden components per time entry: gross wages + proportional employer FICA + proportional FUTA/SUTA + WC cost by WC classification code
- Multi-trade WC cost: WC cost calculated at the correct NCCI classification rate for each trade the employee worked — not a single blended rate
- Proportional allocation of employer FICA and FUTA/SUTA: allocated to jobs in proportion to gross wages earned on each job in the run
- Office/administrative hours not coded to a specific job allocated to overhead — not to any specific job
- Labor burden output per payroll run: one record per job/cost code/trade combination with all burden components enumerated
- Burden data available for downstream use in GL journal entry generation (E9-4) and Prism Accounting posting (E9-5)

### Out of Scope (for this feature)
- Job costing for non-labor costs (materials, equipment, subcontractor invoices) — Prism Accounting
- Budget vs. actuals analysis UI — Reporting & Audit (E10)
- Union fringe benefit job cost allocation (Tier 2+)
- Prevailing wage fringe allocation (Tier 2+)
- Benefits cost allocation to jobs (future)

### Example Super Stories
- As a Project Manager, I want to see the fully burdened labor cost for each job after payroll is finalized — including employer taxes and WC — so that I'm looking at the true cost of labor, not just what we paid employees.
- As a PR Admin, I want the system to automatically allocate employer FICA and FUTA/SUTA proportionally across each job based on hours worked so that I don't have to manually split these costs after every run.
- As an External CPA, I want each employee's WC cost calculated at the correct trade classification rate for each trade worked in the period — not a blended rate — so that job cost reports reflect accurate risk-based cost allocation.

### Acceptance Criteria Themes
- Fully burdened labor cost per job/cost code/trade combination = gross wages + proportional employer FICA + proportional FUTA/SUTA + WC cost by WC code — verified to the cent against manual calculation for a multi-job, multi-trade test case
- Employees who worked multiple trades on multiple jobs in the period produce separate burden records per job/cost code/trade — not aggregated into a single total
- WC cost is calculated at the NCCI classification rate for each trade worked; multi-trade employees produce WC cost broken down by classification code
- Overhead allocation: hours not coded to any job (office/admin) are allocated to the overhead expense category — not to any specific job
- Labor burden output is structured per the LaborBurdenAllocation data model (run_id, job_id, cost_code, trade_type, gross_wages, employer_fica, futa_suta, wc_cost, total_burden)
- Zero discrepancy: sum of all burden records across all jobs equals total employer cost for the run

### Dependencies & Risks
- **Upstream:** E4-7 (Gross Pay Aggregation) must deliver gross pay by time entry including job, cost code, and trade — job-level breakdown is required; total gross pay is insufficient
- **Upstream:** E5-3 (FICA, FUTA, SUTA) must calculate employer tax amounts that are then allocated proportionally to jobs
- **Upstream:** E5-6 (Workers' Comp Estimation) must provide WC cost by trade and WC classification code for multi-trade allocation
- **Risk:** If E4 delivers gross pay only at the employee level (not at the time entry / job level), this calculation cannot be performed — data contract between E4 and E9 must specify job-level gross pay breakdown (PRD §3c — Integration Requirements)
- **Open Question (OQ-3):** How is overhead labor defined — are there specific job codes that designate overhead, or is it all unlabeled/non-job-coded time? (Product, Sprint 1)

### Success Metrics / KPIs
- Fully burdened cost allocation calculated for 100% of payroll runs at GA — zero runs where only gross wages are posted
- Labor burden allocation accuracy: zero penny discrepancy between sum of burden records and total employer cost per run
- Admin-reported allocation errors: 0 critical

### Assumptions
- Overhead labor is defined as hours not coded to a specific job (office/admin staff); all field hours are expected to carry a job code
- WC classification rates per NCCI code are configured at the company level (admin-entered based on the company's WC policy) — Prism does not pull rates from insurance carriers at Beta
- Gross pay by time entry (with job, cost code, and trade) is available from E4's output — this data contract must be confirmed with the E4 team

---

## E9-4 — GL Journal Entry Generation

### Goal / Outcome
On every payroll finalization, Prism automatically generates a complete, balanced set of GL journal entries — debiting labor cost accounts by job and cost code, debiting overhead expense for non-job-coded hours, and crediting net pay liability, federal tax liability, state tax liability by jurisdiction, and employer tax liability. Admins never create manual journal entries after a payroll run. The system eliminates the most labor-intensive and error-prone post-payroll task in construction accounting.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — currently spends hours after every payroll run creating manual journal entries; at GA, this is fully automated
- **External CPA / Bookkeeper** — reviews journal entries for accuracy; needs to verify the debit/credit structure matches the payroll register without manual reconciliation work

### Business & PRD Drivers
- G1 — Every payroll run automatically generates a fully burdened labor cost allocation to Prism Accounting — no manual journal entries
- G4 — Payroll register and GL entries are always reconcilable — zero discrepancies
- UC-4 — Generate GL journal entries on payroll finalization (P0 — GA)
- PRD §3a — GL Journal Entry Generation requirements
- PRD §1b — Problem: "Manual journal entries — office managers or CPAs spend hours creating manual journal entries to allocate labor to jobs"

### Problem / Rationale
Generic payroll tools post a single "Payroll Expense" journal entry with no job-level allocation. Construction contractors need journal entries that debit specific job cost accounts (one debit per job/cost code combination), debit overhead expense for office labor, and credit each liability account at the correct amount. Creating these entries manually after every payroll run takes 1–4 hours depending on company size, is done retrospectively (often weekly or monthly — not per-run), and introduces errors whenever a job allocation is estimated or rounded. The result: GL records that don't match the payroll register, requiring cleanup at quarter-end.

### In Scope
- Auto-generate GL journal entries upon payroll finalization — no admin trigger required
- Journal entry debits: labor cost accounts by job/cost code (direct labor, COGS mapping) + overhead expense (indirect/office labor)
- Journal entry credits: net pay liability, federal tax liability, state tax liability per jurisdiction, employer FICA tax liability, employer FUTA/SUTA liability, employer WC liability
- All journal entries dated as of the payroll pay date
- Journal entries reference the GL account mapping configured in E9-2
- Labor burden amounts from E9-3 (fully burdened — not just gross wages) used for debit amounts
- Complete journal entry log retained per payroll run with: run ID, journal entry ID, debit account, credit account, amount, description, post date
- Journal entries reversible only through a correction run — not through direct editing

### Out of Scope (for this feature)
- Posting journal entries to Prism Accounting — E9-5
- Direct journal entry editing after generation
- Union fringe benefit journal entries (Tier 2+)
- Entries for non-payroll transactions

### Example Super Stories
- As a PR Admin, I want GL journal entries automatically generated when payroll is finalized so that I never have to open Prism Accounting and create journal entries manually after a payroll run.
- As an External CPA, I want to see a complete preview of the journal entries before they are posted to Prism Accounting — showing every debit by job/cost code and every credit by liability account — so that I can verify accuracy before the books are updated.
- As a PR Admin, I want each journal entry dated as of the pay date so that labor costs appear in the correct accounting period in Prism Accounting.

### Acceptance Criteria Themes
- GL journal entries are generated automatically upon payroll finalization — no admin manual action required
- Journal entry debits cover every job/cost code combination in the run, plus an overhead expense entry for non-job-coded hours — no job is missing a debit entry
- Journal entry credits cover: net pay liability, federal tax liability, state tax liability (one credit per state with tax obligation), employer FICA liability, employer FUTA/SUTA liability, employer WC liability
- The journal entry set is balanced: total debits = total credits — verified to the cent for every run
- All journal entries are dated as of the payroll pay date
- Journal entry log is permanently retained per run: run ID, journal entry ID, accounts, amounts, pay date, posting status
- Journal entries cannot be directly edited; reversal is only available through an authorized correction run

### Dependencies & Risks
- **Upstream:** E9-3 (Labor Burden Calculation) must produce fully burdened cost per job/cost code before journal entries can be generated — E9-3 is the primary input
- **Upstream:** E9-2 (GL Account Mapping) must be configured; without a mapping, the system cannot target the correct GL accounts
- **Upstream:** E6 (Disbursement / Payroll Finalization) must fire the finalization event that triggers journal entry generation
- **Downstream:** E9-5 (Prism Accounting Posting) consumes the generated journal entries for transmission to Prism Accounting
- **Risk:** Rounding errors in labor burden allocation across many time entries and jobs may cause the journal entry to be off by a few cents — mitigation: define and document rounding logic; reconciliation report (E9-6) detects any variance

### Success Metrics / KPIs
- Manual journal entries required after payroll finalization: 0 at GA
- Journal entry balance (debit = credit): 100% of runs — zero imbalanced sets
- Payroll register / GL journal entry variance: 0 for all clean runs

### Assumptions
- Payroll finalization (E6) fires a deterministic event that triggers journal entry generation — the trigger is not manual
- The journal entry generation happens after E9-3 (burden calculation) is complete — sequencing is guaranteed by the finalization pipeline
- Correction runs (for amending a finalized payroll) generate offsetting journal entries — the correction mechanism is defined in E6

---

## E9-5 — Prism Accounting Posting

### Goal / Outcome
GL journal entries and job cost allocations generated by each payroll run are posted to Prism Accounting automatically — without any admin action — within 15 minutes of payroll finalization. Posting confirmation is received from Prism Accounting before the payroll record closes; failed postings trigger an admin alert and are queued for retry. Project managers can open a job in Prism Accounting immediately after payroll finalizes and see updated labor costs for the period.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — payroll posting to accounting is fully automatic; no export/import, no manual GL work
- **Project Manager / Owner** — sees updated labor cost per job in Prism Accounting within minutes of payroll finalization; catches overruns in real time
- **External CPA / Bookkeeper** — payroll register ties to GL automatically; no manual cleanup required at period close or quarter-end

### Business & PRD Drivers
- G1 — Every payroll run automatically generates a fully burdened labor cost allocation to Prism Accounting — no manual journal entries
- G2 — Project managers can see real labor costs by job and cost code immediately after each payroll run
- UC-5 — Post labor cost allocation to Prism Accounting job costing (P0 — GA)
- UC-6 — Post GL journal entries to Prism Accounting General Ledger (P0 — GA)
- UC-7 — Support multi-entity payroll GL posting (P1 — GA)
- PRD §3a — Posting to Prism Accounting requirements

### Problem / Rationale
Without automatic posting, the GL journal entries and job cost allocations generated by Prism Payroll exist only in Prism Payroll's records — never flowing to Prism Accounting where project managers and owners actually look at job costs. Manual export/import workflows between payroll and accounting systems are the worst-case scenario: they require admin effort after every payroll run, are frequently forgotten or delayed, break on data format mismatches, and always result in accounting records that are at least a day behind. The entire value of the integration is destroyed if posting is not automatic.

### In Scope
- GL journal entries post to Prism Accounting General Ledger automatically upon payroll finalization — no admin trigger
- Labor cost allocations post to Prism Accounting's job costing module per job/cost code — each job receives its fully burdened labor cost for the period
- Posting confirmation received from Prism Accounting; posting is not considered complete until confirmation is received
- Failed postings: admin alert triggered immediately; failed entries queued for automatic retry
- Retry logic: attempt up to [N] retries before escalating to a persistent admin alert requiring manual intervention
- Posting status tracked per payroll run: posted, pending, failed, retrying
- Multi-entity support (P1): if the company has multiple legal entities in Prism Accounting, payroll GL posting routes to the correct entity based on the entity configured for the run

### Out of Scope (for this feature)
- GL journal entry generation — E9-4
- Posting non-payroll transactions to Prism Accounting
- Manual GL entry editing in Prism Accounting
- Non-labor job cost posting (materials, equipment) — Prism Accounting

### Example Super Stories
- As a PR Admin, I want payroll journal entries and job cost allocations to post to Prism Accounting automatically when I finalize payroll so that I never have to export, import, or manually enter anything in Prism Accounting.
- As a Project Manager, I want to open a job in Prism Accounting within 15 minutes of payroll finalization and see the updated labor cost for this pay period so that I can monitor project profitability in real time.
- As a PR Admin, I want to receive an immediate alert if posting to Prism Accounting fails, with an automatic retry queued, so that I know about failures and don't have to poll for status manually.

### Acceptance Criteria Themes
- GL journal entries and job cost allocations are posted to Prism Accounting automatically upon payroll finalization — no admin action required
- Posting is confirmed by Prism Accounting before the payroll run's posting status is marked complete
- A project manager can view updated labor cost for a job in Prism Accounting within 15 minutes of payroll finalization
- Failed postings trigger an admin alert within 5 minutes of failure; automatic retry is queued without admin intervention
- Posting status per payroll run is visible in Prism Payroll: posted (with timestamp), pending, retrying, or failed
- Multi-entity (P1): posting routes to the correct Prism Accounting entity based on entity configuration; single-entity is GA minimum

### Dependencies & Risks
- **Critical dependency:** Prism Accounting GL API (write access) — this feature cannot be built without write access to Prism Accounting's journal entry and job costing endpoints; owned by Prism platform team (OQ-1 — High risk)
- **Upstream:** E9-4 (GL Journal Entry Generation) must produce completed journal entries before posting can occur
- **Upstream:** E6 (Payroll Finalization) triggers the posting pipeline; finalization event must fire before posting begins
- **Risk:** Prism Accounting API doesn't support write access at Beta — mitigation: early API discovery Sprint 0; if write access is delayed, Beta demonstrates the integration data model without live posting (PRD §5c — Medium probability, High impact)
- **Risk:** GL posting failure causes payroll record to remain in "posting incomplete" state — mitigation: retry queue with admin alert; confirm escalation path with product team
- **Open Question (OQ-1):** Does Prism Accounting's current API support write access for GL journal entries? What is the write API format? (Platform team, Sprint 0)
- **Open Question (OQ-4):** Is multi-entity GL posting required at GA or confirmed as post-GA? (Product, Sprint 1)

### Success Metrics / KPIs
- GL posting success rate: target 99.9% of payroll runs post successfully on first attempt at GA
- `gl_post_failed` events per month: tracked; target < 0.1% of runs
- Labor cost by job available in Prism Accounting after payroll finalization: < 15 minutes — target 100% of runs
- Manual accounting intervention required post-posting: 0 for successfully posted runs

### Assumptions
- The Prism platform team owns the Prism Accounting GL API and will provide write access for this integration; Prism Payroll does not bypass or replicate the Prism Accounting data store
- Posting confirmation (success/failure response from Prism Accounting) is synchronous or near-synchronous — the integration does not rely on a delayed callback with no timeout
- Multi-entity GL posting (P1) requires entity-level GL account mapping configured in E9-2

---

## E9-6 — Reconciliation Support

### Goal / Outcome
After every payroll run, the system produces a reconciliation report comparing payroll register totals to GL journal entry totals for the same run — line by line. When the run is clean, the report shows zero variance, giving the admin and CPA immediate confirmation that the books match the payroll register. Any discrepancy is surfaced as a named exception requiring investigation. This transforms month-end GL reconciliation from a multi-hour manual exercise into a per-run automated check that takes seconds to review.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — currently reconciles payroll to the GL manually at month-end or quarter-end; at GA, this is a per-run automated report
- **External CPA / Bookkeeper** — currently "spends hours reconciling payroll to the GL every quarter"; at GA, the reconciliation report is available immediately after every run with zero manual work

### Business & PRD Drivers
- G4 — Payroll register and GL entries are always reconcilable — zero discrepancies
- UC-8 — Provide reconciliation support: payroll register matches GL entries (P0 — GA)
- PRD §3a — Reconciliation requirements
- PRD §2a — External CPA persona: "I spend hours reconciling payroll to the GL every quarter" — this feature directly resolves that pain point

### Problem / Rationale
Without an automated reconciliation report, the only way to verify that the GL reflects the payroll register is to manually compare totals — pulling a payroll summary export and a GL report, then cross-referencing line by line. This is done infrequently (monthly or quarterly) because it takes too long to do after every run. The result: discrepancies accumulate over multiple pay periods, are discovered late, and require retroactive journal entry corrections that consume CPA time and create audit risk. A per-run reconciliation report eliminates this entirely by checking for variance immediately while the data is fresh.

### In Scope
- Reconciliation report generated per payroll run: payroll register totals vs. GL journal entry totals
- Report columns: payroll category (wages, employer FICA, FUTA/SUTA, WC, net pay, federal tax liability, state tax liabilities), payroll register total, GL journal entry total, variance
- Zero-variance confirmation: when the run is clean, the report explicitly shows zero variance across all categories
- Exception surfacing: any non-zero variance flagged as an exception with: category, payroll register amount, GL entry amount, variance amount
- Reconciliation report available to Admin and CPA roles immediately after payroll finalization and posting
- Report retained permanently per payroll run in the audit log

### Out of Scope (for this feature)
- Budget vs. actuals analysis (comparing labor costs to job budgets) — Reporting & Audit (E10)
- GL account reconciliation within Prism Accounting (e.g., bank reconciliation, accounts payable) — Prism Accounting module
- Cross-period reconciliation (reconciling multiple runs in aggregate) — future
- Automated variance correction (the report surfaces exceptions; resolution is manual)

### Example Super Stories
- As a PR Admin, I want a reconciliation report after every payroll run that shows whether my payroll register totals match the GL journal entries so that I know immediately if there's a discrepancy — without waiting for month-end.
- As an External CPA, I want the reconciliation report to show zero variance when the run is clean and flag any discrepancy with the exact amounts so that my quarter-end payroll-to-GL reconciliation takes minutes instead of hours.
- As a PR Admin, I want any GL posting variance to be surfaced as a named exception — showing which category has a discrepancy and by how much — so that I know exactly where to investigate.

### Acceptance Criteria Themes
- Reconciliation report is generated for every payroll run immediately after posting completes — no admin trigger required
- Report compares payroll register totals to GL journal entry totals for every payroll category: wages, employer FICA, FUTA/SUTA, WC, net pay, federal tax liability, state tax liabilities per jurisdiction
- When the run is clean: all variances are $0.00; the report explicitly confirms zero variance
- When a discrepancy exists: the exception is surfaced with category, payroll register amount, GL entry amount, and variance amount — no discrepancy is hidden or summarized
- Reconciliation report is accessible to Admin and CPA roles in read-only mode at any time after the run
- Reconciliation report is permanently retained in the payroll run audit log

### Dependencies & Risks
- **Upstream:** E9-4 (GL Journal Entry Generation) must produce journal entries before reconciliation can compare them to the register
- **Upstream:** E9-5 (Prism Accounting Posting) — reconciliation report is most meaningful after posting completes; if posting is pending or failed, the report reflects the pre-posting state and notes posting status
- **Risk:** Rounding logic differences between the payroll calculation engine and the GL journal entry generation could produce consistent penny variances — mitigation: rounding logic must be consistent across both; reconciliation report in testing will detect any systematic variance before GA (PRD §5c)

### Success Metrics / KPIs
- Reconciliation discrepancy rate: `reconciliation_variance_detected` events / total payroll runs — target 0% for clean runs at GA
- Time to reconcile payroll to GL (admin-reported): target reduction from hours (manual) to minutes (automated report review)
- CPA quarter-end cleanup work attributable to payroll/GL discrepancies: 0 at GA

### Assumptions
- Reconciliation is performed per payroll run — not at a period or account level; period-level reconciliation is a CPA workflow built on top of per-run reports
- The reconciliation report surfaces variances but does not automatically correct them; resolution requires admin or CPA action
- Journal entry audit log (7-year retention) is maintained per PRD §3b — reconciliation reports are part of this audit trail

---

## Traceability Table

| Requirement / PRD Reference | Description | Feature(s) |
|---|---|---|
| G1 — No manual journal entries | Fully burdened allocation posts automatically | E9-2, E9-4, E9-5 |
| G2 — Real-time labor cost by job | PM sees labor cost per job after each run | E9-3, E9-5 |
| G3 — Full labor burden (not just gross wages) | Burden includes FICA, FUTA/SUTA, WC | E9-3 |
| G4 — Payroll register / GL reconcilable | Zero discrepancy; reconciliation report | E9-4, E9-6 |
| G5 — Jobs/cost codes in sync | No manual re-entry of jobs in Prism Payroll | E9-1 |
| UC-1 — Job & cost code sync | P0 Beta stub | E9-1 |
| UC-2 — GL account mapping | P0 Beta stub | E9-2 |
| UC-3 — Labor burden per job/cost code/trade | P0 Beta stub; GA full | E9-3 |
| UC-4 — GL journal entry generation | P0 GA | E9-4 |
| UC-5 — Job cost posting to Prism Accounting | P0 GA | E9-5 |
| UC-6 — GL posting to Prism Accounting | P0 GA | E9-5 |
| UC-7 — Multi-entity GL posting | P1 GA | E9-5 |
| UC-8 — Reconciliation report | P0 GA | E9-6 |
| PRD §3a — Inbound sync: jobs + cost codes | Real-time or near-real-time sync | E9-1 |
| PRD §3a — GL account mapping configurable by admin | No engineering required | E9-2 |
| PRD §3a — Burden components: gross + FICA + FUTA/SUTA + WC | Per time entry, per job/cost code/trade | E9-3 |
| PRD §3a — Journal entry debits: labor cost by job + overhead | Correct debit structure | E9-4 |
| PRD §3a — Journal entry credits: net pay + tax liabilities | Full credit structure | E9-4 |
| PRD §3a — Auto-post on finalization | No admin trigger | E9-5 |
| PRD §3a — Posting confirmation + retry on failure | Reliability requirement | E9-5 |
| PRD §3a — Reconciliation: register vs. GL, zero variance | Per-run report | E9-6 |
| PRD §3b — Accuracy: allocation to the cent | NFR | E9-3, E9-4 |
| PRD §3b — Performance: GL posted within 15 min | NFR | E9-5 |
| PRD §3b — Reliability: 99.9% job/cost code sync uptime | NFR | E9-1 |
| PRD §3b — Audit: journal entry log 7-year retention | NFR | E9-4, E9-6 |
| PRD §3b — Security: GL data accessible to Admin + CPA only | NFR | E9-2, E9-4, E9-6 |
| PRD OQ-1 — Prism Accounting write API format | Platform team, Sprint 0 | E9-5 |
| PRD OQ-2 — Sync: real-time vs. polling; acceptable latency | Platform team, Sprint 1 | E9-1 |
| PRD OQ-3 — Overhead labor definition | Product, Sprint 1 | E9-3 |
| PRD OQ-4 — Multi-entity GA vs. post-GA | Product, Sprint 1 | E9-5 |
| PRD OQ-5 — Prism Accounting job costing cost type classification | Platform team, Sprint 1 | E9-5 |
