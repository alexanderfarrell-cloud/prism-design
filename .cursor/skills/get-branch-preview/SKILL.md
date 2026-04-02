---
name: get-branch-preview
description: Get the GitHub Pages preview URL for the current branch. Use when the user says '/get-branch-preview', 'preview link', 'branch preview URL', 'where is my preview', or asks about branch deployment status.
---

# Get Branch Preview URL

Compute and display the GitHub Pages branch preview URL for the current git branch.

## When to Use

- User asks for a preview link or branch preview URL
- User wants to know where their branch is deployed
- User asks "where is my preview" or similar
- Triggered by `/get-branch-preview`

## Steps

### Step 1: Get the current branch name

Run:

```bash
git rev-parse --abbrev-ref HEAD
```

If the branch is `main`, tell the user that `main` deploys to the site root, not a branch preview. The production URL is the GitHub Pages base URL (see Step 3). Stop here.

If the branch is `HEAD` (detached), tell the user they are in detached HEAD state and need to be on a named branch for previews. Stop here.

### Step 2: Compute the branch slug

Apply the same sanitization logic used in `.github/workflows/deploy-pages.yml`:

1. Replace any character that is NOT `a-zA-Z0-9_.-` with a dash (`-`)
2. Collapse consecutive dashes into a single dash
3. Trim leading and trailing dashes

**Examples:**

| Branch Name | Slug |
|---|---|
| `feature/add-login` | `feature-add-login` |
| `srimel/initial-setup-2` | `srimel-initial-setup-2` |
| `bugfix/fix--double-dash` | `bugfix-fix-double-dash` |
| `my.branch.name` | `my.branch.name` |

Implement this in the shell. For PowerShell:

```powershell
$branch = git rev-parse --abbrev-ref HEAD
$slug = ($branch -replace '[^a-zA-Z0-9_.\-]', '-') -replace '-+', '-' -replace '^-|-$', ''
```

For bash/sh:

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
SLUG=$(echo "$BRANCH" | sed 's/[^a-zA-Z0-9_.-]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
```

### Step 3: Resolve the GitHub Pages base URL

Determine the base URL from the git remote:

```bash
git remote get-url origin
```

Parse the org and repo from the remote URL:

- HTTPS format: `https://github.com/{org}/{repo}.git`
- SSH format: `git@github.com:{org}/{repo}.git`

The GitHub Pages URL convention is:

```
https://{org}.github.io/{repo}
```

For this repository (`Trimble-Construction/lista-payroll-design`), the base URL is:

```
https://trimble-construction.github.io/lista-payroll-design
```

### Step 4: Output the preview URL

Combine the base URL with the branch slug:

```
{base}/branches/{slug}/
```

Display the result clearly:

```
Branch:      feature/add-login
Slug:        feature-add-login
Preview URL: https://trimble-construction.github.io/lista-payroll-design/branches/feature-add-login/
```

### Step 5 (Optional): Verify deployment status

Check `branches.json` on the gh-pages branch to confirm the preview is actually deployed:

```bash
git fetch origin gh-pages
git show origin/gh-pages:branches.json
```

Parse the JSON and check if the computed slug exists as a key. Report:

- **Deployed** -- the slug is in `branches.json` and the preview is live
- **Not yet deployed** -- the slug is not in `branches.json`; the branch may not have been pushed yet, or the deploy workflow hasn't run. Suggest pushing the branch and checking the Actions tab.

If `branches.json` doesn't exist or `gh-pages` branch doesn't exist, report that no branch previews have been deployed yet.

## Reference

- Branch preview workflow: `.github/workflows/deploy-pages.yml`
- Slug computation: `deploy-pages.yml` > "Compute branch slug" step
- Branch registry: `branches.json` on the `gh-pages` branch
