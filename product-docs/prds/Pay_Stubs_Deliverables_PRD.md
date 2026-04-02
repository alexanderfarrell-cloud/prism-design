# PRD: Prism Construction Payroll — Employee Pay Stubs & Deliverables

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Tax Filing, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Employee Pay Stubs & Deliverables module is responsible for generating, delivering, and retaining digital pay stubs for every payroll run. It translates the output of the gross-to-net calculation chain into a clear, compliant, construction-aware pay statement that every employee receives after each pay period. Unlike generalist pay stubs that show a single wage line, Prism's pay stub reflects the complexity of construction pay: multiple earnings lines by rate, job, and trade type; correct YTD accumulators; and all deductions and withholding in the sequence they were applied. Pay stubs are available at GA. This Epic does not cover the broader Employee Self-Service Portal (E7b), which is scoped separately.

### 1b. Problem Statement

Pay stubs in construction are both a legal requirement and a trust document. Construction employees who see pay varying week to week — due to different jobs, different rates, overtime, and varying hours — need a pay stub that explains *why* their pay changed, not just *what* they received. Generic pay stubs fail on this.

Current failure modes:

- **Single earnings line**: Generic pay stubs show "Regular Pay: $X" with no breakdown by rate, job, or trade. A construction worker cannot verify they were paid correctly for framing vs. crane operation hours
- **Missing OT transparency**: WAOT overtime is calculated in the background; the stub doesn't show *how* the overtime rate was derived, creating trust issues
- **State compliance gaps**: Most states have specific pay stub content requirements (itemized deductions, YTD totals, employer name/address, etc.) that generic tools don't systematically meet for all 50 states
- **No digital delivery infrastructure**: Some SMB tools produce a PDF but have no email delivery mechanism — the admin prints and hands out physical stubs, which then get lost

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Every employee receives an accurate, itemized pay stub for every payroll run, delivered digitally on pay date |
| G2 | Pay stub content is construction-aware: multiple earnings lines, trade/job context, WAOT transparency |
| G3 | Pay stub content meets state law requirements for all 50 states at GA |
| G4 | Historical pay stubs accessible to both admin and employee for minimum 4 years |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Pay stubs generated and delivered on pay date | 100% | Operational |
| Pay stubs with complete required content (per state law) | 100% for covered states | Compliance |
| Employee pay stub disputes attributable to stub clarity | <1% — **Inferred** | Quality |
| Historical pay stub retrieval success (4-year retention) | 100% | Compliance |
| Pay stub delivery failures (email bounced, link expired) | <0.5% — **Inferred** | Operational |

### 1e. Out of Scope

- Employee Self-Service Portal (login, personal info updates, W-4 updates) — E7b (separate Epic, scope TBD)
- Disbursement / ACH / check payment — E6
- Tax filing and W-2 generation — E8
- Admin payroll register and reports — E10
- Benefits statements (future)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **Employee (W-2)** | Field worker or office staff | Understand what they were paid and why; verify hours and rates are correct | Confusion when OT rate doesn't match expectation; single-line stubs hide errors | Mobile; pay day expectation |
| **PR Admin** | Owner or Office Manager | Pay stubs go out automatically; no printing or distribution required | Distributing paper stubs; employees calling to ask why their pay changed | Desktop |
| **External CPA / Bookkeeper** | Retained accountant | Access historical pay stubs for employee records and audit support | Requesting PDFs from admin vs. direct access | Desktop; periodic |

### 2b. User Journeys / Workflows

**Primary: Pay Stub Generated and Delivered on Pay Date**

```
Payroll run finalized (E6 — disbursement submitted)
 │
 ├─ System generates pay stub per employee:
 │   ├─ EARNINGS section: line per rate/trade/job combination
 │   │   ├─ Regular Pay — Job 101 (Framing): 32 hrs @ $30.00 = $960.00
 │   │   ├─ Regular Pay — Job 102 (Crane Op): 8 hrs @ $45.00 = $360.00
 │   │   └─ Overtime Pay: 4 hrs @ $34.09 (WAOT rate) × 1.5 = $204.54
 │   ├─ PRE-TAX DEDUCTIONS: 401(k), health, FSA itemized
 │   ├─ TAXES: FIT, state(s), local(s), Social Security, Medicare — each labeled
 │   ├─ POST-TAX DEDUCTIONS: Roth, garnishments
 │   ├─ NET PAY
 │   └─ YTD totals: gross earnings, total deductions, total taxes, net pay
 │
 ├─ Pay stub stored as PDF in document system (immutable)
 │
 └─ Delivery:
     ├─ Email to employee with secure link to view/download stub
     └─ Link active for [X] days; stub accessible in admin portal thereafter
```

**Secondary: Employee Views Historical Pay Stub**

