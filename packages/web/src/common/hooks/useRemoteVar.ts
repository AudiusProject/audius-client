import { useMemo } from 'react'

import {
  AllRemoteConfigKeys,
  BooleanKeys,
  IntKeys,
  DoubleKeys,
  StringKeys,
  RemoteConfigInstance
} from '@audius/common'

export const createUseRemoteVarHook = (
  remoteConfigInstance: RemoteConfigInstance,
  configLoadedProvider: () => boolean
) => {
  function useRemoteVar(key: IntKeys): number
  function useRemoteVar(key: DoubleKeys): number
  function useRemoteVar(key: StringKeys): string
  function useRemoteVar(key: BooleanKeys): boolean
  function useRemoteVar(
    key: AllRemoteConfigKeys
  ): boolean | string | number | null {
    const configLoaded = configLoadedProvider()

    const remoteVar = useMemo(
      () => remoteConfigInstance.getRemoteVar(key),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [key, configLoaded, remoteConfigInstance]
    )
    return remoteVar
  }

  return useRemoteVar
}
