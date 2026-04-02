# Prism Construction Payroll — Tax Remittance & Payment
## Feature Set for Epic 681942 (E8b)

> **Source:** Tax Remittance & Payment PRD — the module that handles automated deposit of all withheld and employer payroll taxes to the appropriate federal, state, and local agencies. Covers federal EFTPS deposit scheduling (semi-weekly and monthly depositor rules), state income tax and SUTA payment submissions, local tax payments, proactive deposit alerts, and deposit history. GA-only. Paired with Tax Filing & Compliance Reporting (E8), which handles form generation while E8b handles the money movement to agencies.

---

## Feature Set Overview

| # | ADO ID | Feature Title | One-Line Summary |
|---|--------|--------------|-----------------|
| E8b-1 | 683390 | Federal Deposit Schedule & EFTPS | Determine federal deposit schedule (semi-weekly vs. monthly) and automatically initiate EFTPS deposits on the correct due date per payroll run |
| E8b-2 | 683391 | State Tax Payments | Automatically initiate state income tax and SUTA payments for all active states on each state's required payment schedule |
| E8b-3 | 683392 | Local Tax Payments | Initiate local income tax payments to applicable municipalities where Prism collects and withholds local tax |
| E8b-4 | 683393 | Deposit Monitoring & Alerts | Surface an upcoming deposit obligation calendar, proactive deadline alerts, and immediate failed deposit notifications before penalty accrual |
| E8b-5 | 683394 | Deposit History & Reconciliation | Maintain a 7-year deposit audit trail and provide a deposit reconciliation report against Form 941 for quarterly review |

---

## E8b-1 — Federal Deposit Schedule & EFTPS

### Goal / Outcome
The system determines each company's federal deposit schedule (monthly or semi-weekly depositor) from its prior four quarters of Form 941 liability, recalculates annually, and initiates every EFTPS federal tax deposit on the correct due date — automatically, without admin action. For each payroll run, the total federal deposit (FIT withheld + employee FICA + employer FICA) is calculated, submitted to EFTPS on the correct NACHA banking day, and the confirmation stored. The "Overwhelmed Operator" never manually logs into EFTPS, never misses a semi-weekly window, and never receives an IRS deposit penalty.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs deposits to happen automatically; does not know EFTPS or NACHA banking day rules
- **Owner / Exec** — wants assurance that federal tax obligations are being paid on time without operational intervention
- **External CPA / Bookkeeper** — needs to verify deposits are on the correct schedule and confirm amounts match withholding records

### Business & PRD Drivers
- G1 — All payroll tax deposits made on the correct schedule to the correct agencies, automatically
- G2 — Zero IRS, state, or local tax deposit penalties attributable to Prism
- UC-1 — Determine company's federal deposit schedule (semi-weekly vs. monthly depositor) (P0 — GA)
- UC-2 — Calculate federal tax deposit amount per payroll run (P0 — GA)
- UC-3 — Initiate and confirm EFTPS federal tax deposit on correct date (P0 — GA)
- PRD §3a — Federal Deposit Schedule Management and Federal Tax Deposits (EFTPS) requirements

### Problem / Rationale
The IRS charges a graduated penalty of 2–15% of the tax not deposited on time, plus interest. Semi-weekly depositors must deposit within 2–3 NACHA banking days of the pay date depending on the day wages were paid — a rule set that is opaque to small business owners. EFTPS logins get missed during high-load payroll weeks ("Friday Crunch"). Deposit schedule misclassification (monthly vs. semi-weekly) is common as payroll grows — the lookback period threshold ($50,000 in employment taxes in the prior four quarters) triggers a schedule change that owners don't know to watch for. Prism eliminates all of these failure modes: the schedule is determined from payroll data, the deposit is initiated automatically, and the admin sees the result in the dashboard.

