import program from 'commander'

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

// Fetch extra argv's (-- separated) passed to jest and parse them with commander.
const index = process.argv.findIndex(i => i === '--')
const extraArgs = process.argv
  .slice(0, 2)
  .concat(index >= 0 ? process.argv.slice(index + 1) : [])
program.parse(extraArgs)

const args = {
  browser: program.browser,
  slow: program.slow,
  endpoint: program.endpoint,
  idempotent: program.idempotent,
  persist: program.persist
}
export default args
