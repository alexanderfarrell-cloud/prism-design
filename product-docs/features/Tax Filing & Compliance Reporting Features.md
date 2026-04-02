# Prism Construction Payroll — Tax Filing & Compliance Reporting
## Feature Set for Epic 681940 (E8)

> **Source:** Tax Filing & Compliance Reporting PRD — the module that generates, assembles, and submits all required federal, state, and local payroll tax filings. Covers quarterly and annual filings (Form 941, Form 940, W-2, W-3, 1099-NEC, state income tax returns, SUTA filings, local tax returns), new hire reporting, and year-end distribution. Tax *payment* to agencies is addressed in companion Epic E8b (Tax Remittance & Payment).

---

## Feature Set Overview

| # | ADO ID | Feature Title | One-Line Summary |
|---|--------|--------------|-----------------|
| E8-1 | 683333 | Filing Calendar & Obligation Management | Identify all filing obligations and display a proactive deadline calendar with alerts for all active payroll states |
| E8-2 | 683334 | Federal Form 941 & 940 | Generate, admin-review, and e-file quarterly Form 941 and annual Form 940 to IRS |
| E8-3 | 683335 | W-2 Generation & Year-End Distribution | Generate W-2s for all employees, distribute digitally by January 31, and e-file to SSA in EFW2 format |
| E8-4 | 683336 | 1099-NEC Generation & Distribution | Track subcontractor payments, generate 1099-NECs, distribute digitally, and e-file to IRS via FIRE |
| E8-5 | 683337 | State & Local Tax Filings | Generate and submit state income tax and SUTA filings for all active states, plus local tax filings for applicable localities |
| E8-6 | 683338 | New Hire Reporting | Automatically submit new hire reports to the correct state registry within 20 days of hire for all active payroll states |
| E8-7 | 683339 | Filing Status & Audit Trail | Track every filing submission with confirmation, status, rejection surfacing, and 7-year history |

---

## E8-1 — Filing Calendar & Obligation Management

### Goal / Outcome
The system automatically identifies every payroll tax filing obligation the company carries — federal, state, and local — based on its active payroll states and employee locations, and displays all obligations in a single filing calendar with due dates, filing periods, and statuses. Admins receive proactive alerts 30 days and 7 days before each deadline. The calendar updates in real time as new states are added. The "Overwhelmed Operator" no longer discovers filing obligations from penalty notices — they see everything coming, in one place, before it's overdue.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs to know what filings are due, in which states, before deadlines arrive
- **Owner / Exec** — wants compliance confidence; no surprise IRS or state letters
- **External CPA / Bookkeeper** — needs visibility into upcoming filing obligations to plan quarterly work

### Business & PRD Drivers
- G4 — Admin has clear, proactive visibility into all upcoming filing obligations and deadlines
- UC-1 — Display filing calendar with all upcoming obligations and deadlines (P0 — Beta)
- UC-2 — Identify all federal, state, and local filing obligations based on active states (P0 — Beta)
- UC-11 — Surface penalty and deadline alerts proactively (P0 — GA)
- PRD §3a — Filing Calendar & Obligation Identification requirements (all P0, Beta)
- PRD §1b — Problem: "Filing deadline blindness — most SMB owners don't know all their filing obligations or their deadlines"

### Problem / Rationale
A construction contractor operating in 3 states has federal + 3-state + potential local filing calendars to track. Federal 941s are due April 30, July 31, October 31, and January 31. Each state has its own withholding return schedule (monthly, quarterly, or annual). SUTA filings have their own state-specific schedules. New hire reporting must be submitted within 20 days of hire. None of this is self-evident to a small business owner — and generic SMB tools provide no consolidated view. Filing blindness is the leading cause of payroll compliance penalties for SMBs, and it is entirely preventable with a well-built filing calendar.

### In Scope
- Identification of all tax filing obligations (federal, state, local) based on the company's active payroll states and employee locations
- Filing calendar view: filing type, due date, filing period, status (upcoming / due / filed / overdue)
- Proactive deadline alerts: 30-day warning and 7-day warning per obligation
- Real-time calendar updates when a new state is added to the company's payroll footprint (new employee in a new state)
- Filing calendar visible to PR Admin, Owner/Exec, and CPA roles
- Coverage: all federal obligations (941, 940, W-2, W-3, 1099-NEC); all active-state income tax and SUTA filings; local obligations for configured jurisdictions
- Beta scope: identification and calendar display only — no actual filing submission at Beta

### Out of Scope (for this feature)
- Actual form generation and e-filing (E8-2 through E8-7)
- Tax payment / deposit scheduling (E8b — Tax Remittance & Payment)
- Withholding calculation (E5)
- Penalty calculation or interest accrual on missed filings

