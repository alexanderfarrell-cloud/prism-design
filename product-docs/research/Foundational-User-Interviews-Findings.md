# Foundational User Interviews -- Findings Report

## Research Overview


| Detail               | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| **Method**           | Semi-structured interviews (60--90 min each)                                   |
| **Participants**     | 27 SMB construction professionals across the US                                |
| **Source**           | `product-docs/personas/_foundational-user-interviews.csv`                      |
| **Analysis**         | Thematic analysis with behavioral, attitudinal, contextual, and process coding |
| **Date of analysis** | March 2026                                                                     |


### Participant Summary


| #   | Name     | Company                      | Role / Revenue Tier                |
| --- | -------- | ---------------------------- | ---------------------------------- |
| 1   | Tom      | CarrHomes                    | Custom home builder                |
| 2   | Andrea   | D&A Construction Advisors    | Construction consulting            |
| 3   | Jeff     | JLH Consulting               | Electrical / multi-trade, growing  |
| 4   | James    | Phoenix Builders             | Commercial GC, ~50 employees       |
| 5   | Alan     | Willow Construction          | Utility/site work contractor       |
| 6   | Chris    | Power Plumbing               | Commercial plumbing, ~$10M+        |
| 7   | Jodi     | JRP Construction             | Small GC, $0--10M                  |
| 8   | Larson   | SPSD                         | Landscape/hardscape, $0--10M       |
| 9   | Alberto  | BSM Construction             | Asst. PM, $21--30M                 |
| 10  | Buddy    | Authentic Hardwood Flooring  | Specialty flooring                 |
| 11  | Joshua   | Schell Creek Construction    | GC/residential                     |
| 12  | Anthony  | Ascher Brothers              | Painting/wall covering             |
| 13  | Delmar   | Integrous Fences and Decks   | Outdoor living                     |
| 14  | Jason    | Alternative Mechanical       | Mechanical/plumbing                |
| 15  | Jeff H.  | Hammerwell Inc.              | Residential GC                     |
| 16  | Arnold   | Heavy Metal Steel            | Reinforcing steel                  |
| 17  | Colin    | Dearborne                    | Luxury residential                 |
| 18  | Mark     | Creative Enclosures          | Remodeling/additions               |
| 19  | Steven   | Tribble & Stephens           | Commercial GC, ~$40M+              |
| 20  | Jill     | Interlink Group              | Professional services/electrical   |
| 21  | Joe      | Sainte Claire Homes          | Custom homes                       |
| 22  | Debbie   | ATR Technologies             | Specialty steel/railing            |
| 23  | Chris W. | CT West Construction         | Residential/commercial GC, $0--10M |
| 24  | Greg     | Henderson Building Solutions | Commercial GC                      |
| 25  | Emily    | ABC Piping                   | Piping, $11--20M                   |
| 26  | David    | Clover Contracting           | HVAC/specialty, $0--10M            |
| 27  | Shauwn   | Absolute Electric            | Electrical, residential/commercial |
| 28  | Kevin    | Piping Systems               | Mechanical/piping                  |


### Company Profile Distribution

- **Revenue $0--10M**: 6 participants explicitly coded, majority of remaining fall here based on headcount
- **Revenue $11--30M**: 2 participants
- **Revenue $30M+**: 2--3 participants (Tribble & Stephens, Phoenix Builders, Colin/Dearborne)
- **Trades**: General contractors, plumbing, electrical, HVAC, painting, steel, flooring, fencing, landscape, remodeling, piping, custom homes
- **Employees**: Range from 1 (sole proprietor) to ~50; majority have 5--20

---

## Thematic Findings

### Theme 1: The Multi-Hat Operator

**Frequency**: 27/27 participants -- universal

**Observation**: In SMB construction, every administrative function is someone's "other job." Owners, office managers, and project managers routinely split their time across estimating, accounting, HR, field supervision, and client management. Dedicated specialists are rare below ~30 employees.

**Key evidence**:

