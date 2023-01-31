import { useEffect, useCallback } from 'react'

import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'
import { usePrevious } from 'react-use'

type OnBecomeReachable = () => any
type OnBecomeUnreachable = () => any

const { getIsReachable } = reachabilitySelectors

/**
 * Invoke a function once based on initial reachability
 * and when reachability changes
 */
export const useReachabilityEffect = (
  onBecomeReachable: OnBecomeReachable | null,
  onBecomeUnreachable: OnBecomeUnreachable | null
) => {
  const currentReachability = useSelector(getIsReachable)
  const prevReachability = usePrevious(currentReachability)

  const handleReachabilityStateChange = useCallback(
    (nextReachabilityState: boolean) => {
      if (nextReachabilityState && !prevReachability && onBecomeReachable) {
        console.info('Become reachable')
        onBecomeReachable()
      }
      if (
        !nextReachabilityState &&
        (prevReachability || prevReachability === undefined) &&
        onBecomeUnreachable
      ) {
        console.info('Become unreachable')
        onBecomeUnreachable()
      }
    },
    [onBecomeReachable, onBecomeUnreachable, prevReachability]
  )

  useEffect(() => {
    handleReachabilityStateChange(!!currentReachability)
  }, [currentReachability, handleReachabilityStateChange])

  return currentReachability
}

export const useReachableEffect = (onBecomeReachable: OnBecomeReachable) => {
  return useReachabilityEffect(onBecomeReachable, null)
}

export const useUnreachableEffect = (
  onBecomeUnreachable: OnBecomeUnreachable
) => {
  return useReachabilityEffect(null, onBecomeUnreachable)
}
