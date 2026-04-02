# Pay Schedule & Calendar Logic — Product Manager Deep Dive

> **Scope:** U.S. SMB Construction Contractors | Prism Payroll | Payroll Scheduling & Calendar Logic
> *Created: Feb 2026. Use as reference for feature design, story authoring, and stakeholder alignment.*

---

## Executive Summary

A **pay schedule** is the configuration that defines *when* and *how often* employees get paid. It is the foundation for every payroll run. This document explains the "what," "why," and outcomes for each element that makes up the pay schedule and calendar logic space—so product managers can make informed decisions and communicate clearly with engineering and compliance stakeholders.

**Key takeaway:** The schedule answers three questions for every pay run: (1) What dates does this period cover? (2) When is payday? (3) When must payroll be submitted so paychecks arrive on time?

---

## 1. Pay Frequency — The Core Choice

Pay frequency is *how often* employees are paid. It is the primary driver of period structure and has downstream implications for cash flow, compliance, and industry norms.

### 1.1 Weekly


| Aspect                 | Definition                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------ |
| **What**               | Employees are paid every 7 days. Each pay period is 7 days (1–7, 8–14, 15–21, etc.). |
| **Period structure**   | Fixed 7-day blocks. Period start = work week start day.                              |
| **Paychecks per year** | 52                                                                                   |


**Why it matters:**

- **Construction industry norm:** Field workers, hourly tradespeople, and manual laborers are commonly paid weekly. It aligns with cash flow and job-site expectations.
- **State compliance:** Many states (e.g., New York) require weekly pay for *manual workers*—a category that includes most construction trades. Selecting bi-weekly or monthly for a NY construction company may expose the employer to state labor law violations.
- **Overtime alignment:** OT is calculated per FLSA work week. Weekly pay naturally aligns with the work week—one period = one work week for OT purposes.

**Implications:**

- **Payroll admin workload:** 52 payroll runs per year vs. 26 (bi-weekly) or 12 (monthly). Higher frequency.
- **Cash flow:** More frequent payouts; smaller per-check amounts.
- **Setup:** Requires work week start day and first pay period start date. Check date is typically the day after period end (or a few days later with ACH lead time).

**Example:** Work week starts Sunday. Period 1: Sun Apr 6 – Sat Apr 12. Check date: Fri Apr 17 (or later, depending on ACH lead time).

---

### 1.2 Bi-Weekly (Every Other Week)


| Aspect                 | Definition                                                                     |
| ---------------------- | ------------------------------------------------------------------------------ |
| **What**               | Employees are paid every 14 days. Each pay period is 14 days (two work weeks). |
| **Period structure**   | Fixed 14-day blocks. Period start = work week start day.                       |
| **Paychecks per year** | 26                                                                             |


**Why it matters:**

- **Office/salaried norm:** Common for office staff, salaried employees, and non-manual workers.
- **Lower admin burden:** Half the payroll runs of weekly.
- **Overtime alignment:** Two work weeks per period. OT is still calculated per 7-day work week; the system must correctly identify which work week each day belongs to.

**Implications:**

- **State compliance risk:** In states like NY, bi-weekly may not be compliant for manual workers. The system should surface an advisory when the company's primary payroll state has stricter rules.
- **Two pay periods per month (usually):** Most months have two bi-weekly paydays; two months per year have three (e.g., when payday falls on the 1st, 15th, 29th).
- **Setup:** Same as weekly—work week start, first period start, first check date.

**Example:** Work week starts Monday. Period 1: Mon Apr 7 – Sun Apr 20. Check date: Fri Apr 25. Period 2: Mon Apr 21 – Sun May 4. Check date: Fri May 9.

---

### 1.3 Semi-Monthly (Twice per Month)


| Aspect                 | Definition                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **What**               | Employees are paid twice per month on fixed calendar dates (e.g., 15th and last day). |
| **Period structure**   | Calendar-based. Common patterns: 1st–15th and 16th–last, or 16th–last and 1st–15th.   |
| **Paychecks per year** | 24                                                                                    |


**Why it matters:**

- **Salaried preference:** Often used for salaried employees. Predictable dates (15th and last day).
- **State compliance:** Many states (e.g., California, Pennsylvania) require at least semi-monthly pay for most employees. Monthly is often *not* compliant.
- **Variable period length:** Periods are not always 14 days—15th–last can be 15–17 days depending on the month.

