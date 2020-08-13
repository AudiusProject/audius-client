import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle2 } from '../../utils'

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
    await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/trending`))
    await page.waitForXPath("//h1[contains(text(), 'Trending')]")
  }, timeout)
}, timeout)
