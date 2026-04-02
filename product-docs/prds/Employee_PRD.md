# PRD: Prism Construction Payroll — Employee Management

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Time Collection, Payroll Processing, Disbursement, Tax Filing, Job Costing.*

---

# 1. Initiative Definition

### 1a. Overview

The Employee Management module is the foundational layer of Prism Construction Payroll. It enables the PR Admin to add new workers, capture all compliance data required before a first paycheck can be issued, and maintain that data over the employee lifecycle. For construction SMBs operating across state lines — a common reality, not an edge case — the module handles multi-state withholding requirements, state reciprocity agreements, and local/municipal tax obligations automatically, prompting the admin when new jurisdictions are triggered. The goal is to make getting a worker "payroll-ready" fast, error-proof, and construction-aware in a way that neither QuickBooks nor Gusto achieves today.

### 1b. Problem Statement

Setting up an employee for construction payroll is deceptively complex. Generalist tools (QuickBooks Payroll, Gusto) guide users through a clean onboarding wizard — but that wizard is designed for a single-state, single-rate office worker, not a framer who earns $30/hr on residential work and $45/hr on commercial work, lives in Pennsylvania, and spends three weeks on a job site in Ohio covered by a PA-OH reciprocity agreement.

Current failure modes:

- **Multi-rate blind spots**: QB and Gusto support one pay rate per employee; construction trades require rates by task, trade classification, and project type. Admins manually track overrides in spreadsheets.
- **State/local tax gaps**: Generalist tools ask for the employee's home state and stop. They don't prompt for work-state withholding, don't know reciprocity agreements, and have no awareness of local taxes (Philadelphia wage tax, Ohio RITA, Kentucky county taxes, PA school district taxes).
- **Classification risk**: Owners frequently misclassify subcontractors as employees (or vice versa) without guardrails, exposing the business to IRS penalties averaging $880K+ in restitution in egregious cases.
- **Maintenance friction**: When an employee moves, gets a rate change, or starts working in a new state, there is no workflow to prompt the admin to update withholding. Changes are missed until a tax notice arrives.

### 1c. Goals

| # | Goal |
|---|------|
| G1 | A new employee can be fully payroll-ready in under 10 minutes with no compliance data missing |
| G2 | Zero withholding errors attributable to missed multi-state, reciprocity, or local tax setup |
| G3 | Eliminate worker misclassification risk through guided classification guardrails |
| G4 | Support employees working in multiple states and localities without requiring admin tax expertise |
| G5 | Ongoing employee changes (rate, tax, payment method) are captured through structured, auditable workflows |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Time from "Add Employee" initiation → payroll-ready status | <10 minutes | Operational |
| Employee records with incomplete required fields at time of first payroll run | 0% | Quality |
| Multi-state/local withholding setup errors (wrong state, missed locality) | 0% — **Inferred** | Compliance |
| Employee profile change audit trail coverage | 100% of fields | Compliance |
| Onboarding wizard completion rate (all steps, no abandonment) | >85% — **Inferred** | Product |

### 1e. Out of Scope (This PRD)

- Time entry, clock-in/clock-out (Time Collection PRD)
- Gross-to-net calculation, WAOT, deductions processing (Payroll Processing PRD)
- ACH disbursement, check printing, pay stub delivery (Disbursement PRD)
- Federal/state tax filing and remittance — 941, W-2, 1099 (Tax Filing PRD)
- Job cost allocation and GL sync (Job Costing PRD)
- Benefits administration, PTO, HRIS features (future)
- Union CBA and fringe benefit management (Tier 2+)
- Certified payroll / prevailing wage classification (Tier 2+)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Key Pain Points | Environment |
|---------|------|-------|-----------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager at a 5–25 person contractor | Get new hires set up fast and correctly; avoid IRS problems | "I don't know what Ohio withholding ID I need"; multi-state tax confusion; misclassification fear | Desktop; weekly cadence; moderate tech fluency |
| **New Employee** | Incoming W-2 worker or 1099 subcontractor | Get paid correctly and on time; not fill out the same form twice | Receiving unclear onboarding instructions; paper W-4 with no guidance | Mobile; one-time interaction; variable tech fluency |
| **Field Supervisor** | Crew lead or foreman | Confirm their workers are set up in the system | Not their primary job; wants to verify, not enter data | Mobile; limited system access |
| **External CPA / Bookkeeper** | Retained accountant | Ensure employee records support correct GL entries and tax filings | Missing withholding certificates; wrong state IDs; unexplained pay rate changes | Desktop; read-only; periodic access |

