import getConfig from '../config'
import { newPage, resetBrowser } from '../utils'
import { createSignedOutAccountIfNecessary } from '../flows/create-account-if-necessary'
import { signIn } from '../flows/sign-in'

const config = getConfig()

describe(
  'Sign In',
  () => {
    let page
    let account

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      account = await createSignedOutAccountIfNecessary(page, config.baseUrl)
    }, config.defaultTestTimeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      'should be able to sign in',
      async () => {
        await signIn(page, config.baseUrl, {
          email: account.email,
          password: account.password
        })
        await page.waitForSelector('div[class^=NavColumn_name]')
        const entropy = await page.evaluate(() => localStorage.getItem('hedgehog-entropy-key'))
        expect(entropy).toBe(account.entropy)
      },
      config.defaultTestTimeout
    )
  },
  config.defaultTestTimeout
)
