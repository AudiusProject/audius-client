import { delay } from 'redux-saga'
import { select } from 'redux-saga-test-plan/matchers'
import { all, call, put, race, take, takeLatest } from 'redux-saga/effects'
import {
  fetchAssociatedWallets,
  connectNewWallet,
  removeWallet as removeWalletAction,
  pressSend,
  setModalState,
  setModalVisibility,
  ModalState,
  inputSendData,
  confirmSend,
  getSendData,
  setDiscordCode,
  setIsConnectingWallet,
  setAssociatedWallets,
  confirmRemoveWallet,
  ConfirmRemoveWalletAction,
  getAssociatedWallets,
  AssociatedWalletsState,
  updateWalletError
} from './slice'
import {
  send as walletSend,
  claimFailed,
  weiToString,
  sendSucceeded,
  getBalance,
  sendFailed,
  WalletAddress
} from 'store/wallet/slice'
import { FETCH_DASHBOARD } from 'containers/artist-dashboard-page/store/actions'
import { requestConfirmation } from 'store/confirmer/actions'
import AudiusBackend, { fetchCID } from 'services/AudiusBackend'
import apiClient, {
  AssociatedWalletsResponse
} from 'services/audius-api-client/AudiusAPIClient'
import { getUserId, getAccountUser } from 'store/account/selectors'
import { Nullable } from 'utils/typeUtils'
import { ID } from 'models/common/Identifiers'
import connectWeb3Wallet from 'services/web3-modal/index'
import { newUserMetadata } from 'schemas'

import { getCreatorNodeIPFSGateways } from 'utils/gatewayUtil'
import { upgradeToCreator } from 'store/cache/users/sagas'
import * as cacheActions from 'store/cache/actions'
import { Kind } from 'store/types'

const CONNECT_WALLET_CONFIRMATION_UID = 'CONNECT_WALLET'

function* send() {
  // Set modal state to input
  const inputStage: ModalState = {
    stage: 'SEND',
    flowState: {
      stage: 'INPUT'
    }
  }
  yield all([
    put(setModalVisibility({ isVisible: true })),
    put(setModalState({ modalState: inputStage }))
  ])

  // Await input + confirmation
  yield take(inputSendData.type)
  yield take(confirmSend.type)

  // Send the txn, update local balance
  const sendData: ReturnType<typeof getSendData> = yield select(getSendData)
  if (!sendData) return
  const { recipientWallet, amount } = sendData
  yield put(walletSend({ recipientWallet, amount: weiToString(amount) }))

  const { error }: { error: ReturnType<typeof claimFailed> } = yield race({
    success: take(sendSucceeded),
    error: take(sendFailed)
  })

  if (error) {
    const errorState: ModalState = {
      stage: 'SEND',
      flowState: {
        stage: 'ERROR',
        error: error.payload.error ?? ''
      }
    }
    yield put(setModalState({ modalState: errorState }))
    return
  }

  // Set modal state + new token + claim balances
  const sentState: ModalState = {
    stage: 'SEND',
    flowState: {
      stage: 'CONFIRMED_SEND',
      amount: weiToString(amount),
      recipientWallet
    }
  }
  yield put(setModalState({ modalState: sentState }))
}

function* fetchAccountAssociatedWallets() {
  const accountUserId: Nullable<ID> = yield select(getUserId)
  if (!accountUserId) return
  const associatedWallets: AssociatedWalletsResponse = yield apiClient.getAssociatedWallets(
    {
      userID: accountUserId
    }
  )
  yield put(
    setAssociatedWallets({ associatedWallets: associatedWallets.wallets })
  )
}

function* getAccountMetadataCID(): Generator<any, Nullable<string>, any> {
  const accountUserId: Nullable<ID> = yield select(getUserId)
  if (!accountUserId) return null
  const users: any[] = yield call(AudiusBackend.getCreators, [accountUserId])
  if (users.length !== 1) return null
  return users[0].metadata_multihash
}

/**
 * Retrieves the user's associated wallets from IPFS using the user's metadata CID and creator node endpoints
 * @param {Object} user The user metadata which contains the CID for the metadata multihash
 * @returns Object The associated wallets mapping of address to nested signature
 */
