import chalk from 'chalk'
import puppeteer from 'puppeteer'
import fs from 'fs'
import mkdirp from 'mkdirp'
import os from 'os'
import path from 'path'

import args from './args'

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

export default async function () {
  console.log('\n')
  console.log(chalk.green('Setup Puppeteer.'))
  let config = {
    executablePath: EXECUTABLE_PATH,
    defaultViewport: { width, height },
    headless: !args.browser,
    slowMo: args.slow,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--window-size=${width},${height}`
    ]
  }
  console.info('with config: ')
  console.info(config)
  console.info('\n')

  if (args.browser) {
    config.ignoreDefaultArgs = '--mute-audio'
  }
  const browser = await puppeteer.launch(config)
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
