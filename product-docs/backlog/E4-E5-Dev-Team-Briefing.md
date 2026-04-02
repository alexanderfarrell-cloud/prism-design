# E4 & E5 Payroll Calculation — Dev Team Briefing Guide

**Epics:** 681930 (Earnings & Rate Calculation — E4) | 681934 (Tax Withholding & Deductions — E5)
**Prepared:** March 5, 2026
**Author:** Aaron Jost

---

## Part 1 — How the Calculations Are Organized

### Gross Pay Calculation (E4 — Epic 681930)

The gross pay pipeline runs sequentially across four layers:

**Layer 1 — Rate Establishment (Features 683256, 683257)**

The foundation. Before any earnings can be calculated, the system must know what rate to apply.

- US-1/US-2/US-3: Build the trade type library and version employee pay rate schedules
- US-4: Define the pay period calendar (bi-weekly, monthly, etc.)
- US-5: Look up the employee's rate-by-trade for each time entry — this is the core pricing moment
- US-6: Handle fallback when no trade rate exists; block or warn rather than guess
- US-7: Run concurrent pay frequencies (e.g., hourly bi-weekly + salaried monthly) in the same payroll cycle

**Layer 2 — Overtime & Pay Type Calculation (Features 683258, 683246)**

Given hours and a rate, determine what the *actual* earnings are after OT and pay type rules:

- US-8: FLSA weekly OT (straight 1.5x after 40 hours, single rate)
- US-9: FLSA workweek boundary handling within bi-weekly periods
- US-10: Weighted Average OT Rate (WAOT) — the more complex multi-rate OT calculation
- US-12: Classify and price Holiday, PTO, Sick, Vacation pay types
- US-13/US-14: Apply state daily OT and double-time rules (California, Nevada, etc.)
- US-15: Higher-of logic — choose federal FLSA or state OT, whichever is greater; prevent double-counting
- US-16: Label which OT/DT rule was applied (compliance display)

**Layer 3 — Additional Earnings (Feature 683260)**

Non-time-entry earnings added to gross:

- US-19: Supplemental pay (bonuses, commissions) — flagged for flat-rate FIT withholding
- US-20: Retroactive pay adjustments — applied in current period, linked to prior period in the audit trail
- US-21: Final pay deadline enforcement upon termination — prompts admin before gross is finalized

**Layer 4 — Gross Pay Aggregation & Approval (Features 683261, 683262)**

These stories orchestrate and validate — they don't calculate:

- US-22: Sum all earnings components (regular, OT, PTO, supplemental, retro) into a single gross pay figure
- US-23: Deduplicate — prevent the same time entry from being counted twice
- US-24: Pre-calculation preview — admin can catch errors before committing
- US-26/US-27: Trigger calculation, display results with line-item drill-down
- US-28: Correct and recalculate (targeted, not full re-run)
- US-29: **Lock gross pay upon approval — this is the handoff point to E5**

---

### Gross-to-Net Calculation (E5 — Epic 681934)

E5 begins where E4 ends: **locked gross pay from US-29 is the input.** E5 then applies all withholdings and deductions to arrive at net pay.

**The Calculation Order — Defined by US-19 (Feature 683298)**

US-19 "Prioritize and Sequence Multiple Deduction Types" is the critical orchestrating story. It defines the statutory pipeline:

```
Gross Pay (from E4 — locked by US-29)
   ↓
Step 1: Calculate FIT (E5 US-1/US-2/US-3), State Income Tax (US-5/US-6/US-7), FICA (US-9)
         Taxes computed on gross pay
         — 401k traditional reduces FIT taxable wages but NOT FICA wages
         — Section 125 premiums (health/HSA/FSA) reduce BOTH FIT and FICA wages
   ↓
Step 2: Apply Pre-Tax Deductions (401k traditional — US-13, Health/HSA/FSA — US-14)
         These REDUCE the FIT and most state taxable wage bases
         IRS annual contribution limits enforced by US-15
   ↓
Step 3: Apply Post-Tax Deductions (Roth 401k — US-16)
         No tax impact; deducted from remaining net
   ↓
Step 4: Apply Garnishments (in federal priority order — US-17/US-18)
         Computed on disposable earnings (post-tax), capped by CCPA
   ↓
NET PAY
```

