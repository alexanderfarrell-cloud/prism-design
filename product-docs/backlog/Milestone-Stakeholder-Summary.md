# Prism Construction Payroll — Milestone Summary

**Product:** Prism Construction Payroll (Lista)
**Last Updated:** March 17, 2026
**Audience:** Business stakeholders, leadership, sales, and cross-functional partners

> This document summarizes what each milestone delivers by capability area, in plain business language. For the detailed technical scope behind each section, see `Milestone_Statements_of_Scope.md`.

---

## Milestones at a Glance

| Milestone | Timing | Audience | Purpose |
|---|---|---|---|
| **Foundation** | June 2026 | Internal (Trimble) | Prove direction with a demonstrable end-to-end thin slice |
| **Customer Preview** | Trimble Dimensions | Customers & Prospects | Credible, working construction payroll that earns market feedback |
| **Launch** | GA release | All customers | Complete, production-ready payroll for U.S. construction contractors |

---

## Foundation *(formerly Alpha — Internal, June 2026)*

> Foundation is scoped to demonstrate the end-to-end payroll workflow, not to complete it. The features described below represent the first working increment of each capability area — enough to prove the approach and surface architectural decisions, but not the full production scope. Each capability grows significantly at Customer Preview and reaches its full depth at Launch.

Foundation is an internal milestone. Its purpose is not a complete payroll system — it is a demonstrable, working slice through the full payroll workflow that validates architectural direction and builds internal confidence. A live walkthrough can move from company setup through employee configuration, Traqspera time import, and a simulated payroll run that produces real calculation outputs. No money moves at this milestone, and complexity is intentionally limited to a single company in a single state.

---

### Company & Payroll Setup

Administrators can configure a company for payroll: entering EIN and legal entity details, establishing pay frequency and pay period schedules, and designating a primary work state. The experience validates critical inputs at entry — ensuring the foundational configuration is accurate before any payroll work begins.

---

### Employee Management

The system supports adding W-2 employees with all baseline information required to generate their first paycheck: name, contact details, hire date, a single pay rate, federal W-4 withholding, home-state withholding, and a configured payment method. An employee list reflects payroll-ready status at a glance.

---

### Time Collection

A file-based import from Traqspera brings field time data into the system. Employees are mapped to their time records and hours are surfaced for review before a payroll run begins. This establishes the time-to-payroll data flow end to end — even in stub form — confirming the integration architecture is sound.

---

### Payroll Run

Administrators can initiate a mock payroll run that calculates gross pay at regular straight-time wages, applies a simplified federal income tax withholding estimate, and produces a per-employee summary showing gross pay, estimated deductions, and estimated net pay. The run is simulated — no disbursement occurs — but the calculation pipeline is demonstrably operational and the output is correct for the covered scenarios.

---

### Security & Platform

Basic role-based access control is active (Admin role), all PII is encrypted at rest (AES-256) and in transit (TLS 1.2+), SSNs and bank account numbers are masked in all UI views, and multi-tenant data isolation is enforced. The security foundation is in place from day one.

---
---

## Customer Preview *(formerly Beta — Trimble Dimensions conference)*

> Customer Preview delivers a credible, working construction payroll solution — but it is not the complete product. The features described below represent a meaningful, demonstrable expansion from Foundation across every capability area, with known boundaries that Launch closes. Where a feature is present in partial or constrained form, those boundaries are noted within each section.

Customer Preview is the first external milestone — delivered at Trimble Dimensions to customers and prospects. It transitions from internal demonstration to active market engagement. The system runs a real payroll calculation (disbursement is not yet live), handles the construction-specific complexity that generic tools cannot, and introduces AI assistance. A customer seeing this milestone should clearly understand why Prism Construction Payroll is a better fit for their business than QuickBooks Payroll or Gusto.

---

### Company & Payroll Setup

Company setup expands to handle multi-state payroll. Administrators can register for payroll obligations in multiple states, capture state tax account IDs and agency registration details per state, configure multiple pay schedules, and add workers' compensation policy information at the company level. The Payroll Configuration Hub — the persistent, always-accessible home for all ongoing payroll settings — is live at this milestone, giving administrators a single place to manage and update configuration without re-entering the setup wizard.

---

### Employee Management

A full guided onboarding wizard walks the administrator through adding W-2 employees and 1099 subcontractors, with a built-in IRS factor-based classification guardrail that prevents the misclassification errors that expose SMB construction owners to significant tax liability. Employees can carry multiple pay rates mapped to trade type or cost code — the construction differentiator that single-rate generalist tools cannot replicate. Multi-state withholding is configured proactively: the system detects work-state obligations, applies known reciprocity agreements, and identifies the most common local tax jurisdictions without requiring the administrator to know the rules. Effective-dated rate changes, bank account verification, and a structured termination workflow with final pay prompts are all included. Employees can complete their own W-4 and configure their payment method via a secure mobile-friendly invite link, eliminating the most common admin data-entry burden.

---

### Time Collection