### Example Super Stories
- As a PR Admin, I want to see every federal, state, and local filing deadline I owe on a single calendar so that I never miss a due date because I didn't know about the obligation.
- As a PR Admin, I want to receive an alert 30 days before Form 941 is due so that I have time to review data and prepare before the deadline.
- As an Owner, I want the filing calendar to automatically add Ohio state filings when I hire my first Ohio employee, so that I don't need to manually research and configure new state obligations.
- As an External CPA, I want to see the full filing calendar for my client so that I can proactively schedule my quarterly review work before filing deadlines.

### Acceptance Criteria Themes
- All federal, state, and local filing obligations are identified automatically from the company's active payroll footprint — admin does not manually add obligations
- The filing calendar displays: filing type, jurisdiction, due date, filing period, and status (upcoming / due / filed / overdue) for every obligation
- Deadline alerts are surfaced to the admin dashboard at 30 days and 7 days before each filing due date
- When a new state is added (new employee in a new state), the associated state income tax and SUTA filing obligations appear in the calendar before the next payroll run in that state
- The filing calendar reflects completed filings as "filed" with the submission date and confirmation reference
- Overdue obligations are highlighted distinctly and escalated in the admin alert feed

### Dependencies & Risks
- **Upstream:** Employee Management (E2) must deliver active state and locality jurisdiction data per employee — the source of the filing obligation footprint
- **Risk:** State filing schedule data (monthly vs. quarterly vs. annual depositor thresholds) varies by state and changes periodically — a tax filing service provider or maintained schedule database is required
- **Risk:** Local filing obligations are highly fragmented — obligation identification for local jurisdictions requires a comprehensive local tax jurisdiction database

### Success Metrics / KPIs
- 100% of federal and active-state filing obligations surfaced in the filing calendar — zero missed obligations attributable to the system
- Admin awareness of upcoming deadlines: 100% of obligations with due dates within 30 days are surfaced in the admin dashboard
- Filing calendar update latency: new state obligations appear within 1 payroll run of the triggering employee add event

### Assumptions
- Filing schedule data (federal and state) is sourced from a tax filing service provider (Symmetry, Atrix, ADP Filing) — Prism does not maintain in-house schedule tables for all 50 states
- Local filing obligation identification at Beta is limited to jurisdictions configured in E2; full local coverage at GA

---

## E8-2 — Federal Form 941 & 940

### Goal / Outcome
At the end of each quarter, the system automatically calculates and generates Form 941 populated from accumulated payroll run data — wages, FIT withheld, Social Security and Medicare wages and taxes — reconciles against the company's deposit schedule, and e-files to IRS following admin review and approval. Annually, the system generates and e-files Form 940 (FUTA return). Admins never manually compute or transcribe 941 or 940 data from payroll records. The most common federal filing — the 941 — is generated, reviewed, and submitted without manual data entry or spreadsheet work.

### Primary Personas
- **PR Admin** — reviews the 941 draft and approves for e-filing; expects zero manual data entry
- **External CPA / Bookkeeper** — verifies 941 data against withholding records before submission
- **Owner / Exec** — needs confirmation that federal quarterly filings are submitted on time

### Business & PRD Drivers
- G1 — All required federal filings submitted on time with zero missed deadlines attributable to the system
- G5 — Zero filing rejections attributable to formatting or data errors from Prism
- UC-3 — Generate and e-file Form 941 (P0 — GA)
- UC-4 — Generate and e-file Form 940 (P0 — GA)
- PRD §3a — Federal Filings — Form 941 and Form 940 requirements
- PRD §1b — "Filing deadline blindness" and "Form generation gaps" as named failure modes

### Problem / Rationale
The Form 941 is one of the most penalty-prone federal filings for SMBs. The IRS charges a 5% failure-to-file penalty per month (up to 25% of unpaid tax), plus a separate failure-to-deposit penalty schedule (2–15% depending on delay). For a construction company with $50K in quarterly employment taxes, a single missed 941 with late deposits can generate $7,500–$15,000 in penalties. Generic SMB tools require the admin to manually compile payroll totals, manually complete the form, and manually submit — each handoff is a failure point. Prism eliminates all three by generating the 941 from accumulated run data and e-filing directly.

### In Scope
- Form 941 generation for each quarter populated from payroll run data: Line 1 (employee count), Lines 2–5 (wages, FIT withheld, taxable SS/Medicare wages and taxes)
- Reconciliation of 941 against the company's deposit schedule (semi-weekly depositor or monthly depositor), with Schedule B populated for semi-weekly depositors
- Admin review-and-approve workflow before e-filing
- E-file Form 941 to IRS via authorized e-file channel (EFTPS or IRS Authorized e-file Provider)
- E-file confirmation received and stored; filing calendar updated to "filed" status
- Form 940 (annual FUTA return) generation from FUTA-eligible wage data for the year
- E-file Form 940 to IRS
- ⚠️ *Requires human review: IRS Authorized e-file Provider approval process (multi-month lead time — must be initiated at project kickoff)*

