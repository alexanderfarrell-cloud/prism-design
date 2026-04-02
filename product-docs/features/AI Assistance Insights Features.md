# Prism Construction Payroll — AI-Powered Assistance & Insights
## Feature Set for Epic 681946 (E11)

> **Source:** AI-Powered Assistance & Insights PRD — the intelligent assistance layer that augments the Overwhelmed Operator with anomaly detection, plain-language payroll narratives, proactive tax jurisdiction guidance, worker classification risk scoring, and regulatory compliance alerts.

---

## Feature Set Overview

| # | Feature Title | One-Line Summary |
|---|--------------|-----------------|
| E11-1 | Payroll Anomaly Detection | Flag unusual pay amounts, zero-pay employees, and duplicate entries before disbursement — admin must acknowledge every anomaly before submitting |
| E11-2 | Payroll Run Summary | Generate a plain-language 3–5 sentence AI narrative of each payroll run — total gross pay, variance from prior run, primary cause, and notable events |
| E11-3 | Tax Setup Advisor | Detect when an employee works in a new state or locality with no withholding configured and surface a plain-language alert with a direct action link |
| E11-4 | Worker Classification Scoring | Calculate an IRS factor-based confidence score (Low / Medium / High Risk) for each active 1099 subcontractor and alert the admin for high-risk classifications |
| E11-5 | Compliance Alerts | Monitor for and proactively surface regulatory changes — state minimum wage updates, OT rule changes, federal wage and hour law changes — before they take effect |

---

## Payroll Anomaly Detection

### Goal / Outcome
Before an admin can submit a payroll run for disbursement, the system automatically analyzes every employee's gross pay against their rolling 4-run historical average and flags deviations, zero-pay employees, and duplicate time entries. Every anomaly requires an explicit admin action — review and correct, or acknowledge with a reason — before proceeding. No payroll error passes silently into disbursement. Anomaly acknowledgements are logged in the audit trail for compliance.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — needs a safety net that catches data entry errors and missing time approvals before employees are underpaid or overpaid on payday
- **External CPA / Bookkeeper** — needs an audit trail showing which anomalies were flagged and how the admin resolved them

### Business & PRD Drivers
- G1 — Catch payroll errors before disbursement — not after employees call
- UC-1 — Detect pay anomalies before disbursement (gross pay deviation from rolling average) — P0 Beta
- UC-2 — Flag zero-pay employees (active employee not in run) — P0 Beta
- UC-3 — Flag duplicate pay entries (same employee, same hours, same job) — P0 Beta
- PRD §3a — Payroll Anomaly Detection requirements
- PRD §1b — Problem: "No anomaly gate — every SMB payroll tool lets the admin submit payroll without flagging that an employee's pay is 50% below their historical average"

### Problem / Rationale
Construction payroll operators are not payroll experts — they are often office managers or owner/operators running payroll alongside their primary job. When a laborer's hours are accidentally left off a run, the system should catch it. When a rate is double-entered and an employee's pay is 40% above average, the system should flag it. Without an anomaly gate, errors flow directly from data entry to disbursement. The admin only discovers the problem when an employee calls on a Friday afternoon.

### In Scope
- Analyze each employee's gross pay in a payroll run against their 4-run rolling average; flag if gross pay is >25% below average (possible missing hours) or >40% above average (possible rate error or double entry)
- Flag active employees with $0 pay in a run (possible missed time entry or unapproved timesheet)
- Detect potential duplicate time entries: same employee, same date, same job, same hours within a run
- Anomaly panel displayed before pre-disbursement step — admin cannot bypass without action
- Admin must either review (take corrective action) or acknowledge (confirm proceed with reason) each flagged anomaly
- Admin acknowledgements logged in the audit trail with reason code and timestamp
- Anomaly detection completes within 10 seconds of payroll calculation — before admin reaches the pre-disbursement screen

### Out of Scope (for this feature)
- Benefits or deduction anomaly detection (future)
- Tax withholding deviation flags (future)
- Predictive overtime alerts before a run (future)
- ML-based adaptive thresholds — Beta uses fixed percentage thresholds; calibration is manual