The Traqspera integration becomes live. Approved time flows directly from Traqspera into the payroll module — no manual file export required. Time entries carry job, cost code, and trade type coding through the full chain. Only supervisor-approved time proceeds to payroll; unapproved time, missing entries, and unmatched employees surface in a dedicated exception panel that must be resolved before a run can be initiated. Administrators review the full period's hours by employee, job, and trade before the run begins.

---

### Payroll Calculation

The payroll engine runs a real calculation. Trade-based rate lookup selects the correct pay rate for each time entry based on trade type — the core construction-payroll problem that generic tools ignore. Federal FLSA overtime is applied, with Weighted Average Overtime Rate (WAOT) calculated correctly for employees who worked at multiple rates in the same week. Multi-state income tax withholding runs for both home and work states, with reciprocity agreements applied where applicable. Federal income tax (W-4-driven), employee and employer FICA, FUTA, SUTA, and basic pre-tax deductions (health, dental, vision) are all calculated per employee. The run produces a complete employer cost view — gross wages, employer taxes, and a workers' compensation estimate — presenting the full cost of labor per employee, not just take-home pay.

---

### Payroll Run & Approval Workflow

The payroll run becomes a structured, first-class workflow object. Administrators move through a defined review screen showing every employee's computed gross pay, deductions, taxes, and net pay — with drill-down to the earnings-line level. Before approval is enabled, AI-flagged anomalies must be acknowledged or dismissed. The approval action is explicit and irreversible, with a confirmation step that carries the legal and financial weight it deserves. Run history is maintained so administrators always know what was run, when, by whom, and for how much.

---

### Prism Accounting Integration

A live connection between Prism Payroll and Prism Accounting establishes the reference data flow: jobs and cost codes flow in from Prism Accounting for use in time coding and rate mapping. A post-payroll labor burden stub proves the data model can send fully burdened labor costs — gross wages plus employer taxes plus workers' comp — to Prism job costing. The connection and data compatibility are demonstrated without requiring full operationalization, which is completed at Launch.

---

### Tax Filing

Tax filing obligations are identified for all active payroll states and surfaced in a filing calendar that gives administrators clear visibility into upcoming deadlines. The federal 941 deposit schedule is determined and displayed. Actual filing submissions are not required at this milestone — the obligation framework is established and the administrator is never surprised by a deadline they didn't know existed.

---

### AI Features

Two AI capabilities debut at Customer Preview. **Payroll Anomaly Detection** reviews in-progress payroll runs before submission and flags statistical outliers — employees whose hours are significantly above or below their norm, employees with zero pay, or amounts that deviate materially from prior periods — presenting them as an interactive pre-submit review checklist the administrator must clear before approving the run. **Tax Setup Advisor** activates when an employee is added or a job site opens in a new state, explaining the withholding obligations in plain language, summarizing applicable reciprocity agreements, and recommending the correct forms — replacing the need for the administrator to research this independently.

---

### Reporting

A full payroll register is available with earnings-line detail per employee per run, exportable to CSV and PDF. A basic employer cost summary report is included. CPA and bookkeeper roles have read-only access to registers and reports without being able to submit or modify payroll data.

---

### Security & Platform

Full four-role RBAC is implemented — Payroll Admin, Field Supervisor, Employee, and CPA/Bookkeeper — with access enforced at the API layer, not just the UI. A security audit log captures all PII access and admin actions. The 99.9% uptime SLA is formally defined and monitored.

---
---

## Launch *(formerly GA — Generally Available)*

Launch is the production-ready, commercially available release of Prism Construction Payroll. It closes out every dimension left open at Customer Preview: real money movement to employees, full 50-state calculation coverage, automated tax filing and remittance, a complete employee self-service experience, and a fully operational bi-directional integration with Prism Accounting. At Launch, a customer can run an end-to-end payroll — set up their company, add employees, review Traqspera time, run payroll, disburse to employee bank accounts, file and remit taxes — without a single manual workaround.

---

### Company & Payroll Setup

Full 50-state configuration is supported. All Setting-category items — SUI rate updates, banking re-verification, GL mapping, trade and compensation rules, benefits plans, workers' comp policy renewals — are managed through the Payroll Configuration Hub with a complete change history and audit trail. Wage rate configuration is fully available. The Hub's payroll readiness signal distinguishes between setup gaps, pre-run configuration gaps, and fully operational status.

---

### Employee Management

All 50 states are supported for income tax withholding configuration, including every active reciprocity agreement and all applicable local and municipal tax jurisdictions. Retroactive pay adjustments with prior-period audit trail links are supported. The full employee lifecycle — onboarding, multi-state changes, rate updates, termination with state-specific final pay deadline enforcement — is handled through structured, auditable workflows.

---

### Time Collection

The Traqspera integration is fully operational in real time. Approved time in Traqspera is automatically available for payroll runs — no polling delay, no manual trigger. Historical time data is accessible for prior-period retroactive adjustments. Time coding integrity — job, cost code, trade type — flows through without loss from Traqspera to payroll calculation to job cost allocation.

---

### Payroll Calculation

