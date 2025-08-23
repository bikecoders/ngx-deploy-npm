import * as fs from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

import { ProjectConfiguration } from '@nx/devkit';
import { readJson } from '@nx/plugin/testing';
import { logger } from '@nx/devkit';

import { InstallGeneratorOptions } from 'bikecoders/ngx-deploy-npm';
import { getNxWorkspaceVersion } from './get-nx-workspace-version';
import {
  generateLib,
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from '.';

export const buildPackageProjectRoot = (libName: string) =>
  `packages/${libName}`;

const executeCommandFactory =
  (projectDirectory: string) => (command: string) => {
    let output: string;

    logger.verbose(`Executing command: ${command}`);

    try {
      output = execSync(command, {
        stdio: ['ignore', 'pipe', 'pipe'], // capture stdout and stderr
        cwd: projectDirectory,
        encoding: 'utf-8',
        env: process.env,
      });
    } catch (error: any) {
      logger.error(`Error executing command: ${command}`);
      if (error.stdout) {
        logger.error(`stdout: ${error.stdout}`);
        process.stdout.write(error.stdout);
      }
      if (error.stderr) {
        logger.error(`stderr: ${error.stderr}`);
        process.stderr.write(error.stderr);
      }
      if (error.message) {
        logger.error(`message: ${error.message}`);
      }
      throw error;
    }

    return output;
  };

export const setup = async (
  libs: {
    name: string;
    generator: 'minimal' | string;
    installOptions?: Omit<
      Partial<InstallGeneratorOptions>,
      'distFolderPath' | 'project'
    >;
    skipInstall?: boolean;
    extraOptions?: string;
    distFolderPath?: string;
    noInteractive?: boolean;
    useProjectJson?: boolean;
  }[]
) => {
  const projectDirectory = await createTestProject();
  const executeCommand = executeCommandFactory(projectDirectory);

  initNgxDeployNPMProject(executeCommand);

  // Install dependencies only once
  const generators = new Set(
    libs
      .map(({ generator }) => generator)
      .filter(generator => generator !== 'minimal')
  );
  generators.forEach(dependency => {
    installDependencies(executeCommand, dependency);
  });

  // Init libs
  await Promise.all(
    libs.map(
      async ({
        name,
        generator,
        extraOptions = '',
        noInteractive = true,
        useProjectJson = false,
      }) => {
        if (generator === 'minimal') {
          await createMinimalLib(projectDirectory, name, useProjectJson);
        } else {
          const extraOptionsNormalized = [
            `--directory="${buildPackageProjectRoot(name)}"`,
            noInteractive ? '--no-interactive' : '',
            useProjectJson ? '--use-project-json' : '',
            extraOptions,
          ]
            .filter(Boolean)
            .join(' ');

          generateLib({
            nxPlugin: generator,
            executeCommand,
            libName: name,
            extraOptions: extraOptionsNormalized,
          });
        }
      }
    )
  );

  // Install ngx-deploy-npm
  libs
    .filter(({ skipInstall }) => !!skipInstall === false)
    .forEach(({ name, installOptions }) => {
      installNgxDeployNPMProject(executeCommand, {
        project: name,
        distFolderPath: buildPackageProjectRoot(name),
        access: installOptions?.access || 'public',
        ...installOptions,
      });
    });

  const processedLibs: {
    name: string;
    workspace: ProjectConfiguration;
    npmPackageName: string;
  }[] = libs.map(({ name, useProjectJson = false }) => {
    const projectPath = `${projectDirectory}/${buildPackageProjectRoot(name)}`;
    const packageJson = readJson(`${projectPath}/package.json`);

    // Use useProjectJson parameter to determine where to read configuration from
    let workspace: ProjectConfiguration | null = null;
    if (useProjectJson) {
      // Read from project.json file
      workspace = readJson(
        `${projectPath}/project.json`
      ) as ProjectConfiguration;
    } else {
      // Read project configuration from package.json (nx field or infer from structure)
      const packageJson = readJson(`${projectPath}/package.json`);

      workspace = {
        name: name,
        root: buildPackageProjectRoot(name),
      };

      // Check if package.json has nx field with project configuration
      if (packageJson.nx) {
        workspace = {
          ...workspace,
          ...packageJson.nx,
          tags: packageJson.nx.tags || [],
          targets: packageJson.nx.targets || {},
        };
      }
    }

    if (!workspace || Object.keys(workspace).length === 0) {
      throw new Error(
        `Workspace configuration for project "${name}" is empty or undefined.`
      );
    }

    return {
      name: name,
      workspace,
      npmPackageName: packageJson.name,
    };
  });

  return {
    processedLibs,
    projectDirectory,
    tearDown: async () => {
      if (process.env.NGX_DEPLOY_NPM_E2E__NO_TEAR_DOWN !== 'true') {
        logger.verbose('Tearing down');

        await fs.promises.rm(projectDirectory, {
          recursive: true,
          force: true,
        });
      } else {
        logger.verbose('Skipping teardown');
      }

      return Promise.resolve();
    },
    executeCommand,
  };
};

async function createMinimalLib(
  projectDirectory: string,
  libName: string,
  useProjectJson: boolean
) {
  // Create Lib
  const libRootAbsolutePath = join(
    projectDirectory,
    buildPackageProjectRoot(libName)
  );
  const libRoot = buildPackageProjectRoot(libName);

  // Create the lib folder
  await fs.promises.mkdir(libRootAbsolutePath, {
    recursive: true,
  });

  const createPackageJsonPromise = fs.promises.writeFile(
    join(libRootAbsolutePath, 'package.json'),
    generatePackageJSON(libName, useProjectJson),
    'utf8'
  );
  const createUniqueFilePromise = fs.promises.writeFile(
    join(libRootAbsolutePath, 'hello-world.js'),
    "console.log('Hello World!');",
    'utf8'
  );

  const promises = [createPackageJsonPromise, createUniqueFilePromise];

  // Only create project.json if useProjectJson is true
  if (useProjectJson) {
    const createProjectJsonPromise = fs.promises.writeFile(
      join(libRootAbsolutePath, 'project.json'),
      generateProjectJSON(libName, libRoot),
      'utf8'
    );
    promises.push(createProjectJsonPromise);
  }

  await Promise.all(promises);

  return { libRoot };

  function generateProjectJSON(projectName: string, libRoot: string): string {
    const content = {
      name: projectName,
      $schema: '../../node_modules/nx/schemas/project-schema.json',
      projectType: 'library',
      sourceRoot: libRoot,
    };

    return JSON.stringify(content, null, 2);
  }

  function generatePackageJSON(
    projectName: string,
    useProjectJson: boolean
  ): string {
    const content: any = {
      name: `@mock-domain/${projectName}`,
      description: 'Minimal LIb',
      version: '1.0.0',
    };

    // Add nx configuration with targets when not using project.json
    if (!useProjectJson) {
      content.nx = {
        name: projectName,
      };
    }

    return JSON.stringify(content, null, 2);
  }
}

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
async function createTestProject() {
  const projectName =
    process.env.NGX_DEPLOY_NPM_E2E__PROJECT_NAME || 'test-project';
  const projectDirectory = join(process.cwd(), 'tmp', projectName);

  // Ensure projectDirectory is empty
  await fs.promises.rm(projectDirectory, {
    recursive: true,
    force: true,
  });
  await fs.promises.mkdir(dirname(projectDirectory), {
    recursive: true,
  });

  const command = `npx --yes create-nx-workspace@${getNxWorkspaceVersion()} ${projectName} --preset npm --nxCloud=skip --no-interactive`;
  executeCommandFactory(dirname(projectDirectory))(command);

  return projectDirectory;
}
