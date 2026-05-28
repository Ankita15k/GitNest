export default {
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  testMatch: [
    '**/tests/contracts/**/*.test.js',
    '**/tests/integration/**/*.contract.test.js',
  ],
  forceExit: true,
  detectOpenHandles: true,
};
