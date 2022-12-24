import {
  Kind,
  ID,
  Name,
  Supporter,
  Supporting,
  User,
  BNWei,
  StringWei,
  parseAudioInputToWei,
  stringWeiToBN,
  weiToAudioString,
  weiToString,
  decodeHashId,
  accountSelectors,
  cacheActions,
  RefreshSupportPayloadAction,
  tippingSelectors,
  tippingActions,
  walletSelectors,
  walletActions,
  getContext,
  waitForValue,
  GetTipsArgs,
  GetSupportingArgs,
  GetSupportersArgs,
  MAX_ARTIST_HOVER_TOP_SUPPORTING,
  MAX_PROFILE_TOP_SUPPORTERS
} from '@audius/common'
import BN from 'bn.js'
import {
  call,
  delay,
  put,
  select,
  takeEvery,
  fork,
  cancel
} from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { fetchUsers } from 'common/store/cache/users/sagas'
import { waitForWrite, waitForRead } from 'utils/sagaHelpers'

import { processAndCacheUsers } from '../cache/users/utils'

import { updateTipsStorage } from './storageUtils'
const { decreaseBalance } = walletActions
const { getAccountBalance } = walletSelectors
const {
  confirmSendTip,
  convert,
  fetchRecentTips,
  fetchSupportingForUser,
  refreshSupport,
  sendTipFailed,
  sendTipSucceeded,
  setTipToDisplay,
  setSupportersForUser,
  setSupportingForUser,
  hideTip,
  setSupportingOverridesForUser,
  setSupportersOverridesForUser,
  fetchUserSupporter
} = tippingActions
const {
  getOptimisticSupporters,
  getOptimisticSupporting,
  getSendTipData,
  getSupporters,
  getSupporting
} = tippingSelectors
const { update } = cacheActions
const getAccountUser = accountSelectors.getAccountUser

export const FEED_TIP_DISMISSAL_TIME_LIMIT = 30 * 24 * 60 * 60 * 1000 // 30 days

function* overrideSupportingForUser({
  amountBN,
  sender,
  receiver
}: {
  amountBN: BNWei
  sender: User
  receiver: User
}) {
  /**
   * Get supporting map for sender.
   */
  const supportingMap = yield* select(getOptimisticSupporting)
  const supportingForSender = supportingMap[sender.user_id] ?? {}

  /**
   * If sender was not previously supporting receiver, then
   * optimistically increment the sender's supporting_count
   */
  const wasNotPreviouslySupporting =
    !supportingForSender[receiver.user_id]?.amount
  if (wasNotPreviouslySupporting) {
    yield put(
      update(Kind.USERS, [
        {
          id: sender.user_id,
          metadata: { supporting_count: sender.supporting_count + 1 }
        }
      ])
    )
  }

  /**
   * Get and update the new amount the sender
   * is supporting to the receiver.
   */
  const previousSupportAmount =
    supportingForSender[receiver.user_id]?.amount ?? ('0' as StringWei)
  const newSupportAmountBN = stringWeiToBN(previousSupportAmount).add(
    amountBN
  ) as BNWei

  /**
   * Store the optimistic value.
   */
  yield put(
    setSupportingOverridesForUser({
      id: sender.user_id,
      supportingOverridesForUser: {
        [receiver.user_id]: {
          receiver_id: receiver.user_id,
          amount: weiToString(newSupportAmountBN),
          rank: -1
        }
      }
    })
  )
}

