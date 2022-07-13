import { Action } from 'redux'
import { eventChannel } from 'redux-saga'
import { select, put, take, delay } from 'redux-saga/effects'

import { getLocationPathname } from 'store/routing/selectors'

import { isElectron } from './clientUtil'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

/**
 * Starts a polling daemon that triggers an action once every delay period if the tab/app is in the foreground/focus
 * @param action The action to "fire" when poll triggers
 * @param defaultDelayTimeMs the default time to wait between polls
 * @param customDelayTimeConfig a config that maps pathnames to delay times for custom delays depending on what page the user is on
 */
export function* foregroundPollingDaemon(
  action: Action,
  defaultDelayTimeMs: number,
  customDelayTimeConfig?: Record<string, number>
) {
  let isBrowserInBackground = false
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        isBrowserInBackground = true
      } else {
        isBrowserInBackground = false
      }
    },
    false
  )

  while (true) {
    if (!isBrowserInBackground || isElectron()) {
      yield put(action)
    }
    if (customDelayTimeConfig) {
      const currentRoute: string = yield select(getLocationPathname)
      if (customDelayTimeConfig[currentRoute]) {
        yield delay(customDelayTimeConfig[currentRoute])
      } else {
        yield delay(defaultDelayTimeMs)
      }
    } else {
      yield delay(defaultDelayTimeMs)
    }
  }
}

function createVisibilityChangeChannel() {
  if (NATIVE_MOBILE) {
    return eventChannel((emitter) => {
      // The focus and visibitychange events are wonky on native mobile webviews,
      // so poll for visiblity change instead
      let lastHidden = true
      const interval = setInterval(() => {
        if (!document.hidden && lastHidden) {
          emitter(true)
        }
        lastHidden = document.hidden
      }, 500)
      return () => {
        clearInterval(interval)
      }
    })
  }
  return eventChannel((emitter) => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        emitter(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })
}

/**
 * A polling daemon that triggers an action every time the tab/app is brought back into focus
 * @param action The action to "fire" when triggered
 */
export function* visibilityPollingDaemon(action: Action) {
  const visibilityChannel = createVisibilityChangeChannel()
  while (true) {
    yield take(visibilityChannel)
    yield put(action)
  }
}
