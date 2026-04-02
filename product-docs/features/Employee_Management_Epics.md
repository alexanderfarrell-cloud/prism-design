# Prism Construction Payroll — Employee Management: Epic Set

> *Generated from Employee PRD (Feb 23), User Insights Synthesis, prototype flows, and competitor references (Gusto, QuickBooks, Trimble).*
> *Last Updated: Feb 25, 2026*

---

## Epic Set Overview

| # | Epic | One-Sentence Summary |
|---|------|----------------------|
| 1 | **PR Admin New Employee Onboarding Wizard** | A guided 7-step wizard that gets a new W-2 or 1099 worker payroll-ready in under 10 minutes, with classification guardrails and construction-aware data capture. |
| 2 | **Tax Jurisdiction Intelligence & Multi-State Withholding** | Proactive detection and configuration of federal, state, and local tax withholding—including reciprocity agreements and locality-level taxes—driven by home address and job site. |
| 3 | **Construction Pay Rate Management** | Multiple pay rates per employee mapped to trade/cost code, with effective dates, workers' comp codes, and integration to Prism job costing. |
| 4 | **Payment Method Setup & Verification** | Direct deposit (up to 2 accounts with split), printed check, and bank account verification before first payroll. |
| 5 | **Employee Self-Onboarding via Invite** | Mobile-first invite flow allowing employees to self-complete W-4, payment method, and personal details; admin notified on completion. |
| 6 | **Employee Lifecycle Management & Audit Trail** | Profile maintenance with contextual compliance prompts, full field-level audit trail, termination/reactivation, and change workflows. |
| 7 | **Employee List, Search & Setup Visibility** | Status-based list (Active, Payroll Ready, Setup Incomplete), setup completion indicator (e.g., 5 of 7 steps), and search/filter by role and department. |

---

## Epic 1 — PR Admin New Employee Onboarding Wizard

### Goal / Outcome

Deliver a guided, end-to-end onboarding flow that enables a PR Admin to add a new W-2 employee or 1099 subcontractor and reach "Payroll Ready" status in under 10 minutes. The wizard surfaces classification guardrails when the admin is uncertain, blocks payroll-ready status until all required compliance data is captured, and presents a construction-aware structure that generalist tools (QuickBooks, Gusto) do not offer. This epic directly supports G1 (payroll-ready in &lt;10 min) and G3 (eliminate misclassification risk).

### Primary Personas

- **PR Admin** (primary) — Owner or Office Manager at 5–25 person contractor
- **External CPA / Bookkeeper** (secondary) — Benefits from complete, compliant records

### Business & PRD Drivers

- Goals: G1, G3
- Use Cases: UC-1 (Add W-2 employee), UC-2 (Add 1099 subcontractor), UC-3 (Classification guardrail wizard)
- Functional Requirements: Classification (worker type, IRS factor wizard, auditable record), Basic Employee Profile (name, DOB, contact, home address), Job Role & Pay (job title, role, hire date, pay frequency)
- Success Metric: Time from "Add Employee" initiation → payroll-ready &lt;10 minutes

### Problem / Rationale

Construction SMBs face a "Compliance Trap" (User Insights): they view payroll as high-stakes risk management, not just administration. Generalist tools offer clean wizards but are designed for single-state, single-rate office workers—not framers who work across state lines or earn different rates by trade. Admins fear misclassification (IRS penalties averaging $880K+ in egregious cases) and lack confidence in multi-state tax setup. A construction-aware wizard that guides them step-by-step and blocks incomplete setups reduces anxiety and errors.

### In Scope

- Step 1: Classification — W-2 vs 1099 choice; IRS factor guardrail wizard when uncertain; stored decision + supporting factors
- Step 2: Basic Info — Legal first/last name, preferred name, DOB, phone, email, home address (street, city, state, ZIP); home address triggers home-state and local tax detection
- Step 3: Job Role & Pay — Job title, employee role (field/office/mixed), hire date, pay frequency; primary pay rate + trade/cost code mapping; workers' comp classification code
- Step 4: Setup Path decision — Send invite (employee self-onboards) OR admin continues wizard
- Steps 5–7: Federal Tax (W-4), State & Local Tax, Payment Method — *covered by Epics 2 and 4; wizard orchestrates them*
- Payroll-ready gating — System blocks "Payroll Ready" until all required steps complete
- Save & Continue Later — Allow partial completion with clear "X of 7 steps complete" indicator
- 1099 path — Skip federal/state withholding steps; prevent 1099 from withholding enrollment

