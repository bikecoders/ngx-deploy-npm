import { uniq } from '@nx/plugin/testing';
import { e2eTestTimeout, setup } from './utils';

describe('Minimal Project', () => {
  it(
    'should publish the lib',
    async () => {
      const { processedLibs, tearDown, executeCommand } = await setup([
        { name: uniq('minimal-lib'), generator: 'minimal' },
      ]);
      const [uniqLibName] = processedLibs;

      executeCommand(
        `npx nx deploy ${uniqLibName.name} --tag="e2e" --registry=http://localhost:4873 --packageVersion=0.0.0`
      );

      expect(() => {
        executeCommand(`npm view ${uniqLibName.npmPackageName}@0.0.0`);
        executeCommand(`npm view ${uniqLibName.npmPackageName}@e2e`);
      }).not.toThrow();

      return tearDown();
    },
    e2eTestTimeout()
  );
});
