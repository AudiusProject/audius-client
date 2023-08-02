import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, race, select, take } from 'typed-redux-saga'

import { Name } from 'models/Analytics'
import { ErrorLevel } from 'models/ErrorReporting'
import { ID } from 'models/Identifiers'
import { isPremiumContentUSDCPurchaseGated } from 'models/Track'
import { purchaseContent } from 'services/audius-backend/solana'
import { accountSelectors } from 'store/account'
import { getUSDCUserBank } from 'store/buy-usdc/sagas'
import {
  buyUSDCFlowFailed,
  buyUSDCFlowSucceeded,
  onRampCanceled,
  startBuyUSDCFlow
} from 'store/buy-usdc/slice'
import { USDCOnRampProvider } from 'store/buy-usdc/types'
import { getTrack } from 'store/cache/tracks/selectors'
import { getUser } from 'store/cache/users/selectors'
import { getContext } from 'store/effects'

import { pollPremiumTrack } from '../premium-content/sagas'
import { updatePremiumTrackStatus } from '../premium-content/slice'

import {
  onBuyUSDC,
  onPurchaseConfirmed,
  onPurchaseSucceeded,
  onUSDCBalanceSufficient,
  purchaseContentFlowFailed,
  startPurchaseContentFlow
} from './slice'
import { ContentType } from './types'

const { getUserId } = accountSelectors

type GetPurchaseConfigArgs = {
  contentId: ID
  contentType: ContentType
}

function* getUSDCPremiumConditions({
  contentId,
  contentType
}: GetPurchaseConfigArgs) {
  if (contentType !== ContentType.TRACK) {
    throw new Error('Only tracks are supported')
  }

  const trackInfo = yield* select(getTrack, { id: contentId })
  if (
    !trackInfo ||
    !isPremiumContentUSDCPurchaseGated(trackInfo?.premium_conditions)
  ) {
    throw new Error('Content is missing premium conditions')
  }
  return trackInfo.premium_conditions.usdc_purchase
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
    throw new Error('Content is missing premium conditions')
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

function* pollForPurchaseConfirmation({
  contentId,
  contentType
}: {
  contentId: ID
  contentType: ContentType
}) {
  if (contentType !== ContentType.TRACK) {
    throw new Error('Only tracks are supported')
  }

  const currentUserId = yield* select(getUserId)
  if (!currentUserId) {
    throw new Error(
      'Failed to fetch current user id while polling for purchase confirmation'
    )
  }
  yield* put(
    updatePremiumTrackStatus({ trackId: contentId, status: 'UNLOCKING' })
  )

  yield* pollPremiumTrack({
    trackId: contentId,
    currentUserId,
    isSourceTrack: true
  })
}

function* doStartPurchaseContentFlow({
  payload: { contentId, contentType = ContentType.TRACK }
}: ReturnType<typeof startPurchaseContentFlow>) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const reportToSentry = yield* getContext('reportToSentry')
  const { track, make } = yield* getContext('analytics')

  // Record start
  yield* call(
    track,
    make({ eventName: Name.PURCHASE_CONTENT_STARTED, contentId, contentType })
  )

  try {
    /* const { price } = */ yield* call(getUSDCPremiumConditions, {
      contentId,
      contentType
    })

    // TODO: check balance first

    // buy USDC if necessary
    yield* put(onBuyUSDC())
    yield* put(
      startBuyUSDCFlow({
        provider: USDCOnRampProvider.STRIPE,
        purchaseInfo: {
          // TODO: Use actual price once type is correct
          desiredAmount: 100
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

    yield* put(onUSDCBalanceSufficient())

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
    yield* put(onPurchaseSucceeded())

    // confirm purchase
    yield* pollForPurchaseConfirmation({ contentId, contentType })

    // finish
    yield* put(onPurchaseConfirmed())

    yield* call(
      track,
      make({ eventName: Name.PURCHASE_CONTENT_SUCCESS, contentId, contentType })
    )
  } catch (e: unknown) {
    yield* call(reportToSentry, {
      level: ErrorLevel.Error,
      error: e as Error,
      additionalInfo: { contentId, contentType }
    })
    yield* put(purchaseContentFlowFailed())
    yield* call(
      track,
      make({
        eventName: Name.PURCHASE_CONTENT_FAILURE,
        contentId,
        contentType,
        error: (e as Error).message
      })
    )
  }
}

function* watchStartPurchaseContentFlow() {
  yield takeLatest(startPurchaseContentFlow, doStartPurchaseContentFlow)
}

export default function sagas() {
  return [watchStartPurchaseContentFlow]
}
