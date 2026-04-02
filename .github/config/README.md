# Prototype Ingestion Config

## `prototype-ingestion.json`

Controls which prototype pages the ingestion pipeline processes. When a push to `main` changes files under `src/pages/`, the pipeline detects affected page slugs and runs them through screenshot capture, metadata extraction, and ADO work item creation. The `exclude` array lets you skip slugs that shouldn't be ingested.

### How slugs are derived

| Page type | File path | Slug |
|-----------|-----------|------|
| Single-file | `src/pages/DashboardPage.tsx` | `dashboard-page` |
| Single-file | `src/pages/SettingsPage.tsx` | `settings-page` |
| Folder-based (1 level) | `src/pages/payroll/PayrollHomePage.tsx` | `payroll` |
| Folder-based (2 levels) | `src/pages/payroll/employees/PayrollEmployeesPage.tsx` | `payroll-employees` |
| Folder-based (3+ levels) | `src/pages/payroll/employees/sections/TimecardPage.tsx` | `payroll-employees` |

Single-file pages are converted from PascalCase to kebab-case. Folder-based pages use up to the first 2 directory segments (excluding the filename), joined with `-`, as the slug. Files deeper than 2 levels roll up to their depth-2 parent slug.

### Pattern syntax

The `exclude` array accepts two kinds of entries:

- **Exact slug** -- matches one specific page
- **Wildcard (`*`)** -- matches any sequence of characters

### Examples

Exclude a single page:

```json
{
  "exclude": ["not-found-page"]
}
```

Exclude all pages starting with `reports`:

```json
{
  "exclude": ["reports-*"]
}
```

Exclude multiple pages with mixed patterns:

```json
{
  "exclude": [
    "not-found-page",
    "settings-page",
    "billing-*"
  ]
}
```

### Behavior

- An empty `exclude` array (the default) ingests all changed pages.
- If a slug matches any pattern in the list, it is skipped for the entire pipeline run.
- Invalid entries (non-strings, empty strings) are silently ignored.
- A missing or malformed config file is treated as an empty exclude list -- the pipeline never fails due to config issues.
- When slugs are excluded, a warning is logged in CI output listing which slugs were skipped.
