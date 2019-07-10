/* global localStorage */

import {
  waitForNetworkIdle2
} from '../utils'

const pageValues = {
  password: 'LOUD',
  listenText: 'Start Listening!'
}

export const fillBetaPassword = async (page, baseUrl) => {
  // Be sure to be on the password page
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/password`))

  // Go to beta password page
  await page.waitForXPath("//span[contains(text(), 'Click Here')]")
  const gotoBetaPassword = await page.$x(
    "//span[contains(text(), 'Click Here')]"
  )
  await gotoBetaPassword[0].click()

  // Wait for Password input
  await page.waitForXPath(
    "//div[contains(text(), 'Password Required To Continue')]"
  )

  // Enter the password
  await page.keyboard.type(pageValues.password)

  // Wait for the success button to appear and hit it
  await page.waitForXPath(
    `//span[contains(text(), '${pageValues.listenText}')]`
  )
  const buttons = await page.$x(
    `//span[contains(text(), '${pageValues.listenText}')]`
  )
  const [startButton] = buttons
  await startButton.click()
  await waitForNetworkIdle2(page, page.waitForNavigation)
}

export const skipBetaPassword = async page => {
  await page.evaluate(() => {
    localStorage.setItem('betaPassword', 'true')
  })
}

export default fillBetaPassword
