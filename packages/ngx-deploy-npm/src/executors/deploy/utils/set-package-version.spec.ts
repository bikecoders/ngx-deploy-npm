import * as fileUtils from '../../../utils';
import { setPackageVersion } from './set-package-version';

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
