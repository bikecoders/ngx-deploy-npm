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

## How to derive context names

Pattern: `{caller-job} / {matrix-job} ({os}, {node})`

- Caller jobs come from [pr.yml](../../../.github/workflows/pr.yml): `pr-test` (basic-test), `pr-e2e-test` (e2e-test).
- Matrix jobs: `unit-test`, `e2e-test`.
- `{node}` = integer from [.nvmrc](../../../.nvmrc).

Confirm names on a recent green PR with `user-github` → `pull_request_read` → `get_check_runs` before updating protection.

## How to apply (preferred: repo-admin MCP)

Use **`ngx-deploy-npm-github-repo-admin`** (`CallMcpTool`, server `user-ngx-deploy-npm-github-repo-admin`):

1. **`get_branch_protection`** — `owner: bikecoders`, `repo: ngx-deploy-npm`, `branch: main`. Read `required_status_checks.contexts`.
2. Build the **full** new `contexts` list (GitHub replaces the array; it does not merge).
3. **`update_branch_protection`** — pass `contexts` and `dry_run: true` first, then `dry_run: false` to apply. The tool preserves other protection fields from GET.

Do **not** use `apply_ruleset` on this repo unless migrating off legacy protection — rulesets would stack on classic rules.

### Fallback

- GitHub UI: Settings → Branches → `main` → required status checks.
- `gh api` GET/PATCH `repos/bikecoders/ngx-deploy-npm/branches/main/protection` with the full protection body from GET.

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
- [ ] Check context names verified on a recent PR (`get_check_runs`)
- [ ] `get_branch_protection` on `main` — no stale `…, <old-nvmrc>)` contexts
- [ ] `update_branch_protection` applied (or confirmed already correct)
- [ ] Handoff mentions branch protection if `.nvmrc` changed
