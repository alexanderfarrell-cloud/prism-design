# Prism Construction Payroll — Persona Journey Maps (Visual)
## Pass 1: Mermaid Journey Diagrams

> *Trimble Financials | Prism Payroll | U.S. SMB Construction Contractors*
> *Last Updated: March 9, 2026*
> *Companion to: `User-Journey-Maps-Pass1-Persona.md`*

**Rendering:** These diagrams render natively in VS Code (install "Markdown Preview Mermaid Support" extension), GitHub, GitLab, Notion, and Obsidian.

**Reading the score bar:**
Each step carries an experience quality score from 1–5, representing the persona's emotional state at that moment in their Prism journey.

| Score | Experience |
|-------|-----------|
| 5 | Delighted — moment of truth, exceeds expectation |
| 4 | Positive — smooth, confident, in control |
| 3 | Neutral — functional, acceptable, some friction |
| 2 | Frustrated — effort required, unclear path |
| 1 | Blocked / Anxious — pain point, fear of failure |

Scores reflect the **Prism future state** experience. The arc within each diagram tells the trust-building story.

---

## Persona 1: Payroll Admin (PR Admin)

```mermaid
journey
    title PR Admin — Payroll Administration with Prism
    section Initial Setup
      Guided company wizard: 3: Admin
      Tax ID and SUI rate config: 3: Admin
      Sign Form 8655 POA: 3: Admin
      Banking and ACH setup: 4: Admin
    section Employee Management
      Add employees via 7-step wizard: 4: Admin
      ESS self-onboarding invite sent: 4: Admin, Employee
      Readiness indicator shows Operational: 5: Admin
    section Run Payroll
      Review time exceptions dashboard: 4: Admin
      Initiate payroll run: 4: Admin
      Drill-down calculation review: 5: Admin
      Clear AI anomaly flag checklist: 5: Admin
      Approve payroll — explicit and final: 4: Admin
    section Disbursement and Compliance
      Monitor ACH status per employee: 4: Admin
      Resolve failed ACH with guided retry: 3: Admin
      Proactive tax deposit deadline alert: 5: Admin
      File and remit taxes on correct schedule: 5: Admin
    section Ongoing Administration
      Update settings in Config Hub: 4: Admin
      Handle effective-dated rate change: 4: Admin
      Review 7-year audit trail: 4: Admin
```

**Arc:** Cautious setup (3) → Run confidence builds (4–5) → Compliance trust locks in (5)

---

## Persona 2: Owner / Operator

```mermaid
journey
    title Owner/Operator — Financial Visibility and Compliance Oversight
    section Daily Check
      Open Dashboard — pay period status: 4: Owner
      Scan Attention Required panel: 4: Owner
      Review 60-day deadline tracker: 5: Owner
    section Job Cost Visibility
      Pull labor cost by job post-run: 5: Owner
      Review fully burdened cost breakdown: 5: Owner
      Compare actual vs estimated labor: 5: Owner
    section Compliance Safety Net
      Receive new state jurisdiction alert: 4: Owner
      AI guidance for new tax obligation: 4: Owner
      Confirm off-cycle run status: 4: Owner
    section Growth and Scale
      Add employees in a new state: 3: Owner, Admin
      System handles multi-state withholding: 5: Owner
      Worker classification confidence score reviewed: 4: Owner
    section Year-End Review
      CPA reviews payroll data in Prism: 4: Owner, CPA
      W-2 and 1099-NEC confirmed before distribution: 5: Owner
      7-year history supports audit defense: 5: Owner
```

**Arc:** Informed at a glance (4) → Job profitability clarity (5) → Compliance safety net (5) → Scale without crisis (4→5)

---

## Persona 3: Field Supervisor

```mermaid
journey
    title Field Supervisor — Crew Time Submission and Approval
    section Start of Day
      View live crew roster in Traqspera: 4: Supervisor
      Confirm who is on site: 4: Supervisor
    section Daily Time Entry
      Select job and trade from pre-built list: 4: Supervisor, Crew
      Split multi-trade hours for a worker: 3: Supervisor
      Time entries tagged with job and cost code: 4: Supervisor
    section End-of-Week Approval
      Open approval queue — all crew time listed: 4: Supervisor
      Missing entries flagged automatically: 4: Supervisor
      Correct errors before approving: 3: Supervisor
      One-tap approve entire crew: 5: Supervisor
    section Exception Resolution
      Admin flags a suspicious entry: 3: Supervisor
      Supervisor corrects with audit trail: 4: Supervisor
      Approval confirmed — payroll proceeds: 5: Supervisor
```

