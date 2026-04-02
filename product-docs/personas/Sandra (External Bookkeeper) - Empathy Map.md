# Empathy Map: Sandra

## Context

- **User/Persona:** Sandra, External Bookkeeper / Accountant serving 8-12 small contractor clients (age 48, Enrolled Agent, 18 years experience, solo practice)
- **Based on:** 29 foundational user interviews (SMB construction operators -- Sandra is the "other side" of the CPA/accountant dependency described by 22/27 participants), persona journey maps (Pass 1 CPA/Bookkeeper External), capability journey maps (Pass 2), competitive analysis (QuickBooks, Gusto, Lumber teardowns, competitive brief), PRD persona definitions (External CPA/Bookkeeper role across Payroll Run, Dashboard, Employee Management, Tax Filing, Config Hub, RBAC, and Disbursement initiatives)
- **Date:** March 25, 2026
- **Scenario focus:** Managing payroll and compliance across multiple small contractor clients, transitioning clients from hands-on payroll support to self-sufficient operation with ongoing oversight

---

## The Map

### Says

- "I need to see all my clients' payroll status without logging into 10 different files."
- "My clients use QuickBooks because I use QuickBooks."
- "I'd rather they run payroll themselves -- but I need to know when something goes wrong."
- "I spend more time cleaning up data than analyzing it."
- "If I miss a deadline, it's my reputation -- not just their penalty."
- "I've looked at other tools, but switching means retraining myself and every client."
- "The first few payroll runs, I do it with them. After that, they're on their own -- mostly."
- "Year-end is four weeks of controlled panic."

### Does

- Logs into each client's QuickBooks file on a rotating schedule to run or review payroll, reconcile books, and prepare for tax filings
- Runs payroll directly for 3-4 clients weekly; reviews post-run registers for clients who run their own
- Files quarterly 941s, state withholding returns, and SUTA reports for all clients in a concentrated 2-week window after quarter-end
- Maintains a master spreadsheet tracking filing deadlines across all clients and jurisdictions
- Walks new clients through their first payroll setup: employee onboarding, W-4, state withholding, direct deposit, pay schedule
- Runs the first several payrolls for new clients, then transitions to oversight as the client gains confidence
- Reconstructs 1099-NEC payment records at year-end for clients who don't track sub payments systematically
- Generates W-2s and 1099-NECs across 10+ clients in a 4-week year-end window
- Evaluates new software tools 1-2 times per year but hasn't switched from QuickBooks because the migration cost across all clients is prohibitive

### Thinks

- "If Liam runs payroll while I'm focused on another client's 941, will I catch the error before quarterly review -- or after it's already cost him money?"
- "Every client I have to hand-hold through payroll is an hour I'm not spending on my other clients -- or on growing the practice."
- "I know QuickBooks Payroll isn't great for construction, but what am I going to switch to that works for all my clients?"
- "If I could see a dashboard of all my clients' payroll health in one place, I'd catch problems in minutes instead of weeks."
- "My smallest clients can't even give me complete records at tax time. How am I supposed to file accurately from a shoebox?"
- "The moment I recommend a new tool, I own the outcome. If it breaks, that's my problem."
- "I'm one missed deadline away from losing a client's trust -- and they'll never know how many deadlines I've saved them from."
- "I should be able to take on 3 more clients, but I can't if each one needs this much of my time."

### Feels

- **Stretched** across too many clients, each with their own compliance calendar, state footprint, and data quality -- the cognitive load of context-switching is constant
- **Responsible** for compliance outcomes she doesn't fully control -- her clients make configuration changes, miss deadlines, and expand to new states without telling her
- **Trapped** by QuickBooks -- she knows it's inadequate for construction payroll but can't justify the cost of migrating her entire practice to something new
- **Proud** of her track record -- zero IRS penalties attributable to her work across 18 years -- and anxious about maintaining it as her practice grows
- **Frustrated** that she spends her most valuable hours on her lowest-value work: reconstructing records, re-keying data, and checking for problems that a better system would surface automatically
- **Protective** of her clients, who trust her with sensitive data and depend on her for things they don't understand -- she feels the weight of that trust
- **Torn** between wanting clients to be self-sufficient (so she can scale) and knowing that self-sufficiency means they'll make mistakes she can't see

---

## Center: Goals & Needs

**Goals -- What Sandra is trying to achieve:**

1. Keep every client compliant and penalty-free across all federal, state, and local filing obligations -- her professional reputation depends on a perfect record
2. Transition clients from hands-on payroll dependence to confident self-operation, while retaining oversight that catches errors before they become penalties
3. Scale her practice by reducing per-client time -- not by working more hours, but by having tools and client capabilities that make each engagement more efficient

**Needs -- What she needs to succeed:**

1. A multi-client oversight surface -- a single view that shows her the payroll health, compliance status, and open issues across all her clients without logging into each one individually
2. Proactive alerts when a client she's not actively managing makes a change that creates a compliance risk -- a new employee in a new state, a missed tax deposit, a withholding configuration error -- surfaced in real time, not discovered at quarterly review
3. A payroll tool she can confidently recommend to her construction clients that handles the things QuickBooks doesn't: WAOT, multi-state reciprocity, job cost allocation, construction-aware pay rates -- so she can stop working around the tool's limitations
4. A clean handoff mechanism: she sets up the client, runs the first payrolls, and the system gradually shifts operational control to the client while keeping Sandra in a supervisory role with visibility and alert access

---

## Analysis

### Says vs. Thinks Gap


