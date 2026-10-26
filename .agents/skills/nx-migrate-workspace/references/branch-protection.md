# Branch protection (`main`) after Node / `.nvmrc` changes

**When:** same migration run as [node-compatibility.md](node-compatibility.md) step 6 — whenever `.nvmrc` changes or the workspace standard Node major changes.

**Why:** CI matrix jobs report check contexts like `pr-test / unit-test (ubuntu-latest, 24)`. If `main` still requires an old Node (e.g. `…, 20)`), PRs can pass CI on the new Node but stay unmergeable.

**Repo:** `bikecoders/ngx-deploy-npm`, branch **`main` only**. This repo uses **classic legacy** branch protection (not rulesets).

## What to require on `main`

Gate merges on:

- `pr-test / build`
- `pr-test / lint`
- `SonarCloud Code Analysis`
- `Check commit message follows guidelines`
- `Check files changes follow guidelines`
- **Ubuntu + Windows** unit and e2e for **`.nvmrc` Node only** — not every matrix Node version

Example when `.nvmrc` is `24`:

| Job family | Required contexts                                                                           |
| ---------- | ------------------------------------------------------------------------------------------- |
| Unit test  | `pr-test / unit-test (ubuntu-latest, 24)`, `pr-test / unit-test (windows-latest, 24)`       |
| E2E        | `pr-e2e-test / e2e-test (ubuntu-latest, 24)`, `pr-e2e-test / e2e-test (windows-latest, 24)` |

Lint/build use `.nvmrc` via setup (no matrix). Do **not** add required checks for other matrix rows (20, 22, 26) unless you intentionally want full-matrix gating.

Backwards-compat smoke jobs are not required checks, so renaming their matrix rows never needs a protection change.

## How to derive context names

Pattern: `{caller-job} / {matrix-job} ({os}, {node})`

- Caller jobs come from [pr.yml](../../../.github/workflows/pr.yml): `pr-test` (basic-test), `pr-e2e-test` (e2e-test).
- Matrix jobs: `unit-test`, `e2e-test`.
- `{node}` = integer from [.nvmrc](../../../.nvmrc).

Confirm the names on a recent green PR before updating protection:

```bash
gh pr checks <pr-number> --repo bikecoders/ngx-deploy-npm
```

## How to apply (`gh api`)

Use the `gh` CLI. It authenticates with the user's login, which has admin on the repo.

Do **not** use the `ngx-deploy-npm-github-repo-admin` MCP for this. It only manages **rulesets**: `check_protection` reads the rulesets API and reports `main` as "Unprotected" even though classic protection is active, and it has no tool to update classic required checks. Never use its `apply_ruleset` on this repo — rulesets would stack on top of the classic rules.

### 1. Read current required checks

```bash
gh api repos/bikecoders/ngx-deploy-npm/branches/main/protection/required_status_checks \
  --jq '{strict, checks}'
```

Each check is pinned to the app that reports it (`15368` = GitHub Actions, `12526` = SonarCloud). Keep those `app_id`s.

### 2. Build the new list (preview)

GitHub **replaces** the list; it does not merge. Send the full set, using `checks` (not the deprecated `contexts`, which drops the `app_id` pins). Example for `.nvmrc` 24 → 26:

```bash
OLD=24 NEW=26
gh api repos/bikecoders/ngx-deploy-npm/branches/main/protection/required_status_checks \
  --jq "{strict, checks: [.checks[] | .context |= sub(\", ${OLD}\\\\)\$\"; \", ${NEW})\")]}" \
  > /tmp/required-checks.json
cat /tmp/required-checks.json
```

Check the preview: only the four `…, <OLD>)` matrix contexts changed to `…, <NEW>)`, the five non-matrix checks are untouched, and every `app_id` is still present.

### 3. Apply and verify

```bash
gh api -X PATCH repos/bikecoders/ngx-deploy-npm/branches/main/protection/required_status_checks \
  --input /tmp/required-checks.json --jq '{strict, checks: [.checks[].context]}'
```

This endpoint changes only required status checks; reviews, admins enforcement and other protection settings stay as they are. Run step 1 again to confirm.

### Fallback

GitHub UI: Settings → Branches → `main` → Edit → required status checks.

## Node bump template (e.g. 20 → 24)

| Remove                                        | Add                                           |
| --------------------------------------------- | --------------------------------------------- |
| `pr-test / unit-test (ubuntu-latest, 20)`     | `pr-test / unit-test (ubuntu-latest, 24)`     |
| `pr-test / unit-test (windows-latest, 20)`    | `pr-test / unit-test (windows-latest, 24)`    |
| `pr-e2e-test / e2e-test (ubuntu-latest, 20)`  | `pr-e2e-test / e2e-test (ubuntu-latest, 24)`  |
| `pr-e2e-test / e2e-test (windows-latest, 20)` | `pr-e2e-test / e2e-test (windows-latest, 24)` |

Keep the five non-matrix checks unchanged.

## Checklist

- [ ] `.nvmrc` and CI matrices updated per [node-compatibility.md](node-compatibility.md)
- [ ] Check context names verified on a recent PR (`gh pr checks`)
- [ ] Current required checks read with `gh api` — no stale `…, <old-nvmrc>)` contexts after the update
- [ ] PATCH applied with `checks` (`app_id`s kept), or confirmed already correct
- [ ] Handoff mentions branch protection if `.nvmrc` changed
