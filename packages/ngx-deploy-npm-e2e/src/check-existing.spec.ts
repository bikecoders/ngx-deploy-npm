import { uniq } from '@nx/plugin/testing';
import { deployCommand, E2E_REGISTRY, e2eTestTimeout, setup } from './utils';

describe('checkExisting and checkTag', () => {
  it(
    'should honor checkExisting skip and checkTag when publishing',
    async () => {
      const { processedLibs, tearDown, executeCommand } = await setup([
        { name: uniq('check-existing-and-tag'), generator: 'minimal' },
      ]);
      const [lib] = processedLibs;

      executeCommand(
        deployCommand(lib.name, { tag: 'e2e', packageVersion: '0.0.0' })
      );

      expect(() => {
        executeCommand(
          deployCommand(lib.name, {
            tag: 'e2e',
            packageVersion: '0.0.0',
            checkExisting: 'skip',
          })
        );
      }).not.toThrow();

      expect(() => {
        executeCommand(
          deployCommand(lib.name, {
            tag: 'e2e',
            packageVersion: '0.0.0',
            checkExisting: 'error',
            checkTag: true,
          })
        );
      }).toThrow(/already exists in registry/);

      expect(() => {
        executeCommand(
          deployCommand(lib.name, {
            packageVersion: '0.0.1',
            checkExisting: 'error',
            checkTag: true,
          })
        );
      }).not.toThrow();

      expect(() => {
        executeCommand(
          `npm view ${lib.npmPackageName}@0.0.1 --registry=${E2E_REGISTRY}`
        );
      }).not.toThrow();

      return tearDown();
    },
    e2eTestTimeout()
  );
});
