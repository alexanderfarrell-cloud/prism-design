# Employee Role vs Job Title, and Trade vs Cost Code

> Definitions and rationale for Step 3 (Job Role & Pay) fields in the Add Employee flow.

---

## Employee Role vs Job Title

They capture different dimensions:

| Field | What it captures | Example |
|-------|------------------|---------|
| **Job Title** | The person's formal position or occupation | Carpenter, Project Manager, Equipment Operator |
| **Employee Role** | Where they primarily work | Field (job site), Office, or Mixed |

**Why both matter:** Job Title = *what* they do. Employee Role = *where* they do it. A "Project Manager" could be office-only, field-only, or mixed — the role tells you that. This drives tax withholding (field workers often work across states/localities), workers' comp classification, time-tracking expectations, and job site assignments.

---

## Trade vs Cost Code

These are related but distinct:

| Term | What it means | Purpose |
|------|---------------|---------|
| **Trade** | The type of work/skill the employee can perform | Employee capability — what kinds of work can this person do? |
| **Cost Code** | Where labor cost gets charged in the books | Accounting — which project, phase, or job to allocate the labor to |

**Trade** = "What types of work can this employee do?" (e.g., Carpenter, Electrician, Plumber). An employee can have multiple trades.

**Cost Code** = "Where do we charge their time?" (e.g., Job 123 Phase 2, Residential Framing). Used for job costing and GL allocation.

Sometimes they overlap (e.g., "Electrical" could be both a trade and a cost code), but they serve different purposes: Trade = capability; Cost Code = cost allocation.
