import { ExecutorContext } from '@nx/devkit';

import { DeployExecutorOptions } from './schema';
import * as path from 'node:path';

export default async function deploy(
  engine: {
    run: (dir: string, options: DeployExecutorOptions) => Promise<void>;
  },
  context: ExecutorContext,
  options: DeployExecutorOptions
) {
  await engine.run(path.join(context.root, options.distFolderPath), options);
}
