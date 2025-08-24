import {
  getProjects,
  formatFiles,
  updateProjectConfiguration,
  logger,
  createProjectGraphAsync,
} from '@nx/devkit';
import type { Tree } from '@nx/devkit';

import type { InstallGeneratorOptions } from './schema';
import { DeployExecutorOptions } from '../../executors/deploy/schema';
import { isProjectAPublishableLib } from '../../utils';

/**
 * Checks if a project has a build target by checking its configuration
 * @param projectName The name of the project to check
 * @returns true if the project has a build target, false otherwise
 */
async function hasBuildTarget(projectName: string): Promise<boolean> {
  try {
    // Use project graph to get all targets (including implicit ones from plugins)
    const projectGraph = await createProjectGraphAsync({ exitOnError: true });
    const project = projectGraph.nodes[projectName];

    if (!project) {
      logger.verbose(`Project '${projectName}' not found in project graph`);
      return false;
    }

    const hasBuild = !!(
      project.data.targets && 'build' in project.data.targets
    );

    logger.verbose(`Project '${projectName}' has build target: ${hasBuild}`);
    if (project.data.targets) {
      logger.verbose(
        `Available targets: ${Object.keys(project.data.targets).join(', ')}`
      );
    }

    return hasBuild;
  } catch (error) {
    logger.error(`Error detecting build target for '${projectName}': ${error}`);
    return false;
  }
}

export default async function install(
  tree: Tree,
  rawOptions: InstallGeneratorOptions
) {
  const options = rawOptions;

  const allProjects = getProjects(tree);
  const selectedLib = allProjects.get(options.project);

  if (selectedLib === undefined) {
    logger.verbose(
      `Available projects: ${Array.from(allProjects.keys()).join(', ')}`
    );
    throw new Error(
      `The project ${options.project} doesn't exist on your workspace`
    );
  }

  if ((await isProjectAPublishableLib(tree, selectedLib)) === false) {
    throw new Error(
      `The project ${options.project} is not a publishable library`
    );
  }

  const executorOptions: DeployExecutorOptions = {
    distFolderPath: options.distFolderPath,
    access: options.access,
  };

  // Create targets in case that they doesn't already exists
  if (!selectedLib.targets) {
    selectedLib.targets = {};
  }

  selectedLib.targets.deploy = {
    executor: 'ngx-deploy-npm:deploy',
    options: executorOptions,
    ...((await hasBuildTarget(options.project))
      ? { dependsOn: ['build'] }
      : {}),
  };

  updateProjectConfiguration(tree, options.project, selectedLib);

  await formatFiles(tree);
}