### Example Super Stories
- As a PR Admin, I want the system to flag any employee whose pay is more than 25% below their recent average so that I don't accidentally submit payroll with missing hours without being warned first.
- As a PR Admin, I want to acknowledge an anomaly with a reason (e.g., "employee took unpaid leave") so that I can proceed without being blocked when the anomaly is intentional.
- As an External CPA, I want to see a log of all anomalies flagged in a run and how the admin resolved them so that I have an audit trail for any payroll that was questioned.

### Acceptance Criteria Themes
- An employee with $0 gross pay in a run is flagged as an anomaly before the admin can proceed to disbursement — not after
- An employee whose gross pay is 45% below their 4-run average triggers a plain-language anomaly flag: "Gross pay is $X, which is 45% below this employee's recent average of $Y. Their hours this run were lower than usual."
- Admin must acknowledge or take action on every anomaly before reaching the submission step — no silent skipping
- Admin acknowledgements are stored in the audit trail with: run ID, employee ID, anomaly type, admin reason, timestamp, and admin identity
- Anomaly detection completes before the admin reaches the pre-disbursement screen; detection duration < 10 seconds
- False positive rate for anomaly detection: target < 10% (calibration ongoing at Beta)

### Dependencies & Risks
- **Upstream:** E4 (Earnings Engine) — anomaly detection requires gross pay per employee per run; E4 must expose this before the pre-disbursement step
- **Upstream:** E5 (Payroll Run History) — 4-run rolling average requires at least 4 prior runs; at Beta launch, history may be limited — conservative thresholds or soft-flag mode needed for first few runs
- **Risk:** High false positive rate at Beta (limited history) — mitigation: conservative initial thresholds; user feedback loop to calibrate over time (PRD §5c — High probability, Medium impact)
- **Risk:** Admin alert fatigue from too many flags — mitigation: P0 (blocking) vs. P1 (soft flag) priority tiers (PRD §5c — Medium probability, Medium impact)

### Success Metrics / KPIs
- Payroll errors caught by anomaly detection before disbursement: target >80% of detectable anomalies
- Admin anomaly acknowledgement rate (acknowledge vs. correct): tracked per run type
- `anomaly_flagged` events per run: tracked by type (deviation, zero-pay, duplicate)
- `anomaly_acknowledged` vs. `anomaly_resolved` events: tracked to distinguish correction rate from bypass rate

### Assumptions
- The anomaly detection baseline is built from historical payroll run data stored in EmployeePayHistory; at Beta, the first few runs may have limited history
- Fixed percentage thresholds (25% below / 40% above) are used at Beta; threshold calibration based on field data is expected post-Beta
- PII is not passed to any external AI API for anomaly detection — this is rules-based logic run server-side

---

## Payroll Run Summary

### Goal / Outcome
After every payroll run is finalized, the system automatically generates a 3–5 sentence plain-language narrative that describes what happened in the run: total gross pay, variance from the prior run, the primary cause of that variance, any notable individual events (anomalies, high OT), and net pay to employees. The summary appears on the post-run screen and optionally in the owner/admin email notification. A non-payroll-expert can understand the run in under 60 seconds — without opening the payroll register.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — wants a quick confirmation that the run was normal, or a plain-language explanation of what changed
- **Owner / Exec** — reviews payroll from mobile; needs a 3-sentence summary, not a dense register

### Business & PRD Drivers
- G3 — Make the payroll run output understandable to a non-payroll-expert in under 60 seconds
- UC-4 — Generate plain-language payroll run summary — P0 Beta
- UC-9 — Payroll run comparison narrative (this week vs. last week explanation) — P1 GA
- PRD §3a — Payroll Run Summary requirements
- PRD §1b — Problem: "No payroll narrative — after a run, the admin has a dense payroll register with no plain-language summary of what happened"

### Problem / Rationale
After a payroll run, the admin has a multi-page payroll register showing every employee's gross pay, deductions, and net pay — but no explanation of whether this run was normal or unusual. An owner reviewing payroll from a mobile device has no quick way to understand why total payroll cost increased $2,100 this week compared to last week. Without a plain-language summary, the only way to understand a run is to read the register line by line — a task that takes 15–30 minutes and requires payroll literacy. This creates dependence on a CPA or payroll expert to explain routine results.

