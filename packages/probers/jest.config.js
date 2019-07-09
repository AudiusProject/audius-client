// jest.config.js
module.exports = {
  globalSetup: './src/setup.js',
  globalTeardown: './src/teardown.js',
  testEnvironment: './src/puppeteer_environment.js',
  preset: 'jest-puppeteer',
  verbose: true
}