**Supporting calculations that run alongside (employer cost layer — never touch employee net pay):**
- US-4: YTD accumulators for FIT — prevent over-withholding for supplemental wages
- US-10/US-11/US-12: SS wage base, FUTA wage base, SUTA — employer costs
- US-15: IRS annual contribution limits — caps 401k, HSA, FSA before deductions apply
- US-20/US-21/US-22: WC estimation and burdened labor cost — employer cost display only

---

### What Is Not Explicitly a Story (Architectural Gaps to Flag)

| Gap | Description |
|---|---|
| Computation engine orchestration | No single story represents the runtime engine that chains E4 → E5. US-29 (lock gross) and the E5 deduction pipeline are logically connected but the engineering handoff isn't modeled as a story. Recommend a technical spike or architecture decision record. |
| Separate taxable wage bases | The system must maintain distinct taxable wage bases: federal FIT wages ≠ FICA wages ≠ state wages (CA/NJ don't recognize 401k or some Section 125 benefits as pre-tax). This is a data model decision, not a calculation rule. |
| Net pay display / check generation | No story covers the net pay stub or check/ACH generation. That likely lives in a downstream epic (E6/Payroll Disbursement), which will consume E5's output. |

---

## Part 2 — How to Frame This for the Development Team

### The Two-Epic Boundary — "Why Split Here?"

The most immediate question will be: *why are E4 and E5 separate epics?*

The answer is clean and architectural: **E4 owns everything that determines what an employee earned. E5 owns everything that determines what the employee takes home.**

- E4 = Gross Pay Engine. It ends with a locked, auditable gross pay figure per employee per pay run (US-29).
- E5 = Gross-to-Net Engine. It begins with that locked gross and applies all statutory withholdings and deductions to produce net pay.

This boundary is meaningful because the two epics have different compliance domains (labor law vs. tax law), different data dependencies, and could realistically be owned by different squads. The handoff between them is **US-29 (Lock Pay Run) → E5's deduction pipeline**.

---

### E4 Build Order — "What Do We Build First?"

E4 has a clear dependency chain. Build in this sequence:

| Order | Features | What It Does | Can Parallelize? |
|---|---|---|---|
| 1 | 683256, 683257 | Trade library, pay rate schedules, pay period calendar | No — everything depends on this |
| 2 | 683258, 683246 | FLSA OT, WAOT, state OT/DT, pay type classification | Partially — 683258 before 683246 |
| 3 | 683260 | Supplemental pay, retro, final pay | Yes — parallel with Layer 2 |
| 4 | 683261, 683262 | Aggregate to gross, validate, preview, approve, lock | No — integration point; depends on all above |

> **Note:** Feature 683259 (Shift Differential Processing) is deferred to 2027. It is tagged `[DEFERRED 2027]` in ADO and carries no stories. This was a deliberate scope decision, not an oversight.

---

### E5 Build Order — "Which Story Is the Anchor?"

In E5, **US-19 "Prioritize and Sequence Multiple Deduction Types" (683795) is the architectural anchor.** Every other E5 story is a module that plugs into a pipeline. US-19 defines the pipeline itself — the order in which FIT, FICA, pre-tax deductions, post-tax deductions, and garnishments are applied. Engineering needs to design that pipeline contract first.

Recommended E5 build sequencing:

| Order | Features | What It Does | Notes |
|---|---|---|---|
| 1 | 683294 | FIT withholding (2020+ and legacy W-4) | Most foundational; no upstream E5 deps |
| 2 | 683296 | FICA, FUTA, SUTA | Parallel with FIT |
| 3 | 683295 | State/local income tax + reciprocity | Builds on same taxable wage concepts |
| 4 | 683297 | Pre-tax deductions (401k, health/HSA/FSA, IRS limits) | Must correctly reduce FIT taxable wages |
| 5 | 683298 | Post-tax deductions + garnishments + sequencing pipeline | US-19 is the orchestrator; design first |
| 6 | 683299 | WC estimation + burdened labor cost display | Independent of employee net pay; can parallelize |

---

### Three Architectural Decisions Engineering Needs to Make Early

Get ahead of these — they will come up:

**A. Separate taxable wage bases per jurisdiction**

The system must maintain distinct taxable wage bases. Federal FIT wages ≠ FICA wages ≠ state wages. CA and NJ in particular do not recognize 401k traditional or some Section 125 benefits as pre-tax for state income tax. This means the engine must track *multiple wage bases simultaneously per employee per pay run* — not flow a single taxable wage value through the whole pipeline. This is a data model decision before it is a calculation decision.

**B. The E4 → E5 handoff data contract**

When E4 locks gross pay (US-29), what exactly does E5 receive? A structured payload needs to be defined — per employee, per earnings type, per trade, with supplemental pay flags, retro flags, and state/trade metadata attached. Recommend defining this as a written data contract before either team starts building E5 consumers. This is the most important cross-epic integration point in the product.

**C. YTD accumulator ownership and correction integrity**

Multiple E5 stories depend on YTD accumulators (FIT wages, SS wages, FUTA wages, 401k contributions, HSA, etc.). Engineering needs to decide: where do these accumulators live? How are they updated atomically with pay run approval? How does a corrected pay run (E4 US-28) ripple into YTD? This is a stateful data problem that touches almost every E5 feature and needs a clear answer before sprint work begins on FICA wage base (US-10) and IRS contribution limits (US-15).

---

### Open Questions to Assign Owners Before Sprint Planning

These are flagged in ADO comments on the relevant feature work items. They are not blockers for starting all stories, but each needs an owner and a resolution date before sprint work on the affected stories begins.

| Ref | Question | ADO Location | Blocks |
|---|---|---|---|
| OQ-2 | How do we handle bi-weekly periods where the FLSA 7-day workweek doesn't align cleanly with the period boundary? | Feature 683258, E4-US-9 | E4 US-9 sprint planning |
| OQ-3 | Where does deduction election configuration live — E2 (Employee Mgmt) or E5? | Feature 683297 | E5 US-13, US-14 |
| OQ-4 | CA/NJ don't recognize 401k or some Section 125 benefits as pre-tax for state tax — how do we manage per-state taxable wage variations? | Features 683295, 683297 | E5 US-5/US-6, US-13/US-14 |
| DG-3 | Final pay by state: which states need coverage at GA, and where do state-specific deadline rules get maintained? | Feature 683260 | E4 US-21 |

---

### The Non-Negotiable on Compliance

Frame this clearly for the team: **the correctness of this system is not a preference — it is a legal requirement.** FLSA violations, IRS under-withholding, incorrect garnishment priority, and CCPA cap breaches all carry regulatory and legal exposure for customers. This means:

- Tax rate tables (FIT, FICA, FUTA, state) must be **versioned, not hardcoded**
- OT and DT rules must be **versioned, not hardcoded**
- Every calculation must be **fully auditable** — the system must be able to reproduce exactly how any pay figure was derived, even years later
- "Good enough" approximations are not acceptable in this domain — the acceptance criteria in each story reflects the exact statutory behavior required

This does not mean over-engineer it. It means build it right the first time, because the cost of a retroactive payroll correction at scale is extremely high.

---

### One-Sentence Summary to Open the Meeting With

> *"We've organized the payroll calculation backlog into two sequential engines — E4 produces a locked gross pay figure per employee, and E5 transforms that gross pay into net pay through a defined statutory deduction pipeline — and every story maps to a specific calculation rule that has a legal basis we need to get right."*

---

## Quick Reference — Story ID Map

### E4 — Earnings & Rate Calculation (Epic 681930)

| Tag | ADO ID | Title | Feature |
|---|---|---|---|
| E4-US-1 | 683750 | Configure Trade Type Library | 683256 |
| E4-US-2 | 683751 | Create Multi-Rate Pay Schedule for Employee | 683256 |
| E4-US-3 | 683752 | Apply Effective-Date Versioning to Pay Rate Changes | 683256 |
| E4-US-4 | 683753 | Configure Company-Level Pay Period Schedule | 683257 |
| E4-US-5 | 683754 | Look Up Employee Pay Rate by Trade for a Time Entry | 683257 |
| E4-US-6 | 683755 | Apply Rate Fallback Logic When No Trade Rate Exists | 683257 |
| E4-US-7 | 683756 | Run Concurrent Pay Schedules for Multiple Pay Frequencies | 683257 |
| E4-US-8 | 683757 | Calculate FLSA Weekly Overtime for Single-Rate Employees | 683258 |
| E4-US-9 | 683758 | Evaluate Overtime Across Bi-Weekly Workweek Boundaries | 683258 |
| E4-US-10 | 683759 | Calculate Weighted Average Overtime Rate for Multi-Rate Workweeks | 683258 |
| E4-US-11 | 683760 | Display WAOT Calculation Breakdown for Payroll Admin | 683258 |
| E4-US-12 | 683761 | Classify and Apply Holiday, PTO, Vacation, and Sick Pay Types | 683258 |
| E4-US-13 | 683762 | Apply State Daily Overtime Rules | 683246 |
| E4-US-14 | 683763 | Apply State Double-Time Rules | 683246 |
| E4-US-15 | 683764 | Apply Higher-Of Federal vs. State OT Logic | 683246 |
| E4-US-16 | 683765 | Display State OT/DT Rule Applied Per Pay Run | 683246 |
| ~~E4-US-17~~ | — | ~~Shift Differential: Basic Rule~~ | ~~683259 — DEFERRED 2027~~ |
| ~~E4-US-18~~ | — | ~~Shift Differential: Multi-Shift in One Period~~ | ~~683259 — DEFERRED 2027~~ |
| E4-US-19 | 683766 | Process Supplemental Pay with Flat-Rate Withholding Flag | 683260 |
| E4-US-20 | 683767 | Process Retroactive Pay Adjustments | 683260 |
| E4-US-21 | 683768 | Prompt Final Pay Deadline Upon Employee Termination | 683260 |
| E4-US-22 | 683769 | Aggregate Earnings Components into Gross Pay | 683261 |
| E4-US-23 | 683770 | Prevent Duplicate Earnings Processing in a Pay Run | 683261 |
| E4-US-24 | 683771 | Display Pre-Calculation Earnings Summary for Admin Review | 683261 |
| E4-US-25 | 683772 | Export Earnings Audit Log | 683261 |
| E4-US-26 | 683773 | Trigger Gross Pay Calculation for a Pay Run | 683262 |
| E4-US-27 | 683774 | Display Pay Run Earnings Preview with Line Items | 683262 |
| E4-US-28 | 683775 | Allow Admin to Correct and Recalculate Pay Run Earnings | 683262 |
| E4-US-29 | 683776 | Lock Pay Run Earnings Upon Approval | 683262 |

### E5 — Tax Withholding & Deductions (Epic 681934)

| Tag | ADO ID | Title | Feature |
|---|---|---|---|
| E5-US-1 | 683777 | Calculate FIT Withholding Using 2020+ W-4 Elections | 683294 |
| E5-US-2 | 683778 | Calculate FIT Withholding for Legacy Pre-2020 W-4 Elections | 683294 |
| E5-US-3 | 683779 | Apply Supplemental Wage Flat-Rate FIT Withholding | 683294 |
| E5-US-4 | 683780 | Enforce YTD Wage Accumulators for FIT Withholding | 683294 |
| E5-US-5 | 683781 | Withhold Home State Income Tax Based on Residence | 683295 |
| E5-US-6 | 683782 | Withhold Work State Income Tax and Apply Reciprocity Rules | 683295 |
| E5-US-7 | 683783 | Calculate Local/Municipal Income Tax Withholding | 683295 |
| E5-US-8 | 683784 | Display Multi-State Tax Summary Per Employee Per Pay Run | 683295 |
| E5-US-9 | 683785 | Calculate Employee and Employer FICA (SS and Medicare) | 683296 |
| E5-US-10 | 683786 | Enforce Social Security Wage Base and YTD Accumulators | 683296 |
| E5-US-11 | 683787 | Calculate Federal Unemployment Tax (FUTA) with Credit Offset | 683296 |
| E5-US-12 | 683788 | Calculate State Unemployment Tax (SUTA) per Employee | 683296 |
| E5-US-13 | 683789 | Calculate and Apply 401(k) Traditional Pre-Tax Deduction | 683297 |
| E5-US-14 | 683790 | Calculate and Apply Health, Dental, Vision, HSA, FSA Deductions | 683297 |
| E5-US-15 | 683791 | Enforce IRS Annual Contribution Limits on Pre-Tax Deductions | 683297 |
| E5-US-16 | 683792 | Calculate and Apply Roth 401(k) Post-Tax Deduction | 683298 |
| E5-US-17 | 683793 | Apply and Sequence Multiple Garnishment Orders | 683298 |
| E5-US-18 | 683794 | Enforce CCPA Disposable Earnings Cap on Garnishments | 683298 |
| E5-US-19 | 683795 | Prioritize and Sequence Multiple Deduction Types | 683298 |
| E5-US-20 | 683796 | Estimate Workers Compensation Cost by Trade Classification | 683299 |
| E5-US-21 | 683797 | Calculate Multi-Trade WC Cost for Employees Working Multiple Trades | 683299 |
| E5-US-22 | 683798 | Display Fully Burdened Labor Cost Including WC Estimate | 683299 |