### Out of Scope (for this feature)
- Federal tax deposit / payment via EFTPS (E8b — Tax Remittance & Payment)
- State income tax filings (E8-5)
- W-2 and 1099-NEC (E8-3, E8-4)
- FICA calculation (E5-3 — this feature consumes the output)
- Beta: framework only — no actual 941 submission at Beta

### Example Super Stories
- As a PR Admin, I want the system to generate a pre-populated Form 941 at the end of each quarter so that I don't have to manually compile payroll totals from multiple runs.
- As a PR Admin, I want to review the 941 draft and approve it before it's submitted, so that I have a final check before the IRS receives the filing.
- As an Owner, I want the system to e-file our 941 automatically before the deadline so that I never receive an IRS penalty notice for a late quarterly return.
- As an External CPA, I want to see the 941 line-item data before submission so that I can verify it matches our withholding liability accounts.

### Acceptance Criteria Themes
- Form 941 is generated automatically at quarter-end with all required lines populated from accumulated payroll run data — no manual data entry by admin
- The 941 reconciles against the deposit schedule (semi-weekly or monthly) with Schedule B populated for semi-weekly depositors
- Admin reviews the 941 draft and explicitly approves before e-filing — the system does not auto-submit without approval
- E-file confirmation is received from IRS, stored against the filing record, and the filing calendar status updates to "filed"
- Form 940 is generated annually and e-filed to IRS
- If the IRS rejects the e-file, the rejection reason is surfaced to admin with a specific recommended correction

### Dependencies & Risks
- **Upstream:** Tax Withholding Engine (E5) — all FIT, Social Security, and Medicare withholding data per payroll run accumulates here; 941 accuracy depends entirely on E5 accuracy
- **Critical dependency:** IRS Authorized e-file Provider authorization — multi-month process; must begin at project kickoff (PRD §5b: High risk, critical path)
- **Risk:** Deposit schedule classification (semi-weekly vs. monthly) must be maintained per company; incorrect classification produces an incorrect Schedule B — mitigation: admin-configured with system validation

### Success Metrics / KPIs
- 100% of 941s filed by the quarterly deadline (April 30, July 31, October 31, January 31)
- 0% 941 e-file rejection rate attributable to Prism data or format errors
- 0% IRS penalties for late or incorrect 941 filing attributable to Prism

### Assumptions
- IRS Authorized e-file Provider authorization is completed before GA
- The company's depositor classification (monthly vs. semi-weekly) is configured by admin in Company Setup (E1) and maintained accurately

---

## E8-3 — W-2 Generation & Year-End Distribution

### Goal / Outcome
At year-end, the system generates a W-2 for every W-2 employee who received wages during the calendar year, populating all boxes from accumulated payroll run data — wages, FIT withheld, FICA, state wages and withholding, deduction codes. W-2s are distributed to employees digitally (email with secure link) by January 31 and e-filed to SSA in EFW2 format with the W-3 transmittal. Admins do not manually compile W-2 data, manually prepare forms, or manually submit to SSA. The SSA's most common rejection reason — EFW2 format errors — is eliminated by Prism's pre-submission validation.

### Primary Personas
- **PR Admin** — reviews W-2 drafts, approves, and triggers distribution; expects zero manual data compilation
- **Field Worker** — receives their W-2 digitally by January 31 without having to call the office
- **External CPA / Bookkeeper** — verifies W-2 accuracy for corporate tax return preparation

### Business & PRD Drivers
- G2 — W-2 and 1099-NEC forms generated accurately and distributed to employees/contractors by January 31
- G5 — Zero filing rejections attributable to formatting or data errors from Prism
- UC-5 — Generate, distribute, and e-file W-2s (P0 — GA)
- PRD §3a — W-2 Generation, Distribution, and E-File requirements
- PRD §1b — "W-2 / 1099-NEC errors: manual W-2 preparation from payroll summaries introduces errors; e-file rejections from SSA are common when EFW2 formatting standards are not met"

### Problem / Rationale
W-2 preparation is the highest-stakes year-end task for a small business payroll admin. The SSA's EFW2 format is unforgiving: incorrect field lengths, wrong control totals, or non-standard character encoding cause the entire batch to be rejected — often close to the January 31 deadline when there is little time to correct and resubmit. Beyond formatting, the data accuracy problem is significant: manual W-2 preparation from payroll summary spreadsheets routinely produces Box 1/Box 3 discrepancies, incorrect state wage allocations for multi-state employees, and missing deduction code entries (Box 12). Prism eliminates both the format problem (pre-validated EFW2 output) and the data problem (accumulation directly from run records).

