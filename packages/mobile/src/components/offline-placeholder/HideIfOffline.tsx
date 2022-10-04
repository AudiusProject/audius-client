import type { ReactNode } from 'react'

import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

const { getIsReachable } = reachabilitySelectors

export type HideIfOfflineProps = {
  children: ReactNode
}

export const HideIfOffline = ({ children }: HideIfOfflineProps) => {
  const isReachable = useSelector(getIsReachable)
  return <>{isReachable ? children : null}</>
}
