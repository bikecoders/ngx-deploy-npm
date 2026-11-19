export const E2E_REGISTRY = 'http://localhost:4873';

export type DeployCommandOptions = {
  registry?: string;
  packageVersion?: string;
  tag?: string;
  checkExisting?: 'error' | 'warning' | 'skip';
  checkTag?: boolean;
  checkPublishReady?: 'probe' | 'publish';
  distFolderPath?: string;
  dryRun?: boolean;
};

export function deployCommand(
  libName: string,
  {
    registry = E2E_REGISTRY,
    packageVersion,
    tag,
    checkExisting,
    checkTag,
    checkPublishReady,
    distFolderPath,
    dryRun,
  }: DeployCommandOptions = {}
): string {
  return [
    `npx nx deploy ${libName}`,
    `--registry=${registry}`,
    packageVersion !== undefined ? `--packageVersion=${packageVersion}` : '',
    tag ? `--tag="${tag}"` : '',
    checkExisting ? `--checkExisting="${checkExisting}"` : '',
    checkTag ? '--checkTag' : '',
    checkPublishReady ? `--checkPublishReady="${checkPublishReady}"` : '',
    distFolderPath ? `--distFolderPath="${distFolderPath}"` : '',
    dryRun ? '--dryRun' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
