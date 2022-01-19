import {
  newPage,
  resetBrowser
} from '../utils'
import getConfig from '../config'
import createAccount from '../flows/create-account'
import uploadTrack from '../flows/upload-track'
import { createSignedInAccountIfNecessary } from '../flows/create-account-if-necessary'

jest.retryTimes(3)

const config = getConfig()

describe(
  'Upload Track',
  () => {
    let page

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      await createSignedInAccountIfNecessary(page, config.baseUrl)
    })

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
      }
    )
  }
)
