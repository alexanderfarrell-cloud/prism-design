# Earnings & Rate Calculation — Epic Set
**Prism Construction Payroll | E4 Module | Draft: March 4, 2026**

---

## Epic Set Overview

| # | Epic Title | One-Line Summary | Milestone |
|---|-----------|-----------------|-----------|
| E4-1 | Trade-Based Rate Lookup & Assignment | Automatically match the correct pay rate to every time entry using trade type and cost code | Alpha → Beta |
| E4-2 | Standard FLSA Overtime Engine | Calculate workweek-level overtime at 1.5× for all hours over 40 per FLSA | Beta |
| E4-3 | Weighted Average Overtime (WAOT) Calculation | Accurately compute the blended overtime premium for employees who work at multiple rates in the same workweek | Beta |
| E4-4 | State-Specific Overtime & Double-Time Rules | Apply all 50-state OT and DT thresholds, surfacing the higher of federal and state obligation | GA |
| E4-5 | Additional Pay Types & Final Pay Compliance | Support holiday, PTO, supplemental, retroactive, and state-specific final pay obligations | GA |
| E4-6 | Payroll Earnings Summary & Admin Review | Deliver a transparent, auditable earnings breakdown per employee at every payroll run | Alpha → GA |

---

---

## Epic E4-1 — Trade-Based Rate Lookup & Assignment

### 1. Goal / Outcome

Every time entry in a payroll run receives the correct pay rate — automatically — based on the employee's configured rate schedule for the matching trade type or cost code. Admins no longer cross-reference spreadsheets to verify rates. At Alpha, this operates using a single primary rate per employee. At Beta, it resolves multi-rate schedules per trade and cost code assignment.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — needs confidence that the right rate was applied without manual verification
- **External CPA / Bookkeeper** — needs to audit that rates applied to time entries match contracted or configured schedules

### 3. Business & PRD Drivers

- G2: Correct rate applied to every time entry based on trade/cost code — no manual lookups
- G1: Zero gross pay calculation errors
- FR: Trade-based rate lookup (§3a); UC-1 (P0 — Alpha)
- User Insight 3: Job costing is the strategic differentiator — "labor is 60% of project cost; accurate allocation is paramount"
- User Insight 2: Manual rate transcription across disconnected systems creates chain-of-custody errors

### 4. Problem / Rationale

Generic tools assign a single rate per employee. Construction workers routinely earn different rates depending on what trade or cost code they're working under — a framer earning $30/hr who also operates a crane at $45/hr cannot be correctly paid in QuickBooks or Gusto without manual overrides. When overrides are forgotten or wrong, gross pay is incorrect, job costs are wrong, and FLSA calculations downstream are corrupted.

### 5. In Scope

- At Alpha: resolve a single primary hourly rate per employee and apply it to all time entries
- At Beta: resolve per-trade and per-cost-code rate schedules from the employee's configured rate table in Employee Management (E2)
- Apply the most recent effective-dated rate valid for each time entry's work date
- When no trade-specific rate is found: apply the employee's primary (default) rate and flag the entry for admin review
- Surface unflagged entries in the pre-run review panel so admin can acknowledge before proceeding
- Emit rate-applied metadata per entry (rate used, rate source: trade-matched vs. fallback, effective date) for audit and downstream use
- Track the `rate_lookup_fallback` event per entry for analytics

### 6. Out of Scope (for this epic)

- Pay rate configuration / setup UI — Employee Management (E2)
- Time entry coding (trade type, cost code assignment) — Time Collection (E3)
- Union CBA or prevailing wage rate tables — Tier 2+
- Salary-to-hourly conversion or salary exceptions — noted as future
- Display of rate detail in the earnings summary panel — E4-6

### 7. Example "Super Stories"

- As a PR Admin, I want the system to automatically apply each employee's correct trade rate to every time entry so that I don't have to manually cross-reference rate tables before running payroll.
- As a PR Admin, I want to be alerted when a time entry has no matching trade rate so that I can review it before payroll is finalized — and the system never silently uses a wrong rate.
- As an External CPA, I want to see which rate was applied to each time entry and whether it was trade-matched or fell back to the default so that I can confirm gross pay is correctly supported.

### 8. Acceptance Criteria Themes

- 100% of time entries in a payroll run receive a resolved rate — no entry proceeds without a rate assignment
- Trade-matched rates are applied when a matching trade type or cost code is configured; the effective-date logic selects the correct rate for the work date
- When no trade match exists, the employee's primary rate is applied and the entry is flagged — admin must acknowledge flagged entries before run proceeds
- Fallback rate usage is visible in the pre-run review panel, distinguishing flagged entries from clean matches
- Rate metadata (rate value, source, effective date) is stored with each EarningsLine record for auditability
- System handles employees with multiple simultaneous rate configurations without applying the wrong rate to an entry
- Alpha: single-rate resolution works end-to-end in mock payroll run

