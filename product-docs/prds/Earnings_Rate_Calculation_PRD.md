# PRD: Prism Construction Payroll — Earnings & Rate Calculation

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Tax Withholding & Deductions, Disbursement, Pay Stubs, Tax Filing, Prism Accounting Integration, Reporting & Audit, AI Assistance, Security & RBAC.*

---

# 1. Initiative Definition

### 1a. Overview

The Earnings & Rate Calculation module is the core computation layer that transforms approved time data into gross pay for every employee in a payroll run. It handles the construction-specific math that generic payroll tools cannot: trade-based rate lookup per time entry, FLSA and state-specific overtime, Weighted Average Overtime (WAOT) for multi-rate weeks, double-time, holiday and PTO pay types, final pay rules by state, and supplemental/retroactive pay. At Alpha, it powers a simplified mock payroll run using regular wages only. At Beta, it adds trade-rate selection, FLSA overtime, and multi-state support. At GA, it delivers full coverage across all 50 states and all pay types.

### 1b. Problem Statement

Generic payroll tools fail construction contractors on the two calculations that matter most: applying the right rate to the right hours, and calculating overtime correctly when rates vary. These are not edge cases — they are the normal reality for any construction crew.

Current failure modes:

- **Single-rate blind spot**: QuickBooks and Gusto assign one rate per employee. A framer who earns $30/hr on residential work and $45/hr operating a crane cannot be correctly paid in these tools without manual spreadsheet overrides
- **WAOT errors**: When an employee works at multiple rates in a single workweek and exceeds 40 hours, the overtime premium must be calculated on the *weighted average* regular rate — not the highest or most recent rate. Most SMB tools use a simpler (incorrect) method, creating FLSA liability
- **State OT ignorance**: State laws like California (daily OT after 8 hrs) and Alaska, Nevada, and Colorado (additional state rules) are unknown to generalist tools. Violations are discovered only during audits
- **Double-time blindness**: States and certain pay situations require double-time (2x); no generalist SMB payroll tool handles this natively
- **Final pay exposure**: Many states (CA, CO, MT, NV) require immediate payment of all wages upon termination. This is not tracked or enforced in generic tools

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Zero gross pay calculation errors for all covered pay scenarios |
| G2 | Correct rate applied to every time entry based on trade/cost code — no manual lookups |
| G3 | Accurate WAOT calculation for all multi-rate, multi-job workweeks |
| G4 | Full 50-state OT and pay type rule coverage at GA |
| G5 | Final pay obligations by state tracked and surfaced at termination |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Gross pay calculation errors (rate or OT) for covered scenarios | 0% | Quality |
| Trade-based rate lookup accuracy | 100% of time entries matched to correct rate | Quality |
| WAOT calculation accuracy (multi-rate workweeks) | 100% — **Inferred** | Compliance |
| State OT rules supported at GA | All 50 states | Coverage |
| Payroll runs requiring manual correction for rate/OT errors | <1% — **Inferred** | Operational |

### 1e. Out of Scope

- Tax withholding calculations (federal income tax, state, local) — Tax Withholding & Deductions PRD (E5)
- Pre/post-tax deductions, garnishments — E5
- Disbursement / ACH / check generation — Disbursement PRD (E6)
- Pay stub generation — E7
- Job cost allocation and GL posting — Prism Accounting Integration PRD (E9)
- Union CBA wage rates and fringe contributions — Tier 2+
- Prevailing wage / Davis-Bacon determinations — Tier 2+
- Benefits administration — Future

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **PR Admin** ("Overwhelmed Operator") | Owner or Office Manager | Payroll calculation is correct without manual verification of each rate | "I have no way to check that the right rate was used for each entry" | Desktop; weekly cadence |
| **Owner / Exec** | Business owner | Know total gross payroll cost before disbursement | No visibility into whether WAOT was applied | Desktop; episodic |
| **External CPA / Bookkeeper** | Retained accountant | Verify gross pay calculations support correct GL entries and tax filings | Can't trace which rate applied to which time entry | Desktop; read-only; periodic |

### 2b. User Journeys / Workflows

**Primary: Admin Initiates and Reviews Payroll Calculation**

