import { ProjectConfiguration } from '@nx/devkit';

export const getLib = (libName: string): ProjectConfiguration => {
  return {
    root: `libs/${libName}`,
    name: libName,
    sourceRoot: `libs/${libName}/src`,
    projectType: 'library',
    tags: [],
    targets: {
      build: {
        executor: '@mocks/compiler:rollup',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/libs/${libName}`,
        },
      },
      ...mockLintTarget,
      ...mockTestTarget,
    },
  };
};

export const getTargetlessLib = (libName: string): ProjectConfiguration => {
  return {
    root: `libs/${libName}`,
    name: libName,
    sourceRoot: `libs/${libName}/src`,
    projectType: 'library',
    tags: [],
  };
};

export const getEmptyTargetLib = (libName: string): ProjectConfiguration => {
  return {
    root: `libs/${libName}`,
    name: libName,
    sourceRoot: `libs/${libName}/src`,
    projectType: 'library',
    tags: [],
    targets: {},
  };
};

// ? should we remove this since we are no longer building the library?
export const getLibWithoutBuildTarget = (
  libName: string
): ProjectConfiguration => {
  return {
    root: `libs/${libName}`,
    name: libName,
    sourceRoot: `libs/${libName}/src`,
    projectType: 'library',
    tags: [],
    targets: {
      ...mockLintTarget,
      ...mockTestTarget,
    },
  };
};

export const getApplication = (appName: string): ProjectConfiguration => {
  return {
    projectType: 'application',
    root: `apps/${appName}`,
    name: appName,
    sourceRoot: `apps/${appName}/src`,
    targets: {
      build: {
        executor: '@mocks/build:browser',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/apps/${appName}`,
          index: `apps/${appName}/src/index.html`,
          main: `apps/${appName}/src/main.ts`,
          tsConfig: `apps/${appName}/tsconfig.app.json`,
          scripts: [],
        },
        configurations: {
          production: {
            foo: 'bar',
            randomOptions: true,
            production: true,
          },
          development: {
            foo: 'bar',
            randomOptions: false,
            production: false,
            sourceMap: true,
          },
        },
        defaultConfiguration: 'production',
      },
      serve: {
        executor: '@mocks/build:dev-server',
        configurations: {
          production: {
            browserTarget: `${appName}:build:production`,
          },
          development: {
            browserTarget: `${appName}:build:development`,
          },
        },
        defaultConfiguration: 'development',
      },
      ...mockLintTarget,
      ...mockTestTarget,
    },
    tags: [],
  };
};

export const mockProjectRoot = 'some/fake/root/folder';
export const mockProjectDist = (projectName = 'project') =>
  `dist/lib/${projectName}`;

const mockLintTarget = {
  lint: {
    executor: '@mocks/linter:eslint',
  },
};

const mockTestTarget = {
  test: {
    executor: '@mocks/test:simple-test',
  },
};
