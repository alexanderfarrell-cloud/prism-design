# PRD: Ongoing Administration of Payroll (Payroll Configuration Hub)

**Initiative:** Ongoing Administration of Payroll — Payroll Configuration Hub
**Epic:** 668798
**Product:** Prism Construction Payroll (Trimble Financials)
**Target Market:** U.S. SMB construction contractors, 5–100 employees, all 50 states
**Author:** Aaron Jost
**Last Updated:** February 2026
**Status:** Active — groomed to Alpha/Beta/GA milestone targets

---

## 1. Initiative Definition

### 1a. Overview

Once a company completes the initial payroll setup wizard (Epic 668778), the Payroll Admin needs a persistent, centralized surface to view, manage, and maintain every configuration that governs how payroll calculates, posts, and files. This initiative delivers the **Payroll Configuration Hub** — a post-setup administration layer that gives the PR Admin clear visibility into their payroll readiness state, a structured home for all post-wizard Settings, and the ability to keep payroll configuration accurate as the business evolves. The Hub is the connective tissue between first-time onboarding and ongoing operations, ensuring the PR Admin always knows what's configured, what's missing, and where to go.

### 1b. Problem Statement

**User problem:** After completing the setup wizard, payroll admins have no clear answer to "where do I go to manage my payroll settings?" The wizard ends, but important configuration items — state tax rates, banking re-verification, GL mappings, benefits plans, trade compensation rules — must still be updated as the business grows, rates change, and policies renew. Without a hub, these fall through the cracks or require re-entering the wizard, which was designed for first-time use only.

**Business problem:** A payroll system that is set up once but cannot be maintained confidently produces miscalculations, compliance failures, and support escalations. Payroll admins who cannot find a setting lose trust in the platform. The Hub is required to retain customers past their first payroll run — the highest-churn point in any payroll product lifecycle.

**Why existing tools fail:** Generic payroll tools either (a) force every configuration change back through a wizard flow designed for onboarding, or (b) scatter settings across disconnected admin pages with no payroll-readiness signal. Neither gives the admin a clear "where am I and what do I still need to do?" view.

### 1c. Goals

| # | Goal |
|---|---|
| G1 | Give the PR Admin a single, always-accessible surface to view and manage all payroll configuration |
| G2 | Provide a persistent, actionable payroll readiness signal that distinguishes setup progress from pre-run configuration gaps |
| G3 | Enable ongoing management of Settings-category items without requiring re-entry into the setup wizard |
| G4 | Keep payroll configuration accurate as company policies, state rates, and business structure evolve |
| G5 | Ensure Hub-managed Settings are correctly surfaced before first payroll run so nothing is missed |

### 1d. Success Metrics

| Metric | Target | Type |
|---|---|---|
| % of companies completing all pre-run Settings within 7 days of wizard completion | ≥ 80% at Beta | Business |
| Support tickets related to "where do I update my [setting]?" | Reduction vs. baseline by 50% at Beta | Quality |
| Payroll readiness indicator accuracy (admin-reported "I was surprised by a missing setting") | < 5% of payroll runs | User |
| GL mapping configuration rate (companies running Prism Accounting) | ≥ 90% before first journal entry attempt | Compliance |
| Settings change audit trail usage (admin views change history) | *(Inferred)* — tracked at GA | Operational |

### 1e. Out of Scope

- Initial first-time setup wizard (Epic 668778 — Setting Up Companies for Payroll)
- Employee-level payroll setup (W-4, direct deposit, pay rates per employee) — Employee Management initiative
- Payroll run execution and processing — Payroll Processing initiative
- Union/certified payroll, prevailing wage, Davis-Bacon — Tier 2+
- Multi-entity / multi-company configurations
- Accountant / CPA third-party access — Role Management initiative
- Year-end tax filing and W-2/1099 generation — Tax Filing initiative

---

## 2. Users & Usage Context

### 2a. Personas

