import { importAccount } from '../utils/account-credentials'
import chalk from 'chalk'
import { urlLogin, resetBrowser, waitForNetworkIdle0 } from '../utils'
import createAccount from './create-account'
import args from '../args'

/**
 * Creates an account if necessary, otherwise reuses exported account credentials
 * By default, this also signs the account in to Audius. This behavior can be modified
 * with the `signIn` param.
 * @param page
 * @param baseUrl
 * @param {Boolean} signIn whether or not to be signed in after account retrieval
 * @param {String} route to visit after creating the account
 */
const createAccountIfNecessary = async (
  page,
  baseUrl,
  signIn,
  route
) => {
  console.log("creating signed in account")
  let account = null

  // Don't re-use an account if in idempotent mode
  if (!args.idempotent) {
    account = importAccount()
  }

  if (account && account.entropy) {
    if (signIn) {
      await urlLogin(page, baseUrl, route, account.entropy)
      // This "DON'T MISS A THING!" modal might pop up. Close it if so
      await clickOutOfNotificationsModalIfNecessary(page)
    }
  } else {
    console.info(chalk.yellow('No account credentials to import'))
    account = await createAccount(page, baseUrl)
    if (!signIn) {
      // Reset the browser state after making the account if we don't want to be signed in
      await resetBrowser(page, baseUrl)
    }
  }
  waitForNetworkIdle0(page)

  return account
}

/**
 * Creates an account if necessary that's signed in after the account is
 * created.
 * @param page
 * @param baseUrl
 * @param {String} route to visit after creating the account
 */
export const createSignedInAccountIfNecessary = async (
  page,
  baseUrl,
  route = 'trending'
) => {
  return createAccountIfNecessary(page, baseUrl, true, route)
}

/**
 * Creates an account if necessary that's signed out after the account is
 * created.
 * @param page
 * @param baseUrl
 * @param {String} route to visit after creating the account
 */
export const createSignedOutAccountIfNecessary = async (
  page,
  baseUrl,
  route = 'trending'
) => {
  return createAccountIfNecessary(page, baseUrl, false, route)
}

export const clickOutOfNotificationsModalIfNecessary = async (page) => {
  try {
    const dontMissAThingX = await page.waitForXPath("//div[contains(@class, 'Modal-module_dismissButton')]")
    await dontMissAThingX.click()
  } catch (e) {
    // swallow error -- perhaps the modal did not appear
  }
}
