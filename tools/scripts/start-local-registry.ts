/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const REGISTRY = 'http://localhost:4873';
const E2E_USER = 'e2euser';
const E2E_PASS = 'e2e';
const E2E_EMAIL = 'e2e@test.local';
const HTPASSWD_PATH = join(process.cwd(), '.verdaccio', 'htpasswd');

function deleteHtpasswdIfExists(): void {
  if (existsSync(HTPASSWD_PATH)) {
    unlinkSync(HTPASSWD_PATH);
  }
}

function setRegistryAuthToken(registry: string, token: string): void {
  const { hostname, port } = new URL(registry);

  execSync(
    `npm config set //${hostname}:${port}/:_authToken "${token}" --ws=false`,
    { windowsHide: true }
  );
}

async function registerVerdaccioUser(registry: string): Promise<string> {
  const response = await fetch(
    `${registry}/-/user/org.couchdb.user:${E2E_USER}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: E2E_USER,
        password: E2E_PASS,
        email: E2E_EMAIL,
      }),
    }
  );

  const body = (await response.json()) as { token?: string; error?: string };

  if (!response.ok || !body.token) {
    throw new Error(
      `Failed to register Verdaccio user "${E2E_USER}": ${
        body.error ?? response.statusText
      }`
    );
  }

  return body.token;
}

function verifyNpmWhoami(registry: string, expectedUser: string): void {
  let whoamiUser: string;

  try {
    whoamiUser = execSync(`npm whoami --registry=${registry}`, {
      encoding: 'utf-8',
      env: process.env,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const execError = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };

    throw new Error(
      `npm whoami verification failed for "${expectedUser}": ${
        execError.stderr || execError.stdout || execError.message
      }`
    );
  }

  if (whoamiUser !== expectedUser) {
    throw new Error(
      `npm whoami verification failed for "${expectedUser}": got "${whoamiUser}"`
    );
  }
}

async function ensureVerdaccioUser(registry: string): Promise<void> {
  const token = await registerVerdaccioUser(registry);
  setRegistryAuthToken(registry, token);
  verifyNpmWhoami(registry, E2E_USER);

  console.log(`Registered Verdaccio user "${E2E_USER}" for npm whoami`);
}

export default async () => {
  // local registry target to run
  const localRegistryTarget = 'bikecoders:local-registry';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  deleteHtpasswdIfExists();

  globalThis.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });

  await ensureVerdaccioUser(REGISTRY);

  execSync(
    `npx nx deploy:without-build ngx-deploy-npm --registry=${REGISTRY} --packageVersion=0.0.0 --tag e2e`
  );
};
