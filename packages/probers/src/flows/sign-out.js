const { waitForNetworkIdle2, wait, waitForAndClickButton } = require("../utils")

export const signOut = async (page, baseUrl) => {
  // Go to the settings page
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/settings`))

  await waitForAndClickButton(page, 'sign-out')

  // Wait for animation
  await wait(500)

  await waitForAndClickButton(page, 'confirm-sign-out')

  await waitForNetworkIdle2(page)
}