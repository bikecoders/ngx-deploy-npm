# Node compatibility (after migrations finish)

**When:** last step of a migration run — only after `nx migrate --run-migrations` succeeds.

**Why last:** `package.json` already has the new Nx version. Update from **that current state**:

- [.nvmrc](../../../.nvmrc)
- Root [package.json](../../../package.json) `devDependencies["@types/node"]` (major must match `.nvmrc`)
- [.github/workflows/backwards-compatibility-test.yml](../../../.github/workflows/backwards-compatibility-test.yml)
- [.github/workflows/basic-test.yml](../../../.github/workflows/basic-test.yml) (`unit-test` matrix)
- [.github/workflows/e2e-test.yml](../../../.github/workflows/e2e-test.yml)
- **`main` branch protection** required status checks — see [branch-protection.md](branch-protection.md)

`nx migrate <major>` is still **one major per run**; this section only aligns CI/`.nvmrc` with whatever major is in the workspace **now**.

**Fetch both pages every run** — do not reuse cached tables.

| Source              | URL                                                |
| ------------------- | -------------------------------------------------- |
| Nx × Node matrix    | https://nx.dev/docs/technologies/node/introduction |
| Node release status | https://nodejs.org/en/about/previous-releases      |

## How `nx-version` resolves (one row per supported major)

**We support every Nx major from the minimum in `packages/ngx-deploy-npm` `peerDependencies` up through the workspace major, and we test all of them** — not just current/previous/minimum. `''` and `'previous'` are tags; every other supported major in between gets its own pinned-semver row.