### 9. Dependencies & Risks

**Dependencies:**
- E2 (Employee Management): pay rate schedules, effective dates, and trade/cost code configurations must be present before payroll can run — **High risk**
- E3 (Time Collection): approved time entries must carry trade type and cost code — **High risk**; if entries arrive uncoded, fallback logic triggers broadly

**Risks:**
- High volume of fallback flags in early rollout if E2 rate configuration is incomplete — creates admin burden and erodes trust in automation
- Effective-date logic may have edge cases at period boundaries (rate change mid-week) — needs explicit test vectors

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Trade-based rate lookup accuracy | 100% of entries matched or explicitly flagged |
| `rate_lookup_fallback` rate (entries defaulting to primary) | Trending toward <5% as setup completeness improves |
| Payroll runs blocked due to unacknowledged fallbacks | Visible and actionable — not silently passed |

### 11. Assumptions

- Pay rates are fully configured in E2 before payroll runs are initiated; E4-1 does not have a rate setup interface of its own
- Time entries from E3 always carry at minimum a trade type field; cost code is optional but enhances match precision
- Effective-date rate selection follows the most recent rate effective on or before the work date

---

---

## Epic E4-2 — Standard FLSA Overtime Engine

### 1. Goal / Outcome

Prism automatically calculates federal overtime — 1.5× the regular rate for all hours worked over 40 in a workweek — evaluated at the correct workweek boundary. Admins no longer need to track weekly hour totals manually, and the system enforces the FLSA workweek unit regardless of the pay period schedule. This epic covers the single-rate case; multi-rate WAOT is E4-3.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — needs OT calculated correctly without manual tracking
- **Owner / Exec** — needs to know total payroll cost including OT before disbursement
- **External CPA / Bookkeeper** — needs to verify OT was applied per FLSA, especially when the pay period spans multiple workweeks

### 3. Business & PRD Drivers

- G1: Zero gross pay calculation errors
- G3: Accurate overtime calculation
- FR: Overtime — FLSA Standard (§3a); UC-2 (P0 — Beta)
- User Insight 1: "Compliance Trap" — owners are terrified of FLSA violations and resulting penalties
- User Insight 3: WAOT / OT accuracy is specifically cited as a gap in QuickBooks and Gusto

### 4. Problem / Rationale

Generic payroll tools often calculate OT at the pay period level, not the workweek level — a critical FLSA violation for bi-weekly or semi-monthly pay schedules. When employees work 45 hours in one week and 35 in another, the correct result is 5 OT hours in week one and zero in week two. Tools that sum across two weeks and find 80 total hours may calculate zero OT — creating unpaid wage liability that surfaces only in audits.

### 5. In Scope

- Calculate total hours worked per employee per FLSA workweek (7-day period, company-configured start day)
- For all hours over 40 in a workweek: apply 1.5× the regular rate as OT pay
- Correctly identify embedded workweek boundaries for bi-weekly and semi-monthly pay periods — split and evaluate OT at each boundary
- Produce separate EarningsLine records for regular and OT pay, with distinct pay type labels
- Single-rate employees only in this epic; multi-rate WAOT handled in E4-3
- Emit `ot_calculated` event (type: FLSA) per run per employee for analytics

### 6. Out of Scope (for this epic)

- Multi-rate Weighted Average Overtime — E4-3
- State-specific OT thresholds (daily OT, 7th-day rules) — E4-4
- Double-time — E4-4
- OT display in earnings breakdown UI — E4-6

### 7. Example "Super Stories"

- As a PR Admin, I want the system to calculate FLSA overtime automatically for each employee's workweek so that I don't need to track weekly hour totals in a spreadsheet.
- As a PR Admin running bi-weekly payroll, I want the system to evaluate overtime at each embedded weekly boundary so that the calculation is compliant even when the pay period spans two weeks.
- As an Owner, I want to see OT cost broken out from regular pay in the payroll summary so that I can understand where overtime expense is concentrated.

### 8. Acceptance Criteria Themes

- Employee working 44 hrs in a single workweek receives 40 hrs at regular rate and 4 hrs at 1.5× — not 44 hrs at regular
- Employee on bi-weekly pay who works 45 hrs in week 1 and 35 hrs in week 2 receives exactly 5 OT hours for week 1 and zero for week 2 — not averaged across the period
- Workweek start day is company-configurable; system applies consistent boundaries across all employees in the same company
- OT earnings appear as a distinct line in the earnings breakdown (pay type: "Overtime") separate from regular pay
- System handles partial workweeks at the start and end of employment correctly
- No OT is calculated when hours ≤ 40 in a workweek

### 9. Dependencies & Risks

