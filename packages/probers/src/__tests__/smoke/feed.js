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
        await createSignedInAccountIfNecessary(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
        await page.close()
    })

    it('should load feed page when visited', async () => {
        await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/feed`))
        await page.waitForXPath("//h1[contains(text(), 'Feed')]")        
    }, timeout)
}, timeout)