import chalk from "chalk"
import rimraf from "rimraf"
import os from "os"
import path from "path"

const DIR = path.join(os.tmpdir(), "jest_puppeteer_global_setup")

export default async function() {
  console.log(chalk.green("Teardown Puppeteer"))
  await global.__BROWSER_GLOBAL__.close()
  rimraf.sync(DIR)
}