**Dependencies:**
- E4-1 must resolve pay rates before OT premium can be calculated
- E3 must supply daily/entry-level hour data with work dates (needed for workweek boundary evaluation)
- OQ-2 (open question): bi-weekly workweek boundary handling — requires legal/compliance confirmation before Beta

**Risks:**
- Bi-weekly pay period + workweek boundary logic is an edge case with real FLSA exposure if implemented incorrectly — needs legal sign-off
- If E3 delivers hours only at the pay period level (not day/entry level), workweek OT calculation is impossible — data contract must be confirmed

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| OT calculation errors (rate or workweek boundary) | 0% against documented test vectors |
| `ot_calculated` (FLSA type) events per run | Tracking baseline for operational visibility |
| Payroll runs unlocked post-submission due to OT error | <1% |

### 11. Assumptions

- FLSA workweek start day is configured per company during onboarding (E2 / Company Setup)
- Time entries carry work dates sufficient to evaluate 7-day workweek boundaries
- Legal/compliance confirms bi-weekly workweek boundary handling before Beta release (OQ-2)

---

---

## Epic E4-3 — Weighted Average Overtime (WAOT) Calculation

### 1. Goal / Outcome

When an employee works at two or more pay rates in the same FLSA workweek and exceeds 40 hours, Prism calculates the legally required Weighted Average Overtime (WAOT) premium — not the simple highest-rate or last-rate shortcut. This eliminates the single most common FLSA miscalculation in construction payroll and removes a significant legal liability for contractors.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — currently unaware that WAOT is required; relies on the system to apply it correctly
- **Owner / Exec** — wants assurance that overtime is calculated correctly for mixed-rate weeks
- **External CPA / Bookkeeper** — needs to verify WAOT calculation detail supports correct gross pay and tax withholding

### 3. Business & PRD Drivers

- G3: Accurate WAOT calculation for all multi-rate, multi-job workweeks
- G1: Zero gross pay calculation errors
- FR: WAOT Calculation (§3a); UC-3 (P0 — Beta)
- PRD Problem Statement: "Most SMB tools use a simpler (incorrect) method, creating FLSA liability"
- User Insight 3: WAOT is explicitly named as the calculation that differentiates Prism from QuickBooks/Gusto

### 4. Problem / Rationale

A framer who earns $30/hr works 32 hours on framing and 12 hours operating a crane at $45/hr in the same week. Total: 44 hours — 4 OT hours required. The legally required WAOT calculation blends the two rates proportionally: (32×$30 + 12×$45) / 44 = $34.09 weighted average regular rate; the OT premium is 0.5 × $34.09 × 4 = $68.18. Tools that apply 1.5× to the highest rate ($45) overpay; tools that apply 1.5× to the primary rate ($30) underpay and create FLSA liability. Both are wrong. Only WAOT is compliant.

### 5. In Scope

- Detect when an employee has worked at 2+ distinct pay rates within the same FLSA workweek
- Calculate the weighted average regular rate: sum of (hours × rate) for all rate buckets in the workweek, divided by total hours
- Apply the FLSA OT premium: 0.5× the weighted average rate × overtime hours
- Combine regular earnings (already paid at each rate) + WAOT premium for total OT compensation
- Produce distinct EarningsLine records for regular earnings per rate bucket and the WAOT premium line
- Display WAOT calculation detail (rate buckets, weighted rate, premium) in the earnings breakdown — visible to Admin and CPA
- Emit `ot_calculated` (type: WAOT) event per run per employee
- Cover all multi-rate combinations: trade-to-trade and job-to-job within the same workweek

### 6. Out of Scope (for this epic)

- State-specific OT applied on top of WAOT — handled in E4-4 (the interaction between WAOT and state daily OT is a GA-scope complexity)
- Single-rate FLSA OT — E4-2
- Union WAOT variations (CBA-defined weighted rates) — Tier 2+

### 7. Example "Super Stories"

- As a PR Admin, I want the system to automatically detect when an employee worked at multiple rates in the same week and apply WAOT so that I'm not exposed to FLSA liability from a miscalculated OT premium.
- As an External CPA, I want to see the WAOT calculation broken down — each rate bucket, the weighted average, and the OT premium — so that I can verify the gross pay figure is correct.
- As an Owner, I want to know when WAOT was applied to a payroll run so that I understand why the OT cost is different from a simple 1.5× estimate.

### 8. Acceptance Criteria Themes

- Given employee with 32 hrs at $30 and 12 hrs at $45 (44 total), system calculates: regular earnings = $960 + $540 = $1,500; WAOT rate = $34.09; OT premium = $68.18 — matching PRD test vector to 2 decimal places
- System correctly identifies multi-rate workweeks without admin configuration — automatic detection based on rate-resolved time entries
- WAOT premium appears as a distinct labeled line ("Weighted OT Premium") in the earnings breakdown, not merged with regular or standard OT
- System handles 3+ rate combinations within a single workweek
- If total hours ≤ 40, no OT calculation is triggered regardless of rate variation
- WAOT calculation detail (all rate buckets, weighted average, premium computation) is displayed in earnings breakdown for admin and CPA review
- Calculation passes a library of documented WAOT test vectors (including edge cases: one rate for a single hour, 3+ rates, partial weeks) before Beta release

