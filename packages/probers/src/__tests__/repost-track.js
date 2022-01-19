import getConfig from '../config'
import { newPage, resetBrowser, reload, wait, waitForNetworkIdle0 } from '../utils'
import { repostTrack, undoRepostTrack, checkIfReposted } from '../flows/repost-track'
import { createSignedInAccountIfNecessary } from '../flows/create-account-if-necessary'

jest.retryTimes(3)

const config = getConfig()

describe(
  'Repost Track',
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
      // We do this to ensure idempotency
      'should repost, appear reposted after reloading, unrepost, and appear unreposted',
      async () => {
        let button
        let isReposted

        await repostTrack(page, config.baseUrl, { trackRoute: config.trackRoute })
        await reload(page)
        await waitForNetworkIdle0(page)
        isReposted = await checkIfReposted(page)
        expect(isReposted).toBe(true)

        await undoRepostTrack(page, config.baseUrl, { trackRoute: config.trackRoute })
        await reload(page)
        await waitForNetworkIdle0(page)
        isReposted = await checkIfReposted(page)
        expect(isReposted).toBe(false)
      }
    )
  }
)
