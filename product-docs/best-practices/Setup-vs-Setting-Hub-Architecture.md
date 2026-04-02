# Setup vs. Setting: The Three-Layer Configuration Model

**Document Type:** Architectural Decision Record  
**Initiative:** Setting Up Companies for Payroll (Epic 668778) + Ongoing Administration of Payroll (Epic 668798)  
**Last Updated:** February 27, 2026

---

## The Problem This Solves

During backlog grooming, stories were categorized with one of two tags: **Setup** or **Setting**. This document defines what those tags mean, why the distinction matters, and how the **Payroll Configuration Hub** bridges the two.

Without this model documented explicitly, there is a risk that:
- Setting stories get designed as wizard steps (wrong surface, wrong UX)
- Setup stories get deferred to the Hub (wrong timing, blocks first payroll run)
- The Hub becomes an afterthought rather than a first-class post-onboarding surface

---

## The Three Layers

### Layer 1 — Setup (Wizard-Blocking)
**Tag:** `Setup`  
**Epic:** 668778 — Setting Up Companies for Payroll  
**Surface:** The guided onboarding wizard

Setup items are **required to complete the wizard and enable the first payroll run**. The wizard enforces dependency order and will not advance until these items are valid. If a Setup item is missing, payroll cannot run.

**Examples:**
- Federal EIN entry and validation
- Primary state withholding account ID and SUI rate
- Bank account connection and micro-deposit verification
- Initial pay schedule configuration
- Company profile and primary payroll contact

---

### Layer 2 — Setting (Hub-Managed)
**Tag:** `Setting`  
**Epic:** 668778 (requirement origin) → 668798 (Hub implementation)  
**Surface:** The Payroll Configuration Hub

Setting items are **not required to complete the initial wizard** but must be configured before certain payroll features, compliance obligations, or reporting capabilities are fully operational. The PR Admin returns to the **Payroll Configuration Hub** to manage these at their own pace — guided by the Hub's readiness indicator.

**Examples:**
- Additional nexus state tax registrations (post-hire in a new state)
- SUI rate annual updates (each January)
- Workers' comp policy renewal
- GL chart of accounts mapping (before payroll journal entries post)
- Overtime and shift differential rule configuration
- 1099 subcontractor tracking preferences
- Holiday calendar (annual update)
- YTD historical data import (mid-year activations only)

**Key principle:** Setting items live in **Epic 668778 as requirement specifications** (what the data model and business rules need) and in **Epic 668798 as Hub implementation stories** (the UX surface where admins manage them). Cross-links connect the two.

---

### Layer 3 — Ongoing Administration
**Tag:** (no specific tag — these are native to 668798)  
**Epic:** 668798 — Ongoing Administration of Payroll  
**Surface:** The Payroll Configuration Hub, payroll run screens, reporting, and admin panels

Ongoing administration items are **post-setup operational tasks** that recur throughout the payroll lifecycle: running payroll, managing employee changes, year-end processing, and responding to compliance changes.

---

## The Payroll Configuration Hub — The Connective Tissue

The **Payroll Configuration Hub** (Feature 681508) is the permanent post-setup home for all Setting and Ongoing Administration items. It serves three purposes:

1. **Visibility** — Surfaces what's configured, what's incomplete, and what needs attention via the Payroll Readiness Indicator (Stories 681509, 681510)
2. **Management** — Provides the UX panels for viewing and updating all Setting-category configuration without re-entering the wizard
3. **Continuity** — Connects initial setup to ongoing operations, so the PR Admin always has one place to go to understand and manage their company's payroll configuration

### Hub Feature Map

| Hub Feature | ID | Target | Setting Stories Linked |
|---|---|---|---|
| Company Payroll Configuration Hub (shell) | 681508 | Alpha | — |
| Hub Shell & Navigation | 681509 | Alpha | — |
| Payroll Readiness Indicator | 681510 | Alpha | — |
| Audit Trail & Change History | 681512 | Beta | — |
| Pay Schedule Settings Management | 681513 | Beta | (via 677485) |
| State Tax & Compliance Settings | 681514 | Beta | 681028, 681130, 681131 |
| Banking & Payment Settings | 681515 | Beta | (via 680492) |
| Workers' Compensation Settings | 681516 | GA | (via 680510) |
| Benefits & Deductions Configuration | 681517 | Beta | (via 681517 stubs) |
| **Payroll GL Chart of Accounts Mapping** | **681543** | **Beta** | **681120, 681122, 681123** |
| **Trade & Compensation Rules Management** | **681544** | **Beta** | **681115, 681116, 681118** |
| **1099 / Subcontractor Settings Management** | **681545** | **Beta** | **681132** |
| **YTD Historical Data Import (Mid-Year Activation)** | **681546** | **Beta** | **681126, 681127** |

> **Hub Feature Gaps: RESOLVED** — All four previously identified gap areas now have dedicated Hub features under Epic 668798. As of February 27, 2026, there are no open Hub feature gaps. All Setting-tagged stories from Epic 668778 are cross-linked to their specific Hub implementation feature.

---

## How to Apply This Model to New Stories

When grooming a new story, ask:

1. **Is this required before payroll can run for the first time?**
   - Yes → tag `Setup`, surface in wizard, belongs under Epic 668778
   - No → continue to question 2

2. **Is this required before a specific payroll feature works correctly?**
   - Yes → tag `Setting`, belongs in Hub, cross-link from 668778 requirement to 668798 Hub feature
   - No → it's Ongoing Administration, belongs natively in 668798

3. **Does a Hub feature exist for this area?**
   - Yes → link the Setting story as Related to that Hub feature
   - No → flag as a Hub gap and create the Hub feature before grooming the Setting story for development

---

## ADO Cross-Link Convention

When a Setting story in Epic 668778 maps to a Hub feature in Epic 668798:

- Create a **Related** link from the Setting story → the specific Hub feature. All known gaps are now resolved; use Epic 681508 only as a fallback if no specific feature yet exists for a new area
- Add a **Hub Management Note** to the `Acceptance Criteria` field of the Setting story clarifying that it is Hub-managed, not wizard-managed
- Add a comment on the Hub feature referencing the Setting story IDs it implements

---

## The Three-State Payroll Readiness Journey

The Hub's readiness indicator reflects the transition across all three layers:

| State | Description | Indicator |
|---|---|---|
| **Setup In Progress** | Wizard is incomplete; payroll is blocked | Red — Wizard incomplete |
| **Pre-Run Config Pending** | Wizard complete; Setting items remain incomplete | Yellow — Setting items outstanding |
| **Operational** | All blocking and Setting items complete; payroll is fully configured | Green — Ready to run |
