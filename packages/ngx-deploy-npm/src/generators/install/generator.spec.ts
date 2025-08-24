import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  addProjectConfiguration,
  ProjectConfiguration,
  getProjects,
  TargetConfiguration,
  createProjectGraphAsync,
  ProjectGraph,
} from '@nx/devkit';

import generator from './generator';
import { InstallGeneratorOptions } from './schema';
import { DeployExecutorOptions } from '../../executors/deploy/schema';
import { npmAccess } from '../../core';
import * as mocks from '../../__mocks__/mocks';
import * as utils from '../../utils';

jest.mock('../../utils', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual('../../utils'),
  };
});

describe('install generator', () => {
  enum PUBLISHABLE_LIBS {
    lib1 = 'lib1',
    lib2 = 'lib2',
    withoutBuildLib = 'withoutBuildLib',
  }
  enum NON_PUBLISHABLE_LIBS {
    app = 'app',
    nonPublishable = 'nonPublishable',
    nonPublishable2 = 'nonPublishable2',
  }

  const allKindsOfProjects: Record<
    PUBLISHABLE_LIBS | NON_PUBLISHABLE_LIBS,
    ProjectConfiguration
  > = {
    lib1: mocks.getLib('lib1'),
    lib2: mocks.getLib('lib2'),
    withoutBuildLib: mocks.getLibWithoutBuildTarget('withoutBuildLib'),
    app: mocks.getApplication('app'),
    nonPublishable: mocks.getLibWithoutBuildTarget('nonPublishable'),
    nonPublishable2: mocks.getLibWithoutBuildTarget('nonPublishable2'),
  };

  const setup = ({
    workspaceProjects = allKindsOfProjects,
    workspacePublishableLibs = Object.keys(PUBLISHABLE_LIBS)
      .filter(v => isNaN(Number(v)))
      .reduce((acc, key) => {
        acc[key] = true;

        return acc;
      }, {} as Record<string, true>),
  }: {
    workspaceProjects?: Record<string, ProjectConfiguration>;
    workspacePublishableLibs?: Record<string, true>;
  }) => {
    const workspaceConfig = new Map();
    const appTree = createTreeWithEmptyWorkspace();

    Object.entries(workspaceProjects).forEach(([key, project]) => {
      workspaceConfig.set(key, project);
    });

    jest
      .spyOn(utils, 'isProjectAPublishableLib')
      .mockImplementation((_, project) => {
        const isAPublishableLib = project.name
          ? !!workspacePublishableLibs[project.name]
          : false;

        return Promise.resolve(isAPublishableLib);
      });

    // Configure createProjectGraphAsync mock to return project graph with targets
    (
      createProjectGraphAsync as jest.MockedFunction<
        typeof createProjectGraphAsync
      >
    ).mockImplementation(async () => {
      const nodes = Object.entries(workspaceProjects).reduce(
        (acc, [projectName, projectConfig]) => {
          acc[projectName] = {
            name: projectName,
            type: 'lib',
            data: {
              root: projectConfig.root,
              sourceRoot: projectConfig.sourceRoot,
              targets: projectConfig.targets || {},
            },
          };
          return acc;
        },
        {} as ProjectGraph['nodes']
      );

      return {
        nodes,
        dependencies: {},
      };
    });

    // Create workspace
    Array.from(workspaceConfig.entries()).forEach(([key, projectConfig]) =>
      addProjectConfiguration(appTree, key, projectConfig)
    );

    return { appTree };
  };

  const buildMockDistPath = (projectName: string) => {
    return `dist/libs/${projectName}`;
  };

  const buildExpectedDeployTarget = (
    projectName: string,
    isBuildable = true
  ): TargetConfiguration<DeployExecutorOptions> => {
    const options: TargetConfiguration<DeployExecutorOptions> = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        access: npmAccess.public,
        distFolderPath: buildMockDistPath(projectName),
      },
    };

    if (isBuildable) {
      options.dependsOn = ['build'];
    }

    return options;
  };

  afterEach(jest.restoreAllMocks);

  it('should create the target with the right structure for a buildable lib', async () => {
    const projectName = 'buildableLib';
    const { appTree } = setup({
      workspaceProjects: {
        [projectName]: mocks.getLib(projectName),
      },
      workspacePublishableLibs: {
        [projectName]: true,
      },
    });

    await generator(appTree, {
      project: projectName,
      distFolderPath: buildMockDistPath(projectName),
      access: npmAccess.public,
    });

    const allProjects = getProjects(appTree);
    const config = allProjects.get(projectName);
    const targetDeploy = config?.targets?.deploy;

    expect(targetDeploy).toStrictEqual(
      buildExpectedDeployTarget(projectName, true)
    );
  });

  it('should create the target with the right structure for a non-buildable lib', async () => {
    const projectName = 'nonBuildableLib';
    const { appTree } = setup({
      workspaceProjects: {
        [projectName]: mocks.getLibWithoutBuildTarget(projectName),
      },
      workspacePublishableLibs: {
        [projectName]: true,
      },
    });

    await generator(appTree, {
      project: projectName,
      distFolderPath: buildMockDistPath(projectName),
      access: npmAccess.public,
    });

    const allProjects = getProjects(appTree);
    const config = allProjects.get(projectName);
    const targetDeploy = config?.targets?.deploy;

    expect(targetDeploy).toStrictEqual(
      buildExpectedDeployTarget(projectName, false)
    );
  });

  it('should add the target only to the specified project', async () => {
    const { appTree } = setup({});

    await generator(appTree, {
      project: PUBLISHABLE_LIBS.lib1,
      distFolderPath: buildMockDistPath(PUBLISHABLE_LIBS.lib1),
      access: npmAccess.public,
    });

    const allProjects = getProjects(appTree);
    const config = allProjects.get(PUBLISHABLE_LIBS.lib2);
    const targetDeploy = config?.targets?.deploy;

    expect(targetDeploy).toStrictEqual(undefined);
  });

  test.each([
    ['target less lib', (name: string) => mocks.getTargetlessLib(name)],
    ['emtpy target lib', (name: string) => mocks.getEmptyTargetLib(name)],
  ])(
    'should create the target with the right structure for a lib without targets: %s',
    async (_desc, getLibFn) => {
      const projectName = 'targetLess';
      const { appTree } = setup({
        workspaceProjects: {
          [projectName]: getLibFn(projectName),
        },
        workspacePublishableLibs: { [projectName]: true },
      });

      await generator(appTree, {
        project: projectName,
        distFolderPath: buildMockDistPath(projectName),
        access: npmAccess.public,
      });

      const allProjects = getProjects(appTree);
      const project = allProjects.get(projectName);
      const setOptions: InstallGeneratorOptions =
        project?.targets?.deploy.options;

      expect(setOptions.access).toEqual(npmAccess.public);
    }
  );

  describe('--access', () => {
    const setupAccess = (access: npmAccess) => {
      const projectName = 'lib1';
      const rawOptions: InstallGeneratorOptions = {
        project: projectName,
        distFolderPath: buildMockDistPath(projectName),
        access,
      };

      const { appTree } = setup({
        workspaceProjects: {
          [projectName]: mocks.getLib(projectName),
        },
        workspacePublishableLibs: { [projectName]: true },
      });

      return { appTree, rawOptions, projectName };
    };

    it('should set the `access` option as `public` when is set to `public` on rawoption', async () => {
      const { appTree, rawOptions, projectName } = setupAccess(
        npmAccess.public
      );

      // install
      await generator(appTree, rawOptions);

      const allProjects = getProjects(appTree);
      const project = allProjects.get(projectName);
      const targetOptions: InstallGeneratorOptions =
        project?.targets?.deploy.options;

      expect(targetOptions.access).toEqual(npmAccess.public);
    });

    it('should set the `access` option as `restricted` when is set to `restricted` on rawoption', async () => {
      const { appTree, rawOptions, projectName } = setupAccess(
        npmAccess.restricted
      );

      // install
      await generator(appTree, rawOptions);

      const allProjects = getProjects(appTree);
      const project = allProjects.get(projectName);
      const targetOptions: InstallGeneratorOptions =
        project?.targets?.deploy.options;

      expect(targetOptions.access).toEqual(npmAccess.restricted);
    });
  });

  describe('error handling', () => {
    it('should throw an error if the project is not a publishable library', async () => {
      const project = NON_PUBLISHABLE_LIBS.app;
      const rawOptions: InstallGeneratorOptions = {
        project,
        distFolderPath: buildMockDistPath(project),
        access: npmAccess.public,
      };
      const { appTree } = setup({});

      await expect(generator(appTree, rawOptions)).rejects.toThrow(
        new Error(`The project ${project} is not a publishable library`)
      );
    });

    it('should throw an error if invalid project is pass on --project', async () => {
      const invalidProjects = 'i-dont-exists';
      const rawOptions: InstallGeneratorOptions = {
        project: invalidProjects,
        distFolderPath: buildMockDistPath(invalidProjects),
        access: npmAccess.public,
      };
      const { appTree } = setup({});

      await expect(generator(appTree, rawOptions)).rejects.toThrow(
        new Error(
          `The project ${invalidProjects} doesn't exist on your workspace`
        )
      );
    });

    it('should handle project not found in project graph', async () => {
      const projectName = 'nonExistentProject';
      const { appTree } = setup({
        workspaceProjects: {
          // Only include other projects, not the one we're testing
          lib1: mocks.getLib('lib1'),
        },
      });

      await expect(
        generator(appTree, {
          project: projectName,
          distFolderPath: buildMockDistPath(projectName),
          access: npmAccess.public,
        })
      ).rejects.toThrow(
        new Error(`The project ${projectName} doesn't exist on your workspace`)
      );
    });
  });
});
