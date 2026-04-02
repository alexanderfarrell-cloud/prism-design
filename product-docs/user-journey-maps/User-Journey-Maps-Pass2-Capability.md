# Prism Construction Payroll — User Journey Maps
## Pass 2: Capability Journey Maps

> *Trimble Financials | Prism Payroll | U.S. SMB Construction Contractors*
> *Last Updated: March 9, 2026*
> *Grounded in: 16-Epic Backlog, PRD Tiers 1–4, MRD, System Architecture, SMB Research Corpus*

**Purpose:** Each map traces a major payroll capability end-to-end — across all actors and all systems — from trigger to resolution. Use for: backlog coverage validation, cross-epic dependency mapping, QA planning, and milestone scoping alignment.

**Capability Flows Covered:**
1. Onboarding & Setup
2. Time-to-Payroll
3. Disbursement
4. Tax & Compliance
5. Financial Integration
6. Visibility & Oversight

**Reading the maps:**
- **Trigger** = what initiates the flow
- **Actors** = personas involved at any step
- **Step columns** = Actor | Action | System (Prism Epic) | Handoff To | Risk / Gap Point
- **Coverage flags** = where backlog coverage is strong vs. where gaps may exist

---

## Flow 1: Onboarding & Setup

**Trigger:** Contractor signs on to Prism Payroll for the first time.
**End state:** Company is fully configured, all employees are payroll-ready, and the system is cleared to initiate the first payroll run.
**Actors:** PR Admin, Owner (signatory), Employee (self-entry), 1099 Sub (self-entry), CPA (optional)
**Primary Epics:** 668778, 668798, 672405, 681947

---

| Step | Actor | Action | System / Epic | Handoff To | Risk / Gap |
|------|-------|--------|--------------|-----------|-----------|
| **1. Company Legal Setup** | PR Admin | Enters EIN, legal name, business type, federal tax ID | Setup Wizard (668778) | Step 2 | Missing EIN or incorrect tax ID blocks all downstream filing; wizard validates at entry |
| **2. Tax Jurisdiction Configuration** | PR Admin | Enters state tax IDs, SUI rate per state; confirms multi-state if applicable | Setup Wizard (668778) | Step 3 | SUI rate errors cause SUTA miscalculation every run until corrected; wizard flags missing states |
| **3. Workers' Comp Policy Entry** | PR Admin | Enters policy number, carrier, experience mod rate | Setup Wizard — Beta (668778) | Step 4 | Workers' comp class code mismatches cause audit exposure; deferred to Beta |
| **4. Pay Schedule Configuration** | PR Admin | Defines pay frequencies (weekly, biweekly), pay period start/end rules | Setup Wizard (668778) | Step 5 | Incorrect pay period anchoring causes all downstream run timing errors |
| **5. Form 8655 Authorization** | Owner / PR Admin | Generates, reviews, and electronically signs POA authorizing Prism to file and remit taxes | Setup Wizard — authorization gate (668778) | Step 6 | **Hard gate**: system cannot initiate tax filing or remittance without signed Form 8655; explicit block enforced |
| **6. Banking & Disbursement Setup** | PR Admin | Enters company bank account for ACH pulls (payroll funding) | Setup Wizard / Config Hub (668778, 668798) | Step 7 | Incorrect routing number causes disbursement failure on first run; pre-validated via micro-deposit or verification |
| **7. Trade Library Configuration** | PR Admin | Defines trade types and associated pay rates (e.g., Carpenter: $34.50/hr, Electrician: $42.00/hr) | Setup Wizard — Beta (668778) | Step 8 | Missing trade rates cause rate lookup failures at earnings calculation; deferred to Beta |
| **8. GL Account Mapping** | PR Admin / CPA | Maps payroll expense categories to chart of accounts in Prism Accounting | Setup Wizard — Beta (668778) / Config Hub (668798) | Step 9 | Unmapped GL accounts cause post-payroll journal entry errors; CPA often involved here |
| **9. Add First Employee** | PR Admin | Enters employee personal data, W-4, state withholding, direct deposit, trade assignments, pay rates | Employee Wizard (672405) | Step 10 | 7 required fields; wizard enforces completion; misclassification guardrail checks W-2 vs. 1099 indicators |
| **10. Employee Self-Onboarding (ESS)** | Employee / Sub | Receives invite link; self-enters W-4, direct deposit, state withholding (Beta) | ESS Portal (681144) | Step 11 | If employee does not complete, admin must complete on their behalf before the employee can be included in a run |
| **11. Readiness Check** | PR Admin | Reviews payroll readiness indicator; resolves any remaining incomplete items | Config Hub — readiness indicator (668798) | Payroll Run | **Gate**: system blocks first payroll run until all required configuration is marked complete; readiness indicator shows 3-state status |
| **12. Ongoing Config Changes** | PR Admin | Adds new state, updates SUI rate, modifies pay schedule, adds new trade | Config Hub (668798) | Relevant downstream run | All changes are effective-dated and logged; no re-entry of setup wizard required |

