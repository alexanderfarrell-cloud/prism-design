# Epic Set: Prism Construction Payroll — Disbursement & Money Movement (E6)

> *Generated from: `docs/documentation/Disbursement_PRD_Mar2.md`*
> *Date: March 4, 2026*

---

## Epic Set Overview

| # | Epic Title | One-Line Summary |
|---|-----------|-----------------|
| E6-1 | Pre-Disbursement Review & Pay Period Finalization | Admin reviews a pre-submission summary and confirms payroll, triggering an irreversible, immutable pay period close with a full audit record. |
| E6-2 | ACH Direct Deposit & Settlement Tracking | System generates NACHA-compliant ACH files, transmits to the ACH partner, and tracks per-employee disbursement status from pending through settled. |
| E6-3 | Printed Check Generation | System generates NACHA-parallel PDF check faces for employees designated for printed check payment. |
| E6-4 | Failed ACH Detection, Notification & Retry | System receives ACH return codes, surfaces actionable exceptions to the admin with plain-language guidance, and manages the retry workflow after employee bank account correction. |
| E6-5 | Off-Cycle Payroll Run Execution | Admin initiates targeted off-cycle runs (termination final pay, bonus, correction) for individual employees without re-running the full payroll. |

---

## E6-1 — Pre-Disbursement Review & Pay Period Finalization

### Goal / Outcome
Admins must be able to review a complete, accurate snapshot of what is about to be paid before any money moves — and then make an irreversible, auditable commitment. This epic delivers the confirmation gate between gross-to-net completion and disbursement initiation. It eliminates ambiguity about what "submitted" means and creates the immutable record that anchors all downstream audit and compliance needs.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — primary actor; submits payroll
- **Owner / Exec** — secondary; may review confirmation after the fact

### Business & PRD Drivers
- **G4**: Every payroll run produces an immutable, auditable disbursement record
- **UC-3**: Pre-disbursement summary display
- **UC-4**: Pay period finalization with irreversible close
- **FR**: Pre-disbursement summary (total net pay, ACH vs. check split, scheduled pay date, funding account) — P0
- **FR**: Explicit admin confirmation before disbursement — P0
- **FR**: Immutable audit log on finalization (run ID, approver, timestamp, total amounts) — P0
- **FR**: Finalized run not editable; corrections via off-cycle — P0
- **FR**: Admin "unlock" with second approval and audit record — P1

### Problem / Rationale
SMB admins currently have no clear, consolidated moment of truth before payroll goes out. They initiate bank transfers manually or click "submit" without a structured review step. The result: wrong amounts submitted, duplicate runs, and no confirmation that payroll actually closed. This epic gives admins a structured commit point and creates the audit record that underpins compliance, dispute resolution, and financial reconciliation.

### In Scope
- Pre-disbursement summary screen displaying: total net pay, employee count, ACH vs. check breakdown, scheduled pay date, and funding account (balance display conditional on bank integration)
- Display of any unresolved warnings (anomaly flags, open exceptions) on the summary screen — P1
- "Submit Payroll" confirmation action (single explicit CTA)
- Pay period finalization: run marked as `CLOSED`, approver identity recorded, timestamp captured, total gross/net recorded in immutable audit log
- `PayrollRun` record written with full metadata on finalization
- Clear "Finalized" status display with approver and submission timestamp visible post-submit
- Admin "unlock" flow (P1): requires second approver, generates a separate audit record for the unlock event
- Alpha: mock summary with simulated amounts (no banking data)
- Beta: real amounts from gross-to-net calculation, finalization with audit record, no live disbursement

### Out of Scope (for this epic)
- Actual disbursement initiation (ACH file generation, check PDF) — E6-2, E6-3
- AI anomaly detection logic — AI Assistance module
- Net pay calculation — Tax Withholding & Deductions (E5)
- Pay stub generation — Pay Stubs & Deliverables (E7)
- GL journal entries — Prism Accounting Integration (E9)