### Out of Scope (for this epic)

- Tax form content and jurisdiction logic (Epic 2)
- Multi-rate configuration details and Prism cost code integration (Epic 3)
- Bank verification mechanics (Epic 4)
- Self-onboarding invite delivery and employee-facing flow (Epic 5)
- Employee list UI and setup indicator display (Epic 7)

### Example "Super Stories"

- As a **PR Admin**, I want to **choose W-2 or 1099 at the start of adding an employee** so that **I never accidentally misclassify a worker and expose my business to IRS penalties**.
- As a **PR Admin**, I want to **launch an IRS factor wizard when I'm unsure about classification** so that **I get a recommended classification with a compliance disclaimer before proceeding**.
- As a **PR Admin**, I want to **complete a guided 7-step wizard to add a new employee** so that **I can get them payroll-ready in under 10 minutes without missing required compliance data**.
- As a **PR Admin**, I want to **save partial progress and return later** so that **I can finish onboarding when I have all the information (e.g., W-4, bank details)**.
- As a **PR Admin**, I want to **see which steps are incomplete for each employee** so that **I know exactly what's left before they can be paid**.

### Acceptance Criteria Themes

- Admin can complete all 7 onboarding wizard steps for a new W-2 employee in under 10 minutes on desktop.
- Classification wizard presents at least 5 IRS control-factor questions and renders a recommended classification; admin must acknowledge before proceeding.
- System blocks payroll-ready status if any required step is incomplete; setup checklist shows X of 7 complete.
- 1099 path skips federal/state withholding; 1099 cannot be enrolled in withholding.
- Wizard step transitions complete in &lt;1 second; inline help text available for every tax form field.
- All classification decisions and guardrail factors stored as auditable records.

### Dependencies & Risks

- **Upstream:** Prism Accounting company profile (EIN, address) and job/cost code registry must be available.
- **Downstream:** Epics 2, 3, 4 provide step content; Epic 7 displays setup status.
- **Risk:** Admin treats multi-state or local tax prompts as optional — mitigate with blocking language when employee is within 30 days of first payroll.

### Success Metrics / KPIs

- Time from "Add Employee" initiation → payroll-ready: **&lt;10 minutes** (operational)
- Onboarding wizard completion rate (all steps, no abandonment): **&gt;85%** (inferred)
- Employee records with incomplete required fields at first payroll run: **0%** (quality)
- Classification guardrail usage and recommendation acceptance rate (telemetry)

### Assumptions

- Prism Accounting already holds company profile data; Employee Management does not re-collect it.
- Wizard steps 5–7 (Federal Tax, State & Local Tax, Payment Method) are implemented by Epics 2 and 4; this epic owns the orchestration, navigation, and gating logic.
- "Save & Continue Later" persists partial data; admin can resume from any step.

---

## Epic 2 — Tax Jurisdiction Intelligence & Multi-State Withholding

### Goal / Outcome

Eliminate withholding errors attributable to missed multi-state, reciprocity, or local tax setup. The system automatically determines required withholding based on the employee's home address and work locations, identifies reciprocity agreements, surfaces local tax obligations (Philadelphia wage tax, Ohio RITA, Kentucky county taxes, PA school district), and prompts the admin when new jurisdictions are triggered. Zero manual tax research required. Supports G2 and G4.

### Primary Personas

- **PR Admin** (primary)
- **External CPA / Bookkeeper** (secondary)

### Business & PRD Drivers

- Goals: G2, G4
- Use Cases: UC-4 (Configure multi-state withholding), UC-5 (Apply reciprocity), UC-6 (Configure local/municipal tax)
- Functional Requirements: State Tax Withholding (50-state forms, work-state prompt, reciprocity detection, exemption forms), Local/Municipal Tax (home + work locality, resident vs nonresident rates)

### Problem / Rationale

