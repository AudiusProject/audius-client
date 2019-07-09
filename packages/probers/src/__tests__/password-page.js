import getConfig from "../config"
import { newPage, resetBrowser, wait } from "../utils"
import fillBetaPassword from "../flows/fill-beta-password"

// Allow a max time of 2 minutes to run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 2 /** min */

describe(
  "Input Password",
  () => {
    let page
    let startListeningButton
    let config = getConfig()

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      "should fill in the password and redirect to trending",
      async () => {
        await fillBetaPassword(page, config.baseUrl)
        await wait(2000)
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).toBe("/trending")
      },
      timeout
    )
  },
  timeout
)