| YAML `nx-version`          | Type                      | Resolves at CI/smoke time                                                                                                                                                          |
| -------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `''`                       | Workspace (not a tag)     | `package.json` → `devDependencies.nx` (current workspace after migrate)                                                                                                            |
| `'previous'`               | **npm dist-tag**          | Literal tag `previous` on install (`create-nx-workspace@previous`, …). Major from `npm view nx dist-tags` or `npm view create-nx-workspace@previous version` — not workspace math. |
| `'20.8.4'`, `'21.6.11'`, … | Pinned semver (not a tag) | **Latest non-deprecated patch** of each supported major not already covered by `''` or `'previous'` ([below](#pinned-majors-latest-patch-of-each))                                 |

**Keep `'previous'` as a tag** — Nx sometimes ships fixes only on `previous`; a frozen semver in YAML would miss them.

**Deriving the full major list:** take `packages/ngx-deploy-npm/package.json` → `peerDependencies["@nx/devkit"]` minimum major (e.g. `>=19.0.0` → **19**) through the workspace major (e.g. **23**). Every major in that inclusive range needs a row. Majors already covered by `''` (workspace) or `'previous'` (dist-tag) don't need a duplicate pinned row — every other major in the range does.

## Map Node.js versions from the Nx table → `node-version`

The Nx docs **Node Version** column is **Node.js**, not Nx (e.g. Nx 22.x → `26.x, 24.x, ^22.12.0, ^20.19.0`).

| Node.js (as written in Nx docs) | Value for GitHub `node-version` and `.nvmrc` |
| ------------------------------- | -------------------------------------------- |
| `26.x`                          | `26`                                         |
| `24.x`                          | `24`                                         |
| `22.x`, `^22.12.0`              | `22`                                         |
| `20.x`, `^20.19.0`              | `20`                                         |
| `18.x`                          | `18`                                         |

## CI matrix (complete Node coverage per mechanism)

**Rule:** each `nx-version` entry × **every** Node major Nx documents for the major that entry resolves to.

### Procedure (read current versions first)

1. Fetch Nx Node compatibility table.
2. **Workspace major** — `npm pkg get devDependencies.nx` (or read `package.json`); strip to major (e.g. `22` from `22.7.2`).
3. **Minimum supported major** — `packages/ngx-deploy-npm/package.json` → `peerDependencies["@nx/devkit"]` lower bound (e.g. `>=19.0.0` → **19**).
4. **`''` block** — comment `# <major>.x`; all `node-version` rows from the Nx docs row for the workspace major.
5. **`'previous'` block** — `npm view nx dist-tags`; comment for the major `previous` points at; all Node rows for that major; YAML stays `'previous'`.
6. **Pinned-major blocks** — for every major strictly between the minimum supported major and the workspace major that isn't the `previous` major, add a pinned-semver block ([below](#pinned-majors-latest-patch-of-each)). Also pin the minimum major itself unless it happens to equal `previous`'s major.
7. No duplicate `(nx-version, node-version)` pairs; no gaps in the major range.

Do **not** add matrix rows for Nx majors above the workspace version in `package.json`.

### [basic-test.yml](../../../.github/workflows/basic-test.yml) and [e2e-test.yml](../../../.github/workflows/e2e-test.yml)

PR/release **unit** and **e2e** jobs run against **workspace** Nx (`package.json`) on Ubuntu and Windows. In both workflows, set the `unit-test` / `e2e-test` `node-version` matrix to **all** Node majors from the Nx docs row for the workspace major — the same set as the `''` tier in backwards-compat.

Example for workspace Nx **22.x**:

```yaml
node-version: [20, 22, 24, 26]
```

Lint and build jobs use [.nvmrc](../../../.nvmrc) via setup (no matrix). Coverage is uploaded only from the matrix row matching `.nvmrc` (ubuntu + that Node version).

Update workflow comments when the workspace major changes. These files do **not** use `nx-version` / `previous` / pins.

### YAML shape (backwards-compat)

```yaml
include:
  - nx-version: '' # package.json devDependencies.nx (e.g. 23.x)
    node-version: <all nodes for workspace major from Nx docs>
  - nx-version: 'previous' # npm dist-tag (e.g. 22.x)
    node-version: <all nodes for major from npm view nx dist-tags → previous>
  - nx-version: '21.6.11' # latest nx@21 on npm
    node-version: <all nodes for 21.x from Nx docs, or inferred>
  - nx-version: '20.8.4' # latest nx@20 on npm
    node-version: <all nodes for 20.x from Nx docs, or inferred>
  - nx-version: '19.8.14' # latest non-deprecated nx@19 on npm
    node-version: <retained or inferred set — 19.x predates the docs table>
```

Example when `package.json` has **23.1.0**, peer minimum is **19**, and `previous: 22.7.7` (verify live — every major 19–23 needs a row):

| YAML `nx-version` | Resolves to            | Node rows      |
| ----------------- | ---------------------- | -------------- |
| `''`              | 23.x from package.json | 26, 24, 22     |
| `previous`        | 22.x via npm tag       | 26, 24, 22, 20 |
| `21.6.11`         | pinned 21.x            | 24, 22, 20     |
| `20.8.4`          | pinned 20.x            | 22, 20, 18     |
| `19.8.14`         | pinned 19.x (min)      | 22, 20, 18     |

### Pinned majors (latest patch of each)

Every supported major that isn't the workspace major (`''`) or the `previous` dist-tag major gets its own pinned row — the **latest non-deprecated release** of that major on npm:

```bash
npm view nx@<major> version
# e.g. npm view nx@21 version → 21.6.11
npm view nx@<major>.<latest-minor>.<latest-patch> deprecated
# confirm it's not deprecated; if it is, step back one patch
```

**When `previous` moves up** (new Nx major released on npm), the major that dropped off `previous` keeps (or gains) its own pinned row at latest patch — it's still in the supported range, just no longer reachable via the `previous` tag.

Example: workspace was on **20**, you migrated to **21**; `previous` now tracks **20** on npm, so **20** stays covered by the `previous` tag; a prior pinned **20.x** row (if any) becomes redundant and should be removed, while **19** keeps its own pinned row.

**Raising the floor** (`>=20.0.0`): breaking change — drop the **19.x** row, bump the peer dependency, update README.

### Pinned major not on Nx docs

Retain existing Node rows for that pin, or infer from the closest documented major (the Nx docs table only covers the last few majors; 19.x and older predate it).

## `.nvmrc`

Nx docs row for **workspace major** (from `package.json`) ∩ **Node LTS** from [Node.js Releases](https://nodejs.org/en/about/previous-releases). One integer line (`24`).

## `@types/node` (root `package.json`)

Match the **major** in `.nvmrc` — not whatever `nx migrate` last wrote (often an older major).

```bash
# .nvmrc is 24 → align typings
npm view @types/node@24 version
```

Set `devDependencies["@types/node"]` to `^<major>.<latest-patch>` (e.g. `^24.12.4` when `.nvmrc` is `24`). Run `npm install` if you change it outside the main migrate install step.

## Checklist

- [ ] Migrations finished; `package.json` nx version is the new major for this run
- [ ] Fetched Nx and Node release pages
- [ ] `''` tier: all nodes for **workspace** major; comment updated
- [ ] `previous` tier: yaml `'previous'`; nodes for tag major from npm
- [ ] Every major from the peer-dependency minimum through the workspace major has a row — `''`, `previous`, or a pinned semver; no gaps
- [ ] Each pinned row uses the latest non-deprecated patch of its major
- [ ] No duplicate `(nx-version, node-version)` pairs; no tiers above workspace major
- [ ] `.nvmrc` matches workspace major ∩ LTS
- [ ] Root `@types/node` major matches `.nvmrc` (bump if `nx migrate` left an older major)
- [ ] [basic-test.yml](../../../.github/workflows/basic-test.yml) and [e2e-test.yml](../../../.github/workflows/e2e-test.yml) `node-version` list all nodes for workspace major
- [ ] `main` branch protection: unit/e2e required contexts use `.nvmrc` on ubuntu + windows ([branch-protection.md](branch-protection.md))
- [ ] Handoff lists resolved versions per tier (no commit)
