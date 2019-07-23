import moment from 'moment'
import {
  waitForResponse,
  waitForSplashScreen,
  fillInput,
  waitForAndClickButton,
  waitForNetworkIdle2
} from '../utils'

const generateTestUser = () => {
  const ts = moment().format('YYMMDD_HHmmss')
  let email = `prober+${ts}@audius.co`
  let password = `Pa$$w0rdTest`
  let name = `Prober ${ts}`
  let handle = `p_${ts}`
  return {
    email,
    password,
    name,
    handle
  }
}

export const createAccount = async (page, baseUrl) => {
  let testUser = generateTestUser()
  // Go to the signup page
  await waitForSplashScreen(page)
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/signup`))

  /** Email Page ... */
  // Fill in email, intercept email exists check request and hit continue
  const checkEmail = waitForResponse(page, '/users/check')
  await page.waitForSelector(`input[name='email']`, { timeout: 2000 })
  await fillInput(page, 'email', testUser.email)
  const checkEmailRes = await checkEmail
  if (checkEmailRes.exists !== false) throw new Error('email is in use')

  await waitForAndClickButton(page, 'continue')

  /** Password Page ... */
  // Fill in password twice
  await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
  await page.waitForSelector(`input[name='password']`, { timeout: 2000 })
  await fillInput(page, 'password', testUser.password)
  await fillInput(page, 'confirmPassword', testUser.password)

  await new Promise(resolve => setTimeout(resolve, 100)) // Allow time for js confirmation of pwd
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

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
  waitForResponse(page, '/twitter/handle_lookup')
  await fillInput(page, 'name', testUser.name)
  await fillInput(page, 'nickname', testUser.handle)
  await checkEmail
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Follow Page ... */
  // Select Followers and continue
  await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
  await page.waitForSelector(`div[class^=UserCard_cardContainer]`)
  const userCards = await page.$$('div[class^=UserCard_cardContainer]')
  for (let userCard of userCards) {
    await userCard.click()
  }
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Loading Page ... */
  // nothing to test on the loading page

  /** Start Listening Page */
  await page.waitForXPath("//span[contains(text(), 'Start Listening')]", {
    timeout: 90 /* sec */ * 1000 /* ms */
  })
  await waitForAndClickButton(page, 'startListening')
  return testUser
}

export default createAccount
