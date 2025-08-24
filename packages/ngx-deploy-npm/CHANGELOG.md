# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

# [9.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-8.4.0...ngx-deploy-npm-9.0.0) (2025-08-24)

### Bug Fixes

- adapt install generator to libraries without project.json ([#714](https://github.com/bikecoders/ngx-deploy-npm/issues/714)) ([647d6c9](https://github.com/bikecoders/ngx-deploy-npm/commit/647d6c96a814c32d239a084ef02cd1778e4365de))

### Features

- add support to nx v21 ([#701](https://github.com/bikecoders/ngx-deploy-npm/issues/701)) ([bc68b7e](https://github.com/bikecoders/ngx-deploy-npm/commit/bc68b7e3f049a44d6a0afd2ff3c4e7ad15e9f31b))

### BREAKING CHANGES

- drop support for Nx 16, 17 and 18

# [8.4.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-8.3.1...ngx-deploy-npm-8.4.0) (2024-12-17)

### Features

- **ngx-deploy-npm:** add version check to prevent duplicate publishes ([#667](https://github.com/bikecoders/ngx-deploy-npm/issues/667)) ([0b9f524](https://github.com/bikecoders/ngx-deploy-npm/commit/0b9f524af97a0e7ff6c5e910f4fdf389fee4fe27))

## [8.3.1](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-8.3.0...ngx-deploy-npm-8.3.1) (2024-10-28)

### Bug Fixes

- update the node version to 16 on package.json ([#656](https://github.com/bikecoders/ngx-deploy-npm/issues/656)) ([51c3d26](https://github.com/bikecoders/ngx-deploy-npm/commit/51c3d2689e6485d4efef22b7cb914df915fc3513))

# [8.3.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-8.2.0...ngx-deploy-npm-8.3.0) (2024-10-14)

### Features

- add support to nx v20 ([#634](https://github.com/bikecoders/ngx-deploy-npm/issues/634)) ([94f2c17](https://github.com/bikecoders/ngx-deploy-npm/commit/94f2c17744c4e7059e44395d70d4baa69c8b64f8))

# [8.2.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-8.1.0...ngx-deploy-npm-8.2.0) (2024-06-11)

### Features

- add support for nx v19 ([#606](https://github.com/bikecoders/ngx-deploy-npm/issues/606)) ([3a09676](https://github.com/bikecoders/ngx-deploy-npm/commit/3a09676d2f0a41d0172047f588dfaed97b1d1835))

# [8.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-8.0.1...ngx-deploy-npm-8.1.0) (2024-06-10)

### Features

- add support to Nx v18 ([#602](https://github.com/bikecoders/ngx-deploy-npm/issues/602)) ([e1fbf93](https://github.com/bikecoders/ngx-deploy-npm/commit/e1fbf93648e3dd7ba50cf82fc8c893b3730e6505))

# [8.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-7.1.0...ngx-deploy-npm-8.0.0) (2024-01-19)

### Features

- drop support for Angular workspaces ([#570](https://github.com/bikecoders/ngx-deploy-npm/issues/570)) ([af95f44](https://github.com/bikecoders/ngx-deploy-npm/commit/af95f44f739f485914dcbb5e93f095c2e2225fc1))
- remove internal build process ([#571](https://github.com/bikecoders/ngx-deploy-npm/issues/571)) ([afa228c](https://github.com/bikecoders/ngx-deploy-npm/commit/afa228ceae467c3ffa0247a6a2b20e98d2e637bb))

### BREAKING CHANGES

- - `ngx-deploy-npm:install`: Added `--dist-folder-path` option as
    required.

* `ngx-deploy-npm:install`: Drop the option `--projects`, now, each project needs to be specified
  independently using `--project`.
* `ngx-deploy-npm:deploy`: `distFolderPath` option is now required.
* `ngx-deploy-npm:deploy`: Remove options `noBuild` and `buildTarget`.

- As an alternative, maintainers suggest migrating your Angular Workspaces to Nx
  Workspaces if you want to use this plugin. A stand-alone approach to Nx workspaces is an option that
  you should consider. We apologize for any inconvenience this may cause and appreciate your
  understanding.

# [7.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/ngx-deploy-npm-7.0.1...ngx-deploy-npm-7.1.0) (2023-11-10)

### Features

- add support to nx 17 ([#555](https://github.com/bikecoders/ngx-deploy-npm/issues/555)) ([367362b](https://github.com/bikecoders/ngx-deploy-npm/commit/367362b9f434addb21c7c2d013249ea05b073f09))

## [7.0.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v7.0.0...v7.0.1) (2023-08-12)

### Bug Fixes

- set the right peerDependency on ngx-deploy-npm's package.json ([#536](https://github.com/bikecoders/ngx-deploy-npm/issues/536)) ([6765f4c](https://github.com/bikecoders/ngx-deploy-npm/commit/6765f4ced01906b969e3c4fdad10a2dcdcc9f497))

# [7.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v6.0.0...v7.0.0) (2023-08-07)

### Build System

- align node version with nx compatibility matrix ([#530](https://github.com/bikecoders/ngx-deploy-npm/issues/530)) ([2d6827f](https://github.com/bikecoders/ngx-deploy-npm/commit/2d6827f1ed25afa8d75ec2f69e4a573563a0c8d3))

### BREAKING CHANGES

- drop support to node V16

# [6.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v5.2.0...v6.0.0) (2023-05-15)

### Features

- add support to nx 16 ([#503](https://github.com/bikecoders/ngx-deploy-npm/issues/503)) ([4795cac](https://github.com/bikecoders/ngx-deploy-npm/commit/4795cac137e9c1b9dcf1270a3f9f012a70fad6ee))

### BREAKING CHANGES

- Drop support for previous Nx versions:
  Support for Nx versions 14 and 15 has been discontinued. To continue receiving updates on this project in the future, we recommend upgrading to Nx v16.
- Drop support for Node 14
  The project no longer supports Node.js 14.x. To ensure optimal performance and stability, upgrading to a newer version of Node.js is essential. We recommend using Node.js 16 as it offers adequate compatibility with the project.
- Remove the Init generator
  The generator "init" has been removed from our list of generators. This change has been implemented as the "init" generator was deemed unnecessary and did not provide any functional value. So, you should stop using it in your project from now on.

# [5.2.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v5.1.0...v5.2.0) (2023-02-19)

### Features

- add "registry" option for the deploy executor ([#483](https://github.com/bikecoders/ngx-deploy-npm/issues/483)) ([de8bb70](https://github.com/bikecoders/ngx-deploy-npm/commit/de8bb709878a6beb0e7cdc7ab0f953ef577767b4))

# [5.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v5.0.0...v5.1.0) (2023-02-18)

### Features

- offer support to nx@14 ([#480](https://github.com/bikecoders/ngx-deploy-npm/issues/480)) ([2d4455b](https://github.com/bikecoders/ngx-deploy-npm/commit/2d4455bb3d9eade0a5019cb6d8b5ed1b1edffec8)), closes [#469](https://github.com/bikecoders/ngx-deploy-npm/issues/469)

# [5.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.11...v5.0.0) (2023-02-04)

### Features

- widen peer dependency on @nrwl/devkit ([#473](https://github.com/bikecoders/ngx-deploy-npm/issues/473)) ([c210bfb](https://github.com/bikecoders/ngx-deploy-npm/commit/c210bfbbd08b07e4ecd90a0e029c166f729b3d70))

### BREAKING CHANGES

- Using peerDependencies with npm < 7 may result in unexpected results. Use
  --legacy-peer-deps if needed.

## [4.3.11](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.10...v4.3.11) (2023-01-26)

## [4.3.10](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.9...v4.3.10) (2022-12-06)

### Bug Fixes

- fix grammar on "not able to determine dist folder path" error message ([#447](https://github.com/bikecoders/ngx-deploy-npm/issues/447)) ([f4e3439](https://github.com/bikecoders/ngx-deploy-npm/commit/f4e34395db8a3e1fbf85dcca62e682504034cdbe))

## [4.3.9](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.8...v4.3.9) (2022-12-04)

## [4.3.8](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.7...v4.3.8) (2022-11-30)

## [4.3.7](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.6...v4.3.7) (2022-11-22)

## [4.3.6](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.5...v4.3.6) (2022-11-21)

### Bug Fixes

- fix command execution on windows os ([#421](https://github.com/bikecoders/ngx-deploy-npm/issues/421)) ([0ac77d0](https://github.com/bikecoders/ngx-deploy-npm/commit/0ac77d0fe3805f99ed50e5b13dcfafb20a1e7372))

## [4.3.5](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.4...v4.3.5) (2022-11-15)

### Bug Fixes

- allow publishment of libraries with a large set of files ([#416](https://github.com/bikecoders/ngx-deploy-npm/issues/416)) ([5ee247c](https://github.com/bikecoders/ngx-deploy-npm/commit/5ee247c2f387c68c0e55391bd92ee3515074bf84)), closes [#401](https://github.com/bikecoders/ngx-deploy-npm/issues/401)

## [4.3.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.3...v4.3.4) (2022-11-12)

## [4.3.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.2...v4.3.3) (2022-11-12)

## [4.3.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.1...v4.3.2) (2022-11-04)

### Bug Fixes

- increment exec buffer size to allow package publishment with a large set of files ([#403](https://github.com/bikecoders/ngx-deploy-npm/issues/403)) ([774b14f](https://github.com/bikecoders/ngx-deploy-npm/commit/774b14fccf73e841628a53354f2786635a1a4c0b)), closes [#401](https://github.com/bikecoders/ngx-deploy-npm/issues/401)

## [4.3.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.3.0...v4.3.1) (2022-10-26)

### Bug Fixes

- improve dist folder detection ([#390](https://github.com/bikecoders/ngx-deploy-npm/issues/390)) ([91e829e](https://github.com/bikecoders/ngx-deploy-npm/commit/91e829ee0dc654d23045cbbadc59de06c8236465)), closes [#385](https://github.com/bikecoders/ngx-deploy-npm/issues/385)

# [4.3.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.2.5...v4.3.0) (2022-10-20)

### Features

- add the option to define a custom dist folder path ([#384](https://github.com/bikecoders/ngx-deploy-npm/issues/384)) ([ce50abb](https://github.com/bikecoders/ngx-deploy-npm/commit/ce50abbd86af81c20eb1694b0acc51f7739c2ff3))

## [4.2.5](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.2.4...v4.2.5) (2022-09-28)

## [4.2.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.2.3...v4.2.4) (2022-09-12)

## [4.2.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.2.2...v4.2.3) (2022-09-06)

## [4.2.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.2.1...v4.2.2) (2022-08-24)

## [4.2.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.2.0...v4.2.1) (2022-08-17)

# [4.2.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.1.4...v4.2.0) (2022-08-12)

### Features

- allow `otp` parameter to be a number ([#353](https://github.com/bikecoders/ngx-deploy-npm/issues/353)) ([c09fb8c](https://github.com/bikecoders/ngx-deploy-npm/commit/c09fb8c24f763084b1d442cdc6a9351c43c13d30)), closes [#351](https://github.com/bikecoders/ngx-deploy-npm/issues/351)

## [4.1.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.1.3...v4.1.4) (2022-08-05)

## [4.1.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.1.2...v4.1.3) (2022-07-29)

## [4.1.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.1.1...v4.1.2) (2022-07-19)

## [4.1.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.1.0...v4.1.1) (2022-07-08)

# [4.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.0.4...v4.1.0) (2022-06-20)

### Features

- add `access` option to ng-add/install ([#323](https://github.com/bikecoders/ngx-deploy-npm/issues/323)) ([5e3a40c](https://github.com/bikecoders/ngx-deploy-npm/commit/5e3a40ceed8f78a5c276f64e828bbea8a3fbb4de)), closes [#206](https://github.com/bikecoders/ngx-deploy-npm/issues/206)

## [4.0.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.0.3...v4.0.4) (2022-06-19)

## [4.0.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.0.2...v4.0.3) (2022-06-15)

### Bug Fixes

- misspelled word on dry-run log([#308](https://github.com/bikecoders/ngx-deploy-npm/issues/308)) ([4b9d2ed](https://github.com/bikecoders/ngx-deploy-npm/commit/4b9d2ed8f3ca69a1ac62ffb964f991c87ada63d5))

## [4.0.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.0.1...v4.0.2) (2022-06-14)

## [4.0.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v4.0.0...v4.0.1) (2022-06-14)

# [4.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.9...v4.0.0) (2022-06-14)

- build!: drop node12 and adopt node18 (#255) ([376de35](https://github.com/bikecoders/ngx-deploy-npm/commit/376de35704c19d67912271eac437e2d076a0ef22)), closes [#255](https://github.com/bikecoders/ngx-deploy-npm/issues/255) [#249](https://github.com/bikecoders/ngx-deploy-npm/issues/249)

### BREAKING CHANGES

- `ngx-deploy-npm` no longer offers support for node v12

## [3.1.9](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.8...v3.1.9) (2022-05-01)

## [3.1.8](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.7...v3.1.8) (2022-05-01)

## [3.1.7](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.6...v3.1.7) (2022-05-01)

## [3.1.6](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.5...v3.1.6) (2022-04-06)

## [3.1.5](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.4...v3.1.5) (2022-04-04)

## [3.1.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.3...v3.1.4) (2022-03-26)

## [3.1.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.2...v3.1.3) (2022-03-23)

### Bug Fixes

- adapt ng-add/install to new Nx libraries ([#235](https://github.com/bikecoders/ngx-deploy-npm/issues/235)) ([7106648](https://github.com/bikecoders/ngx-deploy-npm/commit/71066482ff4b1a1caa1c577a29ba2c452a4d3778))

## [3.1.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.1...v3.1.2) (2022-02-22)

## [3.1.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.1.0...v3.1.1) (2022-02-07)

# [3.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.12...v3.1.0) (2022-02-06)

### Features

- create --projects option on install ([#183](https://github.com/bikecoders/ngx-deploy-npm/issues/183)) ([85d6430](https://github.com/bikecoders/ngx-deploy-npm/commit/85d64307e200695aaaffc4aade0256e422956bbd))

## [3.0.12](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.11...v3.0.12) (2022-01-29)

## [3.0.11](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.10...v3.0.11) (2022-01-19)

## [3.0.10](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.9...v3.0.10) (2022-01-10)

## [3.0.9](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.8...v3.0.9) (2022-01-10)

## [3.0.8](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.7...v3.0.8) (2022-01-10)

## [3.0.7](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.6...v3.0.7) (2021-12-15)

## [3.0.6](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.5...v3.0.6) (2021-12-01)

## [3.0.5](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.4...v3.0.5) (2021-11-05)

### Bug Fixes

- 📦 update dependency @nrwl/devkit to v13.1.3 ([#117](https://github.com/bikecoders/ngx-deploy-npm/issues/117)) ([bb5fd72](https://github.com/bikecoders/ngx-deploy-npm/commit/bb5fd729650849df9d7487b4396e0b34525d5e2e))

## [3.0.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.3...v3.0.4) (2021-11-03)

## [3.0.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.2...v3.0.3) (2021-10-30)

### Bug Fixes

- allow paths with spaces ([#92](https://github.com/bikecoders/ngx-deploy-npm/issues/92)) ([ccc0027](https://github.com/bikecoders/ngx-deploy-npm/commit/ccc0027e99fe3ad924fb4a1f20fe59a030d8ca98))

### [3.0.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.1...v3.0.2) (2021-10-23)

### Bug Fixes

- update nxDevkit to work on Angular Workspaces ([341ced2](https://github.com/bikecoders/ngx-deploy-npm/commit/341ced22c1e55095b40d5b97e4e7d4b34f0d00a3))

### [3.0.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v3.0.0...v3.0.1) (2021-10-21)

### Bug Fixes

- set the right executor name ([cbd2f8b](https://github.com/bikecoders/ngx-deploy-npm/commit/cbd2f8bfc03a231c05f43ec4eebf55ea267f698b))

## [3.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v2.1.0...v3.0.0) (2021-10-21)

### ⚠ BREAKING CHANGES

- For Nx workspaces, the way to install the tool on Nx Workspaces is `nx generate ngx-deploy-npm:install`. The generator `init` was migrated to `install`

- migrate to use Nx Devkit ([f0f09e3](https://github.com/bikecoders/ngx-deploy-npm/commit/f0f09e3ea8680c26e8ed6f80d02b7790985995ba))

## [2.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v2.0.0...v2.1.0) (2021-05-22)

### Features

- support Angular v12 ([9db179b](https://github.com/bikecoders/ngx-deploy-npm/commit/9db179b136d9a34c09d22a8793cf71409689dee7))

## [2.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.5.1...v2.0.0) (2021-03-04)

### ⚠ BREAKING CHANGES

- change configuration parameter for buildTarget
  - For migration just change `--configuration` for `--build-target` on the command line and on the configuration file (`angular.json` or `workspace.json`)`configuration` for `buildTarget`.
  - The easiest way to migrate is to install again the builder through `ng-add`. Be sure to put back again the rest of your configuration because it's going to be overwritten.
- drop version 8 of @angular-devkit
  - To migrate should update at least to @angular-devkit v9

### Bug Fixes

- change configuration parameter for buildTarget ([f13bb6b](https://github.com/bikecoders/ngx-deploy-npm/commit/f13bb6b9f7d090fc09519afefa52c7a26e41f154))

### chore

- update peer dependencies for more accurate ones ([9f68296](https://github.com/bikecoders/ngx-deploy-npm/commit/9f68296affc3fd43038483be8239ba6a697a9e62))

### [1.5.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.5.0...v1.5.1) (2021-03-03)

### Documentation

- update the description of the project ([215ff45](https://github.com/bikecoders/ngx-deploy-npm/commit/215ff45ddb1a55f9afd039992a7b840759db8c9c))

## [1.5.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.4.3...v1.5.0) (2021-02-28)

### Features

- add production build target on ng-add if exists ([3959732](https://github.com/bikecoders/ngx-deploy-npm/commit/39597328f4768692bf76cd1561ecea7af58e0a22))

### Documentation

- add debugging instructions ([311d730](https://github.com/bikecoders/ngx-deploy-npm/commit/311d7308c301ff3d57fa8a6c90185633b91e4892))

### [1.4.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.4.2...v1.4.3) (2021-02-27)

### Bug Fixes

- throws an error if app building fails ([072290a](https://github.com/bikecoders/ngx-deploy-npm/commit/072290a130e4b1dff5637515c8d2e29e38e4307a))

### [1.4.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.4.1...v1.4.2) (2021-02-24)

### Documentation

- reduce cover image size on disk ([b44737f](https://github.com/bikecoders/ngx-deploy-npm/commit/b44737fbfed8a0200bff70b0fec090f9a80471ea))

## [1.4.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.3.3...v1.4.1) (2021-02-18)

### Features

- support Nx workspace ([15fc88a](https://github.com/bikecoders/ngx-deploy-npm/commit/15fc88a48cb6214960223157ab672bdb1c638701))

### [1.3.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.3.2...v1.3.3) (2021-02-09)

### Bug Fixes

- add options to ngAdd schematic ([3570ac3](https://github.com/bikecoders/ngx-deploy-npm/commit/3570ac333d82473b3b7b55ebaf133f108dbc0ed7))

### Documentation

- improve documentation for contributors ([70dce30](https://github.com/bikecoders/ngx-deploy-npm/commit/70dce30a287f7f665897a4c71afc51c04ad95450))

### [1.3.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.3.1...v1.3.2) (2020-12-09)

### Documentation

- improve builder description ([d0515d1](https://github.com/bikecoders/ngx-deploy-npm/commit/d0515d1))

### [1.3.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.3.0...v1.3.1) (2020-12-08)

### Bug Fixes

- add support for AngularV11 ([a188ae2](https://github.com/bikecoders/ngx-deploy-npm/commit/a188ae2))

## [1.3.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.2.4...v1.3.0) (2020-11-29)

### Features

- adds --no-build option to skip build ([743e4d4](https://github.com/bikecoders/ngx-deploy-npm/commit/743e4d4)), closes [angular-schule/ngx-deploy-starter#1](https://github.com/angular-schule/ngx-deploy-starter/issues/1)

### [1.2.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.2.3...v1.2.4) (2020-11-14)

### Documentation

- fix discord URL ([2b75305](https://github.com/bikecoders/ngx-deploy-npm/commit/2b75305))

### [1.2.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.2.2...v1.2.3) (2020-11-14)

### Documentation

- add discord server ([6f3b57c](https://github.com/bikecoders/ngx-deploy-npm/commit/6f3b57c))

### [1.2.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.2.1...v1.2.2) (2020-04-29)

### Documentation

- fix a typo on the documention ([845daea](https://github.com/bikecoders/ngx-deploy-npm/commit/845daea))

### [1.2.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.2.0...v1.2.1) (2020-04-28)

### Bug Fixes

- improve library checking ([aec3d05](https://github.com/bikecoders/ngx-deploy-npm/commit/aec3d05))

### Documentation

- fix the content table ([d3e33b1](https://github.com/bikecoders/ngx-deploy-npm/commit/d3e33b1))

## [1.2.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.1.1...v1.2.0) (2020-01-25)

### Documentation

- create ngx-deploy-npm logo ([3e48d36](https://github.com/bikecoders/ngx-deploy-npm/commit/3e48d36))

### Features

- create `package-version` option to be able to set the package version of your library ([eb23865](https://github.com/bikecoders/ngx-deploy-npm/commit/eb23865))

### [1.1.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.1.0...v1.1.1) (2019-11-07)

### Bug Fixes

- save package in devDependencies ([97d1ee1](https://github.com/bikecoders/ngx-deploy-npm/commit/97d1ee1))

## [1.1.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.0.5...v1.1.0) (2019-10-21)

### Documentation

- set changelog on project root ([58dcbc9](https://github.com/bikecoders/ngx-deploy-npm/commit/58dcbc9))
- update readme ([414ae4a](https://github.com/bikecoders/ngx-deploy-npm/commit/414ae4a))

### Features

- add nx compatibility ([9618c3b](https://github.com/bikecoders/ngx-deploy-npm/commit/9618c3b))

### [1.0.5](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.0.4...v1.0.5) (2019-09-18)

### Documentation

- fix cover typo ([3eecf47](https://github.com/bikecoders/ngx-deploy-npm/commit/3eecf47))

### [1.0.4](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.0.3...v1.0.4) (2019-09-18)

### Documentation

- tweak change log generation ([ced3480](https://github.com/bikecoders/ngx-deploy-npm/commit/ced3480))

### Features

- add standard-version ([bc76130](https://github.com/bikecoders/ngx-deploy-npm/commit/bc76130))

### [1.0.3](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.0.2...v1.0.3) (2019-09-12)

### Documentation

- create ci instructions ([0b1f5f5](https://github.com/bikecoders/ngx-deploy-npm/commit/0b1f5f5))

### [1.0.2](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.0.1...v1.0.2) (2019-09-12)

### Code Refactoring

- remove complex logic ([31f9003](https://github.com/bikecoders/ngx-deploy-npm/commit/31f9003))

### [1.0.1](https://github.com/bikecoders/ngx-deploy-npm/compare/v1.0.0...v1.0.1) (2019-09-12)

### Bug Fixes

- do not force to build on production ([95471f2](https://github.com/bikecoders/ngx-deploy-npm/commit/95471f2))

### [1.0.0](https://github.com/bikecoders/ngx-deploy-npm/compare/v0.0.1...v1.0.0) (2019-09-12)

First version of `ngx-deploy-npm` 🥳

### Features

- add logic to publish to npm ([66adc24](https://github.com/bikecoders/ngx-deploy-npm/commit/66adc24))

### Code Refactoring

- get the variables needed for the builder ([6283731](https://github.com/bikecoders/ngx-deploy-npm/commit/6283731))
- `ng add` modify only the libraries ([da28b27](https://github.com/bikecoders/ngx-deploy-npm/commit/da28b27))

### Documentation

- update readme and license ([97344c4](https://github.com/bikecoders/ngx-deploy-npm/commit/97344c4))
- write the documentation's deployer ([fb2a9e3](https://github.com/bikecoders/ngx-deploy-npm/commit/fb2a9e3))
