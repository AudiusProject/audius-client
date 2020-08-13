import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle2 } from '../../utils'
import { createSignedInAccountIfNecessary } from '../../flows/create-account-if-necessary'

const config = getConfig()
const timeout = config.defaultTestTimeout

describe('Smoke test -- feed page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, config.baseUrl)
  }, timeout)

  afterAll(async () => {
    await page.close()
  })

  it('should load feed page when visited', async () => {
    // load trending page not signed in
    await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/trending`))
    await page.waitForXPath("//h1[contains(text(), 'Trending')]")

    // sign in
    await createSignedInAccountIfNecessary(page, config.baseUrl)

    // load trending page signed in
    await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/trending`))
    await page.waitForXPath("//h1[contains(text(), 'Trending')]")
  }, timeout)
}, timeout)
