---
name: create-prototype-pr
description: Create a pull request for prototype pages with auto-detected new pages, routes, preview URLs, and access instructions. Use when the user says 'create prototype pr', 'create pr for prototypes', 'open pr', or asks to create a PR for new prototype pages.
---

# Create Prototype PR

Automatically detect new prototype pages on the current branch, resolve their routes, compute preview URLs, and create a well-structured PR with access instructions for every page.

## When to Use

- Creating a PR that adds or modifies prototype pages in `src/pages/`
- User asks to create a PR and the branch contains new page files
- Before merging prototype work to main

## Steps

### Step 1: Verify branch state

```bash
git rev-parse --abbrev-ref HEAD
git status
```

- Must NOT be on `main` (abort if so)
- Working tree should be clean (warn if uncommitted changes)
- Branch should be pushed to remote (push if not)

### Step 2: Detect new and changed pages

Compare the branch to `main` to find new or modified page files:

```bash
git diff main...HEAD --name-status -- src/pages/
```

From the output, identify:

- **Added pages** (`A` status): brand new prototype pages
- **Modified pages** (`M` status): updated existing prototypes

For each page file, determine the **page type**:

- **Single-file page**: `src/pages/FooPage.tsx` (file directly under `src/pages/`)
- **Folder-based page**: `src/pages/foo-bar/FooBarPage.tsx` (main entry in a subdirectory)
- **Wizard step**: `src/pages/foo-bar/steps/SomeStep.tsx` (child of a folder-based page, not a standalone page)
- **Supporting file**: `src/pages/foo-bar/components/Widget.tsx` (not a routable page)

Only include **routable pages** in the page table (single-file pages and folder-based entry points with `Page` suffix). Group wizard steps and supporting files under their parent page.

### Step 3: Resolve routes from App.tsx

Read `src/App.tsx` and match each detected page to its route:

1. Find the `import` statement for the page component
2. Find the `<Route>` element that renders that component
3. Extract the `path` prop value
4. Determine nesting: is the route inside `<Route element={<AppShell />}>` (AppShell) or outside (Standalone)?
5. If the route contains dynamic segments (`:param`), resolve each param to a concrete sample value using the **Dynamic Route Parameters** reference below

Build a page manifest:

```
{
  name: "EmployeeListPage",
  file: "src/pages/employees/EmployeeListPage.tsx",
  route: "/employees",
  exampleRoute: "/employees",
  nesting: "AppShell",
  status: "added"
}
```

For dynamic routes, `exampleRoute` substitutes sample values:

```
{
  name: "PayrollEmployeeDetailsPage",
  file: "src/pages/PayrollEmployeeDetailsPage.tsx",
  route: "/payroll/employees/:employeeId",
  exampleRoute: "/payroll/employees/EMP-1001",
  nesting: "AppShell",
  status: "added"
}
```

#### Dynamic Route Parameters

Use these sample values when resolving dynamic segments. This avoids needing to read source files for mock data.

| Parameter | Sample Value | Notes |
|-----------|-------------|-------|
| `:employeeId` | `EMP-1001` | Standard employee record used across prototypes |
| `:sectionId` | `benefits` | Generic employee section slug |
| `:dayIndex` | `0` | Zero-based day index (Monday of current week) |
| `:token` | `abc123` | Invite/auth token placeholder |
| `:id` | `1` | Generic numeric ID fallback |

When a new dynamic parameter is added to App.tsx that is not in this table, read the page component to find what sample values its mock data uses, then **add the new parameter to this table** in the skill file so future PRs don't need source reads.

### Step 4: Compute preview URLs

Use the same logic as the `get-branch-preview` skill:

1. Get the branch name and compute the slug:
   - Replace non-alphanumeric chars (except `_`, `.`, `-`) with `-`
   - Collapse consecutive dashes
   - Trim leading/trailing dashes

2. Resolve the GitHub Pages base URL from the git remote:
   - Parse org/repo from remote URL
   - Base: `https://{org}.github.io/{repo}`

3. For each page, compute URLs using `exampleRoute` (not the raw route pattern):
   - **Branch preview URL**: `{base}/branches/{slug}/{exampleRoute}`
   - **Production URL** (after merge): `{base}/{exampleRoute}`

