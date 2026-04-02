# PRD: Prism Construction Payroll — Disbursement & Money Movement

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Pay Stubs, Tax Filing, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Disbursement & Money Movement module is the final operational step in the payroll workflow — it gets money to workers and records the financial transaction. It encompasses ACH direct deposit to employee bank accounts, printed check generation, off-cycle payroll runs (termination, bonus, correction), pay period finalization (irreversible close with audit record), and failed payment handling and retry. At Beta, it supports a real payroll calculation run but disbursement remains manual or stubbed. At GA, it delivers live ACH direct deposit and printed check generation with full confirmation and retry infrastructure.

### 1b. Problem Statement

For construction SMB contractors, the moment of paycheck delivery is high-stakes and time-sensitive. Weekly payroll cycles are the norm (state law requirements for manual laborers), and a missed or failed disbursement on Friday afternoon is a workforce and trust crisis — not just an administrative inconvenience.

Current failure modes:

- **Manual ACH initiation**: Most SMB owners using QuickBooks or generic tools initiate bank transfers manually, creating a risk of missed runs, wrong amounts, or duplicate payments
- **No failed payment handling**: When an ACH return occurs (wrong account, insufficient funds), SMB tools surface the error poorly and provide no guided retry workflow
- **Off-cycle blindness**: Termination final pay, bonuses, and payroll corrections require off-cycle runs that most tools make cumbersome — some require re-running the entire payroll
- **No disbursement audit trail**: After money moves, there's no per-employee confirmation of receipt accessible to the admin — only bank statements

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Employees receive correct net pay on or before the scheduled pay date, every run |
| G2 | Failed ACH disbursements are detected, surfaced, and retried with guided admin workflow |
| G3 | Off-cycle payroll runs (termination, bonus, correction) can be executed without full payroll re-run |
| G4 | Every payroll run produces an immutable, auditable disbursement record |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| On-time disbursement rate (employee receives pay by scheduled date) | 99.9% | Operational |
| Failed ACH rate | <1% — **Inferred** | Quality |
| Failed ACH resolution time (admin notified → retry initiated) | <24 hours — **Inferred** | Operational |
| Off-cycle run completion time | <30 min from initiation to disbursement trigger — **Inferred** | Efficiency |
| Payroll runs with complete disbursement audit record | 100% | Compliance |

### 1e. Out of Scope

- Net pay calculation (Tax Withholding & Deductions — E5)
- Pay stub generation and delivery (Pay Stubs & Deliverables — E7)
- Tax payment to agencies / tax remittance (Tax Remittance & Payment — E8b)
- Employee bank account configuration (Employee Management — E2)
- Payroll accounting GL journal entries (Prism Accounting Integration — E9)
- Benefits payment / COBRA (future)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Payroll goes out on time every week without manual bank transfers | Fear of missed deposits; uncertainty about what "submitted" means vs. "confirmed" | Desktop; Friday deadline pressure |
| **Employee** | W-2 field worker or office staff | Get paid on time to the right account | Getting a check they can't cash; wrong amount hitting the wrong account | Mobile; weekly expectation |
| **Owner / Exec** | Business owner | Know payroll has cleared; understand cash impact | "How much is coming out of my account today vs. tomorrow?" | Mobile; episodic |

### 2b. User Journeys / Workflows

**Primary: Regular Payroll Run Disbursement (GA)**

