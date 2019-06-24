import getConfig from "../config"
import { resetBrowser } from '../utils'
import fillBetaPassword from '../flows/fill-beta-password'

// Allow a max time of 2 minutes to create an account and run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 2 /** min */

describe(
  "Input Password",
  () => {
    let page
    let startListeningButton
    let config = getConfig()

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      // await page.setViewport({ width: 1600, height: 1080 })
      await resetBrowser(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it("should fill in the password and redirect to trending", async () => {
      await fillBetaPassword(page, config.baseUrl)
      await new Promise(resolve => setTimeout(resolve, 2000))
      const pageUrl = new URL(page.url())
      expect(pageUrl.pathname).toBe("/trending")
    }, timeout)

  },
  timeout
)
