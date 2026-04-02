# Empathy Map: Marty

## Context

- **User/Persona:** Marty, Owner/Operator Small Construction (age 50, 1 employee, <$5M GAR, certified electrician)
- **Based on:** 29 foundational user interviews (SMB construction operators), persona journey maps (Pass 1 Owner/Operator + 1099 Subcontractor), capability journey maps (Pass 2), competitive analysis (QuickBooks, Gusto, Lumber teardowns, competitive brief)
- **Date:** March 20, 2026
- **Scenario focus:** Managing sub payments and confronting the decision to hire his first W-2 employee

---

## The Map

### Says

- "Everyone I hire is a sub."
- "I'll put someone on payroll when the business is big enough."
- "My accountant takes care of all the tax stuff."
- "I just write them a check at the end of the week."
- "I don't need payroll software -- it's just me."
- "I looked at Gusto but I didn't even know which plan to pick."
- "I know what I paid the guys, roughly."
- "Paperwork is the worst part of running a business."

### Does

- Pays subcontractors via check or direct bank transfer after each job or at end of week -- no formal invoicing from or to subs
- Tracks payments from memory or a notebook; has no digital record of individual sub payments
- Treats all hired labor as 1099 subcontractors regardless of the actual working relationship
- Relies entirely on his accountant for taxes, 1099-NEC filings, and any financial compliance
- Estimates labor cost per job by rough mental math -- no calculation of employer-side costs
- Browses Gusto and QuickBooks Payroll websites occasionally but never starts the sign-up process
- Avoids hiring W-2 employees specifically to avoid payroll obligations
- Scrambles at tax time to reconstruct payment records his accountant needs for 1099-NEC filing

### Thinks