### In Scope
- W-2 generation for every W-2 employee with wages in the calendar year
- All W-2 boxes populated from accumulated payroll run data: Box 1 (wages, tips, other compensation), Box 2 (FIT withheld), Boxes 3–6 (SS and Medicare wages and taxes), Box 12 (401k, HSA codes), Boxes 15–17 (state wages and state income tax withheld per state)
- Admin review of W-2 drafts before distribution and e-filing
- Digital delivery to employees: email with secure link by January 31
- PDF W-2 batch download for admin for employees requiring paper (P1)
- E-file W-2s to SSA in EFW2 format by January 31
- E-file W-3 transmittal with the W-2 batch
- Pre-submission EFW2 format validation
- ⚠️ *Requires human review: SSA EFW2 format validation and e-Wage filer registration*

### Out of Scope (for this feature)
- 1099-NEC generation (E8-4)
- Employee Self-Service Portal for accessing historical W-2s (future)
- ACA 1094/1095 reporting (future)
- W-2c amended W-2 generation (future)

### Example Super Stories
- As a PR Admin, I want the system to generate W-2 drafts for all employees automatically at year-end so that I don't manually compile wage and withholding totals from payroll records.
- As a PR Admin, I want to review all W-2s in a single review screen and approve the batch before they are distributed and filed.
- As a Field Worker, I want to receive my W-2 digitally by January 31 via a secure email link so that I can file my taxes without calling the office.
- As an External CPA, I want access to finalized W-2 data by January 31 so that I can prepare the corporate tax return without waiting for the client to send PDFs.

### Acceptance Criteria Themes
- A W-2 is generated for every employee who received wages during the calendar year — no employees missed, no manual data entry required
- W-2 Box 1 reflects total wages minus pre-tax deductions; Box 3 SS wages, Box 5 Medicare wages, and Box 12 deduction codes are all correctly populated from run data
- Multi-state employees have correct per-state Box 15–17 entries for each state where wages were earned and tax withheld
- Digital delivery is completed by January 31: all employees receive a secure email link to their W-2
- The SSA EFW2 e-file is submitted by January 31 with the W-3 transmittal; pre-submission validation catches format errors before the SSA sees the file
- E-file acceptance confirmation from SSA is stored against the filing record; any rejection is surfaced to admin with the specific field-level error and recommended correction

### Dependencies & Risks
- **Upstream:** Tax Withholding Engine (E5) — all FIT, FICA, and state withholding data per employee per run; W-2 accuracy depends on E5 accuracy across all 52 weeks
- **Upstream:** Pre-Tax Deduction Processing (E5-4) — Box 12 deduction codes and amounts depend on correct deduction type flags
- **Critical dependency:** SSA EFW2 / e-Wage filer enrollment — must be completed before first GA W-2 run (PRD §5b: Medium risk)
- **Risk:** Multi-state W-2 Box 15–17 allocation for employees who worked in multiple states requires per-state wage tracking throughout the year — not just at year-end

### Success Metrics / KPIs
- 100% of W-2s distributed to employees by January 31
- 100% SSA EFW2 e-file acceptance rate — 0% rejection attributable to Prism format or data errors
- 0% W-2 data errors (Box discrepancies between W-2 totals and payroll run accumulations)

### Assumptions
- Employee SSNs are verified and stored in Employee Management (E2) — no SSN re-collection at year-end
- State wage allocation for multi-state employees is tracked at the run level throughout the year (from E5-2), not reconstructed at year-end

---

## E8-4 — 1099-NEC Generation & Distribution

### Goal / Outcome
Throughout the year, the system tracks all payments to 1099 subcontractors from payroll run records. At year-end, it generates a 1099-NEC for every subcontractor who received $600 or more in payments, distributes forms digitally to contractors by January 31, and e-files to IRS via the FIRE system. Admins do not manually track contractor payment totals, manually prepare 1099 forms, or manually submit to IRS. The $600 threshold is enforced automatically — no contractor who should receive a 1099-NEC is missed, and no 1099-NEC is generated for a contractor who did not meet the threshold.

### Primary Personas
- **PR Admin** — reviews 1099-NEC drafts and approves; expects zero manual payment tracking
- **1099 Subcontractor** — receives their 1099-NEC digitally by January 31
- **External CPA / Bookkeeper** — verifies 1099-NEC accuracy for corporate tax return preparation

### Business & PRD Drivers
- G2 — W-2 and 1099-NEC forms generated accurately and distributed to employees/contractors by January 31
- G5 — Zero filing rejections attributable to formatting or data errors from Prism
- UC-6 — Generate, distribute, and e-file 1099-NECs (P0 — GA)
- PRD §3a — 1099-NEC Generation, Distribution, and E-File requirements
- PRD §1b — "W-2 / 1099-NEC errors" as a named failure mode

### Problem / Rationale
Construction contractors regularly use 1099 subcontractors — specialty trades, equipment operators, and independent project workers. IRS reporting requirements mandate a 1099-NEC for every subcontractor paid $600 or more in a calendar year. Failure to file triggers penalties ($60–$310 per form, increasing with delay). The data problem: many SMBs track subcontractor payments in separate spreadsheets or accounting systems disconnected from payroll — producing missed 1099s, incorrect payment totals, and last-minute scrambles in January. Prism accumulates subcontractor payments directly from the payroll run record, eliminating the reconciliation problem.

