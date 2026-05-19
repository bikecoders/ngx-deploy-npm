const isWindows = process.platform === 'win32';

module.exports = {
  displayName: 'ngx-deploy-npm-e2e',
  preset: '../../jest.preset.js',
  testTimeout: isWindows ? 480_000 : 240_000,
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/ngx-deploy-npm-e2e',
  globalSetup: '../../tools/scripts/start-local-registry.ts',
  globalTeardown: '../../tools/scripts/stop-local-registry.ts',
};
