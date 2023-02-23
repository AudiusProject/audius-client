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
  onBecomeUnreachable: OnBecomeUnreachable | null,
  // Determine if this effect should be called on first render
  // in addition to reachability changes
  includeFirstRender = true
) => {
  const currentReachability = useSelector(getIsReachable)
  const prevReachability = usePrevious(currentReachability)

  const handleReachabilityStateChange = useCallback(
    (nextReachabilityState: boolean) => {
      const wasUnreachable = includeFirstRender
        ? !prevReachability
        : prevReachability !== undefined && !prevReachability

      const wasReachable = includeFirstRender
        ? prevReachability
        : prevReachability !== undefined && prevReachability

      if (nextReachabilityState && wasUnreachable && onBecomeReachable) {
        onBecomeReachable()
      } else if (
        !nextReachabilityState &&
        wasReachable &&
        onBecomeUnreachable
      ) {
        onBecomeUnreachable()
      }
    },
    [
      onBecomeReachable,
      onBecomeUnreachable,
      prevReachability,
      includeFirstRender
    ]
  )

  useEffect(() => {
    handleReachabilityStateChange(!!currentReachability)
  }, [currentReachability, handleReachabilityStateChange])
}

export const useReachableEffect = (
  onBecomeReachable: OnBecomeReachable,
  includeFirstRender = true
) => {
  useReachabilityEffect(onBecomeReachable, null, includeFirstRender)
}

export const useUnreachableEffect = (
  onBecomeUnreachable: OnBecomeUnreachable,
  includeFirstRender = true
) => {
  useReachabilityEffect(null, onBecomeUnreachable, includeFirstRender)
}