```
Admin confirms time review complete (E3)
 │
 ├─ Admin clicks "Run Payroll" (or "Calculate" at Alpha)
 │
 ├─ System loads approved time entries for the pay period
 │
 ├─ For each time entry:
 │   └─ Looks up employee's pay rate for the matched trade/cost code
 │       └─ Applies rate to hours → regular pay line item
 │
 ├─ System evaluates overtime at workweek level:
 │   ├─ Total hours this week > 40 (FLSA) or state threshold?
 │   │   └─ [Yes] → calculate OT; if multi-rate week → calculate WAOT
 │   └─ State-specific rules applied (CA daily OT, etc.)
 │
 ├─ Applies additional pay types if applicable:
 │   ├─ Holiday pay (rate × hours if holiday designated)
 │   ├─ PTO payout (if applicable)
 │   └─ Supplemental / retroactive pay items (if queued)
 │
 ├─ Gross pay totals assembled per employee
 │   └─ Passes to E5 (Tax Withholding & Deductions) for net pay calculation
 │
 └─ Admin reviews payroll summary:
     ├─ Employee-level gross pay
     ├─ Earnings breakdown: regular / OT / DT / holiday / supplemental
     └─ Rate detail: which rate applied to which entries (expandable)
```

**Secondary: Admin Queues a Retroactive Pay Adjustment**

