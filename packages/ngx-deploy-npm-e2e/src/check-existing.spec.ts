import { uniq } from '@nx/plugin/testing';
import { e2eTestTimeout, setup } from './utils';

describe('checkExisting and checkTag', () => {
  const registry = 'http://localhost:4873';

  function deployCommand(
    libName: string,
    {
      packageVersion = '0.0.0',
      tag,
      checkExisting,
      checkTag,
    }: {
      packageVersion?: string;
      tag?: string;
      checkExisting?: 'error' | 'skip';
      checkTag?: boolean;
    } = {}
  ) {
    return [
      `npx nx deploy ${libName}`,
      `--registry=${registry}`,
      `--packageVersion=${packageVersion}`,
      tag ? `--tag="${tag}"` : '',
      checkExisting ? `--checkExisting="${checkExisting}"` : '',
      checkTag ? '--checkTag' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  it(
    'should honor checkExisting skip and checkTag when publishing',
    async () => {
      const { processedLibs, tearDown, executeCommand } = await setup([
        { name: uniq('check-existing-and-tag'), generator: 'minimal' },
      ]);
      const [lib] = processedLibs;

      executeCommand(deployCommand(lib.name, { tag: 'e2e' }));

      expect(() => {
        executeCommand(
          deployCommand(lib.name, { tag: 'e2e', checkExisting: 'skip' })
        );
      }).not.toThrow();

      expect(() => {
        executeCommand(
          deployCommand(lib.name, {
            tag: 'e2e',
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
          `npm view ${lib.npmPackageName}@0.0.1 --registry=${registry}`
        );
      }).not.toThrow();

      return tearDown();
    },
    e2eTestTimeout()
  );
});
