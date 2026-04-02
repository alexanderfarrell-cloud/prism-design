# Multi-Variable Rates in Construction Payroll — Research Summary

> **Scope:** U.S. SMB Contractors | Non-Union | Non-Certified | Prism Payroll (Tier 1)
> *Created: Feb 23, 2026. Use as reference for features, stories, and PRD authoring.*

---

## System Architecture Context

Before the five questions, it is worth establishing the architecture — it shapes every answer:

```
Prism Accounting  ──────────────────────────────────────────────────┐
  (master source)                                                    │
  • Jobs                                                             │
  • Job Phases / Cost Codes                                          │
  • Chart of Accounts / GL                                           │
        │                                                            │
        │  Jobs + Phase Codes synced to                              │
        ▼                                                            ▼
   Traqspera                                         Prism Payroll
   (time collection)                                 (payroll engine)
   • Employee clocks in / enters time     ──────►   • Receives coded time
   • Selects Job + Phase Code                       • Looks up employee's
   • Identifies trade/work type                       trade rate table
   • Supervisor approves                            • Calculates gross pay
                                                    • Applies withholding
                                                    • Produces net pay +
                                                      job cost output
```

Jobs and Cost Codes are **mastered in Prism Accounting** — Traqspera and Prism Payroll consume them, they do not create them. This matters for how trade rates are configured and how time entries route to the correct rate.

---

## 1. What Is the Right Term for "Tasks" That Drive Different Rates?

**Recommended term for Prism: "Trade"**

In the Tier 1 (non-union, non-certified) context, rate variation is simpler than in higher tiers. There are no government wage determinations to manage, no CBA classifications to match. The primary reason a worker earns a different rate within the same pay period is: **they performed a different type of work**.

The industry uses several terms for this concept. Here is how they map in the Tier 1 context:

| Term | Common In | Tier 1 Relevance | Verdict |
|---|---|---|---|
| **Trade** | Construction HR, field supervisors | High — the natural language for "type of work performed" | **Use this** |
| **Pay Type** | Payroll systems, HR | High — the category of earning (Regular, OT, Holiday, PTO); answers "what *kind* of time?" | **Use this** — distinct from Trade |
| **Cost Code / Phase Code** | Accounting, job costing | High — but this is the *allocation* dimension, not the *rate* dimension; sourced from Prism Accounting | Separate concept |
| **Task** | Generic PM / software tools | Low — too generic; doesn't carry construction industry meaning | Avoid |
| **Wage Code** | Some payroll systems (Vista, Spectrum) | Medium — a payroll system internal label; not field-worker language | Use internally in system logic only |
| **Earnings Code** | Payroll engines (ADP, etc.) | Medium — the internal combination of Trade + Pay Type (e.g., REG-Carpenter); back-end label | Use internally in system logic only |
| **Labor Classification** | Union / prevailing wage | Low for Tier 1 — becomes relevant in Tier 2+ | Defer |
| **Job Title** | HR | Low for rate purposes — job title is static; trade changes shift by shift | Separate concept |

**Why "Trade" is the right term:**
- It is what field workers and foremen actually say ("What trade are you working today?")
- It describes *capability and rate* — what type of work can this person do, and what do we pay for it
- It is distinct from Cost Code, which comes from Prism Accounting and answers "where does this labor cost go?"
- It scales cleanly into Tier 2+ (union trade classifications, prevailing wage trade designations all use the same word)

**The key distinction to preserve across all stories and documentation:**

> **Trade** = *what work was performed* → determines the **base rate**
> **Pay Type** = *what kind of earning is it* → determines the **multiplier** (Regular = 1.0×, OT = 1.5×, etc.)
> **Job Phase / Cost Code** = *where the cost is allocated* → sourced from Prism Accounting, determines the **GL entry**

These three dimensions travel together on every earnings line but serve completely different purposes. Trade and Pay Type together produce the gross dollar amount; Job Phase routes that amount to the correct project account.

---

## 2. How Should This Be Captured in Prism Payroll?

For Tier 1, multi-variable rates are driven by three independent dimensions: **Trade**, **Pay Type**, and **Shift Differential**. Project location (prevailing wage) and union rules are out of scope.

### The Three Rate Dimensions

Every earnings line in Prism Payroll is the product of all three dimensions working together:

```
Hours × Trade Rate × Pay Type Multiplier (± Shift Differential) = Gross Line Item
```

