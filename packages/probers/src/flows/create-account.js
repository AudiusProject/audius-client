import { 
  waitForResponse, 
  getRandomInt, 
  waitForSplashScreen,
  fillInput,
  waitForAndClickButton
} from "../utils"
import getConfig from "../config"

const mockNames = [
  'Michael Scott',
  'Dwight Schrute',
  'Jim Halpert',
  'Pam Beesly',
  'Ryan Howard',
  'Andy Bernard',
  'Robert California',
  'Jan Levinson',
  'Roy Anderson',
  'Stanley Hudson',
  'Kevin Malone',
  'Meredith Palmer',
  'Angela Martin',
  'Oscar Martinez',
  'Phyllis Lapin',
  'Kelly Kapoor'
]

const generateTestUser = () => {
  let email = `test${Math.random()}@aduius${Math.random()}.co`
  let password = `Pa$$w0rdTest`
  let name = mockNames[Math.floor(Math.random()*mockNames.length)]  // Pick a random name from the list
  let handle = `${name.replace(/\s/g, '').slice(0, 9)}_${getRandomInt(999999)}` // Max length of 16
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
  await page.goto(`${baseUrl}/signup`, { waitUntil: "networkidle0" })
  await waitForSplashScreen(page)

  /** Email Page ... */
  // Fill in email, intercept email exists check request and hit continue
  const checkEmail = waitForResponse(page, "/users/check")
  await page.waitForSelector(`input[name='email']`, { timeout: 2000 })
  await fillInput(page, 'email', testUser.email)
  const checkEmailRes = await checkEmail
  if (checkEmailRes.exists !== false) throw new Error("email is in use")

  await waitForAndClickButton(page, 'continue')

  /** Password Page ... */
  // Fill in password twice
  await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
  await page.waitForSelector(`input[name='password']`, { timeout: 2000 })
  await fillInput(page, 'password', testUser.password)
  await fillInput(page, 'confirmPassword', testUser.password)

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
  await fillInput(page, 'name', testUser.name)
  await fillInput(page, 'nickname', testUser.handle)
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Follow Page ... */
  // Select Followers and continue
  await new Promise(resolve => setTimeout(resolve, 500)) // Allow time for transition
  await page.waitForSelector(`div[class^=UserCard_cardContainer]`)
  const userCards = await page.$$("div[class^=UserCard_cardContainer]")
  for (let userCard of userCards) {
    await userCard.click()
  }
  await waitForAndClickButton(page, 'continue', '[class*="primaryAlt"]')

  /** Loading Page ... */
  // nothing to test on the loading page

  /** Start Listening Page */
  await page.waitForXPath("//span[contains(text(), 'Start Listening')]", {
    timeout: 45000
  })
  await waitForAndClickButton(page, 'startListening')
  return testUser
}

export default createAccount