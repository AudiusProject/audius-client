import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, race, select, take } from 'typed-redux-saga'

import { Name } from 'models/Analytics'
import { ErrorLevel } from 'models/ErrorReporting'
import {
  createUserBankIfNeeded,
  deriveUserBankPubkey,
  getTokenAccountInfo,
  pollForBalanceChange
} from 'services/audius-backend/solana'
import { IntKeys } from 'services/remote-config'
import { getContext } from 'store/effects'
import { getFeePayer } from 'store/solana/selectors'
import { setVisibility } from 'store/ui/modals/slice'
import { initializeStripeModal } from 'store/ui/stripe-modal/slice'

import { getBuyUSDCProvider } from './selectors'
import {
  buyUSDCFlowFailed,
  buyUSDCFlowSucceeded,
  onRampCanceled,
  onRampOpened,
  onRampSucceeded,
  startBuyUSDCFlow
} from './slice'
import { USDCOnRampProvider } from './types'

// TODO: Configurable min/max usdc purchase amounts?
function* getBuyUSDCRemoteConfig() {
  // const DEFAULT_MIN_AUDIO_PURCHASE_AMOUNT = 5
  // const DEFAULT_MAX_AUDIO_PURCHASE_AMOUNT = 999
  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  yield* call([remoteConfigInstance, remoteConfigInstance.waitForRemoteConfig])
  // const minAudioAmount =
  //   remoteConfigInstance.getRemoteVar(IntKeys.MIN_AUDIO_PURCHASE_AMOUNT) ??
  //   DEFAULT_MIN_AUDIO_PURCHASE_AMOUNT
  // const maxAudioAmount =
  //   remoteConfigInstance.getRemoteVar(IntKeys.MAX_AUDIO_PURCHASE_AMOUNT) ??
  //   DEFAULT_MAX_AUDIO_PURCHASE_AMOUNT
  const retryDelayMs =
    remoteConfigInstance.getRemoteVar(IntKeys.BUY_AUDIO_WALLET_POLL_DELAY_MS) ??
    undefined
  const maxRetryCount =
    remoteConfigInstance.getRemoteVar(
      IntKeys.BUY_AUDIO_WALLET_POLL_MAX_RETRIES
    ) ?? undefined
  return {
    // minAudioAmount,
    // maxAudioAmount,
    maxRetryCount,
    retryDelayMs
  }
}

/**
 * Derives a USDC user bank for a given eth address, creating it if necessary.
 * Defaults to the wallet of the current user.
 */
export function* getUSDCUserBank(ethAddress?: string) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const { track } = yield* getContext('analytics')
  const feePayerOverride = yield* select(getFeePayer)
  if (!feePayerOverride) {
    throw new Error('getUSDCUserBank: unexpectedly no fee payer override')
  }
  yield* call(createUserBankIfNeeded, audiusBackendInstance, {
    ethAddress,
    feePayerOverride,
    mint: 'usdc',
    recordAnalytics: track
  })

  // TODO: Any errors to handle here?
  return yield* call(deriveUserBankPubkey, audiusBackendInstance, {
    ethAddress,
    mint: 'usdc'
  })
}

type PurchaseStepParams = {
  desiredAmount: number
  tokenAccount: PublicKey
  provider: USDCOnRampProvider
  retryDelayMs?: number
  maxRetryCount?: number
}

