import getConfig from '../config'
import { newPage, resetBrowser, wait, waitForNetworkIdle, reload, waitForNetworkIdle0 } from '../utils'
import { repostTrack, undoRepostTrack, checkIfReposted } from '../flows/repost-track'
import { createSignedInAccountIfNecessary } from '../flows/create-account-if-necessary'

const config = getConfig()
const testTimeout = 5 /* min */ * 60 /* sec */ * 1000 /* ms */

describe(
  'Repost Track',
  () => {
    let page

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      await createSignedInAccountIfNecessary(page, config.baseUrl)
    }, config.defaultTestTimeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      // We do this to ensure idempotency
      'should repost, appear reposted after reloading, unrepost, and appear unreposted',
      async () => {
        let button
        let isReposted

        await repostTrack(page, config.baseUrl, { trackRoute: config.trackRoute })

        // Wait for confirmer and reload
        await waitForNetworkIdle(page, config.confirmerTimeout, 1)
        await reload(page)

        isReposted = await checkIfReposted(page)
        expect(isReposted).toBe(true)

        await undoRepostTrack(page, config.baseUrl, { trackRoute: config.trackRoute })

        // Wait for confirmer and reload
        await waitForNetworkIdle(page, config.confirmerTimeout, 1)
        await reload(page)

        isReposted = await checkIfReposted(page)
        expect(isReposted).toBe(false)
      },
      testTimeout
    )
  },
  testTimeout
)