function* fetchUserAssociatedWallets(user: any) {
  const gateways = getCreatorNodeIPFSGateways(user.creator_node_endpoint)
  const cid = user?.metadata_multihash ?? null
  if (cid) {
    const metadata: any = yield call(
      fetchCID,
      cid,
      gateways,
      /* cache */ false,
      /* asUrl */ false
    )
    console.log({ metadata })
    if (metadata?.associated_wallets) {
      return metadata.associated_wallets
    } else {
      // TODO
      console.log('something went wrong, could not get user associated wallets')
    }
  }
  return {}
}

// The confirmer's polling interval
const POLLING_FREQUENCY_MILLIS = 2000

/**
 * Compare the user's updated associated wallets against the wallets returned from discovery service
 * @param {number} userID The user ID to fetch associated wallets for from discovery service
 * @param {Object} currrentWallets A map of wallet addresses to signature
 * @returns boolean
 */
function* compareIndexedWallets(
  userID: ID,
  currrentWallets: Record<string, any> = {}
): Generator<any, boolean, any> {
  const associatedWallets: AssociatedWalletsResponse = yield apiClient.getAssociatedWallets(
    { userID }
  )
  const indexedWallets = associatedWallets.wallets
  return (
    indexedWallets.length === Object.keys(currrentWallets).length &&
    indexedWallets.every(wallet => wallet in currrentWallets)
  )
}

function* connectWallet() {
  try {
    const web3Instance: any = yield connectWeb3Wallet()

    if (!web3Instance) {
      yield put(updateWalletError({ errorMessage: 'Unable to connect wallet' }))
      // The user may have exited the modal
      return
    }

    const accounts: string[] = yield web3Instance.eth.getAccounts()
    const accountUserId: Nullable<ID> = yield select(getUserId)
    const connectingWallet = accounts[0]

    const currentAssociatedWallets: AssociatedWalletsState = yield select(
      getAssociatedWallets
    )

    if (
      (currentAssociatedWallets?.connectedWallets ?? []).some(
        wallet => wallet === connectingWallet
      )
    ) {
      // The wallet already exists in the assocaited wallets set
      console.log('wallet exists')
      yield put(updateWalletError({ errorMessage: 'Unable to connect wallet' }))
      return
    }

    yield put(setIsConnectingWallet({ wallet: connectingWallet }))
    const signature: string = yield web3Instance.eth.personal.sign(
      `AudiusUserID:${accountUserId}`,
      accounts[0]
    )
    const userMetadata: any = yield select(getAccountUser)
    const updatedMetadata = newUserMetadata({ ...userMetadata })

    if (
      !updatedMetadata.creator_node_endpoint ||
      !updatedMetadata.metadata_multihash
    ) {
      const upgradedToCreator: boolean = yield call(upgradeToCreator)
      if (!upgradedToCreator) {
        console.log('unable to upgrade user to creator')
        yield put(
          updateWalletError({ errorMessage: 'Unable to connect wallet' })
        )
        return
      }
    }

    const currentWalletSignatures: Record<string, any> = yield call(
      fetchUserAssociatedWallets,
      updatedMetadata
    )
    console.log({ currentWalletSignatures })
    updatedMetadata.associated_wallets = {
      ...currentWalletSignatures,
      [connectingWallet]: { signature }
    }

    yield call(AudiusBackend.updateCreator, updatedMetadata, accountUserId)
    yield put(
      requestConfirmation(
        CONNECT_WALLET_CONFIRMATION_UID,
        function* () {
          const updatedWallets = updatedMetadata.associated_wallets
          let equivalentIndexedWallets: any = yield call(
            compareIndexedWallets,
            accountUserId!,
            updatedWallets
          )
          while (!equivalentIndexedWallets) {
            yield delay(POLLING_FREQUENCY_MILLIS)
            equivalentIndexedWallets = yield call(
              compareIndexedWallets,
              accountUserId!,
              updatedWallets
            )
          }
          console.log('successful')
          return Object.keys(updatedWallets)
        },
        // @ts-ignore: remove when confirmer is typed
        function* (updatedWallets: WalletAddress[]) {
          // Update the user's balance w/ the new wallet
          yield put(getBalance())
          yield put(setAssociatedWallets({ associatedWallets: updatedWallets }))
          const updatedCID: Nullable<string> = yield call(getAccountMetadataCID)
          if (updatedCID) {
            yield put(
              cacheActions.update(Kind.USERS, [
                {
                  id: accountUserId,
                  metadata: { metadata_multihash: updatedCID }
                }
              ])
            )
          }
        },
        function* () {
          yield put(
            updateWalletError({ errorMessage: 'Unable to connect wallet' })
          )
        }
      )
    )
  } catch (error) {
    console.log({ error })
    yield put(updateWalletError({ errorMessage: 'Unable to connect wallet' }))
  }
}