Generalist tools (QB, Gusto) ask for the employee's home state and stop. They don't prompt for work-state withholding, don't know reciprocity agreements (e.g., PA↔OH), and have no awareness of local taxes. Construction workers routinely work across state lines—a framer living in PA spending three weeks on an Ohio job site is common. Admins lack tax expertise and miss obligations until a notice arrives. This epic makes the system "construction-aware" for tax.

### In Scope

- Home-state withholding certificate — Auto-determined from home address; pre-labeled form presented
- Work-state identification — Prompt: "Does this employee work in any other state?"; for each work state, present applicable withholding certificate
- Reciprocity detection — Identify active reciprocity agreements between home and work states; notify admin, explain implication (only home-state withholding), present exemption form
- Multi-state without reciprocity — Configure withholding for each work state + home state per applicable rules
- Local/municipal tax — Identify obligations from home address ZIP (e.g., Philadelphia, PA school district, Ohio RITA, Kentucky county); identify from work locations (nonresident local tax)
- Resident vs nonresident rates — Distinguish taxes owed at residence vs work locality
- Contextual prompts — When home address changes state → prompt to update withholding; when new job site in new state → prompt to add work-state withholding; when home or job site changes locality → prompt to review local withholding
- 50-state withholding form library — Current forms; update when states change (via tax provider)
- No-state-income-tax handling — For TX, FL, WA: explicit "no state withholding required" or silent skip (TBD per OQ-4)

### Out of Scope (for this epic)

- Federal W-4 form content (part of Epic 1 wizard; storage is compliance)
- Gross-to-net calculation and actual tax withholding amounts (Payroll Processing PRD)
- Tax filing and remittance (Tax Filing PRD)
- Union CBA or prevailing wage tax rules (Phase 3)

### Example "Super Stories"

- As a **PR Admin**, I want to **be prompted to identify all states where the employee will work** so that **I never miss work-state withholding when my crew crosses state lines**.
- As a **PR Admin**, I want to **see a reciprocity alert when my employee lives in PA and works in OH** so that **I know only home-state withholding is required and can complete the exemption form**.
- As a **PR Admin**, I want to **be prompted for Philadelphia wage tax when my employee's job site is in Philadelphia** so that **I don't miss local tax obligations**.
- As a **PR Admin**, I want to **be prompted to update state withholding when an employee moves to a new state** so that **I catch changes before a tax notice arrives**.
- As a **CPA**, I want to **see complete withholding records (federal, state, local) per employee** so that **I can verify correct setup for GL and tax filings**.

### Acceptance Criteria Themes

- When home state and work state have active reciprocity, system detects automatically, presents correct exemption certificate, and suppresses work-state withholding.
- When home address or active job site is in a locality with known local income tax, system surfaces setup prompt before first payroll run.
- All state withholding certificates stored as immutable compliance documents; 4-year retention per FLSA.
- Admin receives contextual prompts when address or job site changes; prompts are blocking (or strongly recommended) when employee is within 30 days of first payroll.
- Multi-state/local withholding setup errors (wrong state, missed locality): **0%** (inferred compliance metric).

### Dependencies & Risks

- **Critical:** Tax jurisdiction database vendor (Symmetry, Vertex, Avalara) — must provide state forms, reciprocity data, local tax rules. **High risk** if vendor selection delayed.
- **Integration:** Prism Job/Cost Code registry — job site address (city, state, ZIP) needed for locality-level prompts (OQ-6).
- **Risk:** Local tax jurisdiction database incomplete or stale — mitigate by licensing maintained third-party provider; do not build in-house.
- **Risk:** Reciprocity agreements change mid-year — use provider with real-time updates; surface alert to admin when known agreement changes.

### Success Metrics / KPIs

- Multi-state withholding setup errors: **0%** (compliance)
- Multi-state prompt acceptance rate vs dismissal (telemetry)
- Local tax prompt acceptance rate vs dismissal (telemetry)

### Assumptions

- Third-party tax jurisdiction database will be licensed; in-house maintenance of 50-state + 10,000+ local jurisdictions is not viable.
- Vendor provides: state withholding form library, reciprocity agreement data, local tax jurisdiction rules and rates.
- For OQ-5 (reciprocity): system may require employee to submit signed exemption form before auto-applying; behavior may vary by state pair—Legal/Tax vendor to confirm.
- For OQ-3 (local withholding): system may identify obligation and prompt admin to configure rates manually vs auto-calculate—Product/Tax vendor to confirm.

