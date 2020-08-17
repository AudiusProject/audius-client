import { useSelector } from 'react-redux'
import { AppState } from 'store/types'
import { useMemo } from 'react'
import {
  getFeatureEnabled,
  FeatureFlags,
  AllRemoteConfigKeys,
  getRemoteVar,
  BooleanKeys,
  IntKeys,
  DoubleKeys,
  StringKeys
} from 'services/remote-config'

export const useFlag = (flag: FeatureFlags) => {
  const configLoaded = useSelector(
    (state: AppState) => state.remoteConfig.remoteConfigLoaded
  )
  // eslint complains about configLoaded as part of the deps array
  // eslint-disable-next-line
  const isEnabled = useMemo(() => getFeatureEnabled(flag), [flag, configLoaded])
  return isEnabled
}

export function useRemoteVar(key: IntKeys): number
export function useRemoteVar(key: DoubleKeys): number
export function useRemoteVar(key: StringKeys): string
export function useRemoteVar(key: BooleanKeys): boolean
export function useRemoteVar(
  key: AllRemoteConfigKeys
): boolean | string | number | null {
  const configLoaded = useSelector(
    (state: AppState) => state.remoteConfig.remoteConfigLoaded
  )
  // eslint complains about configLoaded as part of the deps array
  // eslint-disable-next-line
  const remoteVar = useMemo(() => getRemoteVar(key), [key, configLoaded])
  return remoteVar
}
