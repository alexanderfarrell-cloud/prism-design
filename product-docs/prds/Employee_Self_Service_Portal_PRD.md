# PRD: Prism Construction Payroll — Employee Self-Service (ESS) Portal

> *Working document — intended for iterative updates and section-level edits.*
> *ADO Epic: #681144 (canonical) — placeholder #681941 removed as duplicate.*
> *Companion PRDs cover: Company Setup, Employee Management, Pay Stubs & Deliverables, and all other Prism Payroll modules.*

---

# 1. Initiative Definition

### 1a. Overview

The Employee Self-Service (ESS) Portal delivers a secure, mobile-first portal that gives every W-2 employee and 1099 subcontractor direct access to their own payroll documents, payment preferences, personal information, and withholding elections — without requiring the PR Admin to act as an intermediary for routine requests. ESS reduces administrative burden on the owner/office manager, improves employee trust in the payroll process, and creates a direct communication channel between Prism Payroll and the workforce it pays. The portal is optimized for smartphone use, reflecting the construction field worker's mobile-first reality.

### 1b. Problem Statement

In SMB construction payroll today, every employee request — "Can you send me last week's pay stub?" "I need to change my bank account." "Where's my W-2?" — routes through the PR Admin. For a 20-person crew this is a meaningful and unnecessary time drain. The admin becomes a bottleneck for information the employee has every right to access independently.

Current failure modes:

- **Admin bottleneck for routine requests**: Pay stub requests, direct deposit changes, and address updates all require admin intermediation. ESS eliminates this entirely
- **No employee visibility into their own payroll**: Field workers cannot verify their pay, review deductions, or access W-2s without asking their employer. This erodes trust, especially for workers who change employers seasonally
- **Mobile-first workforce is underserved**: Construction field workers are mobile-first, often not at a desk. Desktop-first portal designs fail this audience completely
- **W-4 and direct deposit changes require paperwork**: Updating withholding elections or bank accounts requires paper forms and manual admin data entry. ESS digitizes and audits these changes end-to-end
- **Paper pay stubs and W-2s**: Physical documents get lost; seasonal workers cannot retrieve prior-employer records without calling them

### 1c. Goals

| # | Goal |
|---|------|
| G1 | Employees access pay stubs, W-2s, and payroll documents independently, without admin involvement |
| G2 | Employees can update payment methods, personal information, and withholding elections self-service |
| G3 | PR Admin receives structured notifications for all employee-initiated changes — no changes happen silently |
| G4 | Portal is fully functional on a smartphone; field-worker optimized |
| G5 | All employee actions are audited with immutable records |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| Pay stub requests handled without admin intervention | >90% within 6 months of launch | Operational |
| W-2s downloaded by employees before January 31 | >75% | Compliance |
| Admin time spent on routine payroll information requests per pay period | Reduced >50% | Efficiency |
| Employee portal adoption: active sessions per payroll employee per month | >1 session/month | Engagement |
| Direct deposit setup completion via ESS (new employees) | >80% complete before first payroll | Operational |

### 1e. Out of Scope

- Time entry, timesheet submission, or clock-in/out (Time Collection — E3)
- Benefits enrollment, PTO requests, leave management (future Prism HR)
- Job or project assignment management (Project Management)
- HR onboarding documents, I-9 / E-Verify (future Prism HR)
- Pay rate change requests (admin-controlled; employees view rates, cannot request changes)
- Union or certified payroll document access (Tier 2+)
- Pay stub generation logic (Pay Stubs & Deliverables — E7)

---

# 2. Users & Usage Context

### 2a. Personas

| Persona | Role | Goals | Pain Points | Environment |
|---------|------|-------|-------------|-------------|
| **Field Worker (W-2)** | Primary user | Quick pay stub access; update bank account; check deductions | Limited tech fluency; mobile-only; seasonal/project-based | Smartphone; field conditions |
| **Office/Salaried Employee (W-2)** | Secondary user | W-2 access at tax time; W-4 management | More desktop comfortable; cares about year-end documents | Desktop + mobile |
| **1099 Subcontractor** | Tertiary user | 1099-NEC access; no withholding features | Needs annual tax document; no other portal features apply | Mobile or desktop |
| **PR Admin** | Approver role | Review and approve employee-initiated W-4 and personal info changes; receive change notifications | Currently handles all of this manually | Desktop |

### 2b. User Journeys / Workflows

**Primary: Employee Accesses Pay Stub (most common)**

```
Payday
 │
 ├─ Employee receives email/SMS notification: "Your pay stub is available"
 │
 ├─ Employee clicks link → authenticates (mobile browser)
 │
 ├─ Pay stub list view: current period at top with gross + net totals
 │   └─ Tap to open detail: earnings lines, deductions, taxes, YTD
 │
 └─ Download PDF option for loan/rental/proof-of-income use
```

