import {
  accountSelectors,
  cacheActions,
  getContext,
  Kind,
  tokenDashboardPageActions,
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

const CONNECT_WALLET_CONFIRMATION_UID = 'CONNECT_WALLET'

export function* addWalletToUser(
  updatedMetadata: User,
  disconnect: () => Generator
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
    console.log('result?', result)
    if (!result) {
      throw new Error(
        `Could not confirm connect wallet for account user id ${accountUserId}`
      )
    }

    const { blockHash, blockNumber } = result

    const confirmed = yield* call(confirmTransaction, blockHash, blockNumber)

    console.log('confirmed', confirmed)

    if (!confirmed) {
      throw new Error(
        `Could not confirm connect wallet for account user id ${accountUserId}`
      )
    }
  }

  function* onSuccess() {
    console.log('success!!')
    // Update the user's balance w/ the new wallet
    yield* put(getBalance())

    yield* put(setWalletAddedConfirmed({}))

    const updatedCID = yield* call(getAccountMetadataCID)
    console.log('success!', updatedCID)

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
