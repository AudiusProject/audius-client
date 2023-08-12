import { call, takeEvery, put, select } from 'typed-redux-saga'

import { createStripeSession } from 'services/audius-backend/stripe'
import { getContext } from 'store/effects'

import { setVisibility } from '../modals/slice'

import { getStripeModalState } from './selectors'
import {
  cancelStripeOnramp,
  initializeStripeModal,
  stripeSessionCreated,
  stripeSessionStatusChanged
} from './slice'

function* handleInitializeStripeModal({
  payload: { amount, destinationCurrency, destinationWallet }
}: ReturnType<typeof initializeStripeModal>) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const res = yield* call(createStripeSession, audiusBackendInstance, {
    amount,
    destinationCurrency,
    destinationWallet
  })
  // TODO: Need to handle errors here?
  yield* put(stripeSessionCreated({ clientSecret: res.client_secret }))
}

function* handleStripeSessionChanged({
  payload: { status }
}: ReturnType<typeof stripeSessionStatusChanged>) {
  if (status === 'fulfillment_complete') {
    const { onRampSucceeded } = yield* select(getStripeModalState)
    if (onRampSucceeded) {
      yield* put(onRampSucceeded)
    }
    yield* put(setVisibility({ modal: 'StripeOnRamp', visible: 'closing' }))
  }
}

function* handleCancelStripeOnramp() {
  const { onRampCanceled } = yield* select(getStripeModalState)
  yield* put(setVisibility({ modal: 'StripeOnRamp', visible: 'closing' }))

  if (onRampCanceled) {
    yield* put(onRampCanceled)
  }
}

function* watchInitializeStripeModal() {
  yield takeEvery(initializeStripeModal, handleInitializeStripeModal)
}

function* watchStripeSessionChanged() {
  yield takeEvery(stripeSessionStatusChanged, handleStripeSessionChanged)
}

function* watchCancelStripeOnramp() {
  yield takeEvery(cancelStripeOnramp, handleCancelStripeOnramp)
}

export default function sagas() {
  return [
    watchInitializeStripeModal,
    watchStripeSessionChanged,
    watchCancelStripeOnramp
  ]
}
