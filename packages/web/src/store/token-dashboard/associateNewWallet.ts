import {
  accountSelectors,
  getContext,
  newUserMetadata,
  tokenDashboardPageActions
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

import { upgradeToCreator } from 'common/store/cache/users/sagas'
import { fetchServices } from 'common/store/service-selection/slice'
const { getAccountUser } = accountSelectors
const { updateWalletError } = tokenDashboardPageActions

export function* associateNewWallet(walletAddress: string, signature: string) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
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
          errorMessage:
            'An error occured while connecting a wallet with your account.'
        })
      )
      return
    }
    const updatedUserMetadata = yield* select(getAccountUser)
    updatedMetadata = newUserMetadata({ ...updatedUserMetadata })
  }

  const currentWalletSignatures = yield* call(
    audiusBackendInstance.fetchUserAssociatedEthWallets,
    updatedMetadata
  )
  updatedMetadata.associated_wallets = {
    ...(currentWalletSignatures || {}),
    [walletAddress]: { signature }
  }

  return updatedMetadata
}
