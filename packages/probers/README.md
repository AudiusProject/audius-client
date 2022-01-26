![Prober](https://user-images.githubusercontent.com/2731362/61009053-44363a00-a326-11e9-8bde-c16901b9932b.png "Prober")

# Probers

Probers is a set of integration tests for the audius dapp using a headless browser.

## Setup
1. Clone and install dependencies:
```
git clone git@github.com:AudiusProject/probers.git && cd probers
npm install
```

## Usage
Note: that tests run by default against port 3001 (see [src/config.js](src/config.js)) so you should have [audius-client](https://github.com/AudiusProject/audius-client) up and running on that port before attempting to run `probers` tests.

To run all the tests:
```
npm run cypress:run
```

To run all tests and view the progress in a browser:
```
npm run cypress:open
```


To run a against staging
```
npm run cypress:run-stage
```

**IMPORTANT: Probers by default will make accounts. Don't do this against prod.**