```
Admin approves payroll run (gross-to-net complete, AI anomaly review done)
 │
 ├─ System displays pre-disbursement summary:
 │   ├─ Total net pay amount
 │   ├─ Employee count and breakdown (ACH vs. check)
 │   ├─ Scheduled pay date
 │   └─ Funding account and available balance (if bank integration supports)
 │
 ├─ Admin clicks "Submit Payroll"
 │   └─ Pay period finalized (irreversible close)
 │       └─ Audit record created: run ID, approver, timestamp, total amounts
 │
 ├─ System initiates disbursement:
 │   ├─ ACH file generated per NACHA standard → submitted to bank/ACH partner
 │   └─ Check generation triggered for check-payment employees (PDF check face)
 │
 ├─ ACH processing (2-day settlement standard):
 │   ├─ Day 1: ACH file transmitted to originating bank
 │   ├─ Day 2: Funds settle to employee accounts (standard) or Day 1 (next-day if configured)
 │   └─ Confirmation: settlement confirmation received; status updated per employee
 │
 ├─ Admin dashboard shows disbursement status per employee:
 │   ├─ Pending → Transmitted → Settled / Returned
 │   └─ Any ACH return (R01, R02, R03, etc.) surfaced as actionable exception
 │
 └─ Failed ACH workflow:
     ├─ Admin notified with return reason code and plain-language explanation
     ├─ Employee profile flagged for bank account update
     └─ Admin initiates retry or arranges alternative payment (check)
```

**Secondary: Off-Cycle Payroll Run**