**Implications:**

- **Calculation complexity:** Period end dates vary by month (28–31 days). The engine must handle month-end correctly.
- **Different from bi-weekly:** Semi-monthly ≠ bi-weekly. Bi-weekly is every 14 days; semi-monthly is twice per calendar month.
- **Overtime:** Work week start still matters for FLSA OT. A semi-monthly period may span parts of 3–4 work weeks.

**Example:** 15th and last day. Period 1: Apr 1 – Apr 15. Check date: Apr 22. Period 2: Apr 16 – Apr 30. Check date: May 7.

---

### 1.4 Monthly


| Aspect                 | Definition                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- |
| **What**               | Employees are paid once per month on a fixed date (e.g., last day of month). |
| **Period structure**   | Full calendar month. Period = 1st through last day of month.                 |
| **Paychecks per year** | 12                                                                           |


**Why it matters:**

- **Lowest admin burden:** 12 payroll runs per year.
- **Salaried / executive:** Common for executive or highly salaried roles.

**Implications:**

- **State compliance risk:** Many states do *not* permit monthly pay for hourly or manual workers. California, Pennsylvania, and New York restrict or prohibit monthly for certain employee types. The system must surface advisories.
- **Cash flow:** Large per-check amounts; fewer payouts.
- **Overtime:** Work week start still required for FLSA OT. A monthly period spans 4–5 work weeks.

**Example:** Last day of month. Period 1: Apr 1 – Apr 30. Check date: Apr 30. Period 2: May 1 – May 31. Check date: May 30.

---

### 1.5 Pay Frequency Comparison


| Frequency    | Periods/Year | Typical Use                   | State Compliance Notes                                |
| ------------ | ------------ | ----------------------------- | ----------------------------------------------------- |
| Weekly       | 52           | Field workers, hourly, manual | Often *required* for manual workers in NY and others  |
| Bi-Weekly    | 26           | Office, salaried              | May not comply for manual workers in NY               |
| Semi-Monthly | 24           | Salaried                      | Often meets *minimum* compliance (CA, PA)             |
| Monthly      | 12           | Executive, salaried           | Often *not* compliant for hourly/manual in CA, PA, NY |


---

## 2. Work Week Start Day


| Aspect           | Definition                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What**         | The day of the week that begins the 7-day FLSA work week. Options: Sunday through Saturday.                                                                   |
| **Why**          | FLSA overtime is calculated per *work week*—a fixed, recurring 7-day period. If the work week start is wrong, every overtime calculation downstream is wrong. |
| **Required for** | All frequencies. Even monthly and semi-monthly need it for correct OT.                                                                                        |


**Implications:**

- **Overtime alignment:** A worker who works Mon–Sun might have OT in one work week (Mon–Sun) vs. split across two (Mon–Sat in one, Sun in next) depending on work week start. The system must consistently apply the same 7-day boundary.
- **Period alignment:** For weekly and bi-weekly, the period start typically aligns with the work week start. The first period start date must fall on the configured work week start day.

---

## 3. Payment Speed (ACH Lead Time)


| Aspect   | Definition                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **What** | The number of *business days* between when payroll is submitted and when paychecks (direct deposits) arrive. Options: 2, 4, or 7 days. |
| **Why**  | Banks need time to process ACH transactions. The employer submits payroll; the bank processes it; funds arrive on the check date.      |


**Implications:**


| Speed     | Typical Use             | Payroll Deadline                     |
| --------- | ----------------------- | ------------------------------------ |
| 2-day ACH | Fastest; premium        | Submit 2 business days before payday |
| 4-day ACH | Standard                | Submit 4 business days before payday |
| 7-day ACH | Economy; most lead time | Submit 7 business days before payday |


**Formula:** `Payroll deadline = Check date − (ACH lead time in business days)`

**Friday Crunch Guardrail:** The check date must allow enough business days *after* the period end for ACH processing. If the period ends Friday and the check date is the following Monday, 4-day ACH is impossible—there are only 1 business day (Monday) between period end and payday. The system blocks invalid combinations and surfaces the earliest valid check date.

---

## 4. Key Dates — Summary


