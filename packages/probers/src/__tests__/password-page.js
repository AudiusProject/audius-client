const timeout = 10000
import getConfig from '../config'

const pageValues = {
  password: "LOUD",
  listenText: "Start Listening!"
}

describe(
  "Input Password",
  () => {
    let page
    let startListeningButton
    let config = getConfig()

    beforeAll(async () => {
      page = await global.__BROWSER__.newPage()
      await page.goto(config.baseUrl, { waitUntil: "networkidle2" })
      await page.evaluate(() => {
        localStorage.removeItem("hedgehog-entropy-key")
        localStorage.removeItem("betaPassword")
      })
      await page.goto(config.baseUrl, { waitUntil: "networkidle2" })
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    it("should redirect the user to the password route", async () => {
      const url = page.url()
      const pageUrl = new URL(url)
      expect(pageUrl.pathname).toBe("/password")
    })

    it("should enter the password", async () => {
      await page.keyboard.type(pageValues.password)
      await page.waitForXPath(
        `//span[contains(text(), '${pageValues.listenText}')]`
      )
      const [startButton] = await page.$x(
        `//span[contains(text(), '${pageValues.listenText}')]`
      )
      expect(startButton).toBeTruthy()
      startListeningButton = startButton
    })

    it("should redirect to trending on start listening", async () => {
      await startListeningButton.click()
      await page.waitForNavigation({ waitUntil: "networkidle0" })

      const pageUrl = new URL(page.url())
      expect(pageUrl.pathname).toBe("/trending")
    })
  },
  timeout
)