### 2b. User Journeys / Workflows

**Primary: PR Admin Adds a New Employee**

```
Admin clicks "Add Employee"
 │
 ├─ STEP 1: Classification
 │   └─ W-2 Employee or 1099 Subcontractor?
 │       └─ [If uncertain → launch IRS factor guardrail wizard]
 │
 ├─ STEP 2: Basic Info
 │   └─ Full name, preferred name, phone, email, date of birth
 │       Home address (street, city, state, ZIP)
 │       [Home address triggers: home state withholding review]
 │
 ├─ STEP 3: Job Role & Pay
 │   └─ Job title, employee role (field / office / mixed)
 │       Hire date, pay frequency (weekly / bi-weekly / semi-monthly)
 │       Primary pay rate + trade/cost code mapping
 │       [+ Add rate] for additional rates by trade or cost code
 │       Workers' comp classification code
 │
 ├─ STEP 4: Federal Tax Withholding (W-4)
 │   └─ Digital W-4 completion (guided fields)
 │       Filing status, dependents, additional withholding
 │       [Stored as compliance document]
 │
 ├─ STEP 5: State & Local Tax Withholding
 │   └─ Home state withholding certificate (pre-populated by state)
 │       System checks: "Does this employee work in any other state?"
 │       [If yes → work state withholding added]
 │       [If home state + work state have reciprocity → system flags,
 │        only home state withholding required; admin confirms]
 │       Local tax check: system cross-references home address + known
 │       job site localities → prompts for any applicable local withholding
 │
 ├─ STEP 6: Payment Method
 │   └─ Direct deposit (1 or 2 accounts with split config)
 │       OR printed check
 │       Bank account verification (micro-deposit or instant)
 │
 ├─ STEP 7: Employee Invite (Optional)
 │   └─ Send mobile invite → employee self-completes W-4,
 │       payment method, personal details
 │       Admin notified when self-onboarding is complete
 │
 └─ Profile complete → "Payroll Ready" status confirmed
     Setup checklist shows 7/7 complete on admin home
```

**Secondary: Employee Self-Onboarding via Invite**

```
Employee receives SMS/email invite link → opens mobile
→ Confirms personal info (pre-filled by admin) → completes W-4
→ Enters bank account for direct deposit → reviews and signs
→ Confirmation sent to admin → profile marked complete
```

**Tertiary: Admin Updates an Existing Employee**