### In Scope
- Determination of the company's federal deposit schedule (monthly or semi-weekly) from the lookback period (prior four quarters of 941 liability)
- Annual recalculation of the deposit schedule; admin notification if the schedule changes
- Per-payroll-run calculation of the correct EFTPS deposit due date (NACHA banking day rules for semi-weekly; 15th-of-following-month rule for monthly)
- Calculation of total federal tax deposit per payroll run: FIT withheld + employee FICA (SS + Medicare) + employer FICA (matching)
- Automatic EFTPS deposit initiation on the correct due date
- EFTPS confirmation received and stored per deposit
- Proactive admin alert 3 banking days before each deposit due date
- Immediate admin alert with failure reason if EFTPS deposit fails
- ⚠️ *Requires human review: EFTPS API integration vs. delegated payment model (IRS Form 8655 authorization required)*

### Out of Scope (for this feature)
- State and local tax payments (E8b-2, E8b-3)
- Deposit monitoring calendar and alert center (E8b-4)
- Deposit history and reconciliation report (E8b-5)
- Tax form generation — Form 941 (E8-2)
- FICA withholding calculation (E5)

### Example Super Stories
- As a PR Admin, I want the system to automatically determine that our company is a semi-weekly depositor and initiate the EFTPS deposit within the correct NACHA banking day window after each payroll run, so that I never receive an IRS deposit penalty for a late or missed federal deposit.
- As a PR Admin, I want to receive a notification if our deposit schedule changes from monthly to semi-weekly (because our payroll crossed the lookback threshold), so that I understand why deposit timing has changed.
- As a System, I want to calculate the total federal deposit amount (FIT + employee FICA + employer FICA) for each payroll run and submit it to EFTPS on the correct due date without any admin action.
- As an External CPA, I want to verify that each federal tax deposit matches the withholding liability for the corresponding payroll run, so that I can reconcile deposits against 941 line items.

### Acceptance Criteria Themes
- The system correctly classifies the company as a monthly or semi-weekly depositor based on the prior four quarters of 941 liability — classification does not require admin input beyond the initial payroll data
- For semi-weekly depositors, the deposit due date is calculated correctly for all pay date / day-of-week combinations (Wed/Thu/Fri → following Wednesday; Sat/Sun/Mon/Tue → following Friday)
- The EFTPS deposit is initiated automatically on the correct due date — no admin manual action required
- The deposit amount equals FIT withheld + employee SS + employee Medicare + employer SS + employer Medicare for the payroll run
- EFTPS confirmation is stored per deposit and visible in the admin dashboard
- A failed EFTPS deposit is surfaced to admin within 24 hours with the failure reason in plain language and the number of days remaining before IRS penalty applies
- Admin is alerted 3 banking days before a deposit due date if the deposit has not yet been initiated

### Dependencies & Risks
- **Critical dependency:** EFTPS API enrollment and IRS Form 8655 (Reporting Agent Authorization) — multi-month lead time; must begin at project kickoff (PRD §5b: High risk, critical path)
- **Upstream:** Tax Withholding Engine (E5) — FIT and FICA amounts per payroll run; deposit accuracy depends on E5 accuracy
- **Upstream:** Company Setup (E1) — EFTPS enrollment credentials and company payment account stored before GA
- **Risk:** Semi-weekly deposit date calculation error (NACHA banking day rules) — exhaustive test suite for all pay-date scenarios required; legal review recommended (PRD §5c)
- **Risk:** Deposit schedule changes mid-year require real-time lookback tracking — not just annual recalculation

### Success Metrics / KPIs
- 100% on-time federal tax deposit rate (EFTPS) — zero late deposits attributable to Prism
- $0 IRS penalties for late deposits attributable to Prism
- 100% of failed deposits surfaced to admin before IRS penalty deadline

### Assumptions
- EFTPS enrollment and IRS Form 8655 authorization are completed before GA
- The company's EFTPS PIN and banking credentials are stored securely in Company Setup (E1) before GA
- The lookback period is computed from payroll run data accumulated in Prism; admin confirms the initial schedule if prior-period data is unavailable

