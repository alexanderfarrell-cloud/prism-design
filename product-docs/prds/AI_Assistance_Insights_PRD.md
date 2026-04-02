# PRD: Prism Construction Payroll — AI-Powered Assistance & Insights

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Pay Stubs, Tax Filing, Tax Remittance, Prism Accounting Integration, Reporting & Audit, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The AI-Powered Assistance & Insights module layers intelligent, proactive assistance on top of Prism Construction Payroll's core calculation and compliance engine. Rather than replacing human judgment, it augments the "Overwhelmed Operator" with pattern recognition and anomaly detection that would otherwise require a payroll expert. The module delivers five core capabilities: payroll anomaly detection (flag unusual pay amounts before disbursement), tax setup advisor (proactive jurisdiction recommendations based on employee location and job sites), payroll run summaries (plain-language AI-generated run narrative), compliance alerts (proactive regulatory change notifications), and worker classification confidence scoring (IRS factor-based risk assessment). At Beta, anomaly detection and run summaries are available. At GA, all five capabilities are operational.

### 1b. Problem Statement

The "Overwhelmed Operator" running payroll for a 15-person construction crew does not have a payroll expert sitting next to them. They will submit a payroll with an error — not because they're careless, but because they don't have the professional context to recognize that a $1,200 paycheck for a laborer who normally earns $2,400 is suspicious. And they won't find out until the employee calls Friday evening.

Current failure modes:

- **No anomaly gate**: Every SMB payroll tool lets the admin submit payroll without flagging that an employee's pay is 50% below their historical average — a clear signal of a data entry error or time collection problem
- **Reactive tax setup**: State and local tax jurisdiction setup is reactive — the admin discovers they owe Philadelphia wage tax when a tax notice arrives, not when they assign an employee to a Philly job site
- **No payroll narrative**: After a run, the admin has a dense payroll register. There's no plain-language summary of what happened: "3 employees had overtime this week, total cost was $X higher than last week"
- **Classification guessing**: Owner/operators frequently make worker classification decisions (employee vs. 1099) based on cash flow preference, not IRS factors — and don't know their risk exposure until an audit

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Catch payroll errors before disbursement — not after employees call |
| G2 | Proactively surface tax jurisdiction requirements before they become missed obligations |
| G3 | Make the payroll run output understandable to a non-payroll-expert in under 60 seconds |
| G4 | Surface worker classification risk before it becomes IRS exposure |
| G5 | Reduce payroll-related support calls from admin by >25% — **Inferred** |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Payroll errors caught by anomaly detection before disbursement | >80% of detectable anomalies — **Inferred** | Quality |
| Tax jurisdiction alerts converted to admin action (new state/local added) | >70% — **Inferred** | Engagement |
| Payroll run summaries generated without errors | 100% | Operational |
| High-risk worker classification flags reviewed by admin | 100% (flag shown; action at admin discretion) | Compliance |
| Admin support contacts for payroll questions (pre vs. post AI features) | -25% — **Inferred** | Efficiency |

### 1e. Out of Scope

- Full payroll expert chatbot / open-ended Q&A (future)
- Replacement of licensed payroll or tax advice — all AI outputs include appropriate disclaimer
- Benefits recommendations (future)
- Union CBA analysis (Tier 2+)
- Predictive budgeting / forecasting (future)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Get a safety net that catches errors before they cost money or trust | "I submitted payroll with an error and didn't find out until payday" | Desktop; time-pressured |
| **Owner / Exec** | Business owner | Quick understanding of what payroll cost and why it changed | Reads payroll register but doesn't understand WAOT adjustments | Mobile; episodic |
| **External CPA / Bookkeeper** | Retained accountant | Classification confidence; jurisdiction completeness | "My client keeps adding 1099 subcontractors who should be employees" | Desktop; periodic |

### 2b. User Journeys / Workflows

**Primary: Payroll Anomaly Detection (Beta)**

