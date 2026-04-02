# PRD: Prism Construction Payroll — Tax Remittance & Payment

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Tax Withholding & Deductions, Tax Filing & Compliance Reporting, Disbursement, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Tax Remittance & Payment module handles the automated deposit of all withheld and employer payroll taxes to the appropriate federal, state, and local agencies. It manages federal deposit scheduling (EFTPS, semi-weekly and monthly depositor rules), state income tax payment submissions, SUTA payment submissions, and local tax payments. It also provides proactive alerts for upcoming deposit deadlines and surfaces missed or failed deposits before they become penalty events. This module is GA-only and closely paired with Tax Filing & Compliance Reporting (E8), which handles form generation while E8b handles the money movement to agencies.

### 1b. Problem Statement

Payroll tax deposits are the single most penalized area of payroll compliance. The IRS charges a graduated penalty of 2–15% of the tax not deposited on time, plus interest. For a construction SMB running $500K/year in payroll, a missed deposit schedule can cost $10,000+ in avoidable penalties. Yet most SMB owners do not know their deposit schedule, do not know the EFTPS banking day rules, and rely on their CPA to catch missed deposits quarterly — by which time penalties have already accrued.

Current failure modes:

- **Deposit schedule ignorance**: Employers don't know if they are a semi-weekly or monthly depositor (determined by lookback period), leading to deposits on the wrong schedule
- **EFTPS friction**: Logging into EFTPS manually to make deposits is time-consuming and error-prone; payments get missed on weeks with high operational load ("Friday Crunch")
- **State variability**: Each state has its own deposit schedule (monthly, quarterly), its own payment portal, and its own penalty structure — impossible to track manually across 3+ states
- **No penalty early warning**: By the time a penalty notice arrives, it covers multiple periods of noncompliance

### 1c. Goals

| # | Goal |
|---|------|
| G1 | All payroll tax deposits made on the correct schedule to the correct agencies, automatically |
| G2 | Zero IRS, state, or local tax deposit penalties attributable to Prism |
| G3 | Admin has real-time visibility into deposit status and upcoming obligations |
| G4 | Missed or failed deposits surface proactively before penalty accrual |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| On-time federal tax deposit rate (EFTPS) | 100% | Compliance |
| On-time state tax payment rate (all active states) | 100% | Compliance |
| IRS penalties for late deposits attributable to Prism | $0 | Compliance |
| Missed deposit alerts surfaced before penalty deadline | 100% | Quality |
| Admin time spent on tax payments per payroll cycle | <5 min — **Inferred** | Efficiency |

### 1e. Out of Scope

- Tax form generation (Form 941, W-2, state returns) — Tax Filing & Compliance Reporting (E8)
- Employee net pay disbursement (Disbursement — E6)
- Withholding calculation (E5)
- Benefits premium payments (future)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Tax deposits happen automatically; never get an IRS penalty notice | "I don't know when my deposits are due or how to use EFTPS" | Desktop; high anxiety |
| **External CPA / Bookkeeper** | Retained accountant | Verify deposits are made on schedule; reconcile liability accounts | Learning about missed deposits only when preparing quarterly returns | Desktop; periodic |
| **Owner / Exec** | Business owner | Know total tax cash outflow per payroll cycle | No cash flow visibility into when taxes are actually paid | Mobile; episodic |

### 2b. User Journeys / Workflows

**Primary: Automated Federal Tax Deposit (GA)**

```
Payroll run finalized (E6)
 │
 ├─ System calculates total federal tax liability for the run:
 │   ├─ Federal income tax withheld (all employees)
 │   ├─ Employee FICA (Social Security + Medicare)
 │   └─ Employer FICA (matching amounts)
 │
 ├─ System determines deposit due date:
 │   ├─ Monthly depositor: due by 15th of the following month
 │   └─ Semi-weekly depositor:
 │       ├─ Wages paid Wed/Thu/Fri → deposit by following Wednesday
 │       └─ Wages paid Sat/Sun/Mon/Tue → deposit by following Friday
 │
 ├─ System initiates EFTPS deposit on the correct date:
 │   └─ Amount: total FIT + employee FICA + employer FICA
 │
 ├─ EFTPS confirmation received → deposit record stored
 │
 └─ Admin dashboard updated: deposit status per payroll run
```

**Secondary: State Tax Payment**

```
End of state payment period (monthly / quarterly)
 │
 ├─ System accumulates state withholding for the period
 │
 ├─ System initiates payment via state e-payment portal or ACH
 │
 └─ Confirmation received → payment record stored → filing calendar updated
```

**Tertiary: Proactive Deposit Alert**

