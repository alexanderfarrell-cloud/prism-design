# Prism Construction Payroll — Milestone Statements of Scope

> *Trimble Financials | Prism Payroll | U.S. SMB Construction Contractors*
> *Last Updated: Feb 26, 2026*
> *These statements serve as the foundational anchor for backlog categorization and milestone planning on the path to GA.*

---

## Context & Framing

**Product:** Prism Construction Payroll — a payroll solution built natively within Trimble Financials (Prism), purpose-built for U.S.-based SMB construction contractors across all 50 states.

**Target customer at GA:** Small-to-medium construction contractors (5–100 employees) running payroll in the U.S., including companies operating across multiple states and jurisdictions. Primary persona is the owner or office manager ("PR Admin") who handles payroll without a dedicated HR function.

**Integration partners in scope:**
- **Traqspera** — Time collection; source of field time data flowing into payroll
- **Prism Accounting** — Core financials; source of jobs, cost codes, chart of accounts, GL; destination for labor costs and job costing
- **Tax jurisdiction provider** (e.g., Symmetry / Vertex / Avalara) — 50-state withholding forms, local tax data, reciprocity agreements
- **Bank / ACH partner** (e.g., Plaid / Stripe) — Bank verification and disbursement

**Three milestones on the path to GA:**
| Milestone | Timing | Audience | Purpose |
|-----------|--------|----------|---------|
| **Alpha** | June 2026 | Internal (Trimble) | Demonstrable thin slice; validate direction |
| **Beta** | Trimble Dimensions conference | Customers / Prospects | Expanded working solution; drive engagement and feedback |
| **GA** | Generally Available release | All customers | Production-ready payroll for U.S. contractors |

---

## Milestone 1 — Alpha

### Statement of Scope

Alpha is an **internal demonstration milestone** delivered in June 2026. The objective is not a complete payroll processing system — it is a **demonstrable thin slice through the end-to-end payroll workflow** that proves architectural direction, shows working software, and builds internal confidence ahead of customer-facing Beta.

Alpha establishes the foundational functional skeleton: a company can be configured for payroll, employees can be added and managed, time data can flow in from Traqspera, that time can be reviewed, and a mock payroll run can be executed to show that payroll calculations produce expected outputs — even in simplified form.

### What Alpha Delivers

#### Company Setup for Payroll
- Company profile configured for payroll: EIN, legal entity, pay schedules, primary work state
- Single company, single state (no multi-state complexity at Alpha)
- Basic payroll settings: pay frequency, pay period configuration

#### Employee Setup — Core
- Add new W-2 employees with basic profile: name, contact, home address, hire date
- Primary pay rate assignment (single rate per employee)
- Federal tax withholding (W-4) captured
- Home-state withholding captured (single state)
- Payment method configured (direct deposit or check)
- Employee list with basic payroll-ready status indicator

#### Time Collection Integration — Thin Slice
- Accept a time export from Traqspera (file-based import / basic integration stub)
- Map imported time entries to employees in the system
- Display imported time for review prior to payroll

#### Time Entry Review
- View time entries for the pay period by employee
- Ability to flag or adjust time entries before a payroll run
- Summary of hours by employee (regular hours)

#### Mock Payroll Run
- Initiate a payroll run for the pay period
- Calculate gross pay using regular (straight-time) wages only
- Apply federal income tax withholding (simplified; no state income tax, single state, no local)
- No actual disbursement — mock / simulated run that produces outputs
- Display payroll run summary: employee-level gross pay, estimated deductions, estimated net pay
- Sufficient fidelity to demonstrate the payroll calculation flow end to end

### What Alpha Does NOT Include
- Multi-state employees or state income tax withholding calculations
- Overtime, double-time, or complex pay type calculations
- Multiple pay rates per employee (trade/cost code mapping)
- 1099 subcontractor support
- Actual check/ACH disbursement
- Pay stubs or employee-facing views
- Integration with Prism Accounting / job costing
- Tax filing or remittance (941, W-2, etc.)
- AI-assisted features
- Self-service employee onboarding
- Mobile experience

