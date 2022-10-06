import {
  reachabilityActions,
  reachabilitySelectors,
  getContext
} from '@audius/common'
import { delay, take, select, race } from 'typed-redux-saga'

const { getIsReachable } = reachabilitySelectors
const REACHABILITY_TIMEOUT_MS = 8 * 1000

export function* awaitReachability() {
  const isNativeMobile = yield* getContext('isNativeMobile')
  const isReachable = yield* select(getIsReachable)
  if (isReachable || !isNativeMobile) return true
  const { action } = yield* race({
    action: take(reachabilityActions.SET_REACHABLE),
    delay: delay(REACHABILITY_TIMEOUT_MS)
  })
  return !!action
}