### In Scope
- AI-generated 3–5 sentence plain-language summary of each payroll run, including: total gross pay, variance from prior run, primary cause of variance (e.g., overtime on a specific job), notable individual events (anomalies acknowledged, employees with high OT), net pay total
- Summary appears on the post-run summary screen within 30 seconds of payroll finalization
- Summary optionally included in email notification to owner/admin (aggregate totals only — no individual employee pay data in the notification path)
- Run comparison narrative (this week vs. last week explanation) — P1 GA
- Summary labeled "AI-generated" with appropriate disclaimer

### Out of Scope (for this feature)
- Open-ended Q&A about the payroll run (future chatbot capability)
- Job-level cost analysis in the summary (Prism Accounting Integration — E9)
- Individual employee pay details in the email notification path (aggregate totals only)
- Summary available to employee-level roles

### Example Super Stories
- As a PR Admin, I want a 3-sentence plain-language summary of the payroll run to appear on the post-run screen so that I can confirm the run was normal without reading the full register.
- As an Owner / Exec, I want the payroll summary email to tell me the total cost and why it changed from last week in plain language so that I can understand payroll results from my phone without needing someone to explain it.

### Acceptance Criteria Themes
- A plain-language run summary is generated for every payroll run and appears on the post-run screen within 30 seconds of finalization
- Summary includes: total gross pay, variance from prior run (dollar and percentage), primary cause of variance, any notable anomalies or high-OT events, net pay total
- Summary is labeled "AI-generated" with a visible disclaimer
- Email notification (if enabled) includes the run summary using aggregate totals only — no individual employee pay or PII
- Summary generation does not block or delay the post-run screen; if summary generation fails, the screen loads without the summary and a retry is available
- Individual employee SSNs, bank account data, and detailed pay data are never passed to the LLM API; only aggregated run-level statistics are used in the prompt

### Dependencies & Risks
- **Critical dependency:** LLM API selection and data processing agreement — AI run summary requires a hosted LLM (Azure OpenAI, OpenAI API, or equivalent); data processing agreement required before PII-adjacent data can be used (OQ-1 — High risk)
- **Upstream:** E4/E5 — run totals (gross pay, OT hours, variance from prior run) must be available to the summary generation service at finalization
- **Upstream:** E11-1 (Anomaly Detection) — acknowledged anomalies should be referenced in the summary ("one anomaly was flagged and acknowledged")
- **Risk:** LLM-generated content contains factually incorrect tax or legal information — mitigation: clear disclaimer on all AI output; legal review of disclaimer language (PRD §5c — Medium probability, High impact)
- **Risk:** PII inadvertently included in LLM prompt — mitigation: strict prompt templates using aggregated values only, not individual employee records (PRD §5c — Medium probability, High impact)

### Success Metrics / KPIs
- Run summaries generated without errors: target 100% of payroll runs
- `run_summary_viewed` vs. `run_summary_dismissed` events: tracked for engagement
- Admin-reported summary accuracy issues: tracked; target 0 critical factual errors

### Assumptions
- AI run summaries use a hosted LLM API (not an in-house model); prompt engineering ensures construction-specific context
- PII (SSNs, bank account data, individual employee pay amounts) is never passed to the external LLM API; only aggregated run-level statistics are used
- Run summary generation is asynchronous and non-blocking; the post-run screen loads immediately and the summary populates within 30 seconds

---

## Tax Setup Advisor

### Goal / Outcome
When time entries from Traqspera (or another time collection system) include hours worked in a state or locality where no withholding is configured for the relevant employee, the system automatically surfaces a plain-language alert: what jurisdiction was detected, which employees are affected, what the withholding obligation is, and any applicable reciprocity context. A direct action link takes the admin to the employee's tax setup in Employee Management — no manual hunting. Dismissed alerts are logged with a reason. Admins proactively configure new state withholding before a payroll run is affected — not after a tax notice arrives.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — doesn't know multi-state withholding rules; needs proactive guidance when an employee starts working in a new state, not reactive discovery when a notice arrives
- **External CPA / Bookkeeper** — needs confirmation that the client's withholding configuration covers every state where employees are actively working

