import { ProjectConfiguration, readJson, Tree } from '@nx/devkit';
import { fileExists } from './file-utils';
import * as path from 'path';

export const isProjectAPublishableLib = async (
  tree: Tree,
  projectConfig: ProjectConfiguration
): Promise<boolean> => {
  return (
    (await hasPackageJsonFile(projectConfig)) &&
    isPublicPackage(tree, projectConfig)
  );
};

function hasPackageJsonFile(project: ProjectConfiguration): Promise<boolean> {
  const packageJsonPath = path.join(project.root, 'package.json');

  return fileExists(packageJsonPath);
}

function isPublicPackage(tree: Tree, project: ProjectConfiguration) {
  const packageJsonPath = path.join(project.root, 'package.json');
  const packageJson = readJson<{ name: string; private?: boolean }>(
    tree,
    packageJsonPath
  );

  // A package is considered public/publishable if "private" is not true (i.e., missing or false)
  return !packageJson.private;
}
