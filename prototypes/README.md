# Pay Scheduling & Calendar Logic — Clickable Prototype

**Source:** ADO Feature #677485 (Payroll Scheduling & Calendar Logic)  
**Stories:** 681410, 681413, 681409, 681416, 681417 (excluding 677487, 679703, 679704)

## How to Run

Open `index.html` in a modern browser. No build step or server required.

## Overview

The prototype opens with a **front page** that describes the feature, its goals, problems being solved, and key capabilities. Click **Get Started** to enter the setup flow.

## Key Flows Covered

### 0. Front Page
- Feature overview and objectives
- Problems being solved (state compliance, dual cadences, overtime accuracy)
- Key capabilities
- "Get Started" CTA to enter setup

### Multi-Schedule Support (User-Named)
- **Add schedule** — enter any name (e.g. Office, Field workers, Salaried) and configure
- No predefined schedule types—you name each schedule
- Switch between schedules via tabs; each retains its configuration
- Badge shows "Configured" or "Not configured" for each
- Add up to 10 schedules; remove with × when you have 2+

### 1. Pay Schedule Setup — Part 1 (Story 681410)
- **Pay Frequency:** Weekly, Bi-Weekly, Semi-Monthly (disabled with "Coming soon — Beta"), Monthly
- **Work Week Start Day:** Required for overtime calculations
- **Payment Speed:** 2-day, 4-day, 7-day ACH with deadline impact
- **State Compliance Advisory:** Amber warning for NY (Bi-Weekly), CA/PA (Monthly) — dismissible
- **Validation:** Work week required; Semi-Monthly blocks proceeding at Alpha

### 2. Pay Schedule Setup — Part 2 (Story 681413)
- **First Pay Period Start:** Date picker
- **First Check Date:** Date picker
- **Payroll Deadline:** Auto-calculated, updates in real time
- **Summary Text:** e.g., "Employees will be paid on the 30th each month"
- **Calendar Visualization:** Monthly view with pay period shading, deadline marker, payday marker
- **Preview Upcoming Payrolls:** Expandable (3 → 12 periods)
- **Friday Crunch Guardrail:** Inline blocking error when check date doesn't allow enough ACH lead time; "Save" disabled until resolved

### 3. Validation & Logic
- **Friday Crunch Guardrail:** Check date must be ≥ period end + paymentSpeedDays business days
- **Debounced Preview:** 200ms debounce on field changes (simulated)
- **Save and Exit / Save changes:** Simulated PUT /schedules

### 4. State Compliance Advisory (Story 681416)
- **New York:** Bi-Weekly or Monthly → advisory for manual workers
- **California:** Monthly → advisory
- **Pennsylvania:** Monthly → advisory
- **Texas:** No advisory
- Advisory is informational only; user can dismiss and proceed

## UI/UX Reference

- Gusto-style progressive disclosure (design asset: Gusto_payschedule.png)
- Dark theme for contrast and modern feel
- DM Sans + JetBrains Mono typography

## Out of Scope in Prototype

- Semi-Monthly (Beta)
- Banking holiday adjustment (GA story 681417)
- Multi-schedule support (Beta story 679703)
- Multi-month calendar navigation
- Actual API integration