function* removeWallet(action: ConfirmRemoveWalletAction) {
  try {
    const removeWallet = action.payload.wallet
    const accountUserId: Nullable<ID> = yield select(getUserId)
    const userMetadata: any = yield select(getAccountUser)
    const updatedMetadata = newUserMetadata({ ...userMetadata })

    // NOTE: This should never happen where the user has a wallet to remove and is not a creator
    if (
      !updatedMetadata.creator_node_endpoint ||
      !updatedMetadata.metadata_multihash
    ) {
      const upgradedToCreator: boolean = yield call(upgradeToCreator)
      if (!upgradedToCreator) {
        console.log('unable to upgrade user to creator')
        yield put(
          updateWalletError({ errorMessage: 'Unable to remove wallet' })
        )
        return
      }
    }

    const currentAssociatedWallest: Record<string, any> = yield call(
      fetchUserAssociatedWallets,
      updatedMetadata
    )

    if (!(removeWallet in currentAssociatedWallest)) {
      // The wallet already exists in the assocaited wallets set
      console.log('wallet doesn;t exists')
      yield put(updateWalletError({ errorMessage: 'Unable to remove wallet' }))
      return
    }

    updatedMetadata.associated_wallets = { ...currentAssociatedWallest }

    delete updatedMetadata.associated_wallets[removeWallet]

    yield call(AudiusBackend.updateCreator, updatedMetadata, accountUserId)
    yield put(
      requestConfirmation(
        CONNECT_WALLET_CONFIRMATION_UID,
        function* () {
          console.log('polling here')
          const updatedWallets = updatedMetadata.associated_wallets
          console.log({ updatedWallets })
          let equivalentIndexedWallets: any = yield call(
            compareIndexedWallets,
            accountUserId!,
            updatedWallets
          )
          while (!equivalentIndexedWallets) {
            yield delay(POLLING_FREQUENCY_MILLIS)
            equivalentIndexedWallets = yield call(
              compareIndexedWallets,
              accountUserId!,
              updatedWallets
            )
          }
        },
        // @ts-ignore: remove when confirmer is typed
        function* () {
          console.log('in success')
          // Update the user's balance w/ the new wallet
          yield put(getBalance())
          console.log({ removeWallet })
          yield put(removeWalletAction({ wallet: removeWallet }))
          const updatedCID: string = yield call(getAccountMetadataCID)
          yield put(
            cacheActions.update(Kind.USERS, [
              {
                id: accountUserId,
                metadata: { metadata_multihash: updatedCID }
              }
            ])
          )
        },
        function* () {
          yield put(
            updateWalletError({ errorMessage: 'Unable to remove wallet' })
          )
        }
      )
    )
  } catch (error) {
    console.log({ error })
    yield put(updateWalletError({ errorMessage: 'Unable to remove wallet' }))
  }
}

const getSignableData = () => {
  const vals = 'abcdefghijklmnopqrstuvwxyz123456789'
  return vals.charAt(Math.floor(Math.random() * vals.length))
}

function* watchForDiscordCode() {
  yield take(FETCH_DASHBOARD)
  const data = getSignableData()
  const signature = yield call(AudiusBackend.getSignature, data)
  const appended = `${signature}:${data}`
  yield put(setDiscordCode({ code: appended }))
}

function* watchPressSend() {
  yield takeLatest(pressSend.type, send)
}

function* watchGetAssociatedWallets() {
  yield takeLatest(fetchAssociatedWallets.type, fetchAccountAssociatedWallets)
}

function* watchConnectNewWallet() {
  yield takeLatest(connectNewWallet.type, connectWallet)
}

function* watchRemoveWallet() {
  yield takeLatest(confirmRemoveWallet.type, removeWallet)
}

const sagas = () => {
  return [
    watchPressSend,
    watchForDiscordCode,
    watchGetAssociatedWallets,
    watchConnectNewWallet,
    watchRemoveWallet
  ]
}

export default sagas
