# Employee Pay Stubs & Deliverables — Feature Set
**Prism Construction Payroll | E7 Module | Draft: March 4, 2026**

---

## Feature Set Overview

| # | Feature Title | One-Line Summary | Milestone |
|---|--------------|-----------------|-----------|
| E7-1 | Pay Stub Generation | Generate an itemized, construction-aware PDF pay stub per employee for every completed payroll run | GA |
| E7-2 | State Compliance Content | Ensure pay stub content meets all 50-state pay stub requirements for itemization, YTD disclosure, and employer information | GA |
| E7-3 | Digital Delivery | Deliver pay stubs to employees via email with a secure, time-limited link and track delivery status | GA |
| E7-4 | Retention & Access | Store pay stubs as immutable PDFs with 4-year minimum retention and provide admin and CPA access by employee and pay period | GA |

---

---

## Feature E7-1 — Pay Stub Generation

### 1. Goal / Outcome

Every employee in every completed payroll run automatically receives an accurate, itemized PDF pay stub — without any admin action. The stub reflects the full complexity of construction pay: multiple earnings lines by rate, trade, and job; WAOT transparency; all deductions and withholding in sequence; and YTD accumulators. Admins no longer print or distribute stubs manually.

### 2. Primary Personas

- **Employee (W-2)** — needs to understand what they were paid and why; verify hours and rates are correct
- **PR Admin ("Overwhelmed Operator")** — needs pay stubs generated and delivered automatically, without printing or distribution
- **External CPA / Bookkeeper** — needs each earnings component as a discrete line item to support audit and GL reconciliation

### 3. Business & PRD Drivers

- G1: Every employee receives an accurate, itemized pay stub for every payroll run, delivered digitally on pay date
- G2: Pay stub content is construction-aware — multiple earnings lines, trade/job context, WAOT transparency
- FR: Pay Stub Generation; Pay Stub Content — Earnings; Pay Stub Content — Deductions and Withholding; Pay Stub Content — YTD and Compliance Fields (§3a)
- UC-1 (P0 — GA): Generate pay stub per employee for every completed payroll run
- UC-2 (P0 — GA): Itemize multiple earnings lines (regular, OT/DT, by rate and job)
- UC-3 (P0 — GA): Itemize all deductions and withholding (pre-tax, taxes, post-tax)
- UC-4 (P0 — GA): Include YTD totals for gross, deductions, taxes, and net pay
- Problem Statement: Generic pay stubs show a single earnings line — construction workers cannot verify they were paid correctly across different jobs and trades

### 4. Problem / Rationale

Generic payroll tools generate a single "Regular Pay: $X" line. A construction worker who framed at $30/hr and operated a crane at $45/hr in the same week cannot verify their pay is correct. When WAOT applies, the overtime rate is computed in the background and never explained on the stub — creating trust issues and disputes. Prism's pay stub must be a trust artifact: transparent enough that an employee can independently verify their pay is correct.

### 5. In Scope

**Pay Stub Generation:**
- Generate a pay stub automatically for every employee in every completed payroll run, triggered on payroll finalization (E6 event)
- Generate pay stubs in PDF format; no admin action required

**Earnings Section:**
- Display a separate earnings line for each distinct rate/trade/job combination worked in the pay period
- Each earnings line shows: pay type (Regular / OT / DT / Holiday / PTO / Supplemental), description (trade or job reference), hours, rate, and amount
- When WAOT applies, display the derived weighted average rate used for overtime — not just "OT: 1.5×"
- Total gross pay shown as sum of all earnings lines

**Deductions and Withholding Section:**
- Itemize all pre-tax deductions with type label and amount
- Itemize all statutory tax withholding: federal income tax (labeled), each state income tax (labeled with state), each local/municipal tax (labeled with jurisdiction), Social Security, Medicare
- Itemize all post-tax deductions with type label and amount
- Net pay = gross pay minus all deductions and withholding