### Alpha Success Criteria
- A live internal demo can walk through: company setup → add employee → import Traqspera time → review time → run mock payroll → view payroll summary
- Payroll calculation outputs are correct for regular wage, single federal withholding scenario
- The demo reveals no architectural blockers to building Beta and GA on this foundation

---

## Milestone 2 — Beta

### Statement of Scope

Beta is a **customer-facing milestone** delivered at the Trimble Dimensions user conference. This milestone transitions from internal demonstration to **active customer and prospect engagement** — showing enough of the real payroll process that customers can understand and react to the solution. Beta meaningfully expands on Alpha across all dimensions: broader calculation support, real integration with Traqspera, multi-state capability, employer cost visibility, connection to Prism Accounting, and the introduction of AI-powered assistance.

Beta is not required to handle every edge case or jurisdiction nuance — that depth is reserved for GA — but it must be **credible, functional, and demonstrably superior** to generic tools like QuickBooks Payroll or Gusto for construction contractors.

### What Beta Delivers

#### Company Setup — Expanded
- Multi-state company configuration: register for payroll in multiple states
- State tax account IDs and agency registration details per state
- Pay schedule management (multiple schedules if needed)
- Workers' compensation policy configuration at company level

#### Employee Management — Full Onboarding
- Guided onboarding wizard (7-step) for W-2 employees and 1099 subcontractors
- Worker classification guardrail wizard (IRS factor-based) to prevent misclassification
- Multiple pay rates per employee mapped to trade type / cost code (construction differentiator)
  - *e.g., Framer: $30/hr residential, $45/hr commercial*
- Workers' compensation classification code per employee
- Effective-dated pay rate changes with historical rate retention
- Multi-state tax withholding configuration:
  - Home-state withholding
  - Work-state withholding (proactively prompted)
  - Reciprocity agreement detection (e.g., PA ↔ OH)
  - Common local/municipal tax identification (Philadelphia, Ohio RITA, Kentucky county taxes, PA school district)
- Federal W-4 capture (digital, guided)
- Payment method: direct deposit (up to 2 accounts with split) and printed check
- Bank account verification (micro-deposit or instant) before first payroll
- Employee lifecycle: profile updates with compliance prompts, termination workflow, audit trail
- Employee list with setup completion indicator ("X of 7 steps complete")

#### Time Collection — Live Traqspera Integration
- Live or near-live connection from Traqspera to Prism Payroll (no manual file import)
- Time entries arrive coded with job, cost code / phase, and trade type
- Supervisor approval state honored: only approved time flows to payroll
- Time review dashboard: review hours by employee, trade, and job before payroll is run
- Exception handling: flag missing entries, unapproved time, or unmatched employees

#### Payroll Calculation — Broader Coverage
- Regular and overtime pay calculation (federal FLSA, state-specific OT rules for covered states)
- Trade-based rate lookup: system selects correct rate for each time entry based on trade
- Multi-state withholding calculations (home state + work states, with reciprocity)
- Federal income tax withholding (W-4-driven)
- FICA: Social Security and Medicare (employee + employer portions)
- FUTA / SUTA employer contributions
- Pre-tax deductions (basic: health, dental, vision if applicable)
- *Note: Not required to handle all jurisdiction nuance at Beta — "broad support" with known limitations*

#### Total Cost of Labor / Employer-Side Costs
- Employer portion of FICA displayed alongside employee costs
- FUTA / SUTA employer contributions included in payroll run summary
- Workers' compensation cost estimate (rate × gross wages)
- Total labor burden per employee: gross pay + employer taxes + workers' comp
- Job cost output includes full labor burden (not just gross wage)

#### Prism Accounting Integration — Stub / Initial Connection
- Payroll module connected to Prism Accounting for company and job/cost code data (bi-directional reference)
- Post-payroll journal entry or labor burden allocation stub: prove the data model can send full labor burden to Prism job costing
- *Not required to be fully operationalized — demonstrating the connection and data flow is sufficient at Beta*
- GL account mapping for payroll expense categories

#### Tax Filing — Planning & Stub
- Tax filing obligation identification: which filings are required for active states
- Filing calendar visibility: admin can see upcoming filing deadlines
- *Actual filing submission not required at Beta — framework and awareness established*
- Federal 941 outline / deposit schedule awareness