- Jill (Interlink): *"I'm a Jill of all trades. I'm the president of the company. So I'm in charge of administration, safety, working with the people that do CAD and estimating. I do the accounting."*
- Jodi (JRP): *"Owner, pretty much whatever needs to be done from estimating to admin to scheduling to day to day to site meetings, whatever."*
- Mark (Creative Enclosures): *"I wear many hats. It's operations, IT, HR and a little bit of sales as well."*
- Debbie (ATR Technologies): *"That's why we all wear so many hats. We can't just... we have to find a person that maybe does it make as much money that we can put some more time in training."*
- Buddy (Authentic Hardwood): *"I wear multiple hats. There's a total of seven of us as W2s. Now that doesn't include the 20 something people that are considered subs. But I wear multiple hats."*
- Jason (Alternative Mechanical): *"My two bosses wear a lot of hats, let's say."*

**Interpretation**: The multi-hat reality is not a temporary state -- it is the structural condition of SMB construction. Owners do not plan to hire specialists for every function; they need software that makes it possible for one person to context-switch between accounting, payroll, estimating, and project management without losing their place.

**Design implication**: Software must serve the "one person doing five jobs" user, not the specialist. This means: minimal navigation depth, persistent context between modules, and no assumption that the user is trained in accounting, HR, or tax.

---

### Theme 2: Cash Flow Is the Dominant Financial Anxiety

**Frequency**: 22/27 participants cited cash flow as a top-tier financial challenge

**Observation**: The construction payment cycle creates a structural cash flow problem. Companies pay material costs and labor upfront but are paid 30--60 days after invoicing, sometimes longer. Slow-paying customers are the most frequently cited financial stress.

**Key evidence**:

- Jodi (JRP): *"The cash flow, keeping it going. Slow pay customers... if people would just pay on time, I'd be good."*
- Anthony (Ascher Brothers): *"Biggest challenge is always cash flow because we're a subcontractor. So usually by the time the client pays the GC and then the GC pays us, it's 60 days."*
- Chris W. (CT West): *"We have some customers that we send a bill and they freaking pay in 30 minutes. We have other ones where QuickBooks tells us every time they view it and they view it 17 times over three weeks and for whatever reason they just don't want to pay."*
- Joe (Sainte Claire): *"Making sure the cash flow coming in matches the cash flow going out. With multiple clients, sometimes it can get tough. Has been for a long time."*
- Mark (Creative Enclosures): *"Making sure that the cash flow stays steady versus the materials purchasing."*
- Greg (Henderson): *"Keeping our owners or clients current with their payment... it used to be a net 30."*
- Debbie (ATR): *"Cash flow can sometimes be a challenge because when you get an order in, you have to pay for material and a lot of stuff up front and we don't get paid for it usually until after the job is done."*

**Interpretation**: Cash flow management in construction is not a bookkeeping problem -- it is an existential operational risk. When payroll, material purchases, and equipment costs all precede revenue by 30--60+ days, any disruption in the payment chain cascades into every other business function. Payroll becomes especially high-stakes: employees and subs must be paid on time regardless of whether the company has been paid.

**Design implication**: A payroll product for construction must surface cash flow visibility alongside payroll obligations. The user needs to see "what do I owe people this Friday" against "what cash is available" -- not as separate accounting reports, but as a unified operational view.

---

### Theme 3: QuickBooks Is the Default, but Nobody Loves It

**Frequency**: 18/27 participants use QuickBooks; dissatisfaction is widespread

**Observation**: QuickBooks (Online or Desktop) is the de facto accounting platform for SMB construction. It is "good enough" for invoicing, basic bookkeeping, and bill pay. But it consistently fails at construction-specific needs: job costing, progress billing, retention tracking, multi-trade project accounting, and integrated payroll with compliance.

**Key evidence**:

- James (Phoenix Builders): *"Sage 300 is just a financial tool... very difficult to create reports. I'm very frustrated with all the softwares that we have to use and nobody has come to the solution of, well, we can package all this stuff together in one package."*
- Buddy (Authentic Hardwood): *"The accounting firm, which we're very happy with, they only work in QuickBooks. So if I were to get a software that did the job costing, it would have to be able to migrate into QuickBooks."*
- Emily (ABC Piping): *"A lot of construction companies pay their employees weekly and we pay our employees biweekly. And so a lot of the payroll reports... you can only use some of them if your payroll is weekly."*
- Jeff H. (Hammerwell): *"We use that software on a fairly limited basis because we've found out that it just doesn't work for everything we do."*
- Delmar (Integrous): *"I would say I'm a 6 or a 7 out of 10. Towards the satisfied end, but there could be a lot of room for improvement."*
- Jill (Interlink): *"At some point in the future we would like to upgrade to something that's specifically for construction. But we don't have the funds right now."*
- Chris W. (CT West): Uses QuickBooks for accounting but also BuilderTrend, with a bookkeeper reconciling between them.

