import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'
import { createSignedInAccountIfNecessary } from '../../flows/create-account-if-necessary'

jest.retryTimes(3)

const config = getConfig()

describe('Smoke test -- upload page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, config.baseUrl)
    await createSignedInAccountIfNecessary(page, config.baseUrl)
  })

  afterAll(async () => {
    await page.close()
  })

  it('should load upload page when visited', async () => {
    // Visit upload page
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/upload`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify that 'Upload Tracks' label is present
    await page.waitForXPath("//h1[contains(text(), 'Upload Tracks')]")
  })
})
