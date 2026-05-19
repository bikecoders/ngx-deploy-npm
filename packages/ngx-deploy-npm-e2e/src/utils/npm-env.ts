const NPM_PUBLIC_REGISTRY = 'https://registry.npmjs.org/';

/**
 * Env for commands that must install from the public npm registry (e.g. create-nx-workspace).
 *
 * Jest globalSetup points npm at the local Verdaccio registry, and GitHub Actions setup-node
 * sets NPM_CONFIG_USERCONFIG with always-auth. On Windows that combination breaks nested
 * `npm install` inside create-nx-workspace (exit 3221226505).
 */
export function getPublicNpmRegistryEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };

  const keysToUnset = [
    'NPM_CONFIG_USERCONFIG',
    'npm_config_userconfig',
    'NPM_CONFIG_ALWAYS_AUTH',
    'npm_config_always_auth',
    'npm_config__auth',
    'npm_config__authtoken',
    'BUN_CONFIG_REGISTRY',
    'BUN_CONFIG_TOKEN',
    'YARN_REGISTRY',
    'YARN_NPM_REGISTRY_SERVER',
    'YARN_UNSAFE_HTTP_WHITELIST',
  ];

  for (const key of keysToUnset) {
    delete env[key];
  }

  env.npm_config_registry = NPM_PUBLIC_REGISTRY;
  env.NPM_CONFIG_REGISTRY = NPM_PUBLIC_REGISTRY;

  return env;
}