### Example "Super Stories"
- As a PR Admin, I want to see a full summary of total amounts, employee count, and payment methods before I submit payroll, so that I can catch errors before any money moves.
- As a PR Admin, I want to click "Submit Payroll" as an explicit, confirmed action, so that disbursement is never triggered accidentally.
- As a PR Admin, I want the system to flag any unresolved warnings on the pre-submission screen, so that I'm not blindsided by exceptions after payroll closes.
- As a PR Admin, I want to see a "Finalized" confirmation with my name and timestamp after submission, so that I know exactly what I committed to and when.
- As a PR Admin, I want an authorized "unlock" path for exceptional corrections, so that I'm not permanently blocked without a proper override process.

### Acceptance Criteria Themes
- The pre-disbursement summary is displayed before any disbursement is triggered and shows total net pay, employee count, ACH/check split, scheduled pay date, and (where available) funding account.
- Submitting payroll requires at least one explicit confirmation action; accidental navigation away does not trigger finalization.
- Upon submission, the pay period is immediately marked `CLOSED` and an immutable audit record is written with run ID, approver, timestamp, and total amounts.
- A finalized run cannot be edited; the UI surfaces a clear locked state with approver and timestamp visible.
- Unresolved AI or validation warnings are surfaced on the pre-submission screen and require admin acknowledgment before submit proceeds (P1).
- The admin "unlock" path requires a second approver and generates its own audit log entry (P1).
- The audit record is queryable for reporting and compliance review.

### Dependencies & Risks
- **Upstream**: Net pay per employee must be available from E5 (Tax Withholding & Deductions) before this screen can render
- **Upstream**: Funding account balance (if displayed) requires bank integration from E6-2 ACH partner
- **Risk**: Admin submitting on the wrong date (missing NACHA cutoff) — mitigated by displaying pay date, submission deadline, and calendar warnings on the summary screen
- **Risk**: Unlock / correction approval authority undefined — OQ-3 requires legal/product resolution before P1 unlock feature is built

### Success Metrics / KPIs
- Payroll runs with a complete disbursement audit record: **100%** (compliance target)
- Admin error rate on submission (wrong pay period, wrong date): tracked via `payroll_submission_error` telemetry; directional target: reduce vs. baseline
- Time from payroll approval to submission (efficiency signal): tracked via event timestamps

### Assumptions
- Net pay amounts are fully computed by E5 before this screen is accessible
- Funding account verification is handled during Company Setup (E1); balance display is additive, not required for submission
- A single "Submit Payroll" button is the finalization CTA; two-factor or OTP confirmation is not required at GA (may be revisited for high-amount thresholds)

---

## E6-2 — ACH Direct Deposit & Settlement Tracking

### Goal / Outcome
After payroll is finalized, the system automatically generates a NACHA-compliant ACH file and transmits it to the ACH partner on the correct initiation date — with no manual bank action required by the admin. Per-employee disbursement status is tracked in real time from submission through settlement. This epic is the core money-movement engine for direct deposit employees and the primary driver of the 99.9% on-time disbursement rate target.

### Primary Personas
- **PR Admin** — monitors disbursement status and confirms payroll has cleared
- **Employee** — receives correct net pay on or before the scheduled pay date
- **Owner / Exec** — episodic visibility into "has payroll cleared the bank"

### Business & PRD Drivers
- **G1**: Employees receive correct net pay on or before the scheduled pay date, every run
- **UC-1**: ACH file generation and bank submission
- **UC-5**: Per-employee disbursement status tracking
- **UC-8**: Next-day vs. 2-day ACH settlement selection
- **UC-9**: Split disbursement across 2 bank accounts
- **FR**: NACHA-compliant ACH file — P0 (GA)
- **FR**: Standard 2-day ACH settlement — P0 (GA)
- **FR**: Next-day ACH settlement (where available) — P1 (GA)
- **FR**: Split direct deposit across up to 2 accounts with % or fixed-dollar allocation — P0 (GA)
- **FR**: Status tracking: Pending → Transmitted → Settled / Returned — P0 (GA)
- **NFR**: ACH files encrypted in transit; bank account numbers masked in UI; routing/account never logged
- **NFR**: ACH file generation for 100 employees in < 60 seconds
- **NFR**: 99.9% uptime for payroll submission and ACH initiation