function* overrideSupportersForUser({
  amountBN,
  sender,
  receiver
}: {
  amountBN: BNWei
  sender: User
  receiver: User
}) {
  /**
   * Get supporting map for sender.
   */
  const supportersMap = yield* select(getOptimisticSupporters)
  const supportersForReceiver = supportersMap[receiver.user_id] ?? {}

  /**
   * If receiver was not previously supported by sender, then
   * optimistically increment the receiver's supporter_count
   */
  const wasNotPreviouslySupported =
    !supportersForReceiver[sender.user_id]?.amount
  if (wasNotPreviouslySupported) {
    yield put(
      update(Kind.USERS, [
        {
          id: receiver.user_id,
          metadata: { supporter_count: receiver.supporter_count + 1 }
        }
      ])
    )
  }

  /**
   * Get and update the new amount the sender
   * is supporting to the receiver.
   */
  const previousSupportAmount =
    supportersForReceiver[sender.user_id]?.amount ?? ('0' as StringWei)
  const newSupportAmountBN = stringWeiToBN(previousSupportAmount).add(
    amountBN
  ) as BNWei

  /**
   * Store the optimistic value.
   */
  yield put(
    setSupportersOverridesForUser({
      id: receiver.user_id,
      supportersOverridesForUser: {
        [sender.user_id]: {
          sender_id: sender.user_id,
          amount: weiToString(newSupportAmountBN),
          rank: -1
        }
      }
    })
  )
}

function* sendTipAsync() {
  const walletClient = yield* getContext('walletClient')
  const { waitForRemoteConfig } = yield* getContext('remoteConfigInstance')
  const isNativeMobile = yield* getContext('isNativeMobile')
  yield call(waitForRemoteConfig)
  yield* waitForWrite()

  const device = isNativeMobile ? 'native' : 'web'

  const sender = yield* select(getAccountUser)
  if (!sender) {
    return
  }

  const sendTipData = yield* select(getSendTipData)
  const { user: recipient, amount, source } = sendTipData
  if (!recipient) {
    return
  }

  const weiBNAmount = parseAudioInputToWei(amount) ?? (new BN('0') as BNWei)
  const recipientWallet = recipient.spl_wallet
  const weiBNBalance: BNWei = yield* select(getAccountBalance) ??
    (new BN('0') as BNWei)
  const waudioWeiAmount = yield* call([walletClient, 'getCurrentWAudioBalance'])

  if (weiBNAmount.gt(weiBNBalance)) {
    const errorMessage = 'Not enough $AUDIO'
    throw new Error(errorMessage)
  }

  try {
    yield put(
      make(Name.TIP_AUDIO_REQUEST, {
        senderWallet: sender.spl_wallet,
        recipientWallet,
        senderHandle: sender.handle,
        recipientHandle: recipient.handle,
        amount: weiToAudioString(weiBNAmount),
        device,
        source
      })
    )
    // If transferring spl wrapped audio and there are insufficent funds with only the
    // user bank balance, transfer all eth AUDIO to spl wrapped audio
    if (weiBNAmount.gt(waudioWeiAmount)) {
      // Wait for a second before showing the notice that this might take a while
      const showConvertingMessage = yield* fork(function* () {
        yield delay(1000)
        yield put(convert())
      })
      yield call([walletClient, 'transferTokensFromEthToSol'])
      // Cancel showing the notice if the conversion was magically super quick
      yield cancel(showConvertingMessage)
    }

    yield call([walletClient, 'sendWAudioTokens'], recipientWallet, weiBNAmount)

    // Only decrease store balance if we haven't already changed
    const newBalance: ReturnType<typeof getAccountBalance> = yield* select(
      getAccountBalance
    )
    if (newBalance?.eq(weiBNBalance)) {
      yield put(decreaseBalance({ amount: weiToString(weiBNAmount) }))
    }

    yield put(sendTipSucceeded())
    yield put(
      make(Name.TIP_AUDIO_SUCCESS, {
        senderWallet: sender.spl_wallet,
        recipientWallet,
        senderHandle: sender.handle,
        recipientHandle: recipient.handle,
        amount: weiToAudioString(weiBNAmount),
        device,
        source
      })
    )

    /**
     * Store optimistically updated supporting value for sender
     * and supporter value for receiver.
     */
    try {
      yield call(overrideSupportingForUser, {
        amountBN: weiBNAmount,
        sender,
        receiver: recipient
      })
      yield call(overrideSupportersForUser, {
        amountBN: weiBNAmount,
        sender,
        receiver: recipient
      })
    } catch (e) {
      console.error(
        `Could not optimistically update support: ${(e as Error).message}`
      )
    }
  } catch (e) {
    const error = (e as Error).message
    console.error(`Send tip failed: ${error}`)
    yield put(sendTipFailed({ error }))
    yield put(
      make(Name.TIP_AUDIO_FAILURE, {
        senderWallet: sender.spl_wallet,
        recipientWallet,
        senderHandle: sender.handle,
        recipientHandle: recipient.handle,
        amount: weiToAudioString(weiBNAmount),
        error,
        device,
        source
      })
    )
  }
}

