import { logger } from '@nx/devkit';

type Options = {
  nxPlugin: string;
  libName: string;
  executeCommand: (command: string) => void;
  extraOptions?: string;
  generator?: string;
  setPublishableOption?: boolean;
};

export function generateLib({
  nxPlugin,
  libName,
  executeCommand,
  extraOptions,
  generator = 'lib',
  setPublishableOption = true,
}: Options) {
  const publishableOption = setPublishableOption ? '--publishable' : '';
  const extraOptionsNormalized = extraOptions ? extraOptions : '';

  logger.verbose(
    `Generating lib ${libName} with nxPlugin ${nxPlugin} and generator ${generator} and extraOptions ${extraOptionsNormalized}`
  );
  executeCommand(
    `npx nx generate ${nxPlugin}:${generator} --name ${libName} ${publishableOption} --importPath ${libName} ${extraOptionsNormalized}`
  );
}
