# Node compatibility (after migrations finish)

**When:** last step of a migration run — only after `nx migrate --run-migrations` succeeds.

**Why last:** `package.json` already has the new Nx version. Update from **that current state**:

- [.nvmrc](../../../.nvmrc)
- Root [package.json](../../../package.json) `devDependencies["@types/node"]` (major must match `.nvmrc`)
- [.github/workflows/backwards-compatibility-test.yml](../../../.github/workflows/backwards-compatibility-test.yml)
- [.github/workflows/basic-test.yml](../../../.github/workflows/basic-test.yml) (`unit-test` matrix)
- [.github/workflows/e2e-test.yml](../../../.github/workflows/e2e-test.yml)

`nx migrate <major>` is still **one major per run**; this section only aligns CI/`.nvmrc` with whatever major is in the workspace **now**.

**Fetch both pages every run** — do not reuse cached tables.

| Source              | URL                                                |
| ------------------- | -------------------------------------------------- |
| Nx × Node matrix    | https://nx.dev/docs/technologies/node/introduction |
| Node release status | https://nodejs.org/en/about/previous-releases      |

## How `nx-version` resolves (three fixed YAML values)

YAML keys stay `''`, `'previous'`, and one pinned semver. Edit **`node-version` rows** and **comments** only.

| YAML `nx-version` | Type                      | Resolves at CI/smoke time                                                                                                                                                          |
| ----------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `''`              | Workspace (not a tag)     | `package.json` → `devDependencies.nx` (current workspace after migrate)                                                                                                            |
| `'previous'`      | **npm dist-tag**          | Literal tag `previous` on install (`create-nx-workspace@previous`, …). Major from `npm view nx dist-tags` or `npm view create-nx-workspace@previous version` — not workspace math. |
| `'19.8.14'`       | Pinned semver (not a tag) | **Latest patch** of the minimum supported **major** ([below](#minimum-pin-latest-patch-of-a-major))                                                                                |

**Keep `'previous'` as a tag** — Nx sometimes ships fixes only on `previous`; a frozen semver in YAML would miss them.

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
3. **`''` block** — comment `# <major>.x`; all `node-version` rows from the Nx docs row for that major.
4. **`'previous'` block** — `npm view nx dist-tags`; comment for the major `previous` points at; all Node rows for that major; YAML stays `'previous'`.
5. **Minimum pin block** — [Minimum pin](#minimum-pin-latest-patch-of-a-major).
6. No duplicate `(nx-version, node-version)` pairs.

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
  - nx-version: '' # package.json devDependencies.nx (e.g. 22.x)
    node-version: <all nodes for workspace major from Nx docs>
  - nx-version: 'previous' # npm dist-tag
    node-version: <all nodes for major from npm view nx dist-tags → previous>
  - nx-version: '19.5.7' # latest nx@<minimum-major> on npm
    node-version: <retained or inferred set>
```

Example when `package.json` has **22.7.2** and `previous: 21.6.11` (verify live):

| YAML `nx-version` | Resolves to            | Node rows      |
| ----------------- | ---------------------- | -------------- |
| `''`              | 22.x from package.json | 26, 24, 22, 20 |
| `previous`        | 21.x via npm tag       | 24, 22, 20     |
| `19.8.14`         | latest 19.x pin        | 22, 20, 18     |

### Minimum pin (latest patch of a major)

Oldest major still in `packages/ngx-deploy-npm` `peerDependencies` (e.g. `>=19.0.0` → major **19**). Pin the **last release of that major** on npm:

```bash
npm view nx@<major> version
# e.g. npm view nx@19 version → 19.5.7 (not 19.4.1)
```

**When `previous` moves up** (new Nx major released on npm), the major that dropped off `previous` but is still supported becomes (or stays) the pin — at latest patch for that major.

Example: workspace was on **20**, you migrated to **21**; `previous` now tracks **20** on npm; pin **latest 19.x** if peers still allow 19.

**Raising the floor** (`>=20.0.0`): breaking change — pin latest **20.x**, remove 19 rows, bump peer, update README.

### Minimum pin not on Nx docs

Retain Node rows or infer from the closest documented major.

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
- [ ] Minimum pin: latest patch on npm for minimum supported major
- [ ] No duplicate pairs; no tiers above workspace major
- [ ] `.nvmrc` matches workspace major ∩ LTS
- [ ] Root `@types/node` major matches `.nvmrc` (bump if `nx migrate` left an older major)
- [ ] [basic-test.yml](../../../.github/workflows/basic-test.yml) and [e2e-test.yml](../../../.github/workflows/e2e-test.yml) `node-version` list all nodes for workspace major
- [ ] Handoff lists resolved versions per tier (no commit)