The calculation engine reaches its full production depth. All 50 states are supported for income tax withholding. Every active reciprocity agreement is applied. All applicable local and municipal taxes are calculated — Philadelphia, Ohio RITA municipalities, Kentucky county taxes, PA school district taxes, Indiana county taxes, and all others. State-specific overtime rules cover every relevant state, including California daily overtime and double-time, Alaska, Nevada, Colorado, and others. Final pay deadline enforcement prompts administrators at termination for every state that requires immediate payment. Supplemental and retroactive pay are handled with correct withholding treatment. The full gross-to-net deduction sequence — pre-tax deductions, post-tax deductions, and garnishments including child support orders with CCPA disposable earnings caps — is applied in statutory order.

---

### Disbursement

Real money moves. ACH direct deposits reach employee bank accounts on the scheduled pay date via NACHA-compliant file transmission. Printed check generation is available for employees on check payment. Failed ACH returns are detected, surfaced to the administrator with a guided retry workflow, and resolved without requiring a payroll re-run. Off-cycle payroll runs — termination, bonus, and correction — are executed without going through the full regular-run workflow. Every completed payroll run produces an immutable disbursement record.

---

### Pay Stubs

A digital pay stub is generated for every employee on every payroll run. Stubs are construction-aware: multiple earnings lines by rate, job, and trade type; WAOT transparency showing how the weighted overtime rate was derived; all deductions in the exact sequence applied. Content meets the pay stub requirements for all 50 states, including YTD totals and employer information. Stubs are delivered by email with a secure link on pay date and are retained for a minimum of four years. Administrators and CPAs can access historical stubs at any time.

---

### Employee Self-Service

Employees log in to a secure, mobile-first portal to view and download current and historical pay stubs, update their mailing address and contact information, manage their bank account and payment method, and re-complete W-4 and applicable state withholding elections. Administrator receives notification of all employee-initiated changes for review and acknowledgment. The portal functions fully on a smartphone — the field worker's primary device — without requiring a desktop.

---

### Tax Filing & Compliance

All required payroll tax filings are generated and submitted on schedule. Federal filings include Form 941 (quarterly), Form 940 (annual FUTA), W-2 and W-3 transmittal, and 1099-NEC. State income tax returns and SUTA filings are submitted for all 50 states on their respective schedules. Local tax returns are filed wherever Prism withholds local tax. W-2s and 1099-NECs are distributed digitally to employees and contractors by January 31 and e-filed with the SSA (EFW2 format) and IRS (FIRE system). New hire reporting is automatically submitted to all 50-state registries within the federally required 20-day window. Automated tax remittance deposits withheld employee taxes and employer contributions to federal (EFTPS) and state agencies on the correct deposit schedule — semi-weekly or monthly as determined by the employer's depositor status. The administrator is never surprised by a deposit deadline or penalty notice attributable to the system.

---

### Prism Accounting Integration

The integration is fully operational and bi-directional. Jobs and cost codes flow from Prism Accounting into Prism Payroll for time coding and rate mapping. Every payroll run auto-generates fully burdened labor cost allocations and debit/credit GL journal entries that post to Prism Accounting on approval — gross wages plus employer FICA, FUTA/SUTA, and workers' comp, allocated by job and cost code. Project managers see real, fully burdened labor costs by job immediately after each run. The payroll register and GL entries are always reconcilable, and a reconciliation report is available on demand.

---

### Reporting & Audit

The full report suite is available: the payroll register with earnings-line detail per run; fully burdened labor cost by job, cost code, and trade with budget vs. actuals comparison; tax liability reports by jurisdiction per run and quarter; employer cost summary covering FICA, FUTA/SUTA, and workers' comp; YTD summary per employee; workers' compensation audit report by classification code and period; 7-year payroll run archive filterable and exportable; and an immutable change audit trail covering all payroll-sensitive data changes with who changed what and when.

---

### AI Features

All Customer Preview AI capabilities are refined and production-quality. The AI-generated **Payroll Run Summary** delivers a plain-language narrative after every run — explaining run-over-run variance, identifying what drove changes, and surfacing anything that warrants administrator attention — in under 60 seconds, without requiring the administrator to read through the full register. **Compliance Alerts** proactively notify administrators when state or federal law changes affect withholding calculations, deposit schedules, or filing requirements before the change takes effect. Additional AI capabilities introduced at Launch are informed by Customer Preview feedback.

---

### Security & Platform Compliance

SOC 2 Type II alignment is achieved, with the audit in progress or complete. Data retention is enforced programmatically — payroll records cannot be deleted before the FLSA 4-year minimum and tax records cannot be deleted before the IRS 7-year minimum. WCAG 2.1 AA accessibility compliance covers all interfaces, tested through both automated tooling and manual review at each release. KMS encryption key rotation is implemented. All security controls that were partial or in-progress at Customer Preview are fully operational at Launch.

---

*For the detailed technical scope behind each section, including explicit in-scope and out-of-scope boundaries, see `Milestone_Statements_of_Scope.md`. For epic-level backlog mapping to milestones, see `Lista-Backlog-Definition.md`.*
