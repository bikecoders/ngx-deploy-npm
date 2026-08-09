import { logger } from '@nx/devkit';
import { stat } from 'node:fs/promises';

import * as fileUtils from '../../../utils';
import { npmAccess } from '../../../core';
import { DeployExecutorOptions } from '../schema';
import * as spawn from '../utils/spawn-async';
import * as setPackageVersion from '../utils/set-package-version';
import {
  buildProbeVersion,
  collectPublishEntryPaths,
  isCheckPublishReadyEnabled,
  logDualDryRunWarning,
  runPublishReadyChecks,
  verifyRegistryAuth,
} from './publish-ready-checks';
import { NpmPublishOptions } from '../utils';

jest.mock('node:fs/promises', () => ({
  stat: jest.fn(),
}));

jest.mock('../../../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../../utils'),
}));

describe('publish-ready-checks', () => {
  const distFolderPath = '/workspace/dist/libs/my-lib';
  const defaultPackageJson = {
    name: '@test/package',
    version: '1.0.0',
    description: 'desc',
    license: 'MIT',
    repository: 'https://github.com/org/repo',
    main: './index.js',
  };

  const defaultNpmOptions: NpmPublishOptions = {
    access: npmAccess.public,
  };

  type SetupOptions = {
    isDirectory?: boolean;
    packageJson?: Record<string, unknown>;
    readFileError?: boolean;
    entryFilesExist?: boolean;
    whoamiFails?: boolean;
    publishProbeFails?: boolean;
    dryRun?: boolean;
    registry?: string;
    metadataIncomplete?: boolean;
    checkPublishReady?: DeployExecutorOptions['checkPublishReady'];
  };

  function setup(opts: SetupOptions = {}) {
    const {
      isDirectory = true,
      packageJson = defaultPackageJson,
      readFileError = false,
      entryFilesExist = true,
      whoamiFails = false,
      publishProbeFails = false,
      dryRun = false,
      registry,
      metadataIncomplete = false,
    } = opts;

    const pkg = metadataIncomplete
      ? { name: '@test/package', version: '1.0.0', main: './index.js' }
      : packageJson;

    jest.mocked(stat).mockImplementation(() => {
      if (!isDirectory) {
        return Promise.reject(new Error('not found'));
      }

      return Promise.resolve({ isDirectory: () => true } as Awaited<
        ReturnType<typeof stat>
      >);
    });

    jest.spyOn(fileUtils, 'readFileAsync').mockImplementation(() => {
      if (readFileError) {
        return Promise.reject(new Error('read failed'));
      }

      return Promise.resolve(JSON.stringify(pkg));
    });

    jest
      .spyOn(fileUtils, 'fileExists')
      .mockImplementation(() => Promise.resolve(entryFilesExist));

    const spawnCalls: string[][] = [];
    jest.spyOn(spawn, 'spawnAsync').mockImplementation((_cmd, args) => {
      spawnCalls.push(args ?? []);

      if (args?.[0] === 'whoami' && whoamiFails) {
        return Promise.reject(new Error('not logged in'));
      }

      if (args?.[0] === 'publish' && publishProbeFails) {
        return Promise.reject(new Error('publish failed'));
      }

      return Promise.resolve();
    });

    jest
      .spyOn(setPackageVersion, 'withTemporaryPackageVersion')
      .mockImplementation(async (_dir, _version, fn) => fn());

    const loggerWarnSpy = metadataIncomplete
      ? jest.spyOn(logger, 'warn').mockImplementation(() => undefined)
      : undefined;

    const options: DeployExecutorOptions = {
      distFolderPath: 'dist/libs/my-lib',
      access: npmAccess.public,
      dryRun,
      registry,
      ...(opts.checkPublishReady !== undefined
        ? { checkPublishReady: opts.checkPublishReady }
        : { checkPublishReady: 'probe' }),
    };

    return {
      distFolderPath,
      options,
      npmOptions: { ...defaultNpmOptions, registry, dryRun },
      spawnCalls,
      loggerWarnSpy,
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('isCheckPublishReadyEnabled', () => {
    it('should return true for probe and publish', () => {
      expect(isCheckPublishReadyEnabled('probe')).toBe(true);
      expect(isCheckPublishReadyEnabled('publish')).toBe(true);
    });

    it('should return false when unset', () => {
      expect(isCheckPublishReadyEnabled(undefined)).toBe(false);
    });
  });

  describe('logDualDryRunWarning', () => {
    function setupLogDualDryRunWarning() {
      const loggerWarnSpy = jest
        .spyOn(logger, 'warn')
        .mockImplementation(() => undefined);

      return { loggerWarnSpy };
    }

    it('should log warning about two publish dry-runs', () => {
      const { loggerWarnSpy } = setupLogDualDryRunWarning();

      logDualDryRunWarning('probe');

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('two npm publish --dry-run')
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('disposable')
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('package.json')
      );
    });
  });

  describe('buildProbeVersion', () => {
    function setupBuildProbeVersion(opts: { dateNow?: number } = {}) {
      const { dateNow = 1_700_000_000_000 } = opts;

      jest.spyOn(Date, 'now').mockReturnValue(dateNow);

      return { dateNow };
    }

    it('should append verify prerelease with timestamp', () => {
      const { dateNow } = setupBuildProbeVersion();

      expect(buildProbeVersion('2.3.4')).toBe(`2.3.4-verify.${dateNow}`);
    });
  });

  describe('collectPublishEntryPaths', () => {
    it('should collect main and nested exports paths', () => {
      const paths = collectPublishEntryPaths({
        main: './index.js',
        exports: {
          '.': { import: './index.mjs', default: './index.js' },
        },
      });

      expect(paths).toEqual(
        expect.arrayContaining([
          { field: 'main', relativePath: './index.js' },
          { field: 'exports', relativePath: './index.mjs' },
        ])
      );
    });
  });

  describe('verifyRegistryAuth', () => {
    it('should call npm whoami with registry when provided', async () => {
      const { spawnCalls } = setup({ registry: 'http://localhost:4873' });

      await verifyRegistryAuth('http://localhost:4873');

      expect(spawnCalls[0]).toEqual([
        'whoami',
        '--registry',
        'http://localhost:4873',
      ]);
    });

    it('should throw auth-specific error when whoami fails', async () => {
      const { spawnCalls } = setup({ whoamiFails: true });

      await expect(verifyRegistryAuth()).rejects.toThrow(
        'ngx-deploy-npm: Registry authentication failed'
      );

      expect(spawnCalls.some(args => args[0] === 'whoami')).toBe(true);
    });
  });

  describe('runPublishReadyChecks', () => {
    it('should pass when all checks succeed and run publish probe', async () => {
      const { distFolderPath, options, npmOptions, spawnCalls } = setup();

      await runPublishReadyChecks(distFolderPath, options, npmOptions);

      expect(spawnCalls.some(args => args[0] === 'whoami')).toBe(true);
      const publishCall = spawnCalls.find(args => args[0] === 'publish');
      expect(publishCall).toEqual(
        expect.arrayContaining([
          'publish',
          distFolderPath,
          '--dry-run',
          '--tag',
          'verify',
          '--access',
          npmAccess.public,
        ])
      );
      expect(
        setPackageVersion.withTemporaryPackageVersion
      ).toHaveBeenCalledWith(
        distFolderPath,
        expect.stringMatching(/^1\.0\.0-verify\.\d+$/),
        expect.any(Function)
      );
    });

    it('should throw when dist folder is missing', async () => {
      const { distFolderPath, options, npmOptions } = setup({
        isDirectory: false,
      });

      await expect(
        runPublishReadyChecks(distFolderPath, options, npmOptions)
      ).rejects.toThrow('Publish dist folder not found');
      expect(spawn.spawnAsync).not.toHaveBeenCalled();
    });

    it('should throw when package.json is invalid', async () => {
      const { distFolderPath, options, npmOptions } = setup({
        readFileError: true,
      });

      await expect(
        runPublishReadyChecks(distFolderPath, options, npmOptions)
      ).rejects.toThrow('package.json not found or invalid');
    });

    it('should throw when name is missing', async () => {
      const { distFolderPath, options, npmOptions } = setup({
        packageJson: { version: '1.0.0', main: './index.js' },
      });

      await expect(
        runPublishReadyChecks(distFolderPath, options, npmOptions)
      ).rejects.toThrow('missing required field "name"');
    });

    it('should throw when entry file is missing', async () => {
      const { distFolderPath, options, npmOptions } = setup({
        entryFilesExist: false,
      });

      await expect(
        runPublishReadyChecks(distFolderPath, options, npmOptions)
      ).rejects.toThrow('Publish entry file missing');
    });

    it('should warn on missing metadata fields', async () => {
      const { distFolderPath, options, npmOptions, loggerWarnSpy } = setup({
        metadataIncomplete: true,
      });

      await runPublishReadyChecks(distFolderPath, options, npmOptions);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('description')
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('license')
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('repository')
      );
    });

    it('should run publish probe when deploy dryRun is true', async () => {
      const { distFolderPath, options, npmOptions, spawnCalls } = setup({
        dryRun: true,
        checkPublishReady: 'publish',
      });

      await runPublishReadyChecks(distFolderPath, options, npmOptions);

      expect(spawnCalls.some(args => args[0] === 'whoami')).toBe(true);
      expect(spawnCalls.some(args => args[0] === 'publish')).toBe(true);
    });

    it('should no-op when checkPublishReady is unset', async () => {
      const { distFolderPath, npmOptions } = setup();
      const options: DeployExecutorOptions = {
        distFolderPath: 'dist/libs/my-lib',
        access: npmAccess.public,
      };

      await runPublishReadyChecks(distFolderPath, options, npmOptions);

      expect(spawn.spawnAsync).not.toHaveBeenCalled();
    });

    it('should throw probe-specific error when publish dry-run fails', async () => {
      const { distFolderPath, options, npmOptions } = setup({
        publishProbeFails: true,
      });

      await expect(
        runPublishReadyChecks(distFolderPath, options, npmOptions)
      ).rejects.toThrow('npm publish --dry-run failed');
    });
  });
});
