import { Name, getContext } from '@audius/common'
import { LOCATION_CHANGE } from 'connected-react-router'
import { take } from 'redux-saga/effects'

function* trackLocation() {
  const analytics = yield* getContext('analytics')
  while (true) {
    const {
      payload: {
        location: { pathname }
      }
    } = yield take(LOCATION_CHANGE)
    if (pathname) {
      if ((window as any).gtag) {
        ;(window as any).gtag('config', process.env.GA_MEASUREMENT_ID, {
          page_path: pathname
        })
      }
      if ((window as any).adroll) {
        ;(window as any).adroll.track('pageView')
      }

      // Dispatch a track event and then resolve page/screen events with segment
      analytics.track({
        eventName: Name.PAGE_VIEW,
        properties: { route: pathname }
      })
    }
  }
}

export default function sagas() {
  return [trackLocation]
}
