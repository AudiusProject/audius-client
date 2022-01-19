import getConfig from '../config'
import { newPage, resetBrowser } from '../utils'
import { createSignedInAccountIfNecessary } from '../flows/create-account-if-necessary'
import { signOut } from '../flows/sign-out'

jest.retryTimes(3)

const config = getConfig()

describe(
  'Sign out',
  () => {
    let page
    let account

    beforeAll(async () => {
      page = await newPage()
      await resetBrowser(page, config.baseUrl)
      account = await createSignedInAccountIfNecessary(page, config.baseUrl)
    })

    afterAll(async () => {
      await page.close()
    })

    it(
      'should be able to sign out',
      async () => {
        const initialEntropy = await page.evaluate(() => localStorage.getItem('hedgehog-entropy-key'))
        expect(initialEntropy).toBe(account.entropy)

        await signOut(page, config.baseUrl)

        const entropy = await page.evaluate(() => localStorage.getItem('hedgehog-entropy-key'))
        // Make sure the account entropy has changed
        expect(entropy).not.toBe(account.entropy)
      }
    )
  }
)
