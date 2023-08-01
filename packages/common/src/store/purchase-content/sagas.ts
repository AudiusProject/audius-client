import BN from 'bn.js'
import { ID } from 'models/Identifiers'
import { isPremiumContentUSDCPurchaseGated } from 'models/Track'
import { takeLatest } from 'redux-saga/effects'
import { purchaseContent } from 'services/audius-backend/solana'
import { getUSDCUserBank } from 'store/buy-usdc/sagas'
import {
  buyUSDCFlowFailed,
  buyUSDCFlowSucceeded,
  onRampCanceled,
  startBuyUSDCFlow
} from 'store/buy-usdc/slice'
import { OnRampProvider } from 'store/buy-usdc/types'
import { getTrack } from 'store/cache/tracks/selectors'
import { getUser } from 'store/cache/users/selectors'
import { getContext } from 'store/effects'
import { call, put, race, select, take } from 'typed-redux-saga'

import { startPurchaseContentFlow } from './slice'
import { ContentType } from './types'

type GetPurchaseConfigArgs = {
  contentId: ID
  contentType: ContentType
}

function* getPurchaseConfig({ contentId, contentType }: GetPurchaseConfigArgs) {
  if (contentType !== ContentType.TRACK) {
    throw new Error('Only tracks are supported')
  }

  const trackInfo = yield* select(getTrack, { id: contentId })
  if (
    !trackInfo ||
    !isPremiumContentUSDCPurchaseGated(trackInfo?.premium_conditions)
  ) {
    throw new Error('Content is missing purchase conditions')
  }

  const user = yield* select(getUser, { id: trackInfo.owner_id })
  if (!user) {
    throw new Error('Failed to retrieve content owner')
  }
  const recipientERCWallet = user.erc_wallet ?? user.wallet
  if (!recipientERCWallet) {
    throw new Error('Unable to resolve destination wallet')
  }

  const userBank = yield* getUSDCUserBank(recipientERCWallet)

  const {
    blocknumber,
    premium_conditions: {
      usdc_purchase: { price }
    }
  } = trackInfo

  return {
    blocknumber,
    splits: {
      [userBank.toString()]: new BN(price)
    }
  }
}

function* doStartPurchaseContentFlow({
  payload: { contentId, contentType = ContentType.TRACK }
}: ReturnType<typeof startPurchaseContentFlow>) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')

  // Fetch content info

  // buy USDC if necessary
  yield* put(
    startBuyUSDCFlow({
      provider: OnRampProvider.STRIPE,
      purchaseInfo: {
        desiredAmount: {
          amount: 100,
          amountString: '100',
          uiAmount: 100,
          uiAmountString: '100'
        }
      }
    })
  )

  const result = yield* race({
    success: take(buyUSDCFlowSucceeded),
    canceled: take(onRampCanceled),
    failed: take(buyUSDCFlowFailed)
  })

  if (result.canceled || result.failed) {
    // Return early for failure or cancellation
    return
  }

  const { blocknumber, splits } = yield* getPurchaseConfig({
    contentId,
    contentType
  })

  // purchase content
  yield* call(purchaseContent, audiusBackendInstance, {
    id: contentId,
    blocknumber,
    splits,
    type: 'track'
  })

  // confirm purchase

  // finish
}

function* watchStartPurchastContentFlow() {
  yield takeLatest(startPurchaseContentFlow, doStartPurchaseContentFlow)
}

export default function sagas() {
  return [watchStartPurchastContentFlow]
}
