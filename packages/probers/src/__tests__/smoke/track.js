import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle2 } from '../../utils'

const config = getConfig()
const testTimeout = config.defaultTestTimeout
const actionTimeout = config.tenSeconds

describe('Smoke test -- track page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, `${config.baseUrl}`)
  }, testTimeout)

  afterAll(async () => {
    await page.close()
  })

  it('should load a track page when visited', async () => {
    // Go to trending page
    await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/trending`))

    // Wait for trending page track tile to load
    await page.waitForSelector(`span[class^=TrackTile_title]`, { timeout: actionTimeout })

    // Click the first track tile to go to a track page
    await Promise.all([
      page.click(`span[class^=TrackTile_title]`), // Redirects to track page
      page.waitForNavigation() // Resolves after navigations has finished
    ])

    // Verify track page loaded with track tile and play button
    await page.waitForXPath("//button[contains(@class, 'playButton')]", { timeout: actionTimeout })
    await page.waitForXPath("//div[starts-with(@class, 'GiantTrackTile')]", { timeout: actionTimeout })
  }, testTimeout)
}, testTimeout)
