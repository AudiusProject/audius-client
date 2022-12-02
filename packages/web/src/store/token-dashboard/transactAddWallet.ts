import {
  accountSelectors,
  cacheActions,
  getContext,
  Kind,
  tokenDashboardPageActions,
  tokenDashboardPageSelectors,
  User,
  walletActions
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

import { requestConfirmation } from 'common/store/confirmer/actions'
import { confirmTransaction } from 'common/store/confirmer/sagas'

import { getAccountMetadataCID } from './getAccountMetadataCID'
const { getUserId } = accountSelectors
const { getBalance } = walletActions
const { setWalletAddedConfirmed, updateWalletError } = tokenDashboardPageActions
const { getConfirmingWallet } = tokenDashboardPageSelectors

const CONNECT_WALLET_CONFIRMATION_UID = 'CONNECT_WALLET'

export function* transactAddWallet(
  updatedMetadata: User,
  disconnect: () => void
) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const accountUserId = yield* select(getUserId)
  if (!accountUserId) return

  function* transactMetadata() {
    const result = yield* call(
      audiusBackendInstance.updateCreator,
      updatedMetadata,
      accountUserId!
    )
    if (!result) {
      return
    }
    const { blockHash, blockNumber } = result

    const confirmed = yield* call(confirmTransaction, blockHash, blockNumber)
    if (!confirmed) {
      throw new Error(
        `Could not confirm connect wallet for account user id ${accountUserId}`
      )
    }

    const updatedWallets = updatedMetadata.associated_sol_wallets
    return Object.keys(updatedWallets)
  }

  function* onSuccess() {
    const confirmingWallet = yield* select(getConfirmingWallet)
    const {
      wallet: walletAddress,
      balance,
      collectibleCount,
      chain
    } = confirmingWallet
    if (!walletAddress || !balance || !collectibleCount || !chain) return
    // Update the user's balance w/ the new wallet
    yield* put(getBalance())

    yield* put(
      setWalletAddedConfirmed({
        wallet: walletAddress,
        balance,
        collectibleCount,
        chain
      })
    )
    const updatedCID = yield* call(getAccountMetadataCID)
    if (updatedCID) {
      yield* put(
        cacheActions.update(Kind.USERS, [
          {
            id: accountUserId,
            metadata: { metadata_multihash: updatedCID }
          }
        ])
      )
    }
    // Disconnect the web3 instance because after we've linked, we no longer need it
    yield* call(disconnect)
  }

  function* onError() {
    yield* put(
      updateWalletError({
        errorMessage:
          'An error occured while connecting a wallet with your account.'
      })
    )
    // Disconnect the web3 instance in the event of an error, we no longer need it
    yield* call(disconnect)
  }

  yield* put(
    requestConfirmation(
      CONNECT_WALLET_CONFIRMATION_UID,
      transactMetadata,
      onSuccess,
      onError
    )
  )
}