**Interpretation**: QuickBooks occupies a position of "reluctant default." Participants use it because their accountant uses it, because they've always used it, or because they haven't found a construction-specific alternative they can afford. The gap between what QuickBooks provides and what construction accounting requires is filled by spreadsheets, manual processes, and external professionals.

**Design implication**: A construction-specific product doesn't need to replace QuickBooks overnight -- it needs to do the things QuickBooks cannot (job costing, payroll compliance, progress billing) while interoperating with the QuickBooks ecosystem that accountants rely on.

---

### Theme 4: Job Costing Is the Holy Grail Nobody Has Cracked

**Frequency**: 24/27 participants discussed job costing; most lack accurate per-job cost visibility

**Observation**: Nearly every participant needs to know "am I making money on this job?" but few have reliable systems to answer the question in real time. Labor cost allocation -- the largest variable cost -- is especially opaque. Material costs are tracked per job with reasonable accuracy, but labor hours are often estimated, delayed, or incorrectly coded.

**Key evidence**:

- Chris (Power Plumbing): *"The biggest challenge is making sure we capture the cost in the right buckets... is it in the right job? In the underground or is it charged to the right job?"*
- Jill (Interlink): *"Labor cost. Making sure the guys do what they're supposed to do... not dilly dally around during the day and then bill you for eight hours."*
- Alan (Willow): *"The accounting lady gets all the costs in... labor costs get in automatically through the payroll. Then she gets all the invoices... and she'll run what we call a current month report -- labor, material, sub."*
- Emily (ABC Piping): *"The unknown... we have to estimate how much profit we think we're going to get on a job. And then most of the jobs here, they last over several years. So you really don't know until you get to the very end."*
- Delmar (Integrous): *"Getting all the information you need so you can close. It can be a real challenge just to bring everything together and get it reconciled."*
- Buddy (Authentic Hardwood): *"He's looking at the numbers every single week. People looking at the numbers monthly or quarterly -- I can see where he may find challenges."*
- Jodi (JRP): *"Sustaining what we have and making it profitable... ensuring its profitability, that's my big goal right now."*

**Interpretation**: Job costing is the single most important financial capability for construction operators, but it requires accurate labor allocation, which in turn requires reliable time tracking, which in turn requires field worker adoption. This chain of dependencies explains why so many companies "get by" with rough estimates. Payroll is the natural connective tissue: if labor costs flow accurately through payroll, they can be automatically allocated to jobs.

**Design implication**: Payroll and job costing must be tightly integrated. When an employee is paid, those hours should automatically appear as a job cost. The user should never need to enter labor cost data twice.

---

### Theme 5: Systems That Don't Talk to Each Other

**Frequency**: 16/27 participants explicitly described integration pain across tools

**Observation**: Construction companies routinely use 3--6 different software systems that do not share data. The most common stack is a project management tool (Procore, BuilderTrend, Aspire), an accounting tool (QuickBooks, Sage), and often a separate payroll or time tracking tool. Data flows between these systems manually -- via spreadsheets, re-keying, or a bookkeeper who reconciles across platforms.

**Key evidence**:

- Arnold (Heavy Metal Steel): *"They don't speak to each other, which is a problem. I can't take hours from Exact Time and make them flow into Heartland and generate payroll. I wish I could. Not reliably."*
- Arnold (continued): *"Having IT interface with the compliance software that we have to use is a problem because I basically have to take all the hours... and plug it all manually into LCP Tracker."*
- Buddy (Authentic Hardwood): *"We can't take the job all the way through [in Housecall Pro] because the customer has to be invoiced in QuickBooks because of the job costing."*
- Emily (ABC Piping): *"We moved to an app [for timesheets] but it's still not linked to our payroll system. So we still have to spend extra time entering it in."*
- Chris W. (CT West): *"Our office manager is cutting a check, entering the check into QuickBooks as well as BuilderTrend. So both systems are getting data entry done."*
- James (Phoenix Builders): *"Nobody has come to the solution of, we can package all this stuff together in one package. You can pay one subscription price."*

**Interpretation**: The fragmentation tax is enormous but invisible. Every manual data handoff between systems introduces delay, error risk, and labor cost. The owner who "does payroll" is often actually doing data entry to bridge systems. This fragmentation is the primary reason financial data is stale -- monthly close takes weeks because information must be gathered from multiple disconnected sources.

