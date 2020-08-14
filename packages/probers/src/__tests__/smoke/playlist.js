import getConfig from '../../config'
import { newPage, resetBrowser, waitForNetworkIdle2 } from '../../utils'

const config = getConfig()
const testTimeout = config.defaultTestTimeout
const actionTimeout = config.tenSeconds

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
    // Go to trending page
    await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/explore`))

    // Wait for explore page to load
    await page.waitForSelector(`div[class^=CascadingMenu_dropdownContainer]`, { timeout: actionTimeout })

    // Click the first playlist tile to go to a playlist page
    await Promise.all([
      page.click(`div[class^=CascadingMenu_dropdownContainer]`), // Redirects to track page
      page.waitForNavigation() // Resolves after navigations has finished
    ])

    // Verify that url has playlist in it
    expect(page.url()).toMatch(/playlist/)

    // Verify playlist label is present and that the play button is present
    await page.waitForXPath("//div[contains(@class, 'typeLabel') and normalize-space(text())='playlist']", { timeout: actionTimeout })
    const xPathToPlayButton = "//button[starts-with(@class, 'Button-module_button')]/span[starts-with(@class, 'Button-module_textLabel') and normalize-space(text())='PLAY']"
    await page.waitForXPath(xPathToPlayButton, { timeout: actionTimeout })
  }, testTimeout)
}, testTimeout)
