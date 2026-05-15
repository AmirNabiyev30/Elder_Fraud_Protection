module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['tests/e2e.test.js', '<rootDir>/Elder_Fraud_Protection/', '<rootDir>/website/'],
  modulePathIgnorePatterns: ['<rootDir>/Elder_Fraud_Protection/', '<rootDir>/website/'],
  collectCoverageFrom: [
    '*.js',
    'popup/*.js',
    '!jest.config.js',
    '!Elder_Fraud_Protection/**',
    '!website/**',
    '!node_modules/**'
  ],
    setupFiles: ['./tests/mocks/chrome.js']
};