### In Scope
- Year-round tracking of all payments to 1099 subcontractors from payroll run records
- Automatic 1099-NEC generation at year-end for every subcontractor who received $600 or more in total payments during the calendar year
- $600 threshold enforced automatically — system identifies eligible contractors without admin review of individual payment totals
- Admin review of 1099-NEC drafts before distribution and e-filing
- Digital distribution to subcontractors: email with secure link by January 31
- E-file 1099-NECs to IRS via FIRE (Filing Information Returns Electronically) system
- ⚠️ *Requires human review: FIRE system enrollment and e-file provider status (separate from W-2 SSA enrollment)*

### Out of Scope (for this feature)
- W-2 generation (E8-3)
- Payments to subcontractors made outside the payroll system (out of scope per PRD §5a)
- 1099-MISC, 1099-K, or other 1099 form types (future)
- State 1099 filing requirements (future)
- TIN verification (future)

### Example Super Stories
- As a PR Admin, I want the system to automatically track all payments to our 1099 subcontractors throughout the year so that I don't need a separate spreadsheet to total up what we paid each contractor.
- As a PR Admin, I want 1099-NECs automatically generated for every subcontractor who hit the $600 threshold so that I don't manually identify which contractors qualify.
- As a 1099 Subcontractor, I want to receive my 1099-NEC digitally by January 31 via a secure email link so that I can file my taxes on time without chasing the GC for paperwork.

### Acceptance Criteria Themes
- All payments to 1099 subcontractors are accumulated from payroll run records throughout the year — no separate payment tracking required
- A 1099-NEC is generated for every subcontractor whose total calendar-year payments equal or exceed $600 — the threshold is enforced automatically without admin review of individual contractor totals
- No 1099-NEC is generated for subcontractors paid less than $600 in the calendar year
- Digital delivery is completed by January 31; all qualifying contractors receive a secure email link to their 1099-NEC
- IRS FIRE e-file is submitted by January 31; acceptance confirmation is stored against the filing record
- Rejection from FIRE is surfaced to admin with the specific error and recommended correction

### Dependencies & Risks
- **Upstream:** Payroll run records must flag subcontractor payments distinctly from W-2 employee wages — the data model must support both worker types in the same run
- **Critical dependency:** IRS FIRE system enrollment — separate from the IRS Authorized e-file Provider process for 941/940 (PRD §5b: High risk)
- **Risk:** 1099 payment tracking relies on payroll run records; payments to subcontractors made outside the payroll system (e.g., direct checks, ACH outside payroll) are not captured — mitigation: documented as out of scope

### Success Metrics / KPIs
- 100% of qualifying 1099-NEC forms distributed by January 31
- 100% IRS FIRE e-file acceptance rate — 0% rejection attributable to Prism format or data errors
- 0% missed 1099-NECs for subcontractors who met the $600 threshold

### Assumptions
- 1099-NEC payment tracking relies entirely on payroll run records; subcontractor payments made outside the payroll system are not in scope
- Subcontractor tax ID (EIN or SSN) is collected and stored in Employee Management (E2) as part of contractor onboarding

---

## E8-5 — State & Local Tax Filings

### Goal / Outcome
For every state where the company has a withholding obligation, the system generates and submits state income tax withholding returns on the state's required schedule (monthly, quarterly, or annual). For all active payroll states, it generates and submits SUTA wage reports per state schedule. For applicable localities, it generates and submits local tax filings. Admins do not manually prepare or submit any state or local returns. The 50-state compliance gap — one of the most common failure points for multi-state construction contractors — is closed by Prism's automated state and local filing capability.

### Primary Personas
- **PR Admin** — relies on system to file all state and local returns on time without manual preparation
- **Owner / Exec** — currently exposed to multi-state penalty risk from missed or late state filings
- **External CPA / Bookkeeper** — verifies state filing records and amounts against the company's state tax liability

### Business & PRD Drivers
- G1 — All required federal, state, and local tax filings submitted on time with zero missed deadlines
- G5 — Zero filing rejections attributable to formatting or data errors from Prism
- UC-7 — Generate and submit state income tax filings for all active states (P0 — GA)
- UC-8 — Generate and submit SUTA filings for all active states (P0 — GA)
- UC-9 — Generate and submit local tax filings for applicable localities (P1 — GA)
- PRD §3a — State Income Tax Filings, SUTA Filings, and Local Tax Filings requirements
- PRD §1b — "Form generation gaps: state filings and local filings are manual or unsupported in standard tiers"

### Problem / Rationale
A construction company operating in PA, OH, and MD has three state income tax withholding returns, three SUTA wage reports, and potentially multiple local returns (Philadelphia wage tax, Ohio RITA municipalities) — all on different schedules with different electronic submission requirements. Generic SMB tools in their standard tiers either don't support multi-state filing at all or require the admin to manually prepare and submit state returns from payroll data exports. The probability of a missed state filing deadline or an incorrectly formatted submission increases linearly with the number of states. Prism's use of a tax filing service provider abstracts the 50-state channel complexity into a single integration.

