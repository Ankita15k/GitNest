export default {
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: ['**/tests/saga.test.js'],
  forceExit: true,
};
