export default {
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/contracts/'],
  forceExit: true,
  detectOpenHandles: true
};