### Business & PRD Drivers
- G2 — Proactively surface tax jurisdiction requirements before they become missed obligations
- UC-5 — Alert admin to new state/local tax jurisdiction triggered by Traqspera time entries — P0 GA
- UC-6 — Reciprocity guidance when employee crosses state lines — P0 GA
- PRD §3a — Tax Setup Advisor requirements
- PRD §1b — Problem: "Reactive tax setup — the admin discovers they owe Philadelphia wage tax when a tax notice arrives, not when they assign an employee to a Philly job site"

### Problem / Rationale
Multi-state payroll is a compliance minefield for small construction contractors. When a crew is sent to a job site in a new state, the employer is typically required to register for state withholding and begin withholding from day one — but the admin rarely knows this until a tax notice arrives months later. Reciprocity agreements (e.g., PA-OH) can simplify obligations, but only if the admin is aware they apply. Without proactive jurisdiction detection, the company accumulates unregistered state withholding obligations and faces penalties retroactively.

### In Scope
- Detect when time entries include hours worked in a state or locality where no withholding election is configured for the relevant employee
- Surface a plain-language alert with: jurisdiction detected, employees affected, brief explanation of withholding obligation, and any applicable reciprocity context (e.g., "PA-OH reciprocity: if the employee lives in PA, you may only need to withhold PA taxes")
- Provide a direct action link to the employee's tax setup in Employee Management to configure or dismiss the jurisdiction
- Alerts dismissable with a reason: "already registered," "short-duration exception," etc.
- Dismissed alerts logged with reason code, admin identity, and timestamp

### Out of Scope (for this feature)
- Automated state registration filing — admin action still required to register with state agencies
- Federal withholding configuration (handled in Employee Management at onboarding)
- Local tax jurisdiction detection beyond what Traqspera provides via job site address (city/county-level alerts require address-level data from Traqspera)
- Legal advice on reciprocity agreements — all guidance includes disclaimer

### Example Super Stories
- As a PR Admin, I want to receive an alert when an employee's time entries show hours worked in a state where I haven't configured state withholding so that I can register and configure withholding before the payroll run that covers those hours.
- As a PR Admin, I want the alert to tell me whether a reciprocity agreement applies to the new state so that I understand whether I need to register in the new state or just continue withholding in the employee's home state.
- As an External CPA, I want to see a log of jurisdiction alerts and how each was resolved so that I can confirm the client's withholding configuration is complete across all active states.

### Acceptance Criteria Themes
- When an employee's time entries show work in a new state with no withholding election on file, a tax advisor alert surfaces with: the state, the employee(s), a plain-language explanation of the potential withholding obligation, and any applicable reciprocity context
- Alert includes a direct link to the employee's tax setup in Employee Management — no manual navigation required
- Alerts are dismissable with a reason; dismissed alerts are logged with admin identity, reason, and timestamp
- Reciprocity context is displayed where applicable — the alert explicitly notes when a reciprocity agreement may reduce or eliminate the registration requirement
- All jurisdiction guidance includes a visible disclaimer: "This is informational guidance and not legal or tax advice. Consult a licensed tax professional for your specific situation."
- Alerts appear within one business day of the time entries being ingested from Traqspera

### Dependencies & Risks
- **Upstream:** E3 (Time Collection) — jurisdiction detection requires state/locality data from time entries; Traqspera must provide job site state in the time entry payload
- **Upstream:** E2 (Employee Management) — current withholding configuration per employee per state must be queryable
- **Risk:** Traqspera job site data does not include reliable state information for all entries — mitigation: define minimum data contract with E3 team before building detection logic (PRD §3c — Integration Requirements)
- **Open Question (OQ-4):** Who is responsible for maintaining reciprocity agreement data? (Legal, Sprint 2)

### Success Metrics / KPIs
- Tax jurisdiction alerts converted to admin action (new state/local configured): target >70%
- `jurisdiction_alert_actioned` vs. `jurisdiction_alert_dismissed` events: tracked
- Admin-reported tax notices for states where the advisor had already flagged the jurisdiction: tracked; target 0

### Assumptions
- Traqspera time entries include state/locality data derived from job site address; this is the jurisdiction signal for detection
- The system does not automatically register the employer with new state agencies; the alert drives admin action, not automated filing
- Reciprocity agreement data is maintained internally (or sourced from a tax data provider) and associated with the relevant state pairs — this data must be defined and curated (OQ-4)