```
Admin initiates payroll calculation
 │
 ├─ AI engine analyzes each employee's pay for the run:
 │   ├─ Compare gross pay to: last 4-run rolling average for this employee
 │   ├─ Flag if: gross is >25% below average (possible missing hours)
 │   ├─ Flag if: gross is >40% above average (possible rate error or double entry)
 │   └─ Flag if: OT hours are 0 for an employee who has always had OT in this job type
 │
 ├─ Anomaly panel displayed before admin can proceed to disbursement:
 │   ├─ Employee name + anomaly description (plain language)
 │   └─ Admin action: "Review" → investigate or "Acknowledge" → proceed with reason
 │
 └─ Acknowledged anomalies logged in audit trail with admin's reason
```

**Secondary: Tax Setup Advisor (GA)**

```
Employee added to new job site in different state (time entry arrives from Traqspera)
 │
 ├─ AI detects: employee has hours in [New State] where no state withholding is configured
 │
 ├─ Advisor surfaces proactive alert:
 │   "Employee [Name] worked 8 hours in [State] this week.
 │    You may need to register for state withholding in [State].
 │    Based on the PA-OH reciprocity agreement, if the employee lives in PA,
 │    you may only need to withhold PA taxes."
 │
 └─ Admin directed to Employee Management → Tax Setup to configure or dismiss
```

**Tertiary: Payroll Run Summary (Beta)**