| Dimension | Question It Answers | Who/What Determines It |
|---|---|---|
| **Trade** | *What work was performed?* | Worker selects on time entry; drives the base rate |
| **Pay Type** | *What kind of earning is this?* | System derives from hours worked + rules; drives the multiplier |
| **Shift Differential** | *Was a non-standard shift worked?* | System derives from clock-in/out times; adds a flat or % premium |

These are independent — a single worker on a single day can generate multiple earnings lines, each with a different Trade and Pay Type combination.

### Pay Type: The Nature of the Earning

Pay Type is the category that classifies *what kind of time was worked*. It is not the same as Trade (which is *what work was done*). The combination of Trade + Pay Type is what an **Earnings Code** represents internally.

| Pay Type | Description | Rate Effect | Notes |
|---|---|---|---|
| **Regular (REG)** | Standard straight-time hours | 1.0 × Trade Rate | Default for all hours below OT threshold |
| **Overtime (OT)** | Hours exceeding FLSA or state threshold | 1.5 × WAOT Regular Rate | Calculated at workweek level, not per entry |
| **Double Time (DT)** | Hours beyond state daily threshold | 2.0 × Regular Rate | CA, NV, and some other states; Tier 2+ for union |
| **Holiday (HOL)** | Company holiday — worked | Configurable (often 1.5×) | Company policy; not federally mandated for Tier 1 |
| **PTO / Vacation (VAC)** | Paid time off | Base rate; no trade rate applies | Does not contribute to OT hour count under FLSA |
| **Sick (SICK)** | Paid sick leave | Base rate; same as PTO | State-mandated in many states |
| **Bonus** | Non-hourly, discretionary payment | Flat dollar amount | Must be included in WAOT regular rate calculation if non-discretionary |
| **Per Diem** | Travel/living allowance processed through payroll | Flat dollar; not a wage | No OT impact; different tax treatment |

**Key rule:** PTO, Vacation, and Sick hours are paid but do *not* count toward the 40-hour FLSA overtime threshold. Only hours *worked* count toward OT. This is a common payroll error.

### How Trade + Pay Type Combine into an Earnings Code

The Earnings Code is the back-end system label that represents the intersection of both dimensions. Workers and admins never see it directly — it lives in the payroll engine, pay stubs, and audit reports.

```
Trade: Carpenter          + Pay Type: Regular   → Earnings Code: REG-Carpenter    → $30.00/hr × 1.0
Trade: Crane Operator     + Pay Type: Regular   → Earnings Code: REG-Crane        → $45.00/hr × 1.0
Trade: Carpenter          + Pay Type: Overtime  → Earnings Code: OT-Carpenter     → WAOT × 1.5
Trade: General Labor      + Pay Type: Holiday   → Earnings Code: HOL-GenLabor     → $26.00/hr × 1.5
Trade: (none)             + Pay Type: Vacation  → Earnings Code: VAC              → Base rate × 1.0
```

This is what makes a Tier 1 construction pay stub look complex — a single worker can have 5–6 distinct earnings lines in a single pay period, each the result of a different Trade + Pay Type combination.

### Pay Type Lifecycle — Who Applies It and When

This is the part that trips people up. Pay Types are not all selected at the same moment or by the same person. They enter the system through **four completely different mechanisms** depending on which type it is.

#### Mechanism 1: Regular — Applied at Time Entry, Implicitly, by the Worker

Every labor line on a Traqspera timesheet is Regular by default. The worker does not check a box or select "Regular" from a dropdown — they just enter hours. The system treats every labor hour as REG unless something downstream overrides it. Traqspera's crew entry documentation confirms this explicitly: "regular (Reg) hours update automatically" when start and end times are entered.

```
Field:   Aaron enters → Job 101 | Phase: Framing | Wage Code: Carpenter | 8 hrs
System:  Assumes Pay Type = REG automatically
         No selection required. No decision made by Aaron.
```

#### Mechanism 2: PTO / Vacation / Sick — Applied Before Time Entry, by Employee + Manager

These never touch the labor timesheet. The employee submits a Time Off Request in Traqspera, the manager approves it, and the approved record flows to Prism Payroll **already tagged with the Pay Type**. By the time it reaches the payroll engine it already says "8 hours of PTO" — no derivation needed.