#### AI-Powered Assistance (1–2 Features)
Introduce AI to the payroll workflow at Beta. Recommended initial features:

1. **Payroll Anomaly Detection** — AI reviews the in-progress payroll run and flags statistical anomalies before the run is finalized: hours significantly above or below an employee's norm, employees with zero hours, pay amounts that deviate materially from prior periods. Surfaces as a pre-submit checklist of "things to review." Reduces the "Friday Crunch" errors that cost SMB owners money.

2. **Tax Setup Advisor** — When an employee is added or a job site is entered in a new state or locality, AI assists the admin by explaining the withholding obligations in plain language, summarizing reciprocity rules, and recommending the correct forms to complete. Replaces the need for the admin to research this independently ("I don't know what Ohio withholding ID I need").

*Optional / stretch:* AI-assisted worker classification confidence scoring — when the admin indicates uncertainty on W-2 vs 1099, AI analyzes the IRS control factors and provides a confidence-weighted recommendation.

#### Employee Self-Service — Initial
- Employee self-onboarding via invite link (email or SMS): employee completes W-4 and payment method on mobile
- Secure, time-limited invite link; admin notified on completion
- Mobile-responsive self-onboarding flow

### What Beta Does NOT Include
- All 50-state jurisdiction nuance and edge cases (GA finalizes this)
- Full automated tax remittance / payment to agencies
- Actual paycheck disbursement (ACH / check printing — stubbed or manual at Beta)
- Certified payroll / prevailing wage (future)
- Union CBA rates (future)
- Benefits administration (future)
- Full employee self-service portal (pay stubs, profile edits post-onboarding)

### Beta Success Criteria
- Live demo at Trimble Dimensions walks through: company setup → add multi-state employee → Traqspera time flows in → review time → run payroll with trade rates and multi-state withholding → see total labor burden → post to Prism job costing (stub)
- Customer / prospect reaction validates that the solution is meaningfully better than QuickBooks Payroll or Gusto for their construction context
- AI features generate positive qualitative response from customers; at least one feature demonstrably saves time or catches an error in the demo
- Prism Accounting integration stub proves data model compatibility; no architectural blockers to full GA integration

---

## Milestone 3 — GA (Generally Available)

### Statement of Scope

GA is the **production-ready release of Prism Construction Payroll**, available to all customers. Building on everything delivered in Alpha and Beta, this milestone closes out the remaining calculation complexity, operationalizes all integrations, delivers real money movement (paychecks to employees), ensures employees have visibility to their own pay information, and meets all regulatory requirements for taxes and compliance.

GA is the milestone at which Prism Construction Payroll becomes a **complete, commercially viable payroll solution** for U.S. construction contractors across all 50 states.

### What GA Delivers

#### Payroll Calculations — Full Coverage
- **All 50 states** supported for income tax withholding
- Multi-state and jurisdictional complexity fully handled:
  - Work-state vs residence-state withholding with all active reciprocity agreements
  - Local / municipal income tax: Philadelphia, Ohio RITA/RITA municipalities, Kentucky county taxes, PA school district, Indiana county taxes, and all other applicable localities
  - Supplemental wage withholding rates (bonuses, commissions, retroactive pay)
- Federal FLSA overtime rules fully implemented; state-specific OT rules for all relevant states (CA daily OT, AK, NV, CO, etc.)
- Double-time support where required by state law
- Holiday and PTO pay types
- Final pay rules by state (immediate payment requirements upon termination: CA, CO, MT, etc.)
- Gross-to-net calculation accuracy: all deductions, garnishments, tax withholding in correct sequence
- Pre- and post-tax deduction management (health, dental, vision, 401k, HSA, FSA, garnishments, child support orders)
- Multiple pay schedules supported simultaneously (e.g., office staff bi-weekly, field workers weekly)
- Retroactive pay adjustments

#### Disbursement — Real Money Movement
- **ACH direct deposit**: funds delivered to employee bank accounts on scheduled pay date
- **Printed check** support: check generation and delivery workflow
- Disbursement confirmation: transaction status visible to admin; failed ACH handling and retry
- Off-cycle payroll runs: manual, termination, bonus, or correction runs
- Pay period finalization: irreversible close of payroll period with audit record