### Problem / Rationale
SMB payroll admins currently initiate bank transfers manually, creating risk of missed runs, wrong amounts, and duplicate payments. There is no automatic connection between payroll calculation and money movement. This epic eliminates that manual gap — payroll finalization directly triggers compliant ACH file generation and transmission, with confirmation flowing back into the product so admins have visibility without checking their bank.

### In Scope
- ACH file generation in NACHA standard format (CTX or PPD as appropriate) on payroll finalization
- ACH file transmission to the selected ACH partner on the correct NACHA banking day (accounting for holidays and cutoff times)
- NACHA banking calendar awareness (holiday suppression, cutoff deadline display)
- Standard 2-day ACH settlement path (P0)
- Next-day ACH settlement path where ACH partner supports it (P1)
- Split direct deposit: up to 2 bank accounts per employee, percentage or fixed-dollar allocation (sourced from E2 employee bank account configuration)
- Per-employee `DisbursementRecord` written on file generation (employee, amount, account masked, payment method, status)
- Status progression per employee: `Pending` → `Transmitted` → `Settled` (or `Returned`)
- Admin disbursement status dashboard: current run and prior run history (P1 for prior run history)
- Status updates driven by ACH partner settlement confirmations via API callback
- Bank account number masking in all UI views; no account numbers in logs
- AES-256 encryption for bank account data at rest

### Out of Scope (for this epic)
- Printed check generation — E6-3
- Failed ACH return handling — E6-4
- Employee bank account setup and verification — E2 Employee Management
- ACH tax remittance to agencies — Tax Remittance (E8b)
- GL journal entries — Prism Accounting Integration (E9)
- Beta disbursement (Beta uses stub/demo; GA is live ACH)

### Example "Super Stories"
- As a PR Admin, I want the system to automatically generate and transmit the ACH file after I submit payroll, so that I never have to log into the bank portal to initiate transfers.
- As a PR Admin, I want to see each employee's disbursement status update from "Transmitted" to "Settled" without taking any action, so that I know payroll has cleared.
- As an Employee, I want my net pay split correctly across my two bank accounts every payroll cycle, so that my savings and checking allocations are always right.
- As an Owner / Exec, I want to see a dashboard showing whether this week's payroll has settled, so that I have cash flow confidence without calling the office manager.
- As a PR Admin, I want the system to warn me if I'm submitting too close to the NACHA cutoff to hit Friday's pay date, so that I don't cause a missed payday.

### Acceptance Criteria Themes
- After payroll is finalized, an ACH file is generated and transmitted to the ACH partner without any manual admin action.
- ACH file is NACHA-compliant; validated by the ACH partner without format rejection.
- For employees with split direct deposit (2 accounts), disbursement amounts are allocated per the employee's configured percentage or fixed-dollar split, with the total matching net pay.
- Per-employee disbursement status is visible in the product and updates automatically as the ACH partner provides settlement confirmations.
- System accounts for NACHA banking holidays and displays the correct submission deadline relative to the scheduled pay date.
- Next-day ACH is available as a selection option and results in next-business-day settlement (P1; conditional on ACH partner support).
- ACH file generation for a 100-employee payroll completes in < 60 seconds.
- Bank account numbers are masked in all UI views; routing/account data is never written to logs.

### Dependencies & Risks
- **Critical**: ACH partner selection (Plaid, Stripe, Dwolla, Modern Treasury, or bank-direct) — OQ-1; High risk; must be resolved Sprint 1 for GA critical path
- **Upstream**: Net pay amounts from E5 (Tax Withholding & Deductions)
- **Upstream**: Employee bank account details and split configuration from E2 (Employee Management)
- **Upstream**: E6-1 (finalization) must complete before ACH file generation triggers
- **Upstream**: Company funding account verification from E1 (Company Setup)
- **Risk**: NACHA file format errors causing rejected batch — mitigated by NACHA test suite and ACH partner pre-live validation
- **Risk**: Admin submits on wrong date, missing NACHA cutoff — mitigated by deadline display and calendar warnings on pre-submission screen
- **Risk**: State same-day final pay laws (CA, CO, NV) may require instant ACH not available via 2-day path — OQ-4 requires legal review

