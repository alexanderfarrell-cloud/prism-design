# Prism Payroll (Lista) — Authoritative Backlog Definition

**Last Updated:** March 18, 2026
**Purpose:** This document is the single authoritative definition of the Lista project backlog. When this document or any collaborator refers to "the backlog," it means the epics listed here — and all features and user stories (current and future) that are children of those epics — in the Azure DevOps project **Lista**.

ADO Project: `Lista` | Organization: `ViewpointVSO`

---

## What This Document Is

This file establishes a bounded, definitive scope for the Lista backlog. The ADO project contains additional epics that pre-date or are adjacent to the core Prism Payroll product (e.g., platform scaffolding, exploratory spikes, team process items). Those items are **not** part of this backlog.

The backlog is exactly the 17 active epics listed below. Epic **681941** is included for completeness but is in **Removed** state — it was a duplicate and all scope was consolidated into **681144**.

---

## Backlog Overview — Epic Summary

> **First Active Milestone** = the milestone in which each epic first delivers substantive working functionality (not a stub or shell). Epics that span multiple milestones continue to deliver in subsequent ones per the phasing detail below.

| ADO ID | Tag | Title | ADO State | First Active Milestone |
|---|---|---|---|---|
| **— Alpha (June 2026) —** | | | | |
| [668778](https://dev.azure.com/ViewpointVSO/_workitems/edit/668778) | E1 | Setting Up Companies for Payroll | Active | Alpha |
| [668798](https://dev.azure.com/ViewpointVSO/_workitems/edit/668798) | E2 | Payroll Configuration Hub | New | Alpha |
| [672405](https://dev.azure.com/ViewpointVSO/_workitems/edit/672405) | E3 | Employee Management | New | Alpha |
| [681929](https://dev.azure.com/ViewpointVSO/_workitems/edit/681929) | E-TC | Time Collection & Traqspera Integration | New | Alpha |
| [681930](https://dev.azure.com/ViewpointVSO/_workitems/edit/681930) | E4 | Earnings & Rate Calculation | New | Alpha |
| [681934](https://dev.azure.com/ViewpointVSO/_workitems/edit/681934) | E5 | Tax Withholding & Deductions | New | Alpha |
| [682274](https://dev.azure.com/ViewpointVSO/_workitems/edit/682274) | E-RP | Payroll Run & Approval Workflow | New | Alpha |
| [681947](https://dev.azure.com/ViewpointVSO/_workitems/edit/681947) | E12 | Security, RBAC & Platform Compliance | New | Alpha |
| [684212](https://dev.azure.com/ViewpointVSO/_workitems/edit/684212) | E-DC | Payroll Dashboard & Command Center | New | Alpha |
| **— Beta (Trimble Dimensions) —** | | | | |
| [681144](https://dev.azure.com/ViewpointVSO/_workitems/edit/681144) | E3b | Employee Self-Service (ESS) Portal | New | Beta |
| [681936](https://dev.azure.com/ViewpointVSO/_workitems/edit/681936) | E6 | Disbursement & Money Movement | New | Beta |
| [681940](https://dev.azure.com/ViewpointVSO/_workitems/edit/681940) | E8 | Tax Filing & Compliance Reporting | New | Beta |
| [681943](https://dev.azure.com/ViewpointVSO/_workitems/edit/681943) | E9 | Prism Accounting Integration & Job Costing | New | Beta |
| [681945](https://dev.azure.com/ViewpointVSO/_workitems/edit/681945) | E10 | Reporting & Audit | New | Beta |
| [681946](https://dev.azure.com/ViewpointVSO/_workitems/edit/681946) | E11 | AI-Powered Assistance & Insights | New | Beta |
| **— GA —** | | | | |
| [681939](https://dev.azure.com/ViewpointVSO/_workitems/edit/681939) | E7 | Employee Pay Stubs & Deliverables | New | GA |
| [681942](https://dev.azure.com/ViewpointVSO/_workitems/edit/681942) | E8b | Tax Remittance & Payment | New | GA |
| ~~[681941](https://dev.azure.com/ViewpointVSO/_workitems/edit/681941)~~ | ~~—~~ | ~~Employee Self-Service Portal~~ | Removed (duplicate of 681144) | — |

---

## Epic Details

The following sections provide the goal, key feature areas, and milestone phasing for each backlog epic, organized by milestone priority then functional domain.

---

## Alpha Epics (June 2026)

---

### Configuration & Administration

---

#### E1 — Setting Up Companies for Payroll `#668778`

**Goal:** A guided, dependency-aware setup wizard that takes a construction owner-operator from zero payroll configuration to authorized, compliant, and ready to run their first payroll — without requiring payroll expertise. The wizard enforces dependency order, validates critical inputs at entry, and blocks first-run payroll until all required configuration is complete and the company is legally authorized for e-file and e-pay.

**Feature Areas:**
- Guided Experience Framework — linear wizard container, dependency locking, save/resume, progress tracking
- Company Profile Confirmation — read-only identity confirmation from Prism core; Primary Payroll Contact designation
- Federal Tax Configuration — EIN validation, entity type, Form 941 vs. 944 filing frequency
- Banking Connectivity & Verification — IAV-first bank linking with micro-deposit fallback; payroll readiness gate
- State Tax Jurisdiction Setup & SUI Configuration — primary state SUI rate, withholding account ID, mandatory employer contributions; all 50 states
- Local Tax Jurisdiction Detection — auto-detection from Zip+4; prompts only when local registration required
- Workers' Comp Policy Capture — WC carrier, policy number, NCCI classification codes, EMR
- Digital Authorization Setup — Form 8655 generation, e-signature, authorization status gate; state forms at Beta
- Payroll Scheduling & Calendar Logic — pay frequency, work week start, first pay date; state compliance validation
- Multi-State Nexus Configuration — additional nexus states; SUI + withholding per state; reciprocity awareness
- Trade Library & Compensation Rules — company trade library, WC code mapping, OT rules, pay type library
- Payroll GL Chart of Accounts Mapping — payroll category → Prism Accounting GL mapping; job cost labor distribution routing
- YTD Historical Data Migration — per-employee YTD import for mid-year activations; reconciliation validation
- 1099 / Subcontractor Configuration — subcontractor toggle, $600 threshold tracking, filing preferences
- Prism Accounting Integration Verification — job/phase code sync health check; Phase Code → Trade rate mapping

**Milestone Phasing:**
- **Alpha (June 2026):** Wizard framework, company profile, federal tax, banking, primary state tax, pay schedule, Form 8655 authorization. Single company, single state.
- **Beta:** Multi-state nexus, workers' comp, additional pay schedules, state authorization forms (top-10 states), YTD import, GL mapping, trade library, 1099 toggle, local tax detection.
- **GA:** Full 50-state coverage, complete trade/comp rules, Prism Accounting integration verification, Setting items managed via E2 hub.

**Architecture Note:** Stories are tagged **Setup** (wizard-blocking, required for first payroll) or **Setting** (Hub-managed, not wizard-blocking). Setting-tagged stories are cross-linked to their Hub implementation features under E2. See `docs/supporting/best-practices/Setup-vs-Setting-Hub-Architecture.md`.

---

#### E2 — Payroll Configuration Hub `#668798`

**Goal:** A persistent, centralized Payroll Configuration Hub — the always-accessible surface for the PR Admin to view payroll readiness state, manage all post-wizard Settings, and keep payroll configuration accurate as their business evolves.

**Feature Areas:**
- Company Payroll Configuration Hub — Shell & Navigation — Hub landing, 3-state readiness indicator, Settings category cards
- Pay Schedule Settings Management — in-Hub view and management of named pay schedules; multi-schedule support
- State Tax & Compliance Settings — SUI rate updates, state tax account ID management, nexus state additions
- Banking & Payment Settings — banking verification status, re-verification flow, payment speed adjustment
- Benefits & Deductions Configuration — pre-tax (Section 125, 401k) and post-tax deduction plan library management
- Payroll GL Chart of Accounts Mapping — map payroll expense and liability categories to Prism Accounting COA
- Trade & Compensation Rules Management — OT rules, shift differentials, holiday calendar — view and update in Hub
- 1099 / Subcontractor Settings Management — 1099 tracking toggle, filing preferences, $600 threshold monitoring
- YTD Historical Data Import — per-employee YTD import for mid-year activations; validation and locking
- Workers' Compensation Settings — WC policy details, class code management, annual renewal workflow
- Configure Pay (Wage) Rates — company pay rate library; hourly, task-based, job classification mappings

**Milestone Phasing:**
- **Alpha (June 2026):** Hub shell, navigation frame, 3-state readiness indicator, Settings category cards (most "coming soon" at Alpha).
- **Beta:** Full Settings panel suite — state tax, banking, pay schedules, GL mapping, benefits/deductions, trade/comp rules, 1099 settings, YTD import.
- **GA:** Workers' comp settings, audit trail and full change history, wage rate configuration, complete 50-state compliance advisory support.

---

### Employee Management

---

#### E3 — Employee Management `#672405`

**Goal:** Enable the PR Admin to add new workers, capture all compliance data required before a first paycheck can be issued, and maintain that data over the employee lifecycle — including multi-state withholding, state reciprocity agreements, and local/municipal tax obligations.

**Feature Areas:**
- E3-1: Employee Onboarding Wizard — end-to-end guided setup for new employees; classification guardrail; payroll-ready gating
- E3-2: Tax Jurisdiction Intelligence — multi-state withholding, reciprocity detection, local tax identification; proactive and address/job-site-driven
- E3-3: Pay Rate Management — multiple rates per employee by trade/cost code, effective dates, WC code assignment
- E3-4: Payment Method Setup — direct deposit (split accounts), check, bank verification
- E3-5: Employee Self-Service — mobile invite, self-complete W-4 and payment method (Phase 2)
- E3-6: Employee Lifecycle Management — profile maintenance, change audit trail, contextual compliance prompts, termination/reactivation
- E3-7: Employee List & Visibility — status-based list, setup completion indicator, search/filter

**Milestone Phasing:** Phase 1 targets non-union, non-certified contractors (1–25 employees) with multi-state support from day 1. Texas-first GA, expanding to multi-state GA in Phase 2.

---

### Payroll Processing Pipeline

The five epics below form the core payroll run pipeline in execution order. E-TC, E4, E5, and E-RP are all Alpha; E6 (Disbursement) is Beta.

---

#### E-TC — Time Collection & Traqspera Integration `#681929`

**Goal:** Bridge field time data and the Prism Payroll calculation engine. Traqspera is the authoritative source of time records; supervisor-approved hours coded to job, cost code, and trade type flow directly into payroll without manual transcription.

**Feature Areas:**
- E3-1: Traqspera Integration Pipeline — file import (Alpha) and live API (Beta/GA); employee mapping; ingestion and validation
- E3-2: Time Review Dashboard — admin view of all period time by employee, job, trade; totals; filtering
- E3-3: Exception Management — surface and resolve missing, unapproved, unmatched, and incomplete entries; block payroll on unresolved
- E3-4: Time Adjustments & Audit — admin override with immutable change log; exclusion flagging
- E3-5: Historical Time Access — prior-period data access for retroactive adjustments (GA)

**Milestone Phasing:**
- **Alpha:** File import stub, basic time review, exception list.
- **Beta:** Live Traqspera API, approval enforcement, full exception panel, filtering, adjustments.
- **GA:** Full real-time connection, historical data, complete audit trail.

---

#### E4 — Earnings & Rate Calculation `#681930`

**Goal:** The core computation layer that transforms approved time data into gross pay. Handles trade-based rate lookup per time entry, FLSA and state-specific overtime, Weighted Average Overtime (WAOT) for multi-rate weeks, double-time, holiday and PTO pay types, final pay rules by state, and supplemental/retroactive pay.

**Feature Areas:**
- E4-1: Trade-Based Rate Lookup — dynamic rate selection per time entry by trade/cost code
- E4-2: Standard Overtime Engine — FLSA 40-hour weekly OT; workweek boundary logic
- E4-3: WAOT Calculation — weighted average regular rate for multi-rate workweeks
- E4-4: State OT & Double-Time Rules — all 50-state OT rules; double-time thresholds; higher-of logic
- E4-5: Additional Pay Types — holiday, PTO, supplemental, retroactive pay; final pay by state
- E4-6: Payroll Summary & Earnings Detail — admin earnings breakdown per employee; rate audit trail

**Milestone Phasing:**
- **Alpha:** Regular wages only, single rate, mock payroll run.
- **Beta:** Trade-based rate lookup, FLSA OT, WAOT, key state rules.
- **GA:** All 50-state OT/DT, all pay types, final pay by state, multiple simultaneous schedules.

**Output:** Gross pay locked per employee per pay run (handoff to E5).

---

#### E5 — Tax Withholding & Deductions `#681934`

**Goal:** The gross-to-net calculation layer. Takes gross pay from E4 and applies all statutory withholding (federal income tax, 50-state income tax, local/municipal taxes, FICA), employer tax contributions (FUTA, SUTA, workers' comp), and voluntary deductions (pre-tax and post-tax) to produce net pay.

**Feature Areas:**
- E5-1: Federal Tax Withholding — FIT from W-4 elections; supplemental wage flat rates
- E5-2: Multi-State & Local Tax Withholding — all 50-state income tax; local/municipal taxes; reciprocity application
- E5-3: FICA & Employer Taxes — employee and employer FICA; FUTA; SUTA per state
- E5-4: Pre-Tax Deductions — 401k, health, HSA, FSA; correct sequencing
- E5-5: Post-Tax Deductions & Garnishments — Roth, garnishments with CCPA limits
- E5-6: Workers' Comp & Burden Summary — WC cost estimate; total labor burden per employee

**Milestone Phasing:**
- **Alpha:** Simplified federal withholding for mock run.
- **Beta:** Full W-4-driven FIT, broad multi-state, key localities, employer FICA/FUTA/SUTA, pre-tax deductions, WC estimate.
- **GA:** All 50-state, full local coverage, post-tax deductions, garnishments, Additional Medicare Tax.

**Input:** Locked gross pay from E4 (US-29 / Feature 683262).

---

#### E-RP — Payroll Run & Approval Workflow `#682274`

**Goal:** The operational conductor between the calculation engines (E4 + E5) and downstream execution (E6, E7, E9). Presents computed payroll results in a reviewable, actionable form; surfaces AI-generated anomalies as an interactive pre-submission checklist; governs the admin approval action; and triggers disbursement and GL posting.

**Run States:** Draft → Calculating → Under Review → Approved → Disbursed → Closed

**Key Capabilities:**
- Run Initiation: pay period selection, employee scope, run type (Regular / Off-Cycle)
- Pre-Run Readiness Gate: time locked, employees complete, no blocking exceptions — all green before calculation
- Payroll Run Review Screen: full roster with gross pay, deductions, taxes, net pay, employer costs; per-employee drill-down to earnings lines, trade/job breakdown, withholding detail
- AI Pre-Submission Checklist: E11 anomaly flags surfaced as interactive checklist; admin must acknowledge or dismiss all before approval enabled
- Run-Level Adjustments: employee exclusion, disbursement hold, off-cycle item addition
- Approval Action: explicit, irreversible admin sign-off; triggers E6 (disbursement), E9 (GL posting), E7 (pay stubs)
- Off-Cycle Run Workflow: termination, bonus, correction runs with scoped review and approval

**Milestone Phasing:**
- **Alpha:** Simplified mock run — calculate button, per-employee summary (gross, estimated deductions, estimated net); no approval action or disbursement.
- **Beta:** Full review screen, employer cost totals, AI anomaly checklist, approval action (disbursement stubbed per E6 Beta scope).
- **GA:** Live downstream triggers (E6/E9/E7 on approval), off-cycle run workflow, full state machine, complete audit trail, idempotent approval.

---

### Platform Foundation

---

#### E12 — Security, RBAC & Platform Compliance `#681947`

**Goal:** The foundational non-functional requirements that make Prism Construction Payroll trustworthy, auditable, and compliant: Role-Based Access Control (4 primary roles), PII encryption at rest (AES-256) and in transit (TLS 1.2+), SSN and bank account masking, multi-tenant data isolation, 7-year data retention enforcement, WCAG 2.1 AA accessibility, SOC 2 Type II alignment, and 99.9% uptime SLA.

**Role Definitions:**
- **Payroll Admin:** Full payroll configuration and execution; all reports and employee data
- **Field Supervisor:** Time approval only; no pay rates, no payroll data
- **Employee:** Own pay stubs and personal data only (via E3b / ESS portal)
- **CPA / Bookkeeper:** Read-only reports and registers; no submission; no full account numbers

**Feature Areas:**
- E12-1: Role-Based Access Control — four-role RBAC with API-layer enforcement; admin role assignment
- E12-2: PII Encryption & Masking — AES-256 at rest; TLS in transit; SSN and bank masking in all views
- E12-3: Multi-Tenant Data Isolation — data-layer isolation; explicit multi-tenant test suite per milestone
- E12-4: Data Retention Enforcement — 7-year minimum; programmatic deletion prevention
- E12-5: Security Audit Logging — immutable PII access and admin action log; 7-year retention
- E12-6: Accessibility (WCAG 2.1 AA) — all interfaces; automated + manual testing per release
- E12-7: SOC 2 Alignment & SLA — control framework; 99.9% uptime; SOC 2 Type II posture

**Milestone Phasing:**
- **Alpha:** Basic RBAC (Admin only), AES-256 encryption, SSN/bank masking, multi-tenant isolation.
- **Beta:** Full 4-role RBAC, security audit log, 99.9% SLA defined.
- **GA:** Data retention enforcement, WCAG 2.1 AA, SOC 2 alignment, KMS rotation policy.

**Active from Alpha through GA and ongoing.**

---

#### E-DC — Payroll Dashboard & Command Center `#684212`

**Goal:** The primary landing surface for the PR Admin — a command center that communicates the state of the payroll world at a glance: what needs attention right now, where the current pay period stands, what's coming up, and the key numbers that matter most.

**In-Scope Panels:**
- Current Pay Period Status & Run Entry — live pay period state, run status indicator, context-sensitive Run Payroll / Resume Run CTA
- Attention Required Panel — aggregated cross-module action items (exceptions, incomplete setup, unsigned forms, upcoming tax deposits) with direct resolution links
- Upcoming Dates & Deadline Tracker — 60-day rolling view of pay dates, tax deposits, state filing deadlines, and compliance expirations; urgency-ranked
- Recent Activity & Run History Summary — last completed run card: total net, employee count, approver, approval date, click-through to full history
- Payroll Metrics & Data Highlights — YTD gross, YTD employer tax cost, active headcount, 8-week trailing average weekly net pay
- Quick Actions & Navigation Hub — context-sensitive one-click entry points to most common workflows
- Notifications & AI Insights — system event notifications and AI-generated operational insights from E11

**Milestone Phasing:**
- **Alpha (June 2026):** Current Pay Period Status panel with run state + Run Payroll CTA; minimal Attention Required; next pay date. Dashboard shell established.
- **Beta:** Full Attention Required panel; Upcoming Dates (60-day with tax deadlines); Recent Activity / Last Run summary; Payroll Metrics; Quick Actions; system notifications.
- **GA:** AI Insights panel (E11 integration); notification history; real-time state refresh; mobile responsive layout; RBAC-tuned views for Owner and CPA roles.

---

## Beta Epics (Trimble Dimensions)

---

### Employee Management

---

#### E3b — Employee Self-Service (ESS) Portal `#681144`

**Goal:** A secure, mobile-friendly self-service portal allowing employees and 1099 subcontractors to access payroll documents, manage payment preferences, update personal information, and adjust tax withholding elections — without requiring the PR Admin as intermediary.

**Feature Areas:**
- Secure employee portal with authenticated access (separate from PR Admin login)
- Pay stub access: view and download current and historical pay stubs
- Year-end tax document access: W-2 and 1099-NEC download
- Direct deposit and payment method self-management
- Personal information self-update with admin notification
- Federal and state W-4 withholding election self-service (admin review and approval workflow)
- Pay and earnings history dashboard: YTD gross, deductions summary, hours by pay period
- Employee notification preferences: payday alerts, document availability, W-4 change confirmations
- Mobile-responsive design optimized for smartphone use in the field; all 50 U.S. states

**Note:** Epic 681941 was an early placeholder for this scope and is in **Removed** state. All scope is consolidated here under 681144.

---

### Payroll Processing Pipeline

---

#### E6 — Disbursement & Money Movement `#681936`

**Goal:** Get money to workers on time, every run. Encompasses ACH direct deposit via NACHA-compliant files, printed check generation, off-cycle payroll runs, pay period finalization with immutable audit record, and failed ACH handling with guided retry workflow.

**Feature Areas:**
- E6-1: Pre-Disbursement Review & Finalization — summary screen, admin confirmation, pay period close, audit record
- E6-2: ACH Direct Deposit — NACHA file generation, bank transmission, settlement tracking, split accounts
- E6-3: Printed Check Generation — PDF check face for check-payment employees
- E6-4: Failed Payment Handling — ACH return detection, admin alerts, retry workflow
- E6-5: Off-Cycle Payroll Runs — termination, bonus, and correction runs outside normal schedule

**Milestone Phasing:**
- **Alpha:** Mock/simulated run only, no actual disbursement.
- **Beta:** Real calculation run, pre-disbursement summary, pay period finalization, disbursement stubbed.
- **GA:** Live ACH, printed check, status tracking, failed ACH handling, off-cycle runs.

---

### Tax Compliance

---

#### E8 — Tax Filing & Compliance Reporting `#681940`

**Goal:** Generation, assembly, and submission of all required federal, state, and local payroll tax filings: Form 941, Form 940, W-2, W-3, 1099-NEC, all-state income tax returns, SUTA filings, local tax returns, and new hire reporting.

**Feature Areas:**
- E8-1: Filing Calendar & Obligation Management — all-obligation calendar with proactive alerts
- E8-2: Federal Form 941 & 940 — generate, review, and e-file quarterly and annual federal returns
- E8-3: W-2 Generation & Year-End Distribution — W-2 generation, digital delivery, SSA EFW2 e-file
- E8-4: 1099-NEC Generation & Distribution — 1099 tracking, generation, IRS FIRE e-file
- E8-5: State & Local Tax Filings — all-state income tax and SUTA; local filings
- E8-6: New Hire Reporting — automated submission to 50-state registries within 20 days
- E8-7: Filing Status & Audit Trail — confirmation tracking; rejection surfacing; 7-year history

**Milestone Phasing:**
- **Beta:** Filing obligation identification, filing calendar, proactive deadline alerts, 941 framework.
- **GA:** Full federal/state/local filing execution, W-2/1099-NEC, new hire reporting, filing status tracking.

---

### Integration & Intelligence

---

#### E9 — Prism Accounting Integration & Job Costing `#681943`

**Goal:** Full bi-directional data flow — jobs, cost codes, and chart of accounts flow from Prism Accounting into Prism Payroll; post-payroll, fully burdened labor cost (gross wages + employer FICA + FUTA/SUTA + WC) flows back to Prism Accounting job costing and GL, updating real-time project labor cost on every payroll run.

**Feature Areas:**
- E9-1: Job & Cost Code Sync — real-time sync of jobs/cost codes from Prism Accounting
- E9-2: GL Account Mapping — admin configures payroll expense categories to chart of accounts
- E9-3: Labor Burden Calculation — fully burdened cost per job/cost code/trade per run
- E9-4: GL Journal Entry Generation — auto-generate debit/credit entries on payroll finalization
- E9-5: Prism Accounting Posting — post journal entries and job cost allocations to Prism Accounting GL
- E9-6: Reconciliation Support — payroll register vs. GL journal entry reconciliation report

**Milestone Phasing:**
- **Alpha:** No integration.
- **Beta:** Integration stub; job/cost code read; GL account mapping configured.
- **GA:** Full bi-directional integration, labor burden allocation, auto-generated GL journal entries, real-time job cost update, reconciliation report.

---

#### E10 — Reporting & Audit `#681945`

**Goal:** Complete visibility into every payroll run, tax obligation, and labor cost dollar for the PR Admin, owner, and CPA. Includes the payroll register (earnings-line detail), labor cost and job costing reports (fully burdened by job/cost code), tax liability summaries, and the 7-year immutable change audit trail.

**Feature Areas:**
- E10-1: Payroll Register — earnings-line detail per employee per run; summary + drill-down; CSV/PDF export
- E10-2: Labor Cost & Job Costing Reports — fully burdened labor by job/cost code/trade; budget vs. actuals
- E10-3: Tax Liability Reports — tax withheld and owed by jurisdiction per run and quarter; 941 prep summary
- E10-4: Employer Cost Summary — employer FICA, FUTA/SUTA, WC per employee and run total
- E10-5: Payroll History & Archive — 7-year run history; filterable and exportable
- E10-6: Change Audit Trail — immutable log of all payroll-sensitive data changes

**Milestone Phasing:**
- **Alpha:** Mock run output only.
- **Beta:** Full payroll register, employer cost summary, CSV/PDF export, CPA read-only access.
- **GA:** Labor cost by job, tax liability reports, 7-year history, change audit trail.

---

#### E11 — AI-Powered Assistance & Insights `#681946`

**Goal:** Intelligent, proactive assistance layered on the core payroll engine: payroll anomaly detection before disbursement, tax setup advisor from job site data, plain-language payroll run summaries, proactive compliance alerts, and worker classification confidence scoring.

**Feature Areas:**
- E11-1: Payroll Anomaly Detection — gross pay deviation; zero-pay flags; duplicate entry detection; admin acknowledge flow
- E11-2: Payroll Run Summary — plain-language AI run narrative; variance explanation; post-run display
- E11-3: Tax Setup Advisor — new jurisdiction detection from time entries; reciprocity guidance; direct action link
- E11-4: Worker Classification Scoring — IRS factor confidence score for 1099 contractors; risk tiering; high-risk alerts
- E11-5: Compliance Alerts — regulatory change monitoring; proactive state/federal law alerts

**Milestone Phasing:**
- **Alpha:** No AI features.
- **Beta:** Payroll anomaly detection, zero-pay flags, duplicate detection, admin acknowledge flow, plain-language run summary.
- **GA:** Tax setup advisor, worker classification scoring, compliance alerts, run comparison narrative.

---

## GA Epics

---

### Employee Deliverables

---

#### E7 — Employee Pay Stubs & Deliverables `#681939`

**Goal:** Generate, deliver, and retain digital pay stubs for every payroll run. Translates gross-to-net output into a clear, compliant, construction-aware pay statement showing multiple earnings lines by rate, job, and trade type; WAOT transparency; and all deductions in the sequence applied.

**Feature Areas:**
- E7-1: Pay Stub Generation — itemized PDF per employee per run; construction earnings layout
- E7-2: State Compliance Content — 50-state content requirements; YTD, employer info
- E7-3: Digital Delivery — email with secure link; delivery status; bounce handling
- E7-4: Retention & Access — 4-year immutable storage; admin and CPA access

**Milestone Phasing:** GA only. Alpha and Beta: pay stub data model and template defined; no stub generation until disbursement is live.

---

### Tax Compliance

---

#### E8b — Tax Remittance & Payment `#681942`

**Goal:** Automated deposit of all withheld and employer payroll taxes to federal, state, and local agencies. Manages EFTPS deposit scheduling (semi-weekly and monthly depositor rules), state income tax and SUTA payment submissions, and local tax payments.

**Feature Areas:**
- E8b-1: Federal Deposit Schedule & EFTPS — deposit schedule determination; EFTPS deposit initiation and confirmation
- E8b-2: State Tax Payments — state income tax and SUTA payment initiation per state schedule
- E8b-3: Local Tax Payments — local tax payment initiation for applicable municipalities
- E8b-4: Deposit Monitoring & Alerts — upcoming obligation calendar; missed deposit alerts; penalty window tracking
- E8b-5: Deposit History & Reconciliation — payment history; 941 reconciliation; 7-year audit trail

**Milestone Phasing:** Alpha/Beta: no remittance (deposit obligation amounts shown in E8 filing calendar at Beta). GA: automated EFTPS deposits, all-state income tax and SUTA payments, proactive alerts, failed deposit handling.

---

## Backlog Scope Rules

These rules govern how this backlog is maintained going forward:

1. **Bounded to these 17 epics.** Any net-new epic that belongs to this backlog must be explicitly added to this document before it is considered "in the backlog." ADO items in the Lista project not listed here are out of scope.

2. **Features and stories are in scope by parentage.** Any Feature or User Story that is a child of one of the above epics is automatically part of the backlog. This document does not need to enumerate every feature and story — the epic parentage relationship in ADO is the definitive link.

3. **New features and stories created under these epics are automatically in scope.** There is no separate approval process to add children to existing epics. The backlog grows through normal ADO work item creation under the epics listed here.

4. **Removed items stay documented.** Epic 681941 is listed in Removed state for record-keeping. Removed work items under any of the above epics remain traceable but are not active backlog.

5. **The backlog definition document is the reference point.** When this document and ADO diverge (e.g., a new epic is added to ADO but not here), use this document to resolve. Update this document when scope changes are formally agreed.

---

## Milestone Quick Reference

| Milestone | Target | Key Backlog Deliverables |
|---|---|---|
| **Alpha** | June 2026 | Company setup wizard (single state), dashboard shell, mock payroll run (E4/E5 simplified), basic RBAC, PII encryption |
| **Beta** | Trimble Dimensions | Full payroll run (E4/E5/E-RP), Traqspera API, multi-state withholding, Settings Hub panels, ESS portal, payroll register, anomaly detection, AI run summary, pre-disbursement finalization (disbursement stubbed) |
| **GA** | TBD | Live ACH/check disbursement, full tax filing + remittance, all 50-state coverage, Prism Accounting integration, full reporting suite, pay stubs, W-2/1099-NEC, AI advisor + classification scoring, SOC 2 alignment |

---

## Supporting Documentation Index

| Document | Location |
|---|---|
| Company Setup PRD | `docs/documentation/Company_Setup_PRD_Feb2026.md` |
| Payroll Config Hub PRD | `docs/documentation/prds/Payroll_Config_Hub_PRD.md` |
| Employee PRD | `docs/documentation/Employee_PRD_Feb23.md` |
| Time Collection PRD | `docs/documentation/Time_Collection_PRD_Mar2.md` |
| Earnings & Rate Calculation PRD | `docs/documentation/Earnings_Rate_Calculation_PRD_Mar2.md` |
| Tax Withholding & Deductions PRD | `docs/documentation/Tax_Withholding_Deductions_PRD_Mar2.md` |
| Disbursement PRD | `docs/documentation/Disbursement_PRD_Mar2.md` |
| Pay Stubs & Deliverables PRD | `docs/documentation/Pay_Stubs_Deliverables_PRD_Mar2.md` |
| Tax Filing & Compliance PRD | `docs/documentation/Tax_Filing_Compliance_PRD_Mar2.md` |
| Tax Remittance & Payment PRD | `docs/documentation/Tax_Remittance_Payment_PRD_Mar2.md` |
| Prism Accounting & Job Costing PRD | `docs/documentation/Prism_Accounting_JobCosting_PRD_Mar2.md` |
| Reporting & Audit PRD | `docs/documentation/Reporting_Audit_PRD_Mar2.md` |
| AI Assistance & Insights PRD | `docs/documentation/AI_Assistance_Insights_PRD_Mar2.md` |
| Security, RBAC & Platform PRD | `docs/documentation/Security_RBAC_Platform_PRD_Mar2.md` |
| Payroll Dashboard PRD | `docs/documentation/prds/Payroll_Dashboard_PRD.md` |
| Milestone Statements of Scope | `docs/documentation/Milestone_Statements_of_Scope.md` |
| Setup vs. Setting Hub Architecture | `docs/supporting/best-practices/Setup-vs-Setting-Hub-Architecture.md` |
| Initiative Grooming Playbook | `docs/documentation/best-practices/Initiative-Grooming-Playbook.md` |
| Visual Backlog (Miro) | [Miro Board](https://miro.com/app/board/uXjVJglUVR0=/?share_link_id=128266091116) |
