import { logger } from '@nx/devkit';
import { spawn } from 'node:child_process';

function resolveSpawnCommand(
  mainProgram: string,
  programArgs?: string[]
): { command: string; args: string[] } {
  if (process.platform === 'win32') {
    return {
      command: process.env.comspec as string,
      args: ['/c', mainProgram, ...(programArgs ?? [])],
    };
  }

  return { command: mainProgram, args: programArgs ?? [] };
}

export function spawnAsync(
  mainProgram: string,
  programArgs?: string[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { command, args } = resolveSpawnCommand(mainProgram, programArgs);
    const childProcess = spawn(command, args);

    childProcess.stdout.on('data', data => {
      logger.info(data.toString());
    });
    childProcess.stderr.on('data', data => {
      logger.info(data.toString());
    });

    childProcess.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    childProcess.on('error', reject);
  });
}

const DEFAULT_STDOUT_MATCH_BUFFER_LIMIT = 4096;

export function spawnAsyncMatchStdout(
  mainProgram: string,
  programArgs: string[] | undefined,
  pattern: RegExp,
  bufferLimit = DEFAULT_STDOUT_MATCH_BUFFER_LIMIT
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const { command, args } = resolveSpawnCommand(mainProgram, programArgs);
    const childProcess = spawn(command, args);
    let searchBuffer = '';
    let settled = false;

    const finish = (match: string | undefined) => {
      if (settled) {
        return;
      }

      settled = true;
      childProcess.kill();
      resolve(match);
    };

    childProcess.stdout.on('data', data => {
      searchBuffer += data.toString();

      const match = pattern.exec(searchBuffer);

      if (match?.[1]) {
        finish(match[1]);
        return;
      }

      if (searchBuffer.length > bufferLimit) {
        searchBuffer = searchBuffer.slice(-bufferLimit);
      }
    });
    childProcess.stderr.on('data', data => {
      logger.info(data.toString());
    });

    childProcess.on('close', code => {
      if (settled) {
        return;
      }

      const match = pattern.exec(searchBuffer);

      if (match?.[1]) {
        finish(match[1]);
        return;
      }

      if (code === 0) {
        finish(undefined);
        return;
      }

      settled = true;
      reject(code);
    });
    childProcess.on('error', error => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
  });
}
