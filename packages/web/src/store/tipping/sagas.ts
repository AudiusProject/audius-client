import BN from 'bn.js'
import { call, put, select, takeEvery } from 'typed-redux-saga/macro'

import { Name } from 'common/models/Analytics'
import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting, UserTip } from 'common/models/Tipping'
import { User } from 'common/models/User'
import { BNWei, StringWei } from 'common/models/Wallet'
import { FeatureFlags } from 'common/services/remote-config'
import { getAccountUser } from 'common/store/account/selectors'
import { fetchUsers } from 'common/store/cache/users/sagas'
import {
  getSendTipData,
  getSupporters,
  getSupporting
} from 'common/store/tipping/selectors'
import {
  confirmSendTip,
  convert,
  fetchRecentTips,
  fetchSupportingForUser,
  refreshSupport,
  RefreshSupportPayloadAction,
  sendTipFailed,
  sendTipSucceeded,
  setTipToDisplay,
  setRecentTips,
  setSupportersForUser,
  setSupportingForUser,
  hideTip
} from 'common/store/tipping/slice'
import { getAccountBalance } from 'common/store/wallet/selectors'
import { decreaseBalance } from 'common/store/wallet/slice'
import { Nullable } from 'common/utils/typeUtils'
import {
  parseAudioInputToWei,
  stringWeiToBN,
  weiToAudioString,
  weiToString
} from 'common/utils/wallet'
import {
  fetchRecentUserTips,
  fetchSupporters,
  fetchSupporting,
  SupportRequest,
  UserTipRequest
} from 'services/audius-backend/Tipping'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import walletClient from 'services/wallet-client/WalletClient'
import { make } from 'store/analytics/actions'
import {
  MAX_ARTIST_HOVER_TOP_SUPPORTING,
  MAX_PROFILE_TOP_SUPPORTERS
} from 'utils/constants'
import { decodeHashId, encodeHashId } from 'utils/route/hashIds'

import { getMinSlotForRecentTips, checkTipToDisplay } from './utils'

const { getFeatureEnabled, waitForRemoteConfig } = remoteConfigInstance

/**
 * Optimistically update supporting list for a user.
 */
function* optimisticallyUpdateSupporting({
  amountBN,
  sender,
  receiver
}: {
  amountBN: BNWei
  sender: User
  receiver: User
}) {
  /**
   * 1. Get supporting map for sender.
   */
  const supportingMap = yield* select(getSupporting)
  let supportingForSender = supportingMap[sender.user_id] ?? {}

  /**
   * 2. Get and update the new amount the sender
   * is supporting to the receiver.
   */
  const previousSupportAmount =
    supportingForSender[receiver.user_id]?.amount ?? ('0' as StringWei)
  const newSupportAmountBN = stringWeiToBN(previousSupportAmount).add(
    amountBN
  ) as BNWei
  supportingForSender = {
    ...supportingForSender,
    [receiver.user_id]: {
      ...supportingForSender[receiver.user_id],
      receiver_id: receiver.user_id,
      amount: weiToString(newSupportAmountBN)
    }
  }

  /**
   * 3. Sort the supporting values for the sender by amount descending.
   */
  const supportingSortedDesc = Object.values(
    supportingForSender
  ).sort((s1, s2) =>
    stringWeiToBN(s1.amount).gt(stringWeiToBN(s2.amount)) ? -1 : 1
  )

  /**
   * 4. Update the ranks of all the supporting values
   * and store in new map.
   */
  let rank = 1
  let previousAmountBN: Nullable<BNWei> = null
  const map: Record<ID, Supporting> = {}
  for (let i = 0; i < supportingSortedDesc.length; i++) {
    if (!previousAmountBN) {
      // Store the first (and potentially only one) in the new map
      map[supportingSortedDesc[i].receiver_id] = {
        ...supportingSortedDesc[i],
        rank
      }
      previousAmountBN = stringWeiToBN(supportingSortedDesc[i].amount)
    } else {
      const currentAmountBN = stringWeiToBN(supportingSortedDesc[i].amount)
      if ((previousAmountBN as BNWei).gt(currentAmountBN)) {
        // If previous amount is greater than current, then
        // increment the rank for the current value.
        map[supportingSortedDesc[i].receiver_id] = {
          ...supportingSortedDesc[i],
          rank: ++rank
        }
      } else {
        // Otherwise, the amounts are equal (because we already
        // previously sorted). Thus, keep the same rank.
        map[supportingSortedDesc[i].receiver_id] = {
          ...supportingSortedDesc[i],
          rank
        }
      }
      // Update the previous amount.
      previousAmountBN = currentAmountBN
    }
  }

  /**
   * 5. Store the new map in the tipping store.
   */
  yield put(
    setSupportingForUser({
      id: sender.user_id,
      supportingForUser: map
    })
  )
}

