import { omit } from 'lodash'
import { takeEvery, call } from 'redux-saga/effects'

import { getContext } from 'common/store'
import {
  TRACK,
  IDENTIFY,
  RecordAnalyticsAction,
  IdentifyAnalyticsAction
} from 'store/analytics/actions'

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

// TODO: split track location across web & mobile
// function* trackLocation() {
//   const analytics = yield* getContext('analytics')
//   while (true) {
//     const {
//       payload: {
//         location: { pathname }
//       }
//     } = yield take(LOCATION_CHANGE)
//     if (pathname) {
//       if ((window as any).gtag) {
//         ;(window as any).gtag('config', process.env.GA_MEASUREMENT_ID, {
//           page_path: pathname
//         })
//       }
//       if ((window as any).adroll) {
//         ;(window as any).adroll.track('pageView')
//       }

//       if (NATIVE_MOBILE) {
//         const message = new ScreenAnalyticsEvent(pathname)
//         message.send()
//       } else {
//         // Dispatch a track event and then resolve page/screen events with segment
//         analytics.track({
//           eventName: Name.PAGE_VIEW,
//           properties: { route: pathname }
//         })
//       }
//     }
//   }
// }

export default function sagas() {
  return [
    initProviders,
    watchTrackEvent,
    watchIdentifyEvent
    // trackLocation
  ]
}
