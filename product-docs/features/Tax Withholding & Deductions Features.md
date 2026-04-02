# Prism Construction Payroll — Tax Withholding & Deductions
## Feature Set for Epic 681934 (E5)

> **Source:** Tax Withholding & Deductions PRD (Mar 2) — the gross-to-net calculation layer that receives gross pay from the Earnings engine (E4) and produces net pay.

---

## Feature Set Overview

| # | Feature Title | One-Line Summary |
|---|--------------|-----------------|
| E5-1 | Federal Income Tax Withholding | Calculate FIT from W-4 elections for all employees, including supplemental wage flat-rate treatment |
| E5-2 | Multi-State & Local Tax Withholding | Withhold state income tax across all active work and home states, honoring reciprocity agreements; cover key local/municipal jurisdictions |
| E5-3 | FICA, FUTA & SUTA Calculation | Calculate employee and employer FICA, federal unemployment, and state unemployment taxes per employee per run |
| E5-4 | Pre-Tax Deduction Processing & Sequencing | Apply 401(k), health, HSA/FSA, and other pre-tax deductions in correct statutory order before tax calculation |
| E5-5 | Post-Tax Deductions & Garnishment Enforcement | Process Roth contributions, wage garnishments, and other post-tax items with CCPA limit enforcement and priority sequencing |
| E5-6 | Workers' Comp Estimation & Employer Burden Summary | Calculate WC cost estimate per employee and display fully burdened labor cost in the payroll run summary |

---

## E5-1 — Federal Income Tax Withholding

### Goal / Outcome
The system automatically calculates federal income tax withholding for every W-2 employee using current IRS withholding tables and the employee's W-4 elections on file. Admins never manually calculate or enter FIT — it is computed correctly in every payroll run, including supplemental wage scenarios (bonuses, retroactive pay). This eliminates the most common compliance failure in SMB payroll: single-scenario FIT calculation that breaks under multi-income or supplemental wage conditions.

### Primary Personas
- **PR Admin ("Overwhelmed Operator")** — runs payroll and trusts FIT is correct without manual intervention
- **External CPA / Bookkeeper** — verifies withholding amounts match tax liability at period close
- **Field Worker** — indirect beneficiary: W-4 elections respected; correct federal tax taken each check

### Business & PRD Drivers
- G1 — Zero withholding errors for all covered federal obligations
- G2 — Correct gross-to-net deduction sequencing
- UC-1 — Apply federal income tax withholding per W-4 (P0 — Beta)
- UC-11 — Apply supplemental wage flat rate for bonuses/retroactive pay (P0 — GA)
- PRD §3a — Federal Income Tax Withholding requirements
- PRD §4a — Alpha: simplified FIT; Beta: full W-4-driven FIT; GA: supplemental rate

### Problem / Rationale
Generic SMB tools often implement a simplified single FIT scenario. When an employee has a 2020+ W-4 (step-based) vs. a legacy pre-2020 allowance-based form, or when a bonus is added mid-run, the withholding logic is different. Tools that treat all earnings as regular wages, or don't maintain both W-4 format versions, produce systematically wrong federal withholding — generating CP2000 notices and employee over/underpayment.

### In Scope
- FIT calculation using current IRS Publication 15-T withholding tables
- Support for 2020+ W-4 format (step-based: filing status, dependents claim, other income, extra withholding)
- Support for legacy pre-2020 W-4 format (allowances-based) for employees who have not re-filed
- Additional withholding amount per employee honored (per W-4 Line 4c)
- Supplemental wage flat rate: 22% federal withholding applied to bonus, commission, and retroactive pay line items (GA)
- FIT applied after pre-tax deductions have reduced taxable wages (correct sequencing per E5-4)
- FIT amount surfaced per employee in payroll run detail view before finalization
- Tax table versioning: calculations reproducible using the rates in effect at the time of the run

### Out of Scope (for this feature)
- State income tax withholding (E5-2)
- FICA calculation (E5-3)
- Pre-tax deduction processing (E5-4 — though E5-1 consumes the taxable wage output of E5-4)
- W-4 collection and storage UI (Employee Management — E2)
- Tax filing / 941 remittance (Tax Filing — E8)
- Non-resident alien withholding special rules (future)

### Example Super Stories
- As a PR Admin, I want FIT automatically calculated for each employee using their W-4 elections so that I never manually compute federal withholding or look up IRS tables.
- As a PR Admin, I want the system to apply a 22% flat rate to Aaron's $500 project completion bonus so that supplemental wages are withheld at the correct IRS-specified rate.
- As an External CPA, I want to see each employee's taxable wages and FIT amount in the payroll run detail so that I can verify withholding matches our tax liability estimates.
- As a System, I want to support both 2020+ and pre-2020 W-4 formats so that long-tenured employees who have not re-filed are still withheld correctly.

