# Prism Construction Payroll — User Journey Maps
## Pass 1: Persona Journey Maps

> *Trimble Financials | Prism Payroll | U.S. SMB Construction Contractors*
> *Last Updated: March 9, 2026*
> *Grounded in: 31 SMB contractor interviews, 12 internal expert interviews, MRD, PRD (Tiers 1–4), User Insights Synthesis*

**Purpose:** Each map follows a specific persona through their end-to-end experience with Prism Payroll — capturing what they do, where the current state breaks down, and how Prism changes their reality. Use for: stakeholder communication, UX alignment, backlog coverage validation, and empathy grounding.

**Personas Covered:**
1. Payroll Admin (PR Admin)
2. Owner / Operator
3. Field Supervisor
4. Employee (W-2)
5. 1099 Subcontractor
6. CPA / Bookkeeper (External)

---

## Persona 1: The Payroll Admin (PR Admin)

**Archetype:** Office manager or bookkeeper at a 5–25 person contractor. Handles payroll alongside AP/AR, scheduling, and HR. Does not have a payroll background. Wears many hats.

**Goal:** Run payroll accurately and on time, every pay period, without triggering compliance failures or having to become a tax expert.

**Context from Research:**
- Often the owner's spouse, a long-tenure office manager, or a bookkeeper hired part-time.
- Lives in fear of miscalculating tax deposits — "I am ADP, I will save your world" captures why many outsource entirely.
- Frustrated by systems that don't talk to each other: time in one tool, payroll in another, accounting in a third.
- The "Friday Crunch" — waiting on field time to come in before the payroll run — is a recurring stressor.

---

| Step | What the Admin Does | System / Touchpoint | Current Pain (Without Prism) | Future State (With Prism) |
|------|--------------------|--------------------|------------------------------|--------------------------|
| **1. Initial Setup** | Enters company legal name, EIN, federal and state tax IDs, SUI rate, pay schedule, banking info | Setup wizard (Epic 668778) | Scattered across spreadsheets, old ADP account, CPA emails; doesn't know what's needed or in what order | Guided wizard enforces setup order, validates each input at entry, tells admin exactly what's missing before they get stuck |
| **2. Form 8655 Authorization** | Signs POA to authorize Prism to file and remit taxes on behalf of the company | Setup wizard — authorization gate | Often skipped or forgotten; results in company missing deadlines because authorization was never in place | Hard gate in wizard; cannot proceed past tax filing config until signed; Prism holds this on file |
| **3. Add Employees** | Enters new hire info: personal data, W-4, state withholding, direct deposit, trade assignments, pay rates | Employee onboarding wizard (Epic 672405) | Manual data entry across multiple systems; easy to miss a field; misclassification risk between W-2 and 1099 | 7-step guided wizard with misclassification guardrails; completeness check before saving; all data in one place |
| **4. Collect & Review Time** | Pulls approved time from Traqspera; reviews exceptions before initiating a run | Time Review Dashboard (Epic 681929) | Re-keys hours from a spreadsheet or email; discovers errors mid-run; doesn't know what "approved" means across field crews | Dashboard surfaces all exceptions (unapproved time, unmatched employees, missing entries) before run begins; one-click resolution |
| **5. Initiate Payroll Run** | Starts the payroll run for the current pay period | Payroll Run (Epic 682274) | No clear starting point; runs calculation manually or via ADP portal with little visibility into what's happening | Explicit "Start Payroll Run" CTA from Dashboard; pay period auto-populated; run state machine tracks progress (Draft → Calculating → Under Review) |
| **6. Review Calculations** | Reviews gross pay, deductions, taxes, net pay per employee; checks for anomalies | Payroll Review (Epics 681930, 681934, 682274) | Blind trust in ADP output; no line-item visibility; errors not discovered until employees call about wrong checks | Drill-down review by employee: gross pay by trade/job, WAOT breakdown, deduction sequence, net pay; AI anomaly flags surface before approval |
| **7. Clear AI Anomaly Flags** | Reviews flagged items (hours spike, zero-pay employee, duplicate entry) and resolves or accepts each | AI Pre-submission Checklist (Epic 681946) | No automated flags; errors discovered post-disbursement by employees or CPA | Interactive checklist; each flag requires explicit admin action (resolve or override with reason); approval button locked until all flags cleared |
| **8. Approve Payroll** | Clicks "Approve" — the explicit, irreversible authorization to disburse | Approval action (Epic 682274) | Often an implicit "submit" with no sense of finality or legal weight | Explicit approval confirmation with summary; clearly labeled as final; triggers disbursement, GL posting, and pay stub generation simultaneously |
| **9. Monitor Disbursement** | Watches ACH status; handles any failed payments | Disbursement (Epic 681936) | Calls bank to check ACH status; no visibility until employees report issues | Real-time disbursement status per employee; failed ACH surfaced immediately with guided retry workflow |
| **10. File & Remit Taxes** | Files 941s, SUI returns, state income tax returns; remits tax deposits on correct schedule | Tax Filing & Remittance (Epics 681940, 681942) | Maintains a spreadsheet calendar; misses deposit deadlines; unsure if semi-weekly or monthly depositor | Filing calendar with urgency-ranked deadlines; automated deposit schedule determination; proactive alerts before deadlines; 7-year history |
| **11. Handle Admin Changes** | Updates pay rates, adds a new state, terminates an employee, adjusts a deduction | Config Hub (Epic 668798) | Must re-enter setup wizard or call ADP; unclear where settings live | Persistent Config Hub with category cards; all ongoing settings accessible without re-entering wizard; effective-dated changes with audit trail |

