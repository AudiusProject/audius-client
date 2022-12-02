import {
  accountSelectors,
  cacheActions,
  Chain,
  getContext,
  Kind,
  newUserMetadata,
  tokenDashboardPageActions,
  tokenDashboardPageSelectors,
  walletActions
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

import { upgradeToCreator } from 'common/store/cache/users/sagas'
import { requestConfirmation } from 'common/store/confirmer/actions'
import { confirmTransaction } from 'common/store/confirmer/sagas'
import { fetchServices } from 'common/store/service-selection/slice'
import { waitForBackendAndAccount } from 'utils/sagaHelpers'

import { getAccountMetadataCID } from './utils'

const { getBalance } = walletActions

const { getConfirmingWallet } = tokenDashboardPageSelectors
const { updateWalletError, setWalletAddedConfirmed } = tokenDashboardPageActions

const { getUserId, getAccountUser } = accountSelectors

const CONNECT_WALLET_CONFIRMATION_UID = 'CONNECT_WALLET'

const generalWalletErrorMessage =
  'An error occured while connecting a wallet with your account.'

export function* addNewSplWallet() {
  const confirmingWallet = yield* select(getConfirmingWallet)
  const { signature, wallet, balance } = confirmingWallet
  console.log('adding new spl wallet', signature, wallet, balance)
  if (!wallet) {
    yield* put(
      updateWalletError({
        errorMessage:
          'An error occured while connecting a wallet with your account.'
      })
    )
    return
  }
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const accountUserId = yield* select(getUserId)

  yield* waitForBackendAndAccount()
  const userMetadata = yield* select(getAccountUser)
  let updatedMetadata = newUserMetadata({ ...userMetadata })

  if (
    !updatedMetadata.creator_node_endpoint ||
    !updatedMetadata.metadata_multihash
  ) {
    yield* put(fetchServices())
    const upgradedToCreator = yield* call(upgradeToCreator)
    if (!upgradedToCreator) {
      yield* put(
        updateWalletError({
          errorMessage: generalWalletErrorMessage
        })
      )
      return
    }
    const updatedUserMetadata = yield* select(getAccountUser)
    updatedMetadata = newUserMetadata({ ...updatedUserMetadata })
  }

  const currentWalletSignatures = yield* call(
    audiusBackendInstance.fetchUserAssociatedSolWallets,
    updatedMetadata
  )
  updatedMetadata.associated_sol_wallets = {
    ...(currentWalletSignatures || {}),
    [wallet]: { signature }
  }

  if (!accountUserId) {
    return
  }

  yield* put(
    requestConfirmation(
      CONNECT_WALLET_CONFIRMATION_UID,
      function* () {
        const result = yield* call(
          audiusBackendInstance.updateCreator,
          updatedMetadata,
          accountUserId
        )
        console.log('gettong update result?', result)
        if (!result) {
          return
        }
        const { blockHash, blockNumber } = result

        const confirmed = yield* call(
          confirmTransaction,
          blockHash,
          blockNumber
        )
        if (!confirmed) {
          throw new Error(
            `Could not confirm connect wallet for account user id ${accountUserId}`
          )
        }

        const updatedWallets = updatedMetadata.associated_sol_wallets
        return Object.keys(updatedWallets)
      },
      // @ts-ignore: remove when confirmer is typed
      function* (updatedWallets: WalletAddress[]) {
        // Update the user's balance w/ the new wallet
        yield* put(getBalance())

        console.log('confirmed!')

        yield* put(
          setWalletAddedConfirmed({
            wallet,
            balance,
            collectibleCount: 0,
            chain: Chain.Sol
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
        // // Disconnect the web3 instance because after we've linked, we no longer need it
        // yield* call(disconnect)
      },
      function* () {
        yield* put(
          updateWalletError({
            errorMessage: generalWalletErrorMessage
          })
        )
        // // Disconnect the web3 instance in the event of an error, we no longer need it
        // yield* call(disconnect)
      }
    )
  )
}
