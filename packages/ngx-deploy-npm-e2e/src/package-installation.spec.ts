import { setup } from './utils';

describe('package installation', () => {
  it('should be installed', async () => {
    const { tearDown, executeCommand } = await setup([]);

    expect(() => executeCommand('npm ls ngx-deploy-npm')).not.toThrow();

    return tearDown();
  }, 120000);
});
