# Prism Construction Payroll — Capability Journey Maps (Visual)
## Pass 2: Mermaid Flowchart Diagrams

> *Trimble Financials | Prism Payroll | U.S. SMB Construction Contractors*
> *Last Updated: March 9, 2026*
> *Companion to: `User-Journey-Maps-Pass2-Capability.md`*

**Rendering:** These diagrams render natively in VS Code (install "Markdown Preview Mermaid Support" extension), GitHub, GitLab, Notion, and Obsidian.

**Node color legend:**

| Color | Meaning |
|-------|---------|
| Blue | Trigger / start state |
| Default (white/gray) | Process step or user action |
| Gold / Orange | Decision gate — flow depends on outcome |
| Red | Risk or blocked state |
| Green | Success / completion state |
| Purple | Epic / system handoff boundary |

---

## Flow 1: Onboarding & Setup

**Trigger:** Contractor signs on to Prism Payroll for the first time.
**End state:** All configuration complete — first payroll run unlocked.

```mermaid
flowchart TD
    classDef gate fill:#f5a623,stroke:#c47d0a,color:#000
    classDef risk fill:#c0392b,color:#fff,stroke:#922b21
    classDef success fill:#27ae60,color:#fff,stroke:#1e8449
    classDef trigger fill:#2980b9,color:#fff,stroke:#1a5276
    classDef handoff fill:#7b68ee,color:#fff,stroke:#5a4fcf

    A([Contractor Signs On]):::trigger --> B[Enter EIN, Legal Name, Business Type]
    B --> C[Configure State Tax IDs and SUI Rates]
    C --> D[Configure Pay Schedules]
    D --> E{Form 8655\nPOA Signed?}:::gate
    E -->|No — Hard Gate| E1[Tax Filing and Remittance Blocked]:::risk
    E1 -.->|Admin signs| E
    E -->|Yes| F[Configure Banking and ACH]
    F --> G[Define Trade Library — Beta]
    G --> H[Map GL Accounts — Beta]
    H --> I[Add First Employee via Wizard]
    I --> J[Employee Self-Onboarding via ESS — Beta]
    J --> K{Readiness\nIndicator}:::gate
    K -->|Setup Incomplete| K1[Surface and Resolve Missing Items]:::risk
    K1 -.->|Admin resolves| K
    K -->|Operational| L([First Payroll Run Unlocked]):::success
```

**Key gates:** Form 8655 (tax authority block) · Readiness Indicator (run block)
**Primary epics:** 668778 · 668798 · 672405 · 681144 · 681947

---

## Flow 2: Time-to-Payroll

**Trigger:** Pay period closes — PR Admin initiates payroll run.
**End state:** Payroll approved and ready for disbursement.

```mermaid
flowchart TD
    classDef gate fill:#f5a623,stroke:#c47d0a,color:#000
    classDef risk fill:#c0392b,color:#fff,stroke:#922b21
    classDef success fill:#27ae60,color:#fff,stroke:#1e8449
    classDef trigger fill:#2980b9,color:#fff,stroke:#1a5276
    classDef system fill:#5dade2,color:#fff,stroke:#2e86c1

    A([Pay Period Closes]):::trigger --> B[Crew Enters Time in Traqspera\nJob + Cost Code + Trade Type]
    B --> C[Supervisor Reviews and Approves Crew Time]
    C --> D[Approved Time Syncs to Prism\nAlpha: File Import — Beta: Live API]:::system
    D --> E{Time Exceptions\nPresent?}:::gate
    E -->|Yes — Unapproved, Unmatched,\nor Missing Entries| E1[Admin Resolves Each Exception\nin Time Review Dashboard]:::risk
    E1 -.->|Resolved| E
    E -->|None — Run Gate Clear| F[Admin Initiates Payroll Run\nPay Period Snapshot Locked]
    F --> G[Earnings Engine: Trade Rate Lookup\nper Time Entry]:::system
    G --> H[WAOT Calculation\nfor Multi-Rate Workweeks]:::system
    H --> I[State-Specific Overtime Rules Applied]:::system
    I --> J[Tax Withholding Engine\nFIT, State, Local, FICA, FUTA, SUTA]:::system
    J --> K[Pre-Tax and Post-Tax\nDeduction Sequencing]:::system
    K --> L{AI Anomaly\nFlags Present?}:::gate
    L -->|Yes — Hours Spike, Zero Pay,\nDuplicate Entry| L1[Admin Clears Interactive\nPre-Submission Checklist]:::risk
    L1 -.->|All flags resolved| L
    L -->|None or All Cleared| M[Approve Button Unlocked]
    M --> N([Payroll Approved\nTriggered: Disbursement + GL Post + Pay Stubs]):::success
```