### In Scope
- State income tax withholding returns for all states where the company has a withholding obligation, per state's required schedule (monthly, quarterly, or annual)
- SUTA wage reports for all active payroll states, per state schedule
- Local tax filings for all localities where Prism calculates and withholds local income tax (P1 — GA)
- State-specific form formats and electronic submission methods (via tax filing service provider)
- Filing calendar integration: all state and local filing due dates appear in the E8-1 calendar
- ⚠️ *Requires human review: Tax filing service provider selection (Symmetry, Vertex, Atrix, ADP Filing) — vendor selection is on GA critical path*

### Out of Scope (for this feature)
- State tax payments / deposits (E8b — Tax Remittance & Payment)
- State income tax withholding calculation (E5-2)
- SUTA rate calculation (E5-3)
- Federal filings (E8-2)
- W-2 and 1099-NEC state filing copies (covered in E8-3 and E8-4)

### Example Super Stories
- As a PR Admin, I want the system to automatically file our Ohio state income tax withholding return each quarter so that I don't have to log into the Ohio Business Gateway, compile payroll data, and manually submit the return.
- As a PR Admin, I want SUTA wage reports filed for all our active states on their individual schedules so that I'm never exposed to state unemployment tax filing penalties.
- As an Owner, I want all state and local returns filed automatically so that I can operate in multiple states without needing a dedicated tax compliance person.

### Acceptance Criteria Themes
- State income tax withholding returns are generated and submitted for all states where the company has an active withholding obligation, on each state's required schedule — no state is missed
- SUTA wage reports are generated and submitted for all active payroll states on their required schedules
- Local tax filings are generated and submitted for all localities configured in the system (P1)
- All submissions go through the tax filing service provider's channel — Prism does not build direct 50-state integrations
- Filing confirmation for each state/local submission is stored and reflected in the filing calendar status
- Rejected state filings are surfaced to admin with the state's rejection reason and a recommended correction

### Dependencies & Risks
- **Critical dependency:** Tax filing service provider selection and integration (PRD §5b: High risk, GA critical path) — this is the architectural dependency that determines whether this feature is feasible at GA
- **Upstream:** State income tax and SUTA data from E5-2 and E5-3 must be accurate; state filing accuracy depends on withholding engine accuracy
- **Risk:** State-specific filing channel differences (some states use ACH credit, some use state portals, some have proprietary XML formats) — the tax filing service must cover all active states before GA
- **Risk:** Local tax filing coverage by the tax filing service may be incomplete for smaller localities (PRD OQ-3)

### Success Metrics / KPIs
- 100% of state income tax withholding returns filed on time across all active states — zero missed state deadlines
- 100% of SUTA wage reports filed on time for all active states
- 0% state filing rejection rate attributable to Prism data or format errors

### Assumptions
- A tax filing service provider (Symmetry, Atrix, ADP Filing, or payroll partner) handles state and local filing channel integration — Prism does not build 50-state filing integrations in-house (PRD §5a)
- State income tax and SUTA rates and schedules are maintained by the tax filing service provider

---

## E8-6 — New Hire Reporting

### Goal / Outcome
When a new employee is added in Employee Management (E2), the system automatically generates and submits a new hire report to the appropriate state new hire registry within 20 days of the employee's hire date — for all 50 states. Admins do not manually track new hire reporting deadlines, manually prepare reports, or manually submit to state registries. The 20-day federal mandate (required for every new hire) is met automatically and verifiably for every employee in every active payroll state.

### Primary Personas
- **PR Admin** — currently responsible for new hire reporting manually; often misses submissions until receiving noncompliance letters
- **Owner / Exec** — exposed to noncompliance fines when new hire reports are missed (federally mandated program)

### Business & PRD Drivers
- G3 — New hire reporting automated for all active payroll states
- UC-10 — Automate new hire reporting to state registries (P0 — GA)
- PRD §3a — New Hire Reporting requirements
- PRD §1b — "New hire reporting noncompliance: new hire reporting to state registries (federally mandated within 20 days of hire) is rarely automated; owners miss it until they receive a noncompliance letter"

### Problem / Rationale
New hire reporting is federally mandated under the Personal Responsibility and Work Opportunity Reconciliation Act (PRWORA). Every employer must report each new hire to the state new hire registry within 20 business days of the hire date. State registries use these reports to enforce child support orders. Non-compliance results in fines — up to $25 per report missed, escalating to $500 per report for intentional violations. Because new hire reporting is a background compliance task that produces no visible business output (unlike payroll), it is routinely deprioritized and missed by small business owners without a dedicated HR function. Automation eliminates the miss entirely.

