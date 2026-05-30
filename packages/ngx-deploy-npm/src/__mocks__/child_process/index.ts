import * as OriginalChildProcessModule from 'child_process';

const listOfChildProcess: Record<string, ReturnType<typeof spawnMock>> = {};

function createReadable() {
  const observers: Record<string, (data: unknown) => void> = {};

  return {
    on: (event: string, listener: (data: unknown) => void) => {
      observers[event] = listener;
    },
    emit: (event: string, data: unknown) => {
      observers[event](data);
    },
  };
}

function spawnMock(command: string) {
  const childProcess = {
    stdout: createReadable(),
    stderr: createReadable(),
    kill: jest.fn(),
    ...createReadable(),
  };

  listOfChildProcess[command] = childProcess;

  return childProcess;
}

const mockedChildProcessModule = {
  ...(jest.requireActual('child_process') as typeof OriginalChildProcessModule),
  spawn: jest.fn().mockImplementation(spawnMock),
  listOfChildProcess,
};

module.exports = mockedChildProcessModule;

export type SpawnMock = {
  spawn: typeof spawnMock;
  listOfChildProcess: typeof listOfChildProcess;
};
