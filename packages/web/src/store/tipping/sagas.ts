import BN from 'bn.js'
import { call, put, select, takeEvery } from 'typed-redux-saga/macro'

import { Name } from 'common/models/Analytics'
import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { BNWei } from 'common/models/Wallet'
import { FeatureFlags } from 'common/services/remote-config'
import { getAccountUser } from 'common/store/account/selectors'
import { processAndCacheUsers } from 'common/store/cache/users/utils'
import { getSendTipData } from 'common/store/tipping/selectors'
import {
  confirmSendTip,
  convert,
  sendTipFailed,
  sendTipSucceeded,
  setSupportersForUser,
  setSupportingForUser
} from 'common/store/tipping/slice'
import { getAccountBalance } from 'common/store/wallet/selectors'
import { decreaseBalance } from 'common/store/wallet/slice'
import { weiToAudioString, weiToString } from 'common/utils/wallet'
import {
  fetchSupporters,
  fetchSupporting
} from 'services/audius-backend/Tipping'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import walletClient from 'services/wallet-client/WalletClient'
import { make } from 'store/analytics/actions'

const { getFeatureEnabled, waitForRemoteConfig } = remoteConfigInstance

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
  const { user: recipient, amount: weiBNAmount } = sendTipData
  if (!recipient) {
    return
  }

  const recipientWallet = recipient.spl_wallet
  const weiBNBalance: BNWei = yield select(getAccountBalance) ??
    (new BN('0') as BNWei)
  const waudioWeiAmount = yield* call(walletClient.getCurrentWAudioBalance)

  if (weiBNAmount.gt(weiBNBalance)) {
    const error = 'Not enough $AUDIO'
    console.error(`Send tip failed: ${error}`)
    yield put(sendTipFailed({ error }))
    return
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

    try {
      yield call(() =>
        walletClient.sendWAudioTokens(recipientWallet, weiBNAmount)
      )
    } catch (e) {
      const error = (e as Error).message
      console.error(`Send tip failed: ${error}`)
      yield put(sendTipFailed({ error }))
      return
    }

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

    /**
     * Refresh the supporting list for sender
     * and the supporters list for the receiver
     */
    const supportingForSender = yield* call(fetchSupporting, {
      userId: sender.user_id
    })
    const supportersForReceiver = yield* call(fetchSupporters, {
      userId: recipient.user_id
    })
    yield processAndCacheUsers(
      [
        ...supportingForSender.map(supporting => supporting.receiver),
        ...supportersForReceiver.map(supporter => supporter.sender)
      ].filter(user => user.user_id !== sender.user_id)
    )

    const supportingForSenderMap: Record<ID, Supporting> = {}
    supportingForSender.forEach(supporting => {
      supportingForSenderMap[supporting.receiver.user_id] = { ...supporting }
    })
    const supportersForRecipientMap: Record<ID, Supporter> = {}
    supportersForReceiver.forEach(supporter => {
      supportersForRecipientMap[supporter.sender.user_id] = { ...supporter }
    })
    yield put(
      setSupportingForUser({
        userId: sender.user_id,
        supportingForUser: supportingForSenderMap
      })
    )
    yield put(
      setSupportersForUser({
        userId: recipient.user_id,
        supportersForUser: supportersForRecipientMap
      })
    )
  } catch (e) {
    const error = (e as Error).message
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
}

function* watchConfirmSendTip() {
  yield takeEvery(confirmSendTip.type, sendTipAsync)
}

const sagas = () => {
  return [watchConfirmSendTip]
}

export default sagas