**Cross-Epic Handoffs:**
- Setup Wizard (668778) → Config Hub (668798): wizard is first-time only; all subsequent changes go to Hub
- Employee Wizard (672405) → ESS Portal (681144): self-onboarding invite flows from employee record creation
- GL Mapping (668778/668798) → Accounting Integration (681943): mapping drives post-run journal entry generation

**Coverage Assessment:** Strong at Alpha/Beta for core setup. Workers' comp and GL mapping deferred to Beta. Full 50-state coverage and multi-state complexity at GA.

---

## Flow 2: Time-to-Payroll

**Trigger:** A pay period closes and the PR Admin initiates a payroll run.
**End state:** Gross pay, tax withholding, and net pay are calculated and validated for all employees in the pay period; payroll is approved and ready for disbursement.
**Actors:** Field Supervisor (Traqspera), Employee (time entry), PR Admin (review + approval), AI (anomaly detection)
**Primary Epics:** 681929, 682274, 681930, 681934, 681946

---

| Step | Actor | Action | System / Epic | Handoff To | Risk / Gap |
|------|-------|--------|--------------|-----------|-----------|
| **1. Employees Log Time** | Employee / Field Supervisor | Workers clock in/out or enter daily time in Traqspera; coded to job + cost code + trade type | Traqspera (external) | Supervisor approval queue | Missing trade code on entry causes rate lookup failure downstream; pre-populated lists reduce this risk |
| **2. Multi-Trade Time Split** | Employee / Supervisor | Worker who performed two trades in one day submits multiple entries | Traqspera — multi-entry | Supervisor approval queue | Each entry must carry its own trade tag; single-entry tools cannot represent this; critical for WAOT accuracy |
| **3. Supervisor Time Approval** | Field Supervisor | Reviews all crew time entries for the week; corrects errors; approves | Traqspera approval (external) | Prism Time Review Dashboard (681929) | Unapproved time is flagged as an exception; payroll cannot initiate until resolved; approval is the first control gate |
| **4. Time Sync to Prism** | System | Approved Traqspera time records flow into Prism; at Alpha via file import, Beta via live API, GA via real-time feed | Time Integration (681929) | Time Review Dashboard | File-based import at Alpha creates a manual step; live API at Beta eliminates it; mismatch between Traqspera employee IDs and Prism employee records creates unmatched entry exceptions |
| **5. Exception Review** | PR Admin | Reviews Time Review Dashboard: unapproved time, unmatched employees, missing entries; resolves each before initiating run | Time Review Dashboard (681929) | Payroll Run initiation | **Gate**: payroll run cannot be initiated until all time exceptions are resolved or explicitly deferred; this is the pre-run control layer |
| **6. Initiate Payroll Run** | PR Admin | Selects pay period, confirms time data, starts the run | Payroll Run (682274) | Earnings Calculation | Run enters Draft state; immutable pay period snapshot taken; time records locked |
| **7. Earnings Calculation** | System | For each time entry: looks up employee's trade rate table; applies the correct rate; aggregates hours by type | Earnings Engine (681930) | WAOT Calculation | Rate lookup failure (missing trade rate) surfaces as a calculation exception; admin must resolve before run can proceed |
| **8. WAOT Calculation** | System | For employees who worked multiple rates in the same workweek: calculates blended overtime rate per FLSA rules | Earnings Engine — WAOT (681930) | Tax Withholding | WAOT is mathematically complex; errors here create systematic underpayment or overpayment of overtime; Alpha delivers regular wages only |
| **9. State-Specific Overtime Rules** | System | Applies California daily OT, Colorado daily OT, and other state-specific rules as applicable | Earnings Engine — state OT (681930) | Tax Withholding | Multi-state employees may trigger different OT rules in the same week; rule conflict resolution must be explicit |
| **10. Tax Withholding Calculation** | System | Applies W-4-driven FIT, all applicable state income tax, local/municipal taxes, FICA (employee + employer), FUTA, SUTA; applies pre-tax deductions before FIT | Tax Engine (681934) | Deduction Sequencing | Deduction sequencing errors (pre-tax item applied after FIT) cause systematic over-withholding; sequencing is enforced by the engine |
| **11. Deduction Application** | System | Applies pre-tax deductions (401k, HSA, etc.) in correct sequence; then post-tax deductions (garnishments with CCPA limits) | Tax Engine (681934) | AI Anomaly Review | Garnishment cap errors expose the company to legal liability; CCPA limits enforced automatically at GA |
| **12. AI Anomaly Scan** | System / AI | Scans computed payroll for statistical deviations: hours above/below norm, zero-pay employees, duplicate entries, gross pay outliers | AI Engine (681946) | Admin review checklist | Each anomaly generates a flag on the pre-submission checklist; flags are not blocking by themselves — admin must explicitly resolve or override |
| **13. Admin Anomaly Review** | PR Admin | Reviews interactive pre-submission checklist; resolves or overrides each flag with a reason | AI Pre-submission Checklist (681946, 682274) | Payroll Approval | **Gate**: Approve button is locked until all flags are cleared; this is the last human control gate before approval |
| **14. Payroll Approval** | PR Admin | Reviews summary (total gross, total taxes, total net, total employer cost); clicks Approve | Approval action (682274) | Disbursement (Flow 3) | Approval is explicit and irreversible; triggers disbursement, GL posting, and pay stub generation simultaneously; admin must be in correct RBAC role |

