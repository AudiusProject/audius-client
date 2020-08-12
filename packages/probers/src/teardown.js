import chalk from 'chalk'
import rimraf from 'rimraf'
import os from 'os'
import path from 'path'
import { clearAccount } from './utils/account-credentials'

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

export default async function () {
  clearAccount()
  console.log(chalk.green('Teardown Puppeteer'))
  await global.__BROWSER_GLOBAL__.close()
  rimraf.sync(DIR)
}