**Key gates:** Time Exceptions (blocks run initiation) · AI Anomaly Checklist (blocks approval)
**Most fragile handoff:** Traqspera → Prism Time Review Dashboard
**Primary epics:** 681929 · 682274 · 681930 · 681934 · 681946

---

## Flow 3: Disbursement

**Trigger:** Payroll approval (simultaneous with GL posting and pay stub generation).
**End state:** All workers paid, pay stubs delivered, pay period closed and immutable.

```mermaid
flowchart TD
    classDef gate fill:#f5a623,stroke:#c47d0a,color:#000
    classDef risk fill:#c0392b,color:#fff,stroke:#922b21
    classDef success fill:#27ae60,color:#fff,stroke:#1e8449
    classDef trigger fill:#2980b9,color:#fff,stroke:#1a5276
    classDef system fill:#5dade2,color:#fff,stroke:#2e86c1

    A([Payroll Approved]):::trigger --> B[Pre-Disbursement Summary Review\nPayment Method and Amounts per Employee]
    B --> C{Pay Period\nFinalization}:::gate
    C -->|Not yet confirmed| C1[Admin Must Explicitly Finalize\nMoney Does Not Move Until Done]:::risk
    C1 -.->|Admin confirms| C
    C -->|Confirmed — Immutable Record Created| D[ACH File Generated — NACHA Compliant\nAlpha/Beta: Simulated]:::system
    D --> E[Checks Generated for\nNon-Direct-Deposit Employees\nGA Only]:::system
    E --> F[Bank Processes ACH\nEmployees Credited on Pay Date]
    F --> G{ACH\nStatus?}:::gate
    G -->|Settled| H[Disbursement Complete\nStatus Updated per Employee]:::success
    G -->|Failed| G1[Failed ACH Surfaced Immediately\nGuided Retry Workflow]:::risk
    G1 -->|Resubmit| F
    G1 -->|Switch to Check| E
    H --> I[Pay Stubs Generated — GA Only\nMultiple Earnings Lines + WAOT + Deductions]:::system
    I --> J[Pay Stubs Delivered via ESS\nSecure Email Link + Portal Access]
    J --> K[Pay Period Closed — Status: Disbursed\nImmutable for Audit]:::success
```

**Key gates:** Pay Period Finalization (money does not move until explicit admin confirmation)
**Alpha/Beta note:** ACH and pay stubs are simulated at Alpha/Beta; live at GA
**Primary epics:** 681936 · 681939 · 681144 · 682274 · 681947

---

## Flow 4: Tax & Compliance

**Trigger:** Payroll run approved (creates obligations) OR filing deadline approaching.
**End state:** All deposits remitted, all filings submitted, all deadlines met.

