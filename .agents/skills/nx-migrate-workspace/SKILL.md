---
name: nx-migrate-workspace
description: >-
  Upgrade this Nx workspace one major per run with nx migrate, then update
  backwards-compat CI (one row per supported Nx major, not just
  current/previous/minimum), basic-test/e2e Node matrices, .nvmrc,
  @types/node, and GitHub main required status checks for .nvmrc Node from
  the workspace version after migrations finish.
  Never jump multiple nx migrate majors in one run. Use when updating
  or migrating Nx.
---

# Nx workspace migration

The user reviews all changes — **never commit, push, or open a PR** unless asked.

## Hard rules

1. **`nx migrate` one major per run** — e.g. on 21.x use `nx migrate 22` only; stop and summarize; repeat later for 23.
2. **Compatibility CI last** — update [backwards-compatibility-test.yml](.github/workflows/backwards-compatibility-test.yml), [basic-test.yml](.github/workflows/basic-test.yml) (unit-test matrix), [e2e-test.yml](.github/workflows/e2e-test.yml), [.nvmrc](.nvmrc), root `package.json` `devDependencies["@types/node"]`, and **`main` branch protection** required contexts for `.nvmrc` Node only **after** `nx migrate --run-migrations`, using the version now in `package.json`.
3. **Test every supported major, not just current/previous/minimum** — `backwards-compatibility-test.yml` needs one row per Nx major from the `peerDependencies` floor through the workspace major (see [node-compatibility.md](references/node-compatibility.md)); a gap in that range is a bug in the CI matrix.
4. **Do not skip ahead in CI** — matrix rows must not target Nx majors above what `package.json` has after this run.
5. **`npm exec nx …`** — this repo uses npm. When passing `--flags` to nx, use `npm exec -- nx …`; otherwise npm swallows flags like `--run-migrations` as its own config and nx silently runs without them. Exception: while an Nx migrate run is active (step 5), run its runbook commands (`npx nx …`) exactly as given.
6. **No git commits** — pass `--create-commits=false` to `--run-migrations`. Since Nx 24 it refuses to start on the default branch without an explicit commit choice.

## Before starting

1. Current major = `package.json` → `devDependencies.nx` (e.g. `22.7.2` → **22**).
2. Target = user input or `npm view nx version`; **migrate target** = current major + 1 only.
3. If current ≥ target, stop.
4. Tell the user: _"This run migrates to 23.x only. Re-run for further majors."_

## Workflow

```
One major per run:
- [ ] 1. nx migrate <target-major>
- [ ] 2. Review package.json / migrations.json (note "prompt" migrations)
- [ ] 3. npm install
- [ ] 4. Migrate coupled plugins (+ scoped overrides if peer range lags) + npm install
- [ ] 5. nx migrate --run-migrations --create-commits=false --skip-install (follow Nx runbook + AI prompts)
- [ ] 6. Node compatibility (.nvmrc + @types/node + backwards-compat + basic-test + e2e-test + main branch protection) — after step 5; see references
- [ ] 7. nx build / test / lint ngx-deploy-npm + smoke (required if executors/e2e targets changed)
- [ ] 8. Clean up migrations.json + tools/ai-migrations/; summarize for review (no commit)
```

### 1 — Plan

```bash
npm exec nx migrate <target-major>
```

Example: workspace on 21.x → `npm exec nx migrate 22`.

### 2 — Review

- All `nx` and `@nx/*` versions aligned in `package.json`.
- Scan `migrations.json` for breaking codemods.
- List entries with a `"prompt"` field — AI-driven migrations whose instructions `nx migrate` wrote to `tools/ai-migrations/<package>/<version>/`. They need agent work in step 5.
- Do not run `--run-migrations` until `npm install` succeeds.

### 3 — Install

```bash
npm install
```

### 4 — Coupled plugins

```bash
npm exec nx migrate @jscutlery/semver@latest
npm install
```

Use `nx_docs` or the package README for other Nx-coupled packages.

If the latest coupled plugin's peer range excludes the new major (npm `ERESOLVE`), add a scoped override to root `package.json` instead of `legacy-peer-deps`, then `npm install`. Remove it once the plugin supports the major, and list it in the handoff.

```json
"overrides": {
  "@jscutlery/semver": { "@nx/devkit": "$@nx/devkit" }
}
```

### 5 — Codemods

```bash
npm exec -- nx migrate --run-migrations --create-commits=false --skip-install
```

`--skip-install` because steps 3–4 already installed; without it Nx reinstalls and can hit the same peer conflicts.

