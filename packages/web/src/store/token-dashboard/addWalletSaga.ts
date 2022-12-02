import { tokenDashboardPageActions } from '@audius/common'
import { put, takeEvery } from 'typed-redux-saga'

import { associateNewWallet } from './associateNewWallet'
import { checkIsNewWallet } from './checkIsNewWallet'
import { establishWalletConnection } from './establishWalletConnection'
import { getWalletAddress } from './getWalletAddress'
import { getWalletInfo } from './getWalletInfo'
import { signMessage } from './signMessage'
import { transactAddWallet } from './transactAddWallet'
const { addWallet } = tokenDashboardPageActions

const { setIsConnectingWallet } = tokenDashboardPageActions

function* handleAddWallet() {
  const connection = yield* establishWalletConnection()
  if (!connection) return

  const { chain } = connection

  const walletAddress = yield* getWalletAddress(connection)
  if (!walletAddress) return

  const isNewWallet = yield* checkIsNewWallet(walletAddress)
  if (!isNewWallet) return

  const { balance, collectibleCount } = yield* getWalletInfo(
    walletAddress,
    chain
  )

  yield* put(
    setIsConnectingWallet({
      wallet: walletAddress,
      chain,
      balance,
      collectibleCount
    })
  )

  const signature = yield* signMessage(connection)
  const updatedUserMetadata = yield* associateNewWallet(
    walletAddress,
    signature
  )

  yield* transactAddWallet(updatedUserMetadata, () => {})
}

export function* watchAddwallet() {
  yield* takeEvery(addWallet, handleAddWallet)
}