**Design implication**: An integrated platform that connects time tracking, payroll, job costing, and accounting eliminates the highest-friction activity in SMB construction back-office operations. Even partial integration (e.g., time tracking to payroll) would remove significant manual work.

---

### Theme 6: Payroll Is Managed, Not Mastered

**Frequency**: 20/27 participants discussed payroll handling; only 3 had robust payroll systems

**Observation**: Payroll handling falls into distinct tiers based on company size and complexity:

**Tier 1 -- Outsourced/Delegated (8 participants)**: The owner has little involvement. An external accounting firm, a spouse, or a dedicated office person "handles it." The owner approves but doesn't understand the mechanics. (Tom, Buddy, Alberto, Kevin, Colin, Larson, Jodi, Shauwn)

**Tier 2 -- Owner-Managed with Basic Tools (10 participants)**: The owner or a key office person runs payroll through QuickBooks Payroll, bank ACH, or a DOS-based system. It works but is fragile -- if that person leaves, payroll breaks. (Alan, Anthony/Debbie, Emily, Joe, Jeff JLH, Mark, Delmar, Alan, Jill)

**Tier 3 -- Professional Payroll Service (4 participants)**: Companies using ADP, Paylocity, or Gusto for payroll processing, often because compliance requirements (multi-state, union, certified payroll) forced them to professionalize. (Chris W./ADP, James/Paylocity, Arnold/Heartland, Chris Power Plumbing/Foundation)

**Key evidence**:

- Alan (Willow): *"When our girl walked out without any notice, the next week I had to come up with somehow doing payroll. Sage has a lady down in Florida who got online with us... she ran the payroll and we had a small error each week."*
- Debbie (ATR): *"Software wise, of course, the payroll, because that's repetitive. You know, you have the taxes that are set at the beginning of the year. We've used the same DOS system since 1993."*
- Anthony (Ascher): *"I would love to have our 941 and 940 process for payroll automated, cash reconciliations automated."*
- Emily (ABC Piping): *"I pay all the payroll taxes, the state and the federal and the city taxes for the employees and then pay the unemployment taxes."*
- Emily (continued): *"There's no one website that you can go to and to pay all your taxes. There's like 10 different websites you need to remember every month to pay each specific tax to whichever government entity."*
- Chris W. (CT West): *"We use ADP, which is a payroll processing company. They have an HR resource department that we tap into to understand -- California is very complex when it comes to employee law."*

**Interpretation**: Most SMB construction companies have payroll working "well enough" -- until something changes. A new hire, a state line crossing, a compliance audit, or a key employee departure can expose the fragility of the system. The companies that moved to professional payroll services did so reactively (after a compliance scare or growth event), not proactively.

**Design implication**: The onboarding experience is critical. Most of these users don't know what "good payroll" looks like. The product must guide them from their current state (manual, semi-broken, fragile) to a reliable system without requiring them to understand payroll mechanics upfront. "I didn't even know I needed this" is the target reaction.

---

### Theme 7: The CPA Dependency

**Frequency**: 22/27 participants use an external CPA for tax preparation

**Observation**: Nearly every company outsources tax preparation to an external CPA or accounting firm. Day-to-day bookkeeping is done in-house, but the year-end (and often quarterly) tax work is delegated to a professional. The relationship is one of trust and dependency -- owners sign what the CPA tells them to sign without deep understanding.

**Key evidence**:

- Tom (CarrHomes): *"My accounting department will send the necessary information to my outside accountant."*
- Jeff JLH: *"The only thing we use externally is CPA to do taxes."*
- Joshua (Schell Creek): *"We have an outside CPA firm that does review our books quarterly."*
- Alan (Willow): *"The auditor does it all. He's a CPA guy."*
- Shauwn (Absolute Electric): *"Submitting the taxes to the government is done by the accountant. Everything else is done by my wife."*
- Anthony (Ascher): *"I do all of the payroll taxes... the only thing done externally would be the CPA doing our taxes."*

**Interpretation**: The CPA relationship is a critical path dependency that constrains software adoption. CPAs dictate the accounting platform (often QuickBooks) and the data format. Any new system that disrupts the owner-to-CPA data pipeline will face resistance -- not from the owner, but from the CPA who must consume the output.

