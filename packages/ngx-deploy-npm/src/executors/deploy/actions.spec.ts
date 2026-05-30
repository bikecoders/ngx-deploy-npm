import * as nxDevKit from '@nx/devkit';
import * as path from 'path';

import deploy from './actions';
import { mockProjectRoot } from '../../__mocks__/mocks';
import { DeployExecutorOptions } from './schema';

describe('Deploy', () => {
  function setup(
    opts: {
      distFolderPath?: string;
      access?: DeployExecutorOptions['access'];
    } = {}
  ) {
    const { distFolderPath = 'dist/libs/project', access = 'public' } = opts;

    const PROJECT = 'RANDOM-PROJECT';
    const mockEngine = {
      run: jest.fn().mockImplementation(() => () => Promise.resolve()),
    } as unknown as Parameters<typeof deploy>[0];

    const context: nxDevKit.ExecutorContext = {
      root: mockProjectRoot,
      projectName: PROJECT,
      target: {
        executor: 'ngx-deploy-npm:deploy',
      },
      projectGraph: {},
    } as nxDevKit.ExecutorContext;

    const options: DeployExecutorOptions = {
      distFolderPath,
      access,
    };

    return {
      PROJECT,
      context,
      mockEngine,
      options,
    };
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should invoke the engine', async () => {
    const { mockEngine, context, options } = setup();

    await deploy(mockEngine, context, options);

    expect(mockEngine.run).toHaveBeenCalledWith(
      path.join(context.root, options.distFolderPath),
      options
    );
  });
});
