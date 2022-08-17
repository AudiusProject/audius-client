import { useCallback } from 'react'

import { Name, AllTrackingEvents } from '@audius/common'
import { useDispatch as useDispatchRedux } from 'react-redux'

/** UI EVENTS */
export const IDENTIFY = 'ANALYTICS/IDENTIFY'
export const TRACK = 'ANALYTICS/TRACK'

export const identify = (handle: string, traits?: Record<string, any>) => ({
  type: IDENTIFY,
  handle,
  traits
})

export type IdentifyAnalyticsAction = {
  type: typeof IDENTIFY
  handle: string
  traits: Record<string, any>
}

export type RecordAnalyticsAction = AllTrackingEvents & {
  type: typeof TRACK
  callback?: () => void
  options?: Record<string, any>
}

export const make = <U extends Name, T>(
  eventName: U,
  m: T
): {
  eventName: U
  type: typeof TRACK
} & T => ({
  type: TRACK,
  eventName,
  ...m
})

export const useRecord = () => {
  const dispatch = useDispatchRedux()
  const record = useCallback(
    (action: RecordAnalyticsAction) => dispatch(action),
    [dispatch]
  )
  return record
}