**Design implication**: Export capability and CPA-friendly reporting are not "nice to have" -- they are adoption requirements. The product should generate the exact reports that a CPA needs for tax preparation, formatted in the way CPAs expect. Ideally, the product should make the CPA's job easier, turning the CPA into an advocate rather than a blocker.

---

### Theme 8: Labor Shortage and Skilled Worker Retention

**Frequency**: 14/27 participants discussed labor challenges

**Observation**: Finding and retaining skilled tradespeople is a pervasive industry challenge that intersects with payroll in several ways: competitive compensation, timely payment, benefits administration, and the administrative burden of onboarding.

**Key evidence**:

- Chris (Power Plumbing): *"Getting trained and qualified plumbers is always, has been a challenge and hopefully will probably always be a challenge."*
- Shauwn (Absolute Electric): *"The biggest challenge is growing the company because finding people that care is very difficult. Nobody wants to care anymore."*
- Alan (Willow): *"Through this whole process of the next 10 years, we want them to be treated fairly and right and properly."*
- Arnold (Heavy Metal Steel): *"Lack of human resources to do it and lack of computer sophistication to do it."*
- Debbie (ATR): *"We're a small company, so we don't have like a huge budget to where we could just go buy the experience."*

**Interpretation**: In a tight labor market, payroll accuracy and timeliness are retention tools. Workers who are paid late, paid incorrectly, or lose visibility into their compensation will leave. For smaller operators, the inability to offer formal benefits (due to administrative complexity) limits their ability to compete for talent against larger firms.

**Design implication**: Features that make employees feel valued -- on-time direct deposit, accessible pay stubs, transparent withholding -- are competitive advantages for SMB employers, not just compliance checkboxes.

---

### Theme 9: Subcontractor Management Is Informal and Risky

**Frequency**: 19/27 participants work with subcontractors; most manage them informally

**Observation**: Subcontractor use is ubiquitous across all sizes and trades. Most participants work with 5--50+ subs. Payment methods are informal (checks, bank ACH), tracking is ad hoc (email, spreadsheets), and 1099-NEC compliance is often handled retroactively at year-end by the CPA.

**Key evidence**:

- Buddy (Authentic Hardwood): *"There's a total of seven of us as W2s. Now that doesn't include the 20 something people that are considered subs."*
- Jeff JLH: *"Some of these guys are 1099s, you just don't rehire them and so you don't have much of reporting responsibility."*
- Tom (CarrHomes): *"All of our construction is done by subcontractors."* (30+ per project)
- Chris W. (CT West): *"We're sending out [bids] to maybe 30 to 50... only 15 or 20 might get the project."*

**Interpretation**: The W-2/1099 boundary is blurry in practice, creating classification risk. Many companies default to "everyone is a sub" because the administrative overhead of W-2 employment (payroll taxes, benefits, withholding) is too high relative to their operational capacity. This is the "Scale-Up Cliff" identified in the journey map research -- the transition from all-1099 to mixed workforce.

**Design implication**: The product should handle both W-2 and 1099 workers in a unified interface. 1099 payment tracking and year-end 1099-NEC generation should be as seamless as W-2 payroll. Built-in classification guidance ("Does this worker look more like an employee or a contractor?") would address a real compliance gap.

---

### Theme 10: Digitization Appetite with Adoption Barriers

**Frequency**: 25/27 participants were asked about digitization priorities

**Observation**: When asked "what do you want to digitize or automate next?", the most common answers were:

1. **Estimating/takeoffs** (8 mentions) -- Reducing manual measurement and pricing
2. **Billing/invoicing/collections** (6 mentions) -- Faster payment cycles
3. **Time tracking to payroll integration** (4 mentions) -- Eliminating double-entry
4. **Administrative tasks** (4 mentions) -- General office automation
5. **CRM/customer communication** (3 mentions) -- Automated follow-up

**Key barriers to adoption**:

- **Cost**: *"I'm very weary of it. Like I've turned down multiple softwares just this year because all they could do is have me watch a demo."* (Larson)
- **Complexity**: *"Most of the subcontractors that are single trade, they operate on a very digitally archaic level."* (Chris W.)
- **Field worker adoption**: *"In New York, union regulation prohibits downloading something onto a union worker's phone."* (Andrea)
- **Switching cost**: *"Changing CRM systems is very painful, but I'm almost at the point where I'm ready to do it."* (Buddy)
- **Integration anxiety**: *"If I were to get a software that did job costing, it would have to be able to migrate into QuickBooks so that [the accounting firm] can take it from there."* (Buddy)

