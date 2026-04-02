# PRD: Setting Up Companies for Payroll

**Initiative:** Setting Up Companies for Payroll
**Epic:** 668778
**Product:** Prism Construction Payroll (Trimble Financials)
**Target Market:** U.S. SMB construction contractors, 5–100 employees, all 50 states
**Author:** Aaron Jost
**Last Updated:** February 2026
**Status:** Active — groomed to Alpha/Beta/GA milestone targets

---

## 1. Initiative Definition

### 1a. Overview

Prism Construction Payroll must be configured before a single paycheck can run. This initiative delivers the guided, dependency-aware setup wizard that takes a construction owner-operator from "zero payroll configuration" to "authorized, compliant, and ready to run their first payroll" — without requiring payroll expertise. The wizard covers company identity confirmation, federal and state tax registration, banking verification, digital tax authorization, pay schedule configuration, and construction-specific settings (trade library, GL mapping, workers' comp). The result is a guardrailed onboarding experience that prevents the most common first-run failures — invalid EINs, incorrect SUI rates, unverified bank accounts, and missing tax authorization.

### 1b. Problem Statement

**User problem:** Owner-operators of small construction firms are experts at building, not payroll administration. When confronted with a blank payroll setup form requiring EINs, SUI rates, state tax account IDs, and bank routing numbers, they enter incorrect data, make incorrect selections, or abandon setup entirely ("Regulatory Paralysis"). There is no second chance — errors in foundational payroll configuration cascade through every calculation, every deposit, and every tax filing downstream.

**Business problem:** Without a complete, validated setup, the platform cannot legally file taxes or move money. An incomplete setup produces failed ACH transactions, IRS rejection notices, and state penalties — all of which immediately destroy customer trust and generate disproportionate support cost. The setup completion rate is the leading indicator of whether this product can scale.

**Why existing tools fail:** Generic payroll tools assume users have payroll knowledge. They present blank fields without context, make no accommodation for construction-specific requirements (trade classifications, workers' comp codes, multi-state job site nexus), and offer no guardrails — allowing invalid configurations to reach payroll processing.

### 1c. Goals

| # | Goal |
|---|---|
| G1 | Enable a construction owner-operator to configure a company for payroll with no prior payroll experience |
| G2 | Prevent first-run payroll failures caused by invalid or missing setup data |
| G3 | Establish the legal authorization required for autonomous tax filing and remittance |
| G4 | Capture construction-specific configuration (trade library, WC codes, GL mapping) that generic payroll tools ignore |
| G5 | Scale to all 50 U.S. states without requiring state-specific knowledge from the admin |

### 1d. Success Metrics

| Metric | Target | Type |
|---|---|---|
| Setup completion rate (wizard started → first payroll run authorized) | ≥ 70% at Beta | Business |
| Time to complete setup (wizard start to "Ready to Run") | < 45 minutes median | User |
| First-run payroll error rate (failures attributable to setup misconfiguration) | < 5% of first runs | Quality |
| Tax authorization completion rate (Form 8655 signed) | ≥ 95% of companies that start | Compliance |
| Setup abandonment at banking step (historically highest drop-off) | < 20% with IAV | User |

### 1e. Out of Scope

- Employee-level setup (W-4, direct deposit, pay rates) — Employee Management initiative
- Union/certified payroll, prevailing wage, Davis-Bacon — Tier 2+
- Payroll processing and pay run execution — Payroll Processing initiative
- Benefits and deductions plan configuration — Future HR initiative
- Multi-entity / multi-company configurations
- International payroll
- Accountant / CPA third-party access authorization — Role Management initiative

---

## 2. Users & Usage Context

### 2a. Personas

| Persona | Description | Primary Goal | Key Pain Point |
|---|---|---|---|
| **PR Admin (Owner-Operator)** | Small construction company owner or office manager; handles payroll without a dedicated HR function; primary user of the wizard | Get through setup quickly and correctly so employees get paid | Does not know payroll terminology; afraid of making a compliance mistake |
| **Tax Authorization Signatory** | Company officer (owner, president, or member) designated to legally sign Form 8655 and state authorization forms; may or may not be the same as the PR Admin | Sign authorization forms without confusion about what is being authorized | Does not understand what "Reporting Agent Authorization" means; concerned about legal exposure |
| **Prism Implementation Specialist** *(Inferred)* | Trimble customer success or implementation team member who may guide a company through setup for the first time | Ensure the company completes setup correctly and efficiently | Needs to identify where customers get stuck and intervene before abandonment |

### 2b. User Journeys / Workflows

**Primary Setup Journey (single-state, new-year activation — Alpha path):**

```
Welcome & Prep Checklist
   → Confirm Company Profile (read-only from Prism)
   → Designate Primary Payroll Contact
   → Federal Tax Configuration (EIN, Entity Type, Filing Frequency)
   → Banking Connectivity & Verification (IAV or micro-deposit)
   → State Tax Jurisdiction Setup (primary state: SUI rate, withholding ID)
   → Workers' Comp Policy Capture
   → Pay Schedule Configuration (frequency, work week start, first pay date)
   → Designate Tax Authorization Signatory
   → Generate & Sign IRS Form 8655
   → Authorization Status Confirmed → "Ready to Run First Payroll"
```

**Extended Journey (mid-year activation, multi-state — Beta/GA path):**

Adds after primary state setup:
- Multi-State Nexus Configuration (additional states)
- Local Tax Jurisdiction Detection (auto-check)
- YTD Historical Data Import (mid-year activation only)
- Trade Library & Compensation Rules Configuration
- Payroll GL Chart of Accounts Mapping
- 1099 / Subcontractor Configuration
- Prism Accounting Integration Verification
- State Authorization Form Signing (per nexus state requiring separate form)

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|---|---|---|
| UC-1: Wizard navigation | Admin progresses through sequential steps; can save/exit and resume | P0 |
| UC-2: Company identity confirmation | Admin confirms legal entity from Prism; designates payroll contact | P0 |
| UC-3: Federal tax setup | Admin confirms EIN, entity type, and filing frequency | P0 |
| UC-4: Banking verification | Admin links bank via IAV or micro-deposit fallback | P0 |
| UC-5: State tax setup | Admin enters SUI rate and withholding account ID for primary state | P0 |
| UC-6: Digital tax authorization | Admin (or designated signatory) signs Form 8655; states requiring own forms sign those | P0 |
| UC-7: Pay schedule setup | Admin configures frequency, work week, and first pay date with compliance validation | P0 |
| UC-8: Workers' comp capture | Admin enters WC policy details and classification codes | P1 |
| UC-9: Multi-state nexus | Admin adds additional nexus states; system guides state-specific setup | P1 |
| UC-10: YTD import | Mid-year activation admin imports prior YTD balances per employee | P1 |
| UC-11: Trade library setup | Admin defines trade classifications, WC code mappings, OT rules | P1 |
| UC-12: GL mapping | Admin maps payroll categories to Prism Accounting chart of accounts | P1 |
| UC-13: 1099 configuration | Admin toggles subcontractor tracking; sets filing preferences | P2 |
| UC-14: Local tax detection | System auto-checks for local tax obligations; prompts if registration needed | P2 |
| UC-15: Prism integration verification | Admin confirms Prism Accounting jobs/phase sync; resolves rate mapping path | P2 |

---

## 3. Requirements with Supporting Material

### 3a. Functional Requirements

**Wizard Framework (UC-1)**
- The system shall enforce linear, dependency-locked step progression; later steps are inaccessible until prerequisites are valid (P0)
- The system shall persist all validated data on save/exit; the wizard shall resume at the exact step where the admin left off (P0)
- The system shall display a welcome screen listing required documents before the first step (P0)
- The system shall display a completion summary confirming all steps are done and the company is payroll-ready (P0)

**Company Identity (UC-2)**
- The system shall display company profile fields (Legal Name, DBA, Address, Entity Type) in read-only mode, sourced from Prism core (P0)
- The system shall require designation of a Primary Payroll Contact (name, title, phone, email) before this step can be marked complete (P0)

**Federal Tax Configuration (UC-3)**
- The system shall validate EIN format (XX-XXXXXXX, check-digit logic, invalid prefix detection) (P0)
- The system shall require selection of Form 941 vs. Form 944 filing frequency with plain-language guidance (P0)
- The system shall block unsupported entity types (Government, Non-Profit) with clear messaging and resolution instructions (P0)

**Banking Connectivity (UC-4)**
- The system shall offer Instant Account Verification (IAV) via banking API integration (P0)
- The system shall provide a micro-deposit manual fallback when IAV is unavailable or fails (P0)
- The system shall mask account details after verification and require re-verification for account changes (P0)
- The "Run Payroll" capability shall remain locked until banking is verified (P0)

**State Tax Setup (UC-5)**
- The system shall auto-detect the primary state from the confirmed company address (P0)
- The system shall display state-specific tax ID field labels using official state agency terminology (P0)
- The system shall accept SUI rates to 4 decimal places with a reasonableness range warning (not a hard block) (P0)
- The system shall surface additional mandatory employer contributions (CA SDI, NY DBL, NJ FLI, WA PFML, HI TDI) for applicable states only (P0)

**Digital Tax Authorization (UC-6)**
- The system shall generate IRS Form 8655 pre-populated from previously entered company and signatory data (P0)
- The system shall capture a digital e-signature (typed name + timestamp + IP) with full legal consent text displayed (P0)
- The system shall produce an executed PDF per signed form and store it securely (P0)
- The system shall enforce an authorization status gate; payroll filing/remittance is blocked until all required forms are signed (P0)
- *Beta:* The system shall generate state-level authorization forms for nexus states that require them, based on a configuration-managed state requirements matrix (P1)

**Pay Schedule (UC-7)**
- The system shall validate pay frequency against state law for the company's registered states with a plain-language compliance warning (P0)
- The system shall derive and preview the first three upcoming pay periods and check dates from configured inputs (P0)
- The system shall store work week start day and apply it to all FLSA overtime calculations (P0)
- *Beta:* The system shall support multiple named pay schedules per company (e.g., Field vs. Office) (P1)

**Workers' Comp (UC-8)**
- The system shall capture WC carrier name, policy number, effective/expiration dates, classification codes, and EMR (P1)
- The system shall warn (not hard-block) if WC data is missing, to accommodate edge-case exemptions (P1)

**Multi-State Nexus (UC-9)**
- The system shall allow admin to add additional nexus states and trigger guided SUI/withholding setup per state (P1)
- The system shall surface reciprocity agreement information when two registered states have an applicable agreement (P1)

**YTD Import (UC-10)**
- The system shall detect mid-year activation and present a YTD import step; new-year activations shall skip it (P1)
- The system shall accept per-employee YTD earnings, withholding amounts, and tax deposit credits with reconciliation validation (P1)
- The system shall lock YTD data after the first submitted payroll run; corrections shall require an auditable amendment workflow (P1)

**Trade Library & Comp Rules (UC-11)**
- The system shall provide a company-managed trade library with WC code (NCCI) mapping per trade (P1)
- The system shall configure federal FLSA and applicable state overtime rules with effective dating (P1)
- The system shall support optional shift differential rules (night, weekend, holiday) with per-trade override capability (P2)

**GL Mapping (UC-12)**
- The system shall allow mapping of payroll expense and liability categories to Prism Accounting chart of accounts (P1)
- The system shall validate all required categories have a mapping before journal entries can post (P1)
- The system shall route labor costs to Prism Accounting by Job + Phase Code from Traqspera time entries (P1)

**1099 Configuration (UC-13)**
- The system shall provide a company-level toggle to enable/disable 1099 subcontractor tracking (P2)
- The system shall track cumulative payments per payee against the $600 IRS threshold (P2)

**Local Tax Detection (UC-14)**
- The system shall automatically query the local tax jurisdiction database using the company's Zip+4 address (P2)
- The system shall auto-complete the step with an audit log when no local tax applies (P2)

**Prism Integration Verification (UC-15)**
- The system shall display the live job and phase code sync status from Prism Accounting and surface any missing data (P2)
- The system shall guide the admin through Phase Code → Trade mapping if Traqspera does not pass a direct trade field (P2)

### 3b. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | All signed authorization documents stored in tamper-evident, encrypted storage with cryptographic hash verification; EIN and bank account data encrypted at rest and in transit |
| **Compliance** | Form 8655 must reflect the currently active IRS revision; state authorization forms version-controlled in configuration; signed documents retained 7 years per IRS requirement |
| **Availability** | Wizard must be available during business hours; partial save must not be lost on session timeout |
| **Usability** | Every step must surface plain-language explanations; no regulatory terminology without a plain-language tooltip or sidebar |
| **Performance** | Banking IAV flow completes in < 5 minutes; wizard step transitions < 2 seconds |
| **Accessibility** | WCAG 2.1 AA compliance on all wizard screens |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Fields | Notes |
|---|---|---|
| Company | EIN, Legal Name, Entity Type, Address, Primary State | Read from Prism core; not editable in payroll setup |
| Tax Authorization Signatory | Full Name, Title, Phone, Email | Written by payroll setup; feeds Form 8655 generation |
| Bank Account | Routing, Account Number, Verification Status, Last 4 | Masked post-verification |
| Pay Schedule | Frequency, Work Week Start, First Pay Date, Schedule Name | Supports multiple schedules per company at Beta |
| State Tax Registration | State, Tax Account ID, SUI Rate, Additional Contributions | One record per nexus state |
| Authorization Document | Form Type, Jurisdiction, Signed PDF, Timestamp, Signatory, Version, Hash | Retained 7 years; tamper-evident |
| Trade | Trade Name, WC Class Code, Active Flag | Company-managed library |
| GL Mapping | Payroll Category, GL Account ID, Source (Prism COA) | Set before first journal entry posts |
| YTD Balance | Employee, Period, Gross Wages, Tax Types, Deposit Credits | Mid-year activations only; locked post-first-run |

#### Integration Requirements

| System | Purpose | Key Trigger | Notes |
|---|---|---|---|
| **Prism Core** | Company identity data (read-only source of truth) | Wizard start | EIN, Legal Name, Entity Type, Address |
| **Prism Accounting** | Chart of accounts for GL mapping; Job/Phase Code sync | GL mapping step; integration verification step | Read-only sync into payroll; not editable in wizard |
| **Traqspera** | Time entry source for payroll; Phase Code → Trade mapping | Integration verification step | Key unresolved: does Traqspera pass a trade field? ⚠️ Requires human review |
| **Banking API (Plaid / Stripe)** | Instant Account Verification | Banking step | Fallback to micro-deposit if IAV unavailable |
| **Tax Jurisdiction Provider (Symmetry / Vertex / Avalara)** | State/local tax data, reciprocity agreements, SUI rate ranges | State setup and local tax detection steps | Rate ranges used for reasonableness validation |
| **IRS / Reporting Agent channel** | Form 8655 submission | Post-e-signature | Specific submission channel (MeF vs. batch) TBD ⚠️ Requires compliance team confirmation |
| **State Tax Agencies** | State authorization form submission (Beta) | Post-e-signature, state forms | State requirements matrix TBD ⚠️ Requires legal/compliance research |

### 3d. Epics (Feature Map)

| Epic / Feature | ID | Description | Target | Goals Supported |
|---|---|---|---|---|
| "Guided Experience" Framework & State Management | 677149 | Linear wizard container, step dependency locking, save/resume, progress indicator | Alpha | G1, G2 |
| Confirm Company Profile & Establish Primary Payroll Contact | 677150 | Read-only Prism identity confirmation; payroll contact designation | Alpha | G1, G2 |
| Federal Tax Configuration & Identity Validation | 677488 | EIN validation, entity type, 941 vs. 944 filing frequency | Alpha | G2, G5 |
| Banking Connectivity & Verification | 680492 | IAV-first bank linking; micro-deposit fallback; payroll readiness gate | Alpha | G2 |
| State Tax Jurisdiction Setup & SUI Configuration | 680498 | Primary state SUI rate + withholding account ID; all 50 states | Alpha | G2, G5 |
| Digital Authorization Setup (E-File/E-Pay) | 677405 | Form 8655 generation, e-signature, status gate; state forms at Beta | Alpha/Beta | G3 |
| Payroll Scheduling & Calendar Logic | 677485 | Pay frequency, work week, first pay date; compliance validation; multiple schedules at Beta | Alpha/Beta | G1, G2 |
| Construction Insurance Policy Capture (Workers' Comp) | 680510 | WC carrier, policy, classification codes, EMR | Beta | G4 |
| Multi-State Nexus Configuration | 681108 | Additional nexus states; SUI + withholding per state; reciprocity awareness | Beta | G5 |
| Local Tax Jurisdiction Detection & Compliance | 680502 | Auto-detect local tax exposure from Zip+4; prompt only when registration needed | Beta | G5 |
| Trade Library & Compensation Rules Configuration | 681104 | Company trade library; WC code mapping; OT rules; shift differentials; pay type library | Beta/GA | G4 |
| Payroll GL Chart of Accounts Mapping | 681105 | Map payroll categories to Prism Accounting COA; job cost labor distribution | Beta | G4 |
| YTD Historical Data Migration | 681107 | Per-employee YTD import for mid-year activations; reconciliation; locking | Beta | G2 |
| 1099 / Subcontractor Payment Tracking Configuration | 681111 | Subcontractor toggle; $600 threshold tracking; filing preferences | Beta | G4 |
| Prism Accounting Integration & Time-Entry Rate Mapping | 681112 | Job/phase sync verification; Phase Code → Trade mapping; rate lookup validation | Beta/GA | G4 |

> **Note on Setup vs. Setting:** Features in this epic are tagged either `Setup` (wizard-blocking, required for first payroll) or `Setting` (Hub-managed, not wizard-blocking). Setting-tagged features have corresponding implementation features under Epic 668798 (Payroll Configuration Hub). See: `docs/supporting/best-practices/Setup-vs-Setting-Hub-Architecture.md`

### 3e. High-Level Acceptance Criteria

- A company can progress from the wizard Welcome screen to the "Ready to Run First Payroll" completion screen without a technical error
- At Alpha, a single-state company can complete all required Setup-tagged steps (wizard framework, company profile, federal tax, banking, state tax, pay schedule, Form 8655 signing) in a single session or safely resume across sessions
- Every wizard step with invalid or missing data blocks advancement; no step can be bypassed without valid input
- The "Run Payroll" capability is disabled until banking is verified AND Form 8655 is signed; a clear tooltip explains what remains incomplete
- EIN format validation rejects invalid inputs before the step can be advanced
- SUI rate entry outside the state's published range surfaces a warning but does not hard-block (accommodating legitimate edge cases)
- All signed authorization documents are immediately downloadable by the admin as executed PDFs after signing
- Mid-year activation companies see the YTD import step; new-year activations do not
- Pay frequency selections that violate the primary state's labor law trigger a plain-language compliance warning before the admin can proceed
- All validated setup data persists across browser sessions; resuming the wizard returns the admin to the exact step where they left off

### 3f. Links to Prototypes

- Miro Board (Visual Backlog): [Full Visual Backlog](https://miro.com/app/board/uXjVJglUVR0=/?share_link_id=128266091116)
- UX Prototypes: \<Link to Figma prototypes when available\>

---

## 4. Delivery Plan

### 4a. Release Plan / Phasing

| Milestone | Timing | Audience | Scope |
|---|---|---|---|
| **Alpha** | June 2026 | Internal (Trimble) | Wizard framework; company profile; federal tax; banking (IAV); primary state tax; single pay schedule; Form 8655 generation + e-sign + authorization gate. Single company, single state. Mock payroll run capability. |
| **Beta** | Trimble Dimensions conference | Customers / Prospects | Multi-state nexus; workers' comp; additional pay schedules; state authorization forms (top-10 states); YTD import (mid-year); GL mapping; trade library (initial); 1099 toggle; local tax detection. |
| **GA** | Generally Available | All customers | Full 50-state authorization form coverage; complete trade/comp rules (shift differentials, holiday calendar); Prism Accounting integration verification; advanced GL routing; Setting items migrated to Payroll Configuration Hub (Epic 668798). |

**Setting Items:** Features tagged `Setting` originate as requirements in this epic but are managed at the Payroll Configuration Hub (Epic 668798) post-setup. At Sprint grooming, Setting-tagged requirement stories in this epic are resolved in favor of their corresponding Hub implementation stories. See architecture doc for cross-link map.

---

## 5. Supporting Information

### 5a. Assumptions

- Company identity data (EIN, Legal Name, Entity Type, Address) is already established in Prism core before payroll setup begins; the wizard does not create or modify it
- The admin has the necessary documents in hand before starting (EIN confirmation letter, bank credentials, state tax IDs, WC policy documents)
- The platform will maintain status as a registered IRS Reporting Agent; individual company authorizations (Form 8655) are signed by company officers and administered by the platform
- Traqspera time data is the authoritative source for pay period hours; the payroll engine does not have its own time entry interface
- Prism Accounting is the source of Jobs, Phase Codes, and Chart of Accounts; payroll setup does not create or modify these records

### 5b. Dependencies

| Dependency | Type | Notes |
|---|---|---|
| Prism core identity API | Internal | Company identity data must be accessible before wizard step 1 |
| Prism Accounting job/phase sync | Internal | Required before Prism Integration Verification step and GL mapping |
| Banking API partner (Plaid / Stripe) | External vendor | IAV capability; contract and enrollment required |
| Tax jurisdiction provider (Symmetry / Vertex / Avalara) | External vendor | Local tax detection; state rate ranges; reciprocity data |
| IRS Reporting Agent enrollment | Compliance / Legal | Platform must be enrolled as a Reporting Agent before Form 8655 submission channel is confirmed |
| State authorization requirements matrix | Compliance / Legal | 50-state research required before Beta state form generation |
| Traqspera trade field confirmation | Integration / Engineering | Determines whether Phase Code → Trade mapping table is required |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | Review |
|---|---|---|---|---|
| IRS Reporting Agent channel not confirmed before Alpha | Medium | High | Decouple e-signature UX from IRS submission; sign + store at Alpha, submit when channel confirmed | ⚠️ Legal/compliance |
| State authorization requirements matrix research delayed | High | Medium | Beta scope limited to top-10 states; matrix research assigned as a pre-Beta pre-work task | ⚠️ Legal/compliance |
| Traqspera trade field unavailable (requires Phase Code mapping table) | Medium | High | Design mapping table at setup; confirm with Traqspera integration team before Beta | ⚠️ Engineering |
| Setup abandonment at banking step exceeds target | Medium | High | IAV as default path; micro-deposit fallback; admin can save and return when bank credentials are available | Monitor at Alpha |
| SUI rate entry errors cause payroll miscalculations | Medium | High | Reasonableness range displayed alongside entry; warning on out-of-range values; audit trail on all changes | Monitor at Beta |
| 50-state compliance drift (state forms, rates, rules) | High | Medium | All state requirements configuration-managed; version-controlled; annual compliance review process | ⚠️ Requires human review |

### 5d. Links to Analytics & Telemetry

- Wizard step completion funnel: events per step start, step complete, step abandon *(Inferred — telemetry events TBD at implementation)*
- Banking step conversion: IAV success rate, fallback rate, abandonment rate *(Inferred)*
- Authorization signing completion: % completing Form 8655 within 24 hours, % requiring delegate signing link *(Inferred)*
- Setup-to-first-run time: median duration from wizard start to first payroll run authorized *(Inferred)*
- First-run error rate attributable to setup misconfiguration *(Inferred — requires tagging at payroll run validation)*

### 5e. Open Questions

| Question | Owner | Priority |
|---|---|---|
| What is the confirmed IRS channel for Reporting Agent Form 8655 submission (MeF, batch, other)? | Legal / Compliance | P0 — Alpha blocker |
| Does Traqspera pass a trade or labor classification field with each time entry, or is Phase Code the only bridge to rate lookup? | Engineering / Traqspera | P0 — affects pay calculation architecture |
| Which states require their own agent authorization form (separate from Form 8655)? Complete 50-state research matrix needed. | Legal / Compliance | P1 — Beta blocker |
| What is the exact IAV banking API partner? What are the enrollment and onboarding timelines? | Engineering / Product | P0 — Alpha dependency |
| Are there state or NCCI rate updates that need to be applied at calendar year rollover? What is the update cadence and process? | Compliance / Engineering | P1 — operational |
| Will Prism core push company identity updates to the payroll setup record, or does the admin need to re-confirm after a Prism profile change? | Engineering | P1 — data integrity |
