# PRD: Prism Construction Payroll — Security, RBAC & Platform Compliance

> *Working document — intended for iterative updates and section-level edits.*
> *Companion PRDs cover: Company Setup, Employee Management, Time Collection, Earnings & Rate Calculation, Tax Withholding & Deductions, Disbursement, Pay Stubs, Tax Filing, Tax Remittance, Prism Accounting Integration, Reporting & Audit, AI Assistance.*

---

# 1. Initiative Definition

### 1a. Overview

The Security, RBAC & Platform Compliance module establishes the foundational non-functional requirements that make Prism Construction Payroll trustworthy, auditable, and compliant with data protection standards. It is not a user-facing product feature — it is the platform capability layer that every other Epic depends on. It covers: Role-Based Access Control (RBAC) with four primary roles, PII encryption at rest and in transit, SSN and bank account masking in all UI views, multi-tenant data isolation, FLSA/IRS data retention enforcement, WCAG 2.1 AA accessibility, SOC 2 Type II alignment posture, uptime SLA, and incident response. This Epic is active from Alpha through GA and ongoing post-GA.

### 1b. Problem Statement

Payroll data is among the most sensitive categories of personal information a software platform handles. A breach or unauthorized access event in a payroll system can expose SSNs, bank accounts, tax records, and salary data for every employee — creating FCRA, IRS, and state data protection liabilities, as well as catastrophic loss of customer trust in a domain where trust is the product.

Current risk context:

- **PII exposure in payroll**: SSNs, routing/account numbers, tax IDs, and wage data are present in every payroll record. Without rigorous AES-256 encryption at rest and TLS 1.2+ in transit, every record is a breach target
- **Multi-tenant contamination**: A SaaS payroll platform serves multiple companies on shared infrastructure. Without proper tenant isolation, a query error can expose Company A's payroll data to Company B
- **Insider access control gaps**: In SMB payroll software, "admin" often means access to everything — including the ability to view any employee's full SSN, bank account, and pay rate. A proper payroll platform needs granular RBAC that limits what each role can see and do
- **Retention noncompliance**: FLSA requires 2 years of wage records; IRS requires 4 years of employer tax records. Most SMB payroll tools have no enforced retention policy — data can be deleted accidentally or by design
- **Accessibility exclusion**: Field workers who use the payroll portal on mobile may have visual impairments. WCAG 2.1 AA compliance is both a legal obligation (ADA) and a product quality standard

### 1c. Goals

| # | Goal |
|---|------|
| G1 | All PII (SSN, bank accounts, tax records) encrypted at rest (AES-256) and in transit (TLS 1.2+) |
| G2 | RBAC enforced: each role sees only the data and actions appropriate to their function |
| G3 | Multi-tenant data isolation: no cross-tenant data exposure under any circumstances |
| G4 | Data retention enforced programmatically: records cannot be deleted before minimum retention period expires |
| G5 | Platform maintains SOC 2 Type II alignment posture at GA |
| G6 | All user-facing interfaces meet WCAG 2.1 AA accessibility standard |

### 1d. Success Metrics

| Metric | Target | Type |
|--------|--------|------|
| PII encryption coverage (SSN, bank accounts, tax data) | 100% of stored records | Compliance |
| RBAC enforcement coverage (all payroll-sensitive actions and views) | 100% | Security |
| Cross-tenant data exposure incidents | 0 | Security |
| Data retention policy enforcement (no records deleted before minimum period) | 100% | Compliance |
| WCAG 2.1 AA issues (P0 violations) | 0 at GA launch | Accessibility |
| System uptime (excluding scheduled maintenance) | 99.9% | Reliability |

### 1e. Out of Scope

- Application-level features (authentication UI, login pages) — these use the security infrastructure but are feature-owned by their respective modules
- SSO / IdP integration with specific enterprise identity providers (future)
- HIPAA compliance (benefits/health data not in scope)
- GDPR / international data residency (US-only at GA)
- Penetration testing scheduling (operational, not a product Epic) — but requirements set here

---

# 2. Users & Usage Context

### 2a. Personas (Role Definitions)

| Role | Definition | Key Permissions | Key Restrictions |
|------|-----------|----------------|-----------------|
| **Payroll Admin** | Owner or Office Manager who runs payroll | Full payroll: configure, run, view all reports, all employee data | Cannot modify immutable audit records; cannot delete before retention period |
| **Field Supervisor** | Crew lead who approves time | View crew time entries; approve time; no payroll data, no pay rates | Cannot view pay rates, net pay, tax data, or run payroll |
| **Employee** | W-2 worker | View own pay stubs, own personal data (via E7b portal) | Cannot view other employees; cannot view pay rates of others |
| **CPA / Bookkeeper** | External retained accountant | Read-only access to all payroll registers, tax reports, withholding summaries | No edit capability; no access to bank routing numbers; no ability to submit payroll |

