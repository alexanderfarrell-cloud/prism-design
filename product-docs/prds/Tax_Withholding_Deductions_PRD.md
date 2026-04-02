# PRD: Prism Construction Payroll — Tax Withholding & Deductions

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Disbursement, Pay Stubs, Tax Filing, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Tax Withholding & Deductions module is the gross-to-net calculation layer of Prism Construction Payroll. It takes gross pay produced by the Earnings engine and applies all statutory withholding (federal income tax, state income tax for all 50 states, local/municipal taxes, FICA), employer tax contributions (FUTA, SUTA, workers' comp), and voluntary deductions (pre-tax and post-tax) to produce each employee's net pay. This module is the operational home of Prism's multi-state jurisdiction intelligence within the payroll run itself — distinguishing it from Employee Management's setup-time jurisdiction detection. At Beta, it covers federal and broad multi-state withholding. At GA, it achieves full 50-state and all-locality accuracy.

### 1b. Problem Statement

Tax withholding for a construction workforce is far more complex than generalist payroll tools assume. An employee who lives in one state, works a job site in another, and triggers a local municipal tax in a third creates a withholding scenario that QuickBooks Payroll and Gusto simply cannot handle correctly without manual workarounds.

Current failure modes:

- **Single-state assumption**: Most SMB tools withhold only for the employee's home state. Work-state withholding obligations for employees crossing state lines are silently missed
- **Reciprocity blind spots**: PA ↔ OH and similar reciprocity agreements suppress work-state withholding — but tools that don't know about reciprocity double-withhold, creating employee frustration and refund issues
- **Local tax gaps**: Philadelphia wage tax, Ohio RITA municipalities, Kentucky county taxes, Pennsylvania school district taxes, and Indiana county taxes are unknown to generic tools. These are not edge cases for Mid-Atlantic and Midwest construction contractors
- **WAOT deduction sequencing**: Pre-tax deductions must be subtracted before taxes are calculated; post-tax after. When gross pay includes WAOT-adjusted earnings, most tools sequence deductions incorrectly
- **Garnishment complexity**: Wage garnishments (child support, creditor orders) have maximum withholding limits under federal and state law that are not enforced by SMB tools

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Zero withholding errors for all covered federal, state, and local tax obligations |
| G2 | Correct gross-to-net deduction sequencing for all pre-tax and post-tax items |
| G3 | Full 50-state withholding accuracy at GA with no calculation errors for covered scenarios |
| G4 | All applicable local/municipal taxes calculated automatically based on employee domicile and job site |
| G5 | Employer-side costs (FICA, FUTA, SUTA, WC) calculated and visible per employee per run |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Withholding calculation errors (wrong state, missed locality, wrong rate) | 0% for covered scenarios | Compliance |
| Gross-to-net deduction sequencing errors | 0% | Quality |
| State income tax withholding coverage at GA | All 50 states | Coverage |
| Local tax jurisdictions covered at GA | All localities where Prism calculates local tax (per Employee Management setup) | Coverage |
| Employer cost (FICA, FUTA, SUTA) calculation accuracy | 100% | Compliance |

### 1e. Out of Scope

- Determining *which* states and localities apply to an employee (done in Employee Management — E2)
- Gross pay calculation (Earnings & Rate Calculation — E4)
- Disbursement / ACH / check generation (E6)
- Tax filing and remittance to agencies (Tax Filing — E8; Tax Remittance — E8b)
- Benefits administration (future)
- Union fringe benefit contributions (Tier 2+)
- Prevailing wage fringe requirements (Tier 2+)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Net pay is correct; no surprise tax notices from missed withholding | "I don't know what Ohio withholding ID I need" | Desktop; weekly cadence |
| **Owner / Exec** | Business owner | See total labor burden including employer taxes before disbursement | No visibility into FUTA/SUTA or WC costs within payroll run | Desktop; episodic |
| **External CPA / Bookkeeper** | Retained accountant | Verify withholding amounts match tax liability reports | Unexplained state/local withholding discrepancies | Desktop; read-only |

### 2b. User Journeys / Workflows

**Primary: Gross-to-Net Calculation During Payroll Run**

```
Earnings engine completes → gross pay per employee available
 │
 ├─ System loads employee withholding elections (from E2):
 │   ├─ Federal W-4 (filing status, allowances, additional withholding)
 │   ├─ State withholding certificate(s) — home state + work state(s)
 │   └─ Local withholding elections (where applicable)
 │
 ├─ Pre-tax deductions applied (reduces taxable income):
 │   ├─ 401(k) / 403(b) contributions
 │   ├─ Health / dental / vision premiums (employee share)
 │   ├─ HSA / FSA contributions (federal pre-tax; state rules vary)
 │   └─ Other pre-tax voluntary deductions
 │
 ├─ Federal income tax withheld (FIT):
 │   └─ Calculated from W-4 elections + taxable gross
 │
 ├─ State income tax withheld per active state:
 │   ├─ Home state withholding applied per state certificate
 │   ├─ Work state withholding applied where no reciprocity
 │   └─ Reciprocity honored: only home state withheld where agreement active
 │
 ├─ Local / municipal tax withheld:
 │   └─ Resident and nonresident local rates per locality (Philadelphia, RITA, etc.)
 │
 ├─ FICA applied:
 │   ├─ Social Security: 6.2% employee + 6.2% employer (up to wage base)
 │   └─ Medicare: 1.45% employee + 1.45% employer (+ 0.9% additional Medicare >$200K)
 │
 ├─ Post-tax deductions applied:
 │   ├─ Roth 401(k) contributions
 │   ├─ Union dues (where applicable — Inferred)
 │   ├─ Wage garnishments (child support, creditor orders) with legal maximums enforced
 │   └─ Other post-tax voluntary deductions
 │
 ├─ Net pay calculated: Gross Pay − all deductions − all withholding
 │
 └─ Employer costs calculated (not deducted from employee — informational):
     ├─ Employer FICA (6.2% SS + 1.45% Medicare)
     ├─ FUTA (6.0% up to $7,000 FUTA wage base, net of SUTA credit)
     ├─ SUTA (state rate × wages up to state wage base)
     └─ Workers' comp estimate (classification rate × gross wages)
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Apply federal income tax withholding per W-4 | P0 — Beta |
| UC-2 | Apply multi-state income tax withholding (home + work states) | P0 — Beta |
| UC-3 | Honor reciprocity agreements in withholding (suppress work-state where applicable) | P0 — Beta |
| UC-4 | Apply local / municipal income tax withholding | P0 — Beta (key localities), GA (all) |
| UC-5 | Calculate employee and employer FICA | P0 — Beta |
| UC-6 | Calculate FUTA and SUTA employer contributions | P0 — Beta |
| UC-7 | Apply pre-tax deductions (401k, health, FSA/HSA) | P0 — Beta |
| UC-8 | Apply post-tax deductions (Roth, garnishments) | P1 — GA |
| UC-9 | Enforce garnishment legal maximums (CCPA limits) | P1 — GA |
| UC-10 | Calculate workers' comp cost estimate per employee | P1 — Beta |
| UC-11 | Apply supplemental wage withholding rate (bonuses, retroactive) | P0 — GA |
| UC-12 | Display employer cost (FICA, FUTA, SUTA, WC) per employee in payroll summary | P0 — Beta |

---

# 3. Requirements

### 3a. Functional Requirements

#### Federal Income Tax Withholding

- The system shall calculate federal income tax withholding for all W-2 employees using the current IRS withholding tables and the employee's W-4 election — **P0**
- The system shall support both the 2020+ W-4 format and the legacy pre-2020 format (employees who have not updated) — **P0**
- The system shall apply the supplemental wage flat rate (22% federal) for bonus, commission, and retroactive pay line items — **P0** (GA)

#### State Income Tax Withholding

- The system shall calculate state income tax withholding for all states where the employee has an active withholding election — **P0** (Beta: broad coverage; GA: all 50 states)
- The system shall withhold for the employee's home state using the state withholding certificate election on file — **P0**
- The system shall withhold for each work state where the employee has an active non-reciprocity work-state election — **P0**
- Where a reciprocity agreement is active between home state and work state, the system shall withhold only for the home state — **P0**
- ⚠️ *Requires human review: state withholding tables and reciprocity data — internal maintenance vs. tax provider (Symmetry/Vertex)*

#### Local / Municipal Tax Withholding

- The system shall calculate and withhold local income tax for all localities identified in the employee's withholding setup (from E2 Employee Management) — **P0**
- Minimum locality coverage at Beta: Philadelphia wage tax, Ohio RITA municipalities, Kentucky county taxes, PA school district taxes — **P0** (Beta)
- GA coverage: all localities where Prism configures and calculates withholding — **P0** (GA)
- The system shall apply resident rates for the employee's home locality and nonresident rates for work localities — **P0**
- ⚠️ *Requires human review: local tax rate data — internal maintenance vs. third-party provider*

#### FICA

- The system shall calculate employee Social Security tax at 6.2% of covered wages up to the annual wage base — **P0**
- The system shall calculate employee Medicare tax at 1.45% of all covered wages — **P0**
- The system shall calculate employer Social Security and Medicare contributions at matching rates — **P0**
- The system shall calculate the 0.9% Additional Medicare Tax for employees with YTD wages exceeding $200,000 — **P1** (GA)

#### FUTA and SUTA

- The system shall calculate FUTA at 6.0% on the first $7,000 of wages, net of allowable SUTA credit — **P0**
- The system shall calculate SUTA at the company's applicable state rate on wages up to each state's wage base — **P0**
- The system shall support different SUTA rates per state for multi-state companies — **P0**

#### Workers' Compensation

- The system shall calculate a workers' comp cost estimate per employee using: WC classification rate × gross wages — **P1** (Beta)
- The system shall support different WC classification codes per employee (configured in E2) — **P1**

#### Pre-Tax Deductions

- The system shall support configuration and processing of pre-tax deductions: 401(k), health insurance, dental, vision, HSA, FSA, and other employer-designated pre-tax items — **P0**
- The system shall subtract pre-tax deductions from gross pay before calculating federal taxable wages — **P0**
- The system shall apply state-specific pre-tax treatment where it differs from federal (e.g., CA, NJ treatment of HSA) — **P1** (GA)

#### Post-Tax Deductions

- The system shall support configuration and processing of post-tax deductions: Roth 401(k), wage garnishments, and other designated post-tax items — **P1**
- The system shall enforce CCPA garnishment limits: no more than 25% of disposable earnings, or earnings exceeding 30× federal minimum wage, whichever is less — **P1** (GA)
- The system shall support multiple simultaneous garnishment orders with priority sequencing — **P1** (GA)

#### Gross-to-Net Sequencing

- The system shall process all deductions and withholding in the following statutory sequence: (1) pre-tax deductions → (2) federal taxable wages → (3) FIT → (4) FICA → (5) state/local tax → (6) post-tax deductions — **P0**
- The system shall never produce a net pay below zero; if deductions exceed gross, the system shall alert admin and flag the employee's record — **P0**

#### Employer Cost Summary

- The system shall display employer-side costs per employee per payroll run: employer FICA, FUTA, SUTA, and WC estimate — **P0** (Beta)
- The system shall display total employer cost (gross pay + all employer obligations) as the "fully burdened" labor cost — **P0** (Beta)

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Accuracy** | All withholding calculations match IRS and state DOL published tables to the cent |
| **Compliance** | State withholding table updates applied within 30 days of regulatory publication — *Inferred* |
| **Security** | SSN never exposed in logs or API responses; withholding amounts accessible to Admin and CPA roles only |
| **Performance** | Gross-to-net calculation for 100 employees completes in <30 seconds — *Inferred* |
| **Auditability** | Full deduction and withholding detail retained per employee per run; accessible 7 years |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| WithholdingElection | employee_id, jurisdiction_type, jurisdiction_code, form_version, election_data, effective_date | From Employee Management (E2) |
| DeductionConfig | employee_id, deduction_type, pre_post_tax, amount_or_pct, effective_date | Configured at employee level |
| GarnishmentOrder | employee_id, order_type, creditor, amount, priority, max_pct | Legal documents |
| TaxWithholdingResult | payroll_run_id, employee_id, jurisdiction, tax_type, taxable_wages, withholding_amount | Output per run |
| EmployerCostSummary | payroll_run_id, employee_id, fica_employer, futa, suta, wc_estimate, total_burden | Output per run |
| TaxJurisdictionRate | jurisdiction_code, tax_type, rate, wage_base, effective_date | From tax provider |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Earnings Engine (E4) | Source of gross pay, pay type breakdown per employee | Sequential — after E4 completes | Internal |
| Employee Management (E2) | Source of withholding elections, deduction configurations, WC codes | On each payroll run | Internal |
| Tax Jurisdiction Provider (Symmetry/Vertex) | State withholding tables, local tax rates, reciprocity rules, SUTA wage bases | Ongoing reference data | **Buy** — critical path |
| Tax Filing Engine (E8) | Receives withholding totals for 941/W-2/state filings | Post-payroll | Internal |
| Prism Accounting (E9) | Receives tax liability amounts for GL journal entries | Post-payroll | Internal |

#### Platform / Infrastructure Constraints

- Tax tables must be versioned: historical calculations must remain reproducible using the rates in effect at the time of the payroll run
- ⚠️ **Requires human review**: Build vs. buy for withholding calculation engine — "headless payroll" provider (Check, Gusto Embedded) vs. in-house implementation using tax provider data

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E5-1: Federal Tax Withholding** | FIT calculation from W-4 elections; supplemental wage rates | G1, G2 | UC-1, UC-11 |
| **E5-2: Multi-State & Local Tax Withholding** | All 50-state income tax; local/municipal taxes; reciprocity application | G1, G3, G4 | UC-2, UC-3, UC-4 |
| **E5-3: FICA & Employer Taxes** | Employee and employer FICA; FUTA; SUTA per state | G1, G5 | UC-5, UC-6 |
| **E5-4: Pre-Tax Deductions** | 401k, health, HSA, FSA; correct sequencing before tax calculation | G1, G2 | UC-7 |
| **E5-5: Post-Tax Deductions & Garnishments** | Roth, garnishment orders, CCPA limits, priority sequencing | G1, G2 | UC-8, UC-9 |
| **E5-6: Workers' Comp & Burden Summary** | WC cost estimate; total labor burden display per employee | G5 | UC-10, UC-12 |

### 3e. High-Level Acceptance Criteria

- Given a PA-resident employee working a job site in OH with an active PA-OH reciprocity agreement, the system withholds only PA state income tax — not OH — without any manual admin override
- Given an employee with a 401(k) pre-tax deduction, federal taxable wages are reduced by the contribution amount before FIT is calculated
- The system does not produce a net pay below zero; when deductions would exceed gross, admin is alerted before payroll is finalized
- Employer FICA, FUTA, SUTA, and WC estimate are displayed per employee in the payroll run summary alongside employee net pay
- State and local tax withholding amounts match published IRS and state tables for all documented test scenarios
- Garnishment deductions do not exceed CCPA maximum (25% of disposable earnings) and the system enforces this limit automatically

### 3f. Links to Prototypes

- Payroll Run Withholding Detail View — [TBD]
- Employer Cost / Labor Burden Summary — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- Federal income tax withholding (simplified — single federal withholding scenario, no state)
- Basic FICA calculation (employee share)
- Sufficient to demonstrate mock payroll run output

**Beta (Trimble Dimensions)**
- Federal income tax withholding (full W-4 driven)
- Multi-state income tax withholding (broad coverage — not full 50-state)
- Reciprocity agreements honored
- Key local taxes: Philadelphia, Ohio RITA, Kentucky county, PA school district
- Employer FICA + FUTA/SUTA
- Pre-tax deductions (basic: 401k, health)
- Workers' comp cost estimate
- Total labor burden display

**GA (Generally Available)**
- All 50-state income tax withholding with zero known errors
- Full local/municipal tax coverage (all localities where Prism configures withholding)
- Post-tax deductions and garnishments with CCPA enforcement
- State-specific pre-tax treatment differences (CA/NJ HSA, etc.)
- Additional Medicare Tax (>$200K)
- Supplemental wage flat-rate withholding

---

# 5. Supporting Information

### 5a. Assumptions

- Employee withholding elections (W-4, state certificates, local elections) are configured in Employee Management (E2) before a payroll run
- The tax jurisdiction provider (Symmetry/Vertex/Avalara) supplies state withholding tables, local rates, and reciprocity data — Prism does not maintain these tables in-house
- Deduction configurations (401k amounts, health premiums) are set up at the employee or company level in payroll settings; this PRD consumes them, it does not define the setup UI

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Tax jurisdiction database vendor selection | Engineering / Legal | **High** — critical path for Beta |
| Withholding elections from Employee Management (E2) | E2 team | **High** — no calculation without elections |
| Gross pay from Earnings Engine (E4) | E4 team | **High** — sequential dependency |
| Build vs. buy decision for calculation engine | Product / Engineering | **High** — architecture direction |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Tax table data from provider is stale or incomplete | Medium | High | SLA with provider for update frequency; automated test suite against known vectors | Yes — vendor SLA |
| State-specific pre-tax treatment differences (CA/NJ HSA) missed at Beta | Medium | Medium | Flag as known Beta limitation; GA test coverage | No |
| Garnishment sequencing conflicts (multiple simultaneous orders) | Low | High | Legal review of priority rules; conservative CCPA limit enforcement | Yes |
| Build vs. buy decision delays delivery | High | High | Decision required Sprint 1; parallel prototyping if feasible | Yes — architecture |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| State withholding coverage breadth | `states_with_withholding_applied` per run | Product |
| Net pay below threshold warnings | `net_pay_near_zero_alert` | Compliance |
| Garnishment processing events | `garnishment_applied` / `garnishment_limit_enforced` | Operations |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Build vs. buy for tax withholding calculation engine? (Check, Gusto Embedded, in-house + Symmetry data) | Product / Engineering | Sprint 1 |
| OQ-2 | Which local tax jurisdictions are in scope for Beta vs. GA? | Product / Tax vendor | Sprint 2 |
| OQ-3 | How are deduction configurations (401k amounts, health premiums) set up — in Employee Management or separate payroll settings? | Product | Sprint 1 |
| OQ-4 | For states that don't recognize federal HSA pre-tax treatment (CA, NJ) — is this in scope for Beta or GA only? | Legal / Compliance | Sprint 2 |
| OQ-5 | What is the company's SUTA rate source? Admin-entered? Or fed from state agency registration? | Product | Sprint 2 |