### In Scope
- Automatic new hire report generation triggered when a new employee is added in Employee Management (E2)
- Report submitted to the appropriate state new hire registry within 20 days of the employee's hire date
- Support for all 50 states — each state's new hire registry and submission requirements are supported
- Required report fields: employee name, SSN, address, start date, employer EIN, employer address
- Submission confirmation logged per employee per state; admin dashboard updated
- Filing calendar integration: new hire report deadline appears in E8-1 calendar per new hire event

### Out of Scope (for this feature)
- Re-hire reporting (future — currently treated as new hire)
- Independent contractor new hire reporting (state-specific, future)
- Child support order matching or enforcement (state agency function, not Prism)

### Example Super Stories
- As a PR Admin, I want the system to automatically submit a new hire report to the Ohio state registry when I add a new Ohio employee, so that I never miss the 20-day federal mandate.
- As a System, I want to detect when a new employee is added in Employee Management and trigger the new hire report submission automatically — without any admin action beyond entering the employee.
- As an Owner, I want to see new hire report submission confirmations in the filing calendar so that I have an auditable record of compliance for every new hire.

### Acceptance Criteria Themes
- A new hire report is automatically generated and submitted when a new employee is created in Employee Management (E2) — admin does not trigger this manually
- The report is submitted to the correct state registry (matched to the employee's home state) within 20 days of the hire date
- All 50 states are supported — no new hire in any payroll state is missed
- Required fields are included: employee name, SSN, address, start date, employer EIN, employer address
- Submission confirmation is logged per employee and appears in the admin dashboard and filing calendar
- If a new hire report submission fails, the admin receives an immediate alert with the failure reason

### Dependencies & Risks
- **Upstream:** Employee Management (E2) must trigger a new hire event that the filing system can detect and act on — the event must include all required report fields
- **Critical dependency:** State new hire registry API access or tax filing service coverage for all 50 states (PRD §5b: Medium risk)
- **Risk:** State new hire registry APIs vary significantly by state — some accept electronic submissions via API, some require flat-file upload, some use web forms — the tax filing service provider may be required to abstract this (PRD §5c)

### Success Metrics / KPIs
- 100% of new hire reports submitted within 20 days of hire date for all active payroll states — zero missed submissions
- 100% submission confirmation logged per new hire event
- 0% IRS or state noncompliance fines for new hire reporting attributable to Prism

### Assumptions
- New hire report submission for all 50 states is handled through the tax filing service provider's channel — Prism does not build 50 individual state registry integrations
- SSNs are verified and stored in Employee Management (E2) before the new hire report is submitted

---

## E8-7 — Filing Status & Audit Trail

### Goal / Outcome
Every filing submission — federal, state, local, new hire report — is tracked with a complete record: filing type, period, submission date, confirmation number, and status (submitted / accepted / rejected). Rejected filings are surfaced to the admin with the rejection reason and a specific recommended correction, not just an error code. The system maintains a 7-year filing history per IRS record retention requirements. Admins and CPAs can see the complete filing history for the company at any time without contacting Prism support.

### Primary Personas
- **PR Admin** — needs immediate visibility when a filing is rejected, with actionable guidance — not just a raw error code
- **External CPA / Bookkeeper** — needs filing history to verify all filings have been made for the current and prior years
- **Owner / Exec** — needs confidence that every filing obligation has been fulfilled and documented

### Business & PRD Drivers
- G1 — All required filings submitted on time with zero missed deadlines
- G5 — Zero filing rejections attributable to formatting or data errors from Prism
- UC-12 — Provide admin with filing status (submitted, pending, accepted, rejected) (P0 — GA)
- PRD §3a — Filing Status and Audit requirements
- PRD §1e — "A rejected e-file surfaces to the admin with the rejection reason and a specific recommended correction — not just an error code" (acceptance criteria)

### Problem / Rationale
Filing submission is not complete until the agency accepts the filing. A submitted 941 that the IRS subsequently rejects is effectively an unfiled return — with penalty exposure from the original due date. The failure mode in generic tools: the rejection arrives via email or in an agency portal the admin doesn't monitor, the admin doesn't see it until they receive a penalty notice, and by then the correction deadline has passed. Prism's audit trail closes this loop: every rejection is surfaced immediately in the admin dashboard with enough context for the admin to act without needing to decode agency error codes.

### In Scope
- Filing record maintained for every submission: filing type, jurisdiction, period, submission date, confirmation number, status (submitted / accepted / rejected)
- Rejected filing surfaced to admin dashboard with: rejection reason (translated from agency error code), specific recommended correction
- Filing history view: filterable by filing type, period, jurisdiction, status
- 7-year filing history retention (IRS record retention requirement)
- Filing status accessible to PR Admin, Owner/Exec, and CPA roles
- Integration with E8-1 filing calendar: filing calendar status updated to "accepted" on acceptance confirmation, "rejected" on rejection with alert

### Out of Scope (for this feature)
- Penalty calculation or interest accrual (future)
- Automated resubmission of corrected filings (future — admin triggers resubmission)
- Amended form generation (W-2c, corrected 1099-NEC) — future

### Example Super Stories
- As a PR Admin, I want to see a rejected Form 941 surfaced immediately in my dashboard with the specific rejection reason and recommended correction, so that I can fix and resubmit before the IRS applies penalties.
- As a PR Admin, I want to see the full filing history for the company — all submissions, acceptance confirmations, and any rejections — in a single filterable view.
- As an External CPA, I want to access the complete filing history to verify that all quarterly 941s and annual W-2/940 filings have been made and accepted, without asking the admin to send me PDFs.

### Acceptance Criteria Themes
- A filing record is created for every submission across all filing types: 941, 940, W-2 batch, 1099-NEC batch, state income tax, SUTA, local, and new hire reports
- Each filing record includes: filing type, jurisdiction, period, submission date, confirmation number, and status
- Rejected filings appear in the admin dashboard with the rejection reason translated from the agency's error code and a specific recommended correction — not just the raw code
- Filing history is filterable by type, period, jurisdiction, and status; accessible to Admin, Owner/Exec, and CPA roles
- Filing records are retained for a minimum of 7 years; records cannot be deleted before the retention period expires
- The filing calendar (E8-1) status is updated in real time when acceptance or rejection is received from the agency

### Dependencies & Risks
- **Upstream:** All filing submission features (E8-2 through E8-6) must pass confirmation data and status back to this audit trail — the data contract between filing features and audit trail must be defined early
- **Risk:** Agency rejection reason codes are often terse and technical; mapping them to human-readable, actionable guidance requires a maintained code-to-recommendation mapping for each agency
- **Upstream:** Tax filing service provider must pass confirmation and rejection data back to Prism in a structured format

### Success Metrics / KPIs
- 100% of all filing submissions have a complete filing record (no untracked submissions)
- 100% of rejections surfaced to admin with rejection reason and recommended correction within 1 business day
- 0% filing records lost or corrupted; 7-year retention enforced
- CPA/Admin can retrieve any filing record from the prior 7 years without Prism support intervention

### Assumptions
- Acceptance and rejection status is returned by the tax filing service provider in a structured format that Prism can parse and store
- Rejection reason mapping (agency error code to human-readable correction guidance) is maintained by Prism and updated when agency error code sets change

---

## Traceability Table

| Requirement / PRD Reference | Description | Feature(s) |
|---|---|---|
| G1 — All filings on time, zero missed deadlines | Federal, state, local | E8-1, E8-2, E8-5, E8-7 |
| G2 — W-2 and 1099-NEC accurate by January 31 | Annual year-end forms | E8-3, E8-4 |
| G3 — New hire reporting automated, all active states | 20-day mandate | E8-6 |
| G4 — Admin visibility into all upcoming obligations | Filing calendar | E8-1 |
| G5 — Zero filing rejections from Prism errors | Format and data quality | E8-2, E8-3, E8-4, E8-5, E8-7 |
| UC-1 — Filing calendar display | P0 Beta | E8-1 |
| UC-2 — Obligation identification by active states | P0 Beta | E8-1 |
| UC-3 — Form 941 generate and e-file | P0 GA | E8-2 |
| UC-4 — Form 940 generate and e-file | P0 GA | E8-2 |
| UC-5 — W-2 generate, distribute, e-file | P0 GA | E8-3 |
| UC-6 — 1099-NEC generate, distribute, e-file | P0 GA | E8-4 |
| UC-7 — State income tax filings | P0 GA | E8-5 |
| UC-8 — SUTA filings | P0 GA | E8-5 |
| UC-9 — Local tax filings | P1 GA | E8-5 |
| UC-10 — New hire reporting | P0 GA | E8-6 |
| UC-11 — Proactive deadline alerts | P0 GA | E8-1 |
| UC-12 — Filing status display | P0 GA | E8-7 |
| PRD §3a — Filing calendar real-time update on new state | NFR | E8-1 |
| PRD §3a — EFW2 format pre-submission validation | NFR | E8-3 |
| PRD §3b — Filing data 7-year retention | NFR | E8-7 |
| PRD §3b — 100% uptime for filing submission windows | NFR | E8-2 through E8-6 |
| PRD §3a — Rejected filing human-readable correction | Acceptance criterion | E8-7 |
| PRD OQ-1 — Tax filing service provider selection | Vendor decision | E8-5, E8-6 |
| PRD OQ-2 — IRS e-file Provider authorization status | Authorization risk | E8-2, E8-4 |
| PRD OQ-3 — Local tax filing service coverage | Scope decision | E8-5 |
| PRD OQ-4 — Reporting Agent vs. admin-submit model | Architecture decision | E8-2 through E8-6 |
| PRD OQ-5 — SUTA rate source | Data decision | E8-5 |