**Interpretation**: The appetite for automation is real but the barriers are practical, not philosophical. Participants are not resistant to technology -- they are resistant to disruption. They want automation that works within their existing workflows, integrates with their existing tools, and doesn't require retraining their team. Trial periods, easy migration, and visible ROI are prerequisites.

**Design implication**: The onboarding experience should deliver value within the first session -- not after weeks of setup. "Time to first payroll run" is the critical metric. Progressive disclosure (start simple, unlock complexity) is essential.

---

## Cross-Cutting Insights

### Insight 1: The Back-Office Bottleneck

**Pattern**: In 20+ interviews, a single person (often the owner or a trusted office manager) is the bottleneck for all financial operations -- invoicing, bill pay, payroll, reconciliation, tax prep. When that person is sick, on vacation, or leaves the company, the entire financial operation stops.

**Implication**: The product must be learnable enough that a second person can step in with minimal training. Role-based access (owner vs. office manager vs. CPA) with appropriate guardrails enables this.

### Insight 2: The Reconciliation Tax

**Pattern**: Companies that use multiple systems (project management + accounting + payroll) spend significant time reconciling data across platforms. This reconciliation is manual, error-prone, and often delayed -- meaning financial visibility is always stale.

**Implication**: Every data handoff the product can eliminate (time tracking to payroll to job costing to accounting) directly reduces the "reconciliation tax" and improves financial visibility.

### Insight 3: Compliance as an Invisible Time Bomb

**Pattern**: Most participants delegate tax compliance to a CPA and don't think about it until year-end. Several participants (Emily, Arnold, Anthony) manage payroll taxes themselves and describe it as tedious and anxiety-inducing. Multi-state operations and changing tax laws compound the problem.

**Implication**: Compliance should be built into the system, not layered on top. Automated tax filing, deadline reminders, and rate updates should be invisible to the user -- they should "just work" without the user needing to understand the underlying requirements.

### Insight 4: Trust Must Be Earned Through Transparency

**Pattern**: Participants who described positive software relationships cited transparency: being able to see where money goes, how costs are allocated, and what the system is doing. Participants who described frustration cited opacity: not understanding reports, not trusting numbers, and not knowing what they're paying for.

**Implication**: The product should show its work. When payroll is calculated, the user should be able to drill into the math. When a tax is withheld, the user should see why. Transparency builds the trust that replaces the CPA dependency over time.

---

## Recommendations

### Critical (Affects product viability)


| #   | Finding                                                 | Recommendation                                                                                                                             | Evidence                                              |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| R1  | Multi-hat operators need context-switching, not modules | Design the product as a unified workspace where payroll, job costing, and compliance are views of the same data, not separate applications | 27/27 participants operate in multi-hat mode          |
| R2  | Cash flow visibility must accompany payroll             | Surface "cash available vs. payroll due" as a primary dashboard view                                                                       | 22/27 cited cash flow as top financial challenge      |
| R3  | QuickBooks interoperability is a launch requirement     | Export to QuickBooks format and support QuickBooks data import for migration                                                               | 18/27 use QuickBooks; CPAs require it                 |
| R4  | Time tracking to payroll must be seamless               | Zero re-entry from time capture to payroll processing to job cost allocation                                                               | Arnold, Emily, Chris W. all described manual bridging |


### High (Significant competitive advantage)


| #   | Finding                                    | Recommendation                                                                     | Evidence                                              |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| R5  | Job costing must flow from payroll         | When an employee is paid, those hours automatically become job costs               | 24/27 discussed job costing needs                     |
| R6  | Support both W-2 and 1099 in one interface | Unified worker management with classification guidance                             | 19/27 use subcontractors; classification is blurry    |
| R7  | Compliance must be invisible               | Automated tax filing, rate updates, deadline management -- no user action required | Emily: "10 different websites to remember each month" |
| R8  | CPA-friendly reporting                     | Generate standard tax reports that CPAs expect, formatted for their workflows      | 22/27 delegate tax prep to CPAs                       |


### Moderate (Quality of life improvements)