### Success Metrics / KPIs
- On-time disbursement rate (employee receives pay by scheduled date): **≥ 99.9%**
- ACH file NACHA compliance: **0 format rejections** post-launch
- Admin manual banking actions post-payroll submission: **0** (tracked via absence of `manual_ach_workaround` events)
- Time from payroll submission to ACH file transmitted: **< 5 minutes** (directional target)

### Assumptions
- Employee bank accounts are verified (micro-deposit or instant verification) before first payroll run via E2; this epic does not handle verification
- The ACH partner provides a webhook/API callback for settlement confirmations and return codes
- Company funding account is pre-verified during E1 setup; this epic does not handle funding account verification
- Next-day ACH is offered only where the ACH partner and the customer's bank both support it (OQ-2 to confirm GA scope)

---

## E6-3 — Printed Check Generation

### Goal / Outcome
Employees who are not enrolled in direct deposit receive a system-generated, print-ready PDF check face that the admin can print and distribute on pay day. Check generation is triggered automatically alongside ACH file generation at payroll finalization, eliminating the need for admins to hand-write or externally produce checks. This epic ensures the 99.9% on-time disbursement target extends to non-ACH employees.

### Primary Personas
- **PR Admin** — generates, downloads, and distributes printed checks
- **Employee** — receives a physical check compatible with their bank

### Business & PRD Drivers
- **G1**: Employees receive correct net pay on or before the scheduled pay date
- **UC-2**: PDF check face generation for check-payment employees
- **FR**: PDF check face generated for employees designated for printed check payment — P0 (GA)
- **FR**: PDF compatible with standard business check stock — P0 (GA)
- **FR**: Check generation triggered simultaneously with ACH file generation on payroll submission — P0 (GA)

### Problem / Rationale
A meaningful share of construction field workers do not have bank accounts or prefer physical checks. Without a system-generated check, admins must write checks by hand or use a separate tool — creating inconsistency, compliance risk (wrong MICR encoding), and administrative burden. This epic brings check generation into the payroll workflow so that both ACH and check employees are handled in a single submission.

### In Scope
- PDF check face generation for all employees with `payment_method = CHECK`
- PDF format compatible with standard business check stock (MICR encoding, check layout)
- Check generation triggered automatically on payroll finalization, in parallel with ACH file generation
- PDF downloadable by admin from the disbursement status screen (per-employee or batch)
- Check face includes: employee name, net pay amount, pay date, check number, company name, routing/account (company), MICR line
- Check number sequencing managed by the system
- `DisbursementRecord` written for check-payment employees with `payment_method = CHECK` and `status = GENERATED`

### Out of Scope (for this epic)
- Physical check printing infrastructure or mailed check fulfillment — PDF-only for GA (OQ-5 to confirm)
- Check stock procurement or physical distribution logistics
- ACH disbursement — E6-2
- Pay stub attachment to check envelope — Pay Stubs (E7)
- Check signing automation (digital signature on check face is a future enhancement)

### Example "Super Stories"
- As a PR Admin, I want a print-ready PDF check generated automatically when I submit payroll, so that I don't need to hand-write checks or use a separate tool.
- As a PR Admin, I want to download all check PDFs as a batch after submitting payroll, so that I can print them in one step before pay day.
- As an Employee paid by check, I want my check to be compatible with my bank's deposit requirements, so that I don't have issues cashing it.

### Acceptance Criteria Themes
- For every employee with `payment_method = CHECK`, a PDF check face is generated automatically on payroll finalization.
- PDF check face contains all required elements: employee name, net pay amount, pay date, check number, company name, MICR line, and routing/account (company).
- PDF is compatible with standard business check stock formats (verified against at least one major check stock standard).
- PDFs are available for admin download immediately after payroll finalization (per-employee and batch download).
- Check generation occurs simultaneously with ACH file generation; neither blocks the other.
- Check-payment employees appear in the disbursement status view with `status = GENERATED` (and later `DISTRIBUTED` if manually updated by admin).
- Check numbers are sequentially assigned and do not conflict across payroll runs.

