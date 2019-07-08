# Probers
## Summary
Probers is a set of integration tests for the audius dapp using a headless browser.

## Usage
The tests must be configured to use a `baseUrl` endpoint pointing to the running dapp instance. By default the baseUrl is set to `localhost:3000`. To test, run  
```
npm run test
```

Note, tests are run [inBand](https://jestjs.io/docs/en/cli#runinband) b/c the tests use [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for authentication and interfere w/ each other if run in parallel. 

To run a test in watch mode:  
```
npm run test -- __tests__/<test-file-name> --watch
```

To run a test and view its progress in chromium:
```
npm run test -- __tests__/<test-file-name> --browser
```