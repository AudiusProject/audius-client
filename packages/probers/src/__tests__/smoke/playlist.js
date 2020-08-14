import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle2 } from '../../utils'

const config = getConfig('staging')
const testTimeout = config.defaultTestTimeout
const actionTimeout = config.tenSeconds

describe('Smoke test -- playlist page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, `${config.baseUrl}`)
  }, testTimeout)

  afterAll(async () => {
    await page.close()
  })

  it('should load a playlist page when visited', async () => {
    // Go to playlist url
    await waitForNetworkIdle2(page, page.goto(`${config.playlistUrl}`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify 'playlist' label is present
    await page.waitForXPath("//div[contains(@class, 'typeLabel') and normalize-space(text())='playlist']", { timeout: actionTimeout })
  }, testTimeout)
}, testTimeout)
