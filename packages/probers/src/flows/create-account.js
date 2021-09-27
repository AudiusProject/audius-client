import moment from 'moment'
import {
  waitForResponse,
  fillInput,
  waitForAndClickButton,
  waitForNetworkIdle2,
  wait,
  getEntropy
} from '../utils'
import { exportAccount } from '../utils/account-credentials'

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
  await waitForNetworkIdle2(page, page.goto(`${baseUrl}/signup`))
  // await new Promise(resolve => setTimeout(resolve, 5000)) // Allow time for js confirmation of pwd

  /** Email Page ... */
  // Fill in email, intercept email exists check request and hit continue
  const checkEmail = waitForResponse(page, '/users/check')
  await page.waitForSelector(`input[type='email']`, { timeout: 2000 })
  await fillInput(page, 'email', testUser.email)

  await waitForAndClickButton(page, 'continue')
  const checkEmailRes = await checkEmail
  if (checkEmailRes.exists !== false) throw new Error('email is in use')

  /** Password Page ... */
  // Fill in password twice
  await wait(500) // Allow time for transition
  await page.waitForSelector(`input[name='password']`, { timeout: 2000 })
  await fillInput(page, 'password', testUser.password)
  await fillInput(page, 'confirmPassword', testUser.password)

  

  await new Promise(resolve => setTimeout(resolve, 100)) // Allow time for js confirmation of pwd
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Profile Page ... */
  // Fill in name and handle
  await wait(500) // Allow time for transition
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
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Follow Page ... */
  // Select Followers and continue  
  await wait(1000) // Allow time for transition

  await page.waitForSelector(`div[class^=UserCard_cardContainer]`)
  const userCards = await page.$$('div[class^=UserCard_cardContainer]')
  for (let userCard of userCards.slice(0,5)) {
    await userCard.click()
  }
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Get The App Page ... */
  await wait(500) // Allow time for transition
  // Select "Continue"
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Loading Page ... */
  // nothing to test on the loading page

  /** Start Listening Page */
  await page.waitForXPath("//span[contains(text(), 'Start Listening')]", {
    timeout: 5 /* min */ * 60 /* sec */ * 1000 /* ms */
  })
  await waitForAndClickButton(page, 'startListening')

  // Export account so it can be re-used in other tests that don't want a fresh state
  const entropy = await getEntropy(page)
  exportAccount(testUser.email, testUser.password, entropy)

  testUser.entropy = entropy
  return testUser
}

export default createAccount