### Acceptance Criteria Themes
- FIT is calculated for every W-2 employee in every payroll run using the IRS withholding tables in effect as of the run date
- Both 2020+ W-4 (step-based) and pre-2020 W-4 (allowances) formats produce the correct withholding amount — verified against IRS Publication 15-T test vectors
- The supplemental wage 22% flat rate is applied to line items flagged as Bonus, Commission, or Retroactive Pay (from E4-5), not to regular wages
- Additional withholding amounts from W-4 Line 4c are added to computed FIT before finalizing employee withholding
- FIT is calculated on taxable wages (gross pay minus pre-tax deductions) — not on raw gross pay
- Historical payroll runs remain reproducible using the IRS tables that were in effect at the time of the run (versioned rate tables)
- FIT amount per employee is visible in the pre-finalization review screen

### Dependencies & Risks
- **Upstream:** E4-7 (Gross Pay Aggregation) must deliver taxable gross pay and pay type flags (supplemental vs. regular) before this engine runs
- **Upstream:** E5-4 (Pre-Tax Deductions) must reduce taxable wages before FIT is computed — sequencing dependency
- **Upstream:** W-4 elections must be captured in Employee Management (E2) and available at run time
- **Upstream:** IRS withholding table data must be versioned and current — sourced from tax provider (Symmetry/Vertex)
- **Risk:** Build vs. buy for withholding engine — if using a headless payroll provider (Check, Gusto Embedded), this feature may be partially external; if in-house, IRS table data from tax provider is the critical path dependency (OQ-1)
- **Risk:** Employees with stale pre-2020 W-4s and complex situations (multiple jobs, non-wage income) may produce unexpected withholding amounts — mitigation: surface the W-4 data used alongside the computed FIT in the run detail

### Success Metrics / KPIs
- 0% FIT calculation errors against IRS test scenarios (all documented withholding scenarios)
- 0% supplemental wage flat-rate errors (bonus/retroactive lines withheld at exactly 22% federal)
- Compliance: no CP2000 or penalty notices attributable to Prism FIT calculation errors

### Assumptions
- The tax jurisdiction provider (Symmetry/Vertex) supplies IRS withholding tables; Prism does not maintain these in-house
- W-4 data is stored in Employee Management (E2) and delivered to this engine as part of the payroll run input
- Build vs. buy decision (OQ-1 from PRD §5e) determines whether this calculation is internal or delegated to a headless payroll provider

---

## E5-2 — Multi-State & Local Tax Withholding

### Goal / Outcome
For every employee with active work-state or home-state withholding obligations, the system calculates and applies the correct state income tax withholding — including honoring reciprocity agreements that suppress work-state withholding when a home-state reciprocity applies. For key local/municipal jurisdictions (Philadelphia wage tax, Ohio RITA, Kentucky county, PA school district), local tax is calculated automatically at Beta; full local coverage at GA. This is Prism's sharpest competitive differentiator against QuickBooks and Gusto, which silently fail multi-state construction workers.

### Primary Personas
- **PR Admin** — processes payroll for crews that cross state lines; currently must manually research and apply work-state withholding
- **Owner / Exec** — exposed to state tax penalty risk when work-state obligations are missed
- **External CPA / Bookkeeper** — verifies state/local withholding amounts match multi-state tax liability

### Business & PRD Drivers
- G1 — Zero withholding errors for all covered state and local tax obligations
- G3 — Full 50-state withholding accuracy at GA
- G4 — All applicable local/municipal taxes calculated automatically
- UC-2 — Multi-state income tax withholding (P0 — Beta)
- UC-3 — Honor reciprocity agreements (P0 — Beta)
- UC-4 — Local/municipal tax withholding (P0 — Beta for key localities; GA for all)
- PRD §1b — Problem: single-state assumption, reciprocity blind spots, local tax gaps are named failure modes

### Problem / Rationale
A PA-resident working a job site in OH is subject to PA income tax only — because PA and OH have a reciprocity agreement. A tool that doesn't know about this reciprocity withholds both PA and OH, generating a double-withholding complaint and a refund situation. Conversely, a tool that only withholds for home state silently misses work-state obligations where no reciprocity exists. Philadelphia's wage tax, Ohio RITA municipalities, and Kentucky county taxes are not edge cases for Mid-Atlantic and Midwest construction contractors — they are standard operating conditions.

### In Scope
- State income tax withholding for all states where the employee has an active withholding election (home state + work states)
- Home-state withholding applied per state withholding certificate on file (from E2)
- Work-state withholding applied where the employee has an active non-reciprocity work-state election
- Reciprocity agreement enforcement: when a home-state/work-state reciprocity agreement is active, only home-state withholding is applied — work-state is suppressed
- Beta local/municipal coverage: Philadelphia wage tax (resident and nonresident rates), Ohio RITA municipalities, Kentucky county taxes, Pennsylvania school district taxes
- GA local coverage: all localities where Prism configures and calculates withholding (per E2 setup)
- Resident vs. nonresident local tax rates applied correctly per the employee's home locality vs. work locality
- State and local withholding amounts surfaced per employee per jurisdiction in the payroll run detail
- Tax table versioning: state and local calculations reproducible at historical rates

### Out of Scope (for this feature)
- Determining which states and localities apply to an employee — Employee Management (E2) jurisdiction detection
- Federal income tax withholding (E5-1)
- FICA, FUTA, SUTA (E5-3)
- State unemployment insurance / SUTA (E5-3)
- State-specific pre-tax treatment differences (CA/NJ HSA) — GA scope (E5-4)
- Tax filing and remittance to state and local agencies (Tax Filing — E8)