```
Payroll run finalized
 │
 ├─ AI generates plain-language summary (3-5 sentences):
 │   "This week's payroll for 14 employees totaled $28,450 in gross pay,
 │    $2,100 more than last week. The increase is primarily from overtime:
 │    3 employees exceeded 40 hours on Job 101 (Commercial Framing).
 │    [Employee A] had an unusually low paycheck this week — their hours were
 │    below average. Net pay to employees: $22,340."
 │
 └─ Displayed in: post-run summary screen + email notification to owner/admin
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Detect pay anomalies before disbursement (gross pay deviation from rolling average) | P0 — Beta |
| UC-2 | Flag zero-pay employees (active employee not in run) | P0 — Beta |
| UC-3 | Flag duplicate pay entries (same employee, same hours, same job) | P0 — Beta |
| UC-4 | Generate plain-language payroll run summary | P0 — Beta |
| UC-5 | Alert admin to new state/local tax jurisdiction triggered by Traqspera time entries | P0 — GA |
| UC-6 | Reciprocity guidance when employee crosses state lines | P0 — GA |
| UC-7 | Worker classification confidence score for each active 1099 subcontractor | P0 — GA |
| UC-8 | Proactive compliance alert for regulatory changes (rate changes, new state laws) | P1 — GA |
| UC-9 | Payroll run comparison narrative (this week vs. last week explanation) | P1 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Payroll Anomaly Detection (Beta)

- The system shall analyze each employee's gross pay in a payroll run against their 4-run rolling average — **P0** (Beta)
- Anomaly thresholds (preliminary — adjustable): gross pay >25% below average or >40% above average flagged as anomalies — **P0** (Beta) — ⚠️ *Requires human review: threshold calibration based on field data*
- The system shall flag active employees with $0 pay in a run (possible missed time or missing approval) — **P0** (Beta)
- The system shall detect potential duplicate time entries (same employee, same date, same job, same hours within a run) — **P0** (Beta)
- All anomalies shall be displayed in an anomaly panel before the pre-disbursement step — **P0** (Beta)
- Admin must either review (take action) or acknowledge (confirm proceed with reason) each anomaly — **P0** (Beta)
- Admin acknowledgements shall be logged in the audit trail with reason code — **P0** (Beta)

#### Payroll Run Summary (Beta)

- The system shall generate a 3-5 sentence plain-language summary of each payroll run, including: total gross pay, variance from prior run, primary cause of variance, notable individual events (anomalies, high OT), and net pay total — **P0** (Beta)
- Run summaries shall appear on the post-run summary screen and optionally in email notification to owner/admin — **P0** (Beta)
- Run summaries shall not expose individual employee pay data in the notification path (show totals only) — **P1** (Beta)

#### Tax Setup Advisor (GA)

- The system shall detect when time entries from Traqspera include a state or locality where no withholding is configured for the relevant employee — **P0** (GA)
- The system shall surface a plain-language alert with: the new jurisdiction detected, the employee(s) affected, a brief explanation of the withholding obligation, and any applicable reciprocity context — **P0** (GA)
- The system shall provide a direct action link to the employee's tax setup in Employee Management — **P0** (GA)
- Alerts shall be dismissable with a reason (e.g., "already registered," "short-duration exception") — **P0** (GA)

#### Worker Classification Confidence Score (GA)

- The system shall calculate a worker classification confidence score for each active 1099 subcontractor based on IRS behavioral control, financial control, and type-of-relationship factors captured during employee/contractor setup — **P0** (GA)
- The score shall be displayed as: Low Risk / Medium Risk / High Risk with a plain-language explanation — **P0** (GA)
- High-risk classifications shall surface as admin alerts requiring review — **P0** (GA)
- The system shall not make a legal determination; all scores include an appropriate disclaimer — **P0** (GA)
- ⚠️ *Requires human review: IRS factor scoring model and disclaimer language — legal review required*

#### Compliance Alerts (GA)

- The system shall monitor for and surface compliance alerts for: state minimum wage changes affecting any active payroll state, state OT rule changes, federal wage and hour law changes — **P1** (GA)
- Alerts shall include: what changed, when it takes effect, what action may be required — **P1** (GA)
- ⚠️ *Requires human review: data source for regulatory change monitoring — tax provider, legal service, or manual internal curation*

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Accuracy** | Anomaly detection false positive rate <10% — *Inferred; requires calibration* |
| **Performance** | Anomaly detection completes before admin reaches pre-disbursement screen; <10 seconds — *Inferred* |
| **Transparency** | All AI outputs labeled "AI-generated" with appropriate disclaimers where legal/tax advice could be inferred |
| **Privacy** | AI model does not retain or learn from individual employee PII in ways that could constitute a privacy violation |
| **Security** | AI-generated content accessible by authorized roles only (same as underlying payroll data) |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| EmployeePayHistory | employee_id, run_id, gross_pay, hours, pay_types (rolling 12 months) | Anomaly detection baseline |
| AnomalyRecord | run_id, employee_id, anomaly_type, detected_value, baseline_value, status, admin_reason | Per flagged anomaly |
| ClassificationFactors | contractor_id, factor_type, factor_value, score | From E2 Employee Management |
| JurisdictionAlert | employee_id, jurisdiction_detected, alert_type, status, dismissed_reason | Tax advisor alerts |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Earnings Engine (E4) | Source of gross pay for anomaly detection | On payroll calculation | Internal |
| Time Collection (E3) | Source of jurisdiction detection (work state from time entries) | On time ingestion | Internal |
| Employee Management (E2) | Source of contractor classification factors | On contractor review | Internal |
| AI / LLM Service | Run summary generation; plain-language explanation generation | On payroll finalization | **Buy or internal model — TBD** |
| Regulatory Data Source | Compliance alert monitoring | Ongoing | **Buy — tax/legal data provider** |

#### Platform / Infrastructure Constraints

- ⚠️ **Requires human review**: LLM / AI engine selection — internal model vs. API (OpenAI, Azure OpenAI, or similar). Prompt engineering for payroll context required.
- PII must not be passed to third-party AI APIs without data processing agreements; run summaries use aggregated/anonymized data where possible

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E11-1: Payroll Anomaly Detection** | Gross pay deviation detection; zero-pay flags; duplicate entry detection; admin acknowledge flow | G1 | UC-1, UC-2, UC-3 |
| **E11-2: Payroll Run Summary** | Plain-language AI run narrative; variance explanation; post-run and notification display | G3 | UC-4, UC-9 |
| **E11-3: Tax Setup Advisor** | New jurisdiction detection from time entries; reciprocity guidance; direct action link | G2 | UC-5, UC-6 |
| **E11-4: Worker Classification Scoring** | IRS factor confidence score for 1099 contractors; risk tiering; admin alert for high-risk | G4 | UC-7 |
| **E11-5: Compliance Alerts** | Regulatory change monitoring; proactive state/federal law alerts | G2 | UC-8 |

### 3e. High-Level Acceptance Criteria

- An employee whose hours are 0 for the pay period (missed time entry) is flagged as an anomaly before the admin can submit payroll — not after
- An employee whose gross pay is 45% below their 4-run average triggers an anomaly flag with a plain-language reason ("Gross pay is $X, which is 45% below this employee's recent average of $Y. Their hours this run were lower than usual.")
- Admin must acknowledge or take action on every anomaly before reaching the submission step — no silent skipping
- A plain-language run summary is generated for every payroll run, appearing on the post-run screen within 30 seconds of finalization
- When an employee's time entries show work in a new state that has no withholding election on file, a tax advisor alert surfaces with the state, the employee, and a direct link to configure the jurisdiction
- Worker classification scores are displayed for all active 1099 subcontractors with a visible disclaimer that the score is informational and not a legal determination

### 3f. Links to Prototypes

- Payroll Anomaly Panel — [TBD]
- Tax Setup Advisor Alert — [TBD]
- Worker Classification Score Card — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- No AI features at Alpha (mock run only)

**Beta (Trimble Dimensions)**
- Payroll anomaly detection (gross deviation, zero pay, duplicate entries)
- Payroll run summary (plain language)
- Admin acknowledge flow for anomalies

**GA (Generally Available)**
- Tax setup advisor (new jurisdiction detection; reciprocity guidance)
- Worker classification confidence scoring
- Compliance alerts (state/federal regulatory changes)
- Payroll run comparison narrative (this week vs. last week)

---

# 5. Supporting Information

### 5a. Assumptions

- The anomaly detection baseline is built from historical payroll run data; at Beta, the baseline may be limited (first few runs) and thresholds may need calibration
- AI run summaries use a hosted LLM API (not an in-house model); prompt engineering ensures construction-specific context
- PII (SSNs, bank accounts) is never passed to an external AI API
- Worker classification factors are captured in Employee Management (E2) during contractor setup

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Historical payroll run data for anomaly baseline | E4/E5 run history | **Medium** — limited at Beta launch |
| LLM API selection and data processing agreement | Engineering / Legal | **High** — PII handling |
| IRS factor data model from E2 contractor setup | E2 team | **Medium** — E2 must capture factors |
| Regulatory change data source | Legal / Engineering | **Medium** — vendor selection |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| High false positive rate on anomaly detection at Beta (limited history) | High | Medium | Conservative thresholds at Beta; user feedback loop to calibrate | Yes — threshold tuning |
| Admin alert fatigue from too many anomaly flags | Medium | Medium | Priority tiers (P0 = block, P1 = soft flag); calibrate over time | Yes |
| LLM-generated content contains factually incorrect tax or legal information | Medium | High | Clear disclaimer on all AI output; legal review of disclaimer language | Yes |
| PII inadvertently included in LLM prompt | Medium | High | Strict prompt templates that use aggregated values not individual PII | Yes — security review |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Anomaly detection rate | `anomaly_flagged` (type, employee_id, run_id) | Product |
| Anomaly acknowledgement vs. resolution rate | `anomaly_acknowledged` vs. `anomaly_resolved` | Product |
| Run summary engagement | `run_summary_viewed` / `run_summary_dismissed` | Product |
| Tax advisor alert action rate | `jurisdiction_alert_actioned` vs. `dismissed` | Product |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Which LLM API for run summary generation? (Azure OpenAI, OpenAI API, internal) What is the data processing agreement? | Engineering / Legal | Sprint 1 |
| OQ-2 | What anomaly detection thresholds should be used at Beta? Can we access any Prism Accounting historical payroll data to calibrate? | Product / Engineering | Sprint 1 |
| OQ-3 | Is the worker classification scoring model built in-house or sourced from a compliance data provider? | Product / Legal | Sprint 2 |
| OQ-4 | Who is responsible for monitoring and updating the regulatory change alert data? (internal compliance team, tax provider API) | Legal | Sprint 2 |
| OQ-5 | Should the AI-generated run summary be included in the payroll finalization email to the owner, or displayed only within the app? | Product | Sprint 2 |
