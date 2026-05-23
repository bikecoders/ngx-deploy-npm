# README for contributors <!-- omit in toc -->

## Table of content <!-- omit in toc -->

- [How to start](#how-to-start)
- [Angular workspace](#angular-workspace)
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

As an essential start, you can start installing the project's dependencies:

```bash
yarn install
```

The development process and project architecture are like any other [Nx Plugin](https://nx.dev/l/a/core-concepts/nx-devkit).

The maintainers recommend having some knowledge about:

- [Angular Schematics](https://angular.io/guide/schematics) and,
- [Nx Plugins](https://nx.dev/l/n/nx-plugin/overview)

Watch this video to know pretty much everything about this plugin development; it's highly recommended.

[![Nx Plugin](https://img.youtube.com/vi/fC1-4fAZDP4/0.jpg)](https://www.youtube.com/embed/fC1-4fAZDP4?start=40&end=182)

## Angular workspace

To test the functionality on an Angular workspace, we need to perform some manual operations

1. Build the project

   ```bash
   nx build ngx-deploy-npm
   ```

2. Go to the compiled files

   ```bash
   cd dist/packages/ngx-deploy-npm
   ```

3. Create a local version of the package:

   | `yarn link` | `yalc`          |
   | :---------- | :-------------- |
   | `yarn link` | `npx yalc link` |

4. On your [Angular workspace](https://angular.io/cli/new) and:

   | `yarn link` (recomended)   | `yalc`                        |
   | :------------------------- | :---------------------------- |
   | `yarn link ngx-deploy-npm` | `npx yalc add ngx-deploy-npm` |

## Debugging on External Workspaces

There are two ways of debugging:

#### Option A), the easy one

> ⚡ **Pre Step:** follow the steps of [yarn link](#angular-workspace) as pre step
>
> ⚠️ Only works on VsCode!

1. Place `debugger` statement or a red-point where you want your deployer to stop.
2. Build your project `nx build ngx-deploy-npm`.

On VsCode, create a [_JavaScript Debug Terminal_](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_javascript-debug-terminal) and execute the command that you want to debug

#### Option B), the traditional one

> ⚡ **Pre Step:** follow the steps of [yarn link](#angular-workspace) as pre step

1. Use your favorite [Inspector Client](https://nodejs.org/de/docs/guides/debugging-getting-started/#inspector-clients) to debug

2. Now, run your command on debug mode using:

   ```bash
   node --inspect-brk ./node_modules/@nx/cli/bin/nx
   ```

3. Use your favorite Inspector Client to debug

   > This is the standard procedure to debug a NodeJs project. If you need more information, you can read the official Docs of NodeJs to learn more about it.
   >
   > [https://nodejs.org/de/docs/guides/debugging-getting-started/](https://nodejs.org/de/docs/guides/debugging-getting-started/)

## Making a Contribution

1. Verify the issues. Maybe your problem or request already has been addressed by another member of the community
2. Fork it
3. Create your branch
4. Create your commits using [our guidelines](https://www.conventionalcommits.org/en/v1.0.0/)
   - If you need help use `yarn commit`
   - We use the commit history to generate the changelog automagically, do your best describing the changes that you introduce 😄. Creating the commit right is essential.
   - We encourage the use of Unit Tests for the fixes and new features. Don't you know how to write Unit Tests? Don't let that stop your contribution; we are here to help 👋.
5. Make a PR against `main`
   - We **squash and merge** PRs: the **PR title** becomes the commit message used for versioning and the changelog. Use a [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) title (e.g. `feat: add foo`).
   - The **PR Release Preview** workflow comments on your PR with the expected version bump and changelog, and **fails** if the title is not a valid conventional commit.
6. Wait for the review
7. Merge and Party 🎉

## E2E test

We at this project have E2E tests. They are handy to test production-like scenarios and to have confidence in your changes.

## Smoke test

We conduct a series of small and pragmatic e2e tests called the **smoke test**. This test is essential for testing the package's core functionality.

Using the smoke tests, we composed a series of more elaborate tests. Such as:

- **Compatibility Observability Test**: Scheduled test to verify daily if our package is working with the `latest` version of nx
- **Backwards Compatibility Test**: To verify if the current changes work correctly with the supported versions of nx that we are committed to maintaining (see [Compatibility overview with Nx
  ](https://github.com/bikecoders/ngx-deploy-npm?tab=readme-ov-file#compatibility-overview-with-nx)).

It's essential to handle the libraries' build before running these tests. These tests will use whatever is in the dist folder. This is done using the build closest to the actual build on the NPM registry.

## Continuous Inspection (SonarQube)

We have continuous inspection for each PR that is made; we use SonarQube for this. It will suggest some changes, detect code smells in your changes and, security recommendations. We encourage implementing the changes that Sonar offers.

If you are changing the Sonar configuration file is highly recommended to test the changes locally.

To init the server

- `npm run sonar:init-server`
  To run the analysis
- `npm run sonar:analysis`

To inspect the analysis, go to http://localhost:9000. The credentials are `admin` and password `12345`

## Test different node versions

Here, we run the unit, e2e, and regression tests against different node versions in our CI. We use the [Nx NodeJs Compatibility Matrix](https://nx.dev/nx-api/workspace/documents/nx-nodejs-typescript-version-matrix) to determine which versions should be tested.

The retro compatibility tests are a bit different since we match the Nx Workspace Version with the supported Node versions.

For local development, stick to the one defined in the `.npmrc` file.

## When are my changes going to be public?

The CI handles the publishment of a new version. We use GitHub actions as CI.

When the maintainers integrate your PR to `main`, go to the [main branch actions](https://github.com/bikecoders/ngx-deploy-npm/actions/workflows/publishment.yml) and search for the one that belongs to you. The CI will run some tests, if they pass, the next job that publishes your introduced changes will be **on hold** waiting for approval; once the maintainers approve the launching, your changes will be packed and posted to NPM.
