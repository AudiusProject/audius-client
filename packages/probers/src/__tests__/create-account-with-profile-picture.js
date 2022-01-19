import {
  newPage,
  resetBrowser,
  waitForAndClickButton,
  waitForNetworkIdle0
} from '../utils'
import getConfig from '../config'
import createAccount from '../flows/create-account'

jest.retryTimes(3)

let config = getConfig()

describe(
  'Create Account',
  () => {
    let page

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
    })

    afterAll(async () => {
      await page.close()
    })

    it(
      'should fill out the signup flow inputs',
      async () => {
        const user = await createAccount(page, config.baseUrl, true)
        await waitForNetworkIdle0(page, page.goto(`${config.baseUrl}/${user.handle}`))
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).toBe(`/${user.handle}`)
      }
    )
  }
)
