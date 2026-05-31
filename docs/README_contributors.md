# README for contributors <!-- omit in toc -->

## Table of content <!-- omit in toc -->

- [How to start](#how-to-start)
- [Common tasks](#common-tasks)
- [Testing on an external workspace](#testing-on-an-external-workspace)
- [Debugging on External Workspaces](#debugging-on-external-workspaces)
  - [Option A), the easy one](#option-a-the-easy-one)
  - [Option B), the traditional one](#option-b-the-traditional-one)
- [Making a Contribution](#making-a-contribution)
- [E2E test](#e2e-test)
- [Smoke test](#smoke-test)
- [Continuous Inspection (SonarQube)](#continuous-inspection-sonarqube)
- [Test different node versions](#test-different-node-versions)
- [When are my changes going to be public?](#when-are-my-changes-going-to-be-public)

## How to start

1. Use the Node.js version from [`.nvmrc`](../.nvmrc) (for example with [nvm](https://github.com/nvm-sh/nvm)).

2. Install dependencies:

   ```bash
   npm ci
   ```

The development process and project architecture are like any other [Nx Plugin](https://nx.dev/docs/extending-nx/intro/getting-started).

The maintainers recommend having some knowledge about:

- [Nx Plugins](https://nx.dev/docs/extending-nx/intro/getting-started)
- [Nx Generators](https://nx.dev/docs/extending-nx/local-generators) (this package ships an install generator and a deploy executor)

Watch this video to know pretty much everything about this plugin development; it's highly recommended.

[![Nx Plugin](https://img.youtube.com/vi/fC1-4fAZDP4/0.jpg)](https://www.youtube.com/embed/fC1-4fAZDP4?start=40&end=182)

## Common tasks

Run tasks through Nx (prefix with `npx` if `nx` is not on your PATH):

| Task             | Command                           |
| :--------------- | :-------------------------------- |
| Build the plugin | `npx nx build ngx-deploy-npm`     |
| Unit tests       | `npx nx test ngx-deploy-npm`      |
| Lint             | `npx nx lint ngx-deploy-npm`      |
| E2E tests        | `npx nx e2e ngx-deploy-npm-e2e`   |
| Smoke tests      | `npx nx smoke ngx-deploy-npm-e2e` |

E2E and smoke targets build `ngx-deploy-npm` first (`dependsOn: ["^build"]` on the e2e target).

## Testing on an external workspace

To try your local changes against a real consumer workspace, build the plugin and link it into a separate Nx workspace.

### 1. Create a test workspace (recommended)

The E2E suite uses [`create-nx-workspace`](https://nx.dev/docs/reference/create-nx-workspace) the same way. Spin up a fresh workspace with the npm preset:

```bash
npx create-nx-workspace@latest my-test-workspace --preset=npm --nxCloud=skip --no-interactive
cd my-test-workspace
```

Use the same major Nx version as this repo when you need to reproduce a compatibility issue (see `devDependencies["@nx/workspace"]` in the root [`package.json`](../package.json)).

### 2. Build and link the plugin

From this repository:

1. Build the project:

   ```bash
   npx nx build ngx-deploy-npm
   ```

2. Go to the compiled package:

   ```bash
   cd dist/packages/ngx-deploy-npm
   ```

3. Publish a local link:

   | `npm link` (recommended) | `yalc`             |
   | :----------------------- | :----------------- |
   | `npm link`               | `npx yalc publish` |

4. In your test workspace:

   | `npm link`                | `yalc`                        |
   | :------------------------ | :---------------------------- |
   | `npm link ngx-deploy-npm` | `npx yalc add ngx-deploy-npm` |

5. Install the generator in the consumer project (one library at a time):

   ```bash
   npx nx generate ngx-deploy-npm:install --project=your-library --dist-folder-path=dist/packages/your-library
   ```

6. Try a dry-run deploy:

   ```bash
   npx nx deploy your-library --dry-run
   ```

## Debugging on External Workspaces

There are two ways of debugging:

#### Option A), the easy one

> ⚡ **Pre Step:** follow the steps of [Testing on an external workspace](#testing-on-an-external-workspace) as pre step
>
> ⚠️ Only works on VsCode!

1. Place `debugger` statement or a red-point where you want your deployer to stop.
2. Build your project `npx nx build ngx-deploy-npm`.

On VsCode, create a [_JavaScript Debug Terminal_](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_javascript-debug-terminal) and execute the command that you want to debug

#### Option B), the traditional one

> ⚡ **Pre Step:** follow the steps of [Testing on an external workspace](#testing-on-an-external-workspace) as pre step

1. Use your favorite [Inspector Client](https://nodejs.org/de/docs/guides/debugging-getting-started/#inspector-clients) to debug

2. Now, run your command on debug mode using:

   ```bash
   NODE_OPTIONS='--inspect-brk' npx nx deploy your-library --dry-run
   ```

   Adjust the project name and options to match what you are testing.

3. Use your favorite Inspector Client to debug

   > This is the standard procedure to debug a NodeJs project. If you need more information, you can read the official Docs of NodeJs to learn more about it.
   >
   > [https://nodejs.org/de/docs/guides/debugging-getting-started/](https://nodejs.org/de/docs/guides/debugging-getting-started/)

## Making a Contribution

1. Verify the issues. Maybe your problem or request already has been addressed by another member of the community
2. Fork it
3. Create your branch
4. Create your commits using [our guidelines](https://www.conventionalcommits.org/en/v1.0.0/)
   - If you need help use `npm run commit`
   - We use the commit history to generate the changelog automagically, do your best describing the changes that you introduce 😄. Creating the commit right is essential.
   - We encourage the use of Unit Tests for the fixes and new features. Don't you know how to write Unit Tests? Don't let that stop your contribution; we are here to help 👋.
5. Make a PR against `main`
   - We **squash and merge** PRs: the **PR title** becomes the commit message used for versioning and the changelog. Use a [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) title (e.g. `feat: add foo`).
   - The **PR Release Preview** workflow comments on your PR with the expected version bump and changelog, and **fails** if the title is not a valid conventional commit.
6. Wait for the review
7. Merge and Party 🎉

## E2E test

We at this project have E2E tests. They are handy to test production-like scenarios and to have confidence in your changes.

Run them locally:

```bash
npx nx e2e ngx-deploy-npm-e2e
```

Each test:

1. Starts a local [Verdaccio](https://verdaccio.org/) registry (see the `bikecoders:local-registry` target).
2. Publishes the built plugin to that registry with the `e2e` dist-tag.
3. Creates a consumer workspace with `create-nx-workspace` (npm preset, same pattern as above).
4. Installs `ngx-deploy-npm@e2e` from the local registry and exercises install/deploy flows.

Useful environment variables:

| Variable                                | Purpose                                                  |
| :-------------------------------------- | :------------------------------------------------------- |
| `NGX_DEPLOY_NPM_E2E__NO_TEAR_DOWN=true` | Keep the generated workspace under `tmp/` for inspection |
| `NGX_DEPLOY_NPM_E2E__NX_VERSION`        | Pin the Nx version passed to `create-nx-workspace`       |
| `NGX_DEPLOY_NPM_E2E__PROJECT_NAME`      | Change the temporary workspace folder name               |

## Smoke test

We conduct a series of small and pragmatic e2e tests called the **smoke test**. This test is essential for testing the package's core functionality.

Run them locally:

```bash
npx nx smoke ngx-deploy-npm-e2e
```

Using the smoke tests, we composed a series of more elaborate tests. Such as:

- **Compatibility Observability Test**: Scheduled test to verify daily if our package is working with the `latest` version of nx
- **Backwards Compatibility Test**: To verify if the current changes work correctly with the supported versions of nx that we are committed to maintaining (see [Compatibility overview with Nx
  ](https://github.com/bikecoders/ngx-deploy-npm?tab=readme-ov-file#compatibility-overview-with-nx)).

It's essential to handle the libraries' build before running these tests. These tests will use whatever is in the dist folder. This is done using the build closest to the actual build on the NPM registry.

## Continuous Inspection (SonarQube)

We have continuous inspection for each PR that is made; we use SonarQube for this. It will suggest some changes, detect code smells in your changes and, security recommendations. We encourage implementing the changes that Sonar offers.

If you are changing the Sonar configuration file is highly recommended to test the changes locally.

To init the server:

- `npm run sonar:init-server`

To run the analysis:

- `npm run sonar:analysis`

To inspect the analysis, go to http://localhost:9000. The credentials are `admin` and password `12345`

## Test different node versions

Here, we run the unit, e2e, and regression tests against different node versions in our CI. We use the [Nx NodeJs Compatibility Matrix](https://nx.dev/nx-api/workspace/documents/nx-nodejs-typescript-version-matrix) to determine which versions should be tested.

The retro compatibility tests are a bit different since we match the Nx Workspace Version with the supported Node versions.

For local development, stick to the one defined in the [`.nvmrc`](../.nvmrc) file.

## When are my changes going to be public?

The CI handles the publishment of a new version. We use GitHub actions as CI.

When the maintainers integrate your PR to `main`, go to the [main branch actions](https://github.com/bikecoders/ngx-deploy-npm/actions/workflows/publishment.yml) and search for the one that belongs to you. The CI will run some tests, if they pass, the next job that publishes your introduced changes will be **on hold** waiting for approval; once the maintainers approve the launching, your changes will be versioned with [`@jscutlery/semver`](https://github.com/jscutlery/semver), published to [npm](https://www.npmjs.com/package/ngx-deploy-npm), and published as a [GitHub release](https://github.com/bikecoders/ngx-deploy-npm/releases) (release notes come from the generated changelog).