### 9. Dependencies & Risks

**Dependencies:**
- E4-1 must resolve per-entry rates before WAOT can detect multi-rate workweeks
- E4-2 workweek boundary logic is a prerequisite (WAOT is evaluated per FLSA workweek)
- Legal/compliance sign-off on WAOT test vector library required before Beta

**Risks:**
- WAOT edge cases (3+ rates, partial workweek, rate changes mid-week) may not be fully enumerated — requires exhaustive test library and legal review
- Admin UX: displaying WAOT detail in a way that's transparent without being incomprehensible to a non-accountant — design investment required

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| WAOT calculation accuracy | 100% against documented test vectors — legal/compliance validated |
| Multi-rate payroll runs where WAOT is auto-applied | 100% (zero requiring manual override) |
| Admin-reported WAOT confusion or support tickets | Tracked post-Beta as signal for UX iteration |

### 11. Assumptions

- WAOT is always required when two or more distinct pay rates appear in the same FLSA workweek — regardless of pay period type
- The FLSA method (0.5× weighted average premium on OT hours) is the standard applied; alternative "rate in effect" method is out of scope unless legal directs otherwise
- State-level WAOT variations (if any) are addressed in E4-4

---

---

## Epic E4-4 — State-Specific Overtime & Double-Time Rules

### 1. Goal / Outcome

At GA, Prism applies the correct overtime and double-time rules for all 50 states — including daily OT thresholds, 7th-consecutive-day rules, and double-time thresholds — automatically surfacing whichever obligation (federal or state) is higher. Contractors working in California, Alaska, Nevada, Colorado, and other states with elevated OT requirements receive accurate gross pay without any manual configuration or rule-memorization by the admin.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — cannot be expected to know 50-state OT law; needs the system to handle it
- **Owner / Exec** — needs protection from state labor board penalties that can be existential for an SMB
- **External CPA / Bookkeeper** — needs to verify state OT was applied correctly to support accurate tax filing

### 3. Business & PRD Drivers

- G4: Full 50-state OT and pay type rule coverage at GA
- G1: Zero gross pay calculation errors
- FR: State-Specific Overtime Rules; Double-Time (§3a); UC-4, UC-5 (P0 — GA)
- User Insight 1: Compliance Trap — state labor violations are audit-discovered and can bankrupt SMBs
- User Insight 5: Scale-Up Cliff — contractors crossing state lines immediately encounter multi-state OT complexity

### 4. Problem / Rationale

State OT laws create daily overtime thresholds (California: OT after 8 hrs/day; double-time after 12 hrs/day) and special rules (7th consecutive day) that generic tools don't implement. A California employee working 10-hour days is owed 2 OT hours per day — not just weekly OT — and this calculation must be reflected in gross pay before any tax withholding. Contractors who use generic tools for California crews are systematically underpaying workers and accumulating PAGA exposure (California's Private Attorneys General Act), which has resulted in multi-million dollar class action settlements for construction firms.

### 5. In Scope

- Apply state-specific daily overtime thresholds for all 50 states where they exceed FLSA
- California: 1.5× after 8 hrs/day; 2× after 12 hrs/day; 1.5× for first 8 hrs on 7th consecutive workday; 2× thereafter
- Alaska and Nevada: daily OT thresholds per current state law
- Colorado: daily OT rules per current state law
- All other states: apply per state DOL standards sourced from tax jurisdiction provider
- Enforce higher-of-federal-or-state logic: when both federal weekly OT and state daily OT apply, the system applies whichever yields the higher OT obligation (not double-counted)
- Double-time: 2× rate applied where required by state law (CA thresholds plus any other applicable states)
- OT rule data is versioned and updatable without code releases (rule data separated from calculation logic)
- State OT rule source: licensed tax jurisdiction provider (Symmetry/Vertex) — not internally maintained
- Emit `ot_calculated` (type: state) event per entry per employee per run

### 6. Out of Scope (for this epic)

- Union-negotiated OT rules or CBA overtime provisions — Tier 2+
- Prevailing wage OT calculations — Tier 2+
- State income tax withholding triggered by OT — E5 (Tax Withholding)
- Daily OT for Alpha and Beta (Beta covers FLSA weekly only plus key states as noted)
- WAOT interaction with state daily OT at Beta — this edge case is GA scope

### 7. Example "Super Stories"

