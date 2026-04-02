---
name: validate-prototype-routes
description: Validate that prototype pages have routes in App.tsx, preview what the ingestion pipeline would extract for a page, and troubleshoot screenshot capture failures.
---

# Validate Prototype Routes

On-demand route validation and pipeline preview for prototype pages. Runs the same logic as `lint:routes` scoped to specific files, previews pipeline extraction output, and diagnoses screenshot failures.

## When to Use

- **After creating a new page** -- verify the route exists before merging
- **Before merging to main** -- confirm the ingestion pipeline will pick up the prototype
- **When a pipeline run skips a prototype** -- diagnose route resolution failures
- **To preview pipeline output** -- see the slug, route, hierarchy, and interactions the pipeline would produce
- **When screenshots fail** -- troubleshoot dev server, route, and rendering issues

## Capability 1: Validate

Given a page file or folder, confirm a corresponding route exists in `App.tsx`.

### Steps

1. Identify the target. The user provides a page file (e.g., `src/pages/DashboardPage.tsx` or `src/pages/payroll/onboarding/PayrollOnboardingPage.tsx`) or folder (e.g., `src/pages/payroll/onboarding/`).

2. Derive the page identifier:
   - **File directly under `src/pages/`:** strip the `.tsx` extension. `src/pages/DashboardPage.tsx` becomes `DashboardPage`.
   - **Folder-based page (folder or any file inside it):** use the directory path segments between `src/pages/` and the filename. For nested folders, this includes the full subfolder path. `src/pages/payroll/onboarding/PayrollOnboardingPage.tsx` becomes `payroll/onboarding`. `src/pages/payroll/PayrollHomePage.tsx` becomes `payroll`.

3. Read `src/App.tsx` and check for:
   - An `import` statement pulling from `./pages/<identifier>` (single-file page) or `./pages/<identifier>/...` (folder-based page, where `<identifier>` is the directory path like `payroll/onboarding`).
   - A `<Route>` element whose `element` prop renders the imported component.

4. Report the result:
   - **Matched:** show the import line, the `<Route>` path, and the resolved URL (e.g., `/payroll/setup`).
   - **Not matched:** explain what is missing (import, route, or both) and provide the exact code to add.

5. Optionally run `npm run lint:routes` to confirm the full project passes validation.

### Example output (matched)

```
Page:   payroll/onboarding/PayrollOnboardingPage.tsx
Import: import PayrollOnboardingPage from "./pages/payroll/onboarding/PayrollOnboardingPage"
Route:  <Route path="payroll/setup" element={<PayrollOnboardingPage />} />
URL:    /payroll/setup
Slug:   payroll-onboarding

Status: VALID -- this page has a route and will be processed by the pipeline.
```

### Example output (not matched)

```
Page:   src/pages/TimesheetsPage.tsx
Import: MISSING -- no import from "./pages/TimesheetsPage" found in App.tsx
Route:  MISSING

Fix: Add the following to App.tsx:

  import TimesheetsPage from "./pages/TimesheetsPage";

  <Route path="timesheets" element={<TimesheetsPage />} />
```

## Capability 2: Preview

Show what the ingestion pipeline would extract for a given page without running the actual pipeline. This covers slug derivation, route resolution, component hierarchy, and interactive elements.

### Steps

1. **Derive the prototype slug** using the same depth-2 logic as `detect-changes.js`:
   - **Single-file pages** (directly under `src/pages/`): convert PascalCase filename to kebab-case. `DashboardPage.tsx` -> `dashboard-page`.
   - **Folder-based pages** (1 level deep): directory name is the slug. `payroll/PayrollHomePage.tsx` -> `payroll`.
   - **Folder-based pages** (2 levels deep): first 2 directory segments joined with `-`. `payroll/employees/PayrollEmployeesPage.tsx` -> `payroll-employees`.
   - **Folder-based pages** (3+ levels deep): rolls up to depth-2 slug. `payroll/employees/sections/TimecardPage.tsx` -> `payroll-employees`.

   | Page type | File path | Slug |
   |-----------|-----------|------|
   | Single-file | `src/pages/DashboardPage.tsx` | `dashboard-page` |
   | Depth-1 folder | `src/pages/payroll/PayrollHomePage.tsx` | `payroll` |
   | Depth-2 folder | `src/pages/payroll/employees/PayrollEmployeesPage.tsx` | `payroll-employees` |
   | Depth-3+ folder | `src/pages/payroll/employees/sections/TimecardPage.tsx` | `payroll-employees` |

