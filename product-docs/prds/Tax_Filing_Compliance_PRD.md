# PRD: Prism Construction Payroll — Tax Filing & Compliance Reporting

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Pay Stubs, Tax Remittance & Payment, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Tax Filing & Compliance Reporting module manages the generation, assembly, and submission of all required federal, state, and local payroll tax filings. It covers quarterly and annual filings (Form 941, Form 940, W-2, W-3, 1099-NEC, state income tax returns, SUTA filings, local tax returns), new hire reporting, and year-end employee/contractor distribution. At Beta, the module establishes the filing calendar, identifies all obligations, and builds the framework. At GA, it executes actual filing submissions to all required agencies. Tax *payment* to agencies is addressed in the companion Epic E8b (Tax Remittance & Payment).

### 1b. Problem Statement

For the "Overwhelmed Operator" running payroll without a dedicated HR or tax function, tax filings are the thing most likely to result in catastrophic penalties. The IRS charges penalties for late 941s, the SSA rejects incorrectly formatted W-2 e-files, and states have their own filing schedules that vary by jurisdiction. None of this is tracked or automated in generic SMB tools without significant manual effort.

Current failure modes:

- **Filing deadline blindness**: Most SMB owners don't know all their filing obligations or their deadlines until a notice arrives. A construction contractor operating in 3 states has federal + 3-state + potential local filing calendars to track
- **Form generation gaps**: QuickBooks and Gusto generate W-2s and 941s, but state filings and local filings are manual or unsupported in their standard tiers
- **New hire reporting noncompliance**: New hire reporting to state registries (federally mandated within 20 days of hire) is rarely automated; owners miss it until they receive a noncompliance letter
- **W-2 / 1099-NEC errors**: Manual W-2 preparation from payroll summaries introduces errors; e-file rejections from SSA are common when formatting standards (EFW2) are not met

### 1c. Goals

| # | Goal |
|---|------|
| G1 | All required federal, state, and local tax filings submitted on time with zero missed deadlines attributable to the system |
| G2 | W-2 and 1099-NEC forms generated accurately and distributed to employees/contractors by January 31 |
| G3 | New hire reporting automated for all active payroll states |
| G4 | Admin has clear, proactive visibility into all upcoming filing obligations and deadlines |
| G5 | Zero filing rejections attributable to formatting or data errors from Prism |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Filing deadline compliance rate | 100% — no missed federal/state deadlines | Compliance |
| W-2 / 1099-NEC e-file acceptance rate (SSA/IRS FIRE) | 100% (zero rejections) | Quality |
| New hire reports submitted on time (within 20 days of hire) | 100% for active states | Compliance |
| Admin awareness of upcoming filing obligations | 100% surfaced in filing calendar | Operational |
| IRS/state penalties attributable to Prism filing errors | $0 | Compliance |

### 1e. Out of Scope

- Tax payment / remittance to agencies (Tax Remittance & Payment — E8b)
- Withholding calculation (Tax Withholding & Deductions — E5)
- Employee W-2 delivery to employees (closely related; covered here as part of W-2 generation and year-end distribution)
- Benefits tax reporting (ACA 1094/1095) — future
- Certified payroll / prevailing wage reporting (Tier 2+)
- Union remittance reports (Tier 2+)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Never miss a filing deadline; know what's due before it's overdue | "I don't know what filings I'm responsible for in Ohio" | Desktop; monthly/quarterly; high anxiety |
| **External CPA / Bookkeeper** | Retained accountant | Access filing data to prepare corporate tax returns; verify W-2/1099 accuracy | Waiting for admin to send PDFs; manual reconciliation | Desktop; quarterly/annual |
| **Owner / Exec** | Business owner | Compliance confidence; no surprise IRS letters | No dashboard visibility into tax obligations | Mobile; episodic |

### 2b. User Journeys / Workflows

**Primary: Quarterly 941 Filing (GA)**

```
Quarter ends (March 31, June 30, September 30, December 31)
 │
 ├─ System accumulates: FIT withheld + employee/employer FICA for the quarter
 │
 ├─ System generates Form 941 draft:
 │   ├─ Line 1: Number of employees
 │   ├─ Lines 2-5: Wages, FIT, taxable SS/Medicare wages and taxes
 │   └─ Payment schedule reconciliation (semi-weekly vs. monthly depositor)
 │
 ├─ Admin reviews 941 draft → confirms data accuracy
 │
 ├─ System e-files Form 941 to IRS via EFTPS / authorized e-file channel
 │
 └─ Confirmation received → filing record stored → filing calendar updated
```

