import { DeployExecutorOptions } from '../schema';

export type NpmPublishOptions = Pick<
  DeployExecutorOptions,
  | 'access'
  | 'tag'
  | 'otp'
  | 'dryRun'
  | 'registry'
  | 'provenance'
  | 'provenanceFile'
  | 'ignoreScripts'
>;