/**
 * Optimistically update supporters list for a user.
 */
function* optimisticallyUpdateSupporters({
  amountBN,
  sender,
  receiver
}: {
  amountBN: BNWei
  sender: User
  receiver: User
}) {
  /**
   * 1. Get supporters map for receiver.
   */
  const supportersMap = yield* select(getSupporters)
  let supportersForReceiver = supportersMap[receiver.user_id] ?? {}

  /**
   * 2. Get and update the new amount the receiver
   * is supported by the sender.
   */
  const previousSupportAmount =
    supportersForReceiver[sender.user_id]?.amount ?? ('0' as StringWei)
  const newSupportAmountBN = stringWeiToBN(previousSupportAmount).add(
    amountBN
  ) as BNWei
  supportersForReceiver = {
    ...supportersForReceiver,
    [sender.user_id]: {
      ...supportersForReceiver[sender.user_id],
      sender_id: sender.user_id,
      amount: weiToString(newSupportAmountBN)
    }
  }

  /**
   * 3. Sort the supporters values for the receiver by amount descending.
   */
  const supportersSortedDesc = Object.values(
    supportersForReceiver
  ).sort((s1, s2) =>
    stringWeiToBN(s1.amount).gt(stringWeiToBN(s2.amount)) ? -1 : 1
  )

  /**
   * 4. Update the ranks of all the supporters values
   * and store in new map.
   */
  let rank = 1
  let previousAmountBN: Nullable<BNWei> = null
  const map: Record<ID, Supporter> = {}
  for (let i = 0; i < supportersSortedDesc.length; i++) {
    if (!previousAmountBN) {
      // Store the first (and potentially only one) in the new map
      map[supportersSortedDesc[i].sender_id] = {
        ...supportersSortedDesc[i],
        rank
      }
      previousAmountBN = stringWeiToBN(supportersSortedDesc[i].amount)
    } else {
      const currentAmountBN = stringWeiToBN(supportersSortedDesc[i].amount)
      if ((previousAmountBN as BNWei).gt(currentAmountBN)) {
        // If previous amount is greater than current, then
        // increment the rank for the current value.
        map[supportersSortedDesc[i].sender_id] = {
          ...supportersSortedDesc[i],
          rank: ++rank
        }
      } else {
        // Otherwise, the amounts are equal (because we already
        // previously sorted). Thus, keep the same rank.
        map[supportersSortedDesc[i].sender_id] = {
          ...supportersSortedDesc[i],
          rank
        }
      }
      // Update the previous amount.
      previousAmountBN = currentAmountBN
    }
  }

  /**
   * 5. Store the new map in the tipping store.
   */
  yield put(
    setSupportersForUser({
      id: receiver.user_id,
      supportersForUser: map
    })
  )
}

function* sendTipAsync() {
  yield call(waitForRemoteConfig)
  const isTippingEnabled = getFeatureEnabled(FeatureFlags.TIPPING_ENABLED)
  if (!isTippingEnabled) {
    return
  }

  const sender = yield* select(getAccountUser)
  if (!sender) {
    return
  }

  const sendTipData = yield* select(getSendTipData)
  const { user: recipient, amount } = sendTipData
  if (!recipient) {
    return
  }

  const weiBNAmount = parseAudioInputToWei(amount) ?? (new BN('0') as BNWei)
  const recipientWallet = recipient.spl_wallet
  const weiBNBalance: BNWei = yield select(getAccountBalance) ??
    (new BN('0') as BNWei)
  const waudioWeiAmount = yield* call(walletClient.getCurrentWAudioBalance)

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
        amount: weiToAudioString(weiBNAmount)
      })
    )
    // If transferring spl wrapped audio and there are insufficent funds with only the
    // user bank balance, transfer all eth AUDIO to spl wrapped audio
    if (weiBNAmount.gt(waudioWeiAmount)) {
      yield put(convert())
      yield call(walletClient.transferTokensFromEthToSol)
    }

    yield call(() =>
      walletClient.sendWAudioTokens(recipientWallet, weiBNAmount)
    )

    // Only decrease store balance if we haven't already changed
    const newBalance: ReturnType<typeof getAccountBalance> = yield select(
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
        amount: weiToAudioString(weiBNAmount)
      })
    )
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
        error
      })
    )
  }

  try {
    yield call(optimisticallyUpdateSupporting, {
      amountBN: weiBNAmount,
      sender,
      receiver: recipient
    })
    yield call(optimisticallyUpdateSupporters, {
      amountBN: weiBNAmount,
      sender,
      receiver: recipient
    })
  } catch (e) {
    console.error(
      `Could not optimistically update support: ${(e as Error).message}`
    )
  }
}

