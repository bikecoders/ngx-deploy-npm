import { logger } from '@nx/devkit';
import { stat } from 'node:fs/promises';
import * as path from 'node:path';

import * as fileUtils from '../../../utils';
import { DeployExecutorOptions } from '../schema';
import {
  NpmPublishOptions,
  spawnAsync,
  withTemporaryPackageVersion,
} from '../utils';
import { formatRegistryLabel, getPublishProbeOptions } from './npm-options';

const PUBLISH_ENTRY_PATH_PATTERN = /^\.\//;

type PackageJsonForReadyCheck = {
  name?: string;
  version?: string;
  description?: string;
  license?: string;
  repository?: string | { type?: string; url?: string };
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  exports?: string | Record<string, unknown>;
};

export function buildProbeVersion(version: string): string {
  return `${version}-verify.${Date.now()}`;
}

export function isCheckPublishReadyEnabled(
  mode: DeployExecutorOptions['checkPublishReady']
): mode is 'probe' | 'publish' {
  return mode === 'probe' || mode === 'publish';
}

export function logDualDryRunWarning(mode: 'probe' | 'publish'): void {
  logger.warn(
    `ngx-deploy-npm: checkPublishReady="${mode}" with deploy --dry-run will run two npm publish --dry-run calls.`
  );
  logger.warn(
    'First: registry probe with a disposable {version}-verify.{timestamp} (dist-tag verify).'
  );
  logger.warn(
    'Second: deploy dry-run using the version in dist package.json (may fail if that version already exists on the registry).'
  );
}

function collectExportEntryPaths(
  exportsValue: Record<string, unknown>,
  paths: Set<string>
): void {
  for (const value of Object.values(exportsValue)) {
    if (typeof value === 'string' && PUBLISH_ENTRY_PATH_PATTERN.test(value)) {
      paths.add(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      collectExportEntryPaths(value as Record<string, unknown>, paths);
    }
  }
}

export function collectPublishEntryPaths(
  packageJson: PackageJsonForReadyCheck
): { field: string; relativePath: string }[] {
  const paths = new Set<string>();
  const fieldByPath = new Map<string, string>();

  const addPath = (field: string, relativePath: string) => {
    if (!PUBLISH_ENTRY_PATH_PATTERN.test(relativePath)) {
      return;
    }

    paths.add(relativePath);
    if (!fieldByPath.has(relativePath)) {
      fieldByPath.set(relativePath, field);
    }
  };

  for (const field of ['main', 'module', 'types', 'typings'] as const) {
    const value = packageJson[field];
    if (typeof value === 'string') {
      addPath(field, value);
    }
  }

  if (typeof packageJson.exports === 'string') {
    addPath('exports', packageJson.exports);
  } else if (packageJson.exports && typeof packageJson.exports === 'object') {
    collectExportEntryPaths(packageJson.exports, paths);
    for (const relativePath of paths) {
      if (!fieldByPath.has(relativePath)) {
        fieldByPath.set(relativePath, 'exports');
      }
    }
  }

  return [...paths].map(relativePath => ({
    field: fieldByPath.get(relativePath) ?? 'exports',
    relativePath,
  }));
}

async function readDistPackageJson(
  distFolderPath: string
): Promise<PackageJsonForReadyCheck> {
  const packageJsonPath = path.join(distFolderPath, 'package.json');

  try {
    const packageContent = await fileUtils.readFileAsync(packageJsonPath, {
      encoding: 'utf8',
    });

    return JSON.parse(packageContent) as PackageJsonForReadyCheck;
  } catch {
    throw new Error(
      `Publish package.json not found or invalid at "${packageJsonPath}".`
    );
  }
}

async function runStaticPublishReadyChecks(
  distFolderPath: string
): Promise<PackageJsonForReadyCheck> {
  try {
    const distStat = await stat(distFolderPath);
    if (!distStat.isDirectory()) {
      throw new Error('not a directory');
    }
  } catch {
    throw new Error(
      `Publish dist folder not found at "${distFolderPath}". Build the library first (e.g. nx build <project>).`
    );
  }

  const packageJson = await readDistPackageJson(distFolderPath);

  if (!packageJson.name) {
    throw new Error('Publish package.json is missing required field "name".');
  }

  if (!packageJson.version) {
    throw new Error(
      'Publish package.json is missing required field "version".'
    );
  }

  if (!packageJson.description) {
    logger.warn(
      'Publish package.json is missing recommended field "description".'
    );
  }

  if (!packageJson.license) {
    logger.warn('Publish package.json is missing recommended field "license".');
  }

  if (!packageJson.repository) {
    logger.warn(
      'Publish package.json is missing recommended field "repository".'
    );
  }

  for (const { field, relativePath } of collectPublishEntryPaths(packageJson)) {
    const entryPath = path.join(distFolderPath, relativePath);
    if (!(await fileUtils.fileExists(entryPath))) {
      throw new Error(
        `Publish entry file missing: "${relativePath}" (from package.json "${field}").`
      );
    }
  }

  return packageJson;
}

export async function verifyRegistryAuth(registry?: string): Promise<void> {
  const args = ['whoami'];
  if (registry) {
    args.push('--registry', registry);
  }

  try {
    await spawnAsync('npm', args);
  } catch {
    throw new Error(
      `ngx-deploy-npm: Registry authentication failed for ${formatRegistryLabel(
        registry
      )}. Run npm whoami locally, set NODE_AUTH_TOKEN / .npmrc, or configure npm OIDC trusted publishing.`
    );
  }
}

async function runPublishProbe(
  distFolderPath: string,
  packageJson: PackageJsonForReadyCheck,
  npmOptions: NpmPublishOptions
): Promise<void> {
  const probeVersion = buildProbeVersion(packageJson.version as string);
  const registry = formatRegistryLabel(npmOptions.registry);

  try {
    await withTemporaryPackageVersion(distFolderPath, probeVersion, () =>
      spawnAsync('npm', [
        'publish',
        distFolderPath,
        ...getPublishProbeOptions(npmOptions),
      ])
    );
  } catch {
    throw new Error(
      `ngx-deploy-npm: npm publish --dry-run failed for ${registry}. Check package.json, dist contents, access/provenance options, and registry permissions.`
    );
  }
}

export async function runPublishReadyChecks(
  distFolderPath: string,
  options: DeployExecutorOptions,
  npmOptions: NpmPublishOptions
): Promise<void> {
  if (!isCheckPublishReadyEnabled(options.checkPublishReady)) {
    return;
  }

  const packageJson = await runStaticPublishReadyChecks(distFolderPath);

  await verifyRegistryAuth(options.registry);

  await runPublishProbe(distFolderPath, packageJson, npmOptions);
}