### Dependencies & Risks
- **Upstream**: Employee payment method designation from E2 (Employee Management)
- **Upstream**: Net pay amounts from E5 (Tax Withholding & Deductions)
- **Upstream**: E6-1 finalization must complete before check generation triggers
- **Risk**: Check stock format compatibility — confirm with design/legal (noted in PRD); requires validation against at least one standard check stock before GA
- **Risk**: Physical infrastructure for mailed checks may be required in some states — OQ-5; PDF-only assumed for GA
- **Open Question (OQ-5)**: PDF-only is assumed for GA; physical check mailing is out of scope unless OQ-5 changes this

### Success Metrics / KPIs
- Check PDFs generated for 100% of `CHECK`-payment employees on every payroll run
- Admin-reported check generation errors: **0** post-GA (tracked via `check_generation_error` event)
- Admin time to produce checks post-payroll submission: **< 5 minutes** (directional; vs. manual baseline)

### Assumptions
- PDF-only is sufficient for GA; physical check mailing/fulfillment is a post-GA capability (pending OQ-5)
- MICR encoding is handled in the PDF layer; no separate check-printing hardware is required from Prism
- Company bank account (routing/account for check face) is sourced from E1 Company Setup and is already verified

---

## E6-4 — Failed ACH Detection, Notification & Guided Retry

### Goal / Outcome
When an ACH return occurs — account closed, insufficient funds, invalid account number — the system detects it, translates the NACHA return code into plain-language action guidance, and surfaces a prioritized exception workflow to the admin. The admin can resolve the employee's bank account and initiate a retry without leaving Prism. This epic drives the < 24-hour resolution time target and eliminates the current failure mode where SMB tools surface errors poorly with no guided path forward.

### Primary Personas
- **PR Admin** — receives the alert, resolves the exception, and initiates retry
- **Employee** — notified of payment failure (P1) and prompted to update bank info

### Business & PRD Drivers
- **G2**: Failed ACH disbursements are detected, surfaced, and retried with guided admin workflow
- **UC-6**: Surface failed ACH returns with return reason and guided retry workflow
- **FR**: Receive ACH return notifications with NACHA codes (R01–R33) — P0 (GA)
- **FR**: Surface failed returns with employee name, return code, plain-language reason, recommended action — P0 (GA)
- **FR**: Flag affected employee bank account; block future ACH to same account until resolved — P0 (GA)
- **FR**: Support admin-initiated retry after employee updates bank account — P0 (GA)
- **FR**: Notify affected employee of payment failure — P1 (GA)

### Problem / Rationale
When an ACH transfer fails, construction SMB admins typically find out from bank statements or an angry employee — not from their payroll tool. There is no in-product surfacing of return codes, no guided resolution path, and no retry workflow. The result is that employees go unpaid for days while admins scramble. This epic closes that loop entirely — from detection to notification to resolution.

### In Scope
- ACH return notification ingestion from ACH partner API (NACHA return codes R01–R33)
- Per-return record creation (`ACHReturn` entity: disbursement ID, return code, plain-language reason, timestamp)
- Admin dashboard exception surfacing: employee name, return code, plain-language reason, recommended action (e.g., "Account closed — ask employee to provide a new account")
- Employee bank account flagged as `INVALID_ACH` after return; future ACH disbursements to that account blocked until resolved
- Admin-initiated retry flow: admin navigates to exception → employee updates bank account (via E2) → admin confirms new account → retry disbursement triggered
- Retry generates a new `DisbursementRecord` and, if ACH, a new ACH file segment transmitted to the ACH partner
- Employee notification of payment failure via preferred channel (email/SMS) — P1
- Retry status tracked (same status lifecycle: Pending → Transmitted → Settled / Returned)

