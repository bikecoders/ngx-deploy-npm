---
name: nx-migrate-workspace
description: >-
  Upgrade this Nx workspace one major per run with nx migrate, then update
  backwards-compat CI, basic-test/e2e Node matrices, .nvmrc, and @types/node from the
  workspace version after migrations finish.
  Never jump multiple nx migrate majors in one run. Use when updating
  or migrating Nx.
---

# Nx workspace migration

The user reviews all changes — **never commit, push, or open a PR** unless asked.

## Hard rules

1. **`nx migrate` one major per run** — e.g. on 21.x use `nx migrate 22` only; stop and summarize; repeat later for 23.
2. **Compatibility CI last** — update [backwards-compatibility-test.yml](.github/workflows/backwards-compatibility-test.yml), [basic-test.yml](.github/workflows/basic-test.yml) (unit-test matrix), [e2e-test.yml](.github/workflows/e2e-test.yml), [.nvmrc](.nvmrc), and root `package.json` `devDependencies["@types/node"]` only **after** `nx migrate --run-migrations`, using the version now in `package.json`.
3. **Do not skip ahead in CI** — matrix rows must not target Nx majors above what `package.json` has after this run.
4. **`npm exec nx …`** — this repo uses npm.
5. **No git commits.**

## Before starting

1. Current major = `package.json` → `devDependencies.nx` (e.g. `22.7.2` → **22**).
2. Target = user input or `npm view nx version`; **migrate target** = current major + 1 only.
3. If current ≥ target, stop.
4. Tell the user: _"This run migrates to 23.x only. Re-run for further majors."_

## Workflow

```
One major per run:
- [ ] 1. nx migrate <target-major>
- [ ] 2. Review package.json / migrations.json
- [ ] 3. npm install
- [ ] 4. Migrate coupled plugins + npm install
- [ ] 5. nx migrate --run-migrations
- [ ] 6. Node compatibility (.nvmrc + @types/node + backwards-compat + basic-test + e2e-test) — after step 5; see reference
- [ ] 7. nx build / test / lint ngx-deploy-npm
- [ ] 8. Summarize for review (no commit)
```

### 1 — Plan

```bash
npm exec nx migrate <target-major>
```

Example: workspace on 21.x → `npm exec nx migrate 22`.

### 2 — Review

- All `nx` and `@nx/*` versions aligned in `package.json`.
- Scan `migrations.json` for breaking codemods.
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

### 5 — Codemods

```bash
npm exec nx migrate --run-migrations
```

Fix failures before step 6.

### 6 — Node compatibility (after migrations)

Follow [references/node-compatibility.md](references/node-compatibility.md).

`package.json` already reflects the new major. Align CI and `.nvmrc` with **current** resolution — not a future major:

| `nx-version` in YAML | How it resolves                                   | What to update                                                 |
| -------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| `''`                 | `package.json` `devDependencies.nx`               | Comment + all `node-version` rows for **that** major (Nx docs) |
| `'previous'`         | npm dist-tag `previous` (`npm view nx dist-tags`) | Keep `'previous'`; comment + Node rows for the tag’s major     |
| pinned semver        | latest `npm view nx@<min-major> version`          | Pin patch / Node rows per reference                            |

Do **not** replace `'previous'` with a numeric version. **Keep the `previous` tag** — Nx sometimes ships fixes only there.

Also update [basic-test.yml](.github/workflows/basic-test.yml) (`unit-test` job) and [e2e-test.yml](.github/workflows/e2e-test.yml): set `node-version` to **every** Node major Nx documents for the **workspace** major (same list as the `''` tier in backwards-compat), e.g. Nx 22.x → `[20, 22, 24, 26]`. Update workflow comments when the workspace major changes.

Set root `devDependencies["@types/node"]` to the **same major as `.nvmrc`** (e.g. `.nvmrc` `24` → `^24.x` with a current patch from `npm view @types/node@24 version`). `nx migrate` often leaves stale `@types/node` (e.g. `^20.x`); fix it in this step, not only when `.nvmrc` changes.

### 7 — Validate

```bash
npm exec nx build ngx-deploy-npm
npm exec nx test ngx-deploy-npm
npm exec nx lint ngx-deploy-npm
```

Optional: `npm exec nx smoke ngx-deploy-npm-e2e`

### 8 — Handoff

Include: Nx old → new; files changed; `.nvmrc` and `@types/node` rationale; matrix tier counts; peer warnings; remaining majors; suggested commit message (text only).

## Optional follow-ups

- `packages/ngx-deploy-npm/package.json` `peerDependencies` if minimum Nx changes (breaking release)
- README compatibility table
- Remove `migrations.json` after success if desired

## Related (not this workflow)

[.github/actions/migrate/action.yml](.github/actions/migrate/action.yml) is used by [test-nx-next.yml](.github/workflows/test-nx-next.yml) for **`nx@next`** smoke runs—not the one-major workspace upgrade above.
