import { importAccount, exportAccount } from '../utils/account-credentials'
import chalk from 'chalk'
import { urlLogin, waitForNetworkIdle0 } from '../utils'
import createAccount from './create-account'
import args from '../args'


/**
 * Creates an account if necessary, otherwise reuses exported account credentials
 */
export const createAccountIfNecessary = async (page, baseUrl, route = 'trending') => {
  let account = null

  // Don't re-use an account if in idempotent mode
  if (!args.idempotent) {
    account = importAccount()
  }

  if (account && account.entropy) {
    await urlLogin(page, baseUrl, route, account.entropy)
    await waitForNetworkIdle0(page)
  } else {
    console.info(chalk.yellow('No account credentials to import'))
    await createAccount(page, baseUrl)
  }
}
