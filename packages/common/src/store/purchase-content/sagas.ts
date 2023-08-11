import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, race, select, take } from 'typed-redux-saga'

import { Name } from 'models/Analytics'
import { ErrorLevel } from 'models/ErrorReporting'
import { ID } from 'models/Identifiers'
import { isPremiumContentUSDCPurchaseGated } from 'models/Track'
import {
  getTokenAccountInfo,
  purchaseContent
} from 'services/audius-backend/solana'
import { accountSelectors } from 'store/account'
import {
  buyUSDCFlowFailed,
  buyUSDCFlowSucceeded,
  onrampOpened,
  onrampCanceled
} from 'store/buy-usdc/slice'
import { USDCOnRampProvider } from 'store/buy-usdc/types'
import { getUSDCUserBank } from 'store/buy-usdc/utils'
import { getTrack } from 'store/cache/tracks/selectors'
import { getUser } from 'store/cache/users/selectors'
import { getContext } from 'store/effects'
import { setVisibility } from 'store/ui/modals/slice'
import { BN_USDC_CENT_WEI } from 'utils/wallet'

import { pollPremiumTrack } from '../premium-content/sagas'
import { updatePremiumTrackStatus } from '../premium-content/slice'

import {
  buyUSDC,
  purchaseCanceled,
  purchaseConfirmed,
  purchaseSucceeded,
  usdcBalanceSufficient,
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

  const {
    blocknumber,
    premium_conditions: {
      usdc_purchase: { splits }
    }
  } = trackInfo

  return {
    blocknumber,
    splits
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
    const { price } = yield* call(getUSDCPremiumConditions, {
      contentId,
      contentType
    })

    // get user bank
    const userBank = yield* call(getUSDCUserBank)

    const { amount: initialBalance } = yield* call(
      getTokenAccountInfo,
      audiusBackendInstance,
      {
        mint: 'usdc',
        tokenAccount: userBank
      }
    )

    // buy USDC if necessary
    if (initialBalance.lt(new BN(price).mul(BN_USDC_CENT_WEI))) {
      yield* put(buyUSDC())
      yield* put(
        onrampOpened({
          provider: USDCOnRampProvider.STRIPE,
          purchaseInfo: {
            desiredAmount: price
          }
        })
      )

      const result = yield* race({
        success: take(buyUSDCFlowSucceeded),
        canceled: take(onrampCanceled),
        failed: take(buyUSDCFlowFailed)
      })

      // Return early for failure or cancellation
      if (result.canceled) {
        yield* put(purchaseCanceled())
        return
      } else if (result.failed) {
        yield* put(purchaseContentFlowFailed())
        return
      }
    }

    yield* put(usdcBalanceSufficient())

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
    yield* put(purchaseSucceeded())

    // confirm purchase
    yield* pollForPurchaseConfirmation({ contentId, contentType })

    // finish
    yield* put(purchaseConfirmed())

    yield* put(
      setVisibility({
        modal: 'PremiumContentPurchase',
        visible: false
      })
    )

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
