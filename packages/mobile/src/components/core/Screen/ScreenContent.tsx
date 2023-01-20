import type { ReactNode } from 'react'

import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import type { OfflinePlaceholderProps } from 'app/components/offline-placeholder'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'

const { getIsReachable } = reachabilitySelectors

export type ScreenContentProps = OfflinePlaceholderProps & {
  children: ReactNode
  isOfflineCapable?: boolean
}

export const ScreenContent = ({
  children,
  isOfflineCapable,
  ...other
}: ScreenContentProps) => {
  const isReachable = useSelector(getIsReachable)
  return (
    <>
      {isReachable || isOfflineCapable ? (
        children
      ) : (
        <OfflinePlaceholder {...other} />
      )}
    </>
  )
}
