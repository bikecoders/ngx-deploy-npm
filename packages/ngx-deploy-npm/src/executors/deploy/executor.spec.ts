import { ExecutorContext, logger } from '@nx/devkit';

import runExecutor from './executor';
import deploy from './actions';
import { mockProjectRoot } from '../../__mocks__/mocks';
import { DeployExecutorOptions } from './schema';

jest.mock('./actions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedDeploy = deploy as jest.MockedFunction<typeof deploy>;

describe('runExecutor', () => {
  function setupRunExecutor(
    opts: {
      deployError?: Error;
    } = {}
  ) {
    const { deployError } = opts;

    mockedDeploy.mockReset();
    if (deployError) {
      mockedDeploy.mockRejectedValue(deployError);
    } else {
      mockedDeploy.mockResolvedValue(undefined);
    }

    const loggerErrorSpy = jest
      .spyOn(logger, 'error')
      .mockImplementation(() => undefined);

    const context = {
      root: mockProjectRoot,
      projectName: 'test-project',
    } as ExecutorContext;

    const options: DeployExecutorOptions = {
      distFolderPath: 'dist/libs/test',
      access: 'public',
    };

    return { context, options, loggerErrorSpy };
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return success when deploy completes', async () => {
    const { context, options } = setupRunExecutor();

    const result = await runExecutor(options, context);

    expect(result).toEqual({ success: true });
    expect(mockedDeploy).toHaveBeenCalledWith(
      expect.objectContaining({ run: expect.any(Function) }),
      context,
      options
    );
  });

  it('should return failure and log errors when deploy throws', async () => {
    const publishError = new Error('publish failed');
    const { context, options, loggerErrorSpy } = setupRunExecutor({
      deployError: publishError,
    });

    const result = await runExecutor(options, context);

    expect(result).toEqual({ success: false });
    expect(loggerErrorSpy).toHaveBeenCalledWith(publishError);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error when trying to publish the library'
    );
  });
});