### Step 5: Gather commit context

```bash
git log main..HEAD --oneline
git log main..HEAD --pretty=format:"%s%n%n%b"
```

Extract key information:
- Commit messages for the summary
- Any ADO work item references (e.g., "ADO Epic 672405")
- Whether this is a first-time prototype or an update

### Step 6: Check if PR already exists

```bash
gh pr view --json url --jq '.url' 2>/dev/null
```

If a PR already exists, inform the user and offer to update the description instead.

### Step 7: Generate PR title and body

**Title format**: `feat: Add {feature name} interactive prototypes`

**Body template**:

```markdown
## Summary

{1-3 bullet points summarizing what this PR adds, derived from commits}

## New Pages

| Page | Route | Type | Preview |
|------|-------|------|---------|
| {PageName} | `{route}` | {AppShell/Standalone} | [Preview]({preview_url}) |
| ... | ... | ... | ... |

{If any routes contain dynamic segments, add:}

### Dynamic Route Examples

Routes with `:param` segments use these sample values for preview links:

| Parameter | Sample Value |
|-----------|-------------|
| `:employeeId` | `EMP-1001` |
| ... | ... |

{If any pages are wizards, add a subsection:}

### Wizard Steps

**{WizardPageName}** (`{route}`):
1. {StepName} - {brief description if available from component}
2. ...

## How to Access

**Branch preview** (live now):
- Root: {branch_preview_root_url}
{For each page:}
- {PageName}: {preview_url}

**After merge** (production):
{For each page:}
- {PageName}: {production_url}

**Note:** Deep links work via SPA redirect (404.html pattern). If a direct link 404s, start from the root and navigate in-app.

## Test plan

- [ ] Verify all new pages render correctly on branch preview
{For each wizard page:}
- [ ] Walk through {WizardName} wizard (all {N} steps)
{For each list/detail page:}
- [ ] Verify {PageName} loads with mock data
- [ ] Check responsive layout and theme switching
```

### Step 8: Create the PR

```bash
gh pr create --base main --title "{title}" --body "{body}"
```

Use a HEREDOC or write the body to a temp file if it contains special characters:

```bash
gh pr create --base main --title "{title}" --body-file /tmp/pr-body.md
```

Report the PR URL to the user.

## Edge Cases

- **No new pages detected**: Still create the PR but note the changes are modifications to existing pages. List modified pages instead of new pages.
- **Pages without routes**: Flag as an issue -- the page exists but has no route in App.tsx. Suggest adding the route before creating the PR.
- **Branch not pushed**: Push the branch before creating the PR.
- **PR already exists**: Offer to update the existing PR description with the generated content.
- **Parameterized routes** (e.g., `/employees/:employeeId`): Show the route pattern in the Route column. For the Preview column, use the resolved `exampleRoute` from the Dynamic Route Parameters table. If a param is not in the table, read the page source to find a sample value and add the param to the table for future use.
- **Multiple page groups**: If pages span different features, organize the table by group/directory.

## Example Output

For a branch adding employee management prototypes:

```
PR created: https://github.com/Trimble-Construction/lista-payroll-design/pull/13

New pages detected:
- EmployeeListPage (/payroll/employees) - AppShell
- EmployeeDetailsPage (/payroll/employees/:employeeId → /payroll/employees/EMP-1001) - AppShell
- TimecardDetailPage (/payroll/timesheets/:employeeId/:dayIndex → /payroll/timesheets/EMP-1001/0) - AppShell
- PayrollOnboardingPage (/payroll/setup) - Standalone, 8-step wizard

Dynamic route samples: :employeeId=EMP-1001, :dayIndex=0

Branch preview root:
https://trimble-construction.github.io/lista-payroll-design/branches/srimel-prototype-employee-onboarding/
```

## Related Skills

- `get-branch-preview` -- Computes branch preview URLs
- `validate-prototype-routes` -- Validates routes exist in App.tsx

## Related Files

- `src/App.tsx` -- Route definitions
- `src/pages/` -- All prototype page files
- `.github/workflows/deploy-pages.yml` -- Branch preview deployment