---

## Worker Classification Scoring

### Goal / Outcome
For every active 1099 subcontractor in the system, Prism calculates and displays a worker classification confidence score — Low Risk, Medium Risk, or High Risk — based on the IRS behavioral control, financial control, and type-of-relationship factors captured during contractor setup in Employee Management. High-risk classifications surface as admin alerts requiring review. Admins and CPAs can see at a glance which contractors carry elevated misclassification risk and understand the specific factors driving the score. All scores include a visible disclaimer that this is informational guidance, not a legal determination.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — frequently classifies workers as 1099 based on cash flow preference; needs a risk signal before making classification decisions
- **External CPA / Bookkeeper** — "My client keeps adding 1099 subcontractors who should be employees"; needs a tool to flag high-risk cases for client conversation

### Business & PRD Drivers
- G4 — Surface worker classification risk before it becomes IRS exposure
- UC-7 — Worker classification confidence score for each active 1099 subcontractor — P0 GA
- PRD §3a — Worker Classification Confidence Score requirements
- PRD §1b — Problem: "Classification guessing — owner/operators frequently make worker classification decisions based on cash flow preference, not IRS factors — and don't know their risk exposure until an audit"

### Problem / Rationale
Worker misclassification is one of the most common and expensive IRS enforcement actions in the construction industry. Employers who classify employees as 1099 subcontractors to avoid payroll taxes face back taxes, penalties, and interest — often totaling far more than the savings. The IRS uses a multi-factor test (behavioral control, financial control, type-of-relationship) to determine classification, but most small contractors have never reviewed this test. Without a risk signal, the admin doesn't know they have a problem until an audit notice arrives.

### In Scope
- Calculate a worker classification confidence score for each active 1099 subcontractor based on IRS behavioral control, financial control, and type-of-relationship factors captured in Employee Management (E2)
- Display score as: Low Risk / Medium Risk / High Risk with a plain-language explanation of the factors driving the score
- High-risk classifications surfaced as admin alerts requiring acknowledgement and review
- Score visible to Admin and CPA roles on the contractor profile
- Score updated when contractor setup factors are modified in Employee Management
- All scores include a visible disclaimer: "This score is informational and not a legal determination. Consult a licensed attorney or tax professional for classification decisions."

### Out of Scope (for this feature)
- Legal determination of worker classification — informational only
- Automated reclassification of contractors
- Scoring for W-2 employees (only active 1099 subcontractors are scored)
- State-level classification tests (some states have stricter tests, e.g., California AB5) — Beta/GA covers IRS federal test only

### Example Super Stories
- As a PR Admin, I want to see a risk score for each of my 1099 subcontractors so that I know before an audit whether my classification decisions carry significant IRS risk.
- As an External CPA, I want to see High Risk classifications flagged as alerts in my client's system so that I can proactively have a classification review conversation before it becomes an IRS enforcement issue.
- As a PR Admin, I want the risk score to tell me which specific IRS factors are driving the High Risk rating so that I understand what to address — not just that there's a risk.

### Acceptance Criteria Themes
- Worker classification confidence scores are displayed for all active 1099 subcontractors with a visible disclaimer that the score is informational and not a legal determination
- Score tiers: Low Risk / Medium Risk / High Risk — with plain-language explanation of the factors driving the score
- High-risk classifications surface as admin alerts requiring review acknowledgement — admin cannot dismiss without confirming they have seen the alert
- Score is recalculated when contractor factors in Employee Management are updated — stale scores do not persist beyond the next update event
- IRS factor data model (behavioral control, financial control, type-of-relationship) is sourced from E2 (Employee Management) contractor setup — E2 must capture these factors at contractor onboarding
- ⚠️ Scoring model and disclaimer language require legal review before GA

### Dependencies & Risks
- **Critical dependency:** E2 (Employee Management) must capture IRS classification factors during contractor setup — if E2 does not collect these factors, scoring cannot be calculated (PRD §3c — Integration Requirements; Medium risk)
- **Open Question (OQ-3):** Is the worker classification scoring model built in-house or sourced from a compliance data provider? (Product / Legal, Sprint 2)
- **Risk:** Scoring model produces results that are legally incorrect or misleading — mitigation: legal review of scoring model and disclaimer language required before GA (PRD §5c — Medium probability, High impact)

