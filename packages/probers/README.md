![Prober](https://user-images.githubusercontent.com/2731362/61009053-44363a00-a326-11e9-8bde-c16901b9932b.png "Prober")

# Probers

Probers is a set of integration tests for the audius dapp using a headless browser.

## Setup
1. Clone and install dependencies:
```
git clone git@github.com:AudiusProject/probers.git && cd probers
npm install
```
2. Ensure that the exported path for `CHROME_EXECUTABLE_PATH` in [.env](.env) points to where Google Chrome is installed on your machine.

## Usage
Note: tests are run [inBand](https://jestjs.io/docs/en/cli#runinband) (serially) because the tests use [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for authentication and interfere with each other if run in parallel.

Note: that tests run by default against port 3001 (see [src/config.js](src/config.js)) so you should have [audius-client](https://github.com/AudiusProject/audius-client) up and running on that port before attempting to run `probers` tests.

To run all the tests:
```
npm run test
```

To run all tests and view the progress in a browser:
```
npm run test -- -- --browser
```

To run a test, view its progress in a browser, and specify an endpoint:
```
npm run test -- -- --browser --endpoint http://localhost:3000
```

To run a specific test:
```
npm run test:target -- <test-file-path>
# npm run test:target -- src/__tests__/create-account.js
```

To run a test and view its progress in a browser:
```
npm run test:target -- <test-file-name> -- --browser
```

To run a test against a specific endpoint:
```
npm run test:target -- <test-file-name> -- --endpoint http://localhost:3000
npm run test:target -- <test-file-name> -- --endpoint https://staging.audius.co
```

**IMPORTANT: Probers by default will make accounts. Don't do this against prod.**

Idempotency:

Many tests require an account to run (e.g. uploading a track). In order to optimize execution of multiple tests, account credentials are persisted between tests and potentially re-used. To avoid this behavior and make each test run truly idempotently,
```
npm run test:target -- <test-file-name> -- --idempotent
```

## CLI Reference

```js
program
  .option(
    '-b, --browser',
    'Run the tests with a viewable browser (not headless mode)'
  )
  .option(
    '-s, --slow <n>',
    'Run the test in slowmo by n milliseconds',
    parseInt
  )
  .option(
    '-e, --endpoint <s>',
    'Use a specific endpoint to test against, e.g. https://staging.audius.co'
  )
  .option(
    '-i, --idempotent',
    'Run the tests entirely idempotently (no account re-use). By default tests that need a logged in state will try and re-use an account'
  )
  .option(
    '-p, --persist',
    'Persists account info after test teardown. Useful in local development to make tests that require accounts faster'
  )
```

## Debugging Tips

Take a screenshot
```js
await page.screenshot({ path: 'test_output/example.png' });
```
