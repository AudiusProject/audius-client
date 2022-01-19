import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle0 } from '../../utils'
import { createSignedInAccountIfNecessary } from '../../flows/create-account-if-necessary'

jest.retryTimes(3)

const config = getConfig()

describe('Smoke test -- feed page', () => {
  let page

  beforeAll(async () => {
    page = await newPage()
    await resetBrowser(page, config.baseUrl)
    await createSignedInAccountIfNecessary(page, config.baseUrl)
  })

  afterAll(async () => {
    await page.close()
  })

  it('should load feed page when visited', async () => {
    // Visit feed page
    await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/feed`))

    // Verify that page url is not 404 nor error
    expect(page.url()).not.toMatch(/(error|404)/)

    // Verify that 'Feed' label is present
    await page.waitForXPath("//h1[contains(text(), 'Feed')]")
  })
})