function* refreshSupportAsync({
  payload: { senderUserId, receiverUserId, supportingLimit, supportersLimit }
}: {
  payload: RefreshSupportPayloadAction
  type: string
}) {
  yield* waitForRead()
  const apiClient = yield* getContext('apiClient')

  const supportingParams: GetSupportingArgs = {
    userId: senderUserId
  }
  if (supportingLimit) {
    supportingParams.limit = supportingLimit
  } else {
    const account = yield* select(getAccountUser)
    supportingParams.limit =
      account?.user_id === senderUserId
        ? account?.supporting_count
        : MAX_ARTIST_HOVER_TOP_SUPPORTING + 1
  }

  const supportersParams: GetSupportersArgs = {
    userId: receiverUserId
  }
  if (supportersLimit) {
    supportersParams.limit = supportersLimit
  }

  const supportingForSenderList = yield* call(
    [apiClient, apiClient.getSupporting],
    supportingParams
  )
  const supportersForReceiverList = yield* call(
    [apiClient, apiClient.getSupporters],
    supportersParams
  )

  const userIds = [
    ...(supportingForSenderList || []).map((supporting) =>
      decodeHashId(supporting.receiver.id)
    ),
    ...(supportersForReceiverList || []).map((supporter) =>
      decodeHashId(supporter.sender.id)
    )
  ]

  yield call(fetchUsers, userIds)

  const supportingForSenderMap: Record<string, Supporting> = {}
  ;(supportingForSenderList || []).forEach((supporting) => {
    const supportingUserId = decodeHashId(supporting.receiver.id)
    if (supportingUserId) {
      supportingForSenderMap[supportingUserId] = {
        receiver_id: supportingUserId,
        rank: supporting.rank,
        amount: supporting.amount
      }
    }
  })
  const supportersForReceiverMap: Record<string, Supporter> = {}
  ;(supportersForReceiverList || []).forEach((supporter) => {
    const supporterUserId = decodeHashId(supporter.sender.id)
    if (supporterUserId) {
      supportersForReceiverMap[supporterUserId] = {
        sender_id: supporterUserId,
        rank: supporter.rank,
        amount: supporter.amount
      }
    }
  })

  yield put(
    setSupportingForUser({
      id: senderUserId,
      supportingForUser: supportingForSenderMap
    })
  )
  yield put(
    setSupportersForUser({
      id: receiverUserId,
      supportersForUser: supportersForReceiverMap
    })
  )
}

function* fetchSupportingForUserAsync({
  payload: { userId }
}: {
  payload: { userId: ID }
  type: string
}) {
  yield* waitForRead()
  const apiClient = yield* getContext('apiClient')

  /**
   * If the user id is that of the logged in user, then
   * get all its supporting data so that when the logged in
   * user is trying to tip an artist, we'll know whether or
   * not that artist is already being supported by the logged in
   * user and thus correctly calculate how much more audio to tip
   * to become the top supporter.
   */
  const account = yield* select(getAccountUser)
  const limit =
    account?.user_id === userId
      ? account.supporting_count
      : MAX_ARTIST_HOVER_TOP_SUPPORTING + 1
  const supportingList = yield* call([apiClient, apiClient.getSupporting], {
    userId,
    limit
  })
  const userIds =
    supportingList?.map((supporting) => decodeHashId(supporting.receiver.id)) ??
    []

  yield call(fetchUsers, userIds)

  const map: Record<string, Supporting> = {}
  supportingList?.forEach((supporting) => {
    const supportingUserId = decodeHashId(supporting.receiver.id)
    if (supportingUserId) {
      map[supportingUserId] = {
        receiver_id: supportingUserId,
        rank: supporting.rank,
        amount: supporting.amount
      }
    }
  })

  yield put(
    setSupportingForUser({
      id: userId,
      supportingForUser: map
    })
  )
}

