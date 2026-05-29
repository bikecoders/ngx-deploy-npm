import { logger } from '@nx/devkit';
import { spawn } from 'node:child_process';

export function spawnAsync(
  mainProgram: string,
  programArgs?: string[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = mainProgram;
    let args = programArgs ?? [];

    if (process.platform === 'win32') {
      command = process.env.comspec as string;
      args = ['/c', mainProgram, ...args];
    }

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
