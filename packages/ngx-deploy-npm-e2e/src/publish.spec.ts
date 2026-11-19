import { uniq } from '@nx/plugin/testing';
import {
  deployCommand,
  e2eTestTimeout,
  e2eTestTimeoutExtended,
  setup,
} from './utils';

describe('Publish', () => {
  test.each<{
    testName: string;
    setupParams: Parameters<typeof setup>[0][number];
  }>([
    {
      testName: 'angular lib with default config',
      setupParams: {
        name: uniq('angular-lib'),
        generator: '@nx/angular',
        extraOptions: '--style css',
      },
    },
    {
      testName: 'node lib with config on package.json',
      setupParams: {
        name: uniq('node-lib-with-package-json'),
        generator: '@nx/node',
      },
    },
    {
      testName: 'node lib with config on project.json',
      setupParams: {
        name: uniq('node-lib-project-json'),
        generator: '@nx/node',
        useProjectJson: true,
      },
    },
  ])(
    'should publish with $testName lib',
    async ({ setupParams }) => {
      const { executeCommand, tearDown, processedLibs } = await setup([
        setupParams,
      ]);
      const [lib] = processedLibs;

      executeCommand(
        deployCommand(lib.name, {
          tag: 'e2e',
          packageVersion: '0.0.0',
        })
      );

      expect(() => {
        executeCommand(`npm view ${lib.npmPackageName}@0.0.0`);
        executeCommand(`npm view ${lib.npmPackageName}@e2e`);
      }).not.toThrow();

      return tearDown();
    },
    e2eTestTimeoutExtended()
  );

  it(
    'should NOT publish because it already exists',
    async () => {
      const { processedLibs, tearDown, executeCommand } = await setup([
        { name: uniq('minimal-lib'), generator: 'minimal' },
      ]);
      const [uniqLibName] = processedLibs;

      executeCommand(
        deployCommand(uniqLibName.name, {
          tag: 'e2e',
          packageVersion: '0.0.0',
          checkExisting: 'error',
        })
      );

      expect(() => {
        executeCommand(
          deployCommand(uniqLibName.name, {
            tag: 'e2e',
            packageVersion: '0.0.0',
            checkExisting: 'error',
          })
        );
      }).toThrow();

      return tearDown();
    },
    e2eTestTimeout()
  );
});