### Out of Scope (for this epic)
- Employee bank account update UI — E2 Employee Management (this epic triggers the need; E2 provides the capability)
- Initial ACH file generation and transmission — E6-2
- Notification infrastructure (channel delivery) — assumed shared service
- Instant ACH (same-day retry) — may not be available depending on ACH partner; fallback is check (E6-3)

### Example "Super Stories"
- As a PR Admin, I want to see a clear exception alert when an ACH return is received, with the employee's name and a plain-language reason, so that I know exactly who wasn't paid and why.
- As a PR Admin, I want the system to block future ACH to a flagged account automatically, so that I don't accidentally re-send to a closed or invalid account on the next payroll run.
- As a PR Admin, I want to initiate a retry disbursement after the employee updates their bank account, so that the employee gets paid without waiting for the next payroll cycle.
- As an Employee, I want to be notified when my payment fails and prompted to update my bank account, so that I can act quickly and minimize the delay in receiving pay (P1).

### Acceptance Criteria Themes
- ACH return codes from the ACH partner are received, parsed, and logged as `ACHReturn` records within one business day of the return event.
- For every ACH return, the admin sees: employee name, NACHA return code, plain-language explanation (not raw code), and a recommended resolution action.
- The affected employee's bank account is automatically flagged and blocked from future ACH disbursements until the admin clears the hold after a successful account update.
- Admin can initiate a retry disbursement for a failed ACH from within the exception workflow; the retry generates a new disbursement record and is trackable through the same status lifecycle.
- Retry disbursement succeeds for a valid replacement account (end-to-end tested in staging with ACH partner).
- Employee notification of payment failure is sent via their preferred channel within the same business day as the return (P1).
- All return and retry events are appended to the `DisbursementRecord` audit trail.

### Dependencies & Risks
- **Critical**: ACH partner must provide return code webhooks/callbacks — confirm during ACH partner selection (OQ-1)
- **Upstream**: E6-2 ACH transmission must be live for real returns to occur; this epic is GA-only
- **Upstream**: Employee bank account update capability in E2 must be available before retry can be initiated
- **Risk**: Return notification latency from ACH partner — if returns arrive slowly, resolution time target (< 24 hours) may be impacted; SLA with ACH partner required
- **Risk**: Same-day final pay states (CA, CO, NV) may require instant retry capability; fallback to printed check (E6-3) may be the only compliant option — OQ-4

### Success Metrics / KPIs
- Failed ACH resolution time (admin notified → retry initiated): **< 24 hours** (operational target)
- Failed ACH rate: **< 1%** of disbursements
- Failed returns reaching admin dashboard within next business day: **100%**
- Employee notification delivery rate (P1): **> 98%**

### Assumptions
- The ACH partner provides return codes via API/webhook within standard NACHA return timeframes (typically T+2 to T+3 business days for most codes)
- Employee notification delivery (email/SMS) uses a shared notification service; this epic defines the trigger and content, not the channel infrastructure
- Retry after bank account update is treated as a new off-cycle disbursement event, not a re-run of the original payroll run

---

## E6-5 — Off-Cycle Payroll Run Execution

### Goal / Outcome
Admins can initiate a targeted payroll run for one or more specific employees outside the regular schedule — for termination final pay, bonuses, or corrections — without re-running the full payroll or touching other employees. This epic enables Prism to meet state final pay timing requirements and gives SMB owners a fast, auditable path for common out-of-cycle payment needs.

### Primary Personas
- **PR Admin** — initiates and submits the off-cycle run
- **Employee** — receives a timely final pay, bonus, or corrected payment

### Business & PRD Drivers
- **G3**: Off-cycle payroll runs (termination, bonus, correction) can be executed without full payroll re-run
- **UC-7**: Initiate and process off-cycle payroll runs
- **FR**: Initiate off-cycle run for one or more specific employees — P1 (GA)
- **FR**: Off-cycle run types: termination final pay, bonus, correction/adjustment — P1 (GA)
- **FR**: Full gross-to-net calculation and disbursement for selected employees and pay items — P1 (GA)
- **FR**: Off-cycle runs recorded in payroll run history with run type label — P1 (GA)