```
Employee receives pay stub email → clicks secure link
→ Views current stub (read-only PDF)
→ [In E7b context] Employee portal provides historical stub access
→ [Admin] Can access all employee stubs via Reporting / Employee profile
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Generate pay stub per employee for every completed payroll run | P0 — GA |
| UC-2 | Itemize multiple earnings lines (regular, OT/DT, by rate and job) | P0 — GA |
| UC-3 | Itemize all deductions and withholding (pre-tax, taxes, post-tax) | P0 — GA |
| UC-4 | Include YTD totals for gross, deductions, taxes, and net pay | P0 — GA |
| UC-5 | Deliver pay stub via email with secure, time-limited link | P0 — GA |
| UC-6 | Store pay stubs as immutable PDFs with 4-year minimum retention | P0 — GA |
| UC-7 | Admin access to all employee pay stubs by pay period or employee | P0 — GA |
| UC-8 | CPA read-only access to employee pay stubs | P1 — GA |
| UC-9 | Pay stub content meets state-specific requirements for all 50 states | P0 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Pay Stub Generation

- The system shall generate a pay stub for every employee in every completed payroll run — **P0**
- The system shall generate pay stubs automatically upon pay period finalization (E6 trigger) — **P0**
- Pay stubs shall be generated in PDF format — **P0**

#### Pay Stub Content — Earnings

- The system shall display a separate earnings line for each distinct rate/trade/job combination worked in the pay period — **P0**
- Each earnings line shall show: pay type (Regular / OT / DT / Holiday / PTO / Supplemental), description (trade or job reference), hours, rate, and amount — **P0**
- When WAOT applies, the stub shall display the derived weighted average rate used for overtime — **P0**
- Total gross pay for the period shall be shown as a sum of all earnings lines — **P0**

#### Pay Stub Content — Deductions and Withholding

- The stub shall itemize all pre-tax deductions with type label and amount — **P0**
- The stub shall itemize all statutory tax withholding: federal income tax (labeled), each state income tax (labeled with state), each local/municipal tax (labeled with jurisdiction), Social Security, Medicare — **P0**
- The stub shall itemize all post-tax deductions with type label and amount — **P0**
- Net pay shall equal gross pay minus all deductions and withholding — **P0**

#### Pay Stub Content — YTD and Compliance Fields

- The stub shall display YTD totals: YTD gross earnings, YTD total deductions, YTD total taxes withheld, YTD net pay — **P0**
- The stub shall include: employer name and address, employee name, employee ID (masked), pay period dates, pay date, and payment method — **P0**
- The system shall meet state-specific pay stub content requirements for all 50 states (itemization rules, employer information requirements, YTD disclosure requirements) — **P0** (GA) — *Inferred: requires compliance review per state*
- ⚠️ *Requires human review: comprehensive 50-state pay stub content compliance checklist*

#### Pay Stub Delivery

- The system shall send an email to the employee's email address on file with a secure link to view and download their pay stub — **P0** (GA)
- The secure link shall be time-limited (e.g., 30 days) but the stub shall remain accessible to admin and employee thereafter — **P0** (GA) — *Inferred: confirm link expiry policy*
- The system shall log delivery status: email sent, link accessed, download initiated — **P1**

#### Pay Stub Retention and Access

- Pay stubs shall be stored as immutable, unalterable records for a minimum of 4 years per FLSA requirements — **P0**
- Admin shall be able to access all pay stubs for all employees, filterable by employee and pay period — **P0**
- CPA/Bookkeeper (read-only role) shall be able to access pay stubs via their RBAC role — **P1**
- If a pay stub email bounces or delivery fails, the system shall alert the admin — **P1**

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Compliance** | Pay stub content meets all applicable state laws for states where Prism processes payroll |
| **Security** | SSN, full bank account numbers never appear on pay stubs; employee ID masked; stubs accessible only by authorized roles |
| **Retention** | 4-year minimum immutable storage per FLSA; 7-year tax record retention where applicable |
| **Performance** | Pay stubs generated for 100 employees within 60 seconds of payroll finalization — *Inferred* |
| **Delivery reliability** | Email delivery success rate >99.5% — *Inferred* |
| **Accessibility** | PDF pay stubs meet WCAG 2.1 AA where technically feasible — *Inferred* |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| PayStub | run_id, employee_id, pay_date, pdf_ref, delivery_status, generated_at | One per employee per run |
| EarningsLines | payroll_run_id, employee_id, pay_type, description, hours, rate, amount | From E4 earnings engine |
| DeductionLines | payroll_run_id, employee_id, deduction_type, pre_post_tax, amount | From E5 withholding engine |
| TaxLines | payroll_run_id, employee_id, jurisdiction, tax_type, amount | From E5 withholding engine |
| YTDAccumulator | employee_id, ytd_gross, ytd_taxes, ytd_deductions, ytd_net, as_of_run_id | Running totals per employee |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Earnings Engine (E4) | Source of itemized earnings lines | On pay stub generation trigger | Internal |
| Tax Withholding Engine (E5) | Source of deduction and withholding lines | On pay stub generation trigger | Internal |
| Disbursement Module (E6) | Triggers pay stub generation on payroll finalization; provides pay date | On payroll finalization event | Internal |
| Email / Comms Service | Delivers pay stub notification with secure link | On pay stub generation | Internal — Notification Manager from System Dev Plan |
| Document Storage | Immutable PDF storage with 4-year retention | On PDF generation | Internal — S3-equivalent blob storage |

#### Platform / Infrastructure Constraints

- Pay stub PDFs must be stored as immutable records; no overwrite capability once generated
- Secure links must authenticate before allowing stub access; unauthenticated access not permitted
- ⚠️ **Requires human review**: Secure link authentication mechanism — does it require employee login, or is a time-limited signed URL sufficient?

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E7-1: Pay Stub Generation** | Generate itemized PDF pay stub per employee per run; construction-specific earnings layout | G1, G2 | UC-1, UC-2, UC-3, UC-4 |
| **E7-2: State Compliance Content** | 50-state pay stub content requirements; itemization, YTD, employer info per state | G3 | UC-9 |
| **E7-3: Digital Delivery** | Email delivery with secure link; delivery status tracking; bounce handling | G1 | UC-5 |
| **E7-4: Retention & Access** | 4-year immutable storage; admin and CPA access by employee/period | G4 | UC-6, UC-7, UC-8 |

### 3e. High-Level Acceptance Criteria

- A pay stub is generated for every employee in a completed payroll run, automatically, without admin action
- An employee with hours at two different rates ($30/hr framing, $45/hr crane) sees two separate earnings lines on their stub — not a single "Regular Pay" total
- When WAOT applies, the overtime section shows the derived weighted average rate, not just "OT: 1.5x"
- Every state income tax withheld appears as a separate labeled line (e.g., "PA State Tax: $X", "OH State Tax: $Y") — not merged into "State Taxes"
- YTD gross, total taxes, total deductions, and net pay are displayed and accurate for the employee's year to date
- Employee receives a pay stub email on pay date; the secure link opens a PDF matching the run's calculation output
- Pay stubs are retrievable by admin from the system for at least 4 years after the pay date
- No SSN, full bank account number, or other sensitive PII appears on the pay stub face

### 3f. Links to Prototypes

- Pay Stub Template (Construction-specific layout) — [TBD]
- Pay Stub Email Delivery — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha / Beta**
- Pay stubs not generated at Alpha or Beta (mock run only at Alpha; Beta disbursement stubbed)
- Beta planning: define pay stub data model and template; pilot internal review of stub layout

**GA (Generally Available)**
- Full pay stub generation for every employee in every payroll run
- Construction-aware earnings itemization (multiple lines by rate/job/trade)
- WAOT transparency on stub
- All deduction and withholding lines itemized
- YTD totals
- Email delivery with secure link
- 4-year retention with admin access
- State compliance content for all active payroll states
- CPA read-only access

**Post-GA (E7b — Employee Self-Service Portal)**
- Employee login to view historical pay stubs
- Self-service stub download without emailed link

---

# 5. Supporting Information

### 5a. Assumptions

- Pay stubs are generated as PDFs (not HTML-only)
- Email delivery uses the employee's email address captured during onboarding (E2); no separate email verification step at pay stub delivery
- State compliance content requirements are validated by legal/compliance before GA launch in each state
- Secure link authentication does not require a full employee account login at GA (signed URL sufficient); full authentication deferred to E7b

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Earnings itemization from E4 (multiple earnings lines) | E4 team | **High** — stub quality depends on earnings detail |
| Withholding/deduction detail from E5 | E5 team | **High** — stub completeness |
| Payroll finalization trigger from E6 | E6 team | **Medium** — generation timing |
| 50-state pay stub compliance review | Legal / Compliance | **Medium** — GA readiness |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| State pay stub compliance requirements missed | Medium | High | Comprehensive compliance review before GA; state-by-state checklist | Yes |
| Email delivery failures (wrong email, spam filters) | Medium | Medium | Delivery status tracking; admin alert on bounce; admin can resend or download and forward | No |
| Pay stub PDF accessibility (screen reader compliance) | Low | Medium | Test PDF against WCAG guidance; accessible color contrast and tag structure | Yes |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Pay stub delivery success rate | `paystub_email_sent` / `paystub_email_bounced` | Operations |
| Pay stub link access rate | `paystub_link_accessed` (% of employees) | Product |
| Admin pay stub retrieval frequency | `paystub_admin_retrieved` | Operations |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Is a signed URL (no employee login required) sufficient for pay stub delivery at GA, or must employees authenticate? | Product / Security | Sprint 2 |
| OQ-2 | What is the link expiry window for secure pay stub access? (30 days? 90 days?) | Product / Legal | Sprint 2 |
| OQ-3 | Are pay stubs delivered on the pay date, or on the payroll finalization date (which may be 2 days earlier for ACH)? | Product | Sprint 2 |
| OQ-4 | Does the WAOT rate need to be displayed on the stub face, or is showing "OT hours × OT amount" sufficient? | Legal / Compliance | Sprint 2 |
| OQ-5 | Which document storage system is used for immutable PDF retention? (S3, Azure Blob, or internal document service?) | Engineering | Sprint 1 |
