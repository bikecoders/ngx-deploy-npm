module.exports = {
  displayName: 'ngx-deploy-npm',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/ngx-deploy-npm',
  coverageReporters: [['lcov', { projectRoot: 'packages/ngx-deploy-npm' }]],
};