- As a PR Admin with California field workers, I want the system to automatically apply daily overtime after 8 hours and double-time after 12 hours so that I don't need to memorize California labor law to run payroll.
- As an Admin whose crew worked 7 consecutive days on a project, I want the system to detect the 7th-consecutive-day premium and apply the correct rate automatically.
- As an Owner expanding operations into Nevada, I want Prism to apply Nevada-specific OT rules without any additional configuration beyond assigning employees to the correct work state.

### 8. Acceptance Criteria Themes

- California employee working 10 hrs in a single day receives 8 regular + 2 OT hours at 1.5× — without any admin configuration of state rules
- California employee working 13 hrs in a day receives 8 regular + 4 OT at 1.5× + 1 DT at 2× — correct split applied
- Higher-of-federal/state logic: employee accruing both daily state OT and weekly FLSA OT in the same week receives whichever results in higher total OT pay — not both stacked
- 7th consecutive workday is detected by the system based on approved time entry dates — no manual flagging required
- If an employee's work state has no state-specific OT rule, federal FLSA applies as default
- System blocks payroll finalization if an applicable state OT rule is not in the provider data set, with a clear admin-facing message (no silent fallback to FLSA only)
- OT rule data can be updated (via provider feed) without a code release; change takes effect on the next payroll run date on or after the rule's effective date

### 9. Dependencies & Risks

**Dependencies:**
- OQ-1: Tax jurisdiction provider (Symmetry/Vertex) must supply state OT rule data — buy decision must be finalized before GA development begins — **High risk**
- E2: Employee work state must be configured and carried through to payroll run context
- E4-2 (FLSA engine) and E4-3 (WAOT) must be complete before state overlay logic can be layered on top

**Risks:**
- State OT rule data is incomplete or stale from provider — mitigate by SLA in vendor contract; audit rule data at each state law change
- All states with double-time requirements must be enumerated — this list requires legal review before GA (⚠️ PRD flags this as requiring human review)
- WAOT + state daily OT interaction (e.g., CA employee at multiple rates) is a known edge case requiring explicit legal guidance before GA

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| State OT rules supported at GA | All 50 states |
| OT calculation errors (state-specific) against test vectors | 0% |
| Payroll runs blocked due to unsupported state rule | Visible and actionable message; tracked |

### 11. Assumptions

- State OT rule data is licensed from an external provider (Symmetry/Vertex) — Prism does not maintain this in-house
- Work state for OT purposes is the state where work was performed (per time entry), not the employee's home state
- Double-time states and thresholds are fully enumerated by legal/compliance review before GA development

---

---

## Epic E4-5 — Additional Pay Types & Final Pay Compliance

### 1. Goal / Outcome

At GA, Prism supports the full range of non-standard pay types that construction contractors need: holiday pay, PTO payout, supplemental pay (bonuses, commissions), retroactive adjustments for prior-period corrections, and state-mandated final pay obligations at termination. Each pay type appears as a distinct, labeled line in the earnings breakdown, giving admins and CPAs complete visibility into what was paid and why.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — needs to queue retroactive corrections and supplemental pay without re-opening or recalculating prior runs
- **Owner / Exec** — needs to understand total payroll cost including bonuses and retroactive adjustments
- **External CPA / Bookkeeper** — needs each pay type as a discrete line item to support GL entries and tax treatment decisions

### 3. Business & PRD Drivers

- G1: Zero gross pay calculation errors across all pay types
- G5: Final pay obligations by state tracked and surfaced at termination
- FR: Holiday and PTO Pay; Supplemental and Retroactive Pay; Final Pay by State (§3a); UC-6, UC-7, UC-8, UC-9, UC-11 (P1 — GA)
- User Insight — Theme 3: "Correction Workflows: Payroll corrections are a major pain point. Users want guided workflows to fix mistakes without breaking GL integrity"
- User Insight 2: Fragmented workflows create data silos; a single system handling all pay types eliminates manual transcription risk

### 4. Problem / Rationale

Without native support for these pay types, admins resort to workarounds: entering bonuses as inflated regular hours, manually computing retro pay in spreadsheets and adding it as a note, or ignoring final pay timing requirements until a state labor complaint arrives. Each workaround creates audit gaps, incorrect tax treatment (supplemental pay has a distinct federal flat-rate withholding), and legal risk from missed final pay deadlines.

### 5. In Scope

**Holiday Pay:**
- Designate hours within a pay period as Holiday pay type; system applies configured rate and labels the line accordingly
- Holiday pay does not trigger OT calculation recomputation (assumption — confirm with legal)

**PTO Payout:**
- Support PTO hours payout at the employee's configured rate
- PTO payout line item distinct from regular pay in earnings breakdown

