const pageValues = {
  password: "LOUD",
  listenText: "Start Listening!"
}

export const fillBetaPassword = async (page, baseUrl) => {

  // Be sure to be on the password page
  await page.goto(`${baseUrl}/password`, { waitUntil: "networkidle0" })

  // Enter the password
  await page.keyboard.type(pageValues.password)

  // Wait for the success button to appear and hit it
  await page.waitForXPath(`//span[contains(text(), '${pageValues.listenText}')]`)
  const buttons = await page.$x(`//span[contains(text(), '${pageValues.listenText}')]`)
  const [startButton] = buttons
  await startButton.click()
  await page.waitForNavigation({ waitUntil: "networkidle0" })
}


export default fillBetaPassword