| Persona | Description | Primary Goal | Key Pain Point |
|---|---|---|---|
| **PR Admin (Owner-Operator)** | Small construction company owner or office manager; completed setup wizard and now manages ongoing payroll configuration | Keep payroll settings current and accurate without re-doing setup | Does not know where to go after the wizard ends; fears making a change that breaks a live payroll run |
| **Payroll Admin (Dedicated)** | Office manager or bookkeeper at a slightly larger firm; managing payroll alongside other responsibilities | Confidently update rates, rules, and settings on a recurring basis (annually for SUI rates, policy renewal, etc.) | No audit trail of who changed what and when; settings are scattered across disconnected pages |
| **Prism Implementation Specialist** *(Inferred)* | Trimble customer success rep guiding a company through post-setup configuration | Identify and close any Settings gaps before the company's first live payroll run | No visibility into what a company has and hasn't configured post-wizard |

### 2b. User Journeys / Workflows

**Post-Wizard Settings Completion Journey (Beta — primary path):**

```
Wizard Complete → "Ready to Configure"
   → Company Payroll Configuration Hub (landing)
   → Readiness Indicator: "Pre-Run Settings Pending" (amber)
   → Admin reviews Settings categories: State Tax, Banking, GL Mapping
   → Enters SUI rate for primary state → marks state tax complete
   → Re-confirms banking verification (or re-initiates if needed)
   → Maps payroll categories to GL accounts in Prism Accounting
   → Readiness Indicator advances to "Ready for Live Payroll" (green)
   → First payroll run unlocked
```

**Ongoing Settings Maintenance Journey (annual / event-triggered):**