---

## Epic 3 — Construction Pay Rate Management

### Goal / Outcome

Support multiple pay rates per employee, each mapped to trade type or cost code, with effective dates. This is the construction differentiator that QB and Gusto lack—a framer earning $30/hr on residential and $45/hr on commercial work is the norm, not the exception. The system enforces at least one primary rate before payroll-ready, retains historical rates for audit, and integrates with Prism job costing for correct allocation. Supports G1 and G5.

### Primary Personas

- **PR Admin** (primary)
- **Field Supervisor** (secondary — may need to verify workers are set up)
- **External CPA / Bookkeeper** (secondary — job cost allocation)

### Business & PRD Drivers

- Goals: G1, G5
- Use Case: UC-7 (Set up multiple pay rates by trade/cost code)
- Functional Requirements: Job Role & Pay (multiple rates per employee, trade/cost code mapping, effective date, primary rate enforcement, workers' comp code)
- User Insights: "Job Costing is the Strategic Differentiator" — labor is 60% of project costs; accurate allocation is paramount

### Problem / Rationale

QB and Gusto support one pay rate per employee. Construction trades require rates by task, trade classification, and project type. Admins manually track overrides in spreadsheets. Multi-Variable Rates research establishes: **Trade** = what work was performed (drives base rate); **Pay Type** = kind of earning (Regular, OT, etc.); **Cost Code** = where cost is allocated (from Prism Accounting). This epic captures the Trade + rate mapping so payroll can look up the correct rate when time is coded.

### In Scope

- Primary pay rate — At least one required before payroll-ready
- Multiple rates per employee — "+ Add rate" for additional rates; each mapped to trade type or cost code
- Effective date — Per rate; historical rates retained and accessible
- Workers' compensation classification code — Per employee; optionally per trade if applicable (P1)
- Trade/cost code mapping — Filter cost codes from Prism Job/Cost Code registry when mapping
- Rate change workflow — New rate with effective date; previous rate retained in history
- Pay frequency — Weekly, bi-weekly, semi-monthly (from onboarding)

### Out of Scope (for this epic)

- Pay Type multipliers (OT, DT, Holiday) — Handled by Payroll Processing; this epic captures base Trade rates
- Shift differential — Tier 2+ (from Multi-Variable Rates research)
- Gross-to-net calculation — Payroll Processing PRD
- Union CBA rates, prevailing wage classifications — Phase 3
- Skills & certifications (P2) — Deferred

### Example "Super Stories"

- As a **PR Admin**, I want to **assign multiple pay rates to an employee, each mapped to a trade or cost code** so that **a framer can earn $30/hr on residential and $45/hr on commercial work**.
- As a **PR Admin**, I want to **set an effective date when I change a pay rate** so that **historical payroll uses the correct rate for each pay period**.
- As a **PR Admin**, I want to **assign a workers' comp classification code per employee** so that **my insurance and job costing are accurate**.
- As a **PR Admin**, I want to **see historical rates for an employee** so that **I can audit past pay periods and support CPA review**.
- As a **Field Supervisor**, I want to **confirm my crew members have pay rates set** so that **I know they're ready to be paid**.

### Acceptance Criteria Themes

- At least one primary pay rate required before payroll-ready status.
- Pay rate changes include effective date; system retains historical rates and uses correct rate for each pay period.
- Multiple rates display with trade/cost code mapping; "+ Add rate" allows additional rates.
- Workers' comp code captured per employee (P1: different codes per trade if applicable).
- Cost codes filtered from Prism Job/Cost Code registry when mapping rates.

### Dependencies & Risks

- **Critical:** Prism Job/Cost Code API availability — Platform team; **High** risk if delayed.
- **Integration:** Payroll Processing module consumes rate table for gross pay calculation.
- **Risk:** Cost code list may be large — ensure performant filtering and search.

### Success Metrics / KPIs

- Employee records with at least one valid rate at payroll-ready: **100%**
- Rate change audit trail coverage: **100%** of rate fields
- Job cost allocation accuracy (downstream; Payroll Processing)

### Assumptions

- Trade and Cost Code are distinct: Trade drives rate; Cost Code (from Prism Accounting) drives allocation. Both may be used in rate mapping.
- Pay Type (Regular, OT, etc.) is derived by Payroll Processing from hours worked; this epic captures base Trade rates only.
- Prism Job/Cost Code registry is the source of truth for cost codes; Employee Management does not create them.

---

## Epic 4 — Payment Method Setup & Verification

### Goal / Outcome

Enable PR Admin to configure how each employee gets paid: direct deposit (up to 2 accounts with percentage or fixed-dollar split) or printed check. Bank accounts must be verified before the first payroll run to prevent failed ACH. Supports G1.

### Primary Personas

- **PR Admin** (primary)
- **New Employee** (secondary — may self-update via Epic 5)

### Business & PRD Drivers

- Goals: G1
- Use Case: UC-8 (Configure payment method)
- Functional Requirements: Payment Method (direct deposit 1–2 accounts, split config, check alternative, bank verification)

### Problem / Rationale

Failed direct deposits cause employee frustration and admin rework. Generalist tools support direct deposit and check; construction payroll has the same needs. Verification (micro-deposit or instant) ensures accounts are valid before first payroll. Split accounts (e.g., 80% to checking, 20% to savings) are common.

### In Scope

- Direct deposit — Up to 2 bank accounts; percentage or fixed-dollar split
- Printed check — Alternative when direct deposit not used
- Bank account verification — Micro-deposit or instant verification before first payroll run
- Masked display — Routing/account numbers never shown in full; last 4 only in UI
- Encryption — AES-256 at rest and in transit for bank details

### Out of Scope (for this epic)

- Employee self-update of payment method (Epic 5)
- ACH disbursement execution (Disbursement PRD)
- Pay stub delivery (Disbursement PRD)

### Example "Super Stories"

- As a **PR Admin**, I want to **configure direct deposit for up to 2 accounts with a split** so that **my employee can send 80% to checking and 20% to savings**.
- As a **PR Admin**, I want to **verify bank accounts before the first payroll** so that **I avoid failed ACH and employee complaints**.
- As a **PR Admin**, I want to **offer printed check as an alternative** so that **employees without bank accounts can still get paid**.
- As a **PR Admin**, I want to **never see full routing or account numbers in the UI** so that **sensitive data is protected**.

### Acceptance Criteria Themes

- Direct deposit supports 1–2 accounts with percentage or fixed-dollar split.
- Bank account verification (micro-deposit or instant) required before first payroll run.
- Bank details never displayed in full; masked after entry (e.g., ****1234).
- Printed check available as alternative payment method.
- PII (bank details) encrypted AES-256 at rest and in transit.

### Dependencies & Risks

- **Integration:** Bank verification partner (Plaid, Stripe, or equivalent) — **Medium** risk; vendor selection required.
- **Risk:** Verification method (micro-deposit vs instant) — requires human review; OAuth/instant may have higher adoption.

### Success Metrics / KPIs

- Failed ACH rate attributable to invalid account: **0%** (operational)
- Bank verification completion rate before first payroll (telemetry)

### Assumptions

- Bank verification partner will be licensed (Buy, not build).
- Micro-deposit and/or instant verification supported; final method TBD per vendor.
- Employee self-update of payment method (Epic 5) reuses same verification flow.

---

## Epic 5 — Employee Self-Onboarding via Invite

### Goal / Outcome

Allow the PR Admin to send an email or SMS invite to the employee with a secure, time-limited link. The employee completes W-4, payment method, and personal details on mobile—reducing admin data entry and improving accuracy. Admin is notified when self-onboarding is complete. Supports G1; Phase 2 per delivery plan.

### Primary Personas

- **PR Admin** (primary — sends invite)
- **New Employee** (primary — completes onboarding)

### Business & PRD Drivers

- Goals: G1
- Use Case: UC-9 (Invite employee to self-complete onboarding)
- Functional Requirements: Employee Self-Onboarding (invite, self-complete W-4/payment/personal, admin notification, mobile-responsive)

### Problem / Rationale

User Insights: "Field-to-Office Disconnect" — field workers need "five times simpler" interfaces; they're "mathematicians when it comes to their paycheck" but struggle with complex forms. Allowing employees to enter their own W-4 and bank details reduces admin burden and errors (employee knows their info best). Mobile-first is critical—workers may not have desktop access.

### In Scope

- Invite delivery — Email or SMS with secure, time-limited onboarding link
- Self-onboarding flow — Confirm personal details (pre-filled by admin), complete W-4, enter bank account for direct deposit, emergency contact (optional)
- Admin notification — When employee completes steps; payroll-ready status updated
- Mobile-responsive — Works on mobile (responsive web or native app)
- Link security — Time-limited (e.g., 7 days); single-use
- Identity confirmation — Before W-4 or bank data entry (security)

### Out of Scope (for this epic)

- Admin-initiated onboarding (Epic 1)
- Full employee self-service portal (paystubs, profile edits) — Employee Hub prototype; future scope
- Benefits enrollment, PTO — Future

### Example "Super Stories"

- As a **PR Admin**, I want to **send an invite to my new employee so they can complete their own W-4 and bank details** so that **I save time and reduce data entry errors**.
- As a **New Employee**, I want to **complete my onboarding on my phone** so that **I don't have to sit at a computer after a long day in the field**.
- As a **New Employee**, I want to **see my info pre-filled by my employer** so that **I only confirm or correct, not retype everything**.
- As a **PR Admin**, I want to **be notified when my employee finishes self-onboarding** so that **I know they're payroll-ready without chasing them**.

### Acceptance Criteria Themes

- Employee can complete W-4 and direct deposit setup on mobile in under 5 minutes without admin assistance.
- Invite link expires after 7 days or first use; single-use.
- Admin notified when self-onboarding steps completed; payroll-ready status updated.
- Self-onboarding functions on mobile (responsive web or native app).
- Identity confirmation step before W-4 or bank data entry.

### Dependencies & Risks

- **Infrastructure:** Mobile self-onboarding infrastructure — **Medium**; Phase 2.
- **Risk:** Self-onboarding link security (phishing, reuse) — mitigate with time limit, single-use, identity confirmation; security review required.
- **Risk:** Low completion rate — design for "dead simple" flow per Field-to-Office insight.

### Success Metrics / KPIs

- Self-onboarding completion rate: `self_onboard_invite_sent` → `self_onboard_complete` (telemetry)
- Time to complete self-onboarding: **&lt;5 minutes** (operational)
- Invite acceptance rate (telemetry)

### Assumptions

- Phase 2 scope per delivery plan; admin-completed onboarding sufficient for MVP.
- Invite link expires 7 days or first use (inferred).
- Employee receives pre-filled data from admin's partial setup (Epic 1); employee completes remaining steps.

---

## Epic 6 — Employee Lifecycle Management & Audit Trail

### Goal / Outcome

Support ongoing employee profile maintenance with contextual compliance prompts when changes trigger tax or withholding updates. Every field-level change is logged (field, old value, new value, user, timestamp) for audit. Termination, reactivation, and pay rate changes with effective dates are supported. Supports G5.

### Primary Personas

- **PR Admin** (primary)
- **External CPA / Bookkeeper** (primary for audit trail)

### Business & PRD Drivers

- Goals: G5
- Use Cases: UC-10 (Update employee profile), UC-11 (Terminate/deactivate), UC-12 (View audit trail)
- Functional Requirements: Ongoing Employee Maintenance (field updates, contextual prompts, pay rate effective dates, termination, audit log)

### Problem / Rationale

When an employee moves, gets a raise, or starts working in a new state, there is no workflow in generalist tools to prompt the admin to update withholding. Changes are missed until a tax notice arrives. PRD: "Ongoing employee changes (rate, tax, payment method) are captured through structured, auditable workflows." User Insights: "Compliance Trap" — admins want a safety net; audit trail provides defensibility.

### In Scope

- Field-level updates — Any employee profile field editable by authorized admin
- Audit trail — All changes logged: field name, previous value, new value, changed-by user, timestamp; accessible to admin and CPA
- Contextual compliance prompts — Address change → state/local tax review; new job site state → work-state withholding; W-4 change request → re-issue W-4
- Pay rate changes — Effective date; historical rates retained
- Termination/deactivation — Termination date, reason code, final pay method designation (P1)
- Reactivation — Previously terminated employee (P2)

### Out of Scope (for this epic)

- Final pay calculation and disbursement (Payroll Processing, Disbursement PRDs)
- CPA read-only access UI (may be part of Epic 7 or separate; UC-13 is P2)
- Benefits or PTO changes — Future

### Example "Super Stories"

- As a **PR Admin**, I want to **update an employee's address and be prompted to review state withholding** so that **I don't miss tax updates when they move**.
- As a **PR Admin**, I want to **add a new job site in a new state and be prompted to add work-state withholding** so that **I catch multi-state changes proactively**.
- As a **PR Admin**, I want to **terminate an employee with a date and reason** so that **I have a clear record and can process final pay correctly**.
- As a **CPA**, I want to **view the full audit trail of employee changes** so that **I can verify compliance and support tax filings**.
- As a **PR Admin**, I want to **change a pay rate with an effective date** so that **historical payroll remains correct**.

### Acceptance Criteria Themes

- All field-level changes logged (field, old value, new value, user, timestamp); accessible to admin and CPA.
- Contextual prompts surface when address, job site, or W-4 changes trigger compliance actions.
- Pay rate changes include effective date; historical rates retained.
- Termination supports date, reason code, final pay method.
- Employee profile operations (save, update) available 99.9% uptime.

### Dependencies & Risks

- **Integration:** Epic 2 (Tax Jurisdiction) provides prompt logic for address/job site changes.
- **Risk:** Admin dismisses prompts — use blocking or strongly recommended language when near first payroll.
- **Open Question:** OQ-7 — Is final pay designation in scope for Phase 1 or Phase 2?

### Success Metrics / KPIs

- Employee profile change audit trail coverage: **100%** of fields (compliance)
- Profile maintenance change frequency (telemetry)
- Prompt acceptance rate for address/job site changes (telemetry)

### Assumptions

- Audit log is append-only; no edits or deletions.
- CPA access to audit trail is read-only; RBAC enforced.
- Reactivation (P2) allows re-adding terminated employee with new hire date.

---

## Epic 7 — Employee List, Search & Setup Visibility

### Goal / Outcome

Provide the PR Admin with a clear view of all employees, their status (Active, Inactive, Payroll Ready, Setup Incomplete), and a setup completion indicator (e.g., "5 of 7 steps complete") so they know exactly who is ready to be paid and what remains for each incomplete employee. Search and filter by status, role, and department. Supports G1 and CPA visibility (UC-13).

### Primary Personas

- **PR Admin** (primary)
- **Field Supervisor** (secondary — verify crew is set up)
- **External CPA / Bookkeeper** (secondary — read-only)

### Business & PRD Drivers

- Goals: G1
- Use Cases: UC-1, UC-13 (CPA read-only access)
- Functional Requirements: Employee List & Search (list view, status filter, setup completion indicator)

### Problem / Rationale

Admins need to quickly see who is payroll-ready vs who still needs setup. "Friday Crunch" (User Insights) — delayed field data causes stress; knowing employee status helps prioritize. Setup indicator (5 of 7 complete) tells the admin exactly which steps remain, reducing guesswork. Competitor references (Trimble, Gusto, QB) all show employee list with status; this is table stakes.

### In Scope

- Employee list view — All employees; columns for name, role, status, contact, employee ID
- Status filter — Active, Inactive, Payroll Ready, Setup Incomplete
- Setup completion indicator — Per employee: "X of 7 steps complete"; visible on list and detail views
- Step-level detail — Admin can see which specific steps remain incomplete
- Search — By name, employee ID
- Filter by role and department — Optional
- "+ Add Employee" CTA — Primary entry point to Epic 1 wizard
- CPA read-only access — View employee list and withholding records; no SSN or pay rate visibility (P2)

### Out of Scope (for this epic)

- Employee detail/edit UI (part of Epic 6; list links to detail)
- Time entry or payroll run views — Other PRDs
- Benefits or PTO display — Future

### Example "Super Stories"

- As a **PR Admin**, I want to **see a list of all employees with their payroll-ready status** so that **I know who can be paid this period**.
- As a **PR Admin**, I want to **see "5 of 7 steps complete" for an incomplete employee** so that **I know exactly which steps to finish**.
- As a **PR Admin**, I want to **filter by Setup Incomplete** so that **I can focus on employees who need attention**.
- As a **PR Admin**, I want to **search employees by name or ID** so that **I can quickly find someone in a large roster**.
- As a **Field Supervisor**, I want to **verify my crew members show as Payroll Ready** so that **I know they're set up correctly**.

### Acceptance Criteria Themes

- Employee list loads in &lt;2 seconds for up to 500 records.
- List clearly distinguishes Payroll Ready from Setup Incomplete with step-level indicator.
- Admin can filter by status (Active, Inactive, Payroll Ready, Setup Incomplete).
- Admin can see which specific steps remain for each incomplete employee.
- Search by name and employee ID functional.
- RBAC: Supervisor sees list but not pay rates; CPA read-only; no cross-employee SSN visibility.

### Dependencies & Risks

- **Upstream:** Epics 1–6 populate employee data and setup status.
- **Performance:** List must scale to 500 records; consider pagination or virtualization for larger rosters.

### Success Metrics / KPIs

- Employee list load time: **&lt;2 seconds** (performance)
- Admin can identify incomplete employees and remaining steps in &lt;30 seconds (usability)

### Assumptions

- "7 steps" aligns with Epic 1 wizard; if wizard steps change, indicator updates accordingly.
- CPA read-only (UC-13) may be Phase 2; list view supports it when implemented.
- Multi-tenant isolation: one company's employee data never accessible to another.

---

## Traceability Table

| Requirement ID / Use Case | Short Description | Epic(s) |
|---------------------------|-------------------|---------|
| UC-1 | Add new W-2 employee (full onboarding) | E1, E7 |
| UC-2 | Add 1099 subcontractor record | E1 |
| UC-3 | Launch worker classification guardrail wizard | E1 |
| UC-4 | Configure multi-state withholding | E2 |
| UC-5 | Apply state reciprocity agreement | E2 |
| UC-6 | Configure local/municipal tax withholding | E2 |
| UC-7 | Set up multiple pay rates by trade/cost code | E3 |
| UC-8 | Configure payment method (direct deposit, check) | E4 |
| UC-9 | Invite employee to self-complete onboarding | E5 |
| UC-10 | Update employee profile | E6 |
| UC-11 | Terminate/deactivate employee | E6 |
| UC-12 | View full employee audit trail | E6 |
| UC-13 | CPA read-only access | E7 |
| G1 | Payroll-ready in &lt;10 min | E1, E3, E4, E5, E7 |
| G2 | Zero withholding errors | E2 |
| G3 | Eliminate misclassification risk | E1 |
| G4 | Multi-state/local support without admin expertise | E2 |
| G5 | Structured change workflows | E3, E6 |
| FR Classification | W-2/1099 choice, IRS wizard, auditable record | E1 |
| FR Basic Profile | Name, DOB, contact, address, home-state trigger | E1 |
| FR Job Role & Pay | Job title, role, hire date, pay freq, multi-rate, WC code | E1, E3 |
| FR Federal W-4 | Guided W-4, storage, payroll-ready block | E1 |
| FR State Tax | 50-state forms, work-state prompt, reciprocity | E2 |
| FR Local Tax | Home + work locality, resident/nonresident | E2 |
| FR Payment Method | Direct deposit, split, check, verification | E4 |
| FR Self-Onboarding | Invite, self-complete, mobile, admin notification | E5 |
| FR Maintenance | Field updates, audit trail, contextual prompts | E6 |
| FR Employee List | List view, status filter, setup indicator | E7 |
| NFR Security | PII encryption, SSN masking | E1, E4 |
| NFR RBAC | Admin, Supervisor, Employee, CPA roles | E6, E7 |
| NFR Performance | List &lt;2s, wizard step &lt;1s | E1, E7 |

---

## Phase Alignment (from PRD Delivery Plan)

| Phase | Epics | Notes |
|-------|-------|-------|
| **Phase 1 — MVP** | E1, E2, E3, E4, E7 | Full onboarding, tax intelligence, multi-rate, payment, list. Texas-first GA. |
| **Phase 2 — Completion** | E5, E6 (full) | Self-onboarding, full lifecycle (termination, reactivation, CPA audit UI). |
| **Phase 3 — Future** | — | Union CBA, prevailing wage, benefits, HRIS integration. |
