import { DeployExecutorOptions } from '../schema';
import { NpmPublishOptions } from '../utils';

export const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

export function formatRegistryLabel(registry?: string): string {
  return registry ?? DEFAULT_REGISTRY;
}

export function extractOnlyNPMOptions({
  access,
  tag,
  otp,
  dryRun,
  registry,
  provenance,
  provenanceFile,
  ignoreScripts,
}: DeployExecutorOptions): NpmPublishOptions {
  return {
    access,
    tag,
    otp,
    dryRun,
    registry,
    provenance,
    provenanceFile,
    ignoreScripts,
  };
}

function toKebabCase(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function getOptionsStringArr(options: NpmPublishOptions): string[] {
  return Object.entries(options).flatMap(([optKey, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === false ||
      value === ''
    ) {
      return [];
    }

    const cmdOption = `--${toKebabCase(optKey)}`;

    if (typeof value === 'boolean') {
      return [cmdOption];
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return [cmdOption, String(value)];
    }

    return [];
  });
}

export function getPublishProbeOptions(
  npmOptions: NpmPublishOptions
): string[] {
  const probeOptions: NpmPublishOptions = {
    access: npmOptions.access,
    otp: npmOptions.otp,
    registry: npmOptions.registry,
    provenance: npmOptions.provenance,
    provenanceFile: npmOptions.provenanceFile,
    ignoreScripts: npmOptions.ignoreScripts,
  };

  return ['--dry-run', '--tag', 'verify', ...getOptionsStringArr(probeOptions)];
}
