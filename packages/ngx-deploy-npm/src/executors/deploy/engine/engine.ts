import { logger } from '@nx/devkit';
import * as fileUtils from '../../../utils';
import * as path from 'node:path';

import { setPackageVersion, NpmPublishOptions, spawnAsync } from '../utils';
import { DeployExecutorOptions } from '../schema';

type PackageInfo = { name: string; version: string };
type ExistingPackagePolicy = 'error' | 'warning' | 'skip';

async function checkIfPackageExists(
  packageName: string,
  version: string,
  npmOptions: NpmPublishOptions
): Promise<boolean> {
  try {
    const args = ['view', `${packageName}@${version}`, 'version'];
    if (npmOptions.registry) {
      args.push('--registry', npmOptions.registry);
    }
    await spawnAsync('npm', args);
    return true;
  } catch {
    return false;
  }
}

async function getPackageInfo(distFolderPath: string): Promise<PackageInfo> {
  const packageContent = await fileUtils.readFileAsync(
    path.join(distFolderPath, 'package.json'),
    { encoding: 'utf8' }
  );
  const packageJson = JSON.parse(packageContent);
  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}

function formatAlreadyExistsMessage(
  packageInfo: PackageInfo,
  registry?: string
): string {
  const registrySuffix = registry ? ` ${registry}` : '';
  return `Package ${packageInfo.name}@${packageInfo.version} already exists in registry${registrySuffix}.`;
}

function formatAlreadyExistsSkipPublishMessage(
  packageInfo: PackageInfo,
  registry?: string
): string {
  return `${formatAlreadyExistsMessage(
    packageInfo,
    registry
  )} Skipping publish.`;
}

const whenPackageExists: Record<
  ExistingPackagePolicy,
  (packageInfo: PackageInfo, registry?: string) => void
> = {
  error: (packageInfo, registry) => {
    throw new Error(formatAlreadyExistsMessage(packageInfo, registry));
  },
  warning: (packageInfo, registry) => {
    logger.warn(formatAlreadyExistsSkipPublishMessage(packageInfo, registry));
  },
  skip: () => undefined,
};

function isCheckExistingEnabled(
  checkExisting: DeployExecutorOptions['checkExisting']
): checkExisting is ExistingPackagePolicy {
  return (
    !!checkExisting && ['error', 'warning', 'skip'].includes(checkExisting)
  );
}

function shouldRunExistingCheck(options: DeployExecutorOptions): boolean {
  if (!isCheckExistingEnabled(options.checkExisting)) {
    return false;
  }

  if (options.checkTag) {
    const publishTag = options.tag ?? 'latest';
    return publishTag !== 'latest';
  }

  return true;
}

function logDryRunBanner(options: DeployExecutorOptions): void {
  if (options.dryRun) {
    logger.info('Dry-run: The package is not going to be published');
  }
}

async function applyPackageVersionIfNeeded(
  distFolderPath: string,
  options: DeployExecutorOptions
): Promise<void> {
  /*
  Modifying the dist when the user is dry-run mode,
  thanks to the Nx Cache could lead to leading to publishing and unexpected package version
  when the option is removed
  */
  if (options.packageVersion && !options.dryRun) {
    await setPackageVersion(distFolderPath, options.packageVersion);
  }
}

async function ensurePublishAllowed(
  distFolderPath: string,
  options: DeployExecutorOptions,
  npmOptions: NpmPublishOptions
): Promise<boolean> {
  const { checkExisting } = options;

  if (
    !isCheckExistingEnabled(checkExisting) ||
    !shouldRunExistingCheck(options)
  ) {
    return true;
  }

  const packageInfo = await getPackageInfo(distFolderPath);
  const exists = await checkIfPackageExists(
    packageInfo.name,
    packageInfo.version,
    npmOptions
  );

  if (!exists) {
    return true;
  }

  whenPackageExists[checkExisting](packageInfo, options.registry);

  return false;
}

async function publishPackage(
  distFolderPath: string,
  npmOptions: NpmPublishOptions
): Promise<void> {
  await spawnAsync('npm', [
    'publish',
    distFolderPath,
    ...getOptionsStringArr(npmOptions),
  ]);
}

function logDryRunFooter(options: DeployExecutorOptions): void {
  if (options.dryRun) {
    logger.info('The options are:');
    logger.info(JSON.stringify(options, null, 1));
  }
}

export async function run(
  distFolderPath: string,
  options: DeployExecutorOptions
) {
  try {
    logDryRunBanner(options);
    await applyPackageVersionIfNeeded(distFolderPath, options);

    const npmOptions = extractOnlyNPMOptions(options);

    if (!(await ensurePublishAllowed(distFolderPath, options, npmOptions))) {
      return;
    }

    await publishPackage(distFolderPath, npmOptions);
    logDryRunFooter(options);

    logger.info(
      '🚀 Successfully published via ngx-deploy-npm! Have a nice day!'
    );
  } catch (error) {
    logger.error('❌ An error occurred!');
    throw error;
  }
}

/**
 * Extract only the options that the `npm publish` command can process
 *
 * @param param0 All the options sent to deploy
 */
function extractOnlyNPMOptions({
  access,
  tag,
  otp,
  dryRun,
  registry,
}: DeployExecutorOptions): NpmPublishOptions {
  return {
    access,
    tag,
    otp,
    dryRun,
    registry,
  };
}

function toKebabCase(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function getOptionsStringArr(options: NpmPublishOptions): string[] {
  return (
    Object.keys(options)
      // Get only options with value
      .filter(optKey => !!(options as Record<string, unknown>)[optKey])
      // to CMD option
      .map(optKey => ({
        cmdOptions: `--${toKebabCase(optKey)}`,
        value: (options as Record<string, string | boolean | number>)[optKey],
      }))
      // push the command and the value to the array
      .flatMap(cmdOptionValue => [
        cmdOptionValue.cmdOptions,
        cmdOptionValue.value.toString(),
      ])
  );
}