```
Employee  →  Submits: "I need Friday off — Vacation"
Manager   →  Approves in Traqspera Time Off Requests module
Traqspera →  Creates record: Employee | Date | 8 hrs | Pay Type: VAC
Prism     →  Receives it pre-tagged
              Notes: these 8 hrs do NOT count toward the 40-hr OT threshold
```

**Critical rule:** PTO/Vacation/Sick hours are paid but do not count as hours *worked* under FLSA. A worker who takes Monday off (PTO) and works 40 hours Tuesday–Saturday has 40 OT-eligible hours, not 48. The payroll engine must exclude pre-tagged time-off hours from the OT accumulation count.

#### Mechanism 3: Overtime — Applied After the Pay Period Closes, by the Payroll Engine

Nobody selects OT. Not Aaron. Not his foreman. Not the payroll admin. The payroll engine determines it automatically after the pay period closes by accumulating the full week's hours and applying the OT threshold rules.

```
Mon–Fri:    Aaron enters 8 hrs/day = 40 hrs
            All entered as REG. None flagged OT. Correct at entry time.

Saturday:   Aaron enters 4 hrs
            Entered as REG. Still not flagged. Still correct at entry time.

Pay period closes — Prism runs the OT calculation pass:
  Step 1: Accumulate all approved hours for Aaron this week
          Labor hours: 44  |  PTO hours: 0  |  OT-eligible hours: 44
  Step 2: Apply OT threshold: 44 − 40 = 4 OT hours
  Step 3: Identify which hours are OT (the last 4 hours of the week)
  Step 4: Calculate WAOT across all wage codes Aaron worked this week
  Step 5: Post OT premium as a separate earnings line

⚠️  Aaron entered everything as Regular.
    The payroll engine reclassified 4 hours as OT.
    Aaron never knew. Never chose. Never needed to.
```

This is why **Prism Payroll cannot process time entries in real-time one line at a time.** It must hold all time entries for the full workweek before it can determine which are Regular and which are OT. The "pay period close" triggers the OT calculation pass.

#### Mechanism 4: Bonus, Per Diem, Commission — Applied During the Pay Run, by the Payroll Admin

These are entered directly by the payroll admin when running payroll — not from time entries at all. The admin adds a flat dollar amount or hours, assigns the Pay Type, and attaches it to the employee for that pay period.

```
Payroll Admin opens Aaron's pay run
  Clicks [+ Add Earning]
  Pay Type: Bonus | Amount: $500 | Reason: Project completion
  Saved → appears on Aaron's pay stub as a separate line
```

#### Holiday — The Special Case

Holiday can work either way depending on Prism configuration:

```
Option A — Engine-driven (preferred):
  Aaron enters 8 hrs on Dec 25 (Christmas)
  Prism checks: is Dec 25 on the company holiday calendar? → Yes
  Prism reclassifies: Pay Type = HOL → applies configured holiday rate
  Aaron selected nothing. Same automatic logic as OT.
  Requires: story 681118 (Company Holiday Calendar) to be configured.

Option B — Foreman-explicit:
  Foreman enters crew time and selects "Holiday" from a Pay Type field
  Travels to Prism already tagged
  Prism applies the holiday rate from the Pay Type Library
```

Option A is better UX and less error-prone. It requires the company holiday calendar (story 681118) to be set up — that setup is what makes automatic holiday Pay Type detection possible.

#### The Complete Map

| Pay Type | Applied When | Applied By | How |
|---|---|---|---|
| **Regular (REG)** | At time entry | No one — implicit default | Every labor line is Regular unless overridden downstream |
| **Overtime (OT)** | After pay period closes | Payroll engine | Accumulates weekly hours, identifies hours over threshold, applies WAOT |
| **Double Time (DT)** | After pay period closes | Payroll engine | Same as OT; triggered by state daily threshold (e.g., CA 12+ hrs/day) |
| **Holiday (HOL)** | At OT calculation pass | Payroll engine (Option A) or Foreman (Option B) | Detects date against holiday calendar; applies configured premium |
| **PTO / Vacation (VAC)** | Before time entry | Employee + Manager | Time Off Request → approved → flows pre-tagged; excluded from OT count |
| **Sick (SICK)** | Before time entry | Employee + Manager | Same as PTO |
| **Bonus** | During pay run | Payroll Admin | Manually added as flat dollar or hours directly in the pay run |
| **Per Diem** | During pay run | Payroll Admin | Same as bonus; different tax treatment |