**Cross-Epic Handoffs:**
- Traqspera → Time Review Dashboard (681929): the field-to-office handoff; the most fragile point in the chain
- Earnings (681930) → Tax Engine (681934): gross pay is the input to withholding
- AI (681946) → Run Approval (682274): anomaly flags gate the approval action
- Approval (682274) → Disbursement (681936), GL Posting (681943), Pay Stubs (681939): three simultaneous downstream triggers

**Coverage Assessment:** Alpha delivers regular wages + simplified FIT. Beta adds trade-rate lookup, FLSA OT, WAOT, broad multi-state, AI anomaly detection. GA completes full 50-state OT, all pay types, all localities, garnishments.

---

## Flow 3: Disbursement

**Trigger:** Payroll is approved (Flow 2 complete).
**End state:** Every employee and 1099 sub has received their net pay via ACH or check; failed payments are resolved; pay stubs are delivered; pay period record is closed and immutable.
**Actors:** PR Admin (oversight), Employee (recipient), 1099 Sub (recipient), System (ACH processor)
**Primary Epics:** 681936, 681939, 681144, 681947

---

| Step | Actor | Action | System / Epic | Handoff To | Risk / Gap |
|------|-------|--------|--------------|-----------|-----------|
| **1. Pre-Disbursement Summary** | PR Admin | Reviews total disbursement amount, payment method per employee (ACH vs. check), effective date | Disbursement — pre-disbursement review (681936) | Pay period finalization | Catching a wrong bank account before disbursement is critical; masked but verifiable via last-4 display |
| **2. Pay Period Finalization** | PR Admin | Confirms the finalization step — creates an immutable audit record before any money moves | Disbursement — finalization (681936) | ACH initiation / check generation | **Gate**: this explicit step creates the immutable snapshot; cannot be skipped; money does not move until this is complete |
| **3. ACH File Generation** | System | Generates NACHA-compliant ACH file for all direct deposit employees; submits to bank | ACH engine (681936) | Bank processing | NACHA formatting errors cause full-batch rejections; compliance is non-negotiable; Alpha/Beta: simulated only |
| **4. Check Generation** | System | Generates printed check output for employees without direct deposit | Check generation (681936) | Admin / mail | Check printing is a GA capability; at Beta, simulated; physical check delivery is outside Prism scope |
| **5. ACH Processing** | Bank (external) | Processes ACH file; credits employee accounts on the effective date | Bank / external | ACH status update → Prism | Timing risk: ACH must be submitted before bank cutoff to land on payday; late submission = late pay |
| **6. Disbursement Status Tracking** | PR Admin | Monitors ACH status per employee: Pending → Settled or Failed | Disbursement status (681936) | Failed payment handling | **GA feature**: real-time status tracking per employee; at Beta, status is not surfaced per-employee |
| **7. Failed ACH Handling** | PR Admin | System surfaces failed ACH; admin receives guided retry workflow; can resubmit or switch to check | Failed payment workflow (681936) | Retry or check generation | Failed ACH must be resolved before next pay period; unresolved failures create wage payment compliance risk |
| **8. Pay Stub Generation** | System | Generates construction-aware pay stub per employee: multiple earnings lines by rate/job/trade, WAOT explanation, deduction sequence, state-compliant content | Pay Stubs (681939) | ESS delivery | **GA-only**: pay stub data model defined at Alpha/Beta for pipeline readiness; generation activates at GA |
| **9. Pay Stub Delivery** | System | Delivers pay stub to employee via secure email link; stores in ESS portal | Pay Stubs (681939) + ESS (681144) | Employee access | 4-year immutable retention required; employee access via ESS portal; no paper stubs in Prism scope |
| **10. Employee Stub Access** | Employee | Opens ESS portal; views and downloads current and historical pay stubs | ESS Portal (681144) | — | Mobile-first design required; construction workforce is primarily smartphone-only |
| **11. Pay Period Close** | System | Pay period record locked; marked as Disbursed → Closed; immutable for audit | Run state machine (682274, 681947) | Reporting (Flow 6) | Closed pay periods feed directly into payroll register and employer cost summary reports |