```mermaid
flowchart TD
    classDef gate fill:#f5a623,stroke:#c47d0a,color:#000
    classDef risk fill:#c0392b,color:#fff,stroke:#922b21
    classDef success fill:#27ae60,color:#fff,stroke:#1e8449
    classDef trigger fill:#2980b9,color:#fff,stroke:#1a5276
    classDef system fill:#5dade2,color:#fff,stroke:#2e86c1

    A([Payroll Run Approved]):::trigger --> B[Deposit Obligations Calculated\nDeposit Schedule Determined\nSemi-Weekly vs. Monthly — Automated]:::system
    B --> C[Filing Calendar Updated\nFederal, State, SUTA, Local Due Dates]:::system
    C --> D[Proactive Alerts Sent\n60-Day Rolling Deadline Window]:::system

    D --> E[Federal EFTPS Deposit — GA Only\nFICA + FIT + FUTA on Correct Schedule]:::system
    E --> F{Deposit\nSucceeded?}:::gate
    F -->|Failed| F1[Failed Deposit Surfaced\nGuided Retry — Prevents Penalty Accrual]:::risk
    F1 -.->|Resolved| E
    F -->|Success| G[State Income Tax Remittance — GA Only]:::system
    G --> H[SUTA Remittance per Active State — GA Only]:::system
    H --> I[Local Tax Remittance — GA Only\nPhiladelphia, RITA, Kentucky, PA School District]:::system

    I --> J{Quarterly\nFiling Due?}:::gate
    J -->|Yes| K[Form 941 Assembled and E-Filed\nBeta: Framework — GA: Live Submission]:::system
    K --> L[State Income Tax Returns Filed — GA Only]:::system

    J -->|Annual Filing| M[Form 940 FUTA Reconciliation — GA Only]:::system
    M --> N[W-2 Generated and Distributed via ESS]:::system
    N --> O[1099-NEC Generated and E-Filed to IRS FIRE — GA Only]:::system

    L --> P[New Hire Reporting\nFiled to State Registry Within 20 Days]:::system
    O --> P
    P --> Q([7-Year Filing and Deposit History\nImmutable — Audit Ready]):::success
```

**Key risk:** EFTPS deposit schedule error (most common SMB compliance failure — automated in Prism)
**Beta scope:** Filing calendar visible, 941 framework, deposit amounts surfaced — no live remittance
**Primary epics:** 681940 · 681942 · 681946

---

## Flow 5: Financial Integration

**Trigger:** Payroll run approved (simultaneous with Disbursement trigger).
**End state:** Fully burdened labor costs posted to Prism Accounting by job/cost code; GL reconciled.

```mermaid
flowchart LR
    classDef gate fill:#f5a623,stroke:#c47d0a,color:#000
    classDef risk fill:#c0392b,color:#fff,stroke:#922b21
    classDef success fill:#27ae60,color:#fff,stroke:#1e8449
    classDef trigger fill:#2980b9,color:#fff,stroke:#1a5276
    classDef system fill:#5dade2,color:#fff,stroke:#2e86c1
    classDef accounting fill:#8e44ad,color:#fff,stroke:#6c3483

    PA([Prism Accounting]):::accounting -->|Jobs, Cost Codes,\nChart of Accounts| INT[Prism Payroll\nIntegration Layer\nEpic 681943]:::system
    INT -->|Time coding reference| TQ[Traqspera\nTime Entry]
    TQ -->|Approved time coded\nto Job + Cost Code| RUN([Payroll Run Approved]):::trigger
    RUN --> GL[GL Journal Entries\nAuto-Generated\nGross Wages + Employer Taxes\n+ Deductions by GL Account]:::system
    RUN --> BC[Fully Burdened Labor Cost\nCalculated per Time Entry\nGross + FICA + FUTA/SUTA\n+ Workers Comp]:::system
    GL -->|Posted to| PA
    BC -->|Job Cost Posted\nby Job and Cost Code| PA
    PA --> REC{GL\nReconciliation}:::gate
    REC -->|Discrepancy Found| REC1[Admin or CPA\nInvestigates Variance]:::risk
    REC1 -.->|Resolved| REC
    REC -->|Balanced| REP([Labor Cost by Job\nAvailable in Reporting\nImmediately Post-Run]):::success
```

**Left-to-right reading:** Prism Accounting sends reference data in → Approved payroll sends burdened costs back out
**Alpha/Beta note:** No live integration at Alpha; proof-of-concept stub at Beta; full bidirectional at GA
**Primary epics:** 681943 · 681930 · 681934 · 681945

---

## Flow 6: Visibility & Oversight

**Trigger:** Any stakeholder opens Prism Payroll to understand current state.
**End state:** Stakeholder has the information needed to act — without calling anyone.