### 2b. User Journeys — Security-Relevant

**RBAC Enforcement**

```
User logs in → identity verified
 │
 ├─ System loads user's role assignment for the company
 │
 ├─ UI rendered per role:
 │   ├─ Admin: full navigation + all actions
 │   ├─ Supervisor: time approval only; payroll nav hidden
 │   ├─ Employee: own pay stub view only (E7b)
 │   └─ CPA: read-only reports; no submission controls
 │
 └─ API layer enforces role independently of UI:
     └─ Any API call outside role permissions returns 403 regardless of UI state
```

**PII Access**

```
Admin views employee record
 │
 ├─ SSN: displayed as "***-**-XXXX" (last 4 only)
 │   └─ Full SSN accessible only via explicit "reveal" action + second authentication factor — Inferred
 │
 ├─ Bank routing/account numbers: masked in all views
 │   └─ Full number never displayed in UI; only last 4 digits
 │
 └─ All PII field access logged in security audit trail
```

### 2c. High-Level Use Cases

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-1 | Assign and enforce role-based access control for Admin, Supervisor, Employee, CPA | P0 — Alpha |
| UC-2 | Encrypt all PII at rest (AES-256) and in transit (TLS 1.2+) | P0 — Alpha |
| UC-3 | Mask SSN (last 4 only) and bank account numbers in all UI views | P0 — Alpha |
| UC-4 | Enforce multi-tenant data isolation at API and data layer | P0 — Alpha |
| UC-5 | Enforce FLSA/IRS data retention periods programmatically | P0 — GA |
| UC-6 | Maintain security audit log for all PII access and admin-level actions | P0 — Beta |
| UC-7 | Achieve WCAG 2.1 AA compliance for all user-facing interfaces | P0 — GA |
| UC-8 | Define and enforce uptime SLA (99.9%) | P0 — Beta |
| UC-9 | Establish SOC 2 Type II control alignment posture | P0 — GA |
| UC-10 | Support admin-assignable RBAC roles (assigning/revoking a supervisor's access) | P0 — Beta |

---

# 3. Requirements

### 3a. Functional Requirements

#### Role-Based Access Control

- The system shall define and enforce four primary roles: Payroll Admin, Field Supervisor, Employee, CPA/Bookkeeper — **P0** (Alpha)
- RBAC shall be enforced at the API layer independent of the UI — **P0** (Alpha)
- Admin shall be able to assign roles to users within their company — **P0** (Beta)
- Admin shall be able to revoke a user's role (e.g., terminate supervisor access when a supervisor leaves) — **P0** (Beta)
- A user's role shall be scoped to a single company; multi-company access (e.g., CPA serving multiple clients) requires explicit per-company authorization — **P1** (GA)

#### PII Encryption

- All personally identifiable information (SSN, EIN, bank routing numbers, account numbers, tax records, wage data) shall be encrypted at rest using AES-256 — **P0** (Alpha)
- All data in transit shall be transmitted over TLS 1.2 or higher — **P0** (Alpha)
- Encryption keys shall be managed using a key management service (KMS); keys rotated per security policy — **P0** (Beta)

#### PII Masking

- Social Security Numbers shall be displayed as "XXX-XX-XXXX" format in all UI views — **P0** (Alpha)
- Full SSN shall not be accessible via any UI; accessible only in specific operational contexts (e.g., tax filing submission) with access logged — **P0** (Alpha)
- Bank routing and account numbers shall display last 4 digits only in all UI views — **P0** (Alpha)
- PII fields shall never appear in logs, error messages, or API response payloads outside of encrypted contexts — **P0** (Alpha)

#### Multi-Tenant Data Isolation

- The system shall enforce company-level data isolation: no query or API call shall return data belonging to a different company — **P0** (Alpha)
- Isolation shall be enforced at the data layer (row-level security or equivalent), not only at the application layer — **P0** (Alpha)
- Security testing shall include explicit multi-tenant isolation test cases before each major milestone — **P0**

#### Data Retention

- Payroll run records, time entries, and employee tax records shall be retained for a minimum of 7 years — **P0** (GA)
- The system shall prevent deletion of records within the mandatory retention period — **P0** (GA)
- Records past the mandatory retention period shall be archived or purged per a documented data retention policy — **P1** (GA)
- Retention periods shall be configurable per record type to accommodate different legal requirements by jurisdiction — **P1** (GA)

#### Security Audit Log

- The system shall log all access to PII fields (SSN reveal, bank account access) with: user, timestamp, record accessed, action — **P0** (Beta)
- The system shall log all admin-level actions: payroll run submission, employee data changes, role assignments, settings changes — **P0** (Beta)
- Security audit logs shall be immutable and retained for 7 years — **P0** (Beta)
- Security audit logs shall be accessible to Payroll Admin role only — **P0** (Beta)

#### Accessibility

- All user-facing interfaces (admin payroll portal, employee portal) shall meet WCAG 2.1 Level AA — **P0** (GA)
- Accessibility testing shall be conducted by an automated tool (e.g., axe, WAVE) and manual review at each major release — **P0** (GA)

#### Uptime SLA

- The system shall target 99.9% uptime during payroll processing windows, excluding scheduled maintenance — **P0** (Beta)
- Scheduled maintenance windows shall not occur during Friday 12pm–11pm local time (peak payroll processing period) — **P0** (Beta) — *Inferred: confirm with operations*

#### SOC 2 Type II Alignment

- The system shall implement controls aligned to SOC 2 Type II Trust Service Criteria: Security, Availability, Processing Integrity, and Confidentiality — **P0** (GA)
- Control documentation shall be maintained for auditor review — **P0** (GA)
- ⚠️ *Requires human review: formal SOC 2 audit engagement timeline and auditor selection*

### 3b. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Encryption** | AES-256 at rest; TLS 1.2+ in transit; KMS key management |
| **Authentication** | Multi-factor authentication (MFA) for Admin role — *Inferred; confirm with platform* |
| **RBAC** | API-layer enforcement; UI enforcement secondary |
| **Multi-tenancy** | Data-layer isolation; row-level security or equivalent |
| **Retention** | 7-year minimum; programmatic enforcement; documented policy |
| **Audit** | Immutable logs; 7-year retention; Admin-only access |
| **Accessibility** | WCAG 2.1 AA; automated + manual testing per release |
| **Uptime** | 99.9% excluding maintenance; no maintenance Fri PM |
| **SOC 2** | Type II alignment at GA; formal audit TBD post-GA |

### 3c. Technical Dependencies

#### Data Requirements

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| UserRole | user_id, company_id, role, assigned_by, assigned_at, revoked_at | RBAC assignment record |
| SecurityAuditLog | event_type, user_id, record_type, record_id, field, timestamp | Immutable append-only |
| RetentionPolicy | record_type, min_retention_years, purge_eligible_after | Configurable by record type |
| EncryptionKey | key_id, version, algorithm, created_at, rotated_at | KMS-managed |

#### Integration Requirements

| System | Purpose | Notes |
|--------|---------|-------|
| KMS (Key Management Service) | AES-256 key management and rotation | AWS KMS, Azure Key Vault, or equivalent |
| Identity / Auth Provider | User authentication, MFA | Platform-standard; integration with Prism's auth service |
| SIEM / Security Monitoring | Security audit log aggregation; anomaly detection for unauthorized access | Operational |

#### Platform / Infrastructure Constraints

- ⚠️ **Requires human review**: Row-level security implementation approach — ORM-level, database-level (PostgreSQL RLS), or application middleware
- ⚠️ **Requires human review**: MFA requirement scope — required for Admin only, or all roles?
- ⚠️ **Requires human review**: SOC 2 audit engagement timeline and external auditor selection

### 3d. Epics

| Epic | Description | Goals Supported | Related Use Cases |
|------|-------------|-----------------|-------------------|
| **E12-1: Role-Based Access Control** | Four-role RBAC; API-layer enforcement; admin role assignment; multi-company CPA access | G2 | UC-1, UC-10 |
| **E12-2: PII Encryption & Masking** | AES-256 at rest; TLS in transit; SSN and bank masking in all UI views; no PII in logs | G1 | UC-2, UC-3 |
| **E12-3: Multi-Tenant Data Isolation** | Data-layer row-level isolation; explicit multi-tenant test suite per milestone | G3 | UC-4 |
| **E12-4: Data Retention Enforcement** | 7-year minimum retention; programmatic deletion prevention; retention policy config | G4 | UC-5 |
| **E12-5: Security Audit Logging** | Immutable PII access log; admin action log; 7-year retention | G2, G5 | UC-6 |
| **E12-6: Accessibility (WCAG 2.1 AA)** | All interfaces meet AA standard; automated + manual testing per release | G6 | UC-7 |
| **E12-7: SOC 2 Alignment & SLA** | Control framework documentation; 99.9% uptime SLA; SOC 2 Type II alignment | G5 | UC-8, UC-9 |

### 3e. High-Level Acceptance Criteria

- A Field Supervisor logging in can access time approval only; the payroll run, employee pay rates, and withholding data are not visible and not accessible via direct API call
- A CPA logging in can view all payroll registers and tax summaries but cannot submit payroll, edit employee records, or view full SSNs or bank account numbers
- SSN is displayed as "XXX-XX-XXXX" in every UI view for every role — including Admin — with no UI mechanism to expose the full number
- A security audit log entry is created every time an Admin performs a payroll submission, role assignment, or employee data change
- Cross-tenant data isolation is verified by an explicit test: a user authenticated to Company A cannot retrieve any data belonging to Company B through any API endpoint
- Payroll run data 5 years old is retrievable (within 7-year retention) and cannot be manually deleted by admin
- All primary user interfaces pass WCAG 2.1 AA automated testing with zero P0 violations at GA

### 3f. Links to Prototypes

- RBAC Role Configuration — [TBD]

---

# 4. Delivery Plan

### 4a. Release Plan / Phasing

**Alpha (June 2026)**
- Basic RBAC (Admin role only — single-role Alpha for simplicity)
- AES-256 encryption at rest; TLS 1.2+ in transit
- SSN and bank account masking in all views
- Multi-tenant data isolation (enforced from day one)

**Beta (Trimble Dimensions)**
- Full four-role RBAC with API enforcement
- Admin role assignment and revocation
- Security audit log (PII access + admin actions)
- 99.9% uptime SLA defined and monitored

**GA (Generally Available)**
- Data retention enforcement (7-year; programmatic deletion prevention)
- WCAG 2.1 AA compliance for all interfaces
- SOC 2 Type II alignment (controls documented; formal audit TBD)
- KMS key rotation policy operational
- Multi-company CPA access (CPA serving multiple Prism clients)

---

# 5. Supporting Information

### 5a. Assumptions

- Authentication (login, MFA, session management) is handled by the Prism platform auth service; this Epic consumes authentication but does not build it
- The data storage layer supports row-level security or equivalent multi-tenant isolation
- SOC 2 Type II formal audit is planned post-GA as a business decision (not a GA gate); alignment controls are GA-required
- WCAG 2.1 AA is the accessibility target; Level AAA is not required

### 5b. Dependencies

| Dependency | Owner | Risk |
|-----------|-------|------|
| Prism platform auth service (authentication, MFA, session) | Platform team | **High** — RBAC depends on authenticated identity |
| KMS / key management service selection | Engineering | **Medium** |
| Data layer row-level security implementation | Engineering | **High** — must be confirmed at Alpha |
| WCAG 2.1 AA testing toolchain | Engineering / QA | **Medium** |

### 5c. Risks & Mitigations

| Risk | Probability | Impact | Mitigation | ⚠️ Human Review |
|------|-------------|--------|------------|-----------------|
| Multi-tenant isolation failure (cross-tenant data leak) | Low | Critical | Data-layer enforcement; explicit multi-tenant test suite every sprint | Yes — security review |
| PII appears in application logs (inadvertent) | Medium | High | Log sanitization middleware; PII field regex scrubbing in logging pipeline | Yes — security review |
| WCAG AA remediation work underestimated | Medium | Medium | Accessibility review starting at Beta; not left to GA crunch | Yes |
| SOC 2 gap analysis reveals significant control gaps near GA | Medium | Medium | Internal SOC 2 readiness assessment at Beta; remediate before GA | Yes |

### 5d. Links to Analytics & Telemetry

| Metric | Event to Track | Owner |
|--------|---------------|-------|
| RBAC enforcement events | `access_denied` (role, resource, action) | Security |
| PII access events | `pii_accessed` (user, record_type, field) | Security |
| Uptime | System health checks; SLA dashboard | Operations |
| Accessibility test results | Per release automated scan results | Engineering |

### 5e. Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | Is MFA required for the Admin role only, or for all roles? | Security / Product | Sprint 0 |
| OQ-2 | Is the data layer implementation PostgreSQL with RLS, or application-layer tenant filtering? | Engineering | Sprint 0 |
| OQ-3 | Is the SOC 2 formal audit planned within 12 months of GA? What auditor is targeted? | Legal / Finance | Sprint 1 |
| OQ-4 | What is the key rotation cadence for AES-256 encryption keys (90-day, 1-year)? | Security | Sprint 1 |
| OQ-5 | For the CPA multi-company access model: is this a separate CPA portal or a role within each company's instance? | Product | Sprint 2 |