**Cross-Epic Handoffs:**
- Approval (682274) → Disbursement (681936): triggered simultaneously with GL posting and pay stub generation
- Disbursement (681936) → Pay Stubs (681939): net pay amounts are the source of truth for stub generation
- Pay Stubs (681939) → ESS Portal (681144): stub delivery is the primary ESS engagement trigger for employees

**Coverage Assessment:** Alpha/Beta: simulated disbursement, no real ACH, no pay stubs. Beta: real calculation, pre-disbursement summary, finalization step, disbursement stubbed. GA: live ACH, check generation, real-time status, failed ACH handling, pay stubs, ESS delivery.

---

## Flow 4: Tax & Compliance

**Trigger:** Payroll run approved (creates tax obligations) OR a filing deadline is approaching.
**End state:** All required tax filings are submitted, all tax deposits are remitted to the correct agencies on the correct schedule, and all new hire reporting is completed within statutory deadlines.
**Actors:** PR Admin (action), Owner (oversight), CPA (review), System (filing generation + remittance)
**Primary Epics:** 681940, 681942, 681946

---

| Step | Actor | Action | System / Epic | Handoff To | Risk / Gap |
|------|-------|--------|--------------|-----------|-----------|
| **1. Deposit Obligation Determination** | System | After each payroll run, calculates federal tax deposit obligation; determines deposit schedule (semi-weekly vs. monthly depositor rules based on lookback period) | Tax Remittance (681942) | Deposit calendar | **Key differentiator**: EFTPS schedule determination is automated; most SMBs deposit on wrong schedule until penalized |
| **2. Deposit Calendar Population** | System | Adds deposit due dates for federal (EFTPS), state income tax, SUTA, and local tax to the filing calendar | Tax Filing calendar (681940) + Tax Remittance (681942) | Admin deadline view | At Beta: deposit obligations surfaced in calendar for visibility; actual remittance deferred to GA |
| **3. Proactive Deadline Alerts** | System → PR Admin | Sends alerts for upcoming deposit deadlines and filing due dates; urgency-ranked by days remaining | Filing calendar (681940) + Dashboard (684212) | Admin action | **Core value**: alerts arrive before the deadline, not after a penalty notice; 60-day rolling window |
| **4. Federal Tax Deposit (EFTPS)** | System | Initiates ACH debit to remit federal income tax, FICA (employee + employer), FUTA deposit on correct schedule | Tax Remittance — EFTPS (681942) | Deposit status tracking | **GA-only**: semi-weekly and monthly depositor rules; late deposit triggers graduated IRS penalties |
| **5. State Income Tax Remittance** | System | Initiates payment to each active state tax authority on the state's required schedule | Tax Remittance — state (681942) | Deposit status tracking | Multi-state employees create obligations in multiple states simultaneously; system tracks per-jurisdiction |
| **6. SUTA Remittance** | System | Remits state unemployment tax to each active state on required schedule | Tax Remittance — SUTA (681942) | Deposit status tracking | SUTA rates differ by state and experience rating; incorrect rate causes over- or under-remittance |
| **7. Local Tax Remittance** | System | Remits local/municipal taxes (Philadelphia, Ohio RITA, Kentucky county, PA school district) on required schedule | Tax Remittance — local (681942) | Deposit status tracking | Locality detection depends on accurate address data from Employee Management (672405); incorrect address = wrong locality |
| **8. New Hire Reporting** | System | Automatically reports new hires to applicable state new hire registry within 20-day federal mandate | Tax Filing (681940) | State new hire registry | Failure to report within 20 days triggers per-employee fines; system generates and submits automatically at GA |
| **9. Form 941 Preparation** | System | Assembles quarterly 941 data: wages subject to FIT, FICA taxes withheld, employer FICA, FUTA liability, deposit credits | Tax Filing (681940) | Admin review + submission | Beta: 941 framework built; GA: actual e-file submission to IRS |
| **10. Form 940 Preparation** | System | Assembles annual FUTA reconciliation; identifies FUTA credit reduction states | Tax Filing (681940) | Admin review + submission | FUTA credit reduction for states with unpaid federal loans affects liability; GA scope |
| **11. State Income Tax Return Filing** | System | Generates and submits state income tax returns for each active state; all-state coverage at GA | Tax Filing (681940) | State tax agency | State filing schedules vary widely (monthly, quarterly, annual); filing calendar tracks per-state |
| **12. W-2 Generation & Distribution** | System | Generates W-2 for each W-2 employee; distributes via ESS portal; e-files W-3 transmittal to SSA (EFW2) | Tax Filing (681940) + ESS (681144) | Employee + SSA | January 31 deadline; late W-2 carries per-form penalties; ESS delivery eliminates mailing risk |
| **13. 1099-NEC Generation & Distribution** | System | Generates 1099-NEC for each 1099 sub paid $600+; delivers via ESS; e-files to IRS (FIRE system) | Tax Filing (681940) + ESS (681144) | Subcontractor + IRS | January 31 deadline; IRS FIRE e-file required at GA |
| **14. Filing Status History** | System / PR Admin | Maintains 7-year filing and deposit history; available for admin and CPA review | Tax Filing (681940) + Tax Remittance (681942) + Reporting (681945) | Audit support (Flow 6) | 7-year retention supports IRS audit defense; immutable once filed |
| **15. Failed Deposit Surfacing** | System → PR Admin | Surfaces any failed ACH remittance immediately; guides admin through retry or manual resolution | Tax Remittance (681942) | Retry workflow | Unresolved failed deposits become penalty accruals; proactive surfacing is the control |