| They Say | But They Seem to Think | Insight |
| --- | --- | --- |
| "I'd rather they run payroll themselves." | "But when they do, they make mistakes I don't find out about for weeks -- and by then the damage is done." | Sandra's stated preference for client independence is genuine, but her experience has taught her that independence without oversight is dangerous. She needs a system that enables client self-service AND gives her real-time visibility into what they're doing. The CPA/Bookkeeper role in Prism's RBAC model must be more than read-only access to reports -- it must include proactive alert delivery. |
| "My clients use QuickBooks because I use QuickBooks." | "I'm the reason they're stuck on a tool that doesn't work well for construction -- and I don't have a better alternative to offer them." | Sandra is aware that she's the platform bottleneck from Theme 3. She constrains her clients' software choices not out of stubbornness but because she can't risk her practice on an unproven tool. The product that wins Sandra doesn't just need to be better than QuickBooks -- it needs to be trustworthy enough that she'll stake her reputation on recommending it to all her clients. |
| "If I miss a deadline, it's my reputation." | "And I'm tracking 40+ deadlines across 10 clients on a color-coded spreadsheet that I built myself." | Sandra's compliance tracking system is a personal artifact that works only as long as her attention never lapses. She knows it's fragile. A system-generated compliance calendar that covers all her clients' obligations -- with proactive alerts, not just passive display -- replaces her most anxiety-inducing workflow with an actual safety net. |
| "I've looked at other tools, but switching means retraining myself and every client." | "I actually want to switch -- I just can't afford the risk of a bad migration across 10 companies simultaneously." | The barrier isn't awareness or willingness -- it's migration risk at scale. Sandra would adopt a better tool if she could migrate one client at a time, validate it works, and then roll it out to others. A phased adoption path (not "migrate everything at once") directly addresses her real objection. |


### Key Tensions

1. **Wants client independence but fears the visibility gap it creates.** Sandra's practice can only scale if her clients run their own payroll. But every client she hands off becomes a blind spot -- she doesn't see their mistakes until quarterly review. The tension is between scalability and quality control. She needs a system that lets clients operate independently while keeping her informed in real time.

2. **Is the platform gatekeeper but feels trapped by the platform.** Sandra dictates QuickBooks because she knows it, and her clients trust her judgment. But she knows QuickBooks Payroll is inadequate for construction. She's stuck in a paradox: she's too influential to switch casually (all her clients follow her), and too experienced to ignore the limitations. The product that breaks this tension must earn her trust individually before she'll recommend it collectively.

3. **Charges for time but her most time-consuming work is her lowest value.** Sandra's billable hours are consumed disproportionately by record reconstruction, data re-entry, and manual compliance tracking -- work that a better system would automate. Her highest-value work (advisory, error prevention, strategic tax planning) is what gets squeezed when her administrative load is high. A tool that eliminates her low-value work lets her spend more time on the work her clients actually value -- and would pay more for.

4. **Is the safety net but has no safety net of her own.** Sandra is the person 22/27 interview participants described as "my accountant handles all of that." She catches her clients' errors, meets their deadlines, and prevents their penalties. But nobody catches Sandra's errors. She has no automated backup, no system-generated alerts, no second set of eyes. Her master spreadsheet is one missed row from a compliance failure. She needs the same safety net she provides to her clients.

### Design Implications

1. **Build a multi-client practice dashboard.** Sandra doesn't need a single-company command center -- she needs a practice-level view. "Which of my 10 clients have open payroll issues? Which have upcoming deadlines this week? Which ran payroll since I last checked?" This is the surface that makes Prism viable for bookkeeper practices, not just individual contractors. The CPA/Bookkeeper role in the RBAC model (E12) must support multi-company access with a single login and an aggregated status view.

2. **Make the handoff a first-class product feature, not a manual process.** Sandra's transition from running payroll for Liam to overseeing Liam's self-run payroll is a product journey, not just a training exercise. The system should support explicit role transition: Sandra starts as the PR Admin, then shifts to a supervisory role where she receives alerts, reviews runs post-completion, and retains access to the compliance calendar -- all without the client needing to reconfigure anything. This maps to a "Bookkeeper Admin" to "Bookkeeper Reviewer" role evolution.

3. **Surface configuration drift proactively.** The payroll handoff breaks silently because clients make changes Sandra doesn't see: adding employees in new states, changing pay rates without effective dates, missing a tax deposit. The Config Hub (E-PD) and Employee Management (E2) modules must generate real-time notifications to the supervisory bookkeeper when compliance-relevant changes occur -- not just to the PR Admin. If Liam adds an employee in a new state, Sandra should know before the next payroll run, not at quarterly review.

4. **Earn Sandra's trust, earn all her clients.** Sandra is a channel, not just a user. If Prism convinces Sandra it's better than QuickBooks Payroll for her construction clients, she will migrate her entire practice -- 8-12 companies at once. This makes the bookkeeper onboarding experience a multiplier: one convinced practitioner produces 10+ new company accounts. The migration path must support phased adoption (start with one client, prove it works, roll out to others) and offer practice-level economics (multi-client pricing, not per-company).

5. **Replace the master spreadsheet with a system-generated compliance calendar.** Sandra's color-coded deadline spreadsheet is the artifact the product must eliminate. The Tax Filing module (E8) and Dashboard (E-PD) must aggregate all filing obligations across all of Sandra's clients into a single, proactively alerting compliance surface. Deadlines approaching within 7 days, deadlines missed, filings rejected -- all surfaced without Sandra having to check each client individually. This is the single feature most likely to trigger Sandra's adoption decision.
