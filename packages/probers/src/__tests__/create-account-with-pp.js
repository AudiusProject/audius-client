import {
  newPage,
  resetBrowser,
  waitForAndClickButton,
  waitForNetworkIdle2
} from '../utils'
import getConfig from '../config'
import createAccount from '../flows/create-account'

let config = getConfig()

describe(
  'Create Account',
  () => {
    let page

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
    }, config.defaultTestTimeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      'should fill out the signup flow inputs',
      async () => {
        const user = await createAccount(page, config.baseUrl, true)
        await waitForNetworkIdle2(page, page.goto(`${config.baseUrl}/${user.handle}`))
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).toBe(`/${user.handle}`)
      },
      config.uploadProfilePictureTimeout
    )
  },
  config.defaultTestTimeout
)
