# Onboarding flow — design sandbox

Separate mini-app for **trying onboarding ideas** before they land in the main Prism repo.

## UI parity with Prism

This prototype uses the **same stack and tokens** as the parent Prism app so layouts and components stay visually aligned:

- **Modus Web Components** (`@trimble-oss/moduswebcomponents-react`) + `modus-wc-styles.css`
- **Modus Icons** (via the same CSS imports as Prism)
- **Tailwind** with the same `tailwind.config.js` color/radius/font mapping to CSS variables
- **`src/index.css`** copied from Prism (design tokens, border utilities, text opacity utilities, Modus button radius override)
- **`data-theme="modus-modern-light"`** on `<html>` (same default theme approach as Prism)

`ModusButton` is a slim copy of the Prism wrapper. Forms on later steps use **`ModusWcTextInput`** directly.

> The main Prism repo still runs its own **lint scripts** (Modus colors, icons, semantic HTML, etc.). This sandbox does not run those automatically; keep patterns consistent when you port work upstream.

## Run

From this folder:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Vite may pick another port if `5173` is busy.

On Windows PowerShell, if `npm` is blocked by execution policy, use `npm.cmd run dev`.

## Structure

| File | Purpose |
|------|--------|
| `src/onboarding/stepConfig.ts` | Step order, titles, short notes for yourself |
| `src/onboarding/StepPanels.tsx` | Content for each step (forms, copy, layout) |
| `src/onboarding/WelcomeStep.tsx` | Welcome / task list screen |
| `src/onboarding/PersonalInfoStep.tsx` | Personal info form (second screen) |
| `src/components/ModusLogo.tsx` | Same `ModusWcLogo` wrapper as Prism (`name="financials"`) |
| `src/onboarding/OnboardingShell.tsx` | Progress bar, Back / Continue |
| `src/components/ModusButton.tsx` | Same API pattern as Prism |
| `src/App.tsx` | Routes |

## URLs

- `/` → first step  
- `/onboarding/welcome` → task list; `/onboarding/personal` → personal information form  
- `/onboarding/company`, `/onboarding/team`, `/onboarding/done` → later steps (5 steps total)

## Adding a step

1. Add a new `id` to the `StepId` type and a new object in `STEPS` inside `stepConfig.ts`.
2. Add a `case` in `StepPanels.tsx` for that `id`.
3. Reload the app.

## Keeping CSS in sync with Prism

If Prism `src/index.css` or `tailwind.config.js` changes in a way that affects look-and-feel, copy those files into this folder again (or merge the relevant sections).