**Secondary: Employee Updates Bank Account**

```
Employee opens portal → Payment Methods
→ "Add Account" → enters routing + account number
→ IAV verification (Plaid or equivalent) → account verified
→ System: "Change takes effect [next payroll run date]"
→ PR Admin notified: "Employee [Name] updated direct deposit"
→ Admin acknowledges; audit log entry created
```

**Tertiary: Employee Updates W-4**

```
Employee → Tax Settings → "Update W-4"
→ Guided W-4 form flow (2020+ format with plain-language explanations)
→ Submits → enters PR Admin's "Pending Review" queue
→ Admin notified; reviews within 3 business days
→ Change takes effect at next payroll run after admin acknowledges
→ Employee notified of effective date
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Employee login with authenticated portal access | P0 |
| UC-2 | View and download current and historical pay stubs | P0 |
| UC-3 | Download W-2 and 1099-NEC year-end tax documents | P0 |
| UC-4 | Add, update, or remove direct deposit bank account(s) with verification | P0 |
| UC-5 | Update personal information (address, phone, email) with admin notification | P0 |
| UC-6 | Submit W-4 federal withholding update with admin review workflow | P0 |
| UC-7 | View state withholding elections; submit state withholding certificate update | P1 |
| UC-8 | View YTD earnings and deductions summary | P1 |
| UC-9 | Set notification preferences (payday alerts, document availability) | P1 |
| UC-10 | Terminated employee: retain read-only access to historical documents (7-year retention) | P0 |

---

# 3. Requirements

### 3a. Functional Requirements

#### Feature Area 1: Secure Employee Portal Access & Authentication (ADO Feature #681145)

- Admin creates employee portal access via invite link (email or SMS); employee sets own password — **P0**
- Login via email/password; optional MFA — **P0**
- Employee account is strictly scoped: no visibility into other employees' records or any admin configuration — **P0**
- Password reset self-service via email (no admin required) — **P0**
- Session management: auto-logout after inactivity; session token expiry — **P0**
- Admin can deactivate portal access at any time (e.g., on termination); deactivated employee sees clear "access deactivated" message — **P0**
- Terminated employees retain read-only access to their historical documents for the configured retention period (default: 7 years) — **P0**
- Mobile-responsive portal shell optimized for smartphone browsers — **P0**
- Phase 2: SSO / SAML with employer IdP; native mobile app — *Out of scope at GA*

#### Feature Area 2: Pay Stub Access & Digital Delivery (ADO Feature #681146)

- Pay stub list view: chronological, showing pay date, gross pay, net pay — **P0**
- Pay stub detail view: full earnings breakdown (regular, OT, DT, holiday, etc.), itemized deductions, taxes by jurisdiction, YTD accumulators — **P0**
- Download as PDF (state-compliant content per E7 requirements) — **P0**
- Search and filter by date range or pay period — **P1**
- Mobile-optimized view: fully legible on smartphone without zooming or horizontal scroll — **P0**
- Paperless consent: employee elects electronic-only delivery (logged with timestamp and IP) — **P1**
- Payday notification: email/SMS alert when stub is available — **P1**
- Admin can view an employee's stub from the employee record (read-only, audit-logged) — **P0**

#### Feature Area 3: Year-End Tax Document Access (ADO Feature #681147)

- W-2 available for download as IRS-compliant PDF on or before January 31 — **P0**
- 1099-NEC available for download for subcontractors on or before January 31 — **P0**
- Prior year documents accessible (all years company has used Prism Payroll) — **P0**
- Employee notified via email/SMS when W-2 or 1099-NEC is available — **P0**
- Electronic W-2 consent: date-stamped; employee can withdraw at any time — **P0**
- Paper W-2 still generated for non-consenting employees (print/mail handled outside ESS) — **P0**
- Corrected W-2c: clearly labeled, supplements or replaces original — **P1**
- Year selector for multi-year history — **P0**
- Admin can view and download from employee record (read-only, audit-logged) — **P0**

#### Feature Area 4: Direct Deposit & Payment Method Self-Management (ADO Feature #681148)

- Add bank account: routing number + account number + type (checking/savings) — **P0**
- Bank verification: Instant Account Verification (IAV via Plaid or equivalent) as primary; micro-deposit fallback — **P0**
- Support up to 2 bank accounts with configurable split (fixed dollar to Account 1, remainder to Account 2; or percentage) — **P0**
- Edit existing accounts (requires re-verification) or remove — **P0**
- If no account remains after removal, payment defaults to check; admin notified — **P0**
- Change effective date: changes before payroll cutoff apply to current run; after cutoff, next period — with clear employee communication — **P0**
- PR Admin notification on any payment method change (email + in-app) — **P0**
- Audit trail: every add/edit/remove logged with timestamp, IP, user ID — **P0**
- Payment method changes locked during active payroll processing — **P0**
- Phase 2: prepaid payroll card enrollment; earned wage access — *Out of scope at GA*

#### Feature Area 5: Personal Information & Address Self-Update (ADO Feature #681149)

- Employee can update: preferred name, personal phone, personal email, home mailing address — **P0**
- Legal name change: flags for PR Admin review before commit (W-2 / SSN matching implications) — **P0**
- Home address change detection: if new address is in a different state, flags for PR Admin review with alert about potential state withholding update — **P0**
- Admin notification on all personal information changes (in-app + email) — **P0**
- Audit trail: all changes logged with prior value, new value, timestamp, user ID — **P0**
- Employee can view but not edit: SSN (masked), employee ID, hire date, job title, pay rate — admin-controlled fields — **P0**
- Emergency contact management: *Phase 2 / future Prism HR*

#### Feature Area 6: Federal & State Tax Withholding (W-4) Self-Service (ADO Feature #681150)

- Employee can view current federal W-4 elections (filing status, multiple jobs adjustment, dependents amount, additional withholding, exempt status) — **P0**
- Guided W-4 update flow (2020+ format; plain-language field explanations) — **P0**
- Admin review and acknowledgment: W-4 changes queued; admin notified immediately; auto-apply after 3 business days if no admin action (configurable) — **P0**
- Effective date communicated clearly to employee — **P0**
- State withholding: employee can view and update state withholding elections for home state (correct state form surfaced dynamically) — **P1**
- Exempt status annual renewal reminder: automated prompt each January to re-certify; admin alerted if not completed by February 15 — **P0** (IRS requirement)
- W-4 history: employee can view past elections — **P1**
- 1099 subcontractors: withholding section hidden with clear explanation — **P0**
- Phase 2: local/city tax withholding certificates — *Out of scope at GA*

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security** | Employee portal strictly isolated from admin portal; zero cross-employee data access; SSN masked to last 4 in all views; bank account numbers never displayed in full |
| **Authentication** | Separate authentication context from PR Admin login; MFA optional at launch |
| **Mobile** | Full feature parity on mobile browser (iOS Safari, Android Chrome); no horizontal scrolling; touch-friendly targets |
| **Performance** | Pay stub list loads in <3 seconds; document download initiates in <2 seconds |
| **Retention** | Terminated employees retain read-only access 7 years |
| **Accessibility** | WCAG 2.1 AA for all portal screens |
| **Audit** | All employee actions (changes, document access, consent) logged immutably |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| EmployeePortalUser | employee_id, email, auth_status, mfa_enabled, access_revoked_at | Portal auth record |
| DocumentAccessLog | employee_id, document_type, document_id, accessed_at, action | Immutable audit log |
| PaymentMethodChange | employee_id, change_type, prior_value, new_value, timestamp, verified_by, admin_ack_at | Change audit record |
| W4Update | employee_id, submission_timestamp, elections, status, admin_ack_at, effective_date | Pending/applied elections |
| PersonalInfoChange | employee_id, field, prior_value, new_value, timestamp, admin_ack_at | Pending/applied changes |

#### Integration Requirements

| System | Purpose | Notes |
|--------|---------|-------|
| Pay Stubs & Deliverables (E7) | Source of all pay stub PDFs | Internal — stubs generated by E7, served here |
| Tax Filing (E8) | Source of W-2 and 1099-NEC PDFs | Internal |
| Employee Management (E2) | Source of employee profile; destination for approved changes | Internal — bidirectional |
| Bank Verification Partner (Plaid or equivalent) | IAV for new bank accounts | **Buy** — same partner as E6 Disbursement |
| Notification Service | Email/SMS for payday alerts, change notifications, admin notifications | Internal — Notification Manager |
| Security & RBAC (E12) | Employee role authentication infrastructure | Internal — platform |

#### Platform / Infrastructure Constraints

- Employee portal login is a separate authentication context from the PR Admin portal — same IdP, different role scope
- ⚠️ **Requires human review**: Authentication architecture — separate employee subdomain / app vs. role-switch within the same Prism platform
- ⚠️ **Requires human review**: Is SSO / passwordless (magic link) a GA requirement or Phase 2?

### 3d. Epics (Feature Map to ADO)

| ADO Feature | Feature Name | Goals Supported | Use Cases |
|------------|-------------|-----------------|-----------|
| **#681145** | Secure Employee Portal Access & Authentication | G4, G5 | UC-1, UC-10 |
| **#681146** | Pay Stub Access & Digital Delivery | G1, G4 | UC-2 |
| **#681147** | Year-End Tax Document Access (W-2 & 1099-NEC) | G1 | UC-3 |
| **#681148** | Direct Deposit & Payment Method Self-Management | G2, G3, G5 | UC-4 |
| **#681149** | Personal Information & Address Self-Update | G2, G3, G5 | UC-5 |
| **#681150** | Federal & State Tax Withholding (W-4) Self-Service | G2, G3, G5 | UC-6, UC-7 |

### 3e. High-Level Acceptance Criteria

- An employee can access and download their current pay stub from a smartphone on pay day without contacting the admin
- A new employee invited to the portal can create a password, log in, and verify their bank account via IAV in under 5 minutes without admin assistance
- An employee who updates their direct deposit receives an immediate confirmation; the PR Admin receives a parallel notification; the change is audit-logged with timestamp and IP address
- A W-4 update submitted by an employee appears in the admin's action queue immediately; if the admin takes no action in 3 business days, it auto-applies (configurable)
- An address change to a different state triggers an admin alert: "[Employee] home address changed from [State A] to [State B] — review state withholding elections"
- W-2s and 1099-NECs are accessible for download by January 31; electronic consent is captured before the document is displayed
- Terminated employees can log in and access historical documents for up to 7 years post-separation
- Zero visibility across employees: authenticated as Employee A, no API call or UI path exposes Employee B's data

### 3f. Links to Prototypes

- ESS Portal Mobile Wireframes — [TBD]
- W-4 Guided Update Flow — [TBD]
- Pay Stub Mobile View — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- ESS Portal not in scope

**Beta (Trimble Dimensions)**
- Partial: employee self-onboarding invite (mobile invite link, self-complete W-4 and payment method) — delivered via Employee Management (E2), not the full portal
- Full portal not delivered at Beta

**GA (Generally Available)**
- All 6 feature areas:
  - Secure portal access with authenticated employee login
  - Pay stub access and digital delivery
  - W-2 and 1099-NEC access
  - Direct deposit self-management with IAV
  - Personal information self-update
  - W-4 federal withholding self-service
- Mobile-responsive web; 50-state support

**Post-GA**
- SSO / SAML with employer IdP
- Native mobile app (iOS and Android)
- State withholding certificate self-service (full)
- Local/city tax withholding certificates
- Prepaid payroll card enrollment
- W-2 import API (TurboTax, H&R Block integration)
- Emergency contact and HR profile fields

---

# 5. Supporting Information

### 5a. Assumptions

- Employee portal is mobile-responsive web at GA; native app is post-GA
- Authentication uses a separate employee credential (not the admin's Prism login)
- Electronic consent for W-2 and pay stub paperless delivery is captured within the portal (not via email)
- IAV (Plaid or equivalent) is the same vendor selected for E6 Disbursement bank verification — coordinate on contract and integration

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Pay Stubs generated by E7 | E7 team | **High** — portal has nothing to show until E7 is live |
| W-2/1099-NEC generated by E8 | E8 team | **High** — year-end feature depends on E8 |
| Bank verification partner (Plaid/IAV) — same as E6 | Engineering / Finance | **Medium** — shared vendor |
| Employee profile from E2 (source of truth) | E2 team | **High** — portal reads/writes to E2 data |
| Security & RBAC (E12) — employee role definition | E12 / Platform | **High** — authentication infrastructure |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| GA timing slips — E7 not ready before ESS portal launch | Medium | Medium | Portal launch gated on E7 completion; pay stub feature is the anchor use case | No |
| Employee adoption low (construction workers don't use apps) | Medium | Medium | SMS-first notification; invite flow < 5 min; no app install required | No |
| Admin overwhelmed by W-4 change queue (many employees update at once) | Medium | Low | Auto-apply after 3 business days; batch admin acknowledgement view | No |
| Authentication architecture decision delayed | Medium | High | Decision required Sprint 1; blocks portal shell development | Yes |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| Portal adoption rate | `portal_login` (unique employees per month) | Product |
| Pay stub access rate | `paystub_viewed` / `paystub_downloaded` | Product |
| W-2 access rate | `w2_downloaded` (before vs. after Jan 31) | Compliance |
| Bank account change completion | `bank_account_verified` (IAV success rate) | Operations |
| W-4 update submission rate | `w4_submitted` / `w4_auto_applied` / `w4_admin_acknowledged` | Product |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Authentication architecture: separate employee subdomain / app, or role-switch within Prism platform? | Engineering / Product | Sprint 1 |
| OQ-2 | Is SSO / magic link (passwordless) a GA requirement or post-GA? | Product / Security | Sprint 1 |
| OQ-3 | Is the native mobile app in scope for GA, or confirmed post-GA? | Product | Sprint 1 |
| OQ-4 | W-4 auto-apply after 3 business days: is this configurable by admin, or a fixed platform policy? | Product / Legal | Sprint 2 |
| OQ-5 | Does the IAV bank verification use the same Plaid integration as E6 Disbursement? Coordinate on shared contract. | Engineering / Finance | Sprint 1 |
