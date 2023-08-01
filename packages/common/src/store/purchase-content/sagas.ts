import { takeLatest } from 'redux-saga/effects'
// import { call, put, race, select, take } from 'typed-redux-saga'

import {
  startPurchaseContentFlow
} from './slice'



function* doStartPurchaseContentFlow(action: ReturnType<typeof startPurchaseContentFlow>) {
  // Fetch content info
  // buy USDC if necessary
  // transfer USDC to content owner
  // confirm purchase
  // finish
}

function* watchStartPurchastContentFlow() {
  yield takeLatest(startPurchaseContentFlow, doStartPurchaseContentFlow)
}

export default function sagas() {
  return [watchStartPurchastContentFlow]
}
