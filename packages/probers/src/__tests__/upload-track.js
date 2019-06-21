import path from "path"
import { 
  waitForExit,
  waitForResponse, 
  getRandomInt, 
  waitForSplashScreen,
  resetBrowser
} from "../utils"
import getConfig from "../config"
import createAccount from '../flows/create-account'
import fillBetaPassword from '../flows/fill-beta-password'
import uploadTrack from '../flows/upload-track'

// Allow a max time of 3 minutes to create an account and run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 3 /** min */

describe(
  "Upload Track",
  () => {
    let page
    let user
    const config = getConfig()
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({ width: 1600, height: 1080 })
      await resetBrowser(page, config.baseUrl)
      await fillBetaPassword(page, config.baseUrl)
      user = await createAccount(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })
    it(
      "should upload a track",
      async () => {
        await uploadTrack(page, config.baseUrl)

        /** ======== Validate Track Page ======== */
        await page.waitForSelector("div[class^=TrackPage]")
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).not.toBe("/404")
      },
      timeout
    )
  },
  timeout
)