### Problem / Rationale
Termination final pay, bonuses, and payroll corrections are routine events in construction — particularly in high-turnover field crews. Most tools require a full payroll re-run or a completely manual process, which is slow, error-prone, and non-compliant in states with immediate final pay requirements (CA: same day for involuntary termination). This epic makes off-cycle execution a first-class, streamlined, and auditable workflow.

### In Scope
- Off-cycle run initiation UI: admin selects "New Off-Cycle Run," chooses run type (termination final pay, bonus, correction/adjustment), and selects one or more employees
- Pay item entry for the selected employees (hours, bonus amounts, adjustment amounts as appropriate for run type)
- Full gross-to-net calculation scoped to the selected employees and off-cycle pay items (via E5 Tax Withholding Engine)
- Pre-disbursement review and confirmation (same confirmation gate as E6-1, scoped to off-cycle run)
- Pay period finalization for the off-cycle run: separate `PayrollRun` record with `run_type` label (e.g., `TERMINATION`, `BONUS`, `CORRECTION`)
- Disbursement initiation: ACH (E6-2 path) or printed check (E6-3 path) depending on employee payment method
- Off-cycle run appears in payroll run history with run type label, employee(s), and amounts
- Off-cycle run scheduled for earliest available disbursement date or admin-selected date

### Out of Scope (for this epic)
- Instant/same-day ACH disbursement (depends on ACH partner capability and OQ-4 resolution; check is fallback)
- Recurring off-cycle schedules or templates (future enhancement)
- Bulk off-cycle runs across all employees (that's a regular payroll run)
- Retroactive payroll corrections that affect prior tax filings (Tax Filing module)

### Example "Super Stories"
- As a PR Admin, I want to initiate a termination final pay run for a single employee on their last day, so that I comply with state final pay timing requirements without running payroll for the entire company.
- As a PR Admin, I want to issue a bonus payment for a specific employee between regular payroll cycles, so that I can reward performance without waiting for the next scheduled run.
- As a PR Admin, I want to submit a correction/adjustment for an underpaid employee from the prior run, so that the employee receives the correct amount quickly.
- As a PR Admin, I want off-cycle runs to appear separately in my payroll history with a type label, so that I can distinguish them from regular payroll runs during audits.

### Acceptance Criteria Themes
- Admin can initiate an off-cycle run selecting one or more employees and a run type (termination, bonus, correction) from the payroll dashboard.
- Gross-to-net calculation is performed for only the selected employees and the specified off-cycle pay items; no other employees are affected.
- Off-cycle run goes through the same pre-disbursement review and finalization steps as a regular run (E6-1 pattern).
- Disbursement (ACH or check) is initiated upon finalization using the same infrastructure as regular payroll (E6-2/E6-3).
- Off-cycle run is recorded in payroll run history with run type label, participating employees, and submitted amounts.
- Off-cycle run for termination final pay can be initiated and completed in < 30 minutes from initiation to disbursement trigger.
- Off-cycle runs do not re-calculate or re-disburse any amounts for non-participating employees.

### Dependencies & Risks
- **Upstream**: E5 Tax Withholding Engine must support scoped calculation for a subset of employees with off-cycle pay items
- **Upstream**: E6-1 finalization pattern is reused for off-cycle runs
- **Upstream**: E6-2 (ACH) and E6-3 (check) disbursement infrastructure must be live for GA off-cycle runs
- **Risk**: State same-day final pay requirements (CA, CO, NV) may demand instant disbursement capability; if 2-day ACH is the minimum, printed check becomes the compliant fallback — OQ-4 requires legal review before this risk is mitigated
- **Risk**: Tax treatment for termination pay and bonuses has state-specific rules (supplemental wage withholding) — verify E5 handles these correctly for off-cycle run types

### Success Metrics / KPIs
- Off-cycle run completion time (initiation to disbursement trigger): **< 30 minutes**
- Off-cycle runs resulting in compliance issues (missed state final pay timing): **0**
- Off-cycle run frequency tracked via `off_cycle_run_initiated` event (by type) for product insight

### Assumptions
- Off-cycle runs for correction/adjustment are additive (pay the delta), not a re-run of the original pay period; retroactive tax adjustments are handled via Tax Filing module
- Instant/same-day ACH is not guaranteed at GA; printed check is the documented fallback for same-day state requirements
- Admin selects the effective pay date for the off-cycle run; system does not automatically determine it based on state law (legal review required)

---

## Traceability Table

| Requirement ID | Short Description | Epic(s) |
|---------------|-------------------|---------|
| G1 | Employees receive correct net pay on or before scheduled pay date | E6-2, E6-3 |
| G2 | Failed ACH disbursements detected, surfaced, and retried | E6-4 |
| G3 | Off-cycle runs without full payroll re-run | E6-5 |
| G4 | Immutable, auditable disbursement record for every run | E6-1 |
| UC-1 | Generate ACH file and submit to bank | E6-2 |
| UC-2 | Generate printed check PDF | E6-3 |
| UC-3 | Pre-disbursement summary before submission | E6-1 |
| UC-4 | Pay period finalization (irreversible close) | E6-1 |
| UC-5 | Per-employee disbursement status tracking | E6-2 |
| UC-6 | Surface failed ACH returns with guided retry | E6-4 |
| UC-7 | Off-cycle payroll run initiation and processing | E6-5 |
| UC-8 | Next-day vs. 2-day ACH settlement selection | E6-2 |
| UC-9 | Split disbursement across 2 bank accounts | E6-2 |
| FR – Pre-disbursement summary | Total net, ACH/check split, pay date, funding account | E6-1 |
| FR – Explicit admin confirmation | "Submit Payroll" CTA | E6-1 |
| FR – Pay period finalization / audit log | Immutable record: run ID, approver, timestamp | E6-1 |
| FR – Admin unlock (P1) | Second-approval unlock with audit record | E6-1 |
| FR – NACHA ACH file generation | NACHA-compliant ACH file | E6-2 |
| FR – 2-day ACH settlement | Standard settlement path | E6-2 |
| FR – Next-day ACH (P1) | Accelerated settlement path | E6-2 |
| FR – Split direct deposit | Up to 2 accounts, % or fixed-dollar | E6-2 |
| FR – Disbursement status per employee | Pending → Transmitted → Settled/Returned | E6-2 |
| FR – PDF check face generation | Print-ready check for check-payment employees | E6-3 |
| FR – Check stock compatibility | Standard business check stock format | E6-3 |
| FR – ACH return code ingestion | R01–R33 NACHA return codes | E6-4 |
| FR – Admin return surfacing | Name, code, plain-language, recommended action | E6-4 |
| FR – Account flag and block | Block future ACH to invalid account | E6-4 |
| FR – Admin-initiated retry | Retry after employee bank account update | E6-4 |
| FR – Employee failure notification (P1) | Notify employee of payment failure | E6-4 |
| FR – Off-cycle run initiation | Termination, bonus, correction run types | E6-5 |
| FR – Off-cycle gross-to-net | Scoped calculation for selected employees | E6-5 |
| FR – Off-cycle run history label | Run type label in payroll run history | E6-5 |
| NFR – Security | ACH encrypted in transit; account numbers masked/not logged | E6-2, E6-4 |
| NFR – Reliability | 99.9% uptime for submission and ACH initiation | E6-2 |
| NFR – Audit | Immutable disbursement record per run | E6-1, E6-2, E6-3, E6-4 |
| NFR – Compliance | NACHA compliance; state pay timing requirements | E6-2, E6-5 |
| NFR – Performance | ACH file generation for 100 employees < 60 seconds | E6-2 |
| OQ-1 | ACH partner selection | E6-2, E6-4 |
| OQ-2 | Next-day ACH GA vs. post-GA scope | E6-2 |
| OQ-3 | Unlock / correction approval workflow | E6-1 |
| OQ-4 | Same-day final pay compliance (CA/CO/NV) | E6-4, E6-5 |
| OQ-5 | PDF-only vs. physical check mailing | E6-3 |