---

## E8b-2 — State Tax Payments

### Goal / Outcome
For every state where the company has an active payroll withholding or unemployment insurance obligation, the system calculates the payment amount due per the state's schedule, initiates payment via the state's preferred channel (state e-payment portal or ACH), and stores the payment confirmation. State income tax payments and SUTA payments happen automatically without admin logging into individual state portals. Admins operating in 3–5 states are no longer exposed to missed state deposit deadlines because they lost track of which state is monthly vs. quarterly or forgot a portal login.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — does not know each state's deposit schedule or payment portal; needs state payments to happen automatically
- **Owner / Exec** — exposed to multi-state penalty risk; wants assurance that all state tax obligations are paid
- **External CPA / Bookkeeper** — verifies state payments match state withholding liability before quarterly reconciliation

### Business & PRD Drivers
- G1 — All payroll tax deposits made on the correct schedule to the correct agencies, automatically
- G2 — Zero IRS, state, or local tax deposit penalties attributable to Prism
- UC-4 — Calculate and initiate state income tax payments per state schedule (P0 — GA)
- UC-5 — Calculate and initiate SUTA payments per state schedule (P0 — GA)
- PRD §3a — State Income Tax Payments and SUTA Payments requirements

### Problem / Rationale
A construction company operating in PA, OH, and MD has three state income tax deposit schedules and three SUTA payment schedules — all with different frequencies, due dates, payment portals, and penalty structures. Ohio income tax deposits may be monthly while SUTA is quarterly; Maryland may have a different threshold schedule. Generic SMB tools either don't support multi-state payment automation or require admin to manually log into each state's portal. Every portal login is a missed-payment risk when payroll week is busy. Prism's use of a tax payment service provider abstracts the 50-state channel complexity into a single integration.

### In Scope
- State income tax payment calculation for all active states per each state's payment schedule
- SUTA payment calculation for all active states per each state's schedule
- Payment initiation via each state's preferred payment channel (state e-payment portal or ACH) — via tax payment service provider
- Maintenance of current state payment channels, schedules, and deadlines (via tax service provider)
- Payment confirmation received and stored per state per period
- Filing calendar integration: state payment due dates appear in the E8b-4 deposit calendar
- ⚠️ *Requires human review: 50-state payment channel integration — build vs. buy (tax filing/payment service: Symmetry, ADP, Atrix)*

### Out of Scope (for this feature)
- Federal EFTPS deposits (E8b-1)
- Local tax payments (E8b-3)
- State income tax withholding calculation (E5-2)
- SUTA rate calculation (E5-3)
- State tax filing / form submission (E8-5)

### Example Super Stories
- As a PR Admin, I want the system to automatically pay Ohio's monthly state income tax deposit by the 15th of each month without me logging into the Ohio Business Gateway portal.
- As a PR Admin, I want SUTA payments made to all active states on their required schedules so that I'm never exposed to state unemployment tax deposit penalties.
- As an Owner, I want to see all state tax payment confirmations in one place so that I have an auditable record of state compliance without chasing multiple state portals.

### Acceptance Criteria Themes
- State income tax payments are initiated for all active states on each state's required payment schedule (monthly, quarterly, or as applicable)
- SUTA payments are initiated for all active states on each state's required schedule
- Payment amounts match the accumulated withholding and SUTA liability for the payment period from E5 data
- Payment initiation goes through the tax payment service provider — Prism does not build direct state portal integrations
- Payment confirmation is stored per state per payment period and visible in the admin dashboard
- Failed state payments are surfaced to admin immediately with the failure reason and remaining time before penalty

### Dependencies & Risks
- **Critical dependency:** Tax payment service provider selection and integration (PRD §5b: High risk, GA critical path) — this determines whether 50-state automation is feasible at GA
- **Upstream:** Tax Withholding Engine (E5-2) — state income tax withholding amounts; SUTA calculation (E5-3)
- **Upstream:** Company Setup (E1) — state payment credentials stored securely before GA
- **Risk:** Tax service provider coverage may not include all 50 states at integration time — validate state coverage before GA

