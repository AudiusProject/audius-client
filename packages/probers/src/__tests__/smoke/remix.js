import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'

const config = getConfig()
const testTimeout = config.defaultTestTimeout
const actionTimeout = config.tenSeconds

describe('Smoke test -- remix page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, `${config.baseUrl}`)
  }, testTimeout)

  afterAll(async () => {
    await page.close()
  })

  it('should load a remix page when visited', async () => {
    // Go to remix url
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/${config.remixRoute}`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify that 'REMIX' label is present on page
    await page.waitForXPath("//div[starts-with(@class, 'GiantTrackTile_typeLabel') and normalize-space(text())='REMIX']", { timeout: actionTimeout })
  }, testTimeout)
}, testTimeout)
