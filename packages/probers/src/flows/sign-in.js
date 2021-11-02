import { waitForNetworkIdle0, fillInput, waitForAndClickButton } from "../utils"

export const signIn = async (page, baseUrl, { email, password }) => {
  // Go to the signin page
  await waitForNetworkIdle0(page, page.goto(`${baseUrl}/signin`))

  await page.waitForSelector(`input[type='email']`, { timeout: 2000 })
  await fillInput(page, 'email', email)

  await page.waitForSelector(`input[name='password']`, { timeout: 2000 })
  await fillInput(page, 'password', password)

  await waitForAndClickButton(page, 'sign-in')
}