```
January — SUI rate notice received from state agency
   → Hub → State Tax & Compliance Settings
   → Update SUI rate for each nexus state
   → Change logged to audit trail

Policy renewal — Workers' comp policy renewed
   → Hub → Workers' Compensation Settings
   → Update carrier, policy number, effective dates, class rates
   → Change logged to audit trail

Company expands to new state
   → Hub → State Tax & Compliance Settings
   → Add new nexus state → system prompts for state tax account ID + SUI rate
   → Readiness indicator updated
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|---|---|---|
| UC-1: Hub navigation & readiness signal | Admin lands on Hub; sees payroll readiness state and a summary of all configuration categories | P0 |
| UC-2: State tax settings management | Admin views and updates SUI rates, state tax account IDs, and nexus states | P0 |
| UC-3: Banking & payment settings | Admin views banking status and re-initiates verification if needed; adjusts payment speed | P0 |
| UC-4: Pay schedule settings management | Admin views, edits, and manages named pay schedules from Hub | P1 |
| UC-5: Benefits & deductions configuration | Admin manages pre-tax and post-tax deduction plan library | P1 |
| UC-6: GL chart of accounts mapping | Admin maps payroll expense and liability categories to Prism Accounting GL accounts | P1 |
| UC-7: Trade & compensation rules | Admin updates overtime rules, shift differentials, and holiday calendar | P1 |
| UC-8: 1099 / subcontractor settings | Admin configures 1099 tracking toggle, filing preferences, and monitors $600 thresholds | P1 |
| UC-9: YTD historical data import | Mid-year activation companies import prior YTD totals before first payroll run | P1 |
| UC-10: Workers' comp settings | Admin updates WC policy details, class codes, and rates at renewal | P2 |
| UC-11: Audit trail & change history | Admin reviews a timestamped log of all settings changes with user attribution | P2 |
| UC-12: Wage rate configuration | Admin defines and manages company pay rate library | P1 |

---

## 3. Requirements with Supporting Material

### 3a. Functional Requirements

**Hub Shell & Navigation (UC-1)**
- The system shall provide a persistent navigation surface (the Hub) accessible at all times post-setup, not only during the wizard flow (P0)
- The system shall display a payroll readiness indicator with three distinct states: Setup Incomplete (red), Pre-Run Settings Pending (amber), Operational / Ready (green) (P0)
- The system shall surface all Settings categories as navigable cards from the Hub landing page, each showing a current completion state (P0)
- *Alpha:* Hub shell, readiness indicator (setup complete vs. incomplete), and navigation frame are present; most Settings panels are "coming soon" stubs (P0)
- *Beta:* All Beta-scope Settings categories are editable in-Hub; richer readiness signal distinguishes pre-run Settings gaps from fully operational (P0)

**State Tax & Compliance Settings (UC-2)**
- The system shall allow the PR Admin to view and update the SUI/SUTA rate for each registered nexus state (P0)
- The system shall allow management of state tax account IDs per nexus state (view, enter, update) (P0)
- The system shall support adding new nexus states from the Hub, triggering the required state tax account ID and SUI rate collection flow (P0)
- The system shall display state pay frequency compliance advisories for configured nexus states (P1)
- Missing state tax settings shall trigger the amber pre-run Settings state on the readiness indicator (P0)

**Banking & Payment Settings (UC-3)**
- The system shall display current banking verification status (verified, pending, failed) from the Hub (P0)
- The system shall allow re-initiation of banking verification if a bank account changes or verification expires, without re-entering the setup wizard (P0)
- The system shall allow adjustment of ACH payment speed (2, 4, or 7-day lead time) from the Hub (P1)
- Unverified banking shall trigger the amber pre-run Settings state on the readiness indicator (P0)

**Pay Schedule Settings (UC-4)**
- The system shall display all named pay schedules (Active, Draft, Archived) with key schedule details visible at a glance (P1)
- The system shall allow editing of pay schedule fields (frequency, check date, payment speed) from within the Hub without re-entering the wizard (P1)
- *Beta:* Multi-schedule management — adding additional named schedules (e.g., Field vs. Office) is supported from the Hub (P1)

**Benefits & Deductions Configuration (UC-5)**
- The system shall allow the PR Admin to define and manage pre-tax Section 125 benefit plans (health, dental, vision, HSA) (P1)
- The system shall allow configuration of retirement plans (401(k) with employee and employer match rules) (P1)
- The system shall allow configuration of post-tax deductions (Roth, voluntary, garnishments) (P1)
- Plan definitions shall cascade into the Gross-to-Net payroll calculation engine (P1)

**GL Chart of Accounts Mapping (UC-6)**
- The system shall allow mapping of payroll expense categories (gross wages by trade, employer FICA, FUTA, SUI, workers' comp) to Prism Accounting GL accounts (P1)
- The system shall allow mapping of payroll liability categories (employee FICA withheld, FIT withheld, SIT withheld, voluntary deductions) to Prism Accounting GL accounts (P1)
- The system shall validate that all required categories have mappings before journal entries are allowed to post (P1)
- The system shall render a sample journal entry preview from configured mappings for admin validation (P1)
- Prism Accounting chart of accounts shall be pulled via integration; admin selects from existing accounts (P1)
- Missing GL mappings (for companies using Prism Accounting) shall trigger the amber pre-run Settings state (P1)

**Trade & Compensation Rules (UC-7)**
- The system shall allow view and update of overtime rules (federal FLSA and applicable state daily OT) with effective dating (P1)
- The system shall allow view and update of shift differential rules (night, weekend, holiday premiums) with effective dating and opt-in toggle (P1)
- The system shall allow view and update of the company holiday calendar for current and next year with an annual refresh prompt (P1)
- All changes shall be logged to the payroll audit trail with timestamp and user attribution (P1)

**1099 / Subcontractor Settings (UC-8)**
- The system shall provide an enable/disable toggle for 1099 subcontractor tracking; disabling hides all 1099 workflows system-wide (P1)
- The system shall allow configuration of year-end 1099-NEC filing preference (e-file via platform or export for external filing) (P1)
- The system shall monitor cumulative payments per payee against the $600 IRS threshold and surface alerts when thresholds are approached or exceeded (P1)
- The system shall validate TIN status per 1099 payee and surface missing TINs as warnings in the Hub (P2)
- A Q4 year-end readiness prompt shall surface a 1099 filing preparation checklist when applicable (P2)

**YTD Historical Data Import (UC-9)**
- The Hub YTD section shall be visible only to companies that activated mid-year AND have not yet submitted a payroll run; hidden for new-year activations (P1)
- The system shall accept per-employee YTD earnings, withholding, and tax deposit credit data (P1)
- The system shall support bulk import via structured CSV/Excel template (P1)
- The system shall validate imported data and flag FICA over-withholding, state vs. federal discrepancies, and negative values before acceptance (P1)
- YTD data shall be locked after the first payroll run; corrections require an auditable amendment workflow (P1)

**Workers' Comp Settings (UC-10)**
- The system shall allow the PR Admin to view current WC policy details (carrier, policy number, effective dates) from the Hub (P2)
- The system shall allow updating of class codes and associated rates as employee classifications change (P2)
- The system shall support policy renewal workflow — updating effective dates and rates without disrupting in-progress payroll runs (P2)

**Audit Trail & Change History (UC-11)**
- The system shall maintain a timestamped, user-attributed log of all settings changes made through the Hub (P2)
- *GA:* The audit trail shall be viewable and filterable by setting category, date range, and user (P2)

**Wage Rate Configuration (UC-12)**
- The system shall allow the PR Admin to define and manage the company's pay rate structure, including standard hourly rates, task-based rates, and job classification mappings (P1)
- Rates defined here shall feed directly into the gross wage calculation engine (P1)

### 3b. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | All Hub changes are logged to an immutable audit trail; sensitive fields (banking account details) remain masked in the Hub |
| **Compliance** | SUI rate changes take effect on the defined effective date, not retroactively; all rate and policy changes are effective-dated to prevent mid-run mismatches |
| **Availability** | Hub must be available continuously (not only during payroll runs); no planned downtime during payroll processing windows |
| **Usability** | Every Settings panel explains what the setting does and why it matters; no raw tax codes or regulatory jargon without plain-language explanation |
| **Performance** | Hub landing page and readiness indicator render in < 2 seconds; Settings panels load in < 3 seconds |
| **Accessibility** | WCAG 2.1 AA compliance on all Hub screens |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Fields | Notes |
|---|---|---|
| Pay Schedule | Schedule Name, Frequency, Work Week Start, First Pay Date, Status | Supports multiple named schedules per company; sourced from Epic 668778 entity |
| State Tax Registration | State, Tax Account ID, SUI Rate, Additional Contributions, Nexus Status | One record per nexus state; updateable annually |
| Bank Account | Routing, Account Number, Verification Status, Payment Speed, Last Verified Date | Masked post-verification; supports re-verification flow |
| GL Mapping | Payroll Category, GL Account ID, Source (Prism COA), Effective Date | Required for journal entry posting |
| Deduction Plan | Plan Type, Pre/Post Tax, Employee Rate, Employer Rate/Match, Effective Date | Cascades into gross-to-net engine |
| Trade / Comp Rule | Trade, WC Class Code, OT Rule, Shift Differential, Effective Date | Per-trade overrides supported |
| 1099 Setting | Tracking Enabled, Filing Preference, Payee-level YTD Total, TIN Status | Year-end filing deadline awareness |
| WC Policy | Carrier, Policy Number, Effective/Expiration Date, Class Codes, Rates, EMR | Annual renewal workflow |
| YTD Balance | Employee, Period, Gross Wages, Tax Types, Deposit Credits, Lock Status | Mid-year activations only; locked after first run |
| Audit Log | Field Changed, Old Value, New Value, Timestamp, User, Category | Immutable; retained with payroll records |

#### Integration Requirements

| System | Purpose | Key Trigger | Notes |
|---|---|---|---|
| **Prism Core / Epic 668778** | Company identity and initial Setup data (read-only source for Hub) | Hub initialization | EIN, Entity Type, Primary State, Pay Schedules seeded from wizard |
| **Prism Accounting** | Chart of accounts source for GL mapping; job/phase sync | GL mapping panel | Admin selects from existing Prism accounts; read-only pull |
| **Payroll Calculation Engine** | Consumes all Hub Settings at payroll run time | Payroll run trigger | OT rules, shift differentials, deduction plans, GL mappings must be applied at run time |
| **Banking API (Plaid / Stripe)** | Re-verification if banking details change | Banking panel re-verify action | Same flow as initial setup; results update Hub verification status |
| **Tax Jurisdiction Provider** | SUI rate reasonableness ranges; state compliance advisories | State Tax settings panel | Out-of-range SUI entries surface a warning |

### 3d. Epics (Feature Map)

| Feature | ID | Description | Target | Goals Supported |
|---|---|---|---|---|
| Company Payroll Configuration Hub (shell) | 681508 | Hub landing, navigation frame, readiness indicator (3-state), Settings category cards | Alpha | G1, G2 |
| Pay Schedule Settings Management | 681513 | In-Hub view and management of named pay schedules; multi-schedule support | Beta | G3, G4 |
| State Tax & Compliance Settings | 681514 | SUI rate updates, state tax account ID management, nexus state additions | Beta | G3, G4, G5 |
| Banking & Payment Settings | 681515 | Banking verification status view, re-verification flow, payment speed adjustment | Beta | G3, G5 |
| Benefits & Deductions Configuration | 681517 | Pre-tax and post-tax benefit and deduction plan library management | Beta | G3, G4 |
| Payroll GL Chart of Accounts Mapping | 681543 | Map payroll categories to Prism Accounting COA; job cost GL routing | Beta | G3, G4, G5 |
| Trade & Compensation Rules Management | 681544 | OT rules, shift differentials, holiday calendar — view and update in Hub | Beta | G3, G4 |
| 1099 / Subcontractor Settings Management | 681545 | 1099 tracking toggle, filing preferences, $600 threshold monitoring | Beta | G3, G4 |
| YTD Historical Data Import (Mid-Year) | 681546 | Per-employee YTD import for mid-year activations; validation and locking | Beta | G4, G5 |
| Workers' Compensation Settings | 681516 | WC policy details, class code management, renewal workflow | GA | G3, G4 |
| Configure Pay (Wage) Rates | 668828 | Company pay rate library; hourly, task-based, job classification mappings | TBD | G3, G4 |

> **Note on Setup vs. Setting architecture:** Features tagged `Setting` originate as requirements in Epic 668778 (Setup). The Hub (this epic) delivers the UX surfaces where those settings are actively managed post-wizard. Setting stories in 668778 are cross-linked to their corresponding Hub features here and are resolved in favor of Hub implementation stories at sprint grooming time. See: `docs/supporting/best-practices/Setup-vs-Setting-Hub-Architecture.md`

### 3e. High-Level Acceptance Criteria

- An admin who has completed the setup wizard can reach the Payroll Configuration Hub without re-entering the wizard
- The Hub readiness indicator correctly reflects one of three states (red/amber/green) based on the actual completion state of Setup and pre-run Settings items
- An admin can update a SUI rate, re-verify a bank account, and adjust a pay schedule entirely from the Hub without navigating to any wizard flow
- All settings changes are captured in an audit log with timestamp and user attribution (GA)
- GL mappings can be set and validated before a payroll journal entry is attempted; the Hub surfaces a warning if required mappings are missing
- Mid-year activation companies see the YTD import section; new-year activations do not
- Benefits and deduction plan changes in the Hub cascade correctly into the Gross-to-Net calculation for the next payroll run
- The Hub is accessible at all times, not only during the setup or payroll processing workflows
- All Hub panels meet WCAG 2.1 AA accessibility standards
- An admin can add a new nexus state from the Hub and be guided to provide the required state tax account ID and SUI rate before that state becomes active in payroll

### 3f. Links to Prototypes

- Miro Board (Visual Backlog): [Full Visual Backlog](https://miro.com/app/board/uXjVJglUVR0=/?share_link_id=128266091116)
- Architecture Reference: `docs/supporting/best-practices/Setup-vs-Setting-Hub-Architecture.md`
- UX Prototypes: \<Link to Figma prototypes when available\>

---

## 4. Delivery Plan

### 4a. Release Plan / Phasing

| Milestone | Timing | Audience | Scope |
|---|---|---|---|
| **Alpha** | June 2026 | Internal (Trimble) | Hub shell, navigation frame, 3-state readiness indicator (Setup complete vs. incomplete), settings category cards present (most "coming soon"). Demonstrates the Hub concept and readiness signal alongside the setup wizard. |
| **Beta** | Trimble Dimensions conference | Customers / Prospects | Full Settings panel suite: state tax management, banking re-verification, pay schedules, GL mapping, benefits/deductions, trade/comp rules, 1099 settings, YTD import for mid-year activations. Richer readiness signal distinguishing pre-run gaps from fully operational. |
| **GA** | Generally Available | All customers | Workers' comp settings management, audit trail and change history (full filterable view), wage rate configuration, complete 50-state compliance advisory support. All Setting-tagged stories from Epic 668778 resolved via Hub implementation. |

---

## 5. Supporting Information

### 5a. Assumptions

- A company must have completed the initial setup wizard (Epic 668778) before the Hub is accessible in its full form; the Hub does not replicate the wizard experience
- The Payroll Calculation Engine consumes Hub Settings at payroll run time — changes made in the Hub take effect on the next payroll run, not retroactively
- Prism Accounting is the source of chart of accounts for GL mapping; the Hub does not create or modify GL accounts
- The banking re-verification flow in the Hub uses the same banking API integration (Plaid/Stripe) as the initial setup wizard
- YTD data import is a one-time activity and becomes locked after the first submitted payroll run; the Hub hides this section for new-year activations entirely

### 5b. Dependencies

| Dependency | Type | Notes |
|---|---|---|
| Epic 668778 (Setup Wizard) | Internal — upstream | Hub assumes completed wizard; company identity, EIN, primary state, and initial pay schedule seeded from Setup |
| Payroll Calculation Engine | Internal | Must consume Hub Settings (OT rules, deduction plans, GL mappings) at run time |
| Prism Accounting job/phase sync | Internal | Required for GL mapping panel; chart of accounts pulled via integration |
| Banking API (Plaid / Stripe) | External vendor | Re-verification flow in banking settings panel |
| Tax Jurisdiction Provider (Symmetry / Vertex / Avalara) | External vendor | SUI rate reasonableness ranges; state compliance advisory display |
| Employee Management initiative | Internal | Wage rates and deduction plan assignments at the employee level are a dependency for Hub-level plan definitions to take effect |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | Review |
|---|---|---|---|---|
| Admin makes a Hub Settings change mid-payroll-run | Low | High | Hub changes take effect on next run only; lock Settings edits during an active payroll run in progress | ⚠️ Engineering |
| GL mapping requirements not known until Prism Accounting integration is detailed | Medium | High | Design GL mapping panel with flexible category configuration; avoid hardcoding account types | ⚠️ Engineering / Prism Accounting team |
| YTD import errors produce incorrect W-2s at year-end | Medium | High | Strong validation at import time; lock after first run with amendment-only corrections; reconciliation report | ⚠️ Compliance review |
| Benefits/deductions configuration complexity underestimated (Section 125 plan rules) | High | Medium | Start with simple flat-dollar and percentage-of-gross plans at Beta; complex plan designs deferred to GA | Monitor at Beta |
| Admin updates SUI rate effective date incorrectly (retroactive impact) | Medium | Medium | Effective dating validation; warn if date is in the past; require confirmation | ⚠️ Requires human review |
| Hub readiness indicator shows incorrect state (false green) | Low | High | Unit test all readiness state transitions; instrument with telemetry events per state change | Monitor at Alpha |

### 5d. Links to Analytics & Telemetry

- Hub landing page visits per company (frequency of return post-wizard) *(Inferred)*
- Readiness indicator state distribution across companies (% in red / amber / green) at any point in time *(Inferred)*
- Time from wizard completion to Hub amber → green transition *(Inferred — leading indicator of pre-run setup completion)*
- Settings category update frequency (which settings are changed most often and when) *(Inferred)*
- YTD import completion rate for mid-year activations *(Inferred)*
- GL mapping completion rate for companies using Prism Accounting *(Inferred)*

### 5e. Open Questions

| Question | Owner | Priority |
|---|---|---|
| What is the exact trigger for locking Settings during an active payroll run — run submission, run processing start, or pay date? | Engineering | P0 — Hub design dependency |
| Which Setting items should block the first payroll run (trigger amber readiness) vs. which are advisory only? Full list needs sign-off. | Product / Compliance | P0 — readiness indicator design |
| Does the Payroll Calculation Engine support effective-dated rule changes (so a rule updated today applies to runs starting tomorrow, not current open run)? | Engineering | P1 — OT rule and deduction plan effective dating |
| What is the plan for Configure Pay (Wage) Rates (Feature 668828)? Target milestone is not yet assigned. | Product | P1 — feature roadmap |
| Are benefits/deduction plans company-level only at Beta, or do they need per-employee override capability at the same time? | Product | P1 — scope boundary |
| Will Prism Accounting chart of accounts be pulled in real-time or cached? How often does it sync? | Engineering / Prism Accounting | P1 — GL mapping panel design |
