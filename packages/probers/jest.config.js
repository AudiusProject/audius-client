// jest.config.js
module.exports = {
  globalSetup: './src/setup.js',
  globalTeardown: './src/teardown.js',
  testTimeout: 5 /* min */ * 60 /* sec */ * 1000 /* ms */,
  testEnvironment: './src/puppeteer_environment.js',
  preset: 'jest-puppeteer',
  verbose: true,
  testSequencer: "./src/testSequencer.js"
}
