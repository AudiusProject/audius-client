import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'

const config = getConfig()
const timeout = config.defaultTestTimeout

describe('Smoke test -- trending page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, config.baseUrl)
  }, timeout)

  afterAll(async () => {
    await page.close()
  })

  it('should load trending page when visited', async () => {
    // Go to trending page
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/trending`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify that 'Trending' label is present on page
    await page.waitForXPath("//h1[contains(text(), 'Trending')]")
  }, timeout)
}, timeout)
