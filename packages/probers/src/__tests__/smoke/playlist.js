import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'

const config = getConfig()
const testTimeout = config.defaultTestTimeout

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
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/${config.playlistRoute}`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify 'playlist' label is present
    await page.waitForXPath("//div[contains(@class, 'typeLabel') and normalize-space(text())='playlist']")
  }, testTimeout)
}, testTimeout)