#### Pay Stubs — Employee Delivery
- Digital pay stubs generated for every payroll run per employee
- Pay stub content: gross pay, all deductions, tax withholding (federal, state, local), net pay, YTD totals
- Pay stub delivery: email notification with secure link; accessible through employee portal
- Pay stub retention: admin and employee access to historical pay stubs (minimum 4 years)

#### Employee Self-Service Portal
- Employee login: secure access to personal payroll information
- View and download pay stubs (current and historical)
- Update personal details: address, emergency contact, personal information
- Update payment method (bank account) with verification
- W-4 update: re-complete withholding certificate; prompts admin to acknowledge
- State withholding certificate update (where applicable)
- Mobile-first: full portal functionality on mobile browser or native app

#### Tax Filing & Compliance — Full Implementation
- **Federal filings**: Form 941 (quarterly), Form 940 (annual FUTA), W-2 (annual, per employee), 1099-NEC (annual, per 1099 subcontractor)
- **State income tax filings**: all 50 states, per state schedule (monthly, quarterly, annual)
- **State unemployment (SUTA) filings**: all 50 states, per state schedule
- **Local tax filings**: all applicable localities where Prism calculates and withholds local tax
- **Tax payment / remittance**: automated deposit to federal and state agencies on schedule (EFTPS for federal; state e-payment portals or ACH where applicable)
- New hire reporting: automated submission to state new hire registries (federally mandated; per-state portal)
- W-2 / 1099 distribution: deliver to employees and subcontractors by January 31
- E-file W-2s to SSA (EFW2 format) and 1099-NECs to IRS (FIRE system)
- Penalty & interest awareness: system alerts admin to upcoming deadlines and missed deposits

#### Prism Accounting Integration — Full
- Full bi-directional data flow between Prism Payroll and Prism Accounting:
  - Jobs and cost codes from Prism Accounting → Prism Payroll (for time coding and rate mapping)
  - Post-payroll: full labor burden allocation → Prism Accounting job costing and GL
- Labor burden includes: gross wages + employer FICA + FUTA/SUTA + workers' comp + benefits (where applicable)
- GL journal entries auto-generated on payroll approval: payroll expense, tax liability, net pay liability accounts
- Multi-entity support (if applicable within Prism Accounting company structure)
- Reconciliation support: payroll register matches GL entries

#### Traqspera Integration — Full
- Fully operational, real-time connection: approved time in Traqspera automatically available for payroll run
- Time coding integrity: job, cost code, trade type all flow through correctly to payroll calculation and job cost allocation
- Historical time data accessible for prior-period adjustments
- Error handling: mismatched employees, missing cost codes, unresolved time entries surface as actionable exceptions

#### Reporting & Audit
- Payroll register: full detail per run (employee, earnings, deductions, taxes, net pay)
- Labor cost report by job / cost code / trade
- Tax liability summary by jurisdiction
- Workers' comp audit report (by employee, by classification code, by period)
- YTD summary report per employee
- Admin-accessible audit trail: all payroll run history, changes, approvals, and disbursements
- Export to Excel / CSV for all reports

#### AI Capabilities — Mature
- All Beta AI features refined and production-quality (anomaly detection, tax setup advisor)
- Expanded: AI-generated payroll run summary ("This payroll is $X larger than last period; 2 new employees and 4 OT events drive the difference")
- AI-assisted compliance alerts: proactive notifications when state law changes affect withholding calculations or filing schedules
- *Additional AI features informed by Beta customer feedback*

#### Security, Compliance & NFRs
- SOC 2 Type II alignment (or in-progress audit)
- PII encryption: AES-256 at rest, TLS 1.2+ in transit; SSN never exposed in UI
- RBAC: Admin, Supervisor, Employee, CPA/Bookkeeper roles fully implemented
- Multi-tenant isolation: one company's data never accessible to another
- Data retention: payroll records 4+ years per FLSA; tax records 7 years per IRS
- 99.9% uptime SLA for payroll run submission and employee portal access
- WCAG 2.1 AA accessibility compliance

