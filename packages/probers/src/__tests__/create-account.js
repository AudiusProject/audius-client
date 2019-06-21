import { 
  waitForResponse, 
  getRandomInt, 
  waitForSplashScreen,
  resetBrowser
} from "../utils"
import getConfig from "../config"
import createAccount from '../flows/create-account'
import fillBetaPassword from '../flows/fill-beta-password'

// Allow a max time of 2 minutes to create an account and run the test
const timeout = 1000 /** ms */ * 60 /** sec */ * 2 /** min */

const generateTestUser = async () => {
  let email = `test${Math.random()}@aduius.co`
  let password = `Pa$$w0rdTest`
  let name = `George`
  let handle = `test${getRandomInt(9999)}`
  return {
    email,
    password,
    name,
    handle
  }
}

describe(
  "Create Account",
  () => {
    let page
    let testUser
    let config = getConfig()

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.setViewport({ width: 1600, height: 1080 })
      await resetBrowser(page, config.baseUrl)
      await fillBetaPassword(page, config.baseUrl)
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      "should fill out the signup flow inputs",
      async () => {
        const user = await createAccount(page, config.baseUrl)

        await page.goto(`${config.baseUrl}/${user.handle}`, { waitUntil: "networkidle0" })
        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).toBe(`/${user.handle}`)
      },
      timeout
    )
  },
  timeout
)
