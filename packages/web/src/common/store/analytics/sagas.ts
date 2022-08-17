import { omit } from 'lodash'
import { takeEvery, call } from 'redux-saga/effects'

import { getContext } from 'common/store'
import {
  TRACK,
  IDENTIFY,
  RecordAnalyticsAction,
  IdentifyAnalyticsAction
} from 'common/store/analytics/actions'

function* trackEventAsync(action: RecordAnalyticsAction) {
  const analytics = yield* getContext('analytics')
  const { callback, eventName, ...properties } = action
  yield call(
    analytics.track,
    {
      eventName,
      properties: omit(properties, 'type')
    },
    callback
  )
}

function* identifyEventAsync(action: IdentifyAnalyticsAction) {
  const analytics = yield* getContext('analytics')
  yield call(analytics.identify, action.handle, action.traits)
}

function* watchTrackEvent() {
  yield takeEvery(TRACK, trackEventAsync)
}

function* watchIdentifyEvent() {
  yield takeEvery(IDENTIFY, identifyEventAsync)
}

function* initProviders() {
  const analytics = yield* getContext('analytics')
  yield call(analytics.init)
}

export default function sagas() {
  return [initProviders, watchTrackEvent, watchIdentifyEvent]
}