### Success Metrics / KPIs
- 100% on-time state tax payment rate across all active states — zero missed state deposit deadlines
- $0 state tax deposit penalties attributable to Prism
- 100% of state payment confirmations stored per payment period

### Assumptions
- A tax payment service provider (Symmetry, ADP Filing, Atrix, or payroll partner) handles state payment channel integration — Prism does not build 50-state integrations in-house
- State income tax and SUTA rates and schedules are maintained by the tax service provider

---

## E8b-3 — Local Tax Payments

### Goal / Outcome
For localities where Prism calculates and withholds local income tax (e.g., Philadelphia wage tax, Ohio RITA municipalities, Kentucky local taxes), the system initiates local tax payments to the applicable municipalities on the required schedule. Admins operating in localities with local payroll taxes do not manually identify local payment obligations or log into municipal payment portals.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — unaware of local tax payment requirements and schedules; needs payments to happen automatically
- **Owner / Exec** — exposed to local tax penalty risk in municipalities with local payroll taxes

### Business & PRD Drivers
- G1 — All payroll tax deposits made on the correct schedule to the correct agencies, automatically
- G2 — Zero IRS, state, or local tax deposit penalties attributable to Prism
- UC-6 — Calculate and initiate local tax payments where applicable (P1 — GA)
- PRD §3a — Local Tax Payments requirements

### Problem / Rationale
Local income taxes exist in approximately 4,800 jurisdictions across the US — concentrated in Pennsylvania, Ohio, Kentucky, Maryland, and Michigan. Philadelphia alone has a wage tax that applies to all wages earned in the city. Ohio has over 600 RITA member municipalities, each with its own rate. For a construction contractor operating jobsites in multiple localities, local tax payment obligations multiply with each project location. This is one of the least-tracked compliance areas for SMBs — local penalty notices often arrive months after the payment was due.

### In Scope
- Local tax payment initiation for all localities where Prism calculates and withholds local income tax
- Payment scheduling per each locality's required payment frequency
- Payment confirmation stored per locality per payment period
- Deposit calendar integration: local payment due dates appear in E8b-4

### Out of Scope (for this feature)
- Local tax withholding calculation (E5-2)
- Local tax form filing / returns (E8-5)
- Localities not yet configured in the system
- Federal and state tax payments (E8b-1, E8b-2)

### Example Super Stories
- As a PR Admin, I want the system to automatically pay the Philadelphia wage tax on our company's required schedule so that we're never penalized for late local tax deposits.
- As an Owner, I want to see all local tax payment confirmations in the deposit dashboard so that I have an auditable record of local compliance.

### Acceptance Criteria Themes
- Local tax payments are initiated for all localities where Prism withholds local income tax, on each locality's required payment schedule
- Payment amounts match accumulated local withholding for the payment period
- Payment confirmation is stored per locality per period and visible in the admin dashboard
- Failed local payments are surfaced to admin with the failure reason and time remaining before penalty

### Dependencies & Risks
- **Upstream:** Local tax withholding calculation (E5-2) — local tax amounts per employee per payroll run
- **Dependency:** Tax payment service provider must support local tax payment channels for configured localities
- **Risk:** Local tax payment channel fragmentation — many municipalities have proprietary payment portals or flat-file submission requirements; tax service provider coverage of smaller localities may be incomplete

### Success Metrics / KPIs
- 100% of local tax payments initiated on time for all configured localities
- $0 local tax deposit penalties attributable to Prism

### Assumptions
- Local tax payment initiation is handled through the same tax payment service provider used for state payments
- Local tax payment scope at GA is limited to localities configured and active in the company's payroll footprint

---

## E8b-4 — Deposit Monitoring & Alerts