**Moments of Truth:**
- Seeing the anomaly flag catch an error before disbursement → *"It caught what I would have missed."*
- First payroll run completing without a frantic call to the CPA → *"I actually did this myself."*
- Tax deposit deadline alert arriving 5 days before due → *"I'm not going to get penalized this quarter."*

**Key Emotional Arc:** Setup anxiety → Configuration confidence → Run-day calm → Approval relief → Ongoing trust

---

## Persona 2: The Owner / Operator

**Archetype:** Owner of a 3–20 person specialty or general contractor. May have started doing payroll themselves; now delegates to an admin but retains oversight. Focused on cash flow and job profitability. Terrified of IRS.

**Goal:** Know the business is compliant and profitable — specifically, that labor costs are accurately hitting the right jobs — without spending hours per week on payroll details.

**Context from Research:**
- Labor is 60% of project cost; without accurate per-job labor allocation, owners are flying blind on profitability.
- "Compliance trap" — owners outsource to ADP purely for liability protection, not efficiency.
- The "Scale-Up Cliff" — as they grow from 10 to 50 employees and cross state lines, complexity explodes and no generic tool can follow them.
- They want a "safety net" more than features.

---

| Step | What the Owner Does | System / Touchpoint | Current Pain (Without Prism) | Future State (With Prism) |
|------|--------------------|--------------------|------------------------------|--------------------------|
| **1. Check Payroll Status** | Opens Prism to see where the current pay period stands; what needs attention | Dashboard / Command Center (Epic 684212) | Asks the office manager; gets a verbal update; no single source of truth | Dashboard shows pay period status, attention items, upcoming deadlines — at a glance, every visit |
| **2. Review Labor Cost by Job** | Wants to know: am I making money on Job 47? How much have I spent in labor this month? | Reporting (Epic 681945) + Accounting Integration (Epic 681943) | Pulls a spreadsheet from the bookkeeper weekly; always retrospective, always incomplete | Fully burdened labor cost by job (gross wages + FICA + FUTA/SUTA + workers' comp) available immediately after each payroll run |
| **3. Monitor Compliance Status** | Wants to know if any filings are late, any deposits are due, any employee setups are incomplete | Dashboard attention panel (Epic 684212) + Tax Filing (Epic 681940) | Learns about compliance failures after the fact — from a penalty notice or a CPA call | 60-day rolling deadline tracker; attention panel aggregates incomplete setups, overdue deposits, upcoming filing deadlines with direct action links |
| **4. Review New Hire Setup** | Spot-checks that new hires are set up correctly, especially across state lines | Employee Management (Epic 672405) | Has to ask the admin to print or screen-share the ADP record; no direct visibility | Read-access view of employee records; can verify trade assignments, withholding elections, pay rates directly |
| **5. Review Annual Tax Picture** | Works with external CPA at year-end; wants to confirm W-2s and 1099-NECs are correct | Tax Filing (Epic 681940) + Reporting (Epic 681945) | Sends CPA a data export from ADP; CPA finds errors; corrections require manual amendments | CPA-access role in Prism; 7-year immutable filing history; W-2/1099-NEC generation with direct review before distribution |
| **6. Approve Off-Cycle Runs** | A key employee is terminated or needs a bonus check; owner wants it handled fast | Disbursement (Epic 681936) | Calls ADP; extra fees; 2–3 day turnaround; no self-service | Off-cycle payroll run executable by admin at GA; owner can track status in Dashboard |
| **7. Evaluate if Growth Creates New Obligations** | Company wins a project in a new state; owner wonders what changes for payroll | AI Tax Setup Advisor (Epic 681946) | Doesn't know what they don't know; discovers new state withholding requirements only after a penalty | Tax Setup Advisor proactively detects new jurisdiction from time entries; plain-language guidance with direct action links before a run is initiated |

**Moments of Truth:**
- Seeing fully burdened labor cost by job immediately after a payroll run → *"Now I actually know which jobs are making money."*
- Compliance alert arriving before a deposit deadline, not after a notice → *"This is the safety net I've always wanted."*
- Scaling to a new state without a crisis → *"It just... handled it."*

**Key Emotional Arc:** Anxious vigilance → Informed confidence → Strategic clarity

---

## Persona 3: The Field Supervisor

**Archetype:** Foreman or superintendent managing a crew of 4–15 workers at one or more active job sites. Phone is dirty. Has 5 minutes between tasks. Not a software person. Primary responsibility is getting the job done, not doing payroll admin.

**Goal:** Get crew time submitted and approved accurately and quickly — before the Friday cutoff — so everyone gets paid right and on time.

**Context from Research:**
- Field workers are "mathematicians when it comes to their paycheck, but they barely can get their time cards in."
- Supervisors need interfaces "five times simpler than what programmers imagine."
- The "Friday Crunch" is a downstream consequence of supervisors not having a simple, reliable time approval flow.
- Time coded to the wrong job or trade causes silent errors that surface only when the payroll register is wrong.

---

| Step | What the Supervisor Does | System / Touchpoint | Current Pain (Without Prism) | Future State (With Prism) |
|------|-------------------------|--------------------|------------------------------|--------------------------|
| **1. Crew Arrives on Site** | Workers clock in on Traqspera; supervisor confirms who is on site | Traqspera mobile (external) | Paper timesheets, group texts, or verbal counts; inconsistent | Workers clock in via Traqspera; supervisor sees live crew roster |
| **2. Assign Time to Job & Trade** | Selects correct job and trade type for each crew member's hours | Traqspera — job/trade selection | Job codes and trade types are inconsistent or missing in the timekeeping tool; workers guess | Jobs and cost codes synced from Prism Accounting into Traqspera; trade types pre-configured; supervisor selects from a clean, pre-populated list |
| **3. Handle Multi-Trade Days** | A carpenter also did some concrete work — hours need to split across two trades | Traqspera — multi-entry | Single-rate timesheets don't capture this; admin manually re-splits after the fact, often incorrectly | Multi-entry per worker per day; each entry carries its own trade tag; rates resolved automatically at payroll run |
| **4. End-of-Week Review** | Reviews all crew time entries for the week; corrects any errors before approving | Traqspera — approval queue | No structured review; relies on memory; misses entries from workers who forgot | Approval queue lists all pending entries by worker; missing entries flagged; one-tap approval per worker or crew-wide |
| **5. Approve Time** | Approves the crew's time, making it available for payroll processing | Traqspera → Prism integration (Epic 681929) | Approval is a formality with no downstream consequence; or there is no formal approval at all | Approved time flows directly into Prism Time Review Dashboard; unapproved time is surfaced as an exception that blocks payroll initiation |
| **6. Respond to Exceptions** | Admin flags a missing or suspicious time entry; supervisor corrects it | Time Review Dashboard (Epic 681929) + Traqspera | Admin calls or texts; supervisor corrects verbally; admin makes the change manually | Exception surfaces in dashboard with direct link to the entry; admin can flag back to supervisor; correction logged in audit trail |

**Moments of Truth:**
- Crew time flowing directly into payroll without the admin calling → *"Finally, my approvals actually mean something."*
- Missing entry flagged before payroll runs, not after → *"Caught it before anyone got a short check."*

**Key Emotional Arc:** Reluctant compliance → Reliable habit → Trusted contributor to payroll accuracy

---

## Persona 4: The Employee (W-2)

**Archetype:** Hourly field worker — carpenter, electrician, plumber, laborer. Works at multiple job sites. May work across state lines. Earns different rates depending on the trade type worked that week. Cares deeply about being paid correctly and on time.

**Goal:** Get paid the right amount, understand what was withheld and why, and manage my own direct deposit and withholding without calling the office.

**Context from Research:**
- "Field workers are mathematicians when it comes to their paycheck" — they will spot an error immediately.
- Pay stub transparency is a trust artifact: "A clear, itemized pay stub is the primary mechanism for an employee to verify they were paid correctly."
- WAOT (Weighted Average Overtime) is particularly confusing on the pay stub without clear explanation.
- Routing every personal update through the admin is a meaningful time drain on both parties.

---

| Step | What the Employee Does | System / Touchpoint | Current Pain (Without Prism) | Future State (With Prism) |
|------|----------------------|--------------------|------------------------------|--------------------------|
| **1. Onboarding** | Submits W-4, direct deposit info, state withholding elections | Paper forms → admin data entry | Paper W-4 handed to the office; takes days to get into the system; errors in data entry | ESS onboarding invite link; employee self-enters W-4 and direct deposit; admin notified and confirms — no paper |
| **2. Payday — Review Pay Stub** | Opens pay stub to verify hours, rates, deductions, net pay | ESS Portal — pay stub (Epics 681939, 681144) | Single-line stub from ADP; "Regular Pay: $1,847.00" — no breakdown; calls office to ask about overtime calculation | Construction-aware stub: multiple earnings lines by trade and job; WAOT shown with calculation explained; all deductions in sequence applied; state-compliant |
| **3. Dispute a Pay Error** | Believes hours were recorded wrong for a specific trade; wants to understand | ESS Portal + admin | Has to call the office; admin pulls the report; takes days; trust erodes | Stub shows rate per entry, job, and trade; employee can see exactly how WAOT was derived; disputes escalate to admin with specific stub line reference |
| **4. Update Direct Deposit** | Changes bank accounts; needs to update routing/account number | ESS Portal (Epic 681144) | Calls office; admin re-enters in ADP manually; often effective the wrong pay period | Self-service in ESS portal; change triggers admin approval notification; effective-date confirmed before saving |
| **5. Update Federal/State Withholding** | Life event — new dependent, second job — requires W-4 update | ESS Portal (Epic 681144) | Requests new paper form; returns it; admin re-enters; no confirmation the change was made | W-4 self-service in ESS; change triggers admin notification; confirmation displayed in portal |
| **6. Download W-2 at Year-End** | Needs W-2 to file personal taxes | ESS Portal (Epic 681144) | Waits for mailed W-2; calls office if not received by Jan 31 | Secure download via ESS portal; email notification when available; 4-year immutable retention |
| **7. Multi-State Scenario** | Works a job in a neighboring state for 3 weeks | Tax Withholding (Epic 681934) + ESS notifications | Often unaware that withholding should have changed; discovers at tax time when they owe another state | Prism detects new state from Traqspera time entries; correct withholding applied automatically; employee sees updated state line on next pay stub |

**Moments of Truth:**
- First Prism pay stub showing each trade rate, job, and WAOT breakdown → *"Now I finally understand what I was paid."*
- Direct deposit change done in 2 minutes on a phone, no call to the office → *"That was way easier than I expected."*
- W-2 available on January 5th, not January 31st → *"I can file early this year."*

**Key Emotional Arc:** Skepticism → Surprise (at pay stub clarity) → Self-sufficiency → Trust

---

## Persona 5: The 1099 Subcontractor

**Archetype:** Independent contractor — often a specialty trade operator (plumber, electrician, concrete finisher) who works for multiple GCs. Receives 1099-NEC at year end. Not a W-2 employee. Manages their own taxes. Primary concern: getting paid and getting their paperwork.

**Goal:** Get paid on time per the agreed schedule, receive a correct 1099-NEC at year-end without having to chase the GC's office, and update my own payment info without a phone call.

**Context from Research:**
- Misclassification between W-2 and 1099 is an existential risk for the GC — the employee wizard has guardrails to prevent this.
- 1099 subcontractors are a growing portion of construction labor at the SMB level.
- They have less engagement with the payroll system than W-2 employees but higher sensitivity to errors in tax documents.

---

| Step | What the Sub Does | System / Touchpoint | Current Pain (Without Prism) | Future State (With Prism) |
|------|------------------|--------------------|------------------------------|--------------------------|
| **1. Getting Added to the System** | GC's admin sets them up; sub provides EIN/SSN, bank info, business name | Employee wizard — 1099 path (Epic 672405) | Fax or email of W-9; manually entered by admin; misclassification risk | 1099 path in wizard with misclassification guardrail; W-9 data captured digitally; IRS factor checklist prevents mis-setup |
| **2. Submit Hours / Invoices** | Submits weekly invoice or time record per agreed process | Traqspera or manual submission | Inconsistent — some GCs use Traqspera, some use email invoices; no standard | Traqspera time entry available for subs where applicable; consistent coding to job/cost code |
| **3. Receive Payment** | ACH deposit or check per payment schedule | Disbursement (Epic 681936) | Checks arrive inconsistently; no visibility into payment status | ACH or check disbursed per agreed schedule; payment confirmation available |
| **4. Access Payment Records** | Wants to confirm payment amounts for their own records / bookkeeping | ESS Portal (Epic 681144) | Has to ask admin for payment history; no self-service | Limited ESS portal access: payment history, 1099-NEC download |
| **5. Receive 1099-NEC at Year-End** | Needs 1099-NEC by January 31 to file personal/business taxes | Tax Filing (Epic 681940) + ESS Portal | Mailed copy often late or goes to wrong address; calls GC's office; admin scrambles | 1099-NEC generated automatically from payment records; delivered via secure ESS link; email notification when available; admin retains distribution history |
| **6. Update Payment Info** | Changes bank account; needs to update ACH details | ESS Portal (Epic 681144) | Calls admin; admin updates manually; risk of missed payment | Self-service ACH update in ESS; triggers admin confirmation; effective date confirmed |

**Moments of Truth:**
- 1099-NEC available via portal link on January 10th → *"Didn't have to chase anyone this year."*
- Misclassification guardrail preventing the GC from accidentally treating them as a W-2 → *"Protects me and them."*

**Key Emotional Arc:** Passive participant → Informed recipient → Self-sufficient

---

## Persona 6: The CPA / Bookkeeper (External)

**Archetype:** External accounting professional engaged by the contractor for quarterly or year-end filings, audit support, or ongoing bookkeeping. Has read-only access to payroll data. Highly competent in tax and compliance but not in the day-to-day payroll workflow.

**Goal:** Pull the reports and data needed to do my job — quarterly filings, year-end tax prep, audit support — without having to call the admin or wait for an export.

**Context from Research:**
- Many SMBs outsource CPA work for year-end taxes even when they run payroll in-house.
- CPAs frequently find errors during their review that require corrections — which are painful to execute.
- The CPA is often the first person to discover that tax deposits were made on the wrong schedule.
- Payroll registers and employer cost summaries are the primary reports needed.

---

| Step | What the CPA Does | System / Touchpoint | Current Pain (Without Prism) | Future State (With Prism) |
|------|------------------|--------------------|------------------------------|--------------------------|
| **1. Onboarding to the Client's System** | Gets read-only access to the payroll platform | RBAC (Epic 681947) | Must be added by admin; often gets more access than needed; access is not audited | CPA/Bookkeeper role is pre-defined in RBAC; read-only access granted by admin; scoped to only the data the role requires |
| **2. Pull Quarterly Payroll Register** | Needs earnings-line detail per employee per quarter for 941 preparation | Reporting (Epic 681945) | Admin exports a flat CSV; no earnings breakdown; CPA re-derives the detail manually | Payroll register: earnings-line detail per employee per run, including rate-per-entry, WAOT breakdowns, per-job allocation; exportable as CSV/PDF |
| **3. Verify Tax Deposits** | Checks that all 941 deposits were made on the correct schedule and in the correct amounts | Tax Remittance (Epic 681942) + Reporting | Asks admin for bank statements; reconciles manually; often finds discrepancies | 7-year deposit history in Tax Remittance; deposit amounts by obligation and date; directly reconcilable to 941 |
| **4. Review Employer Cost Summary** | Needs total employer-side costs (FICA, FUTA, SUTA, workers' comp) for the period | Reporting (Epic 681945) | Separate from payroll register; must be derived from multiple exports | Employer cost summary report available as a discrete output; covers all employer obligations by period |
| **5. Verify W-2 / 1099-NEC Accuracy** | Before filing season, confirms that W-2 and 1099-NEC amounts match payroll records | Tax Filing (Epic 681940) + Reporting | Cross-references multiple exports; discrepancies require correction filings | W-2 and 1099-NEC data visible before distribution; CPA can flag discrepancies before documents are generated |
| **6. Audit Support** | A notice arrives from a state agency; CPA needs to reconstruct a specific pay period | Reporting (Epic 681945) + Audit trail (Epic 681947) | Requests export from admin; admin recreates from ADP; often incomplete | Immutable 7-year change audit trail; payroll history queryable by period, employee, or jurisdiction; no admin involvement needed for read-only research |
| **7. Labor Cost Review** | Wants to see labor cost allocation by job for a specific project for profitability analysis | Reporting (Epic 681945) + Accounting Integration (Epic 681943) | Labor cost by job not available in generic payroll tools; must be reconstructed from job costing software separately | Labor cost by job and cost code available immediately post-run; fully burdened (gross + all employer obligations); exportable |

**Moments of Truth:**
- Self-service access to a 7-year audit trail without calling the admin → *"I can do my job without creating work for my client."*
- Payroll register with earnings-line detail replacing a flat CSV → *"This is the report I've always asked clients for and never gotten."*
- W-2 discrepancy caught before distribution → *"We avoided a correction filing."*

**Key Emotional Arc:** Cautious skepticism (will it have what I need?) → Productive efficiency → Client trust reinforced

---

*Pass 2 — Capability Journey Maps: see `User-Journey-Maps-Pass2-Capability.md`*
*Epic IDs reference [ADO backlog](https://dev.azure.com/ViewpointVSO/Lista/_backlogs/backlog). Persona insights grounded in `docs/supporting/` research corpus.*
