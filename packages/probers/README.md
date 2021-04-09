![Prober](https://user-images.githubusercontent.com/2731362/61009053-44363a00-a326-11e9-8bde-c16901b9932b.png "Prober")

# Probers

Probers is a set of integration tests for the audius dapp using a headless browser.

## Usage
Note, tests are run [inBand](https://jestjs.io/docs/en/cli#runinband) b/c the tests use [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for authentication and interfere w/ each other if run in parallel. 

To run all the tests:
```
npm run test
```

To run all tests and view the progress in a browser:
```
npm run test -- -- --browser
npm run test -- -- --browser --slow 2000 # Slow down operations by 2000 ms
```

To run a test, view its progress in a browser, and specify an endpoint:
```
npm run test -- -- --browser --endpoint http://localhost:3000
```

To run a test in watch mode:  
```
npm run test:target -- <test-file-name> --watch
```

To run a test and view its progress in a browser:
```
npm run test:target -- <test-file-name> -- --browser
npm run test:target -- <test-file-name> -- --browser --slow 2000  # Slow down operations by 2000 ms
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
