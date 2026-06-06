export default {
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/contracts/'],
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 15000,
  // self-report before Jest tears down
  openHandlesTimeout: 500,
};