| #   | Finding                                | Recommendation                                                                                       | Evidence                                                       |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| R9  | "Second person" onboarding             | The product should be learnable by a backup person within 1 hour                                     | Alan's story of payroll breaking when employee left            |
| R10 | Progressive disclosure of complexity   | Start with basic payroll; reveal compliance, multi-state, and job costing features as the user grows | Participants range from 1 to 50 employees                      |
| R11 | Mobile-friendly for field data capture | Time entry and approval must work on a phone for field workers                                       | Multiple participants cited field worker technology resistance |
| R12 | Trial/demo with real value             | Free trial that delivers meaningful output (first payroll simulation, compliance check)              | Larson: "If there's no test program, I'm very weary"           |


---

## Participant Behavioral Segments

The 27 participants cluster into three behavioral segments that align with different product needs:

### Segment A: "I Just Need It to Work" (12 participants)

**Profile**: Owner-operators with <10 employees, basic QuickBooks, CPA for taxes. Payroll is simple (few employees, single state) but fragile (one person knows how to do it).
**Participants**: Tom, Jodi, Larson, Buddy, Delmar, Joe, Debbie, Colin, Shauwn, Mark, Joshua, Jason
**Core need**: Reliable, simple payroll that doesn't require expertise. "Set it and forget it" with safety rails.

### Segment B: "I'm Outgrowing My Tools" (9 participants)

**Profile**: Growing companies (10--30 employees) where QuickBooks is showing cracks. Multiple projects running simultaneously, subcontractor complexity increasing, multi-state exposure beginning.
**Participants**: Jeff JLH, Alan, Chris (Power Plumbing), Anthony, Jeff H., Emily, Chris W., Greg, Kevin
**Core need**: Integrated platform that connects time tracking, payroll, job costing, and compliance without requiring a systems overhaul.

### Segment C: "I Need Professional-Grade" (6 participants)

**Profile**: Larger companies (30+ employees) with dedicated accounting staff, complex compliance requirements (certified payroll, union, multi-state), and enterprise project management tools.
**Participants**: James, Alberto, Arnold, Steven, Andrea, David
**Core need**: Feature depth comparable to ADP/Sage with construction-specific compliance and usability that doesn't require an implementation consultant.

---

## Methodological Notes

### Data Collection

The interviews were conducted by a third-party market research firm (Business Advantage) on behalf of a construction software vendor. The semi-structured format covered: role/responsibilities, company structure, software tools, accounting workflows, financial challenges, tax handling, and digitization priorities. Interviews lasted 60--90 minutes each.

### Analysis Approach

Thematic analysis was applied following a six-phase process:

1. **Familiarization**: All 27 transcripts were processed for keyword frequency across 9 theme categories (1,000+ data points extracted)
2. **Coding**: Contextual passages (300-character windows) extracted for each theme, yielding ~400 coded passages
3. **Theme identification**: Codes grouped into 10 themes plus 4 cross-cutting insights
4. **Theme review**: Each theme validated against participant count and quote evidence
5. **Theme definition**: Written descriptions with interpretation and design implications
6. **Reporting**: Insight statements with observation-interpretation-implication structure

### Limitations

- Interviews were conducted for general construction software market research, not specifically for payroll product discovery. Payroll-specific questions were limited.
- Revenue and employee count data was incomplete for many participants.
- Self-reported tool usage may not reflect actual daily workflow.
- Sample skews toward owner-operators and office managers; field worker perspectives are underrepresented.

---

## Appendix: Software Tool Frequency


| Tool                    | Mentions | Context                                           |
| ----------------------- | -------- | ------------------------------------------------- |
| QuickBooks (various)    | 18       | Primary accounting for most SMBs                  |
| Procore                 | 10       | Project management, document control              |
| Sage (100/300)          | 5        | Accounting for larger operations                  |
| BuilderTrend            | 4        | Project management, residential focus             |
| Excel                   | 15       | Gap-filler for everything software doesn't do     |
| ADP                     | 3        | Payroll processing service                        |
| Foundation Software     | 2        | Construction-specific accounting                  |
| Aspire                  | 2        | Landscape/service industry management             |
| Oracle NetSuite         | 2        | Enterprise accounting/ERP                         |
| Service Titan           | 1        | Home service scheduling/estimating                |
| Gusto                   | 1        | Payroll (mentioned in evaluation, not active use) |
| Paylocity               | 1        | Payroll processing                                |
| Heartland               | 1        | Payroll processing                                |
| DOS-based custom system | 1        | Legacy accounting (since 1993)                    |