function* purchaseStep({
  desiredAmount,
  tokenAccount,
  provider,
  retryDelayMs,
  maxRetryCount
}: PurchaseStepParams) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const { track, make } = yield* getContext('analytics')
  const initialAccountInfo = yield* call(
    getTokenAccountInfo,
    audiusBackendInstance,
    {
      mint: 'usdc',
      tokenAccount
    }
  )
  const initialBalance = initialAccountInfo.amount

  // Wait for on ramp finish
  const result = yield* race({
    success: take(onRampSucceeded),
    canceled: take(onRampCanceled)
  })

  // If the user didn't complete the on ramp flow, return early
  if (result.canceled) {
    yield* call(
      track,
      make({ eventName: Name.BUY_USDC_ON_RAMP_CANCELED, provider })
    )
    return {}
  }
  yield* call(
    track,
    make({ eventName: Name.BUY_USDC_ON_RAMP_SUCCESS, provider })
  )

  // Wait for the funds to come through
  const newBalance = yield* call(pollForBalanceChange, audiusBackendInstance, {
    tokenAccount,
    initialBalance,
    retryDelayMs,
    maxRetryCount
  })

  // Check that we got the requested amount
  const purchasedAmount = new BN(newBalance).sub(new BN(initialBalance))
  if (purchasedAmount !== new BN(desiredAmount)) {
    console.warn(
      `Warning: Purchase USDC amount differs from expected. Actual: ${new BN(
        newBalance
      )
        .sub(new BN(initialBalance))
        .toNumber()} Wei. Expected: ${desiredAmount / 100} USDC.`
    )
  }

  return { newBalance }
}

function* doBuyUSDC({
  payload: { desiredAmount }
}: ReturnType<typeof onRampOpened>) {
  const reportToSentry = yield* getContext('reportToSentry')
  const userBank = yield* getUSDCUserBank()
  const { track, make } = yield* getContext('analytics')
  const provider = yield* select(getBuyUSDCProvider)

  try {
    if (provider !== USDCOnRampProvider.STRIPE) {
      throw new Error('USDC Purchase is only supported via Stripe')
    }

    yield* put(
      initializeStripeModal({
        amount: desiredAmount.toString(),
        destinationCurrency: 'usdc',
        destinationWallet: userBank.toString(),
        onRampCanceled,
        onRampSucceeded
      })
    )

    yield* put(setVisibility({ modal: 'StripeOnRamp', visible: true }))

    // Record start
    yield* call(
      track,
      make({ eventName: Name.BUY_USDC_ON_RAMP_OPENED, provider })
    )

    // Setup

    // Get config
    const { retryDelayMs, maxRetryCount } = yield* call(getBuyUSDCRemoteConfig)

    // Wait for purchase
    // Have to do some typescript finangling here due to the "race" effect in purchaseStep
    // See https://github.com/agiledigital/typed-redux-saga/issues/43
    const { newBalance } = (yield* call(purchaseStep, {
      provider,
      desiredAmount,
      tokenAccount: userBank,
      retryDelayMs,
      maxRetryCount
    }) as unknown as ReturnType<typeof purchaseStep>)!

    // If the user canceled the purchase, stop the flow
    if (newBalance === undefined) {
      return
    }

    yield* put(buyUSDCFlowSucceeded())

    // Record success
    yield* call(
      track,
      make({
        eventName: Name.BUY_USDC_SUCCESS,
        provider,
        requestedAmount: desiredAmount
        // TODO: actualAmount
      })
    )
  } catch (e) {
    yield* call(reportToSentry, {
      level: ErrorLevel.Error,
      error: e as Error,
      additionalInfo: { userBank }
    })
    yield* put(buyUSDCFlowFailed())
    yield* call(
      track,
      make({
        eventName: Name.BUY_USDC_FAILURE,
        provider,
        requestedAmount: desiredAmount,
        error: (e as Error).message
      })
    )
  }
}

function* doStartBuyUSDCFlow(action: ReturnType<typeof startBuyUSDCFlow>) {
  // This is a placeholder action to handle a general buy usdc flow.
  // For now, it will just open the onramp using the provided values
  yield* put(onRampOpened(action.payload.purchaseInfo))
}

function* watchOnRampOpened() {
  yield takeLatest(onRampOpened, doBuyUSDC)
}

function* watchStartBuyUSDCFlow() {
  yield takeLatest(startBuyUSDCFlow, doStartBuyUSDCFlow)
}

export default function sagas() {
  return [watchOnRampOpened, watchStartBuyUSDCFlow]
}