function* fetchRecentTipsAsync(action: ReturnType<typeof fetchRecentTips>) {
  const apiClient = yield* getContext('apiClient')
  const localStorage = yield* getContext('localStorage')
  const { storage } = action.payload

  // Check if we're dismissed
  if (
    storage &&
    storage.dismissed &&
    storage.lastDismissalTimeStamp + FEED_TIP_DISMISSAL_TIME_LIMIT > Date.now()
  ) {
    yield put(hideTip())
    return
  }

  const account: User = yield* call(waitForValue, getAccountUser)

  const params: GetTipsArgs = {
    userId: account.user_id,
    currentUserFollows: 'receiver',
    uniqueBy: 'receiver',
    limit: 1
  }

  const userTips = yield* call([apiClient, apiClient.getTips], params)

  if (!(userTips && userTips.length)) {
    yield put(hideTip())
    return
  }

  const recentTip = {
    ...userTips[0],
    sender_id: userTips[0].sender.user_id,
    receiver_id: userTips[0].receiver.user_id
  }

  const lastTipState = {
    dismissed: false,
    minSlot: recentTip.slot,
    lastDismissalTimestamp: null
  }
  updateTipsStorage(lastTipState, localStorage)

  const userIds = [...new Set([...recentTip.followee_supporter_ids])]
  yield call(processAndCacheUsers, [recentTip.sender, recentTip.receiver])
  yield call(fetchUsers, userIds)

  /**
   * We need to get supporting data for logged in user and
   * supporters data for followee that logged in user may
   * send a tip to.
   * This is so that we know if and how much the logged in
   * user has already tipped the followee, and also whether or
   * not the logged in user is the top supporter for the
   * followee.
   */
  yield put(
    refreshSupport({
      senderUserId: account.user_id,
      receiverUserId: recentTip.receiver_id,
      supportingLimit: account.supporting_count,
      supportersLimit: MAX_PROFILE_TOP_SUPPORTERS + 1
    })
  )
  yield put(setTipToDisplay({ tipToDisplay: recentTip }))
}

function* fetchUserSupporterAsync(
  action: ReturnType<typeof fetchUserSupporter>
) {
  const { currentUserId, userId, supporterUserId } = action.payload
  const apiClient = yield* getContext('apiClient')
  try {
    const response = yield* call([apiClient, apiClient.getUserSupporter], {
      currentUserId,
      userId,
      supporterUserId
    })
    if (response) {
      const supportingMap = yield* select(getSupporting)
      yield put(
        setSupportingForUser({
          id: supporterUserId,
          supportingForUser: {
            ...supportingMap[supporterUserId],
            [userId]: {
              receiver_id: userId,
              amount: response.amount,
              rank: response.rank
            }
          }
        })
      )

      const supportersMap = yield* select(getSupporters)
      yield put(
        setSupportersForUser({
          id: userId,
          supportersForUser: {
            ...supportersMap[userId],
            [supporterUserId]: {
              sender_id: supporterUserId,
              amount: response.amount,
              rank: response.rank
            }
          }
        })
      )
    }
  } catch (e) {
    console.error(
      `Could not fetch user supporter for user id ${userId}, supporter user id ${supporterUserId}, and current user id ${currentUserId}: ${
        (e as Error).message
      }`
    )
  }
}

function* watchFetchSupportingForUser() {
  yield* takeEvery(fetchSupportingForUser.type, fetchSupportingForUserAsync)
}

function* watchRefreshSupport() {
  yield* takeEvery(refreshSupport.type, refreshSupportAsync)
}

function* watchConfirmSendTip() {
  yield* takeEvery(confirmSendTip.type, sendTipAsync)
}

function* watchFetchRecentTips() {
  yield* takeEvery(fetchRecentTips.type, fetchRecentTipsAsync)
}

function* watchFetchUserSupporter() {
  yield takeEvery(fetchUserSupporter.type, fetchUserSupporterAsync)
}

const sagas = () => {
  return [
    watchFetchSupportingForUser,
    watchRefreshSupport,
    watchConfirmSendTip,
    watchFetchRecentTips,
    watchFetchUserSupporter
  ]
}

export default sagas
