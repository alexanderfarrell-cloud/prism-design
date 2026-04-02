# Empathy Map: Liam

## Context

- **User/Persona:** Liam, Owner/Operator Architecture Firm (age 43, 3 employees, $7.5M GAR)
- **Based on:** 29 foundational user interviews (SMB construction operators), persona journey maps (Pass 1 Owner/Operator), capability journey maps (Pass 2), competitive analysis (QuickBooks, Gusto, Lumber teardowns, competitive brief)
- **Date:** March 20, 2026
- **Scenario focus:** Managing payroll and labor costs as a design-build firm owner who delegates payroll to an external accountant

---

## The Map

### Says

- "My accountant handles all of that."
- "I just sign what I'm told to sign at tax time."
- "QuickBooks works fine for what we need."
- "I don't have time to learn another system."
- "Accounting is a necessary evil."
- "I'd rather be selling jobs or managing projects than looking at spreadsheets."
- "I need something affordable, not another expensive tool I'll underutilize."
- "I trust my accountant to catch anything that's off."

### Does

- Delegates the entire payroll run to his external accountant every two weeks
- Reviews payroll output but doesn't interrogate the tax line items
- Tracks employee hours informally -- salaried staff aren't tracked at all, hourly employee uses a shared spreadsheet
- Manually transfers invoice and expense data into QuickBooks
- Hires 1099 subcontractors for specialized work and leaves payment processing to his accountant
- Signs W-2s and 1099-NECs at year-end without verifying the underlying data
- Forwards employee paycheck questions to his accountant instead of answering directly
- Occasionally Googles payroll tax questions but rarely acts on what he finds

### Thinks

- "Am I actually making money on this project, or is labor eating the margin?"
- "What if my accountant misses a filing deadline -- do I get the penalty?"
- "I'm paying for QuickBooks features I don't use and missing features I actually need."
- "If I hire another employee or take a project out of state, what changes?"
- "I should probably understand this stuff better, but I don't know where to start."
- "There has to be a simpler way to do this than juggling multiple systems."
- "Am I overpaying for an accountant to do something software should handle?"
- "One compliance mistake could cost more than a year of accountant fees."

### Feels

- **Anxious** about compliance -- terrified of IRS penalties he doesn't fully understand
- **Frustrated** that he can't answer a simple employee question about their paycheck without calling his accountant
- **Resigned** to accounting and payroll being a black box he pays someone else to manage
- **Disappointed** by mediocre all-in-one solutions that overpromise and underdeliver
- **Vulnerable** because his entire payroll compliance depends on one external person
- **Guilty** that he doesn't understand his own business's financial obligations better
- **Relieved** every time a tax season passes without incident -- but the relief doesn't last

---

## Center: Goals & Needs

**Goals -- What Liam is trying to achieve:**

1. Run a successful design-build business with healthy profit margins on every project
2. Keep payroll accurate and compliant without becoming a payroll expert -- he wants a safety net, not more features
3. See the true labor cost per project (fully burdened, not just gross wages) so he can make informed decisions about profitability

**Needs -- What he needs to succeed:**

1. A system that abstracts payroll complexity so he can verify correctness without understanding the rules
2. Visibility into fully burdened labor cost by project -- not just what employees were paid, but what they actually cost
3. Proactive compliance alerts that arrive before deadlines, not after penalty notices
4. The ability to answer basic employee paycheck questions himself without a two-day turnaround through his accountant

---

## Analysis

### Says vs. Thinks Gap


| They Say                                  | But They Seem to Think                                                                                             | Insight                                                                                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "My accountant handles all of that."      | "I have no idea if it's being done right -- I just hope it is."                                                    | Liam has outsourced the work but not the risk. His sense of control is an illusion. A system that gives him visible confirmation of correctness (without requiring him to understand the rules) would close this gap.                         |
| "QuickBooks works fine for what we need." | "I'm paying for features I don't use and missing the ones I actually need -- like burdened labor cost by project." | "Fine" is resignation, not satisfaction. Liam hasn't switched because the pain isn't acute enough yet -- but QuickBooks Payroll's Dead Zone (no WAOT, no multi-state reciprocity, no burdened cost) will become visible the moment he scales. |
| "I need something affordable."            | "I'm afraid that the tool I actually need would be too complex for me to use."                                     | Price is the stated objection; complexity is the real barrier. Competitors like Lumber require payroll-literate admins to configure rules. Liam needs a product that asks simple questions and infers the rules for him.                      |


### Key Tensions

1. **Wants control but avoids engagement.** Liam wants to know his business is compliant and profitable, but he avoids engaging with the systems that would tell him. He delegates payroll to his accountant then worries about whether it's correct. The tension is between wanting certainty and being unwilling to acquire the knowledge needed for certainty.
2. **Trusts his accountant but can't verify.** Liam expects proactive communication from his accountant about financial issues, but has no independent way to validate what his accountant tells him. He's a business owner who has made himself dependent on a single external person for a critical business function.
3. **Wants to grow but fears the complexity growth creates.** At 3 employees, payroll is manageable. Adding a 4th employee, crossing a state line, or hiring a field worker would push him past the Scale-Up Cliff -- and he knows it. Growth ambition and compliance anxiety are in direct conflict.

### Design Implications

1. **Show the result, not the rule.** Liam doesn't need to configure withholding tables or understand FUTA thresholds. He needs to see a plain-language confirmation that everything was calculated correctly -- "3 employees paid, all tax deposits on schedule, next filing due April 30." Visible compliance without configurable complexity.
2. **Make labor cost per project a first-class output.** Fully burdened cost (gross wages + employer FICA + FUTA/SUTA + workers' comp) by project is the report Liam doesn't know he's missing. Surfacing this immediately after every payroll run transforms payroll from a cost center into a profitability tool.
3. **Replace the accountant dependency with system transparency.** Liam shouldn't need to call someone to answer "why was this paycheck amount?" The pay stub and calculation breakdown should make the answer self-evident -- to Liam, to his employee, and to his accountant when they review at year-end.
4. **Design for the Scale-Up Cliff.** When Liam hires employee #4 or takes a project in a new state, the system should detect the new obligation and guide him through it -- not wait for him to realize he needs to register for state tax withholding in another jurisdiction.

