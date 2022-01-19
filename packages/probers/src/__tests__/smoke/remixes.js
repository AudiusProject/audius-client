import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'

jest.retryTimes(3)

const config = getConfig()
const actionTimeout = config.tenSeconds

describe('Smoke test -- remixes page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, `${config.baseUrl}`)
  })

  afterAll(async () => {
    await page.close()
  })

  it('should load a remixes page when visited', async () => {
    // Go to remixes url
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/${config.remixesRoute}`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify that 'REMIX' label is present on page
    await page.waitForXPath("//span[normalize-space(text())='Remixes']", { timeout: actionTimeout })
  })
})