**Supplemental Pay (Bonus / Commission):**
- Admin can add a supplemental pay item to any regular or off-cycle payroll run
- Supplemental item carries a pay type label (Bonus, Commission, Other) and appears as a distinct EarningsLine record
- Flag supplemental pay items for E5 (Tax Withholding) with supplemental wage indicator (federal flat-rate withholding treatment)

**Retroactive Pay Adjustments:**
- Admin enters: employee, amount, original pay period, reason
- System schedules retroactive amount into the next regular run or an off-cycle run
- Retroactive item appears as a distinct labeled line ("Retro Adjustment — [Period]") — never merged into regular pay
- Full audit log: who entered it, when, original period, reason
- Retro adjustments from prior periods do not re-trigger OT recalculation for the original period (correction amount is added as a separate earnings line)

**Final Pay by State:**
- On employee termination event, system surfaces the final pay timing requirement for the employee's work state
- States covered at GA: CA (immediate / next business day), CO (next scheduled payday), MT (next payday), NV (immediate), and all others per tax provider data
- Admin is presented with required payment date; final pay run can be initiated as an off-cycle disbursement (connects to E6)
- System does not auto-calculate accrued PTO payout for final pay (state rules vary — surfaces prompt with state rule, admin enters amount)

**Multiple Pay Schedules:**
- System supports simultaneous payroll runs for employees on different schedules (field workers weekly, office staff bi-weekly) within the same company

### 6. Out of Scope (for this epic)

- PTO accrual tracking and balance management — Future / HR module
- Union fringe contributions in final pay — Tier 2+
- Severance pay calculation — Future
- Off-cycle disbursement processing — E6 (Disbursement)
- Supplemental withholding computation — E5 (Tax Withholding); E4-5 only flags the item type

### 7. Example "Super Stories"

- As a PR Admin, I want to add a bonus to an employee's next payroll run as a separate supplemental line item so that it's correctly taxed and clearly visible in the earnings breakdown.
- As a PR Admin, I want to log a retroactive pay correction for a prior period and have it automatically included in the next run with an audit trail so that I don't need a spreadsheet workaround.
- As a PR Admin processing a termination, I want the system to tell me exactly when I'm required to pay the employee under their state's final pay law so that I don't miss the deadline.

### 8. Acceptance Criteria Themes

- Holiday and PTO pay appear as distinct labeled EarningsLine records — never merged with regular pay
- Supplemental pay items are flagged with supplemental wage type metadata for downstream E5 withholding treatment
- Retroactive adjustments entered by admin appear in the next scheduled or off-cycle run as discrete labeled lines with the original period referenced
- Retroactive adjustments are retained in the audit log with entry user, timestamp, original period, amount, and reason
- When an employee is terminated, the system surfaces final pay timing requirement for the work state within the termination workflow — before payroll is closed
- Final pay timing alerts are sourced from tax jurisdiction provider data, not hardcoded — updatable without code release
- Multiple pay schedules (e.g., weekly field + bi-weekly office) can run concurrently without interference

### 9. Dependencies & Risks

**Dependencies:**
- OQ-3: Final pay interaction with E6 (Disbursement) for off-cycle payment must be resolved — admin needs a path from "final pay alert" to "off-cycle ACH" (cross-PRD dependency)
- OQ-4: Supplemental wage withholding flag — E5 team must confirm they consume the supplemental type indicator correctly
- Tax jurisdiction provider: source of final pay rules by state — same vendor dependency as E4-4
- Employee termination event: must be surfaced from Employee Management (E2) to trigger final pay prompt

**Risks:**
- Final pay timing rules change frequently; stale data creates legal exposure — vendor SLA on rule updates required
- Retroactive pay OT interaction: if retro amounts push the employee's effective hourly rate above threshold in the original period, the correct treatment is ambiguous — requires legal guidance (⚠️ flagged in PRD)
- Admin UX complexity: supporting 5+ pay types in a single earnings panel risks cognitive overload — design must prioritize clarity

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Supplemental and retro pay items correctly labeled and isolated from regular pay | 100% |
| Final pay alerts surfaced at termination | 100% of termination events in covered states |
| Payroll correction rate (retro adjustments as % of total runs) | Baseline tracked post-GA |
| Admin-reported retro pay errors | 0 critical (incorrect amounts or missing records) |

### 11. Assumptions

- Holiday designation (which days are holidays) is configured at the company or pay-period level, not auto-populated from a public calendar
- PTO accrual balances are managed outside this epic; admin enters PTO hours to pay out manually
- Retro adjustments do not retroactively recalculate OT for the original period — the correction amount is an additive earnings line in the current run
- Final pay timing only surfaces a prompt and required date; the actual off-cycle run is initiated through E6 (Disbursement)

---

---

## Epic E4-6 — Payroll Earnings Summary & Admin Review

### 1. Goal / Outcome

