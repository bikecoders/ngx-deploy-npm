import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
  addProjectConfiguration,
  getProjects,
  logger,
} from '@nx/devkit';
import * as devkit from '@nx/devkit';
import * as mocks from '../../__mocks__/mocks';

import update, {
  DeprecatedDeployExecutorOptions,
} from './write-dist-folder-path-on-deploy-target-options';

describe('write-dist-folder-path-on-deploy-target-options migration', () => {
  function addTargets(
    project: ProjectConfiguration,
    addDistFolderPathOption = true
  ): ProjectConfiguration {
    if (!project.targets) {
      project.targets = {};
    }

    const deployTarget: TargetConfiguration<DeprecatedDeployExecutorOptions> = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        distFolderPath: addDistFolderPathOption
          ? `dist/libs/${project.name}`
          : undefined,
        access: 'public',
      },
    };

    project.targets.deploy = deployTarget;
    project.targets.publish = deployTarget;

    return project;
  }

  function setup() {
    const nonMigratedProjects: Record<string, ProjectConfiguration> = {
      WITH_distFolderPathOption: addTargets(
        mocks.getLib('WITH_distFolderPathOption')
      ),
      WITHOUT_distFolderPathOption1: addTargets(
        mocks.getLib('WITHOUT_distFolderPathOption1'),
        false
      ),
      WITHOUT_distFolderPathOption2: addTargets(
        mocks.getLib('WITHOUT_distFolderPathOption2'),
        false
      ),

      app: mocks.getApplication('app'),
      nonPublishable: mocks.getLibWithoutBuildTarget('nonPublishable'),
    };

    const tree: Tree = createTreeWithEmptyWorkspace();

    Object.entries(nonMigratedProjects).forEach(([key, projectConfig]) =>
      addProjectConfiguration(tree, key, projectConfig)
    );

    return { tree, nonMigratedProjects };
  }

  function setupUntouchedProjectsCheck() {
    const { tree } = setup();

    const getNonMigratedProjects = (host: Tree) => {
      const allProjects = getProjects(host);
      return {
        projectBefore: allProjects.get('projectBefore'),
        WITH_distFolderPathOption: allProjects.get('WITH_distFolderPathOption'),
        app: allProjects.get('app'),
        nonPublishable: allProjects.get('nonPublishable'),
      };
    };

    return {
      tree,
      nonMigratedProjectsBefore: getNonMigratedProjects(tree),
      getNonMigratedProjects,
    };
  }

  function setupUnnamedProjectWarning(opts: { projectKey?: string } = {}) {
    const { projectKey = 'UNNAMED_PROJECT' } = opts;
    const { tree } = setup();

    const unnamedProject = addTargets(mocks.getLib(projectKey), false);
    addProjectConfiguration(tree, projectKey, unnamedProject);

    const projects = getProjects(tree);
    const projectWithoutName = {
      ...projects.get(projectKey)!,
      name: undefined,
    };
    projects.set(projectKey, projectWithoutName);

    const getProjectsSpy = jest
      .spyOn(devkit, 'getProjects')
      .mockReturnValue(projects);

    const loggerWarnSpy = jest
      .spyOn(logger, 'warn')
      .mockImplementation(() => undefined);

    return { tree, projectKey, getProjectsSpy, loggerWarnSpy };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should set up the distFolderPath option on the right projects', async () => {
    const { tree } = setup();

    await update(tree);

    const allProjects = getProjects(tree);
    const WITHOUT_distFolderPathOption1 = allProjects.get(
      'WITHOUT_distFolderPathOption1'
    );
    const WITHOUT_distFolderPathOption2 = allProjects.get(
      'WITHOUT_distFolderPathOption2'
    );

    expect(
      WITHOUT_distFolderPathOption1?.targets?.deploy.options.distFolderPath
    ).toBeTruthy();
    expect(
      WITHOUT_distFolderPathOption1?.targets?.publish.options.distFolderPath
    ).toBeTruthy();
    expect(
      WITHOUT_distFolderPathOption2?.targets?.deploy.options.distFolderPath
    ).toBeTruthy();
    expect(
      WITHOUT_distFolderPathOption2?.targets?.publish.options.distFolderPath
    ).toBeTruthy();
  });

  it('should set up the distFolderPath option with the right value', async () => {
    const { tree } = setup();

    await update(tree);

    const allProjects = getProjects(tree);
    const WITHOUT_distFolderPathOption1 = allProjects.get(
      'WITHOUT_distFolderPathOption1'
    );

    expect(
      WITHOUT_distFolderPathOption1?.targets?.deploy.options.distFolderPath
    ).toStrictEqual(`dist/libs/${WITHOUT_distFolderPathOption1?.name ?? ''}`);
    expect(
      WITHOUT_distFolderPathOption1?.targets?.publish.options.distFolderPath
    ).toStrictEqual(`dist/libs/${WITHOUT_distFolderPathOption1?.name ?? ''}`);
  });

  it('should not touch other projects', async () => {
    const { tree, nonMigratedProjectsBefore, getNonMigratedProjects } =
      setupUntouchedProjectsCheck();

    await update(tree);

    expect(nonMigratedProjectsBefore).toStrictEqual(
      getNonMigratedProjects(tree)
    );
  });

  it('should warn and skip projects without a name', async () => {
    const { tree, loggerWarnSpy } = setupUnnamedProjectWarning();

    await update(tree);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("doesn't have a name")
    );
  });
});