#### 1099 Subcontractor — Full Support
- 1099 subcontractor profile: no withholding; separate from W-2 workflow
- Payments tracked within the system for annual 1099-NEC filing
- 1099-NEC generated and distributed by January 31
- E-file to IRS FIRE system

### What GA Does NOT Include
*(Deferred to future releases)*
- Union CBA / Davis-Bacon prevailing wage (Tier 2)
- Certified payroll reporting (Tier 2)
- Benefits administration / COBRA / ACA reporting (future)
- PTO / leave management (future)
- HRIS features: performance, recruiting, org chart (future)
- International payroll (future)

### GA Success Criteria
- A paying customer can run an end-to-end payroll: set up company → add employees → review Traqspera time → run payroll → disburse to employee bank accounts → view pay stub → file and remit taxes — without manual workarounds
- All 50 states supported for income tax withholding with zero known calculation errors for covered scenarios
- Tax filings submitted on schedule with no missed federal deposit penalties attributable to the system
- Employee self-service portal live; employees can view pay stubs and update personal info without admin involvement
- Prism Accounting integration fully operational: every payroll run produces a reconcilable GL entry and job cost allocation

---

## Scope Summary — Milestone Map

| Capability Area | Alpha | Beta | GA |
|---|---|---|---|
| Company setup (single state) | ✓ | ✓ | ✓ |
| Company setup (multi-state) | — | ✓ | ✓ |
| Employee onboarding (core W-2) | ✓ | ✓ | ✓ |
| Employee onboarding wizard (full 7-step) | — | ✓ | ✓ |
| 1099 subcontractor support | — | Partial | ✓ |
| Classification guardrail wizard | — | ✓ | ✓ |
| Multiple pay rates / trade mapping | — | ✓ | ✓ |
| Single-state withholding | ✓ | ✓ | ✓ |
| Multi-state withholding | — | ✓ | ✓ |
| Local/municipal tax | — | Key localities | All localities |
| Reciprocity agreements | — | ✓ | ✓ |
| All 50 states (full coverage) | — | — | ✓ |
| Federal FICA / FUTA | — | ✓ | ✓ |
| OT / DT / Holiday pay types | — | OT (broad) | ✓ All |
| Final pay by state | — | — | ✓ |
| Supplemental wage / retroactive pay | — | — | ✓ |
| Traqspera integration (import/stub) | Stub | Live | ✓ Full |
| Time review dashboard | ✓ | ✓ | ✓ |
| Total cost of labor / employer costs | — | ✓ | ✓ |
| Mock/simulated payroll run | ✓ | — | — |
| Real payroll run (no disbursement) | — | ✓ | ✓ |
| ACH direct deposit disbursement | — | — | ✓ |
| Printed check | — | — | ✓ |
| Pay stubs (digital) | — | — | ✓ |
| Employee self-service portal | — | Invite/onboard | ✓ Full |
| Prism Accounting integration | — | Stub | ✓ Full |
| Job cost / labor burden allocation | — | Stub | ✓ Full |
| GL journal entries | — | — | ✓ |
| Tax filing (federal 941, W-2, 940) | — | Planning | ✓ |
| Tax filing (state / local) | — | Planning | ✓ |
| Tax remittance (automated) | — | — | ✓ |
| New hire reporting | — | — | ✓ |
| AI: Payroll anomaly detection | — | ✓ | ✓ Enhanced |
| AI: Tax setup advisor | — | ✓ | ✓ Enhanced |
| AI: Payroll run summary / alerts | — | — | ✓ |
| Payroll register & reports | — | Basic | ✓ Full |
| Workers' comp tracking | — | ✓ | ✓ |
| Pre/post-tax deductions | — | Basic | ✓ Full |
| Garnishments | — | — | ✓ |
| Audit trail (full) | — | ✓ | ✓ |
| RBAC (full roles) | — | Partial | ✓ |
| SOC 2 / security compliance | — | In progress | ✓ |

---

*These statements of scope are living documents. As backlog refinement proceeds, specific features will be assigned to milestones and linked back to this map. Scope decisions not addressed here (edge cases, open questions, phasing of specific jurisdictions) should be resolved through backlog grooming with this document as the anchor.*