### Goal / Outcome
The admin has a single deposit obligation calendar showing every upcoming federal, state, and local tax deposit — amount, due date, jurisdiction, and status — for the next 30 days. Proactive alerts notify the admin 3 banking days before each upcoming deposit. If a deposit fails or is missed, the admin is alerted immediately with the failure reason, the remaining penalty-free correction window, and escalating urgency as the window narrows. No tax deposit penalty accrues because the admin was unaware of an obligation or was not notified of a failure in time to correct it.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs a single view of all upcoming deposit obligations; cannot track individual federal, state, and local schedules manually
- **Owner / Exec** — wants to see total tax cash outflow per payroll cycle and know all obligations are being met
- **External CPA / Bookkeeper** — periodically reviews deposit status to verify compliance before quarterly return preparation

### Business & PRD Drivers
- G3 — Admin has real-time visibility into deposit status and upcoming obligations
- G4 — Missed or failed deposits surface proactively before penalty accrual
- UC-7 — Surface upcoming deposit obligations and deadlines to admin (P0 — GA)
- UC-8 — Alert admin to missed or failed deposits before penalty accrual (P0 — GA)
- PRD §3a — Deposit Alerts and Monitoring requirements

### Problem / Rationale
Even with automated deposit initiation (E8b-1 and E8b-2), the admin needs visibility: what was paid, what is coming, and what failed. The failure mode without monitoring: a deposit fails due to an ACH return or a banking credential issue, the admin is not alerted, the failure sits unresolved, and IRS penalty accrues from the original due date. EFTPS ACH returns can occur days after the deposit was "initiated" — the penalty window for correction is measured in days. Prism's monitoring layer closes this gap by surfacing failures immediately and tracking the penalty correction window so the admin knows exactly how much time they have to act.

### In Scope
- Deposit calendar: displays all upcoming federal, state, and local deposit obligations for the next 30 days — tax type, jurisdiction, amount, due date, status (upcoming / in progress / confirmed / failed)
- Proactive alert 3 banking days before each deposit due date if the deposit has not yet been initiated
- Immediate alert when a deposit fails — plain-language failure reason, time remaining before IRS or state penalty applies
- Penalty correction window tracking: escalating urgency as the window narrows (e.g., 5 days remaining, 2 days remaining, overdue)
- Alert delivery: admin dashboard notification and email
- Calendar and alerts visible to PR Admin, Owner/Exec, and CPA roles

### Out of Scope (for this feature)
- Deposit initiation (E8b-1, E8b-2, E8b-3)
- Deposit history and reconciliation report (E8b-5)
- Penalty calculation or accrual tracking (future)
- Tax filing deadlines (E8-1 — Filing Calendar)

### Example Super Stories
- As a PR Admin, I want to see a deposit calendar showing all upcoming federal, state, and local deposits due in the next 30 days with amounts and due dates, so that I always know what's coming and can confirm obligations are being met.
- As a PR Admin, I want to be alerted immediately if an EFTPS deposit fails — with the reason and how many days I have before the IRS penalty applies — so that I can take corrective action before the penalty window closes.
- As an Owner, I want to see all upcoming tax deposit obligations and their amounts so that I can anticipate the cash outflow impact of payroll taxes per cycle.

### Acceptance Criteria Themes
- The deposit calendar displays all federal, state, and local deposit obligations due in the next 30 days: tax type, jurisdiction, amount, due date, and status
- Admin is alerted 3 banking days before any deposit due date where the deposit has not yet been initiated
- A failed deposit surfaces in the admin dashboard within 24 hours of the failure with: failure reason in plain language, date of the original due date, days remaining in the penalty-free correction window
- Escalating urgency indicators appear as the penalty correction window narrows (configurable thresholds)
- The deposit calendar and alerts are accessible to Admin, Owner/Exec, and CPA roles
- All alert delivery is via dashboard notification and email