Every payroll run produces a clear, auditable earnings breakdown for every employee: hours, rate, pay type, and gross amount per line, with the full calculation method visible for OT and WAOT scenarios. Admins can review and confirm gross pay before advancing to tax withholding, and CPAs can audit rate and calculation accuracy at any time after the run closes. This panel is the primary trust interface — the mechanism by which Prism earns confidence from admins who have been burned by opaque generic tools.

### 2. Primary Personas

- **PR Admin ("Overwhelmed Operator")** — primary reviewer; needs to understand and confirm gross pay before approving disbursement
- **Owner / Exec** — episodic; needs total gross payroll cost and OT summary at a glance
- **External CPA / Bookkeeper** — read-only; needs to trace each rate to each time entry and verify calculation methods

### 3. Business & PRD Drivers

- G1: Zero gross pay calculation errors — the summary panel is where errors surface before they become disbursements
- FR: Payroll Summary display (§3a); UC-10 (P0); earnings breakdown display requirements throughout §3a
- User Insight — Theme 2: "The Pay Stub as a Trust Artifact" — transparency in earnings builds trust with workforce and prevents disputes
- User Insight 1: Compliance Trap — admins need confidence that the calculation is correct; opacity destroys trust in the system
- User Insight 2: "I have no way to check that the right rate was used for each entry" — this panel directly resolves that pain

### 4. Problem / Rationale

Generic tools show a single gross pay number per employee. Construction admins cannot determine whether the right rate was applied, whether WAOT was triggered, or whether OT was correctly segmented — they simply have to trust the number. When it's wrong, they discover it at the worst possible moment (disbursement, tax filing, audit). The earnings breakdown panel transforms a black-box calculation into a transparent, reviewable record — enabling the admin to catch errors before they cost money, and giving CPAs and auditors the evidence trail they need.

### 5. In Scope

**Employee-Level Summary:**
- Total gross pay per employee for the payroll run
- Breakdown by pay type: Regular, Overtime (FLSA), Overtime (State), Weighted OT Premium, Double-Time, Holiday, PTO, Supplemental, Retroactive Adjustment
- Total hours per pay type

**Earnings Detail (Expandable Per Employee):**
- Each EarningsLine record: hours, rate applied, pay type, gross amount
- Rate source indicator: trade-matched vs. default fallback (with acknowledgment status)
- For WAOT: display rate buckets (each rate, hours, earnings), weighted average rate, and premium amount
- For state OT: display which state rule triggered the premium

**Pre-Run Review Panel (Alpha → GA):**
- Unflagged entries (no rate match found) surfaced for admin acknowledgment before run proceeds
- Admin must explicitly confirm flagged entries before the run can advance
- System blocks advancement if any calculation required an unsupported state rule (GA)

**Run-Level Summary:**
- Total gross payroll by pay type (Regular total, OT total, DT total, Supplemental total, etc.)
- Total employees in run; total OT hours by type
- Status indicators: clean runs vs. runs with flagged entries or acknowledged exceptions

**Audit Trail:**
- Full earnings breakdown retained per employee per run, permanently
- Audit record: rate used, hours, pay type, calculation method, any exceptions acknowledged

**Alpha Scope:**
- Basic gross pay summary: employee name, total hours, rate, gross pay
- No OT breakdown (Alpha is mock run, single-rate only)

**Beta → GA evolution:**
- Progressive disclosure: summary view by default; expandable to full EarningsLine detail
- WAOT calculation detail panel added at Beta
- State OT rule attribution added at GA

### 6. Out of Scope (for this epic)

- Pay stub generation and employee-facing views — E7 (Pay Stubs)
- GL posting and job cost allocation display — E9 (Prism Accounting Integration)
- Tax withholding and net pay display — E5 (Tax Withholding)
- Disbursement confirmation — E6

### 7. Example "Super Stories"

- As a PR Admin, I want to review each employee's earnings breakdown — showing every rate, hours, and pay type — before I approve the payroll run so that I can catch errors before money goes out.
- As a PR Admin, I want to see which time entries fell back to the default rate so that I can decide whether to correct the trade assignment or acknowledge the default.
- As an External CPA, I want read-only access to the full earnings detail for any payroll run so that I can verify gross pay calculations support the correct GL entries and tax treatment.
- As an Owner, I want a run-level summary showing total regular pay, total OT, and total supplemental pay so that I understand the full cost of each payroll run before disbursement.

### 8. Acceptance Criteria Themes

- Admin can view every employee's earnings broken down by: hours, rate, pay type, and gross amount — not just a total
- WAOT calculation detail (rate buckets, weighted rate, premium) is visible in the earnings breakdown for any employee where WAOT was applied
- Flagged entries (rate fallbacks, unresolved state rules) are surfaced in the pre-run review panel and cannot be bypassed silently
- Full earnings breakdown is permanently retained per run and accessible to CPA role in read-only mode at any time post-run
- Run-level summary shows gross totals segmented by pay type (Regular / OT / DT / Holiday / Supplemental / Retro)
- Admin can expand from run summary → employee summary → individual EarningsLine detail in a single view
- At Alpha: basic gross pay per employee visible; OT and multi-rate detail not required
- System response time for loading a payroll run earnings summary for 100 employees: <5 seconds