### Success Metrics / KPIs
- High-risk worker classification flags reviewed by admin: 100% (flag shown; action at admin discretion)
- Contractor profiles with classification score displayed: 100% of active 1099 subcontractors at GA
- Admin-reported misclassification corrections following a High Risk alert: tracked

### Assumptions
- IRS classification factors are captured in E2 (Employee Management) during contractor setup and are queryable by E11
- The scoring model uses the IRS common-law three-part test (behavioral control, financial control, type-of-relationship) — state-level tests are out of scope at GA
- Legal review of the scoring model and disclaimer language is required before GA; this is a hard dependency on legal team availability

---

## Compliance Alerts

### Goal / Outcome
When regulatory changes occur that affect active payroll states — state minimum wage increases, state OT rule changes, federal wage and hour law changes — the system proactively surfaces a plain-language compliance alert to the admin before the change takes effect. The alert includes what changed, when it takes effect, and what action (if any) may be required. Admins are not caught off-guard by regulatory changes they should have known about; proactive notification replaces reactive discovery from tax notices or news articles.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — does not have a compliance monitoring function; relies on the product to surface regulatory changes that affect their active states
- **External CPA / Bookkeeper** — wants confirmation that their clients' payroll systems are flagging relevant regulatory changes; reduces their own monitoring burden

### Business & PRD Drivers
- G2 — Proactively surface tax jurisdiction requirements before they become missed obligations
- UC-8 — Proactive compliance alert for regulatory changes (rate changes, new state laws) — P1 GA
- PRD §3a — Compliance Alerts requirements
- PRD §1b — Problem: reactive tax setup; admins discover compliance obligations when notices arrive

### Problem / Rationale
State minimum wage rates, overtime exemption thresholds, and local wage laws change frequently — often with effective dates that give employers only 60–90 days to update their payroll configuration. Construction contractors operating across multiple states have no systematic way to monitor these changes. A missed minimum wage increase results in wage theft liability; a missed OT threshold change creates unpaid overtime exposure. Without proactive alerting, the admin relies on their CPA to notify them — and the CPA may not be monitoring every active state either.

### In Scope
- Monitor for and surface compliance alerts for: state minimum wage changes affecting any active payroll state, state OT rule changes, federal wage and hour law changes
- Alerts include: what changed, when it takes effect, what action (if any) may be required in the system
- Alerts scoped to states where the company has active employees — no alerts for irrelevant states
- Alerts visible to Admin and CPA roles
- Alerts dismissable with a reason; dismissed alerts logged with admin identity, reason, and timestamp
- ⚠️ Data source for regulatory change monitoring requires definition: tax data provider, legal service, or manual internal curation (OQ-4)

### Out of Scope (for this feature)
- Automated rate updates in response to regulatory changes — admin action still required to update rates in Company Setup
- Union CBA compliance monitoring (Tier 2+)
- Benefits law compliance alerts (future)
- International compliance monitoring
- Legal advice on regulatory requirements — all alerts include disclaimer

### Example Super Stories
- As a PR Admin, I want to receive an alert when a state minimum wage increase is scheduled for any state where I have active employees so that I can update my payroll rates before the effective date — not after.
- As an External CPA, I want my client's system to surface relevant federal and state regulatory changes so that I have a reference point for proactive client conversations rather than reacting to compliance gaps after the fact.

### Acceptance Criteria Themes
- Compliance alerts are surfaced for regulatory changes in states where the company has at least one active employee — no alerts for states with no active payroll
- Alert content includes: what changed (regulation name and nature), effective date, plain-language explanation of potential impact, and any system action that may be required (e.g., "update minimum wage rate in Company Setup")
- Alerts are scoped and relevant — no blanket regulatory updates for all 50 states; filtering is by active payroll state
- Alerts include a visible disclaimer: "This is informational guidance and not legal or tax advice. Consult a licensed professional for your specific compliance obligations."
- Dismissed alerts are logged with admin identity, reason, and timestamp
- ⚠️ Data source for regulatory change monitoring must be determined before development begins (OQ-4)