### Dependencies & Risks
- **Upstream:** E8b-1, E8b-2, E8b-3 — deposit status events (initiated, confirmed, failed) are the data source for the monitoring calendar
- **Risk:** EFTPS ACH return timing — returns may arrive 1–3 days after deposit initiation; monitoring must poll for confirmation status, not treat initiation as success
- **Risk:** State payment confirmation timing varies by state payment channel; monitoring SLA must account for delayed confirmations

### Success Metrics / KPIs
- 100% of missed deposit alerts surfaced to admin before penalty deadline
- 100% of failed deposits surfaced to admin with failure reason within 24 hours
- Admin time spent on tax payment monitoring per payroll cycle: <5 minutes

### Assumptions
- Deposit status events (confirmed, failed, ACH return) are returned by the payment infrastructure in a structured format with timestamps
- Penalty correction window timelines (by deposit type and jurisdiction) are maintained in the system and used for escalation logic

---

## E8b-5 — Deposit History & Reconciliation

### Goal / Outcome
The admin and CPA can access a complete, filterable deposit history for the company — every federal, state, and local tax deposit, with amount, date initiated, confirmation number, status, and tax type — for any period in the prior 7 years. A quarterly reconciliation report aligns total deposits against Form 941 line items (total FIT, Social Security, Medicare withheld and deposited) so discrepancies are identified before the 941 is filed, not discovered during an IRS audit. Deposit records are retained for 7 years in compliance with IRS record retention requirements.

### Primary Personas
- **External CPA / Bookkeeper** — needs deposit history to reconcile liability accounts and verify 941 amounts before filing; currently relies on admin to compile this manually
- **PR Admin** — needs to retrieve specific deposit records (confirmation numbers, amounts) for agency correspondence or audit response
- **Owner / Exec** — periodically reviews total tax cash outflow for financial planning

### Business & PRD Drivers
- G3 — Admin has real-time visibility into deposit status and upcoming obligations
- UC-9 — Provide tax payment history and cash impact per payroll run (P1 — GA)
- UC-10 — Reconcile deposits against 941 for quarterly review (P1 — GA)
- PRD §3a — Reconciliation Support requirements
- PRD §3b — Audit: complete deposit history retained 7 years

### Problem / Rationale
At quarter-end, the CPA preparing the Form 941 needs to verify that deposits match the 941 liability. Without a structured deposit history, this reconciliation involves manually comparing EFTPS transaction records to payroll summaries — a time-consuming, error-prone process that often surfaces discrepancies too late to correct before the 941 filing deadline. Beyond quarterly reconciliation, IRS or state audit correspondence requires retrieval of specific deposit confirmation numbers — which are difficult to locate when deposit records are scattered across portal histories and spreadsheets.

### In Scope
- Complete deposit history: every federal, state, and local deposit — amount, date initiated, confirmation number, tax type, jurisdiction, period, status
- History filterable by: date range, tax type, jurisdiction, status
- 7-year retention of all deposit records (IRS record retention compliance)
- Quarterly 941 reconciliation report: total FIT, Social Security, and Medicare withheld (from E5) vs. amounts deposited per quarter — with variance identified
- Accessible to PR Admin, Owner/Exec, and CPA roles

### Out of Scope (for this feature)
- Deposit initiation (E8b-1, E8b-2, E8b-3)
- Deposit monitoring and alerts (E8b-4)
- Tax form generation — Form 941 (E8-2)
- Penalty calculation or interest accrual

### Example Super Stories
- As an External CPA, I want to pull a deposit history report for Q1 showing all federal EFTPS deposits with confirmation numbers and amounts, so that I can verify total deposits match the 941 liability before we e-file.
- As a PR Admin, I want to retrieve the EFTPS confirmation number for a specific deposit when responding to an IRS correspondence, so that I don't have to log into EFTPS to search transaction history.
- As an External CPA, I want a reconciliation report that shows total FIT, Social Security, and Medicare deposited vs. total withheld per quarter, so that any deposit shortfall is identified before we file the 941.

