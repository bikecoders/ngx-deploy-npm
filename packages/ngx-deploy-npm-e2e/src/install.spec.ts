import { TargetConfiguration } from '@nx/devkit';
import { uniq } from '@nx/plugin/testing';

import { DeployExecutorOptions } from 'bikecoders/ngx-deploy-npm';
import { npmAccess } from 'bikecoders/ngx-deploy-npm';
import { setup } from './utils';

describe('install', () => {
  const expectedTarget = ({
    projectName,
    isBuildable = true,
    access = npmAccess.public,
    customDistFolderPath,
  }: {
    projectName: string;
    isBuildable?: boolean;
    access?: npmAccess;
    customDistFolderPath?: string;
  }): TargetConfiguration<DeployExecutorOptions> => {
    const target: TargetConfiguration<DeployExecutorOptions> = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        distFolderPath: customDistFolderPath || `packages/${projectName}`,
        access,
      },
    };

    if (isBuildable) {
      target.dependsOn = ['build'];
    }

    return target;
  };

  it('should modify the workspace only for the indicated libs', async () => {
    const { processedLibs, tearDown } = await setup([
      {
        name: uniq('node-lib1'),
        generator: '@nx/node',
      },
      {
        name: uniq('node-lib2'),
        generator: '@nx/node',
      },
      {
        name: uniq('node-resctricted'),
        installOptions: {
          access: npmAccess.restricted,
        },
        generator: '@nx/node',
      },
      {
        name: uniq('node-lib-not-set'),
        skipInstall: true,
        generator: '@nx/node',
      },
      {
        name: uniq('small-lib-with-project-json'),
        generator: 'minimal',
        useProjectJson: true,
      },
      {
        name: uniq('small-lib'),
        generator: 'minimal',
      },
    ]);
    const [
      publicLib,
      publicLib2,
      restrictedLib,
      libNOTSet,
      smallLibWithProjectJson,
      smallLib,
    ] = processedLibs;

    expect(publicLib.workspace.targets?.deploy).toEqual(
      expectedTarget({ projectName: publicLib.name })
    );
    expect(publicLib2.workspace.targets?.deploy).toEqual(
      expectedTarget({ projectName: publicLib2.name })
    );
    expect(restrictedLib.workspace.targets?.deploy).toEqual(
      expectedTarget({
        projectName: restrictedLib.name,
        access: npmAccess.restricted,
      })
    );
    expect(libNOTSet.workspace.targets?.deploy).toEqual(undefined);

    expect(smallLibWithProjectJson.workspace.targets?.deploy).toEqual(
      expectedTarget({
        projectName: smallLibWithProjectJson.name,
        customDistFolderPath: smallLibWithProjectJson.workspace.sourceRoot,
        isBuildable: false,
      })
    );

    expect(smallLib.workspace.targets?.deploy).toEqual(
      expectedTarget({
        projectName: smallLib.name,
        customDistFolderPath: smallLib.workspace.sourceRoot,
        isBuildable: false,
      })
    );

    return tearDown();
  }, 180000);
});
