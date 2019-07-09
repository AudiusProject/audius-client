import chalk from 'chalk'
import puppeteer from 'puppeteer'
import fs from 'fs'
import mkdirp from 'mkdirp'
import os from 'os'
import path from 'path'
import program from 'commander'

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')
let EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH
try {
  fs.existsSync(EXECUTABLE_PATH)
} catch (e) {
  console.error('No Chrome executable found, defaulting to Chromium')
  EXECUTABLE_PATH = null
}

const width = 1600
const height = 1080

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

export default async function () {
  // Fetch extra argv's (-- separated) passed to jest and parse them with commander.
  const index = process.argv.findIndex(i => i === '--')
  const extraArgs = process.argv
    .slice(0, 2)
    .concat(index >= 0 ? process.argv.slice(index + 1) : [])
  program.parse(extraArgs)

  console.log('\n')
  console.log(chalk.green('Setup Puppeteer.'))
  let config = {
    executablePath: EXECUTABLE_PATH,
    defaultViewport: { width, height },
    headless: !program.browser,
    slowMo: program.slow,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${width},${height}`
    ]
  }
  if (program.browser) {
    config.ignoreDefaultArgs = '--mute-audio'
  }
  const browser = await puppeteer.launch(config)
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
