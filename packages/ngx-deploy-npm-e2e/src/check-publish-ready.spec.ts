import { uniq } from '@nx/plugin/testing';
import { deployCommand, E2E_REGISTRY, e2eTestTimeout, setup } from './utils';

describe('checkPublishReady', () => {
  it(
    'should validate with probe on an already-published version, fail on missing dist, and publish after publish mode',
    async () => {
      const { processedLibs, tearDown, executeCommand } = await setup([
        { name: uniq('check-publish-ready'), generator: 'minimal' },
      ]);
      const [lib] = processedLibs;

      executeCommand(
        deployCommand(lib.name, {
          checkPublishReady: 'publish',
          packageVersion: '0.0.0',
          tag: 'e2e',
        })
      );

      const probeOutput = executeCommand(
        deployCommand(lib.name, { checkPublishReady: 'probe' })
      );

      expect(probeOutput).toMatch(/checkPublishReady=probe completed/);
      expect(probeOutput).toMatch(/Skipping publish/);

      expect(() => {
        executeCommand(
          `npm view ${lib.npmPackageName}@0.0.1 --registry=${E2E_REGISTRY}`
        );
      }).toThrow();

      expect(() => {
        executeCommand(
          deployCommand(lib.name, {
            checkPublishReady: 'probe',
            distFolderPath: 'dist/does-not-exist',
          })
        );
      }).toThrow(/Publish dist folder not found/);

      executeCommand(
        deployCommand(lib.name, {
          checkPublishReady: 'publish',
          packageVersion: '0.0.1',
          tag: 'e2e',
        })
      );

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
