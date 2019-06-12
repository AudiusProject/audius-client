import chalk from "chalk"
import puppeteer from "puppeteer"
import fs from "fs"
import mkdirp from "mkdirp"
import os from "os"
import path from "path"

const DIR = path.join(os.tmpdir(), "jest_puppeteer_global_setup")

export default async function() {
  console.log(chalk.green("Setup Puppeteer"))
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1080,
      height: 800,
      deviceScaleFactor: 1
    },
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, "wsEndpoint"), browser.wsEndpoint())
}