#### The Four-Stage Timeline

```
BEFORE THE WEEK STARTS  →  Employee/Manager submit and approve PTO/Sick/Vacation
                            Pay Type assigned at request time

DURING THE WEEK         →  Worker enters hours against Job + Phase + Wage Code
                            Pay Type = Regular (implicit; no selection)

WHEN THE WEEK CLOSES    →  Payroll engine runs the calculation pass:
                              • Accumulate hours (excluding pre-tagged time off)
                              • Apply OT threshold → reclassify OT hours
                              • Check holiday calendar → reclassify Holiday hours
                              • Calculate WAOT across all trade rates
                              • Post OT premium as separate earnings line

DURING THE PAY RUN      →  Payroll Admin adds Bonus, Per Diem, corrections
                            Pay Type assigned explicitly by admin
```

QuickBooks and Gusto handle the first and last stages adequately. What they cannot do is the third stage — the automatic calculation pass that correctly identifies OT hours across multiple trade rates and applies WAOT. That is the construction payroll differentiator.

### Where Do Rates Live — The Data Model

This is the most important architectural question for multi-variable rate payroll. There are three possible approaches; Prism Payroll uses a **hybrid of A and C**:

**Option A — Rate lives on the Employee's Pay Rate Table (per-employee)**
Each employee stores their own rate for each trade. Aaron the Plumber earns $40/hr; Bob the Plumber earns $38/hr. Both rates are independent records on their respective employee profiles.

**Option B — Rate lives on the Company's Trade Library (company-wide)**
The company sets one rate per trade that applies to every worker who performs that trade. No individual variation. This is the union model (everyone on a CBA earns the same classified rate) — not appropriate for non-union Tier 1.

**Option C — Hybrid: Company Trade Library holds a default; employee can override**
The Trade Library stores an optional default rate per trade. When an admin adds a trade to an employee, the rate field is pre-filled with that default — the admin confirms or changes it. The employee-level rate is what actually gets used by the payroll engine.

**Prism Payroll uses Option C (hybrid):** Option A as the authoritative source; Trade Library default as a UX convenience. This is the right approach because:
- Non-union contractors negotiate pay individually — two plumbers on the same crew routinely earn different rates based on experience and tenure
- Company-wide rates (Option B) only work in union shops where a CBA sets the scale
- Pre-filling from a Trade Library default (Option C enhancement) reduces admin data entry without removing per-employee flexibility

**The data model:**

```
Company Trade Library (681104)
  ├── Trade Name: "Plumber"
  ├── Default Rate: $40.00/hr    ← optional; used only to pre-fill employee setup
  ├── WC Code: NCCI-5183
  └── Status: Active

Employee Pay Rate Table (681604) — THE AUTHORITATIVE SOURCE
  ├── employee_id:    Aaron
  ├── trade:          Plumber
  ├── rate:           $40.00/hr  ← pre-filled from Trade Library default; admin confirmed
  └── effective_date: 01/01/2025

  ├── employee_id:    Bob
  ├── trade:          Plumber
  ├── rate:           $38.00/hr  ← admin changed the pre-filled default for Bob
  └── effective_date: 01/01/2025
```

**Rate lookup priority at payroll calculation time:**

```
Time entry received: Employee = Aaron | Trade = Plumber | 8 hrs

Step 1: Look up Aaron's Pay Rate Table
Step 2: Find row where trade = "Plumber" AND effective_date <= pay period date
Step 3: Rate found → $40.00/hr → use this rate
Step 4: If NO matching trade row found → fall back to Aaron's Primary/Base Rate

⚠️ The Payroll engine NEVER looks at the Trade Library for a rate.
   The Trade Library default is only used during employee setup to pre-fill the UI.
```

**What this means for the admin experience:**

```
Admin adds Aaron → Step 3: Job Role & Pay
  Clicks [+ Add Trade Rate]
  Selects trade: "Plumber"
    → System pre-fills rate field: $40.00/hr  (from Trade Library default)
    → Admin can accept or type a different amount
  Enters effective date: 01/01/2025
  Clicks Save → rate saved to Aaron's Pay Rate Table at $40.00/hr

Admin adds Bob → Step 3: Job Role & Pay
  Clicks [+ Add Trade Rate]
  Selects trade: "Plumber"
    → System pre-fills rate field: $40.00/hr  (same Trade Library default)
    → Admin changes to: $38.00/hr  (Bob is less experienced)
  Enters effective date: 01/01/2025
  Clicks Save → rate saved to Bob's Pay Rate Table at $38.00/hr
```