**YTD and Compliance Fields:**
- Display YTD totals: YTD gross earnings, YTD total deductions, YTD total taxes withheld, YTD net pay
- Include: employer name and address, employee name, employee ID (masked), pay period dates, pay date, payment method
- No SSN, full bank account number, or other sensitive PII on the pay stub face

### 6. Out of Scope (for this feature)

- State-specific content compliance rules — E7-2
- Email delivery and secure link — E7-3
- PDF storage, retention, and access — E7-4
- Employee Self-Service Portal (login, historical stub access) — E7b (separate Epic)
- Disbursement / ACH / check payment — E6
- Admin payroll register and reports — E10

### 7. Example "Super Stories"

- As a PR Admin, I want pay stubs to be generated automatically for every employee when I finalize a payroll run so that I don't need to print or distribute anything.
- As an Employee, I want to see a separate earnings line for every rate and job I worked this pay period so that I can verify my pay is correct without calling HR.
- As an Employee, I want the stub to show how my overtime rate was calculated when I worked at different rates so that I understand why my OT doesn't match a simple 1.5× of my main rate.

### 8. Acceptance Criteria Themes

- A pay stub is generated for every employee in a completed payroll run, automatically, without admin action
- An employee with hours at two different rates ($30/hr framing, $45/hr crane) sees two separate earnings lines — not a single "Regular Pay" total
- When WAOT applies, the overtime section shows the derived weighted average rate, not just "OT: 1.5×"
- Every state income tax withheld appears as a separate labeled line (e.g., "PA State Tax: $X", "OH State Tax: $Y") — not merged into "State Taxes"
- YTD gross, total taxes, total deductions, and net pay are displayed and accurate for the employee's year to date
- No SSN, full bank account number, or other sensitive PII appears on the pay stub face
- Pay stubs for 100 employees are generated within 60 seconds of payroll finalization

### 9. Dependencies & Risks

**Dependencies:**
- E4 (Earnings Engine): source of itemized earnings lines with rate, hours, pay type, and trade/job context — **High risk**: stub quality depends entirely on earnings detail granularity
- E5 (Tax Withholding Engine): source of deduction and withholding lines — **High risk**: stub completeness
- E6 (Disbursement Module): triggers pay stub generation on payroll finalization; provides pay date — **Medium risk**: generation timing

**Risks:**
- If E4 delivers a single aggregated earnings amount rather than line-by-line detail, construction-specific multi-rate stub layout is impossible — data contract must be confirmed before development
- WAOT display requires sufficient calculation detail from E4-3; if rate buckets are not emitted per EarningsLine, stub cannot render WAOT transparency

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Pay stubs generated and delivered on pay date | 100% |
| Employee pay stub disputes attributable to stub clarity | <1% — Inferred |
| Pay stubs generated within 60s of payroll finalization (100 employees) | 100% |

### 11. Assumptions

- Pay stubs are generated as PDFs (not HTML-only)
- Email delivery uses the employee's email address captured during onboarding (E2); no separate email verification step at pay stub delivery
- Secure link authentication does not require a full employee account login at GA (signed URL sufficient); full authentication deferred to E7b

---

---

## Feature E7-2 — State Compliance Content

### 1. Goal / Outcome

At GA, every pay stub generated by Prism meets the specific pay stub content requirements mandated by the employee's work state across all 50 states. Admins and employees in any state receive a stub that satisfies local law without any additional configuration — eliminating the compliance gap that exposes construction contractors to state labor board penalties.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — cannot be expected to know 50-state pay stub law; needs the system to handle it automatically
- **Employee (W-2)** — in states with strong stub disclosure requirements (CA, NY, IL), deserves a stub that meets those standards
- **External CPA / Bookkeeper** — needs stubs to be audit-ready per state requirements without manual review of state law

### 3. Business & PRD Drivers

- G3: Pay stub content meets state law requirements for all 50 states at GA
- FR: Pay Stub Content — YTD and Compliance Fields; 50-state compliance (§3a)
- UC-9 (P0 — GA): Pay stub content meets state-specific requirements for all 50 states
- Problem Statement: State compliance gaps — most states have specific pay stub content requirements that generic tools don't systematically meet