**Cross-Epic Handoffs:**
- Payroll Run (682274) → Tax Remittance (681942): each approved run creates deposit obligations
- Employee Management (672405) → Tax Filing (681940): employee addresses drive locality determinations and state filing obligations
- Tax Filing (681940) → ESS (681144): W-2 and 1099-NEC delivery to workers is an ESS function
- All filings → Reporting (681945): 7-year history feeds audit and CPA review

**Coverage Assessment:** Beta: filing obligation identification, filing calendar, 941 framework, deposit amounts visible. GA: all live filing submissions, W-2/1099-NEC e-file, live EFTPS/state/local remittance, new hire reporting.

---

## Flow 5: Financial Integration

**Trigger:** Payroll run is approved (simultaneous with Disbursement trigger).
**End state:** Fully burdened labor costs are posted to Prism Accounting job costing by project and cost code; GL journal entries are generated and reconciled; job profitability data reflects the latest payroll run.
**Actors:** PR Admin (validation), CPA (reconciliation), System (integration), Owner (reporting consumer)
**Primary Epics:** 681943, 681945, 681947

---

| Step | Actor | Action | System / Epic | Handoff To | Risk / Gap |
|------|-------|--------|--------------|-----------|-----------|
| **1. Jobs & Cost Codes Sync (Inbound)** | System | Jobs, cost codes, and chart of accounts flow from Prism Accounting into Prism Payroll; used for time coding and rate mapping | Accounting Integration (681943) | Time coding in Traqspera + Payroll | **Core dependency**: if Prism Accounting is not the master of jobs/cost codes, integration breaks; this sync is bidirectional at GA |
| **2. Time Coded to Jobs** | Field Supervisor / Employee | Time entries in Traqspera are tagged with job + cost code sourced from Prism Accounting | Traqspera (external) + Time Integration (681929) | Payroll Run | Mis-tagged time entries route labor cost to the wrong job; validation at time entry is the first control |
| **3. Payroll Run Approval Trigger** | System | Approval of payroll run triggers simultaneous initiation of GL journal entry generation | Payroll Run (682274) → Accounting Integration (681943) | Journal entry generation | The trigger is atomic with disbursement initiation; no manual step between approval and GL posting |
| **4. GL Journal Entry Generation** | System | Auto-generates journal entries for payroll finalization: gross wages by GL account, employer taxes by GL account, deductions by GL account, net pay liability | Accounting Integration (681943) | Prism Accounting GL | **Key differentiator**: eliminates manual labor allocation entries that currently consume hours of office time |
| **5. Fully Burdened Labor Cost Calculation** | System | For each time entry: gross wages + employer FICA + FUTA/SUTA + workers' comp = fully burdened labor cost per employee per job per cost code | Accounting Integration (681943) + Earnings Engine (681930) + Tax Engine (681934) | Job costing post | "Fully burdened" is the critical phrase — generic tools post gross wages only; Prism posts the real cost |
| **6. Job Cost Post to Prism Accounting** | System | Fully burdened labor cost flows to Prism Accounting job costing ledger by job and cost code; updates project labor cost immediately | Accounting Integration (681943) → Prism Accounting | Owner / PM reporting | **GA feature**: real-time post-run update; before GA, this is manual in Prism Accounting |
| **7. GL Reconciliation** | PR Admin / CPA | Verifies that posted journal entries match payroll register totals; investigates discrepancies | Accounting Integration (681943) + Reporting (681945) | Audit trail | Discrepancy between payroll register and GL post is a control failure; reconciliation report is the tool |
| **8. Labor Cost Reporting** | Owner / CPA | Reviews fully burdened labor cost by job and cost code immediately after run | Reporting (681945) + Accounting Integration (681943) | Business decisions | Labor is 60% of project cost; this report is the most-requested output and the product's primary differentiator vs. generic tools |
| **9. Workers' Comp Cost Allocation** | System | Workers' comp cost per employee per trade is included in fully burdened cost; allocated to job/cost code | Accounting Integration (681943) + Config Hub (668798) | Job cost post | Workers' comp rate must be configured by trade class; misconfigured rates cause systematic under-costing |
| **10. Historical Integration Verification** | CPA / PR Admin | Periodic reconciliation of payroll GL entries against Prism Accounting balances; ensures no drift over time | Accounting Integration (681943) + Reporting (681945) | Audit support | GA includes reconciliation support tooling; Alpha/Beta: no integration active (stub only) |

