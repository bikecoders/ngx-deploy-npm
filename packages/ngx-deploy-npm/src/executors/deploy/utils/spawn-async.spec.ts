import { logger } from '@nx/devkit';

import { spawnAsync } from './spawn-async';
import * as child_process from 'child_process';
import type { SpawnMock } from '../../../__mocks__/child_process';

jest.mock('child_process');
const mockedChildProcess: SpawnMock = child_process as unknown as SpawnMock;

describe('spawnAsync', () => {
  const originalEnv = process.env;
  const originalPlatform = process.platform;

  function setupSpawn(
    opts: {
      platform?: 'linux' | 'win32';
      comspec?: string;
      command?: string;
      programArgs?: string[];
    } = {}
  ) {
    const {
      platform = 'linux',
      comspec = 'C:\\Windows\\system\\cmd.exe',
      command = platform === 'win32' ? 'dir' : 'ls',
      programArgs = [],
    } = opts;

    process.env = {
      ...originalEnv,
      ...(platform === 'win32' ? { comspec } : {}),
    };
    Object.defineProperty(process, 'platform', { value: platform });

    const processKey = platform === 'win32' ? comspec : command;
    const loggerInfoMock = logger.info as jest.Mock;
    loggerInfoMock.mockClear();

    return {
      command,
      programArgs,
      processKey,
      comspec,
      mockedChildProcess,
      loggerInfoMock,
    };
  }

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    jest.clearAllMocks();
  });

  it('should complete the promise when the command finish', async () => {
    const { command, processKey, mockedChildProcess } = setupSpawn();

    const promise = spawnAsync(command);
    mockedChildProcess.listOfChildProcess[processKey].emit('close', 0);
    const returnedValue = await promise;

    expect(returnedValue).toBeUndefined();
  });

  it('should reject the promise when the command finish with error code', async () => {
    const { command, processKey, mockedChildProcess } = setupSpawn();
    const errorCode = 1;

    await expect(() => {
      const promise = spawnAsync(command);
      mockedChildProcess.listOfChildProcess[processKey].emit(
        'close',
        errorCode
      );

      return promise;
    }).rejects.toEqual(errorCode);
  });

  it('should reject the promise when the command emits on the error event', async () => {
    const { command, processKey, mockedChildProcess } = setupSpawn();
    const errorData = 'error-data';

    await expect(() => {
      const promise = spawnAsync(command);
      mockedChildProcess.listOfChildProcess[processKey].emit(
        'error',
        errorData
      );

      return promise;
    }).rejects.toEqual(errorData);
  });

  it("should log the data of the command's standard output (stdout)", async () => {
    const { command, processKey, mockedChildProcess, loggerInfoMock } =
      setupSpawn();
    const buffer = Buffer.from('buffer with data');

    const promise = spawnAsync(command);
    mockedChildProcess.listOfChildProcess[processKey].stdout.emit(
      'data',
      buffer
    );
    mockedChildProcess.listOfChildProcess[processKey].emit('close', 0);
    await promise;

    expect(loggerInfoMock).toHaveBeenCalledWith(buffer.toString());
  });

  it("should log the data of the command's standard error (stderr)", async () => {
    const { command, processKey, mockedChildProcess, loggerInfoMock } =
      setupSpawn();
    const buffer = Buffer.from('buffer with data');

    const promise = spawnAsync(command);
    mockedChildProcess.listOfChildProcess[processKey].stderr.emit(
      'data',
      buffer
    );
    mockedChildProcess.listOfChildProcess[processKey].emit('close', 0);
    await promise;

    expect(loggerInfoMock).toHaveBeenCalledWith(buffer.toString());
  });

  describe('Windows OS', () => {
    it('should complete the promise when the command finish', async () => {
      const { command, processKey, mockedChildProcess } = setupSpawn({
        platform: 'win32',
      });

      const promise = spawnAsync(command);
      mockedChildProcess.listOfChildProcess[processKey].emit('close', 0);
      const returnedValue = await promise;

      expect(returnedValue).toBeUndefined();
    });

    it('should have called original spawn with the right attributes', async () => {
      const { command, programArgs, processKey, comspec, mockedChildProcess } =
        setupSpawn({
          platform: 'win32',
          programArgs: ['/w'],
        });

      const promise = spawnAsync(command, programArgs);
      mockedChildProcess.listOfChildProcess[processKey].emit('close', 0);
      await promise;

      expect(mockedChildProcess.spawn).toHaveBeenCalledWith(comspec, [
        '/c',
        command,
        ...programArgs,
      ]);
    });
  });
});