### Example Super Stories
- As a PR Admin, I want the system to automatically withhold only PA income tax (not OH) for my PA-resident employee working an Ohio job site, because the PA–OH reciprocity agreement is active — without me having to research and configure this manually.
- As a PR Admin, I want Philadelphia wage tax withheld at the correct nonresident rate for non-Philly employees working a Philadelphia job site, without any manual calculation.
- As an Owner, I want the system to catch multi-state withholding obligations my previous payroll tool was silently missing, so that I'm not exposed to state tax penalty notices.
- As an External CPA, I want to see a jurisdiction-by-jurisdiction breakdown of state and local withholding per employee so that I can reconcile withholding against our state tax liability accounts.

### Acceptance Criteria Themes
- For a PA-resident employee working an OH job site with an active PA–OH reciprocity agreement: only PA income tax is withheld; OH withholding is zero — no admin override required
- For a PA-resident employee working a VA job site (no PA–VA reciprocity): both PA and VA income taxes are withheld at their respective rates
- Philadelphia wage tax is withheld at the nonresident rate for non-Philadelphia residents working Philadelphia job sites, and at the resident rate for Philadelphia residents
- Ohio RITA municipality withholding is applied for employees working in RITA member municipalities
- All state withholding calculations match published state withholding table test vectors to the cent
- Each employee's payroll run detail shows a per-jurisdiction breakdown: jurisdiction name, type (state/local), taxable wages, rate, and withholding amount
- State withholding tables are versioned; historical runs remain reproducible at the rates in effect on the run date