```
Trigger: termination final pay / bonus / payroll correction
Admin → "New Off-Cycle Run" → select employees → enter pay items
→ System calculates gross-to-net for selected employees only
→ Admin reviews → submits → disbursement initiated outside normal schedule
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Generate ACH file and submit to bank for direct deposit | P0 — GA |
| UC-2 | Generate printed check (PDF check face) for check-payment employees | P0 — GA |
| UC-3 | Display pre-disbursement summary before payroll is submitted | P0 |
| UC-4 | Finalize pay period (irreversible close with audit record) | P0 |
| UC-5 | Track disbursement status per employee (pending → transmitted → settled) | P0 — GA |
| UC-6 | Surface failed ACH returns with return reason and guided retry workflow | P0 — GA |
| UC-7 | Initiate and process off-cycle payroll runs | P1 — GA |
| UC-8 | Support next-day vs. 2-day ACH settlement selection | P1 — GA |
| UC-9 | Split disbursement across 2 bank accounts per employee (configured in E2) | P0 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Pre-Disbursement Review

- The system shall display a pre-disbursement summary before payroll submission: total net pay, employee count, ACH vs. check split, scheduled pay date, funding account — **P0**
- The system shall require explicit admin confirmation ("Submit Payroll") before any disbursement is triggered — **P0**
- The system shall display any unresolved warnings (AI anomaly flags, open exceptions) on the pre-disbursement screen — **P1**

#### Pay Period Finalization

- Upon admin confirmation, the system shall finalize the pay period: mark the run as closed, record the approver user, timestamp, and total amounts in an immutable audit log — **P0**
- A finalized payroll run shall not be editable; corrections require an off-cycle adjustment run — **P0**
- The system shall support an admin "unlock" capability (with second approval and audit record) for exceptional cases — **P1** — ⚠️ *Requires human review: approval authority for unlocks*

#### ACH Direct Deposit

- The system shall generate an ACH file in NACHA-compliant format for all direct deposit employees — **P0** (GA)
- The system shall support standard 2-day ACH settlement — **P0** (GA)
- The system shall support next-day ACH settlement where available from the ACH partner — **P1** (GA)
- The system shall support split direct deposit across up to 2 employee bank accounts with percentage or fixed-dollar allocation (as configured in E2 Employee Management) — **P0** (GA)
- The system shall transmit the ACH file to the ACH partner on the correct initiation date to meet the scheduled pay date — **P0** (GA)
- ⚠️ *Requires human review: ACH partner / bank selection (Plaid, Stripe, dedicated ACH processor)*

#### Printed Check Support

- The system shall generate a PDF check face for employees designated for printed check payment — **P0** (GA)
- The PDF shall be compatible with standard business check stock — **P0** (GA) — *Inferred: confirm check stock format with design/legal*
- Check generation shall be triggered simultaneously with ACH file generation on payroll submission — **P0** (GA)

#### Disbursement Status Tracking

- The system shall display disbursement status per employee: Pending → Transmitted → Settled (or Returned) — **P0** (GA)
- Status shall update automatically as the ACH partner provides settlement confirmations — **P0** (GA)
- Admin shall be able to view the status of any prior run's disbursement — **P1**

#### Failed ACH Handling

- The system shall receive ACH return notifications from the ACH partner with NACHA return reason codes (R01–R33) — **P0** (GA)
- The system shall surface failed returns to the admin with: employee name, return code, plain-language reason, and recommended action — **P0** (GA)
- The system shall flag the affected employee's bank account for update and block future ACH to the same account until resolved — **P0** (GA)
- The system shall support admin-initiated retry of a failed ACH after the employee updates their bank account — **P0** (GA)
- The system shall notify the affected employee of the payment failure (notification — per employee preference) — **P1** (GA)

#### Off-Cycle Payroll Runs

- The system shall support initiation of an off-cycle payroll run for one or more specific employees — **P1** (GA)
- Off-cycle run types shall include: termination final pay, bonus, correction/adjustment — **P1** (GA)
- An off-cycle run shall execute the full gross-to-net calculation and disbursement flow for the selected employees and pay items — **P1** (GA)
- Off-cycle runs shall be recorded in the payroll run history with a run type label — **P1** (GA)

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security** | ACH files encrypted in transit; bank account numbers masked in all UI views; routing/account numbers never logged |
| **Reliability** | Payroll submission and ACH initiation available 99.9% uptime; no missed pay dates attributable to system unavailability |
| **Audit** | Immutable disbursement record per run: employee, amount, payment method, status, timestamps |
| **Compliance** | NACHA ACH file format compliance; applicable state same-day/next-day pay requirements |
| **Performance** | ACH file generation for 100 employees completes in <60 seconds — *Inferred* |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| PayrollRun | run_id, company_id, pay_period, status, approver, total_gross, total_net, submitted_at | Finalization record |
| DisbursementRecord | run_id, employee_id, payment_method, amount, account(s), status, transmitted_at, settled_at | Per-employee disbursement |
| ACHReturn | disbursement_id, return_code, return_reason, returned_at | ACH return tracking |
| OffCycleRun | run_id, run_type, initiated_by, employees, pay_items | Off-cycle metadata |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Bank / ACH Partner (Plaid, Stripe, or dedicated) | Generate and transmit ACH files; receive settlement confirmations and return notifications | On payroll finalization | **Buy** — critical path; vendor selection required |
| Employee Management (E2) | Source of employee bank account details, payment method, split configuration | On ACH file generation | Internal |
| Tax Withholding Engine (E5) | Source of net pay amounts per employee | Sequential — after E5 | Internal |
| Tax Remittance (E8b) | Tax withholding amounts also disbursed to agencies separately | Post-payroll trigger | Internal |
| Prism Accounting (E9) | GL entries for payroll expense, net pay liability, tax liability | Post-finalization | Internal |

#### Platform / Infrastructure Constraints

- Bank account data must be encrypted at rest (AES-256) and never appear in logs
- ACH file transmission must occur on NACHA banking day schedule; system must account for holidays
- ⚠️ **Requires human review**: ACH partner selection is critical path for GA; Plaid vs. Stripe vs. dedicated payroll ACH processor (e.g., Dwolla, Modern Treasury)

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E6-1: Pre-Disbursement Review & Finalization** | Summary screen, admin confirmation, pay period close, irreversible audit record | G4 | UC-3, UC-4 |
| **E6-2: ACH Direct Deposit** | NACHA file generation, bank transmission, settlement tracking, split accounts | G1 | UC-1, UC-5, UC-8, UC-9 |
| **E6-3: Printed Check Generation** | PDF check face generation for check-payment employees | G1 | UC-2 |
| **E6-4: Failed Payment Handling** | ACH return detection, admin alerts, employee account update trigger, retry workflow | G2 | UC-6 |
| **E6-5: Off-Cycle Payroll Runs** | Termination, bonus, and correction runs outside normal schedule | G3 | UC-7 |

### 3e. High-Level Acceptance Criteria

- Admin can submit payroll and have ACH files transmitted to the bank on the correct initiation date for a Friday pay date without any manual banking action
- Employee bank accounts configured with a two-account split receive disbursement allocated correctly (percentage or fixed dollar) across both accounts
- A failed ACH return (e.g., R02 Account Closed) surfaces to the admin within the next business day with the employee name, plain-language reason, and a direct link to update the employee's bank account
- Finalized payroll runs cannot be edited; the admin sees a clear "Finalized" status with submission timestamp and approver identity
- Off-cycle runs for termination final pay can be initiated and submitted without requiring re-run of any other employees
- All disbursement records include: employee, net pay amount, payment method, account (masked), transmitted date, and settled/returned status

### 3f. Links to Prototypes

- Pre-Disbursement Summary Screen — [TBD]
- Disbursement Status Dashboard — [TBD]
- Failed ACH Resolution Flow — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- No actual disbursement — mock/simulated run produces outputs only
- Pre-disbursement summary display (amounts only; no banking)
- Pay period finalization stub (run marked closed)

**Beta (Trimble Dimensions)**
- Real payroll calculation run (no actual ACH disbursement — manual or stubbed)
- Pre-disbursement summary with employee-level breakdown
- Pay period finalization with audit record
- Demo of disbursement flow (no live money movement required)

**GA (Generally Available)**
- Live ACH direct deposit — NACHA-compliant, 2-day settlement
- Next-day ACH option
- Split direct deposit (2 accounts)
- Printed check PDF generation
- Disbursement status tracking (pending → transmitted → settled/returned)
- Failed ACH return handling and retry
- Off-cycle payroll runs (termination, bonus, correction)

---

# 5. Supporting Information

### 5a. Assumptions

- Employee bank accounts are verified (micro-deposit or instant verification) before first payroll run via E2 Employee Management
- The ACH partner handles NACHA file transmission and provides settlement and return notifications via API
- Company funding account is configured and verified during E1 Company Setup
- Next-day ACH is offered only where the selected ACH partner supports it and the customer's bank participates

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| ACH / bank partner selection and integration | Engineering / Finance | **High** — GA critical path |
| Net pay amounts from Tax Withholding Engine (E5) | E5 team | **High** — sequential dependency |
| Employee bank account data from E2 | E2 team | **High** — needed for ACH file |
| NACHA banking calendar (holidays) | Operations | **Medium** |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| ACH partner selection delayed past Beta | Medium | High | Stub disbursement at Beta; select partner Sprint 1; contract in parallel | Yes — vendor contract |
| NACHA file format errors causing rejected batch | Low | High | NACHA format test suite; ACH partner validation before live | Yes — compliance review |
| Admin submits payroll on wrong date (misses NACHA cutoff) | Medium | High | Clear pay date + submission deadline display; calendar warnings | No |
| State same-day final pay rules require instant disbursement capability | Medium | High | Off-cycle run available immediately; if instant ACH not available, check as fallback | Yes — legal review |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| On-time disbursement rate | `disbursement_settled_on_time` / `disbursement_settled_late` | Operations |
| Failed ACH rate and return codes | `ach_return_received` (code, employee_id) | Operations |
| Off-cycle run frequency | `off_cycle_run_initiated` (type) | Product |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Which ACH / bank partner? (Plaid, Stripe, Dwolla, Modern Treasury, or bank-direct) | Engineering / Finance | Sprint 1 |
| OQ-2 | Is next-day ACH in scope for GA or a post-GA enhancement? | Product | Sprint 2 |
| OQ-3 | What is the unlock / payroll correction approval workflow? Who can approve an unlock? | Product / Legal | Sprint 2 |
| OQ-4 | For termination final pay in CA/CO/NV (immediate requirement): can the system initiate a same-day ACH, or is a printed check the fallback? | Legal / Engineering | Sprint 2 |
| OQ-5 | Does check printing require physical infrastructure (check stock), or is PDF-only sufficient for GA? | Product / Operations | Sprint 1 |
