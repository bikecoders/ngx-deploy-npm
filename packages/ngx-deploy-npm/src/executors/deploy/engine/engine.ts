import { logger } from '@nx/devkit';
import { readFileSync } from 'fs';

import { setPackageVersion, NpmPublishOptions, spawnAsync } from '../utils';
import { DeployExecutorOptions } from '../schema';

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

async function getPackageInfo(
  distFolderPath: string
): Promise<{ name: string; version: string }> {
  const packageJson = JSON.parse(
    readFileSync(`${distFolderPath}/package.json`, 'utf-8')
  );
  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}

export async function run(
  distFolderPath: string,
  options: DeployExecutorOptions
) {
  try {
    if (options.dryRun) {
      logger.info('Dry-run: The package is not going to be published');
    }

    /*
    Modifying the dist when the user is dry-run mode,
    thanks to the Nx Cache could lead to leading to publishing and unexpected package version
    when the option is removed
    */
    if (options.packageVersion && !options.dryRun) {
      await setPackageVersion(distFolderPath, options.packageVersion);
    }

    const npmOptions = extractOnlyNPMOptions(options);

    // Only check for existing package if explicitly enabled
    if (options.checkExisting) {
      const packageInfo = await getPackageInfo(distFolderPath);
      const exists = await checkIfPackageExists(
        packageInfo.name,
        packageInfo.version,
        npmOptions
      );

      if (exists) {
        logger.warn(
          `Package ${packageInfo.name}@${packageInfo.version} already exists in registry. Skipping publish.`
        );
        return;
      }
    }

    await spawnAsync('npm', [
      'publish',
      distFolderPath,
      ...getOptionsStringArr(npmOptions),
    ]);

    if (options.dryRun) {
      logger.info('The options are:');
      logger.info(JSON.stringify(options, null, 1));
    }

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

  function toKebabCase(str: string) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}