- "If I hire a real employee, I'll need to figure out withholding, workers' comp, tax deposits -- and I don't even know where to start."
- "Can I just pay this guy as a sub even though he works for me every week?"
- "What if I'm already doing something wrong and I don't know it?"
- "My bids would be more accurate if I knew what labor actually costs me, not just what I paid out."
- "$200 a month for ADP seems like a lot for one employee."
- "The IRS probably doesn't care about a small operation like mine." (But he isn't sure.)
- "Every hour I spend on paperwork is an hour I'm not making money on a job site."
- "I need to grow, but growing means more admin work I don't want."

### Feels

- **Overwhelmed** by the perceived complexity of "real payroll" -- W-4s, I-9s, state registration, tax deposits all blur into an impenetrable wall
- **Paralyzed** at the Scale-Up Cliff -- he wants to hire but the unknown unknowns prevent him from acting
- **Exposed** to risks he doesn't fully understand -- misclassification penalties, missing 1099-NECs, unregistered state obligations
- **Frustrated** that the administrative burden of growing feels disproportionate to the size of his business
- **Independent** and proud of running his own operation -- but isolated when it comes to financial complexity
- **Skeptical** that any software tool is built for someone like him -- a one-person shop with dirt on his hands
- **Anxious** at tax time when his accountant asks for records he can't fully reconstruct

---

## Center: Goals & Needs

**Goals -- What Marty is trying to achieve:**

1. Grow his business by hiring reliable W-2 employees without drowning in administrative complexity
2. Pay his crew and subs accurately and on time -- quickly, from the job site, without paperwork
3. Know the true, fully burdened labor cost per job so his bids reflect reality and his margins are predictable

**Needs -- What he needs to succeed:**

1. A way to start payroll that doesn't require him to already understand payroll -- answer simple questions, get a working setup
2. Guardrails that prevent compliance mistakes before they happen -- especially 1099 vs. W-2 misclassification
3. A record-keeping system that tracks sub payments automatically so tax time isn't a scramble
4. Visibility into what labor actually costs (not just what he paid out) so he can bid accurately and protect his margins

---

## Analysis

### Says vs. Thinks Gap


| They Say                                                       | But They Seem to Think                                                                                      | Insight                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Everyone I hire is a sub."                                    | "I don't actually know the difference between a sub and an employee -- I just know subs are simpler."       | Marty's classification decisions are driven by administrative avoidance, not legal understanding. A system with IRS factor-based classification guardrails would protect him from an existential risk he doesn't know he's carrying.                                       |
| "I'll put someone on payroll when the business is big enough." | "I don't know what 'big enough' means -- I'm really just putting it off because I don't know how to start." | "Big enough" is a rationalization for avoiding complexity. The trigger isn't business size -- it's having a path through the setup that doesn't require existing payroll knowledge. Instant activation ("answer 5 questions, start paying your crew") removes the barrier. |
| "My accountant takes care of all the tax stuff."               | "I hope he's filing everything right -- I wouldn't know if he wasn't."                                      | Marty has delegated a critical obligation to someone he trusts but cannot verify. Unlike Alex (who at least reviews output), Marty has zero visibility into what's being filed on his behalf. He needs compliance confirmation in language he understands.                 |
| "I know what I paid the guys, roughly."                        | "I actually can't reconstruct the exact amounts, and that scares me at tax time."                           | "Roughly" means he's guessing. His bids are based on gut feel, his 1099-NECs may be inaccurate, and his profitability per job is unknown. Even basic automatic payment tracking would transform his financial awareness.                                                   |


### Key Tensions

1. **Wants to grow but fears what growth requires.** Marty's ambition to hire is in direct conflict with his fear of payroll complexity. He's stuck at the Scale-Up Cliff -- wanting to cross it but unable to see what's on the other side. Every day he delays hiring a W-2 employee, he either limits his capacity or increases his misclassification risk by treating long-term workers as subs.
2. **Values independence but needs guidance.** Marty is proud of being his own boss and running his operation his way. But payroll compliance isn't a domain where independence works -- you can't improvise tax deposits. He needs structured guidance that doesn't feel patronizing or like it's designed for someone with an accounting degree.
3. **Avoids paperwork but creates more of it later.** By not tracking sub payments in real time, Marty creates a tax-time crisis every year. The very avoidance behavior that makes his daily life simpler makes his annual obligations harder. A system that captures payment data as a byproduct of paying people (not as a separate task) breaks this cycle.
4. **Trusts his mental math but bids without real data.** Marty's gut-feel labor cost estimates feel reliable because he's experienced. But fully burdened cost (wages + employer FICA + FUTA/SUTA + workers' comp) is 15-30% higher than the check he writes. Every bid based on "what I paid the guys" systematically understates his true labor cost.

### Design Implications

1. **Make the first payroll run achievable in minutes, not weeks.** Marty won't survive a 1-2 week implementation process (Lumber's model). He needs to answer "what state are you in?", "how often do you want to pay people?", and "what's your EIN?" -- and have the system configure everything else. If setup feels like a project, he won't start it.
2. **Build the 1099 vs. W-2 guardrail into the add-worker flow.** When Marty adds a new worker, the system should ask behavioral questions (IRS factor test) and tell him plainly: "Based on your answers, this person should be classified as a W-2 employee" or "This person qualifies as an independent contractor." Don't require Marty to know the rules -- apply them for him.
3. **Track payments as a natural byproduct of paying.** Every check or ACH that flows through the system should automatically create a payment record. At year-end, 1099-NEC generation should be a button press, not a reconstruction project. The system should eliminate the tax-time scramble by recording what Marty currently carries in his head.
4. **Show burdened cost alongside gross pay.** Every time Marty pays someone, show him what that person actually cost: "$850 paid + $65 FICA + $21 FUTA/SUTA + $38 workers' comp = $974 true labor cost." Over time, this transforms his bidding from gut feel to data -- without requiring him to learn accounting.
5. **Use plain language for every compliance obligation.** "You owe $312 in federal tax deposits by Friday" is comprehensible. "EFTPS semi-weekly deposit obligation per lookback period determination" is not. Every notification, alert, and deadline should be written for someone who doesn't know what a 941 is.