```
System detects upcoming deposit deadline within 3 banking days
→ Admin notified: "Federal payroll tax deposit of $X,XXX due [date] via EFTPS"
→ [If not yet initiated] System initiates on schedule
→ [If failed] Admin alerted with failure reason and action required
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Determine company's federal deposit schedule (semi-weekly vs. monthly depositor) | P0 — GA |
| UC-2 | Calculate federal tax deposit amount per payroll run | P0 — GA |
| UC-3 | Initiate and confirm EFTPS federal tax deposit on correct date | P0 — GA |
| UC-4 | Calculate and initiate state income tax payments per state schedule | P0 — GA |
| UC-5 | Calculate and initiate SUTA payments per state schedule | P0 — GA |
| UC-6 | Calculate and initiate local tax payments where applicable | P1 — GA |
| UC-7 | Surface upcoming deposit obligations and deadlines to admin | P0 — GA |
| UC-8 | Alert admin to missed or failed deposits before penalty accrual | P0 — GA |
| UC-9 | Provide tax payment history and cash impact per payroll run | P1 — GA |
| UC-10 | Reconcile deposits against 941 for quarterly review | P1 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Federal Deposit Schedule Management

- The system shall determine the company's federal deposit schedule (monthly or semi-weekly depositor) based on the lookback period (prior four quarters of Form 941 liability) — **P0**
- The system shall recalculate the deposit schedule annually and notify the admin if the schedule changes (e.g., from monthly to semi-weekly as payroll grows) — **P0**
- The system shall calculate the correct deposit due date for each payroll run based on the company's deposit schedule and the pay date — **P0**

#### Federal Tax Deposits (EFTPS)

- The system shall calculate the total federal tax deposit amount per payroll run: FIT withheld + employee FICA + employer FICA — **P0**
- The system shall initiate the EFTPS deposit on the correct due date automatically — **P0**
- The system shall receive and store EFTPS confirmation for each deposit — **P0**
- The system shall alert admin of upcoming federal deposits 3 banking days in advance — **P0**
- The system shall surface failed EFTPS deposits immediately with the failure reason and deadline for correction — **P0**
- ⚠️ *Requires human review: EFTPS API integration vs. delegated payment model*

#### State Income Tax Payments

- The system shall calculate the state income tax payment due for each active state per the state's payment schedule — **P0**
- The system shall initiate state tax payments via each state's preferred payment channel (state e-payment portal or ACH) — **P0**
- The system shall maintain a current list of state payment channels, schedules, and deadlines — **P0** — *Inferred: tax filing service provider likely required*
- ⚠️ *Requires human review: 50-state payment channel integration — build vs. buy (tax filing service)*

#### SUTA Payments

- The system shall calculate SUTA payment amounts per active state per the state's schedule — **P0**
- The system shall initiate SUTA payments to the appropriate state unemployment agency — **P0**

#### Local Tax Payments

- The system shall initiate local income tax payments to applicable municipalities where Prism collects local tax — **P1**

#### Deposit Alerts and Monitoring

- The system shall display an upcoming deposit calendar with: tax type, jurisdiction, amount, due date, and status — **P0**
- The system shall alert the admin when a deposit is within 3 banking days of its due date and has not yet been initiated — **P0**
- The system shall alert the admin immediately if a deposit fails, with return reason and remaining time before penalty — **P0**
- The system shall track the penalty-free correction window and escalate urgency of failed deposit alerts accordingly — **P1**

#### Reconciliation Support

- The system shall provide a deposit history report reconciling deposits to the 941: total FIT, SS, Medicare per quarter vs. amounts deposited — **P1**

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Compliance** | All deposits meet IRS and state deposit schedules; no late deposits from system error |
| **Security** | Company banking credentials and EFTPS enrollment details encrypted; never exposed in UI |
| **Reliability** | Tax deposit initiation available 99.9% uptime; automated retry on transient failures |
| **Audit** | Complete deposit history retained 7 years: amount, date initiated, confirmation number, status |
| **Accuracy** | Deposit amounts match gross-to-net calculation output for all applicable taxes |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| TaxDepositObligation | run_id, tax_type, jurisdiction, amount, due_date, status | Per payroll run per tax type |
| TaxDepositRecord | obligation_id, initiated_at, amount, confirmation_number, status, failure_reason | Per deposit |
| DepositSchedule | company_id, federal_schedule (monthly/semi-weekly), lookback_liability | Annual determination |
| StatePaymentConfig | state_code, payment_channel, schedule, due_date_rule, account_credentials | Per active state |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| EFTPS API | Federal tax deposit initiation and confirmation | Per deposit schedule | **External — requires EFTPS enrollment** |
| State e-payment portals / ACH | State income tax and SUTA payments | Per state schedule | **External — 50-state, recommend tax service** |
| Tax Withholding Engine (E5) | Source of all deposit amounts | Per payroll run close | Internal |
| Tax Filing Module (E8) | Deposit reconciliation against 941 | Quarterly | Internal |
| Prism Accounting (E9) | Tax liability accounts cleared upon deposit | Post-deposit | Internal |

#### Platform / Infrastructure Constraints

- ⚠️ **Requires human review**: EFTPS enrollment and API access — requires IRS form 8655 authorization; lead time is significant
- ⚠️ **Requires human review**: 50-state payment channel integration — tax filing/payment service (Symmetry, ADP, Atrix) strongly recommended over in-house for all states

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E8b-1: Federal Deposit Schedule & EFTPS** | Deposit schedule determination; EFTPS deposit initiation and confirmation | G1, G2 | UC-1, UC-2, UC-3 |
| **E8b-2: State Tax Payments** | State income tax and SUTA payment initiation per state schedule | G1, G2 | UC-4, UC-5 |
| **E8b-3: Local Tax Payments** | Local tax payment initiation for applicable municipalities | G1, G2 | UC-6 |
| **E8b-4: Deposit Monitoring & Alerts** | Upcoming obligation calendar; missed deposit alerts; penalty window tracking | G3, G4 | UC-7, UC-8 |
| **E8b-5: Deposit History & Reconciliation** | Payment history; 941 reconciliation support; audit trail | G3 | UC-9, UC-10 |

### 3e. High-Level Acceptance Criteria

- After each payroll run is finalized, the system automatically calculates the federal tax deposit due date and initiates the EFTPS deposit without admin manual action
- The system correctly identifies a company as a semi-weekly depositor and deposits federal taxes within the correct NACHA banking day window for the pay date
- A failed EFTPS deposit is surfaced to the admin within 24 hours with a plain-language reason and the number of days remaining before IRS penalty applies
- Admin can view an upcoming deposit calendar showing all federal, state, and local tax obligations due in the next 30 days with amounts and due dates
- Deposit amounts reconcile to the E5 withholding calculation output for all documented test scenarios
- All deposit records are retained for 7 years with confirmation numbers

### 3f. Links to Prototypes

- Tax Deposit Calendar / Dashboard — [TBD]
- Failed Deposit Alert Flow — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha / Beta**
- No tax remittance at Alpha or Beta
- Beta: deposit obligation awareness (upcoming amounts and dates shown in filing calendar from E8)

**GA (Generally Available)**
- Automated EFTPS federal deposits (monthly and semi-weekly depositor)
- State income tax payments (all active states)
- SUTA payments (all active states)
- Deposit monitoring and proactive alerts
- Failed deposit handling
- Deposit history and audit trail

**Post-GA**
- Local tax payments (municipalities)
- Deposit-to-941 reconciliation report

---

# 5. Supporting Information

### 5a. Assumptions

- EFTPS enrollment and IRS Form 8655 (Reporting Agent Authorization) are completed before GA
- A tax filing/payment service abstracts state payment channels — Prism does not build 50-state payment integrations individually
- The company's EFTPS PIN and state payment credentials are stored securely in company setup (E1) before GA

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| EFTPS API enrollment and authorization | Legal / Finance | **High** — multi-month lead time |
| Tax payment service provider selection (state channels) | Engineering / Legal | **High** — GA critical path |
| Withholding amounts from E5 | E5 team | **High** — deposit amounts depend on accurate withholding |
| Company payment credentials from E1 Company Setup | E1 team | **High** |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| EFTPS API authorization delayed | Medium | High | Begin enrollment at project kickoff; not last-minute | Yes — IRS process |
| State payment channel integration fails for specific state | Medium | Medium | Tax service provider abstracts this; validate coverage by state | Yes |
| Company's deposit schedule changes mid-year | Low | Medium | Annual recalculation with admin notification; real-time lookback tracking | No |
| Semi-weekly deposit date calculation error (NACHA banking day rules) | Low | High | Exhaustive test suite for all pay-date scenarios; legal review | Yes |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Federal deposit on-time rate | `eftps_deposit_initiated` vs. `eftps_due_date` | Compliance |
| State payment on-time rate | `state_payment_initiated` vs. `state_due_date` | Compliance |
| Failed deposit rate and cause | `deposit_failed` (reason, tax_type, jurisdiction) | Operations |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Has EFTPS enrollment and IRS Form 8655 authorization been initiated? | Legal / Finance | Sprint 0 |
| OQ-2 | Which tax payment service handles state channel integration? (Symmetry, ADP Filing, Atrix) | Engineering / Legal | Sprint 1 |
| OQ-3 | Does the system initiate deposits automatically, or does admin approve each deposit before it goes? | Product | Sprint 1 |
| OQ-4 | For the lookback period calculation: does Prism compute it from internal payroll history, or does admin confirm the schedule? | Product / Legal | Sprint 2 |