### 4. Problem / Rationale

States have divergent pay stub requirements: some mandate only employer name and gross/net; others require itemized deductions, YTD totals, accrued PTO balances, hourly rate disclosure, and more. California, New York, and Illinois have among the most detailed requirements. Contractors who use generic tools in these states generate non-compliant stubs — creating wage statement penalty exposure (California's penalties are $250/employee/violation for first offenses, up to $4,000 per employee). Prism's 50-state content layer ensures every stub is compliant without admin configuration.

### 5. In Scope

- Implement a state-specific compliance content layer that augments the base pay stub template per the employee's work state
- State requirements include (varies by state): employer name and address, employee name, employee address, employee ID, pay period dates, pay date, itemized deductions, YTD totals, hourly rate, hours worked, overtime rate and hours
- Source state requirements from legal/compliance-validated checklist prior to GA; content rules versioned and updatable without code release
- Surface a compliance flag in admin review if a state's pay stub rule set is not yet loaded in the system — no silent generation of non-compliant stubs
- ⚠️ Requires legal/compliance review: comprehensive 50-state pay stub content compliance checklist before GA

### 6. Out of Scope (for this feature)

- Base pay stub content (earnings lines, deductions, YTD) — E7-1
- Pay stub PDF generation — E7-1
- Delivery mechanism — E7-3
- Storage and retention — E7-4
- Accrued PTO balance display on pay stub — Future (requires HR accrual module)

### 7. Example "Super Stories"

- As a PR Admin with California field crews, I want the system to automatically include all required California wage statement fields (hourly rates, hours, applicable piece rate, etc.) without me having to configure anything.
- As a PR Admin in New York, I want the stub to meet New York's itemization requirements automatically so I don't risk wage statement violations.
- As an Employee in a state with mandatory YTD disclosure, I want to see my YTD figures on every pay stub without having to request them separately.

### 8. Acceptance Criteria Themes

- Every pay stub generated for an employee includes all state-mandated fields for that employee's work state — verified against legal/compliance checklist
- State content rules are data-driven (not hardcoded); updated rules take effect on the next payroll run after the update
- System flags and blocks stub generation (with admin-facing message) if the state's compliance content rules are not loaded — no silent non-compliance
- All 50 states are covered at GA with legal/compliance sign-off before GA launch in each state
- Compliance content layer is additive to the base stub; no state-specific override removes content required by E7-1

### 9. Dependencies & Risks

**Dependencies:**
- Legal / Compliance: 50-state pay stub content compliance checklist — **Medium risk**: GA readiness depends on completing this review before development finalizes
- E7-1 (Pay Stub Generation): base template must be extensible to accommodate state-specific fields

**Risks:**
- State pay stub compliance requirements missed or stale — mitigate with comprehensive compliance review before GA and versioned rule updates
- Some states require PTO balance disclosure, which cannot be met without a PTO accrual module — requires scoping decision before GA

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Pay stubs with complete required content (per state law) | 100% for all covered states |
| States covered at GA | All 50 states |

### 11. Assumptions

- State compliance content requirements are validated by legal/compliance before GA launch in each state
- Content rules are sourced from a validated legal/compliance checklist — not from a third-party data provider (unlike OT rules in E4-4)
- Accrued PTO balance disclosure (required by some states) is out of scope at GA pending HR accrual module

---

---

## Feature E7-3 — Digital Delivery

### 1. Goal / Outcome

Every employee receives their pay stub via email on pay date — a secure link to view and download their PDF — without any admin action. Delivery status is tracked, and admins are alerted when delivery fails so they can take corrective action. No printing, no physical distribution, no stubs lost in the mail.

### 2. Primary Personas

- **Employee (W-2)** — expects to receive a pay stub email on pay day; wants to click a link and view/download their stub
- **PR Admin ("Overwhelmed Operator")** — needs delivery to happen automatically; needs to know when it fails so they can resolve it
- **External CPA / Bookkeeper** — may rely on admin-forwarded stubs if email delivery fails; benefits from delivery visibility

### 3. Business & PRD Drivers

- G1: Every employee receives an accurate, itemized pay stub for every payroll run, delivered digitally on pay date
- FR: Pay Stub Delivery (§3a)
- UC-5 (P0 — GA): Deliver pay stub via email with secure, time-limited link
- Problem Statement: No digital delivery infrastructure — some SMB tools produce a PDF but have no email delivery mechanism; admins print and hand out physical stubs

### 4. Problem / Rationale

Without automated digital delivery, admins must manually print, distribute, or email pay stubs — a time-consuming process that creates paper trail gaps and frequently results in employees losing their stubs. Employees who can't find their stub call the admin to verify their pay, creating additional overhead. Digital delivery on pay date, with a tracked secure link, eliminates all of this while providing a compliance record that the stub was delivered.

### 5. In Scope

- Send an email to the employee's email address on file on pay date with a secure link to view and download their pay stub
- Secure link is time-limited (duration TBD — see OQ-2); stub remains accessible to admin after link expiry
- Email content includes: employee name, pay period dates, pay date, and link to view stub
- Log delivery status per employee per run: email sent, link accessed, download initiated
- Alert admin when email delivery fails (bounce detected) — admin can resend or access the stub directly to forward manually
- ⚠️ Requires human review: Secure link authentication mechanism — does it require employee login, or is a time-limited signed URL sufficient? (OQ-1)

### 6. Out of Scope (for this feature)

- Pay stub PDF generation — E7-1
- Employee portal login and authenticated historical stub access — E7b
- PDF storage and retention — E7-4
- Delivery of W-2s or tax documents — E8

### 7. Example "Super Stories"

- As an Employee, I want to receive an email on my pay date with a link to view my pay stub so that I can confirm my pay without calling HR.
- As a PR Admin, I want to be notified if an employee's pay stub email bounced so that I can update their email address and resend before they call me.
- As a PR Admin, I want pay stubs delivered automatically on pay date without any action on my part so that I can focus on other tasks.

### 8. Acceptance Criteria Themes

- Employee receives a pay stub email on pay date; the secure link opens the PDF matching that run's calculation output
- Delivery status (sent, accessed, downloaded) is logged per employee per run and visible to admin
- Admin receives an alert when a delivery email bounces; the alert includes the employee name and the affected pay period
- Secure link is time-limited; after expiry, the link returns a clear message that the stub is accessible via admin portal
- Delivery success rate target: >99.5% of emails successfully sent
- Email content is accurate: correct employee name, pay period, pay date, and functional stub link

### 9. Dependencies & Risks

**Dependencies:**
- Email / Comms Service (Notification Manager from System Dev Plan): must support transactional email with delivery tracking — **Medium risk**: delivery reliability depends on email infrastructure
- E7-1 (Pay Stub Generation): PDF must be generated and stored before delivery email is triggered
- E6 (Disbursement Module): provides pay date trigger and confirms payroll finalization

**Risks:**
- Email delivery failures (wrong email on file, spam filters) — mitigate with delivery tracking and admin bounce alerts; admin can resend or download and forward
- Open question on authentication mechanism (OQ-1): if a full employee login is required (vs. signed URL), delivery UX complexity increases significantly and E7b dependency is introduced at GA

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Pay stub delivery failures (email bounced, link expired) | <0.5% — Inferred |
| Email delivery success rate | >99.5% |
| Pay stub link access rate (% of employees who open link) | Baseline tracked post-GA |

### 11. Assumptions

- Email delivery uses the employee's email address captured during onboarding (E2); no separate email verification step
- Secure link authentication does not require a full employee account login at GA (signed URL sufficient); full authentication deferred to E7b (OQ-1)
- Link expiry window is confirmed before development begins (OQ-2); proposed: 30 days

---

---

## Feature E7-4 — Retention & Access

### 1. Goal / Outcome

Every pay stub is stored as an immutable, unalterable PDF record for a minimum of 4 years per FLSA requirements. Admins can retrieve any employee's pay stub for any pay period instantly. CPA/Bookkeeper roles have read-only access to stubs for the employees they support. No stub is ever lost, overwritten, or inaccessible — even after the secure delivery link has expired.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — needs to retrieve any employee's pay stub instantly for any pay period for employee requests, audits, or disputes
- **External CPA / Bookkeeper** — needs read-only access to employee pay stubs for audit and record support without going through admin
- **Employee (W-2)** — [at GA, indirect access via admin; direct self-service access deferred to E7b]

### 3. Business & PRD Drivers

- G4: Historical pay stubs accessible to both admin and employee for minimum 4 years
- FR: Pay Stub Retention and Access (§3a)
- UC-6 (P0 — GA): Store pay stubs as immutable PDFs with 4-year minimum retention
- UC-7 (P0 — GA): Admin access to all employee pay stubs by pay period or employee
- UC-8 (P1 — GA): CPA read-only access to employee pay stubs
- Problem Statement: Some SMB tools produce a PDF but have no retention infrastructure — stubs are lost, deleted, or inaccessible for compliance purposes

### 4. Problem / Rationale

FLSA requires payroll records to be retained for 3 years; many state laws extend this to 4 or 7 years. Without immutable storage and structured access, pay stubs become unretrievable — creating audit failures, employee dispute exposure, and potential wage-and-hour liability. Construction contractors face FLSA audits and state labor board investigations more frequently than other SMBs due to the complexity of their pay structures. Prism's retention infrastructure ensures no stub is ever lost, and every authorized party can retrieve what they need without depending on the admin.

### 5. In Scope

- Store every generated pay stub PDF as an immutable, unalterable record — no overwrite capability once generated
- Minimum retention period: 4 years per FLSA (7-year retention for applicable tax records where required)
- Admin access: retrieve all pay stubs for all employees, filterable by employee name/ID and pay period date
- CPA/Bookkeeper (read-only role): access pay stubs for employees they are authorized for, via their RBAC role (Security & RBAC epic)
- Secure links in delivery emails authenticate before allowing stub access; unauthenticated access not permitted
- ⚠️ Requires engineering decision: document storage system for immutable PDF retention (S3, Azure Blob, or internal document service) — OQ-5

### 6. Out of Scope (for this feature)

- Employee self-service stub access (login, historical stub browser) — E7b
- Pay stub generation — E7-1
- Email delivery — E7-3
- W-2 and tax document retention — E8
- Admin payroll register and reports — E10

### 7. Example "Super Stories"

- As a PR Admin, I want to retrieve any employee's pay stub for any pay period from the last 4 years so that I can respond to employee inquiries or audit requests without searching through local files.
- As an External CPA, I want read-only access to pay stubs for my client's employees so that I can pull records for an audit without having to request each one from the admin.
- As a PR Admin, I want to know that pay stubs are permanently stored and cannot be altered after generation so that I have a defensible compliance record if a wage dispute arises.

### 8. Acceptance Criteria Themes

- Pay stubs are stored as immutable records — no edit or overwrite is possible after generation; any attempt is blocked and logged
- Admin can retrieve any pay stub for any employee for any pay period within the retention window in <5 seconds
- CPA/Bookkeeper role can access stubs for authorized employees in read-only mode — cannot edit, download in bulk, or access employees they are not authorized for
- Pay stubs remain accessible to admin for a minimum of 4 years after the pay date
- Historical pay stub retrieval success rate: 100%
- Secure link accesses authenticate before returning stub content; direct URL guessing does not return stub content

### 9. Dependencies & Risks

**Dependencies:**
- Document storage system (S3, Azure Blob, or internal): must support immutable storage, 4-year retention policy, and access control — Engineering decision (OQ-5) — **Medium risk**: infrastructure decision must precede development
- Security & RBAC epic: CPA read-only role must be configured and enforced before CPA access feature can be enabled
- E7-1 (Pay Stub Generation): PDF must be generated before storage can occur

**Risks:**
- Document storage cost at scale (4+ years × all employees × every pay run) — must be scoped with engineering before architecture is finalized
- Access control granularity for CPA role (which employees can a CPA access?) requires RBAC configuration that may not be ready at GA

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Historical pay stub retrieval success (4-year retention) | 100% |
| Pay stubs stored as immutable records | 100% (zero alteration incidents) |
| Admin pay stub retrieval latency | <5 seconds |

### 11. Assumptions

- Pay stubs are stored in a cloud blob storage system (S3-equivalent); specific provider confirmed by Engineering (OQ-5) before development begins
- RBAC for CPA/Bookkeeper access is defined in the Security & RBAC epic; E7-4 consumes that role definition
- 4-year retention minimum per FLSA; 7-year retention for applicable records per state tax law — confirmed with legal before storage policy is finalized

---

---

## Traceability Table

| Requirement / Use Case ID | Description | Feature(s) |
|--------------------------|-------------|------------|
| UC-1 / FR: Pay Stub Generation | Generate pay stub per employee per run automatically | E7-1 |
| UC-2 / FR: Earnings Itemization | Multiple earnings lines by rate, trade, job; WAOT transparency | E7-1 |
| UC-3 / FR: Deductions Itemization | All pre-tax, tax, and post-tax lines itemized | E7-1 |
| UC-4 / FR: YTD Totals | Gross, deductions, taxes, net — YTD per employee | E7-1 |
| UC-5 / FR: Email Delivery | Secure link email to employee on pay date | E7-3 |
| UC-6 / FR: Immutable Storage | PDF retention, 4-year minimum, no overwrites | E7-4 |
| UC-7 / FR: Admin Access | All stubs by employee and pay period | E7-4 |
| UC-8 / FR: CPA Access | Read-only stub access via RBAC role | E7-4 |
| UC-9 / FR: State Compliance | 50-state content requirements on stub face | E7-2 |
| NFR: Security | No SSN, full bank number on stub; authenticated access only | E7-1, E7-4 |
| NFR: Retention | 4-year FLSA; 7-year tax records where applicable | E7-4 |
| NFR: Performance | 100 stubs generated within 60s of finalization | E7-1 |
| NFR: Delivery reliability | >99.5% email delivery success | E7-3 |
| NFR: Accessibility | PDF WCAG 2.1 AA where feasible | E7-1 |
| G1: Digital delivery on pay date | 100% stubs delivered on pay date | E7-1, E7-3 |
| G2: Construction-aware content | Multi-rate earnings, WAOT, trade context | E7-1 |
| G3: 50-state compliance | State content requirements met at GA | E7-2 |
| G4: 4-year access | Historical retrieval success | E7-4 |
| OQ-1: Signed URL vs. employee login | Determines delivery UX and E7b dependency | E7-3 |
| OQ-2: Link expiry window | 30 days vs. 90 days for secure link | E7-3 |
| OQ-3: Delivery timing (pay date vs. finalization date) | Determines email trigger timing | E7-3 |
| OQ-4: WAOT display requirement on stub face | Legal guidance on OT detail disclosure | E7-1 |
| OQ-5: Document storage system | S3 vs. Azure Blob vs. internal — Engineering | E7-4 |

---

**Notes on Open Questions for Sprint Planning:**

- **OQ-1** (signed URL vs. employee login) is a security/product decision that materially affects E7-3 UX and determines whether E7b must be partially scoped at GA. Resolve in Sprint 2.
- **OQ-2** (link expiry window) is a legal/product question with low implementation complexity but must be resolved before E7-3 development begins.
- **OQ-3** (delivery timing) — stubs delivered on pay date vs. finalization date — affects E7-3 triggering logic and must be confirmed with Product before Sprint 2.
- **OQ-4** (WAOT display on stub face) is a legal/compliance question that determines E7-1 template requirements. Resolve in Sprint 2.
- **OQ-5** (document storage system) is an Engineering architecture decision that must be resolved in Sprint 1 before E7-4 development begins.