function* refreshSupportAsync({
  payload: { senderUserId, receiverUserId, supportingLimit, supportersLimit }
}: {
  payload: RefreshSupportPayloadAction
  type: string
}) {
  const encodedSenderUserId = encodeHashId(senderUserId)
  const encodedReceiverUserId = encodeHashId(receiverUserId)

  if (encodedSenderUserId && encodedReceiverUserId) {
    const supportingParams: SupportRequest = {
      encodedUserId: encodedSenderUserId
    }
    if (supportingLimit) {
      supportingParams.limit = supportingLimit
    } else {
      const account = yield* select(getAccountUser)
      supportingParams.limit =
        account?.user_id === senderUserId
          ? account.supporting_count
          : MAX_ARTIST_HOVER_TOP_SUPPORTING + 1
    }

    const supportersParams: SupportRequest = {
      encodedUserId: encodedReceiverUserId
    }
    if (supportersLimit) {
      supportersParams.limit = supportersLimit
    }

    const supportingForSenderList = yield* call(
      fetchSupporting,
      supportingParams
    )
    const supportersForReceiverList = yield* call(
      fetchSupporters,
      supportersParams
    )

    const userIds = [
      ...supportingForSenderList.map(supporting =>
        decodeHashId(supporting.receiver.id)
      ),
      ...supportersForReceiverList.map(supporter =>
        decodeHashId(supporter.sender.id)
      )
    ]

    yield call(fetchUsers, userIds, new Set(), true)

    const supportingForSenderMap: Record<string, Supporting> = {}
    supportingForSenderList.forEach(supporting => {
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
    supportersForReceiverList.forEach(supporter => {
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
}

function* fetchSupportingForUserAsync({
  payload: { userId }
}: {
  payload: { userId: ID }
  type: string
}) {
  const encodedUserId = encodeHashId(userId)
  if (!encodedUserId) {
    return
  }

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
  const supportingList = yield* call(fetchSupporting, {
    encodedUserId,
    limit
  })
  const userIds = supportingList.map(supporting =>
    decodeHashId(supporting.receiver.id)
  )

  yield call(fetchUsers, userIds, new Set(), true)

  const map: Record<string, Supporting> = {}
  supportingList.forEach(supporting => {
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

function* fetchRecentTipsAsync() {
  const account = yield* select(getAccountUser)
  if (!account) {
    return
  }

  const encodedUserId = encodeHashId(account.user_id)
  if (!encodedUserId) {
    return
  }

  const params: UserTipRequest = {
    userId: encodedUserId,
    currentUserFollows: 'receiver',
    uniqueBy: 'receiver'
  }
  const minSlot = getMinSlotForRecentTips()
  if (minSlot) {
    params.minSlot = minSlot
  }

  const userTips = yield* call(fetchRecentUserTips, params)

  const recentTips = userTips
    .map(userTip => {
      const senderId = decodeHashId(userTip.sender.id)
      const receiverId = decodeHashId(userTip.receiver.id)
      if (!senderId || !receiverId) {
        return null
      }

      const followeeSupporterIds = userTip.followee_supporters
        .map(followee_supporter => decodeHashId(followee_supporter.id))
        .filter((id): id is ID => !!id)

      const { amount, slot, created_at, tx_signature } = userTip

      return {
        amount,
        sender_id: senderId,
        receiver_id: receiverId,
        followee_supporter_ids: followeeSupporterIds,
        slot,
        created_at,
        tx_signature
      }
    })
    .filter((userTip): userTip is UserTip => !!userTip)

  const tipToDisplay = checkTipToDisplay({
    userId: account.user_id,
    recentTips
  })
  if (tipToDisplay) {
    const userIds = [
      ...new Set([
        tipToDisplay.sender_id,
        tipToDisplay.receiver_id,
        ...tipToDisplay.followee_supporter_ids
      ])
    ]
    yield call(fetchUsers, userIds, new Set(), true)

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
        receiverUserId: tipToDisplay.receiver_id,
        supportingLimit: account.supporting_count,
        supportersLimit: MAX_PROFILE_TOP_SUPPORTERS + 1
      })
    )
    yield put(setTipToDisplay({ tipToDisplay }))
  } else {
    yield put(hideTip())
  }
  yield put(setRecentTips({ recentTips }))
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

const sagas = () => {
  return [
    watchFetchSupportingForUser,
    watchRefreshSupport,
    watchConfirmSendTip,
    watchFetchRecentTips
  ]
}

export default sagas
