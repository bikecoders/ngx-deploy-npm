/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 Remove the old `configuration` option and:
  - create a new target to build the library with the right configuration
  - create the `dependsOn` option on the deploy target
  - Remove deprecated options `buildTarget` and `noBuild`
*/
import {
  ProjectConfiguration,
  TargetConfiguration,
  Tree,
  formatFiles,
  getProjects,
  updateProjectConfiguration,
} from '@nx/devkit';
import { DeployExecutorOptions } from '../../executors/deploy/schema';

export type RemovedDeployExecutorOptions = {
  /**
   * A named build target, as specified in the `configurations`. Each named target is accompanied by a configuration of option defaults for that target. This is equivalent to calling the command `nx build --configuration=XXX`.
   */
  buildTarget?: string;
  /**
   * Skip build process during deployment.
   * Default: false
   */
  noBuild?: boolean;
};

export type DeprecatedDeployExecutorOptions = DeployExecutorOptions &
  RemovedDeployExecutorOptions;

function targetRequiresMigrationCreationDependsOn(
  target: TargetConfiguration<DeprecatedDeployExecutorOptions>
) {
  return (
    target.executor === 'ngx-deploy-npm:deploy' && // has the right executor
    target.options?.noBuild !== true // the target will build the library
  );
}

function targetRequiresMigration(
  target: TargetConfiguration<DeprecatedDeployExecutorOptions>
) {
  return (
    target.executor === 'ngx-deploy-npm:deploy' && // has the right executor
    (target.options?.noBuild !== undefined || // the target will build the library
      target?.options?.buildTarget !== undefined) // the target has the buildTarget option
  );
}

export default async function update(host: Tree) {
  dependsOnMigration(host);
  removeDeprecatedOptionsMigration(host);

  await formatFiles(host);
}

function dependsOnMigration(host: Tree) {
  // Get projects that require creating of dependsOn
  const projectToCreateDependsOn = Array.from(getProjects(host))
    // remove projects that doesn't have the our executor or already have the option distFolderPath
    .filter(([_, project]) => {
      const projectTargets: TargetConfiguration<DeprecatedDeployExecutorOptions>[] =
        Object.values(project.targets ?? {});

      return projectTargets.some(targetRequiresMigrationCreationDependsOn);
    });

  // Create the `dependencyOn` the deploy target
  projectToCreateDependsOn.forEach(([projectKey, project]) => {
    createDependsOn(projectKey, project);
    updateProjectConfiguration(host, projectKey, project);
  });

  function createDependsOn(projectKey: string, project: ProjectConfiguration) {
    const deployExecutors: [
      string,
      TargetConfiguration<DeprecatedDeployExecutorOptions>
    ][] = Object.entries(project.targets ?? {}).filter(
      ([targetName, targetConfig]) =>
        targetRequiresMigrationCreationDependsOn(targetConfig)
    );

    deployExecutors.forEach(([targetName, targetConfig]) => {
      // store the old buildTarget value
      const buildTarget = targetConfig.options?.buildTarget;

      // Create targets in case that they doesn't already exists
      if (!project.targets) {
        project.targets = {};
      }

      // If our executor was building the library, it needs to depend on the build target
      let newDependsOn = 'build';
      if (typeof buildTarget === 'string') {
        const newPreDeployTargetName = `pre-${targetName}-build-${buildTarget}`;
        newDependsOn = newPreDeployTargetName;

        project.targets[newPreDeployTargetName] = {
          executor: 'nx:run-commands',
          options: {
            command: `nx run ${projectKey}:build:${buildTarget}`,
          },
        };
      }

      const dependsOn = project.targets[targetName].dependsOn;
      if (dependsOn === undefined) {
        project.targets[targetName].dependsOn = [];
      }

      project.targets[targetName].dependsOn?.push(newDependsOn);
    });
  }
}

async function removeDeprecatedOptionsMigration(host: Tree) {
  // Get projects that require removing of buildTarget and noBuild
  const projectToMigrate = Array.from(getProjects(host))
    // remove projects that doesn't have the our executor or already have the option distFolderPath
    .filter(([_, project]) => {
      const projectTargets: TargetConfiguration<DeprecatedDeployExecutorOptions>[] =
        Object.values(project.targets ?? {});

      return projectTargets.some(targetRequiresMigration);
    });

  // Remove Deprecated options the `dependencyOn` the deploy target
  projectToMigrate.forEach(([projectKey, project]) => {
    removeBuildTargetAndNoBuildOptions(project);
    updateProjectConfiguration(host, projectKey, project);
  });

  function removeBuildTargetAndNoBuildOptions(project: ProjectConfiguration) {
    const deployExecutors: [
      string,
      TargetConfiguration<DeprecatedDeployExecutorOptions>
    ][] = Object.entries(project.targets ?? {}).filter(([_, targetConfig]) =>
      targetRequiresMigration(targetConfig)
    );

    deployExecutors.forEach(([_, targetConfig]) => {
      // Remove option build target
      delete targetConfig.options?.buildTarget;
      delete targetConfig.options?.noBuild;
    });
  }
}
