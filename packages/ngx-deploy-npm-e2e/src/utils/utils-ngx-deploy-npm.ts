import { InstallGeneratorOptions } from 'bikecoders/ngx-deploy-npm';
import { getNxWorkspaceVersion } from './get-nx-workspace-version';

export function initNgxDeployNPMProject(
  executeCommand: (command: string) => void
) {
  executeCommand(`npm install -D @nx/devkit@${getNxWorkspaceVersion()}`);
  executeCommand(`npm install -D ngx-deploy-npm@e2e`);
}

export function installNgxDeployNPMProject(
  executeCommand: (command: string) => void,
  options: InstallGeneratorOptions
) {
  const optionGenerator = <T>(
    optionaName: keyof InstallGeneratorOptions,
    value?: T
  ) => (value ? `--${optionaName}="${value}"` : '');

  const optionsParsed = Object.entries(options ?? {})
    .map(([key, value]) =>
      optionGenerator(key as keyof InstallGeneratorOptions, value)
    )
    .join(' ');

  executeCommand(`npx nx generate ngx-deploy-npm:install ${optionsParsed}`);
}