2. **Derive the display name:**
   - Single-file: strip the `Page` suffix and keep title case. `DashboardPage` -> `Dashboard`.
   - Folder: convert the slug from kebab-case to title case. `payroll-onboarding` -> `Payroll Onboarding`.

3. **Resolve the route** from `App.tsx` (same as Validate).

4. **Build the component hierarchy** by reading the page's source files:
   - Start from the main page component.
   - Follow imports to child components within the page's directory.
   - Identify every Modus wrapper component (`ModusTextInput`, `ModusButton`, `ModusCard`, etc.) and other custom components. If a page directly uses `ModusWc*` web components, treat that as a special case and still include them in the hierarchy.
   - Record meaningful props: `label`, `placeholder`, `text`, `header`, `title`, `color`, `variant`.
   - For wizard/multi-step pages, show each step as a branch of the tree.

5. **Extract interactive elements:**
   - Components with `onClick`, `onSubmit`, `onChange`, `onInput`, `onButtonClick`, `onInputChange`, `onValueChange` handlers.
   - Modus input components (`ModusTextInput`, `ModusDropdownMenu`, `ModusCheckbox`, `ModusRadio`, etc.). Note: `ModusDropdownMenu` is preferred over `ModusSelect` per repo conventions; if `ModusSelect` appears, still include it but flag it as legacy usage.
   - Navigation elements: React Router `<Link>`, `navigate()` calls, `<a>` tags.
   - For each, record: component type, handler type, position in hierarchy, and nearby text/label.

6. **Output the preview** in the pipeline's format:

```
Prototype: Payroll Onboarding
Slug:      payroll-onboarding
Route:     /payroll/setup
Source:    src/pages/payroll/onboarding/

Component Hierarchy:
  PayrollOnboardingPage
    WizardStepLayout
      WizardHeader (currentStep, totalSteps)
      WelcomeStep
        ModusButton (text: "Get Started", variant: "filled", color: "primary")
      CompanyInfoStep
        ModusCard
          ModusTextInput (label: "Company Legal Name")
          ModusTextInput (label: "EIN")
      TaxSetupStep
        ModusCard
          ModusDropdownMenu (label: "Filing Status")
          ModusTextInput (label: "State Tax ID")
      BankAccountStep
        ModusCard
          ModusTextInput (label: "Routing Number")
          ModusTextInput (label: "Account Number")
      PayScheduleStep
        ...
      AddEmployeeStep
        ...
      ReviewStep
        ...
      WizardFooter (onNext, onBack)

Interactive Elements:
  - ModusButton (onButtonClick -> handleNext, text: "Get Started") in WelcomeStep
  - ModusTextInput (onInputChange, label: "Company Legal Name") in CompanyInfoStep
  - ModusTextInput (onInputChange, label: "EIN") in CompanyInfoStep
  - ModusButton (onButtonClick -> handleNext, text: "Next") in WizardFooter
  - ModusButton (onButtonClick -> handleBack, text: "Back") in WizardFooter
  - ...
```

### Reading source files

When building the hierarchy, read these files in order:

1. The main page component (e.g., `PayrollOnboardingPage.tsx`).
2. Layout components at the page root (e.g., `WizardStepLayout.tsx`, `WizardHeader.tsx`, `WizardFooter.tsx`).
3. Step components in `steps/` (e.g., `WelcomeStep.tsx`, `CompanyInfoStep.tsx`).
4. Shared components in `components/` if present.

Follow relative imports within the page directory. Do not follow imports outside the page directory (shared app components, contexts, etc.) -- just name them in the tree.

### File-level filtering

The pipeline uses file-level filtering to reduce unnecessary work. When a commit only changes specific files within a slug's directory, the pipeline:

- **Routes:** Only screenshots routes whose source component file actually changed, rather than all routes for the slug. If any changed file has no matching routed component (e.g., `WizardHeader.tsx`), it falls back to processing all routes for that slug.
- **Dynamic routes:** When a filtered route has dynamic parameters (e.g., `/payroll/employees/:employeeId/personal-info`), the parent listing route (`/payroll/employees`) is automatically included so the screenshot agent can discover valid IDs.
- **Metadata:** Only reads changed files for metadata extraction instead of walking the entire slug directory.

This filtering is driven by the `FILES_BY_SLUG` env var passed between workflow steps. When previewing, note which specific routes and files would be processed for the given change.

## Capability 3: Troubleshoot

Diagnose why a prototype's screenshot capture failed in the ingestion pipeline.

### Steps

1. **Check route resolution:**
   - Run the Validate capability. If the route is missing, that is the root cause.
   - Verify the route path is not nested under a layout route that requires additional context.

2. **Check the dev server:**
   - Run `npm run dev` and confirm it starts without errors.
   - Verify the resolved route is accessible by navigating to `http://localhost:5173/<route>` (or configured port).
   - Check the terminal output for build errors, missing imports, or TypeScript errors.

3. **Check page rendering:**
   - Look for runtime errors in the page component (missing context providers, undefined props, failed data fetching).
   - For pages wrapped in `AppShell`, verify the route is nested under the `<Route element={<AppShell />}>` layout route in `App.tsx`.
   - For standalone pages (like `PayrollOnboardingPage`), verify the route is outside the `AppShell` wrapper.

4. **Check multi-step navigation (wizards):**
   - Verify the page has visible navigation elements (Next/Back buttons, step indicators).
   - Confirm step components render without errors when navigated to programmatically.
   - Check that the wizard's state management allows stepping through all steps.

5. **Check Playwright compatibility:**
   - Verify no components rely on browser APIs unavailable in headless Chromium.
   - Check for animations or transitions that might cause timing issues (suggest adding `waitForTimeout` or `waitForSelector`).
   - Confirm the viewport size (1440x900) does not cause layout breakage.

6. **Report findings** with actionable fixes:

```
Troubleshooting: payroll-onboarding

Route Resolution:    PASS -- /payroll/setup found in App.tsx
Dev Server:          PASS -- Vite serves the route successfully
Page Rendering:      PASS -- No console errors
Multi-Step Nav:      ISSUE -- Step 4 (BankAccountStep) throws an error
                     when "Routing Number" field is empty on mount.
                     Fix: Add a default empty string for routingNumber
                     in the wizard's initial state.
Playwright Compat:   PASS -- No headless-incompatible APIs detected
```

### Common failure patterns

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Pipeline skips prototype entirely | No route in `App.tsx` | Add import and `<Route>` |
| Screenshot is blank or shows 404 | Route path mismatch | Compare `<Route path>` with the URL the pipeline navigates to |
| Screenshot shows only the AppShell sidebar | Page route is outside `<Route element={<AppShell />}>` but should be inside, or vice versa | Move the `<Route>` to the correct nesting level |
| Wizard screenshots only capture step 1 | Agent cannot find navigation elements | Ensure Next/Continue button has visible text or aria-label |
| Screenshot has missing styles | Modus CSS not loaded | Verify `ModusProvider` wraps the route's component tree |
| Pipeline processes all routes for a single file change | File-level filtering fell back to all routes because the changed file has no direct route (e.g., internal component) | Expected behavior -- the fallback ensures no routes are missed. If the file should have a route, add it to `App.tsx` |
| Dynamic route screenshot fails to find valid IDs | Parent listing route was not included in filtered set | Verify the parent listing route exists in `App.tsx` at the static prefix of the dynamic route |

## Related Files

- `scripts/validate-routes.js` -- CI route validation script (`npm run lint:routes`)
- `src/App.tsx` -- Route definitions and page imports
- `src/pages/` -- All prototype page files
- `.github/scripts/detect-changes.js` -- Slug derivation and `filesBySlug` mapping
- `.github/scripts/resolve-routes.js` -- Route resolution with file-level filtering
- `.github/scripts/extract-metadata.js` -- Metadata extraction with file-level filtering
- `.github/workflows/prototype-ingestion.yml` -- Pipeline workflow wiring `FILES_BY_SLUG`
