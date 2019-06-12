import { waitForExit, waitForResponse, getRandomInt } from "../utils"
import getConfig from '../config'
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
      await page.setViewport({
        width: 1200,
        height: 800
      })

      await page.goto(config.baseUrl, { waitUntil: "networkidle2" })
      await page.evaluate(() => {
        localStorage.setItem("hedgehog-entropy-key", "")
        localStorage.setItem("betaPassword", "true")
      })
      await page.goto(`${config.baseUrl}/signup`, {
        waitUntil: "networkidle0"
      })
      await waitForExit(page, "div[class*=splashScreenWrapper]")
      testUser = await generateTestUser()
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it(
      "should fill out the signup flow inputs",
      async () => {
        /** Email Page ... */
        // Fill in email, intercept email exists check request and hit continue
        const checkEmail = waitForResponse(page, "/users/check")
        await page.waitForSelector(`input[name='email']`, { timeout: 2000 })
        await page.type(`input[name='email']`, testUser.email)
        const checkEmailRes = await checkEmail
        if (checkEmailRes.exists !== false) throw new Error("email is in use")

        let continueButton = await page.$(`button[name='continue']`)
        await continueButton.click()

        /** Password Page ... */
        // Fill in password twice
        await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
        await page.waitForSelector(`input[name='password']`, { timeout: 2000 })
        await page.type(`input[name='password']`, testUser.password)
        await page.type(`input[name='confirmPassword']`, testUser.password)

        await page.waitForSelector(
          `button[class*="primaryAlt"][name="continue"]`
        )
        continueButton = await page.$(
          `button[class*="primaryAlt"][name="continue"]`
        )
        await continueButton.click()

        /** Profile Page ... */
        // Fill in name and handle
        await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
        await page.waitForXPath(
          "//div[contains(text(), 'fill out my profile manually')]"
        )
        const manualProfileButtons = await page.$x(
          "//div[contains(text(), 'fill out my profile manually')]"
        )
        await manualProfileButtons[0].click()
        await page.type(`input[name='name']`, testUser.name)
        await page.type(`input[name='nickname']`, testUser.handle)
        await page.waitForSelector(
          `button[class*="primaryAlt"][name="continue"]`
        )
        continueButton = await page.$(
          `button[class*="primaryAlt"][name="continue"]`
        )
        await continueButton.click()

        /** Follow Page ... */
        // Select Followers and continue
        await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
        const userCards = await page.$$("div[class^=UserCard_cardContainer]")
        for (let userCard of userCards) {
          await userCard.click()
        }
        await page.waitForSelector(
          `button[class*="primaryAlt"][name="continue"]`
        )
        continueButton = await page.$(
          `button[class*="primaryAlt"][name="continue"]`
        )
        await continueButton.click()

        /** Loading Page ... */
        // nothing to test on the loading page

        /** Start Listening Page */
        await page.waitForXPath("//span[contains(text(), 'Start Listening')]", {
          timeout: 45000
        })
        const startListeningButton = await page.$(
          `button[name='startListening']`
        )
        await startListeningButton.click()
        await new Promise(resolve => setTimeout(resolve, 2000))

        const pageUrl = new URL(page.url())
        expect(pageUrl.pathname).toBe("/feed")
      },
      timeout
    )
  },
  timeout
)
