import { logger } from '@nx/devkit';

import { spawnAsync, spawnAsyncMatchStdout } from './spawn-async';
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

  it('should resolve with the first stdout pattern match without waiting for close', async () => {
    const { command, processKey, mockedChildProcess } = setupSpawn();
    const pattern = /"size":\s*(\d+)/;

    const promise = spawnAsyncMatchStdout(command, [], pattern);
    const childProcess = mockedChildProcess.listOfChildProcess[processKey];
    childProcess.stdout.emit(
      'data',
      Buffer.from('[{"name":"pkg","version":"1.0.0","size":2048')
    );
    const returnedValue = await promise;

    expect(returnedValue).toBe('2048');
    expect(childProcess.kill).toHaveBeenCalled();
  });

  it('should resolve with undefined when the command finishes without a match', async () => {
    const { command, processKey, mockedChildProcess } = setupSpawn();

    const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
    const childProcess = mockedChildProcess.listOfChildProcess[processKey];
    childProcess.stdout.emit('data', Buffer.from('no match here'));
    childProcess.emit('close', 0);
    const returnedValue = await promise;

    expect(returnedValue).toBeUndefined();
    expect(childProcess.kill).toHaveBeenCalled();
  });

  describe('spawnAsyncMatchStdout', () => {
    function setupMatchStdout(
      opts: {
        platform?: 'linux' | 'win32';
        comspec?: string;
        command?: string;
        programArgs?: string[];
      } = {}
    ) {
      return setupSpawn(opts);
    }

    it('should log stderr while matching stdout', async () => {
      const { command, processKey, mockedChildProcess, loggerInfoMock } =
        setupMatchStdout();
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stderr.emit('data', Buffer.from('npm notice'));
      childProcess.stdout.emit('data', Buffer.from('"size":512'));
      await promise;

      expect(loggerInfoMock).toHaveBeenCalledWith('npm notice');
    });

    it('should reject when the command exits with a non-zero code', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.emit('close', 1);

      await expect(promise).rejects.toEqual(1);
    });

    it('should reject when the command emits an error', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const error = new Error('spawn failed');
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.emit('error', error);

      await expect(promise).rejects.toThrow('spawn failed');
    });

    it('should ignore a second finish attempt after a match is found', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stdout.emit('data', Buffer.from('"size":2048'));
      childProcess.stdout.emit('data', Buffer.from('"size":4096'));
      childProcess.emit('close', 0);

      await expect(promise).resolves.toBe('2048');
      expect(childProcess.kill).toHaveBeenCalledTimes(1);
    });

    it('should ignore close after stdout already settled the promise', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stdout.emit('data', Buffer.from('"size":2048'));
      childProcess.emit('close', 1);

      await expect(promise).resolves.toBe('2048');
    });

    it('should resolve a match found on close when stdout did not match yet', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const pattern = {
        exec: jest
          .fn()
          .mockReturnValueOnce(null)
          .mockReturnValueOnce(['"size":1024', '1024']),
      } as unknown as RegExp;
      const promise = spawnAsyncMatchStdout(command, [], pattern);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stdout.emit(
        'data',
        Buffer.from('{"name":"pkg","size":1024}')
      );
      childProcess.emit('close', 0);

      await expect(promise).resolves.toBe('1024');
    });

    it('should trim the search buffer when output exceeds the buffer limit', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/, 16);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stdout.emit(
        'data',
        Buffer.from('xxxxxxxxxxxxxxxxxxxxxxxx"size":777')
      );

      await expect(promise).resolves.toBe('777');
    });

    it('should match before trimming when a single chunk exceeds the buffer limit', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const pattern = /"size":\s*(\d+),\s*"unpackedSize"/;
      const promise = spawnAsyncMatchStdout(command, [], pattern);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];
      const payload = `[{"name":"pkg","version":"1.0.0","size":400122,"unpackedSize":456504${'x'.repeat(
        5000
      )}`;

      childProcess.stdout.emit('data', Buffer.from(payload));

      await expect(promise).resolves.toBe('400122');
    });

    it('should use Windows command resolution on win32', async () => {
      const { command, programArgs, processKey, comspec, mockedChildProcess } =
        setupMatchStdout({
          platform: 'win32',
          programArgs: ['/w'],
        });
      const promise = spawnAsyncMatchStdout(
        command,
        programArgs,
        /"size":\s*(\d+)/
      );
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stdout.emit('data', Buffer.from('"size":128'));
      await promise;

      expect(mockedChildProcess.spawn).toHaveBeenCalledWith(comspec, [
        '/c',
        command,
        ...programArgs,
      ]);
    });

    it('should ignore errors emitted after the promise is already settled', async () => {
      const { command, processKey, mockedChildProcess } = setupMatchStdout();
      const promise = spawnAsyncMatchStdout(command, [], /"size":\s*(\d+)/);
      const childProcess = mockedChildProcess.listOfChildProcess[processKey];

      childProcess.stdout.emit('data', Buffer.from('"size":256'));
      childProcess.emit('error', new Error('late error'));

      await expect(promise).resolves.toBe('256');
    });
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