### Company-Level Setup

Configured by the PR Admin once; maintained ongoing.

| Setup Task | What It Defines | Notes |
|---|---|---|
| Trade Library | Master list of valid trades (Carpenter, Electrician, Crane Operator, Forklift Operator, General Labor, etc.) | Company-specific; admin creates and manages; used in time entry and pay rate mapping |
| Jobs + Phase Codes | Pulled from Prism Accounting — not entered in Prism Payroll | Cost allocation codes; time entries coded to them route labor costs to the correct GL accounts |
| Pay Frequency | Weekly / bi-weekly / semi-monthly | Weekly is standard for construction field workers |
| Overtime Rules | FLSA 40-hour weekly threshold minimum; state daily OT rules where applicable | In Tier 1, this is the primary OT complexity — no CBA double-time rules to manage |
| Shift Differentials (optional) | Night shift premium, weekend premium | Additive modifiers on top of the trade rate |
| Workers' Comp Code Table | WC classification code per trade | Different trades carry different risk levels and WC premium rates |

### Employee-Level Setup

Configured per worker during onboarding.

| Setup Task | What It Captures | Notes |
|---|---|---|
| Primary Pay Rate | Default hourly rate — used when no trade-specific rate is assigned | Required; must exist before employee is payroll-ready |
| Trade Rate Assignments | One rate per trade, with effective date | 1-to-many relationship; e.g., $30/hr Framing, $45/hr Crane Operation, $28/hr General Labor |
| WC Classification Code | Per trade, if the employee works multiple trades | Ensures correct WC premium per type of work performed |
| Multi-state Withholding | Home state + any work states | SMB contractors frequently cross state lines; a Tier 1 complexity even without union/prevailing wage |

### How the Rate Is Selected at Calculation Time

```
Time Entry: Employee A | Job 101 | Phase: Framing | 8 hrs | Tuesday

Payroll engine lookup:
  → Employee A has a rate for trade "Framing" → $30.00/hr
  → 8 hrs × $30.00 = $240.00 gross (this time entry)

Time Entry: Employee A | Job 101 | Phase: Crane Op | 4 hrs | Thursday

  → Employee A has a rate for trade "Crane Operation" → $45.00/hr
  → 4 hrs × $45.00 = $180.00 gross (this time entry)

End of workweek: Employee A worked 44 hrs total
  → OT threshold exceeded by 4 hrs
  → Must calculate Weighted Average Overtime Rate (WAOT) across both rates
  → WAOT = ($240 + $180 + other straight-time earnings) ÷ 44 total hrs
  → OT premium = 0.5 × WAOT × 4 OT hours
```

The WAOT calculation is what generic payroll systems (QuickBooks, Gusto) fail at — they assume a single rate per employee. It is a core Tier 1 requirement for Prism Payroll.

---

## 3. How Is This Captured for a Worker — Through Traqspera?

Traqspera is the origination point for all rate-determining data. Here is the full flow in the Prism ecosystem.

### What the Worker Does in Traqspera

| Step | Action | Data Captured |
|---|---|---|
| 1 | Opens Traqspera app (mobile) or web | — |
| 2 | Selects the Job | Job code (from Prism Accounting) |
| 3 | Selects the Phase Code | Cost code (from Prism Accounting) → drives job cost allocation |
| 4 | Identifies the trade / type of work | Trade → drives pay rate lookup in Prism Payroll |
| 5 | Enters hours (or clocks in/out) | Hours → the quantity multiplied against the rate |
| 6 | Submits; supervisor reviews and approves | Approved timesheet |
| 7 | Traqspera syncs to Spectrum | Coded time data passes to payroll |

### Integration Finding: Traqspera Carries a Wage Code Field