### Dependencies & Risks
- **Critical dependency:** Regulatory change data source — a tax/legal data provider, internal compliance team, or curated data feed must be selected before this feature can be built (OQ-4 — Medium risk, Medium probability)
- **Open Question (OQ-4):** Who is responsible for monitoring and updating the regulatory change alert data? (Legal, Sprint 2)
- **Risk:** Alert data is delayed or incorrect — mitigation: data source SLA must be defined; disclaimer on all alerts; legal review of content (PRD §5c — Medium probability, Medium impact)

### Success Metrics / KPIs
- Compliance alerts surfaced before regulatory effective date: target 100% of tracked regulatory changes
- Admin-reported compliance gaps in active states that were not preceded by a system alert: tracked; target 0
- `compliance_alert_actioned` vs. `compliance_alert_dismissed` events: tracked

### Assumptions
- Regulatory change data is sourced from a third-party tax/legal data provider or internal compliance team — Prism does not independently monitor legislative changes
- Alerts are informational; admin action (e.g., updating rates) is always required — the system does not auto-update rates or configuration in response to alerts
- Alert filtering by active payroll state is based on states where at least one active employee has earnings in the current or prior pay period

---

## Traceability Table

| Requirement / PRD Reference | Description | Feature(s) |
|---|---|---|
| G1 — Catch errors before disbursement | Anomaly gate before submission | Payroll Anomaly Detection |
| G2 — Proactive tax jurisdiction surfacing | Detect new state before tax notice | Tax Setup Advisor, Compliance Alerts |
| G3 — Run output understandable in 60 seconds | Plain-language run narrative | Payroll Run Summary |
| G4 — Surface classification risk before IRS exposure | IRS factor confidence score | Worker Classification Scoring |
| UC-1 — Pay anomaly detection | Gross deviation from rolling average | Payroll Anomaly Detection |
| UC-2 — Zero-pay employee flag | Active employee not in run | Payroll Anomaly Detection |
| UC-3 — Duplicate entry detection | Same employee/date/job/hours | Payroll Anomaly Detection |
| UC-4 — Plain-language run summary | 3–5 sentence AI narrative | Payroll Run Summary |
| UC-5 — New jurisdiction alert from Traqspera | State/local withholding gap | Tax Setup Advisor |
| UC-6 — Reciprocity guidance | Cross-state line employee guidance | Tax Setup Advisor |
| UC-7 — Worker classification score | IRS factor confidence score | Worker Classification Scoring |
| UC-8 — Compliance alerts | Regulatory change monitoring | Compliance Alerts |
| UC-9 — Run comparison narrative | This week vs. last week | Payroll Run Summary |
| PRD §3a — Anomaly panel before pre-disbursement | Admin gate before submission | Payroll Anomaly Detection |
| PRD §3a — Audit trail for anomaly acknowledgements | Reason code + timestamp | Payroll Anomaly Detection |
| PRD §3a — LLM summary with disclaimer | AI-labeled, aggregated data only | Payroll Run Summary |
| PRD §3a — Jurisdiction alert with action link | Direct link to tax setup | Tax Setup Advisor |
| PRD §3a — IRS factor score with disclaimer | Informational; legal review required | Worker Classification Scoring |
| PRD §3b — Performance: anomaly detection < 10 seconds | NFR | Payroll Anomaly Detection |
| PRD §3b — Transparency: AI output labeled | "AI-generated" label + disclaimer | Payroll Run Summary, Worker Classification Scoring, Compliance Alerts |
| PRD §3b — Privacy: no PII in LLM prompts | Aggregated data only | Payroll Run Summary |
| PRD OQ-1 — LLM API selection | Azure OpenAI / OpenAI API / internal | Payroll Run Summary |
| PRD OQ-2 — Anomaly thresholds at Beta | Calibration from field data | Payroll Anomaly Detection |
| PRD OQ-3 — Classification scoring model source | In-house vs. compliance provider | Worker Classification Scoring |
| PRD OQ-4 — Regulatory change data source | Legal / Engineering, Sprint 2 | Compliance Alerts |
| PRD OQ-5 — Run summary in email vs. app only | Product, Sprint 2 | Payroll Run Summary |
