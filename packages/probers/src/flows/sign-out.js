const { waitForNetworkIdle0, wait, waitForAndClickButton } = require("../utils")

export const signOut = async (page, baseUrl) => {
  // Go to the settings page
  await waitForNetworkIdle0(page, page.goto(`${baseUrl}/settings`))

  await waitForAndClickButton(page, 'sign-out')

  // Wait for confirmation popup
  await wait(2000)

  await waitForAndClickButton(page, 'confirm-sign-out')

  await waitForNetworkIdle0(page)
}