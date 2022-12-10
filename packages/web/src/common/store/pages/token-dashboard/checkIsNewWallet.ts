import {
  Chain,
  getContext,
  tokenDashboardPageActions,
  tokenDashboardPageSelectors
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

const { getAssociatedWallets } = tokenDashboardPageSelectors
const { updateWalletError } = tokenDashboardPageActions

export function* checkIsNewWallet(walletAddress: string, chain: Chain) {
  const apiClient = yield* getContext('apiClient')
  const { connectedEthWallets, connectedSolWallets } = yield* select(
    getAssociatedWallets
  )

  console.log('geting here?')

  const associatedUserId = yield* call(
    [apiClient, apiClient.getAssociatedWalletUserId],
    {
      address: walletAddress
    }
  )

  console.log('geting here 2?')

  const associatedWallets =
    chain === Chain.Eth ? connectedEthWallets : connectedSolWallets

  console.log('geting here 3?')


  if (
    associatedUserId ||
    associatedWallets?.some(({ address }) => address === walletAddress)
  ) {
    // The wallet already exists in the associated wallets set
    yield* put(
      updateWalletError({
        errorMessage:
          'This wallet has already been associated with an Audius account.'
      })
    )
    return false
  }
  return true
}