**Arc:** Straightforward daily habit (4) → Multi-trade friction smoothed (3→4) → Approval as meaningful act (5) → Disputes resolved cleanly (4→5)

---

## Persona 4: Employee (W-2)

```mermaid
journey
    title Employee (W-2) — Getting Paid Right and Managing My Own Info
    section Onboarding
      Receive ESS invite link: 4: Employee
      Self-enter W-4 and direct deposit: 4: Employee
      State withholding elections confirmed: 4: Employee
    section Payday
      Open pay stub in ESS portal: 5: Employee
      See each trade rate and job listed: 5: Employee
      WAOT calculation explained clearly: 4: Employee
      Verify net pay is correct: 5: Employee
    section Self-Service Updates
      Update direct deposit in ESS: 5: Employee
      Admin approval notification sent: 4: Employee, Admin
      Update W-4 for new dependent: 4: Employee
      Effective date confirmed in portal: 4: Employee
    section Multi-State Work
      Work on job site in new state: 3: Employee
      Correct state withholding applied automatically: 5: Employee
      New state line visible on next pay stub: 4: Employee
    section Year-End
      W-2 available for download January 5th: 5: Employee
      File taxes without waiting for mail: 5: Employee
```

**Arc:** Easy onboarding (4) → Pay stub clarity builds trust (5) → Self-sufficiency (5) → Multi-state handled invisibly (5)

---

## Persona 5: 1099 Subcontractor

```mermaid
journey
    title 1099 Subcontractor — Getting Paid and Getting My Tax Docs
    section Getting Set Up
      GC admin sets up via 1099 wizard path: 3: Sub, Admin
      Misclassification guardrail verified: 4: Sub, Admin
      W-9 data captured digitally: 3: Sub
    section Active Work Period
      Submit time or invoice per agreed process: 3: Sub
      Payment disbursed on agreed schedule: 4: Sub
      ACH deposit arrives on time: 4: Sub
    section Self-Service Access
      Log into ESS portal — payment history: 4: Sub
      Update ACH bank account info: 5: Sub
      Admin confirmation received: 4: Sub, Admin
    section Year-End Tax Documentation
      Receive portal notification — 1099-NEC ready: 5: Sub
      Download 1099-NEC January 10th: 5: Sub
      No phone calls needed: 5: Sub
```

**Arc:** Passive setup (3) → Reliable payments (4) → Self-service empowerment (5) → Frictionless year-end (5)

---

## Persona 6: CPA / Bookkeeper (External)

```mermaid
journey
    title CPA/Bookkeeper — Quarterly and Year-End Payroll Review
    section System Access
      Receive read-only CPA role access: 4: CPA
      RBAC scoped to data only — no run controls: 4: CPA
      PII and bank data appropriately masked: 4: CPA
    section Quarterly Work
      Pull payroll register — earnings-line detail: 5: CPA
      Export CSV or PDF for 941 preparation: 5: CPA
      Verify deposit history against EFTPS schedule: 4: CPA
      Review employer cost summary: 5: CPA
    section Year-End Filing
      Confirm W-2 amounts before distribution: 5: CPA
      Confirm 1099-NEC amounts before distribution: 5: CPA
      E-file preparation with complete history: 5: CPA
    section Audit Support
      Query 7-year immutable change audit trail: 5: CPA
      Reconstruct specific pay period without admin: 5: CPA
      Pull labor cost by job for profitability review: 5: CPA
```

**Arc:** Appropriately scoped access (4) → Self-service data access eliminates admin dependency (5) → Audit defense confidence (5)

---

*Narrative companion: `User-Journey-Maps-Pass1-Persona.md`*
*Capability flow visuals: `User-Journey-Maps-Pass2-Capability-Visual.md`*