**Primary: W-2 Generation and Distribution (Year-End)**

```
Year ends (December 31)
 │
 ├─ System assembles W-2 data per employee from all payroll runs for the year:
 │   ├─ Box 1: Wages, tips, other compensation
 │   ├─ Box 2: Federal income tax withheld
 │   ├─ Boxes 3-6: Social Security and Medicare wages and taxes
 │   ├─ Box 15-17: State wages and state income tax withheld
 │   └─ Additional boxes as applicable (401k, HSA, etc.)
 │
 ├─ Admin reviews W-2 drafts → approves
 │
 ├─ System distributes W-2s to employees:
 │   ├─ Digital delivery (email with secure link) by January 31
 │   └─ [Or] Admin downloads PDF batch for mailing
 │
 └─ System e-files W-2s to SSA in EFW2 format
     └─ Confirmation received → filing record stored
```

**Primary: New Hire Reporting**

```
New employee added in Employee Management (E2)
 │
 ├─ System detects new hire event
 │
 ├─ System generates state new hire report for employee's home state:
 │   └─ Employee name, SSN, address, start date, employer EIN, employer address
 │
 ├─ System submits report to state new hire registry within 20 days of hire date
 │
 └─ Submission confirmation logged → admin dashboard updated
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Display filing calendar with all upcoming obligations and deadlines | P0 — Beta |
| UC-2 | Identify all federal, state, and local filing obligations based on active states | P0 — Beta |
| UC-3 | Generate and e-file Form 941 (quarterly federal) | P0 — GA |
| UC-4 | Generate and e-file Form 940 (annual FUTA) | P0 — GA |
| UC-5 | Generate, distribute, and e-file W-2s (annual, per employee) | P0 — GA |
| UC-6 | Generate, distribute, and e-file 1099-NECs (annual, per 1099 subcontractor) | P0 — GA |
| UC-7 | Generate and submit state income tax filings for all active states | P0 — GA |
| UC-8 | Generate and submit SUTA filings for all active states | P0 — GA |
| UC-9 | Generate and submit local tax filings for applicable localities | P1 — GA |
| UC-10 | Automate new hire reporting to state registries | P0 — GA |
| UC-11 | Surface penalty and deadline alerts proactively | P0 — GA |
| UC-12 | Provide admin with filing status (submitted, pending, accepted, rejected) | P0 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Filing Calendar & Obligation Identification (Beta)

- The system shall identify all tax filing obligations (federal, state, local) based on the company's active payroll states and employee locations — **P0** (Beta)
- The system shall display a filing calendar showing: filing type, due date, filing period, status (upcoming / due / filed / overdue) — **P0** (Beta)
- The system shall alert the admin when a filing deadline is within 30 days and when it is within 7 days — **P0** (Beta)
- The system shall update the filing calendar in real time as new states are added to the company's payroll footprint — **P0** (Beta)

#### Federal Filings — Form 941 (GA)

- The system shall calculate and generate Form 941 for each quarter, populated from payroll run data: wages, FIT withheld, Social Security wages and taxes, Medicare wages and taxes — **P0** (GA)
- The system shall reconcile the 941 against the company's deposit schedule (semi-weekly or monthly depositor) — **P0** (GA)
- The system shall e-file Form 941 to IRS via authorized e-file channel — **P0** (GA) — ⚠️ *Requires human review: IRS Authorized e-file Provider approval process*
- Admin shall review and approve the 941 before e-filing — **P0** (GA)

#### Federal Filings — Form 940 (GA)

- The system shall generate Form 940 (annual FUTA return) populated from FUTA-eligible wage data for the year — **P0** (GA)
- The system shall e-file Form 940 to IRS — **P0** (GA)

#### W-2 Generation, Distribution, and E-File (GA)

- The system shall generate a W-2 for every W-2 employee who received wages during the calendar year — **P0** (GA)
- W-2 data shall be populated from accumulated payroll run data: all wage types, all withholding amounts, deduction codes — **P0** (GA)
- The system shall distribute W-2s to employees digitally (email with secure link) by January 31 — **P0** (GA)
- The system shall generate PDF W-2s for admin download for employees preferring or requiring paper — **P1** (GA)
- The system shall e-file W-2s to SSA in EFW2 format by January 31 — **P0** (GA)
- The system shall e-file the W-3 transmittal with the W-2 batch — **P0** (GA)
- ⚠️ *Requires human review: SSA EFW2 format validation and e-Wage filer registration*

#### 1099-NEC Generation, Distribution, and E-File (GA)

- The system shall track all payments to 1099 subcontractors throughout the year from the payroll run record — **P0** (GA)
- The system shall generate a 1099-NEC for every subcontractor who received $600 or more in payments during the calendar year — **P0** (GA)
- The system shall distribute 1099-NECs to subcontractors digitally by January 31 — **P0** (GA)
- The system shall e-file 1099-NECs to IRS via FIRE (Filing Information Returns Electronically) system — **P0** (GA) — ⚠️ *Requires human review: FIRE system enrollment and e-file provider status*

#### State Income Tax Filings (GA)

- The system shall generate and submit state income tax withholding returns for all states where the company has a withholding obligation, per each state's schedule (monthly, quarterly, or annual) — **P0** (GA)
- The system shall maintain state-specific form formats and submission methods — **P0** (GA) — *Inferred: tax filing provider likely required for state submissions*

#### SUTA Filings (GA)

- The system shall generate and submit state unemployment (SUTA) wage reports for all active payroll states, per state schedule — **P0** (GA)

#### Local Tax Filings (GA)

- The system shall generate and submit local tax filings for all localities where Prism calculates and withholds local income tax — **P1** (GA)

#### New Hire Reporting (GA)

- The system shall automatically generate a new hire report when a new employee is added in Employee Management (E2) — **P0** (GA)
- The report shall be submitted to the appropriate state new hire registry within 20 days of the employee's hire date — **P0** (GA)
- The system shall support new hire reporting for all 50 states — **P0** (GA)
- New hire reports shall include: employee name, SSN, address, start date, employer EIN, employer address — **P0** (GA)

#### Filing Status and Audit

- The system shall maintain a filing record for every submission: filing type, period, submission date, confirmation number, status (submitted/accepted/rejected) — **P0** (GA)
- The system shall surface rejected filings to the admin with the rejection reason and recommended correction — **P0** (GA)

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Compliance** | All filings meet current IRS, SSA, and state agency format requirements |
| **Security** | SSN encrypted in all filing submissions; filing data access restricted to Admin and CPA roles |
| **Reliability** | Filing submissions available 99.9% uptime; no missed deadlines from system unavailability |
| **Audit** | Complete filing history retained: all submissions, confirmations, and rejections, 7 years |
| **Accuracy** | Zero filing rejections attributable to Prism data or format errors |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| FilingObligation | company_id, filing_type, jurisdiction, frequency, due_date, status | Per filing calendar |
| TaxFilingRecord | obligation_id, period, submission_date, confirmation_number, status, rejection_reason | Per submission |
| W2Record | employee_id, tax_year, box_values (1-20), generated_at, distributed_at | Annual per employee |
| Form1099NEC | contractor_id, tax_year, total_payments, generated_at, efiled_at | Annual per contractor |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Tax Withholding Engine (E5) | Source of all withholding and employer tax data | Per payroll run accumulation | Internal |
| IRS e-file systems (EFTPS, FIRE) | 941, 940, 1099-NEC e-file submission | Filing deadlines | **External — requires IRS authorization** |
| SSA EFW2 e-file | W-2 / W-3 e-file submission | Annual by Jan 31 | **External — requires SSA enrollment** |
| State e-file portals / ACH | State income tax and SUTA filing submission | Per state schedule | **External — 50-state integration** |
| State new hire registries | New hire report submission | On employee add event | **External — 50-state** |
| Tax Filing Service Provider | May aggregate federal and state filing channels | Ongoing | **Buy — recommended** |

#### Platform / Infrastructure Constraints

- Tax filing data must be retained for 7 years (IRS record retention requirements)
- ⚠️ **Requires human review**: Build vs. buy for state filing submissions — a tax filing service (Symmetry, Vertex, Atrix, or payroll partner) likely handles state and local filings more efficiently than in-house builds for all 50 states

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E8-1: Filing Calendar & Obligation Management** | Identify all obligations; display calendar with deadlines; proactive alerts | G4 | UC-1, UC-2, UC-11 |
| **E8-2: Federal Form 941 & 940** | Generate, review, and e-file quarterly and annual federal returns | G1, G5 | UC-3, UC-4 |
| **E8-3: W-2 Generation & Year-End Distribution** | W-2 generation, employee digital delivery, SSA e-file (EFW2) | G2, G5 | UC-5 |
| **E8-4: 1099-NEC Generation & Distribution** | 1099 tracking, generation, contractor delivery, IRS FIRE e-file | G2, G5 | UC-6 |
| **E8-5: State & Local Tax Filings** | All-state income tax and SUTA filings; local filings | G1, G5 | UC-7, UC-8, UC-9 |
| **E8-6: New Hire Reporting** | Automated new hire report submission to all 50-state registries within 20 days | G3 | UC-10 |
| **E8-7: Filing Status & Audit Trail** | Filing confirmation tracking; rejection surfacing; 7-year history | G1, G5 | UC-12 |

### 3e. High-Level Acceptance Criteria

- A Form 941 is generated for every completed quarter without admin manual data entry, populated accurately from accumulated payroll run data
- W-2s are generated for all employees, distributed digitally to employees, and e-filed to SSA in EFW2 format by January 31
- A new hire report is automatically submitted to the correct state registry within 20 days of the employee's hire date for all active payroll states
- Admin can see all upcoming filing obligations and deadlines in a single filing calendar view; deadlines within 30 days are highlighted
- A rejected e-file surfaces to the admin with the rejection reason and a specific recommended correction — not just an error code
- The filing calendar updates immediately when a new state is added to the company's payroll footprint (new employee in a new state)

### 3f. Links to Prototypes

- Filing Calendar Dashboard — [TBD]
- W-2 Distribution Flow — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Beta (Trimble Dimensions)**
- Filing obligation identification (what do we owe, in which states)
- Filing calendar display with upcoming deadlines
- Proactive deadline alerts
- Framework for 941 generation (no actual submission)
- No W-2 or 1099-NEC generation at Beta

**GA (Generally Available)**
- Form 941 generation and e-file (all active quarters)
- Form 940 generation and e-file (annual)
- W-2 generation, digital distribution, and SSA e-file
- 1099-NEC generation, digital distribution, and IRS FIRE e-file
- All-state income tax and SUTA filings
- Local tax filings (all applicable localities)
- New hire reporting (all 50 states, automated)
- Filing status tracking and rejection handling

---

# 5. Supporting Information

### 5a. Assumptions

- A tax filing service provider (Symmetry, Vertex, Atrix, or payroll partner) handles state and local filing channel integration; Prism does not build 50-state filing integrations in-house
- IRS e-file provider authorization and SSA EFW2 enrollment are completed before GA
- Employee SSNs are verified and stored securely in Employee Management (E2) — no SSN re-collection at filing time
- 1099-NEC payment tracking relies on payroll run records; payments to subcontractors outside the payroll system are not in scope

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Tax filing service provider selection | Engineering / Legal | **High** — GA critical path |
| IRS e-file Provider authorization | Legal / Finance | **High** — multi-month process |
| SSA EFW2 / e-Wage filer enrollment | Engineering | **Medium** |
| Withholding data accuracy from E5 | E5 team | **High** — filing accuracy depends on it |
| State new hire registry API access | Engineering | **Medium** — 50-state variable |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| IRS e-file authorization delayed | Medium | High | Start authorization process at project kickoff; not a last-minute step | Yes |
| State filing channel integration complexity (50 states) | High | High | Use tax filing service to abstract state channels | Yes — vendor selection |
| W-2 EFW2 format rejection from SSA | Low | High | Pre-submission validation against SSA spec; test filings before Jan 31 production run | Yes |
| New hire registry APIs vary significantly by state | High | Medium | Tax filing provider likely covers this; validate coverage | Yes |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Filing on-time rate | `filing_submitted_before_deadline` / `filing_submitted_late` | Operations |
| Filing rejection rate | `filing_rejected` (type, jurisdiction) | Compliance |
| New hire report submission on-time rate | `new_hire_report_submitted` (days_since_hire) | Compliance |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Which tax filing service handles state/local filing channel integration? (Symmetry, Atrix, ADP Filing) | Engineering / Legal | Sprint 1 |
| OQ-2 | Has IRS e-file Provider authorization been initiated? What is the lead time? | Legal / Finance | Sprint 0 |
| OQ-3 | Are local tax filings (e.g., Philadelphia BIRT, Ohio RITA) handled by the tax filing service, or require custom integration? | Engineering / Legal | Sprint 2 |
| OQ-4 | Does the system file on the company's behalf (Reporting Agent) or generate forms for admin to submit manually? | Product / Legal | Sprint 1 |
| OQ-5 | For state SUTA filings: does the company enter their own SUTA rate, or is this pulled from state agency registration? | Product | Sprint 2 |
