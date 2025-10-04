module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/test/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
};