| Date                    | Definition                     | Derived From                                        |
| ----------------------- | ------------------------------ | --------------------------------------------------- |
| **Period start**        | First day of the pay period    | Work week start + frequency + first period anchor   |
| **Period end**          | Last day of the pay period     | Period start + frequency (7, 14, or month days)     |
| **Check date (payday)** | When employees receive pay     | User-selected; must be ≥ period end + ACH lead time |
| **Payroll deadline**    | When payroll must be submitted | Check date − ACH lead time (business days)          |


**Anchor dates:** The first period start and first check date are the *anchor*. All future periods are projected from these two. Change the anchor, and the entire calendar recalculates.

---

## 5. State Compliance — Pay Frequency Implications

Several U.S. states impose minimum pay frequency requirements, especially for manual workers, hourly workers, or construction trades.


| State            | Rule                                                                                                                                     | Implication                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **New York**     | Manual workers must be paid weekly. Bi-weekly permitted only with Labor Commissioner approval. Monthly not permitted for manual workers. | Weekly strongly recommended for construction. |
| **California**   | Most employees must be paid at least twice per month (semi-monthly minimum).                                                             | Monthly may not comply for hourly.            |
| **Pennsylvania** | Employees must be paid at least semi-monthly.                                                                                            | Monthly not compliant.                        |
| **Texas**        | No stricter-than-federal mandate.                                                                                                        | Any frequency permitted.                      |


**Product approach:** Surface advisories (not hard blocks) when the selected frequency may not meet the company's primary payroll state. The admin can dismiss and proceed—their choice is recorded for audit. Hard-blocking is avoided because the admin may have salaried employees legitimately on a slower schedule, or a compliance officer may have assessed the risk.

---

## 6. Multiple Schedules — Field vs. Office

Construction companies often run *different* pay schedules for different employee groups:


| Group         | Typical Frequency         | Reason                                     |
| ------------- | ------------------------- | ------------------------------------------ |
| Field workers | Weekly                    | Industry norm; state compliance (NY, etc.) |
| Office staff  | Bi-weekly or semi-monthly | Lower admin burden; salaried preference    |
| Executives    | Monthly                   | Lowest admin; large per-check amounts      |


**Outcome:** The system must support multiple named schedules per company. Each schedule has its own frequency, work week start, first period, first check date, and payment speed. Employees are assigned to a schedule.

---

## 7. Banking Holidays & Weekend Adjustments

**What:** Check dates that fall on a federal banking holiday or weekend must be shifted to the prior business day. ACH processing does not occur on holidays or weekends.

**Implications:**

- **Holiday list:** Federal Reserve banking holidays (New Year's, MLK Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas).
- **Adjustment direction:** Always backward (prior business day). Never forward.
- **UI display:** When a holiday adjustment is applied, the calendar should show: "Your [Nov 27] payday falls on Thanksgiving. It has been moved to [Nov 26] (Wednesday)."

---

## 8. Outcomes Summary


| Element                   | What                                   | Why                                               | Outcome                                                 |
| ------------------------- | -------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Pay frequency             | How often employees are paid           | Drives period structure, compliance, admin burden | Correct period calculation; state compliance advisories |
| Work week start           | Start day of 7-day FLSA cycle          | OT is calculated per work week                    | Accurate overtime calculations                          |
| First period + check date | Anchor dates                           | All future periods derive from these              | Projected calendar; correct deadlines                   |
| Payment speed             | ACH lead time (2, 4, 7 days)           | Banks need processing time                        | Payroll deadline; Friday Crunch guardrail               |
| Multiple schedules        | Named schedules per employee group     | Field vs. office have different norms             | Flexible configuration per workforce segment            |
| State compliance          | Advisory rules per state               | Avoid labor law violations                        | Informed decisions; audit trail                         |
| Holiday adjustment        | Shift check date to prior business day | ACH doesn't run on holidays/weekends              | Paychecks arrive on valid processing days               |


---

## 9. Related Documents

- **Prototype:** `prototypes/pay-scheduling-calendar/index.html` — Clickable prototype for setup UI
- **ADO Feature:** #677485 — Payroll Scheduling & Calendar Logic
- **Grooming Playbook:** `docs/supporting/best-practices/Initiative-Grooming-Playbook.md` — Calendar & scheduling gap domain (see Step 1)