### 9. Dependencies & Risks

**Dependencies:**
- E4-1 through E4-5 must produce well-structured EarningsLine records for this panel to display — all upstream calculation epics are dependencies
- E5 (Tax Withholding) is a downstream consumer; this panel closes before E5 runs — handoff sequence must be defined
- Role-based access: Admin can view rates; Supervisor role cannot (NFR per §3b) — RBAC from Security epic

**Risks:**
- Progressive disclosure UX complexity: displaying WAOT detail clearly for a non-accountant admin is a significant design challenge — requires UX investment and testing
- "Friday Crunch" timing: if the earnings summary takes >30 seconds for large runs, it becomes a bottleneck — performance requirement must be met
- Permanent audit retention creates storage and data lifecycle considerations — must be scoped with engineering

### 10. Success Metrics / KPIs

| Metric | Target |
|--------|--------|
| Payroll runs where admin reviews earnings breakdown before approval | Baseline tracked; goal >80% engagement |
| Payroll corrections initiated post-disbursement (preventable by review) | Trending toward 0 |
| `payroll_run_unlocked` events (run re-opened after submission due to calc error) | <1% |
| CPA / bookkeeper read-only access adoption | Tracked post-GA |

### 11. Assumptions

- Admin role sees pay rates; Supervisor role does not — RBAC enforcement is the responsibility of the Security & RBAC epic
- Audit retention period for earnings records follows applicable labor law retention requirements (typically 3 years for FLSA) — confirmed with legal
- The pre-run review panel and the post-run audit view are the same surface, differentiated by run status (open vs. closed)

---

---

## Traceability Table

| Requirement / Use Case ID | Description | Epic(s) |
|--------------------------|-------------|---------|
| UC-1 / FR: Trade-Based Rate Lookup | Resolve correct rate per time entry | E4-1 |
| UC-2 / FR: FLSA Overtime | 1.5× for hours > 40/week; workweek boundary | E4-2 |
| UC-3 / FR: WAOT | Weighted average OT for multi-rate workweeks | E4-3 |
| UC-4 / FR: State OT | All 50-state OT thresholds; higher-of logic | E4-4 |
| UC-5 / FR: Double-Time | 2× where required by state law | E4-4 |
| UC-6 / FR: Holiday & PTO | Holiday pay type; PTO payout | E4-5 |
| UC-7 / FR: Supplemental Pay | Bonuses, commissions as discrete line items | E4-5 |
| UC-8 / FR: Retroactive Pay | Prior-period corrections queued into next run | E4-5 |
| UC-9 / FR: Final Pay by State | Termination timing prompt per state law | E4-5 |
| UC-10 / FR: Earnings Breakdown | Admin-facing summary; rate audit trail | E4-6 |
| UC-11 / FR: Multiple Pay Schedules | Concurrent weekly + bi-weekly runs | E4-5 |
| NFR: Accuracy (2 decimal places) | Gross pay matches test vectors | E4-1, E4-2, E4-3, E4-4, E4-5 |
| NFR: Performance (<30s for 100 employees) | Calculation runtime | E4-2, E4-3, E4-4 |
| NFR: Auditability | Full earnings breakdown retained per run | E4-6 |
| NFR: Security (rate data Admin-only) | Role-based rate visibility | E4-6 |
| G2: Rate lookup accuracy | 100% entries matched or flagged | E4-1, E4-6 |
| G3: WAOT accuracy | 100% WAOT test vector compliance | E4-3 |
| G4: 50-state OT coverage | All states at GA | E4-4 |
| G5: Final pay obligations | Surfaced at termination | E4-5 |
| OQ-1: OT rule data — build vs. buy | Tax provider dependency | E4-4 |
| OQ-2: Bi-weekly workweek boundary | Legal confirmation needed | E4-2 |
| OQ-3: Final pay → off-cycle disbursement | E6 integration | E4-5 |
| OQ-4: Supplemental withholding flag | E5 handoff | E4-5 |

---

**Notes on Open Questions for Sprint Planning:**

- **OQ-1** (state OT data — build vs. buy) blocks E4-4 development path. This should be resolved in Sprint 1 before E4-4 is sized.
- **OQ-2** (bi-weekly workweek boundary) is a legal/compliance question that should be answered before E4-2 is finalized for Beta.
- **OQ-3** and **OQ-4** are cross-PRD handoff questions that affect E4-5 scope and should be resolved with the E5 and E6 teams in Sprint 2.