Traqspera's 2026 R1 release notes confirmed that timesheets include a **Wage Code** field on both individual and crew time entries, separate from Job and Phase Code. Wage Code is Traqspera's (and Spectrum's) term for what Prism calls "Trade."

This resolves the earlier open question: Prism Payroll does **not** need to derive trade from Phase Code or maintain a Phase Code → Trade mapping table. The time entry itself carries the trade designator.

**Terminology bridge:**

| Traqspera / Spectrum | Prism Payroll | Meaning |
|---|---|---|
| Wage Code | Trade | Type of work performed; drives rate lookup |
| Phase Code | Job Phase / Cost Code | Cost allocation; sourced from Prism Accounting |
| Reg Hours | Regular Pay Type | Standard straight-time hours |
| Time Off Type | Pay Type (VAC / SICK / PTO) | Pre-tagged time off from Time Off Request module |

**What this means for the integration design:**

```
Traqspera time entry fields:
  Employee ID     → identifies whose rate table to look up
  Job             → sourced from Prism Accounting; for job cost posting
  Phase Code      → sourced from Prism Accounting; for GL allocation
  Wage Code       → maps to Trade in Prism; drives the rate lookup
  Hours           → quantity multiplied against the rate

Prism Payroll receives all four identifiers and can cleanly execute:
  Employee + Wage Code  → look up rate from Pay Rate Table
  Job + Phase Code      → post labor cost to correct GL account in Prism Accounting
```

Phase Code and Wage Code still do not always align one-to-one — a single Phase Code of "Framing" can be worked by a Carpenter, an Ironworker, and a Laborer at three different rates — but because Wage Code travels separately with the time entry, Prism does not need to guess. Each line carries its own rate key.

### Traqspera Time Collection Modes

| Mode | Best For | How It Works |
|---|---|---|
| **Timesheet** | Flexibility; summary reporting; office + mixed workers | Employee enters daily or weekly hour totals per job/phase; no real-time tracking |
| **Clock-In / Clock-Out** | Precise time capture; field crews; shift differential detection | Real-time punches; geofencing available to verify on-site presence; prevents buddy punching |

For Tier 1 SMB field crews, clock-in mode is the stronger choice — it captures start/stop times needed to detect shift differentials and gives supervisors real-time visibility.

### Approval Workflow

```
Worker submits timesheet
      │
      ▼
Field Supervisor reviews → approves or rejects with comment
      │
      ▼
Payroll Admin reviews → approves for payroll processing
      │
      ▼
Prism Payroll receives locked, approved time data
```

Multi-level approval is non-negotiable for data integrity — errors at this stage cascade through every downstream calculation (gross pay, OT, deductions, job costing, tax filings).

---

## 4. How Does This Incorporate into Company Setup and Employee Setup?

### Company Setup

```
Prism Accounting (source of truth)
  ├── Jobs (active project list)
  └── Job Phases / Cost Codes (per job)
        │
        │ Synced into
        ▼
Prism Payroll Company Config
  ├── Trade Library
  │     └── Carpenter | Electrician | Crane Operator | Forklift | General Labor | ...
  ├── Trade → WC Code mapping
  │     └── Carpenter → NCCI 5651 | Crane Operator → NCCI 5223 | ...
  ├── Overtime Rules
  │     └── Federal FLSA: 40 hrs/week → 1.5x
  │         State rules layered on top (CA daily OT, etc.)
  ├── Shift Differential Rules (if applicable)
  │     └── Night shift: +$2.50/hr | Weekend: +$3.00/hr
  └── Pay Frequency
        └── Weekly (standard for field crews)
```

### Employee Setup — Step 3: Job Role & Pay (from the 7-step onboarding wizard)

```
Step 3: Job Role & Pay
  ├── Job Title (static label — "Carpenter", "PM", "Equipment Operator")
  ├── Employee Role (Field / Office / Mixed)
  ├── Primary Pay Rate → $28.00/hr [required]
  ├── Trade Rate Assignments [+ Add Rate]
  │     ├── Framing → $30.00/hr (effective 01/15/2025)
  │     ├── Crane Operation → $45.00/hr (effective 01/15/2025)
  │     └── General Labor → $26.00/hr (effective 01/15/2025)
  └── WC Classification Code
        ├── Auto-suggested based on Job Title
        └── Can vary by trade if employee works multiple trades
```

### Runtime Calculation Flow

When a Traqspera time entry arrives in Prism Payroll:

1. Prism Payroll reads: `Employee ID + Trade (or Phase Code) + Hours + Date`
2. Looks up the employee's rate table → finds the rate for that trade as of that date
3. Applies company-level OT rules to determine if hours are regular or overtime
4. Applies any shift differential if clock-in/out times fall in a differential window
5. Accumulates toward the weekly WAOT calculation
6. Posts the labor cost back to Prism Accounting against the Job + Phase Code

### Ongoing Maintenance Triggers

| Event | Action Required |
|---|---|
| Employee gets a raise on a specific trade | Add new rate with new effective date; system retains history |
| Employee gains a new skill / trade | Add new trade rate to their profile |
| Employee moves to a new state | Update withholding; check for new work-state obligations |
| Company adds a new trade type | Add to company Trade Library; becomes available for rate assignment |
| New Job Phase added in Prism Accounting | Syncs automatically into Traqspera and Prism Payroll |

---

## 5. Glossary — Tier 1 Focused, Prism-Aware

Use these definitions consistently across features, stories, and documentation. Terms are scoped to Tier 1 (non-union, non-certified) unless otherwise noted.

---

**Base Pay Rate**
The default hourly rate for an employee, used when no trade-specific rate has been assigned for the work being performed. Every employee must have one before they are payroll-ready. Also called: primary rate, default rate.

**Blended Rate** — see *Weighted Average Overtime Rate (WAOT)*

**Cost Code** — see *Job Phase / Phase Code*

**Earnings Code**
The internal payroll system label for a specific compensation line item (e.g., `REG-Carpenter`, `OT-Crane`, `SHIFT-NIGHT`). Carries the dollar rate and the pay type. The back-end field in Prism Payroll where the rate actually lives. Not directly exposed to field workers or admins in most UI flows — surfaced on pay stubs and audit reports.

**Effective Date**
The date on which a rate change takes effect. All pay rate assignments in Prism Payroll carry an effective date. The system uses the rate that was effective on the date work was performed, not the current date.

**Employee Role**
A classification of where an employee primarily works: Field (job site), Office, or Mixed. Drives expectations around time tracking (field workers are more likely to need mobile time entry and multi-state withholding), workers' comp classification, and job site assignment prompts. Distinct from Job Title.

**FLSA (Fair Labor Standards Act)**
The federal law that establishes minimum wage, overtime pay, and recordkeeping requirements. For Tier 1, the primary FLSA requirement is overtime at 1.5x the regular rate for all hours over 40 in a workweek. States may have additional or stricter rules layered on top.

**Job**
A unique identifier for a specific construction project or contract (e.g., Job 2024-101). Mastered in Prism Accounting. Used in Traqspera time entries for job cost allocation. May also flag whether a project has specific wage requirements (relevant in Tier 2+).

**Job Costing**
An accounting method that tracks all project costs (labor, materials, subcontractors, equipment) at the level of individual jobs and phases. In Prism, job costing data originates from Prism Payroll's labor cost output, posted back to Prism Accounting against the Job + Phase Code from each time entry.

**Job Phase / Phase Code**
A subdivision of a Job representing a specific scope of work or project phase (e.g., "Framing," "Electrical Rough-In," "Foundation"). Mastered in Prism Accounting, synced to Traqspera for time entry selection. The primary cost allocation dimension in time entries — it determines which GL account labor costs are posted to. Industry equivalent: Cost Code.

**Labor Burden**
The total cost of an employee to the company beyond their gross wage. Includes: employer share of FICA (7.65%), FUTA, SUI, and workers' compensation insurance premiums. The fully burdened labor rate — gross wage + labor burden — is what appears in job cost reports to show the true cost of labor per project.

**Overtime (OT)**
Additional pay required by law for hours worked beyond a threshold. Under FLSA (Tier 1 baseline), overtime is 1.5x the regular rate for hours over 40 in a workweek. Some states have daily overtime rules (e.g., California: 1.5x after 8 hours/day, 2x after 12). Calculating overtime correctly when an employee has worked multiple trade rates in the same week requires the WAOT calculation.

**Pay Type**
The category that classifies the *nature or kind* of an earning. Answers the question "what kind of time was this?" — not what work was done (that is Trade) or where the cost goes (that is Job Phase/Cost Code). Pay Type determines the multiplier or modifier applied to the trade rate. Common Pay Types in Tier 1: Regular (REG), Overtime (OT), Holiday (HOL), PTO/Vacation (VAC), Sick (SICK), Bonus, Per Diem. Combined with Trade, Pay Type defines an Earnings Code. Important: PTO, Vacation, and Sick hours are paid but do not count toward the FLSA 40-hour overtime threshold — only hours *worked* count.

**Pay Rate Table**
The complete set of pay rates configured for a single employee — a primary rate plus any number of trade-specific rates, each with an effective date. Replaces the single-rate model used by generic payroll systems. The core data structure that enables multi-variable rate payroll.

**Pay Stub**
The employee-facing document for each pay period showing gross earnings broken out by trade/rate, all deductions (pre-tax and post-tax), taxes withheld, and net pay. In a multi-rate construction context, the pay stub may show multiple earning lines (e.g., "Regular - Framing: 32 hrs @ $30.00" and "Regular - Crane Op: 8 hrs @ $45.00"). Required by most states.

**Phase Code** — see *Job Phase / Phase Code*

**Primary Pay Rate** — see *Base Pay Rate*

**Regular Rate**
The hourly rate used as the base for overtime calculation. When an employee works only one rate in a week, the regular rate equals that rate. When an employee works multiple rates, the regular rate equals the Weighted Average Overtime Rate (WAOT). Defined by FLSA.

**Shift Differential**
A pay premium added for hours worked during non-standard shifts (night, weekend, holiday). Applied as an additive dollar amount or percentage on top of the trade rate. Example: a Carpenter working a night shift earns $30.00/hr (trade rate) + $2.50/hr (night differential) = $32.50/hr. Configured at the company level; applied automatically based on clock-in/out times.

**Trade**
The type of construction work or skill being performed by an employee on a given shift or time entry. Examples: Carpenter, Electrician, Crane Operator, Forklift Operator, Ironworker, General Labor, Plumber. The primary rate-determining dimension in Tier 1 payroll. An employee can be qualified in multiple trades and will have a separate pay rate for each. Distinct from Job Phase/Cost Code — trade determines the rate; phase code determines where the cost is allocated.

**Trade Library**
The company-level master list of valid trade designations available within Prism. Configured by the PR Admin. Employees are assigned rates from this library. Time entries reference trades from this library.

**Trade Rate**
The specific hourly pay rate for a particular trade, assigned to a specific employee, with an effective date. Example: Employee A | Trade: Crane Operator | Rate: $45.00/hr | Effective: 01/15/2025.

**Traqspera**
Trimble's field time collection solution, integrated with Spectrum (Trimble's accounting platform). Used by workers and supervisors to record time against Jobs and Phase Codes. In the Prism ecosystem, Traqspera is the origination point for time data that flows into Prism Payroll for gross pay calculation and into Prism Accounting for job cost posting.