### Dependencies & Risks
- **Upstream:** E2 (Employee Management) must deliver the employee's active jurisdiction list (home state, work states, localities, reciprocity flags) as part of the payroll run input
- **Upstream:** E5-1 taxable wages (post-pre-tax-deduction) flow into state withholding; state taxable wages may differ from federal (state-specific pre-tax rules — deferred to GA)
- **Critical dependency:** Tax jurisdiction database vendor (Symmetry/Vertex/Avalara) — state withholding tables, local tax rates, reciprocity agreements — must be contracted and integrated before Beta (PRD §5b: High risk, critical path)
- **Risk:** Local tax rate data from vendor is incomplete or stale for key Beta localities — mitigation: vendor SLA; pre-Beta test suite against known PA/OH/KY/Philadelphia vectors
- **Risk:** State-specific pre-tax treatment differences (CA doesn't recognize HSA as pre-tax; NJ has different 401k treatment) cause incorrect state taxable wages — mitigation: document as known Beta limitation; GA fix
- **Open Question (OQ-2):** Which local tax jurisdictions are in scope for Beta vs. GA? (PRD §5e — Product / Tax vendor, Sprint 2)

### Success Metrics / KPIs
- 0% reciprocity calculation errors (wrong state withheld, or correct state suppressed) for all covered reciprocity agreements
- 0% local tax withholding errors for Beta localities (Philadelphia, Ohio RITA, KY county, PA school district)
- State income tax coverage at GA: all 50 states with no known calculation errors
- Local tax coverage at GA: all localities configured in E2

### Assumptions
- Jurisdiction assignments (home state, work states, localities, reciprocity agreements) originate from E2 Employee Management and are available to this engine at payroll run time
- The tax jurisdiction provider supplies reciprocity agreement data — Prism does not maintain a proprietary reciprocity table
- State taxable wages equal federal taxable wages at Beta (state-specific pre-tax differences deferred to GA)

---

## E5-3 — FICA, FUTA & SUTA Calculation

### Goal / Outcome
For every payroll run, the system automatically calculates employee-side FICA (Social Security and Medicare), employer-side FICA, FUTA, and SUTA — with full wage base tracking across the year. Admins and owners see accurate employer tax obligations alongside employee net pay, eliminating the silent underpayment risk that occurs when SMB tools don't enforce wage bases or fail to track YTD accumulated wages.

### Primary Personas
- **PR Admin** — relies on system to compute all employer tax obligations; cannot manually track per-employee wage base accumulation
- **Owner / Exec** — needs total employer tax cost visible before disbursement to understand true labor burden
- **External CPA / Bookkeeper** — reconciles employer FICA/FUTA/SUTA against 941 and state unemployment filings

### Business & PRD Drivers
- G1 — Zero withholding errors for FICA
- G5 — Employer-side costs (FICA, FUTA, SUTA) calculated and visible per employee per run
- UC-5 — Calculate employee and employer FICA (P0 — Beta)
- UC-6 — Calculate FUTA and SUTA employer contributions (P0 — Beta)
- PRD §3a — FICA, FUTA, SUTA requirements (all P0)

### Problem / Rationale
FICA wage base management is where most SMB tools fail over time, not at the start of a year. Social Security stops accruing at the annual wage base ($176,100 for 2025); FUTA stops at $7,000; each state has its own SUTA wage base. A tool that doesn't track YTD wages per employee per tax type continues calculating SS tax past the wage base — a systematic overpayment. Multi-state companies have separate SUTA rates and wage bases per state, adding another layer of complexity SMB tools routinely miss.

### In Scope
- Employee Social Security tax: 6.2% on covered wages up to the annual SS wage base; stops at wage base
- Employee Medicare tax: 1.45% on all covered wages (no wage base ceiling)
- Employer Social Security: 6.2% matching; same wage base enforcement
- Employer Medicare: 1.45% matching; no ceiling
- Additional Medicare Tax: 0.9% on employee wages exceeding $200,000 YTD (P1 — GA)
- FUTA: 6.0% on first $7,000 of wages, net of allowable SUTA credit (5.4% for states in good standing)
- SUTA: company's applicable state rate × wages up to each state's annual wage base
- Multi-state SUTA support: different rates and wage bases per state for employees working in multiple states
- YTD wage accumulation per employee per tax type — tracked across all runs in the calendar year
- FICA and FUTA/SUTA amounts displayed per employee in payroll run detail alongside employer burden summary

### Out of Scope (for this feature)
- Workers' comp cost estimate (E5-6)
- FUTA tax deposit and filing (Tax Filing — E8)
- SUTA deposit and state filing (Tax Filing — E8)
- State income tax (E5-2)
- Additional Medicare Tax at Beta — GA scope

### Example Super Stories
- As a PR Admin, I want Social Security tax to automatically stop calculating when Aaron's YTD wages hit the annual wage base, so that I'm not over-withholding mid-year.
- As an Owner, I want to see my company's total FICA, FUTA, and SUTA obligations per employee before I approve the payroll run, so that I know my true labor cost.
- As a PR Admin, I want the system to use the correct SUTA rate for each state where I have employees, so that multi-state unemployment obligations are calculated accurately.
- As an External CPA, I want YTD wage tracking per employee per tax type so that quarterly 941 reconciliation requires no manual spreadsheets.

### Acceptance Criteria Themes
- Employee SS tax calculation stops at the annual SS wage base; Medicare has no ceiling — both verified against IRS test vectors
- Employer FICA matches the employee calculation at the same rates and wage base
- FUTA is calculated at net effective rate (6.0% gross minus SUTA credit) on the first $7,000 of wages; FUTA stops accumulating once the wage base is hit per employee
- SUTA is calculated at the company's configured state rate, capped at each state's wage base; different rates are supported for different states
- YTD wage accumulation is tracked per employee across all payroll runs in the calendar year; the engine picks up mid-year where the previous run left off
- All FICA, FUTA, and SUTA amounts are visible per employee in the pre-finalization payroll run view
- If the SUTA wage base or rate changes during the year, the update takes effect from the configured effective date without retroactively altering prior runs

### Dependencies & Risks
- **Upstream:** E4-7 (Gross Pay Aggregation) delivers gross wages per employee — the input to FICA calculation
- **Upstream:** E5-4 pre-tax deductions reduce FICA-applicable wages in certain cases (pre-tax 401k reduces FIT wages but not FICA wages — the distinction must be handled in the taxable wage calculation)
- **Upstream:** SUTA rates and wage bases per state must be configured (admin-entered or fed from state agency — PRD OQ-5)
- **Risk:** FICA taxable wages differ from FIT taxable wages (pre-tax 401k is FICA-taxable but not FIT-taxable) — the gross-to-net sequence must correctly maintain two separate taxable wage values
- **Risk:** SUTA wage base accumulation across states for an employee who switches states mid-year is edge-case complex — mitigation: document and test explicitly
- **Open Question (OQ-5):** What is the source of the company's SUTA rate per state — admin-entered, or pulled from state agency registration? (PRD §5e — Product, Sprint 2)

### Success Metrics / KPIs
- 0% FICA over-calculation errors past wage base (no SS tax charged after $176,100 YTD in 2025)
- 0% FUTA over-calculation errors past $7,000 per employee
- 100% employer FICA calculation accuracy (matches IRS 941 expected amounts)
- SUTA calculation matches state UI wage base and rate for all covered states

### Assumptions
- SUTA rates are configured at the company level per state (admin-entered at Beta); automated state agency feed is a future enhancement
- The SUTA credit against FUTA is 5.4% (standard full credit) for states in good standing; states subject to credit reduction are a GA consideration
- FICA taxable wages and FIT taxable wages are maintained as separate values by the gross-to-net sequencing logic

---

## E5-4 — Pre-Tax Deduction Processing & Sequencing

### Goal / Outcome
The system applies all configured pre-tax deductions (401(k), health/dental/vision premiums, HSA, FSA, and other designated pre-tax items) in the correct statutory order — before federal income tax is calculated — reducing taxable wages by the deduction amount. Admins configure deductions once per employee; the engine applies them correctly every run without manual intervention. Correct sequencing is non-negotiable: applying deductions after tax calculation produces systematically incorrect net pay for every affected employee.

### Primary Personas
- **PR Admin** — configures deductions once; trusts the engine to apply them correctly each run
- **Field Worker** — indirect beneficiary: pre-tax elections reduce their tax burden correctly
- **External CPA / Bookkeeper** — verifies deduction amounts and pre-tax treatment in the payroll detail

### Business & PRD Drivers
- G2 — Correct gross-to-net deduction sequencing for all pre-tax and post-tax items
- G1 — Zero withholding errors (sequencing errors cause FIT to be calculated on too-high a taxable base)
- UC-7 — Apply pre-tax deductions: 401k, health, FSA/HSA (P0 — Beta)
- PRD §3a — Pre-Tax Deductions requirements
- PRD §1b — Problem statement: "WAOT deduction sequencing — pre-tax deductions must be subtracted before taxes are calculated"

### Problem / Rationale
When pre-tax deductions are applied after taxes (or not at all), an employee's federal and state taxable wages are inflated — they pay income tax on money they never receive net. This is a named failure mode in the PRD. A $500/month 401(k) contribution that is mistakenly treated as post-tax costs the employee roughly $125–$175/month in unnecessary income tax. At scale across a construction workforce, this generates employee complaints, W-2 corrections, and eroded trust in the payroll system.

### In Scope
- Pre-tax deduction types supported at Beta: traditional 401(k) / 403(b) contributions, health insurance premium (employee share), dental premium (employee share), vision premium (employee share), HSA contributions, FSA contributions, and other employer-designated pre-tax items
- Deductions applied in the correct statutory sequence: pre-tax deductions reduce gross pay → federal taxable wages derived → FIT calculated → FICA calculated (401k is FICA-taxable; health premiums typically are not under Section 125) → state taxable wages derived → SIT calculated
- Each pre-tax deduction type carries the correct FICA taxability flag (Section 125 health premiums are FICA-exempt; 401k contributions are FICA-taxable)
- Deduction amounts: flat dollar or percentage of gross pay, with effective dates
- Annual contribution limits enforced: 401(k) IRS limit ($23,500 for 2025); HSA IRS limit — engine stops deducting when the limit is reached for the calendar year
- Pre-tax deduction amounts visible per employee per type in the payroll run detail
- Deduction configurations consumed from Employee Management (E2) or payroll settings — not defined in this feature

### Out of Scope (for this feature)
- Post-tax deductions and garnishments (E5-5)
- Roth 401(k) contributions (post-tax — E5-5)
- State-specific pre-tax treatment differences (CA/NJ HSA, NJ 401k) — GA scope
- Benefits administration and enrollment (future / HR module)
- Union fringe benefit contributions (Tier 2+)
- Employer contributions to health/HSA (informational only — not deducted from employee net pay)

### Example Super Stories
- As a PR Admin, I want the system to automatically subtract Aaron's $400/month 401(k) contribution from his gross pay before calculating his federal income tax, so that his taxable income is correctly reduced without any manual math on my part.
- As a PR Admin, I want health insurance premium deductions to reduce Aaron's federal taxable wages but not his FICA wages (Section 125 treatment), so that FICA and FIT are each calculated on the correct base.
- As a PR Admin, I want the system to stop taking 401(k) deductions when an employee hits the IRS annual limit, so that I don't have to manually track and stop contributions mid-year.
- As a Field Worker, I want to see my pre-tax deductions clearly itemized on my pay stub so that I understand why my taxable income is lower than my gross pay.

### Acceptance Criteria Themes
- Pre-tax deductions are applied before FIT, state income tax, and FICA calculations — in the statutory sequence defined in PRD §3a (1. pre-tax deductions → 2. FIT → 3. FICA → 4. state/local tax)
- Section 125 health/dental/vision premiums reduce both federal and FICA taxable wages; traditional 401(k) contributions reduce federal taxable wages but not FICA wages
- Annual IRS contribution limits are enforced: when an employee's YTD 401(k) contributions reach the annual limit, no further deductions are taken automatically
- Deduction amounts can be configured as flat dollar or percentage of gross; both are applied correctly across varying gross pay amounts
- All pre-tax deductions are itemized per type in the employee's payroll run detail view and on the pay stub
- If a deduction would reduce gross pay to zero or below, the system alerts the admin and stops deductions at zero — never producing negative net pay at this stage
- Pre-tax deduction amounts match the configurations set in Employee Management / payroll settings exactly

### Dependencies & Risks
- **Upstream:** E4-7 (Gross Pay Aggregation) delivers gross pay as the input; pre-tax deductions reduce this to taxable wages
- **Upstream:** Deduction configurations (amounts, effective dates, types) must originate from Employee Management (E2) or a payroll settings module — PRD OQ-3: "How are deduction configurations set up?"
- **Downstream:** E5-1 (FIT) and E5-2 (State Tax) consume the reduced taxable wages produced by this feature — sequencing dependency
- **Risk:** FICA taxability of deduction types is nuanced — mitigation: define taxability flags per deduction type at configuration
- **Risk:** State-specific pre-tax rules (CA does not recognize HSA as pre-tax; NJ has special 401k treatment) cause incorrect state taxable wages at Beta — document as known Beta limitation; GA fix
- **Open Question (OQ-3):** Where are deduction configurations (401k amounts, health premiums) set up — in Employee Management or a separate payroll settings module? (PRD §5e — Product, Sprint 1)
- **Open Question (OQ-4):** For states that don't recognize federal HSA pre-tax treatment (CA, NJ) — in scope for Beta or GA only? (PRD §5e — Legal/Compliance, Sprint 2)

### Success Metrics / KPIs
- 0% sequencing errors: no run where FIT or state tax is calculated before pre-tax deductions are applied
- 0% FICA taxability errors: deduction types flagged correctly as FICA-taxable vs. FICA-exempt
- 100% of employees with annual-limit deductions (401k, HSA) stop deducting automatically when the IRS limit is reached
- Employee taxable wages match the expected post-deduction amount in all documented test scenarios

### Assumptions
- Deduction configuration UI (setting up 401(k) amounts, health premiums per employee) is defined in Employee Management (E2) or a separate payroll settings epic; this feature consumes those configurations
- The FICA taxability flag per deduction type is a system-level attribute of each deduction type — admin does not set this per employee

---

## E5-5 — Post-Tax Deductions & Garnishment Enforcement

### Goal / Outcome
After all taxes are withheld, the system applies post-tax deductions — Roth 401(k), garnishment orders, and other post-tax items — in the correct statutory sequence. For wage garnishments, the system enforces CCPA maximum withholding limits automatically and sequences multiple simultaneous garnishment orders by legal priority. Admins are protected from inadvertently violating federal garnishment law, and employees are protected from illegal over-garnishment — both groups currently have no automated safeguard in generic SMB tools.

### Primary Personas
- **PR Admin** — processes garnishment orders but has no way to verify CCPA compliance manually across all employees
- **Owner / Exec** — exposed to legal liability if garnishment limits are violated
- **External CPA / Bookkeeper** — audits garnishment amounts for compliance with court orders and legal maximums

### Business & PRD Drivers
- G2 — Correct gross-to-net deduction sequencing (post-tax deductions applied after all taxes)
- G1 — Zero withholding errors; garnishment over-deduction is a compliance failure
- UC-8 — Apply post-tax deductions: Roth, garnishments (P1 — GA)
- UC-9 — Enforce garnishment legal maximums (CCPA limits) (P1 — GA)
- PRD §3a — Post-Tax Deductions requirements; CCPA limit enforcement
- PRD §1b — "Garnishment complexity: wage garnishments have maximum withholding limits under federal and state law that are not enforced by SMB tools"

### Problem / Rationale
Garnishment law is unforgiving. An employer who withholds more than the CCPA maximum (25% of disposable earnings, or the amount exceeding 30× federal minimum wage — whichever is less) is liable to the employee. When multiple garnishment orders exist simultaneously (a child support order and a creditor order, for example), the priority sequencing is determined by law — not first-come-first-served. Generic SMB tools that simply apply garnishments as entered with no limit enforcement expose the employer to legal liability on every affected pay period.

### In Scope
- Post-tax deduction types: Roth 401(k) contributions, wage garnishments (child support, creditor orders, student loan, tax levies), and other employer-designated post-tax items
- CCPA garnishment limit enforcement: maximum deduction is the lesser of (a) 25% of disposable earnings or (b) wages exceeding 30× the federal minimum wage; enforced automatically per pay period
- Multiple simultaneous garnishment orders: priority sequencing per federal law (child support/alimony first, then federal tax levies, then creditor orders)
- Garnishment order configuration: order type, creditor name, ordered amount, priority, maximum percentage — entered by admin and stored per employee
- System alerts admin if the total garnishment obligation exceeds the CCPA cap — showing which orders were fully satisfied, partially satisfied, or could not be applied
- Post-tax deductions applied after all taxes (federal, state, local, FICA) in the statutory gross-to-net sequence
- Net pay floor: if all post-tax deductions would reduce net pay below zero, the system stops and alerts admin; net pay is never negative
- All post-tax deduction amounts itemized per type in payroll run detail and pay stub

### Out of Scope (for this feature)
- Pre-tax deductions (E5-4)
- Roth 401(k) contribution limit enforcement (annual IRS limit for Roth) — deferred
- Garnishment order intake / legal document management (HR / Legal module)
- State-specific garnishment maximums that are more restrictive than CCPA federal minimums (future)
- Union dues (Tier 2+)

### Example Super Stories
- As a PR Admin, I want the system to automatically enforce the CCPA garnishment cap on Aaron's check so that I don't accidentally over-garnish him and expose the company to legal liability.
- As a PR Admin, I want child support garnishments to be prioritized over creditor garnishments when Aaron has both orders active, so that the legally mandated priority sequence is followed without me having to calculate it.
- As a PR Admin, I want to receive an alert when a garnishment cannot be fully satisfied in a pay period due to the CCPA cap, so that I know to notify the creditor.
- As an External CPA, I want to see each garnishment order's applied amount and any cap-related reductions in the payroll audit trail, so that I can verify compliance with each court order.

### Acceptance Criteria Themes
- Roth 401(k) and other post-tax deductions are applied after all tax withholding — never before FIT, FICA, or state tax
- CCPA garnishment maximum is enforced per pay period: the lesser of 25% of disposable earnings or earnings above 30× federal minimum wage — calculated and enforced automatically
- Multiple garnishment orders are processed in legal priority sequence: child support / alimony → federal tax levy → creditor orders
- When total garnishment obligations exceed the CCPA cap, higher-priority orders are satisfied first; lower-priority orders are partially or fully reduced; admin receives an alert identifying which orders were affected
- Net pay is never reduced below zero; if post-tax deductions exceed available net pay, the system blocks finalization with an admin alert
- Each garnishment order's applied amount, ordered amount, and any CCPA reduction are visible in the payroll run detail and audit log
- Garnishment processing events are logged per employee per run for 7-year audit retention

### Dependencies & Risks
- **Upstream:** E5-1, E5-2, E5-3, E5-4 must all complete before post-tax deductions are applied — this is the final deduction stage
- **Upstream:** Garnishment order data (order type, amount, priority, creditor) must be entered and stored in Employee Management or a garnishment management module — not defined in this feature
- **Risk:** Garnishment priority sequencing rules are legally complex with multiple simultaneous orders — mitigation: legal review of priority sequencing rules before implementation; conservative CCPA limit enforcement (PRD §5c)
- **Risk:** State-specific garnishment rules that are more restrictive than federal CCPA are not modeled at GA — mitigation: document as known limitation
- **Open Question:** Should the system track garnishment order balances (remaining amount to satisfy) across runs, or is the admin responsible for closing out orders? (Assumed: admin closes orders manually at Beta)

### Success Metrics / KPIs
- 0% CCPA over-garnishment events in production (no employee garnished beyond the legal maximum)
- 0% garnishment priority sequencing errors (child support always satisfied before creditor orders when both are active)
- 100% of garnishment-applied runs produce a visible, auditable record of each order's application and any CCPA reduction

### Assumptions
- Garnishment order setup (entering court orders, amounts, priority) is an admin function in Employee Management or a separate HR module; this feature consumes the order data
- State-specific garnishment maximums more restrictive than federal CCPA are out of scope for GA
- Roth 401(k) annual IRS contribution limits are deferred — admin is responsible for stopping Roth contributions at the limit at Beta

---

## E5-6 — Workers' Comp Estimation & Employer Burden Summary

### Goal / Outcome
For every payroll run, the system calculates a workers' compensation cost estimate per employee using the trade-specific WC classification code and gross wages, and displays the fully burdened labor cost (gross wages + employer FICA + FUTA + SUTA + WC estimate) per employee and in total for the run. Owners and admins have complete labor cost visibility before disbursement — the primary missing insight that leads to job underbidding and surprise cost overruns in construction.

### Primary Personas
- **Owner / Exec** — needs fully burdened labor cost visible before approving disbursement; uses this for job profitability monitoring
- **PR Admin** — verifies employer cost calculations are correct before finalizing the run
- **External CPA / Bookkeeper** — uses employer burden data for GL accruals and job cost reporting

### Business & PRD Drivers
- G5 — Employer-side costs (FICA, FUTA, SUTA, WC) calculated and visible per employee per run
- UC-10 — Calculate workers' comp cost estimate per employee (P1 — Beta)
- UC-12 — Display employer cost per employee in payroll run summary (P0 — Beta)
- PRD §3a — Workers' Compensation and Employer Cost Summary requirements
- PRD §2a — Owner/Exec persona: "No visibility into FUTA/SUTA or WC costs within payroll run"

### Problem / Rationale
A construction company owner who sees an employee's gross pay of $1,200 for the week is missing the true labor cost picture. Add 7.65% employer FICA ($91.80), FUTA (~$12), SUTA (varies), and a WC premium that can range from 5% to 25% of wages depending on trade risk (crane operators carry far higher WC rates than office admins), and the true cost may be $1,450–$1,550 or more. Without this visibility in the payroll run, job cost estimates are systematically understated — a root cause of profit margin erosion in construction SMBs.

### In Scope
- Workers' comp cost estimate per employee per run: WC classification rate × employee gross wages for that trade
- Multi-trade WC: if an employee worked multiple trades in the period, WC cost is calculated trade-by-trade at each trade's classification rate (e.g., Crane Operator hours at NCCI-5223 rate; General Labor hours at NCCI-5606 rate)
- Fully burdened labor cost per employee: gross pay + employer FICA + FUTA + SUTA + WC estimate
- Employer burden summary view in the payroll run: per-employee breakdown and total for the run
- WC cost estimate labeled as an estimate (not an actual premium invoice); admins understand this is for job cost projection purposes
- WC cost data flows to E5 output for downstream job cost posting in Prism Accounting (E9)

### Out of Scope (for this feature)
- Actual WC insurance premium billing or policy management (insurance carrier integration — future)
- WC audit / retrospective adjustment (future)
- Prevailing wage fringe benefit requirements (Tier 2+)
- Union fringe contributions (Tier 2+)
- Employee-side deductions (all in E5-4 and E5-5)

### Example Super Stories
- As an Owner, I want to see each employee's fully burdened cost (gross pay + all employer taxes + WC estimate) in the payroll run summary before I approve disbursement, so that I know the true cost of labor for this pay period.
- As a PR Admin, I want WC cost to be calculated at the correct classification rate for each trade Aaron worked this week — not a blended single rate — so that the estimate reflects the actual risk profile of the work performed.
- As a CPA, I want the employer burden totals from each payroll run to flow into job cost reports in Prism Accounting, so that project profitability reports reflect true labor cost including employer taxes.

### Acceptance Criteria Themes
- WC cost estimate per employee equals: Σ (hours worked per trade × trade rate × WC classification rate for that trade) — verified against manual calculation for a multi-trade test case
- Fully burdened labor cost per employee = gross pay + employer FICA + FUTA + SUTA + WC estimate — matches manual sum to the cent
- The payroll run summary displays a per-employee burden row and a total-run burden row visible before finalization
- Employees who worked multiple trades display WC cost broken down by trade classification code
- WC estimate is clearly labeled as an estimate, not an actual premium
- Burden data is included in the payroll run output that flows to Prism Accounting for job cost posting

### Dependencies & Risks
- **Upstream:** E5-3 (FICA, FUTA, SUTA) must calculate employer tax amounts before burden summary can be totaled
- **Upstream:** E4-1 (Trade Library) must have WC classification codes assigned per trade; E4-7 must deliver per-trade hours per employee for multi-trade WC calculation
- **Upstream:** WC classification rates per NCCI code must be configured (admin-entered at Beta based on company's WC policy)
- **Risk:** WC classification rates change at policy renewal and must be updated by admin — if not updated, estimates drift from actual premium; mitigation: prompt admin on configuration review at policy renewal date
- **Risk:** Multi-trade WC calculation requires per-trade hours from E4-7, not just total gross pay — the data contract between E4 and E5 must include trade-level hours breakdown

### Success Metrics / KPIs
- 100% of payroll runs display a fully burdened cost total visible to admin and owner before finalization
- Owner reports in user testing: "I now understand my true labor cost per run" (qualitative)
- WC cost estimate matches external calculation for all documented test scenarios

### Assumptions
- WC classification rates per NCCI code are entered by the admin based on their workers' comp policy; Prism does not pull rates from insurance carriers at Beta
- WC cost estimate is for job cost projection purposes only — it does not generate or affect actual WC premium invoices
- Per-trade hours per employee are available from E4-7's output, enabling trade-level WC calculation

---

## Traceability Table

| Requirement / PRD Reference | Description | Feature(s) |
|---|---|---|
| G1 — Zero withholding errors | No errors for covered federal, state, local obligations | E5-1, E5-2, E5-3, E5-4, E5-5 |
| G2 — Correct deduction sequencing | Pre-tax before tax; post-tax after | E5-4, E5-5 |
| G3 — Full 50-state withholding at GA | All states covered | E5-2 |
| G4 — Local/municipal tax auto-calculation | Domicile and job site based | E5-2 |
| G5 — Employer costs visible per employee | FICA, FUTA, SUTA, WC per run | E5-3, E5-6 |
| UC-1 — FIT per W-4 | P0 Beta | E5-1 |
| UC-2 — Multi-state withholding | P0 Beta | E5-2 |
| UC-3 — Reciprocity agreements | P0 Beta | E5-2 |
| UC-4 — Local/municipal withholding | P0 Beta (key localities); GA (all) | E5-2 |
| UC-5 — Employee + employer FICA | P0 Beta | E5-3 |
| UC-6 — FUTA and SUTA | P0 Beta | E5-3 |
| UC-7 — Pre-tax deductions | P0 Beta | E5-4 |
| UC-8 — Post-tax deductions | P1 GA | E5-5 |
| UC-9 — CCPA garnishment limits | P1 GA | E5-5 |
| UC-10 — WC cost estimate | P1 Beta | E5-6 |
| UC-11 — Supplemental wage withholding rate | P0 GA | E5-1 |
| UC-12 — Employer cost display | P0 Beta | E5-6 |
| PRD §3a — Gross-to-net statutory sequence | Pre-tax → FIT → FICA → state/local → post-tax | E5-4, E5-1, E5-3, E5-2, E5-5 |
| PRD §3a — Net pay ≥ $0 enforcement | Alert admin; block finalization | E5-5 |
| PRD §3a — Historical calculation reproducibility | Versioned rate tables | E5-1, E5-2, E5-3 |
| PRD §3b — Accuracy: calculations match tables to cent | NFR | E5-1, E5-2, E5-3 |
| PRD §3b — Performance: 100 employees < 30 sec | NFR | E5-1 through E5-6 |
| PRD §3b — Auditability: 7-year retention | NFR | E5-5 |
| PRD OQ-1 — Build vs. buy withholding engine | Architecture decision | E5-1, E5-2 |
| PRD OQ-2 — Local jurisdictions Beta vs. GA | Scope decision | E5-2 |
| PRD OQ-3 — Deduction config setup location | Design decision | E5-4 |
| PRD OQ-4 — CA/NJ HSA pre-tax Beta vs. GA | Compliance decision | E5-4 |
| PRD OQ-5 — SUTA rate source | Data decision | E5-3 |

---

> **Note on prior features in ADO:** The 7 features previously created under epic 681934 (683256–683262) cover the **Earnings & Rate Calculation (E4)** module and should be re-parented to the correct E4 epic. The 6 features above are the correct Tax Withholding & Deductions (E5) features for epic 681934.
