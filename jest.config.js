module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    '*.js',
    'popup/*.js',
    '!jest.config.js',
    '!node_modules/**'
  ],
    setupFiles: ['./tests/mocks/chrome.js']
};