**Cross-Epic Handoffs:**
- Prism Accounting (external) → Accounting Integration (681943): jobs and cost codes are the inbound data dependency
- Payroll Run (682274) → Accounting Integration (681943): approval is the trigger for all GL and job cost posting
- Earnings (681930) + Tax (681934) → Accounting Integration (681943): gross pay and employer taxes are the inputs to burdened cost
- Accounting Integration (681943) → Reporting (681945): labor cost by job is a reporting output, not a Prism Accounting query

**Coverage Assessment:** Alpha: no integration. Beta: proof-of-concept stub demonstrating data model compatibility. GA: full bidirectional integration, live job cost posting, auto journal entries, reconciliation support.

---

## Flow 6: Visibility & Oversight

**Trigger:** Any time a stakeholder (Admin, Owner, CPA) opens Prism Payroll and needs to understand the current state of their payroll world.
**End state:** The stakeholder has the information they need to take action, make a business decision, or confirm compliance — without calling someone else or waiting for a report.
**Actors:** PR Admin (operational oversight), Owner (financial visibility), CPA (compliance and audit), AI (proactive insight delivery)
**Primary Epics:** 684212, 681945, 681946, 681947

---

| Step | Actor | Action | System / Epic | Handoff To | Risk / Gap |
|------|-------|--------|--------------|-----------|-----------|
| **1. Dashboard Landing** | PR Admin | Opens Prism Payroll; sees current pay period status at a glance | Dashboard (684212) | Attention panel review | Alpha: pay period status panel and run entry CTA only; Beta: full command center |
| **2. Attention Required Review** | PR Admin | Scans attention panel for cross-module action items: time exceptions, incomplete employee setups, unsigned authorizations, upcoming tax deadlines | Dashboard — attention panel (684212) | Resolution via direct action links | Each attention item links directly to the resolution surface; no navigation required; items are cleared as resolved |
| **3. 60-Day Deadline Tracking** | PR Admin | Reviews rolling deadline tracker: upcoming pay dates, tax deposits, state filings, compliance expirations; urgency-ranked | Dashboard — deadline tracker (684212) | Tax filing / remittance actions | Admin sees what's next 60 days out, not just today; prevents the "I didn't know it was due" failure mode |
| **4. Recent Run History** | PR Admin | Reviews the last 3–5 payroll runs: status, total amounts, any anomalies flagged | Dashboard (684212) + Reporting (681945) | Run detail drill-down | Run history is the first place the admin goes when an employee calls about a prior pay period |
| **5. Payroll Register Pull** | PR Admin / CPA | Queries payroll register for a specific period; gets earnings-line detail per employee per run | Reporting (681945) | Export / CPA use | Register includes rate-per-entry, WAOT breakdown, per-job allocation — not available in any generic SMB tool |
| **6. Employer Cost Summary** | PR Admin / CPA / Owner | Pulls employer cost summary: gross wages, employer FICA, FUTA/SUTA, workers' comp by period | Reporting (681945) | Financial planning / 941 prep | Employer cost summary is a distinct report; often the most important for cash flow planning (gross payroll ≠ total labor cost) |
| **7. Labor Cost by Job** | Owner / PM | Pulls fully burdened labor cost by job and cost code after each run | Reporting (681945) + Accounting Integration (681943) | Profitability decisions | **GA feature**: the most-requested construction-specific report; available immediately post-run; covers gross + all employer obligations |
| **8. Tax Liability Report** | CPA / PR Admin | Queries outstanding and filed tax obligations by jurisdiction for a period | Reporting (681945) + Tax Filing (681940) | 941 / state filing prep | Tax liability by jurisdiction enables the CPA to verify deposit adequacy before filing |
| **9. AI Payroll Run Summary** | PR Admin | Receives plain-language summary of each payroll run: what changed from last period, any anomalies, key metrics | AI Insights (681946) | Admin awareness | Beta: plain-language run summaries; GA: run-comparison narratives, compliance change alerts |
| **10. AI Compliance Alerts** | PR Admin / Owner | Proactive alert: new state tax jurisdiction detected from time entries; plain-language guidance with action link | AI Tax Setup Advisor (681946) | Setup action | **GA feature**: replaces the "you don't know what you don't know" compliance failure mode |
| **11. Worker Classification Confidence** | PR Admin | Reviews IRS factor-based confidence scoring for any worker flagged as potential misclassification risk | AI (681946) | Employee record review | **GA feature**: prevents the most expensive compliance failure in construction payroll |
| **12. Audit Trail Query** | CPA / PR Admin | Queries 7-year immutable change audit trail for a specific employee, pay period, or configuration change | Audit trail (681947) + Reporting (681945) | Agency or audit response | Immutable = cannot be altered after the fact; each entry timestamped and role-tagged |
| **13. RBAC-Tuned Views** | Owner / CPA | Owner sees Dashboard with financial and compliance lens; CPA sees read-only reporting surface without run controls | RBAC (681947) + Dashboard (684212) | Role-specific actions | Each role sees only the data and actions their function requires; SSN and bank data masked regardless of role |
| **14. Notification History** | PR Admin | Reviews log of all system-generated alerts and notifications: what was sent, when, to whom | Dashboard — notification history (684212) | Compliance evidence | **GA feature**: notification history is audit evidence that the admin was proactively informed |