**Weighted Average Overtime Rate (WAOT)**
The FLSA-compliant method for calculating overtime when an employee earns different trade rates within the same workweek. Formula: Total straight-time earnings across all rates ÷ Total hours worked = WAOT (the regular rate). Overtime premium = 0.5 × WAOT × overtime hours. This is distinct from simply multiplying the highest rate by 1.5, and is one of the most commonly miscalculated payroll items in construction. A required calculation in Prism Payroll for any employee with a multi-trade pay rate table.

**Worker Classification**
The legal determination of whether a worker is a W-2 employee (subject to tax withholding, FICA, and overtime protections) or a 1099 independent contractor (self-employed; employer has no withholding obligation). The highest-risk setup decision in payroll — misclassification can result in back taxes, penalties, and restitution. Prism Payroll must enforce this distinction from the first step of onboarding.

**Workers' Compensation (WC) Classification Code**
An industry-standard code (typically an NCCI code) that identifies the risk level of the type of work being performed. Different trades carry different WC codes and corresponding insurance premium rates. An employee working multiple trades may have multiple WC codes, requiring trade-level WC tracking on time entries to calculate accurate insurance costs.

---

## How It All Connects — One-Line Summary

> A field worker opens Traqspera, selects the **Job** and **Phase Code** (both from Prism Accounting), and identifies the **Trade** for that shift → the approved time entry syncs into Prism Payroll → Prism looks up the employee's **Trade Rate** from their **Pay Rate Table** → assigns the correct **Pay Type** (Regular, OT, Holiday, etc.) based on hours worked and company rules → calculates **WAOT** if multiple trade rates exist in the week → adds **Labor Burden** → posts net pay to the employee and labor cost back to Prism Accounting under the correct Job + Phase Code.
