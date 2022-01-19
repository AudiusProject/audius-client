import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'

jest.retryTimes(3)

const config = getConfig()

describe('Smoke test -- track page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, `${config.baseUrl}`)
  })

  afterAll(async () => {
    await page.close()
  })

  it('should load a track page when visited', async () => {
    // Go to track url
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/${config.trackRoute}`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify that 'Track' label is present on page
    await page.waitForXPath("//div[starts-with(@class, 'GiantTrackTile_typeLabel') and normalize-space(text())='TRACK']")
  })
})
