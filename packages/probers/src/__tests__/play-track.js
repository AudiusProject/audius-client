import getConfig from "../config"
import { newPage, resetBrowser, wait } from "../utils"
import { skipBetaPassword } from "../flows/fill-beta-password"
import playTrack from "../flows/play-track"

// Allow a max time of 2 minutes to run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 2 /** min */

describe(
  "Play Track",
  () => {
    let page
    let user
    const config = getConfig()

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      await skipBetaPassword(page)
    }, timeout)

    afterAll(async () => {
      await wait(2000)
      await page.close()
    })

    it(
      "should play a trending track",
      async () => {
        await playTrack(page, config.baseUrl, "trending")
        const playing = await page.evaluate(() => {
          return !window.audio.paused
        })
        expect(playing).toBe(true)
      },
      timeout
    )
  },
  timeout
)
