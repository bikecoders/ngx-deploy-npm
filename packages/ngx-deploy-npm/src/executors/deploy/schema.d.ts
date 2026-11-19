export interface DeployExecutorOptions {
  /**
   * The dist folder path. The path should be relative to the project's root
   */
  distFolderPath: string;
  /**
   * The version that your package is going to be published. Ex: '1.3.5' '2.0.0-next.0'
   */
  packageVersion?: string;
  /**
   * Registers the published package with the given tag, such that `npm install @` will install this version. By default, `npm publish` updates and `npm install` installs the `latest` tag. See `npm-dist-tag` for details about tags.
   */
  tag?: string;
  /**
   * Tells the registry whether this package should be published as public or restricted. Only applies to scoped packages, which default to restricted. If you don’t have a paid account, you must publish with --access public to publish scoped packages.
   */
  access: 'public' | 'restricted';
  /**
   * If you have two-factor authentication enabled in auth-and-writes mode then you can provide a code from your authenticator with this. If you don’t include this and you’re running from a TTY then you’ll be prompted.
   */
  otp?: string | number;
  /**
   * Configure npm to use any compatible registry you like, and even run your own registry.
   */
  registry?: string;
  /**
   * For testing: Run through without making any changes. Execute with --dry-run and nothing will happen.
   */
  dryRun?: boolean;
  /**
   * When publishing from a supported cloud CI/CD system, the package will be publicly linked to where it was built and published from. Cannot be used with provenanceFile.
   */
  provenance?: boolean;
  /**
   * When publishing, the provenance bundle at the given path will be used. Cannot be used with provenance.
   */
  provenanceFile?: string;
  /**
   * If true, npm does not run scripts specified in package.json during publish.
   */
  ignoreScripts?: boolean;
  /**
   * Check if the package version already exists before publishing
   */
  checkExisting?: 'error' | 'warning' | 'skip';
  /**
   * When true, only run the checkExisting duplicate version check when publishing to a non-latest tag
   */
  checkTag?: boolean;
  /**
   * Pre-publish validation mode. Both values run static checks, npm whoami, and a registry
   * probe (npm publish --dry-run with a disposable {version}-verify.{timestamp}).
   * - `probe`: exit after validation (typical pre-bump CI).
   * - `publish`: continue to checkExisting and npm publish after validation.
   * With deploy `dryRun`, both values log a warning and run a second npm publish --dry-run
   * using the version in dist package.json (in addition to the probe dry-run).
   * Complements checkExisting; does not replace it.
   */
  checkPublishReady?: 'probe' | 'publish';
}