```
Trigger: employee moves states / gets a raise / new bank account / new job site in a new state

Admin opens employee profile → selects field to edit
→ System logs change with timestamp and changed-by
→ [If home address changes state] → prompt: "Do you need to update
   state withholding? Previous: PA | New: OH — would you like to add
   OH withholding or check for a reciprocity agreement?"
→ [If new job site added in new locality] → prompt: "This employee
   has a new job site in Philadelphia, PA. Philadelphia has a local
   wage tax. Would you like to configure local tax withholding?"
→ Change saved, audit trail updated
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Add a new W-2 employee (full onboarding wizard) | P0 |
| UC-2 | Add a 1099 subcontractor record | P0 |
| UC-3 | Launch worker classification guardrail wizard | P0 |
| UC-4 | Configure multi-state withholding for an employee | P0 |
| UC-5 | Apply state reciprocity agreement (suppress work-state withholding) | P0 |
| UC-6 | Configure local/municipal tax withholding | P0 |
| UC-7 | Set up multiple pay rates by trade/cost code per employee | P0 |
| UC-8 | Configure payment method (direct deposit with split, or check) | P0 |
| UC-9 | Invite employee to self-complete onboarding via mobile | P1 |
| UC-10 | Update employee profile (address, rate, withholding, payment) | P0 |
| UC-11 | Terminate / deactivate an employee | P1 |
| UC-12 | View full employee audit trail (changes, by whom, when) | P1 |
| UC-13 | CPA read-only access to employee withholding records | P2 |

---

# 3. Requirements

### 3a. Functional Requirements

#### Classification

- The system shall present a worker classification choice (W-2 Employee / 1099 Subcontractor) as the first step before any other employee data is collected — **P0**
- The system shall provide a guided IRS factor wizard (behavioral control, financial control, type of relationship) when the admin is unsure of classification; the wizard shall produce a recommended classification with a compliance disclaimer — **P0**
- The system shall store the classification decision and the supporting factors selected in the guardrail wizard as an auditable record — **P0**
- The system shall prevent a 1099 subcontractor from being enrolled in federal/state withholding — **P0**

#### Basic Employee Profile

- The system shall capture: legal first/last name, preferred name, date of birth, phone, personal email, and home mailing address (street, city, state, ZIP) — **P0**
- The system shall use the home address to automatically identify applicable home-state withholding requirements and flag any known local tax jurisdictions tied to that ZIP code — **P0**
- The system shall support a profile photo upload — **P2**

#### Job Role & Pay Rate Configuration

- The system shall capture: job title, employee role (field / office / mixed), hire date, and pay frequency — **P0**
- The system shall support assignment of multiple pay rates per employee, each mapped to a trade type or cost code, with an effective date — **P0**
- The system shall enforce that at least one primary pay rate is set before marking an employee payroll-ready — **P0**
- The system shall capture the workers' compensation classification code per employee, with the ability to assign different WC codes for different trades if applicable — **P1**
- The system shall capture employee skills and active certifications (type, issue date, expiration date), with expiration alerts — **P2**

#### Federal Tax Withholding (W-4)

- The system shall present a guided, digital Form W-4 for all W-2 employees, supporting both the current IRS W-4 format and the legacy pre-2020 format for employees who have not updated — **P0**
- The system shall store the completed W-4 as a compliance document attached to the employee record — **P0**
- The system shall flag when a W-4 has not been completed and block payroll-ready status until it is — **P0**
- The system shall support re-issuance of a new W-4 when the employee requests a withholding change (life event), with the previous W-4 retained in audit history — **P0**

#### State Tax Withholding

- The system shall automatically determine the required state withholding certificate based on the employee's home state and present it pre-labeled for completion — **P0**
- The system shall prompt the admin to identify all states in which the employee will perform work; for each work state, the system shall present the applicable withholding certificate — **P0**
- The system shall maintain a current database of all 50-state withholding certificate forms, updating when states change their forms — **P0** ⚠️ *Requires human review: internal build vs. third-party tax form provider*
- The system shall identify active state reciprocity agreements between the employee's home state and each work state — **P0**
- When a reciprocity agreement exists, the system shall notify the admin, explain the implication (only home-state withholding required), and present the applicable reciprocity exemption form for the employee to complete — **P0**
- When no reciprocity exists and the employee works in multiple states, the system shall configure withholding for each work state and the home state per applicable rules — **P0**
- The system shall prompt the admin to review and update state withholding when an employee's home address changes to a new state — **P0**
- The system shall prompt the admin to add work-state withholding when a new job site is assigned to an employee in a state not yet configured for that employee — **P1**

#### Local / Municipal Tax Withholding

- The system shall identify local income tax obligations based on the employee's home address ZIP code (e.g., Philadelphia wage tax, PA school district, Ohio RITA/CCA municipalities, Kentucky county taxes) — **P0**
- The system shall identify local income tax obligations based on the employee's work locations (job site city/locality), where the work locality imposes a nonresident local tax — **P0**
- The system shall present the applicable local withholding setup for admin confirmation when a local tax is detected — **P0**
- The system shall distinguish between taxes owed at the employee's residence locality vs. the work locality, applying the correct resident/nonresident rates — **P0**
- The system shall prompt to review local withholding when the employee's home address or active job sites change — **P1**
- ⚠️ *Requires human review: local tax jurisdiction database maintenance — internal build vs. third-party provider (e.g., Symmetry, Vertex)*

#### Payment Method

- The system shall support direct deposit configuration for up to 2 bank accounts, with a percentage or fixed-dollar split — **P0**
- The system shall support printed check as an alternative payment method — **P0**
- The system shall support bank account verification before the first payroll run (micro-deposit or instant verification) — **P0** ⚠️ *Requires human review: verification method and partner*
- The system shall allow an employee to update their own payment method via the self-service mobile experience — **P1**

#### Employee Self-Onboarding

- The system shall allow the admin to send an email or SMS invite to the employee with a secure, time-limited onboarding link — **P1**
- Via the self-onboarding flow, the employee shall be able to: confirm personal details, complete W-4, enter bank account for direct deposit, and provide emergency contact — **P1**
- The system shall notify the admin when self-onboarding steps are completed, and update payroll-ready status accordingly — **P1**
- Self-onboarding shall function on mobile (responsive web or native app) — **P1**

#### Ongoing Employee Maintenance

- The system shall allow any employee profile field to be updated by an authorized admin; all changes shall be logged with field name, previous value, new value, changed-by user, and timestamp — **P0**
- The system shall surface contextual prompts when certain changes are made that may trigger compliance actions (address change → state/local tax review; new job site state → work-state withholding; W-4 change request → re-issue W-4) — **P0**
- The system shall support pay rate changes with an effective date; historical rates shall be retained and accessible — **P0**
- The system shall support employee termination/deactivation with a termination date, reason code, and final pay method designation — **P1**
- The system shall allow reactivation of a previously terminated employee — **P2**

#### Employee List & Search

- The system shall display all employees in a list view with status (Active, Inactive, Payroll-Ready, Setup Incomplete), filterable by status, role, and department — **P0**
- The system shall surface a setup completion indicator per employee (e.g., "5 of 7 steps complete") on the list and employee detail views — **P0**

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security** | AES-256 encryption at rest and in transit for all PII (SSN, bank details, DOB); SSN masked in all UI views — last 4 only |
| **Access Control** | RBAC: Admin (full edit), Supervisor (view only, no pay rates), Employee (self-service fields only), CPA (read-only reports); no cross-employee SSN or pay rate visibility for non-admin roles |
| **Usability** | Guided wizard pattern for new employee setup; inline help text for every tax form field; mobile-responsive for self-onboarding |
| **Compliance** | W-4 and state withholding certificates stored as immutable compliance documents; 4-year minimum retention per FLSA |
| **Audit** | Full field-level change log; accessible to admin and CPA roles |
| **Reliability** | Employee profile operations (save, update, invite) available 99.9% uptime |
| **Performance** | Employee list loads <2 seconds for up to 500 records; wizard step transitions <1 second |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| Employee | ID, classification (W2/1099), status, hire/term date, profile fields | One per worker |
| PayRate | employee\_id, rate, rate\_type (hourly/salary), trade/cost\_code, effective\_date | 1:many per employee |
| WithholdingElection | employee\_id, jurisdiction\_type (federal/state/local), jurisdiction\_code, form\_version, election\_data, effective\_date | 1:many per employee |
| JurisdictionConfig | state/locality code, reciprocity partners, local tax rules, form references | Maintained via tax provider |
| EmployeeDocument | employee\_id, doc\_type (W-4, state cert, I-9), file\_ref, captured\_date | Immutable once signed |
| AuditLog | entity, field, old\_value, new\_value, changed\_by, timestamp | Append-only |
| PaymentMethod | employee\_id, method (ACH/check), account(s), split config | Encrypted bank details |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Tax jurisdiction database (e.g., Symmetry, Vertex) | State withholding forms, local tax rules, reciprocity agreements | On employee add/update and address change | **Buy** — maintaining 50-state + 10,000+ local jurisdictions in-house is not viable |
| Prism Job/Cost Code registry | Filter cost codes when mapping pay rates to trades | On pay rate setup | Internal Prism platform |
| Bank verification partner (e.g., Plaid, Stripe) | Validate direct deposit accounts before first payroll | On payment method setup | **Buy** |
| Prism Payroll Processing module | Provide payroll-ready employee + withholding data for payroll runs | On each payroll run | Internal — read-only handoff |
| Document storage | Store signed W-4s and state certificates as immutable records | On form completion | Internal or cloud storage (S3-equivalent) |

#### Platform / Infrastructure Constraints

- SSNs must never appear in logs, URLs, or unsecured API responses
- Multi-tenant isolation: one company's employee data is never accessible to another
- Self-onboarding link must expire after 7 days or first use — **Inferred**
- ⚠️ **Requires human review**: local tax jurisdiction database vendor selection is a critical path dependency

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E1: Onboarding Wizard** | End-to-end guided setup flow for new employees; classification guardrail; payroll-ready gating | G1, G3 | UC-1, UC-2, UC-3 |
| **E2: Tax Jurisdiction Intelligence** | Multi-state withholding, reciprocity detection, local tax identification — proactive, address/job-site-driven | G2, G4 | UC-4, UC-5, UC-6 |
| **E3: Pay Rate Management** | Multiple rates per employee by trade/cost code, effective dates, WC code assignment | G1, G5 | UC-7 |
| **E4: Payment Method Setup** | Direct deposit (split accounts), check, bank verification | G1 | UC-8 |
| **E5: Employee Self-Service** | Mobile invite, self-complete W-4 and payment method, personal info confirmation | G1 | UC-9 |
| **E6: Employee Lifecycle Management** | Profile maintenance, change audit trail, contextual compliance prompts, termination/reactivation | G5 | UC-10, UC-11, UC-12 |
| **E7: Employee List & Visibility** | Status-based list, setup completion indicator, search/filter | G1 | UC-1, UC-13 |

### 3e. High-Level Acceptance Criteria

- An admin can complete all 7 onboarding wizard steps for a new W-2 employee in under 10 minutes on desktop; the system blocks payroll-ready status if any required step is incomplete
- The classification wizard presents at least 5 IRS control-factor questions and renders a recommended classification; the admin must acknowledge the recommendation before proceeding
- When an employee's home state and a work state have an active reciprocity agreement, the system detects it automatically, presents the correct exemption certificate, and suppresses work-state withholding — requiring zero manual tax research by the admin
- When a home address or active job site is in a locality with a known local income tax, the system surfaces a setup prompt before the employee's first payroll run
- All field-level changes to an employee profile are logged (field, old value, new value, user, timestamp) and accessible to admin and CPA roles
- An employee receiving a self-onboarding invite can complete W-4 and direct deposit setup on mobile in under 5 minutes without admin assistance
- Pay rate changes include an effective date; the system retains historical rates and uses the correct rate for each pay period
- Bank account information is never displayed in full in any UI view; routing/account numbers are masked after entry
- Employee list clearly distinguishes "Payroll Ready" from "Setup Incomplete" with a step-level indicator; admin can see which specific steps remain

### 3f. Links to Prototypes

- Trimble Financials working prototype — *TF\_Emp\_WorkingProto.png*
- Gusto Add Employee UX reference — *Gusto\_AddEmp.png*
- QuickBooks Payroll Add Employee reference — *QB\_AddEmp.png*
- User Journey Map (PR Admin / Adding Employees) — *UserJourney\_AddEmp.png*
- **Lista Add Employee clickable prototype** — `prototype/add-employee-prototype.html` (see `prototype/PROTOTYPE_FLOWS.md` for flows)

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Phase 1 — MVP**

Target: Non-union, non-certified contractors; 1–25 employees; multi-state work supported from day 1
Scope: E1 (full onboarding wizard), E2 (multi-state + reciprocity + local tax), E3 (multi-rate pay), E4 (payment method), E7 (employee list + status)
Not in Phase 1: E5 (self-onboarding), full E6 lifecycle (termination, reactivation, CPA audit UI)
Launch: Texas-first GA (no state income tax — validates wizard flow with lower local tax complexity); multi-state employees supported from launch

**Phase 2 — Completion**

Scope: E5 (employee self-onboarding via mobile invite), E6 (full lifecycle: termination, reactivation, complete audit trail UI for CPA access)
Target: All active non-union Prism Payroll customers

**Phase 3 — Future**

Scope: Union CBA employee classification fields (journeyman, apprentice, local number), prevailing wage classification codes, benefits enrollment linkage, HRIS integration (Procore HR sync)

**Rollout:** 5–10 design partner contractors (include at least one multi-state PA/OH or PA/NJ contractor for reciprocity validation) → private beta → Texas GA → multi-state GA

---

# 5. Supporting Information

### 5a. Assumptions

- Prism Accounting already holds company profile data (EIN, company address, active jobs/cost codes); Employee Management consumes this data — does not re-collect it
- A third-party tax jurisdiction database will be licensed to provide: state withholding form libraries, reciprocity agreement data, and local tax jurisdiction rules and rates
- Phase 1 scope is intentionally non-union; union CBA classification fields (journeyman, apprentice, local number) are deferred to Phase 3
- Employee self-onboarding (E5) is a P1 convenience feature; admin-completed onboarding is sufficient for MVP launch

### 5b. Dependencies

| Dependency | Owner | Risk |
|------------|-------|------|
| Tax jurisdiction database vendor selection (reciprocity + local tax rules + form library) | Engineering / Legal | **High** — critical path for E2 |
| Prism Job/Cost Code API availability for pay rate mapping | Platform team | **High** — needed for E3 |
| Bank verification partner (Plaid, Stripe, or equivalent) | Engineering / Finance | **Medium** |
| State withholding form library (current + annually updated) | Tax vendor or internal | **High** |
| Mobile self-onboarding infrastructure | Engineering | **Medium** — Phase 2 |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Local tax jurisdiction database is incomplete or stale | Medium | High | License a maintained third-party provider; do not build in-house | Yes — vendor selection |
| State reciprocity agreements change mid-year (states modify or end agreements) | Low | High | Use provider with real-time regulatory updates; surface alert to admin when a known agreement changes for their employees | Yes |
| Admin treats multi-state prompt as optional and dismisses it | High | High | Trigger prompts from job site assignment (contextual), not as a standalone step; use blocking language if employee is within 30 days of first payroll | No |
| Self-onboarding link security vulnerabilities (phishing, reuse) | Low | High | Time-limited (7 days), single-use links; require identity confirmation step before W-4 or bank data entry | Yes — security review |
| Texas-first launch under-tests local tax feature (TX has no state income tax) | Medium | Medium | Include at least one multi-state design partner (PA, OH, or KY contractor) in private beta regardless of GA geography | No |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Onboarding wizard step abandonment | `wizard_step_abandoned` (step #, employee_id) | Product |
| Multi-state withholding prompt acceptance rate | `multistate_prompt_accepted` / `dismissed` | Product |
| Local tax prompt acceptance rate | `local_tax_prompt_accepted` / `dismissed` | Product |
| Self-onboarding completion rate | `self_onboard_invite_sent` → `self_onboard_complete` | Product |
| Profile maintenance change frequency | `employee_profile_updated` (field name) | Operations |
| Classification guardrail usage | `classification_wizard_launched` / `recommendation_accepted` | Product |

**Dashboard:** ⚠️ [TBD — **Inferred:** Amplitude for product funnel analytics; internal BI for compliance audit coverage reporting]

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Which tax jurisdiction database vendor for reciprocity + local tax? (Symmetry, Vertex, Avalara) | Eng / Legal | Sprint 1 |
| OQ-2 | Is employee self-onboarding (E5) required for MVP or confirmed Phase 2? | Product | Sprint 1 |
| OQ-3 | Does the system calculate and configure local withholding amounts automatically, or identify the obligation and prompt admin to configure rates manually? | Product / Tax vendor | Sprint 2 |
| OQ-4 | For states with no income tax (TX, FL, WA) — does the wizard show an explicit "no state withholding required" confirmation step, or silently skip? | Product / Design | Sprint 2 |
| OQ-5 | For state reciprocity: does the system auto-apply the exemption, or require the employee to submit a signed exemption form first? (Behavior may vary by state pair) | Legal / Tax vendor | Sprint 2 |
| OQ-6 | Does Prism's existing job/cost code registry include job site address data (city, state, ZIP) needed to trigger locality-level tax prompts? | Platform team | Sprint 1 |
| OQ-7 | What is the termination workflow — is final pay designation in scope for Phase 1 or Phase 2? | Product | Sprint 1 |
