import path from "path"

import { waitForExit, waitForResponse, getRandomInt } from "../utils"
import getConfig from '../config'

// Allow a max time of 2 minutes to create an account and run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 3 /** min */

describe(
  "Upload Track",
  () => {
    let page
    const config = getConfig()
    const testTrackPath = "../assets/track.mp3"

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({
        width: 1200,
        height: 800
      })

      await page.goto(config.baseUrl, { waitUntil: "networkidle2" })

      // Create account and sign in
      // TODO: Create account to generate hedgehog-entropy-key
      await page.evaluate(() => {
        localStorage.setItem(
          "hedgehog-entropy-key",
          "252f9ce2ce891962f6c947028974ee47"
        )
        localStorage.setItem("betaPassword", "true")
      })
      await page.goto(`${config.baseUrl}/upload`, {
        waitUntil: "networkidle0"
      })
      await waitForExit(page, "div[class*=splashScreenWrapper]")
    }, timeout)

    afterAll(async () => {
      await page.close()
    })
    it(
      "should upload a track",
      async () => {
        /** ======== Upload Media Page ======== */
        await page.waitForSelector("div[class^=Dropzone]")
        // NOTE: Clicking the dropzone and opening the file uploader modal is possible, but
        // there is currently no way to close the file upload modal. https://github.com/GoogleChrome/puppeteer/issues/2946
        const dropZone = await page.$(
          `div[class^="Dropzone_dropzone"] input[type="file"]`
        )
        await dropZone.uploadFile(path.resolve(__dirname, testTrackPath))

        // Wait until track preview
        await page.waitForSelector("div[class^=TrackPreview]")
        let continueButton = await page.$(`button[name='continue']`)

        await continueButton.click()

        /** ======== Edit Track Upload Page ======== */
        // Wait until track preview
        await page.waitForXPath(
          "//div[contains(text(), 'Complete Your Track')]"
        )

        const selectCategory = await page.$(`div[class^=DropdownInput_wrapper]`)
        await selectCategory.click()

        const categoryChoice = await page.$x("//li[contains(text(), 'Rock')]")
        await categoryChoice[0].click()

        continueButton = await page.$(`button[name='continue']`)
        await continueButton.click()

        /** ======== Finish Track Upload Page ======== */
        await page.waitForXPath("//span[contains(text(), 'Upload More')]")
        continueButton = await page.$(`button[name='viewMedia']`)
        await continueButton.click()

        /** ======== Track Page ======== */
        await page.waitForSelector("div[class^=TrackPage]")
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).not.toBe("/404")
      },
      timeout
    )
  },
  timeout
)