```mermaid
flowchart TD
    classDef gate fill:#f5a623,stroke:#c47d0a,color:#000
    classDef risk fill:#c0392b,color:#fff,stroke:#922b21
    classDef success fill:#27ae60,color:#fff,stroke:#1e8449
    classDef trigger fill:#2980b9,color:#fff,stroke:#1a5276
    classDef admin fill:#2e86c1,color:#fff,stroke:#1a5276
    classDef owner fill:#27ae60,color:#fff,stroke:#1e8449
    classDef cpa fill:#8e44ad,color:#fff,stroke:#6c3483
    classDef ai fill:#d35400,color:#fff,stroke:#a04000

    ENTRY([Stakeholder Opens Prism Payroll]):::trigger --> ROLE{Which\nRole?}:::gate

    ROLE -->|PR Admin| ADM1[Dashboard — Pay Period Status\nAttention Required Panel\n60-Day Deadline Tracker]:::admin
    ADM1 --> ADM2[Resolve Attention Items\nTime Exceptions, Incomplete Setup,\nUnsigned Forms, Tax Deadlines]:::admin
    ADM2 --> ADM3[Pull Payroll Register\nEarnings-Line Detail per Employee per Run]:::admin
    ADM3 --> ADM4[Review AI Run Summary\nPlain-Language Anomaly Digest — Beta]:::ai
    ADM4 --> ADM5([Admin Has Full Operational Picture\nNo Phone Calls Needed]):::success

    ROLE -->|Owner| OWN1[Dashboard — Financial and Compliance Lens\nRBAC-Tuned View — GA]:::owner
    OWN1 --> OWN2[Labor Cost by Job and Cost Code\nFully Burdened — Post-Run — GA]:::owner
    OWN2 --> OWN3[AI Compliance Alerts\nNew State Jurisdiction Detected — GA]:::ai
    OWN3 --> OWN4[Worker Classification\nConfidence Scoring — GA]:::ai
    OWN4 --> OWN5([Owner Has Profitability and\nCompliance Confidence]):::success

    ROLE -->|CPA| CPA1[Read-Only Access\nRBAC Scoped — No Run Controls]:::cpa
    CPA1 --> CPA2[Pull Payroll Register + Employer Cost Summary\nCSV or PDF Export]:::cpa
    CPA2 --> CPA3[Verify Deposit History\nAgainst Filing Calendar]:::cpa
    CPA3 --> CPA4[Confirm W-2 and 1099-NEC\nBefore Distribution]:::cpa
    CPA4 --> CPA5[Query 7-Year Immutable Audit Trail\nNo Admin Assistance Needed]:::cpa
    CPA5 --> CPA6([CPA Has Everything Needed\nFor Filing and Audit Defense]):::success
```

**Key design principle:** Each role sees only what their function requires — RBAC enforced at API layer
**Beta scope:** Admin operational view, payroll register, employer cost summary, CPA read-only access
**GA additions:** Owner and CPA RBAC-tuned views, AI insights, labor cost by job, 7-year history, notification log
**Primary epics:** 684212 · 681945 · 681946 · 681947

---

## Cross-Flow Dependency Diagram

How the six capability flows interlock at their critical handoff points.

```mermaid
flowchart LR
    classDef flow fill:#2980b9,color:#fff,stroke:#1a5276,rx:8
    classDef dep stroke:#e74c3c,stroke-width:2px,stroke-dasharray:5 5

    F1[Flow 1\nOnboarding\nand Setup]:::flow
    F2[Flow 2\nTime-to-Payroll]:::flow
    F3[Flow 3\nDisbursement]:::flow
    F4[Flow 4\nTax and Compliance]:::flow
    F5[Flow 5\nFinancial Integration]:::flow
    F6[Flow 6\nVisibility and Oversight]:::flow

    F1 -->|Trade library + pay rates\nmust exist before rate lookup| F2
    F1 -->|Form 8655 + state tax IDs\nmust exist before any filing| F4
    F2 -->|Payroll approval triggers\nall three simultaneously| F3
    F2 -->|Payroll approval triggers\nGL + job cost post| F5
    F2 -->|Each run creates\ndeposit obligations| F4
    F3 -->|Closed pay periods feed\npayroll register and run history| F6
    F4 -->|Filing and deposit history\nfeed tax liability reporting| F6
    F5 -->|Labor cost by job\nis a reporting output| F6
```

**The critical path:** F1 → F2 → F3/F4/F5 → F6
Any gap in Onboarding blocks Time-to-Payroll. Payroll approval is the single trigger for Disbursement, Tax, and Financial Integration simultaneously. All three converge into Visibility.

---

*Narrative companion: `User-Journey-Maps-Pass2-Capability.md`*
*Persona journey visuals: `User-Journey-Maps-Pass1-Persona-Visual.md`*
