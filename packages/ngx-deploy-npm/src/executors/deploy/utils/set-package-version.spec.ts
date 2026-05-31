import * as fileUtils from '../../../utils';
import {
  setPackageVersion,
  withTemporaryPackageVersion,
} from './set-package-version';

jest.mock('../../../utils', () => {
  return {
    __esModule: true, //    <----- this __esModule: true is important
    ...jest.requireActual('../../../utils'),
  };
});

describe('setPackageVersion', () => {
  function setupSetPackageVersion(
    opts: {
      version?: string;
      dir?: string;
      packageJson?: Record<string, unknown>;
    } = {}
  ) {
    const {
      version = '1.0.1-next0',
      dir = 'some/random/dir',
      packageJson = {
        name: 'ngx-deploy-npm',
        version: 'boilerPlate',
        description: 'Publish your libraries to NPM with just one command',
        main: 'index.js',
      },
    } = opts;

    const written = {
      value: undefined as
        | Parameters<typeof fileUtils.writeFileAsync>[1]
        | undefined,
    };

    jest
      .spyOn(fileUtils, 'readFileAsync')
      .mockImplementation(() => Promise.resolve(JSON.stringify(packageJson)));

    jest.spyOn(fileUtils, 'writeFileAsync').mockImplementation((_, data) => {
      written.value = data;
      return Promise.resolve();
    });

    const expectedPackage = {
      ...packageJson,
      version,
    };

    return { dir, version, expectedPackage, written };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should write the version of the sent on the package.json', async () => {
    const { dir, version, expectedPackage, written } = setupSetPackageVersion();

    await setPackageVersion(dir, version);

    expect(written.value).toEqual(JSON.stringify(expectedPackage, null, 4));
  });
});

describe('withTemporaryPackageVersion', () => {
  function setupWithTemporaryPackageVersion(
    opts: {
      version?: string;
      dir?: string;
      packageJson?: Record<string, unknown>;
      fn?: () => Promise<void>;
      fnError?: Error;
    } = {}
  ) {
    const {
      version = '1.0.1-next0',
      dir = 'some/random/dir',
      packageJson = {
        name: 'ngx-deploy-npm',
        version: 'boilerPlate',
        description: 'Publish your libraries to NPM with just one command',
        main: 'index.js',
      },
      fn = () => Promise.resolve(),
      fnError,
    } = opts;

    const originalContent = JSON.stringify(packageJson);
    let currentContent = originalContent;
    const writes: string[] = [];

    jest
      .spyOn(fileUtils, 'readFileAsync')
      .mockImplementation(() => Promise.resolve(currentContent));

    jest.spyOn(fileUtils, 'writeFileAsync').mockImplementation((_, data) => {
      currentContent = data as string;
      writes.push(currentContent);
      return Promise.resolve();
    });

    const fnToRun = fnError === undefined ? fn : () => Promise.reject(fnError);

    return {
      dir,
      version,
      originalContent,
      fnToRun,
      getCurrentContent: () => currentContent,
      writes,
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should apply packageVersion temporarily and restore the original content', async () => {
    const {
      dir,
      version,
      originalContent,
      fnToRun,
      getCurrentContent,
      writes,
    } = setupWithTemporaryPackageVersion();

    await withTemporaryPackageVersion(dir, version, fnToRun);

    expect(writes).toHaveLength(2);
    expect(JSON.parse(writes[0]).version).toBe(version);
    expect(getCurrentContent()).toEqual(originalContent);
  });

  it('should restore the original content when fn throws', async () => {
    const { dir, version, originalContent, fnToRun, getCurrentContent } =
      setupWithTemporaryPackageVersion({
        fnError: new Error('callback failed'),
      });

    await expect(() =>
      withTemporaryPackageVersion(dir, version, fnToRun)
    ).rejects.toThrow('callback failed');

    expect(getCurrentContent()).toEqual(originalContent);
  });
});