**Agentic migrate run (Nx ≥ 24).** In an agent session Nx starts a migrate run and prints a `RUNBOOK.md` (under `.nx/migrate-runs/<run-id>/`). The runbook is the contract: drive its loop, write each handoff file it names, and don't run other mutating `nx` commands meanwhile. Don't duplicate it here — it changes between Nx versions.

**AI prompt migrations.** For each `"prompt"` migration, apply every numbered step of its `tools/ai-migrations/…` file. Verify behaviour against the pre-migration setup, not just green checks:

- Resolved targets: `nx show project <name> --json` before/after (executor, `cwd`, options, `inputs`, `outputs`, configurations).
- Same files linted and tested; coverage still written to the paths CI and Sonar read.
- Converted executors run differently: inferred targets use `nx:run-commands` (options become CLI flags) from the **project root**, while the old executors ran from the workspace root.

Fix failures before step 6.

### 6 — Node compatibility (after migrations)

Follow [references/node-compatibility.md](references/node-compatibility.md).

`package.json` already reflects the new major. Align CI and `.nvmrc` with **current** resolution — not a future major:

| `nx-version` in YAML                            | How it resolves                                                                                                    | What to update                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `''`                                            | `package.json` `devDependencies.nx`                                                                                | Comment + all `node-version` rows for **that** major (Nx docs) |
| `'previous'`                                    | npm dist-tag `previous` (`npm view nx dist-tags`)                                                                  | Keep `'previous'`; comment + Node rows for the tag’s major     |
| pinned semver (**one row per remaining major**) | latest non-deprecated `npm view nx@<major> version`, for every supported major not covered by `''` or `'previous'` | Pin patch / Node rows per reference — do not skip a major      |

Do **not** replace `'previous'` with a numeric version. **Keep the `previous` tag** — Nx sometimes ships fixes only there.

**Supported range = `peerDependencies["@nx/devkit"]` floor through the workspace major.** E.g. floor 19, workspace 23 → majors 19, 20, 21, 22, 23 all need a row (22 via `previous`, 23 via `''`, 19/20/21 pinned).

Also update [basic-test.yml](.github/workflows/basic-test.yml) (`unit-test` job) and [e2e-test.yml](.github/workflows/e2e-test.yml): set `node-version` to **every** Node major Nx documents for the **workspace** major (same list as the `''` tier in backwards-compat), e.g. Nx 22.x → `[20, 22, 24, 26]`. Update workflow comments when the workspace major changes.

Set root `devDependencies["@types/node"]` to the **same major as `.nvmrc`** (e.g. `.nvmrc` `24` → `^24.x` with a current patch from `npm view @types/node@24 version`). `nx migrate` often leaves stale `@types/node` (e.g. `^20.x`); fix it in this step, not only when `.nvmrc` changes.

When `.nvmrc` changes, update **`main` required status checks** so unit/e2e matrix gates use the new Node (ubuntu + windows only). Follow [references/branch-protection.md](references/branch-protection.md) — use `gh api` (the repo-admin MCP only sees rulesets, not `main`'s classic protection).

### 7 — Validate

```bash
npm exec nx build ngx-deploy-npm
npm exec nx test ngx-deploy-npm
npm exec nx lint ngx-deploy-npm
```

**Smoke is required** when executors were converted or e2e targets changed (Nx's own final validation never runs e2e). Full e2e is recommended:

```bash
env -u NX_WORKSPACE_ROOT_PATH -u CLAUDECODE npm exec nx smoke ngx-deploy-npm-e2e
env -u NX_WORKSPACE_ROOT_PATH -u CLAUDECODE npm exec -- nx e2e ngx-deploy-npm-e2e --configuration=ci
```

Unset those variables so local runs match CI. An editor-set `NX_WORKSPACE_ROOT_PATH` points `nx` inside the generated test workspace at this repo. Agent variables like `CLAUDECODE` make `create-nx-workspace` swap the `npm` preset for a template, which then fails on `git add` inside the ignored `tmp/`.

### 8 — Handoff

Include: Nx old → new; files changed; `.nvmrc` and `@types/node` rationale; matrix tier counts; whether `main` branch protection contexts were updated; peer warnings and any `overrides` added; AI prompt migrations and what they changed; remaining majors; suggested commit message (text only).

Clean up before handoff: delete `migrations.json` and `tools/ai-migrations/` — never commit them.

## Optional follow-ups

- `packages/ngx-deploy-npm/package.json` `peerDependencies` if minimum Nx changes (breaking release)
- README compatibility table

## Related (not this workflow)

[.github/actions/migrate/action.yml](.github/actions/migrate/action.yml) is used by [test-nx-next.yml](.github/workflows/test-nx-next.yml) for **`nx@next`** smoke runs—not the one-major workspace upgrade above.
