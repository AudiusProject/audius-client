import { audiusLibs, waitForLibsInit } from './libs'

export const createStripeSession = async ({
  destinationWallet,
  amount
}: {
  destinationWallet: string
  amount: string
}) => {
  await waitForLibsInit()
  return await audiusLibs?.identityService?.createStripeSession({
    destinationWallet,
    amount
  })
}
