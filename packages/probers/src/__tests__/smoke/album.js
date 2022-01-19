import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'

jest.retryTimes(3)

const config = getConfig()
const actionTimeout = config.tenSeconds

describe('Smoke test -- album page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, `${config.baseUrl}`)
  })

  afterAll(async () => {
    await page.close()
  })

  it('should load an album page when visited', async () => {
    // Go to album url
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/${config.albumRoute}`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify 'album' label is present
    await page.waitForXPath("//div[starts-with(@class, 'CollectionHeader_typeLabel') and normalize-space(text())='album']", { timeout: actionTimeout })
  })
})
