import { uniq } from '@nx/plugin/testing';
import { setup } from './utils';

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
        `npx nx deploy ${lib.name} --registry=http://localhost:4873 --tag="e2e" --packageVersion=0.0.0`
      );

      expect(() => {
        executeCommand(`npm view ${lib.npmPackageName}@0.0.0`);
        executeCommand(`npm view ${lib.npmPackageName}@e2e`);
      }).not.toThrow();

      return tearDown();
    },
    120000 * 2
  );

  it('should NOT publish because it already exists', async () => {
    const { processedLibs, tearDown, executeCommand } = await setup([
      { name: uniq('minimal-lib'), generator: 'minimal' },
    ]);
    const [uniqLibName] = processedLibs;

    executeCommand(
      `npx nx deploy ${uniqLibName.name} --tag="e2e" --registry=http://localhost:4873 --packageVersion=0.0.0 --checkExisting="error"`
    );

    expect(() => {
      executeCommand(
        `npx nx deploy ${uniqLibName.name} --tag="e2e" --registry=http://localhost:4873 --packageVersion=0.0.0 --checkExisting="error"`
      );
    }).toThrow();

    return tearDown();
  }, 120000);
});
