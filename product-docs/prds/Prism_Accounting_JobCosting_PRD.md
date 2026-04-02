# PRD: Prism Construction Payroll — Prism Accounting Integration & Job Costing

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Tax Filing, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Prism Accounting Integration & Job Costing module is the strategic differentiator of Prism Construction Payroll. It creates a full bi-directional data flow between Prism Payroll and Prism Accounting: jobs, cost codes, and chart of accounts flow from Accounting into Payroll for configuration and time coding; post-payroll, the full labor burden (gross wages + employer FICA + FUTA/SUTA + workers' comp + benefits) flows back to Prism Accounting's job costing and General Ledger. This transforms payroll from a compliance function into real-time project intelligence — showing contractors exactly what each job costs in labor, updated every pay period. At Beta, the connection is a stub that proves the data model. At GA, it is a fully operational, production bi-directional integration.

### 1b. Problem Statement

In construction, labor is the largest and most volatile cost — often 60% of total project cost. Yet most SMB contractors cannot answer the question "Is Job 12 making money?" because their payroll data and job cost data live in different systems and don't talk to each other.

Current failure modes:

- **Disconnected systems**: Payroll runs in QuickBooks Payroll or ADP; job costs live in Prism Accounting or another construction accounting system. Data is reconciled manually at month-end, always a period behind
- **Gross wage only**: When payroll does post to accounting, it often posts only gross wages — not the fully burdened cost including employer taxes, WC, and overhead. Project profitability is systematically understated
- **No job-level allocation**: Generic payroll tools post to "Payroll Expense" as a single GL entry. There is no allocation of specific hours to specific jobs/cost codes that project managers can see in real time
- **Manual journal entries**: Office managers or CPAs spend hours creating manual journal entries to allocate labor to jobs — a process prone to error, done too infrequently, and always retrospective

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Every payroll run automatically generates a fully burdened labor cost allocation to Prism Accounting — no manual journal entries |
| G2 | Project managers can see real labor costs by job and cost code immediately after each payroll run |
| G3 | Labor burden includes all employer costs (FICA, FUTA/SUTA, WC, benefits) — not just gross wages |
| G4 | Payroll register and GL entries are always reconcilable — zero discrepancies |
| G5 | Jobs and cost codes flow from Prism Accounting into Prism Payroll without manual re-entry |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Payroll runs with complete labor burden allocation to job costing | 100% at GA | Operational |
| Manual journal entries for labor cost allocation required from admin | 0 at GA | Efficiency |
| Labor cost by job available in Prism Accounting after payroll finalization | <1 hour — **Inferred** | Performance |
| Payroll register / GL reconciliation discrepancies | 0 | Quality |
| Jobs/cost codes in sync between Prism Accounting and Prism Payroll | Real-time — **Inferred** | Operational |

### 1e. Out of Scope

- Job costing for non-labor costs (materials, equipment, subcontractor invoices) — Prism Accounting
- Budget vs. actuals analysis UI (covered in E10 Reporting & Audit)
- Prism Accounting's internal GL and chart of accounts management — Prism Accounting module
- Union fringe benefit job cost allocation (Tier 2+)
- Prevailing wage fringe allocation (Tier 2+)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Payroll posts to accounting automatically; no manual GL work | "I have to go into QuickBooks and create journal entries every week" | Desktop |
| **Project Manager / Owner** | Active job oversight | Know real labor cost per job in real time; catch overruns early | "I find out a job went over budget three months later" | Desktop + Mobile |
| **External CPA / Bookkeeper** | Retained accountant | Payroll register ties to GL; no cleanup work required at quarter-end | "I spend hours reconciling payroll to the GL every quarter" | Desktop; periodic |

### 2b. User Journeys / Workflows

**Primary: Post-Payroll Labor Allocation to Job Costing (GA)**

```
Payroll run finalized and disbursed (E6)
 │
 ├─ System assembles labor cost allocation per job/cost code/trade:
 │   ├─ For each time entry in the payroll run:
 │   │   ├─ Gross wages for those hours (from E4)
 │   │   ├─ Employer FICA proportional to hours (from E5)
 │   │   ├─ FUTA/SUTA proportional to hours (from E5)
 │   │   └─ WC cost proportional to hours and WC code (from E5)
 │   └─ Total = fully burdened cost for those hours on that job
 │
 ├─ System generates GL journal entries:
 │   ├─ Debit: Labor Cost (by job / cost code)
 │   ├─ Debit: Overhead Labor (office/admin hours not job-coded)
 │   ├─ Credit: Wages Payable (net pay amounts)
 │   ├─ Credit: Federal Tax Liability (FIT + FICA withheld)
 │   ├─ Credit: State Tax Liability (per state)
 │   └─ Credit: Employer Tax Liability (FUTA, SUTA, WC)
 │
 ├─ Journal entries posted to Prism Accounting GL automatically
 │
 └─ Job cost report updated in Prism Accounting:
     └─ Admin and PM can immediately see labor cost by job/cost code
```

**Secondary: Job and Cost Code Sync from Prism Accounting**

```
New job created in Prism Accounting
 │
 ├─ Job data synced to Prism Payroll:
 │   └─ Job number, job name, active status, associated cost codes
 │
 └─ Available for:
     ├─ Time entry coding in Traqspera (via Prism Payroll reference)
     └─ Pay rate mapping (employee trade rates linked to cost codes)
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Sync jobs and cost codes from Prism Accounting to Prism Payroll | P0 — Beta stub |
| UC-2 | Map GL accounts (payroll expense, tax liability, net pay liability) during company setup | P0 — Beta stub |
| UC-3 | Calculate fully burdened labor cost per job/cost code/trade per payroll run | P0 — Beta stub; GA full |
| UC-4 | Generate GL journal entries on payroll finalization | P0 — GA |
| UC-5 | Post labor cost allocation to Prism Accounting job costing | P0 — GA |
| UC-6 | Post GL journal entries to Prism Accounting General Ledger | P0 — GA |
| UC-7 | Support multi-entity payroll GL posting (if applicable) | P1 — GA |
| UC-8 | Provide reconciliation support: payroll register matches GL entries | P0 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Inbound Sync — Jobs and Cost Codes (Beta stub; GA full)

- The system shall receive and maintain a current list of active jobs from Prism Accounting, including: job number, job name, and active/inactive status — **P0**
- The system shall receive and maintain cost codes per job from Prism Accounting — **P0**
- Job and cost code data shall update in Prism Payroll within a reasonable time window after changes in Prism Accounting — **P0** — *Inferred: real-time sync or near-real-time; confirm with platform team*
- Inactive jobs shall be flagged in Prism Payroll and excluded from new time entry coding — **P1**

#### GL Account Mapping (Beta stub; GA full)

- During company setup (E1), the admin shall map payroll expense categories to GL accounts in Prism Accounting's chart of accounts: wages expense, employer tax expense, WC expense, net pay liability, tax liability accounts — **P0**
- The system shall support direct labor mapped to Cost of Goods Sold and overhead labor mapped to Overhead Expense — **P0**
- GL account mapping shall be configurable by the admin without engineering involvement — **P0**

#### Labor Burden Calculation per Job/Cost Code

- After each payroll run, the system shall calculate the fully burdened labor cost per unique job/cost code/trade combination worked in that run — **P0** (GA)
- Labor burden components per time entry: gross wages + proportional employer FICA + proportional FUTA/SUTA + WC cost by WC code — **P0** (GA)
- Office/administrative hours not coded to a specific job shall be allocated to overhead — **P0** (GA) — *Inferred: admin hours → overhead expense GL; confirm with product*

#### GL Journal Entry Generation (GA)

- Upon payroll finalization, the system shall auto-generate GL journal entries — **P0** (GA)
- Journal entry debits: labor cost accounts by job/cost code (direct) + overhead expense (indirect) — **P0** (GA)
- Journal entry credits: net pay liability, federal tax liability, state tax liability per jurisdiction, employer tax liability — **P0** (GA)
- All journal entries shall be dated as of the payroll pay date — **P0** (GA)
- Journal entries shall be reversible only through a correction run, not through direct editing — **P1** (GA)

#### Posting to Prism Accounting (GA)

- GL journal entries shall post to Prism Accounting automatically upon payroll finalization — **P0** (GA)
- Labor cost allocations shall post to Prism Accounting's job costing module per job/cost code — **P0** (GA)
- The system shall receive confirmation of successful posting from Prism Accounting; failed postings shall alert admin and queue for retry — **P0** (GA)

#### Multi-Entity Support (GA)

- If the company has multiple legal entities in Prism Accounting, the system shall support payroll GL posting to the correct entity — **P1** (GA)

#### Reconciliation (GA)

- The system shall provide a reconciliation report: payroll register totals vs. GL journal entry totals for each payroll run — **P0** (GA)
- The reconciliation shall show zero variance when the run is clean; any variance shall be surfaced as an exception — **P0** (GA)

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Accuracy** | Fully burdened cost allocation matches payroll run data to the cent; zero GL posting variance |
| **Performance** | GL journal entries generated and posted to Prism Accounting within 15 minutes of payroll finalization — *Inferred* |
| **Reliability** | Job/cost code sync available 99.9% uptime; GL posting failure triggers retry and admin alert |
| **Audit** | Complete journal entry log retained 7 years; each entry traceable to payroll run ID |
| **Security** | GL account data and financial figures accessible to Admin and CPA roles only |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| Job | job_number, job_name, status, cost_codes | Synced from Prism Accounting |
| CostCode | cost_code, description, job_id, active | Synced from Prism Accounting |
| GLAccountMapping | payroll_category, gl_account_number, entity_id | Configured in company setup |
| LaborBurdenAllocation | run_id, job_id, cost_code, trade_type, gross_wages, employer_fica, futa_suta, wc_cost, total_burden | Output per payroll run |
| JournalEntry | run_id, journal_id, debit_account, credit_account, amount, description, post_date | One set per run |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Prism Accounting (Jobs API) | Source of jobs and cost codes | Real-time or periodic sync | Internal — Prism platform team |
| Prism Accounting (GL API) | Receive journal entries and job cost allocations | On payroll finalization | Internal — Prism platform team |
| Earnings Engine (E4) | Source of gross pay by time entry (job/cost code/trade) | Post-payroll | Internal |
| Tax Withholding Engine (E5) | Source of employer taxes for burden calculation | Post-payroll | Internal |
| Disbursement Module (E6) | Triggers GL posting after payroll finalization | On run finalization event | Internal |

#### Platform / Infrastructure Constraints

- Prism Accounting API must support: read access to jobs/cost codes, write access to GL journal entries and job cost allocations
- ⚠️ **Requires human review**: Prism Accounting API availability, data model, and write-access authorization — dependency on Prism platform team
- Multi-entity support requires entity-level GL account mapping; single-entity is GA-minimum

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E9-1: Job & Cost Code Sync** | Real-time/periodic sync of jobs and cost codes from Prism Accounting into Prism Payroll | G5 | UC-1 |
| **E9-2: GL Account Mapping** | Admin configures payroll expense categories to chart of accounts during company setup | G1, G4 | UC-2 |
| **E9-3: Labor Burden Calculation** | Fully burdened cost per job/cost code/trade after each payroll run | G2, G3 | UC-3 |
| **E9-4: GL Journal Entry Generation** | Auto-generate debit/credit journal entries on payroll finalization | G1, G4 | UC-4 |
| **E9-5: Prism Accounting Posting** | Post journal entries and job cost allocations to Prism Accounting GL | G1, G2 | UC-5, UC-6, UC-7 |
| **E9-6: Reconciliation Support** | Payroll register vs. GL journal entry reconciliation report | G4 | UC-8 |

### 3e. High-Level Acceptance Criteria

- After a payroll run is finalized, GL journal entries are generated and posted to Prism Accounting automatically, with zero admin manual action
- The journal entry for a run includes: labor cost debited by job and cost code, overhead labor debited to overhead, net pay credited to wages payable, and each tax type credited to the correct liability account
- The fully burdened labor cost for each job in a payroll run includes gross wages + employer FICA + FUTA/SUTA + WC — not just gross wages
- A project manager can open a job in Prism Accounting within 15 minutes of payroll finalization and see the updated labor cost for that period
- The payroll register total matches the sum of all GL journal entries for the same run — zero discrepancy
- Jobs and cost codes added in Prism Accounting are available in Prism Payroll for time coding within [sync window TBD]

### 3f. Links to Prototypes

- GL Mapping Configuration — [TBD]
- Post-Payroll Journal Entry Preview — [TBD]
- Labor Cost by Job Dashboard — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- No Prism Accounting integration (mock payroll run only)

**Beta (Trimble Dimensions)**
- Integration stub: demonstrate that Prism Payroll can read jobs/cost codes from Prism Accounting and that the data model supports sending full labor burden back
- GL account mapping configured
- Prove data model compatibility with Prism Accounting — no architectural blockers to GA

**GA (Generally Available)**
- Full bi-directional integration
- Real-time job/cost code sync from Prism Accounting
- Fully burdened labor cost allocation per job/cost code per run
- GL journal entry auto-generation on payroll finalization
- Automatic posting to Prism Accounting GL
- Reconciliation report

---

# 5. Supporting Information

### 5a. Assumptions

- Prism Accounting is the system of record for jobs, cost codes, and chart of accounts — Prism Payroll consumes this data, it does not maintain it
- The Prism platform team owns the Prism Accounting API and will provide read/write access for this integration
- GL account mapping is a one-time company setup task (done in E1) with occasional updates; it does not happen per-run
- Overhead labor is defined as hours not coded to a specific job (office/admin staff); field hours are always job-coded

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Prism Accounting API (read jobs/cost codes; write GL entries) | Prism platform team | **High** — integration critical path; Beta stub requires this |
| Gross pay by time entry from E4 | E4 team | **High** — needed for job-level labor cost |
| Employer tax amounts from E5 | E5 team | **High** — needed for burden calculation |
| Payroll finalization event from E6 | E6 team | **Medium** — posting trigger |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Prism Accounting API doesn't support write access at Beta | Medium | High | Early API discovery Sprint 0; escalate if write access delayed | Yes — platform team alignment |
| GL posting failure (Prism Accounting rejects entry) | Low | High | Retry queue with admin alert; posting confirmation required before payroll record closes | No |
| Labor burden allocation rounding errors across many time entries | Medium | Medium | Rounding logic documented and tested; reconciliation report detects any penny discrepancy | No |
| Multi-entity complexity not ready at GA | Medium | Medium | Single-entity GA minimum; multi-entity as P1 fast-follow | No |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| GL posting success rate | `gl_post_success` / `gl_post_failed` per run | Operations |
| Job cost sync latency | `job_sync_initiated` → `job_available_in_payroll` | Platform |
| Reconciliation discrepancy rate | `reconciliation_variance_detected` | Compliance |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Does Prism Accounting's current API support write access for GL journal entries? What is the write API format? | Platform team | Sprint 0 |
| OQ-2 | Is job/cost code sync real-time (webhook) or scheduled (polling)? What is the acceptable latency? | Platform team | Sprint 1 |
| OQ-3 | How is overhead labor defined — are there specific job codes that designate "overhead," or is it all unlabeled time? | Product | Sprint 1 |
| OQ-4 | Is multi-entity GL posting required at GA or confirmed as post-GA? | Product | Sprint 1 |
| OQ-5 | Does Prism Accounting's job costing module support cost type classification (direct labor, indirect, overhead)? | Platform team | Sprint 1 |