### Acceptance Criteria Themes
- A deposit record is stored for every federal, state, and local deposit: amount, date initiated, confirmation number, tax type, jurisdiction, period, and status
- Deposit history is filterable by date range, tax type, jurisdiction, and status — accessible to Admin, Owner/Exec, and CPA roles
- Deposit records are retained for a minimum of 7 years; records cannot be deleted before the retention period expires
- The 941 reconciliation report shows, per quarter: total FIT deposited vs. FIT withheld; total SS deposited vs. SS withheld; total Medicare deposited vs. Medicare withheld — with any variance clearly identified
- The reconciliation report is available for each completed quarter before the 941 filing deadline

### Dependencies & Risks
- **Upstream:** E8b-1, E8b-2, E8b-3 — deposit records (confirmation numbers, amounts, statuses) are the source data for history
- **Upstream:** Tax Withholding Engine (E5) — withholding totals per quarter for the reconciliation report
- **Risk:** 941 reconciliation requires accurate per-quarter withholding accumulation from E5; discrepancies between E5 accumulated totals and deposit totals must be identifiable by tax type

### Success Metrics / KPIs
- 100% of deposit records retained with confirmation numbers for 7 years
- CPA / Admin can retrieve any deposit record from the prior 7 years without Prism support intervention
- Quarterly 941 reconciliation report available within 1 business day of quarter-end payroll run close

### Assumptions
- Deposit confirmation numbers and amounts are returned from EFTPS and state payment channels in structured format and stored in the deposit record at time of confirmation
- Withholding accumulation by quarter (FIT, SS, Medicare) is tracked in the Tax Withholding Engine (E5) and available via API for reconciliation report generation

---

## Traceability Table

| Requirement / PRD Reference | Description | Feature(s) |
|---|---|---|
| G1 — All deposits on correct schedule | Federal, state, local | E8b-1, E8b-2, E8b-3 |
| G2 — Zero deposit penalties from Prism | Compliance | E8b-1, E8b-2, E8b-3, E8b-4 |
| G3 — Real-time visibility into deposit status | Admin dashboard | E8b-4, E8b-5 |
| G4 — Missed/failed deposits surface before penalty | Proactive alerts | E8b-4 |
| UC-1 — Determine federal deposit schedule | P0 GA | E8b-1 |
| UC-2 — Calculate federal deposit amount per run | P0 GA | E8b-1 |
| UC-3 — Initiate and confirm EFTPS deposit | P0 GA | E8b-1 |
| UC-4 — State income tax payments per state schedule | P0 GA | E8b-2 |
| UC-5 — SUTA payments per state schedule | P0 GA | E8b-2 |
| UC-6 — Local tax payments where applicable | P1 GA | E8b-3 |
| UC-7 — Surface upcoming deposit obligations | P0 GA | E8b-4 |
| UC-8 — Alert admin to missed/failed deposits | P0 GA | E8b-4 |
| UC-9 — Tax payment history and cash impact | P1 GA | E8b-5 |
| UC-10 — Reconcile deposits against 941 | P1 GA | E8b-5 |
| PRD §3a — EFTPS API enrollment / Form 8655 | Critical dependency | E8b-1 |
| PRD §3a — 50-state payment channel — tax service | Critical dependency | E8b-2, E8b-3 |
| PRD §3b — 7-year deposit record retention | NFR | E8b-5 |
| PRD §3b — 99.9% uptime for deposit initiation | NFR | E8b-1, E8b-2, E8b-3 |
| PRD OQ-1 — EFTPS enrollment initiated? | Authorization risk | E8b-1 |
| PRD OQ-2 — State tax payment service selection | Vendor decision | E8b-2, E8b-3 |
| PRD OQ-3 — Auto-initiate vs. admin-approve deposits | Architecture decision | E8b-1, E8b-2 |
| PRD OQ-4 — Lookback period from Prism data or admin-confirmed? | Product decision | E8b-1 |
