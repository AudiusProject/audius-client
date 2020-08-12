import {
  newPage,
  resetBrowser
} from '../utils'
import getConfig from '../config'
import createAccount from '../flows/create-account'
import uploadTrack from '../flows/upload-track'
import { createAccountIfNecessary } from '../flows/create-account-if-necessary'

// Allow a max time of 3 minutes to create an account and run the test
const timeout = 3 /** min */ * 60 /** sec */ * 1000 /** ms */

describe(
  'Upload Track',
  () => {
    let page
    const config = getConfig()
    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      await createAccountIfNecessary(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })
    it(
      'should upload a track',
      async () => {
        await uploadTrack(page, config.baseUrl)

        /** ======== Validate Track Page ======== */
        await page.waitForSelector('div[class^=TrackPage]')
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).not.toBe('/404')
      },
      timeout
    )
  },
  timeout
)