```
Admin identifies prior-period underpayment
→ Opens "Adjustments" panel → enters employee, amount, pay period, reason
→ System schedules retroactive amount in next payroll run (or off-cycle)
→ Retroactive item appears in earnings breakdown; audit logged
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Calculate regular gross pay using trade-based rate per time entry | P0 — Alpha |
| UC-2 | Calculate FLSA overtime (1.5x for hours > 40/week) | P0 — Beta |
| UC-3 | Calculate Weighted Average Overtime (WAOT) for multi-rate workweeks | P0 — Beta |
| UC-4 | Apply state-specific OT rules (CA daily OT, AK, NV, CO, etc.) | P0 — GA |
| UC-5 | Calculate double-time where required by state law | P0 — GA |
| UC-6 | Apply holiday and PTO pay types | P1 — GA |
| UC-7 | Process supplemental pay (bonuses, commissions) | P1 — GA |
| UC-8 | Process retroactive pay adjustments | P1 — GA |
| UC-9 | Apply final pay rules by state on termination | P1 — GA |
| UC-10 | Display earnings breakdown per employee (regular, OT, DT, supplement) | P0 |
| UC-11 | Support multiple pay schedules simultaneously (weekly + bi-weekly) | P1 — GA |

---

# 3. Requirements

### 3a. Functional Requirements

#### Trade-Based Rate Lookup

- The system shall determine the applicable pay rate for each time entry by matching the entry's trade type or cost code to the employee's configured rate schedule — **P0**
- The system shall use the most recent effective-dated rate valid for the time entry's work date — **P0**
- When no trade-specific rate is found for an entry, the system shall apply the employee's primary (default) rate and flag the entry for admin review — **P0**
- The system shall display which rate was applied to each time entry in the payroll run detail — **P1**

#### Regular Pay Calculation

- The system shall calculate regular gross pay as hours × applicable rate per time entry — **P0**
- The system shall aggregate pay at the employee level across all entries for the pay period — **P0**

#### Overtime — FLSA Standard

- The system shall calculate overtime at 1.5× the regular rate for all hours worked over 40 in a workweek, per FLSA — **P0** (Beta)
- The system shall calculate overtime at the *workweek* level, not the pay period level — **P0** (Beta)
- ⚠️ *Requires human review: for bi-weekly or semi-monthly pay periods that span multiple workweeks, the system must evaluate OT at each embedded workweek boundary — confirm with tax/compliance team*

#### Weighted Average Overtime (WAOT)

- When an employee works at two or more pay rates in the same workweek and total hours exceed 40, the system shall calculate the overtime premium using the FLSA-compliant weighted average regular rate method — **P0** (Beta)
- The weighted average regular rate shall equal: (sum of all regular earnings at each rate) ÷ (total hours worked at all rates) — **P0** (Beta)
- The OT premium applied shall be 0.5× the weighted average rate for each overtime hour — **P0** (Beta)
- The system shall display the WAOT calculation detail in the payroll run earnings breakdown — **P1**

#### State-Specific Overtime Rules (GA)

- The system shall apply state-specific overtime rules for all 50 states where they differ from federal FLSA — **P0** (GA)
- Minimum state OT rules to support at GA:
  - California: 1.5× after 8 hrs/day; 2× after 12 hrs/day; 1.5× for first 8 hrs on 7th consecutive day; 2× thereafter — **P0**
  - Alaska, Nevada: daily OT thresholds — **P0**
  - Colorado: daily OT rules — **P0**
  - All other state rules applied per current law — **P0** — *Inferred: requires tax provider data*
- The system shall distinguish between federal OT obligation and state OT obligation when both apply simultaneously, applying the higher standard — **P0** (GA)

#### Double-Time

- The system shall calculate double-time (2×) at the applicable rate where required by state law (California 12+ hr/day threshold; 7th consecutive day) — **P0** (GA)
- ⚠️ *Requires human review: identification of all states and scenarios triggering double-time obligation*

#### Holiday and PTO Pay

- The system shall support designation of a pay period's hours as Holiday pay, applying the correct rate and pay type label — **P1** (GA)
- The system shall support PTO payout at the employee's configured rate — **P1** (GA)

#### Supplemental and Retroactive Pay

- The system shall support addition of supplemental pay items (bonus, commission) to a payroll run, with separate line items in the earnings breakdown — **P1** (GA)
- The system shall support retroactive pay adjustments from prior periods, scheduled into the next regular or off-cycle run — **P1** (GA)
- Supplemental wage withholding rates (25% federal flat rate) shall be applied to supplemental pay items — **P0** (GA) — *Inferred, confirm with E5*

#### Final Pay by State (GA)

- The system shall track termination date and prompt the admin with final pay timing requirements when an employee is terminated — **P1** (GA)
- Final pay rules to surface: CA (immediate/next day), CO (next scheduled payday), MT, NV (immediate), and all other states — **P1** (GA) — *Inferred: requires tax provider data*
- ⚠️ *Requires human review: final pay obligation data — internal maintenance vs. tax provider*

#### Multiple Pay Schedules (GA)

- The system shall support simultaneous payroll runs for employees on different pay schedules (e.g., field workers weekly, office staff bi-weekly) within the same company — **P1** (GA)

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Accuracy** | Gross pay calculations must match expected output for all documented test vectors (regular, OT, WAOT, DT) to 2 decimal places |
| **Performance** | Payroll calculation for 100 employees completes in <30 seconds — *Inferred* |
| **Auditability** | Full earnings breakdown (rate, hours, pay type, calculation method) retained per employee per run |
| **Compliance** | OT calculations verified against FLSA and state DOL standards by legal/compliance before GA |
| **Security** | Pay rate data accessible to Admin only; Supervisor role cannot view pay rates |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| PayRate | employee_id, rate, rate_type (hourly/salary), trade_type, cost_code, effective_date | From Employee Management (E2) |
| TimeEntry | employee_id, work_date, hours, trade_type, cost_code, approval_status | From Time Collection (E3) |
| EarningsLine | payroll_run_id, employee_id, rate, hours, pay_type (regular/OT/DT/holiday/supplemental), gross_amount | Output of this module |
| OvertimeRule | state_code, rule_type (daily/weekly), threshold_hours, multiplier, effective_date | From tax/compliance data provider |
| RetroAdjustment | employee_id, amount, original_period, reason, scheduled_run_id | Admin-entered |

#### Integration Requirements

| System | Purpose | Trigger | Notes |
|--------|---------|---------|-------|
| Time Collection (E3) | Source of approved, coded time entries | On payroll run initiation | Internal — structured handoff |
| Employee Management (E2) | Source of pay rate schedules, effective dates | On payroll run initiation | Internal |
| Tax Withholding Engine (E5) | Receives gross pay per employee per pay type to calculate withholding | After earnings calculation completes | Internal — sequential |
| Tax Jurisdiction Provider | Source of state OT rules, final pay rules by state | Ongoing reference data | **Buy** — not built in-house |

#### Platform / Infrastructure Constraints

- WAOT and state OT logic must be versioned and auditable — law changes should update calculation rules without requiring code releases where possible
- ⚠️ **Requires human review**: Build vs. buy decision for OT rules engine — internal rule sets vs. tax provider (Symmetry/Vertex) OT data

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E4-1: Trade-Based Rate Lookup** | Dynamically select correct pay rate per time entry based on trade/cost code | G1, G2 | UC-1 |
| **E4-2: Standard Overtime Engine** | FLSA 40-hour weekly OT; workweek boundary logic | G1, G3 | UC-2 |
| **E4-3: WAOT Calculation** | Weighted average regular rate for multi-rate workweeks | G1, G3 | UC-3 |
| **E4-4: State OT & Double-Time Rules** | All 50-state OT rules; double-time thresholds; higher-of-federal/state logic | G1, G4 | UC-4, UC-5 |
| **E4-5: Additional Pay Types** | Holiday, PTO, supplemental, retroactive pay; final pay by state | G1, G5 | UC-6, UC-7, UC-8, UC-9 |
| **E4-6: Payroll Summary & Earnings Detail** | Admin-facing earnings breakdown per employee; rate audit trail | G1 | UC-10 |

### 3e. High-Level Acceptance Criteria

- Given an employee with two pay rates ($30/hr framing, $45/hr crane operation) who works 32 hrs framing and 12 hrs crane in a single workweek, the system calculates WAOT correctly: regular rate = (32×$30 + 12×$45) / 44 = $34.09; OT premium = 0.5 × $34.09 × 4 hrs = $68.18
- Given a California employee who works 10 hours in a single day, the system calculates 8 regular hours and 2 OT hours at 1.5× without admin configuration
- The system applies the trade-matched rate to 100% of time entries without requiring the admin to manually assign rates to entries
- When no trade-specific rate is configured for an entry's trade/cost code, the system applies the employee's primary rate and flags the entry — it does not silently error or use an incorrect rate
- Admin can view the full earnings breakdown for each employee in a payroll run: each line shows hours, rate, pay type, and gross amount
- Retroactive pay items appear as distinct labeled line items in the payroll earnings detail, not merged into regular pay
- The system blocks payroll finalization if any OT calculation required a state rule that is not yet supported (GA coverage), with a clear message to the admin

### 3f. Links to Prototypes

- Payroll Run Earnings Detail — [TBD]
- WAOT Calculation Reference — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- Regular gross pay calculation: hours × primary rate (single rate per employee)
- No OT calculation (mock run only; simplified)
- Mock payroll run output: gross pay per employee
- Sufficient fidelity to demonstrate the calculation flow end-to-end

**Beta (Trimble Dimensions)**
- Trade-based rate lookup: correct rate per time entry based on trade/cost code
- FLSA overtime (1.5× over 40 hrs/week)
- WAOT for multi-rate workweeks
- Multi-state withholding input fed from earnings (connects to E5)
- Broad state OT support (key states: CA, AK, NV, CO) — not full 50-state

**GA (Generally Available)**
- All 50 states OT and DT rules
- Holiday, PTO, supplemental, and retroactive pay types
- Final pay rules by state surfaced at termination
- Multiple simultaneous pay schedules
- Full earnings audit trail

---

# 5. Supporting Information

### 5a. Assumptions

- Pay rates are configured per employee per trade/cost code in Employee Management (E2) before payroll runs
- Time entries arrive with trade type and cost code attached (from E3); rate lookup depends on this coding
- The tax/compliance data provider (Symmetry/Vertex) provides or validates state OT rules; Prism does not maintain OT law tables in-house
- WAOT is always required when an employee works at multiple rates in the same FLSA workweek, regardless of pay period type

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Pay rate configuration in Employee Management (E2) | E2 team | **High** — rate lookup fails without configured rates |
| Approved, coded time entries from Time Collection (E3) | E3 team | **High** — no calculation without time data |
| State OT rules data (tax/compliance provider) | Engineering / Legal | **High** — GA completeness |
| Tax Withholding Engine (E5) — downstream consumer of gross pay | E5 team | **High** — sequential dependency |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| State OT rule data is incomplete or stale | Medium | High | License tax provider with OT rule coverage; do not maintain in-house | Yes — vendor selection |
| WAOT calculation has edge cases not caught in testing | Medium | High | Exhaustive test vector library; legal/compliance sign-off before Beta | Yes |
| Trade/cost code mismatch leaves entries without a rate (default rate applied) | High | Medium | Exception surfacing at payroll run; admin must acknowledge before proceeding | No |
| Final pay timing rules change mid-year | Low | High | Tax provider with regulatory updates; admin alert when rule changes for active employees | Yes |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Rate lookup fallback rate (entries defaulting to primary rate) | `rate_lookup_fallback` (trade_type, cost_code, employee_id) | Product |
| OT calculation frequency | `ot_calculated` (type: FLSA/WAOT/state) per run | Operations |
| Payroll correction rate (runs unlocked after submission due to calc error) | `payroll_run_unlocked` (reason) | Product |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Is OT rule data provided by the tax jurisdiction provider (Symmetry/Vertex), or must it be built internally? | Engineering / Legal | Sprint 1 |
| OQ-2 | For bi-weekly or semi-monthly pay periods spanning multiple workweeks: does the system evaluate OT at each embedded workweek boundary? | Legal / Compliance | Sprint 2 |
| OQ-3 | How does final pay calculation interact with E6 Disbursement for off-cycle immediate payment? | Product | Sprint 2 |
| OQ-4 | Does the system calculate supplemental wage withholding (flat 22% federal) or defer to E5? | Product / E5 team | Sprint 2 |
| OQ-5 | For Alpha mock run: what level of OT approximation is acceptable for the demo? | Product | Sprint 0 |