**Cross-Epic Handoffs:**
- All run data (682274, 681930, 681934, 681936) → Reporting (681945): every run feeds the register, cost summary, and labor cost reports
- Tax Filing (681940) + Tax Remittance (681942) → Reporting (681945): filing and deposit history feed tax liability and audit reporting
- AI (681946) → Dashboard (684212): AI insights surface in the attention panel and as dashboard widgets
- RBAC (681947) → Dashboard (684212) + Reporting (681945): role determines what each actor sees and what actions they can take

**Coverage Assessment:** Alpha: pay period status, run entry CTA. Beta: full command center, payroll register, employer cost summary, CSV/PDF export, CPA read-only access, AI anomaly detection summaries. GA: labor cost by job, tax liability reports, 7-year history, immutable audit trail, AI insights integration, notification history, mobile responsiveness, RBAC-tuned Owner and CPA views.

---

## Cross-Flow Dependency Map

The six flows are not independent — they interlock. Below are the critical cross-flow dependencies that span epics.

| From Flow | To Flow | Dependency | Risk if Broken |
|-----------|---------|-----------|---------------|
| 1 — Onboarding | 2 — Time-to-Payroll | Trade library, pay rates, and GL mapping must be complete before time can be correctly coded and earnings calculated | Rate lookup failures block every run |
| 1 — Onboarding | 4 — Tax & Compliance | Form 8655 authorization, state tax IDs, and SUI rates must be complete before any filing or remittance can occur | Tax remittance is legally blocked without POA |
| 2 — Time-to-Payroll | 3 — Disbursement | Payroll approval is the shared trigger for disbursement, GL posting, and pay stub generation | All three downstream flows are gated by run completion |
| 2 — Time-to-Payroll | 4 — Tax & Compliance | Each approved run creates deposit obligations; the run is the source of all filing liability | No run = no obligation; but wrong run = wrong obligation |
| 2 — Time-to-Payroll | 5 — Financial Integration | Approved run triggers GL journal entry generation and job cost posting simultaneously with disbursement | Late or missing job cost posts corrupt project profitability visibility |
| 3 — Disbursement | 6 — Visibility | Closed pay periods feed the payroll register, employer cost summary, and run history in reporting | Open or failed pay periods create gaps in historical reporting |
| 4 — Tax & Compliance | 6 — Visibility | Filing and deposit history feed the tax liability report and audit trail | CPA cannot verify 941 adequacy without deposit history |
| 5 — Financial Integration | 6 — Visibility | Labor cost by job is a reporting output sourced from the integration post | Without GA integration, this report cannot exist |

---

*Pass 1 — Persona Journey Maps: see `User-Journey-Maps-Pass1-Persona.md`*
*Epic IDs reference [ADO backlog](https://dev.azure.com/ViewpointVSO/Lista/_backlogs/backlog). Milestone scope anchored to `docs/documentation/Milestone_Statements_of_Scope.md`.*
