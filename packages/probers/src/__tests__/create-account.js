import {
  newPage,
  resetBrowser,
  waitForNetworkIdle2
} from '../utils'
import getConfig from '../config'
import createAccount from '../flows/create-account'
import fillBetaPassword from '../flows/fill-beta-password'

// Allow a max time of 2 minutes to create an account and run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 2 /** min */

describe(
  'Create Account',
  () => {
    let page
    let config = getConfig()

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      await fillBetaPassword(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      'should fill out the signup flow inputs',
      async () => {
        const user = await createAccount(page, config.baseUrl)

        await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/${user.handle}`))
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).toBe(`/${user.handle}`)
      },
      timeout
    )
  },
  timeout
)
