import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlags, RemoteConfigInstance } from '@audius/common'

export const FEATURE_FLAG_OVERRIDE_KEY = 'FeatureFlagOverride'

export type OverrideSetting = 'enabled' | 'disabled' | null

/**
 * Helper for when to recompute flag state, used by both FeatureFlags
 * and RemoteConfig. Recomputes when:
 * - User logs in (account is seen in store)
 * - Config loads
 * - User ID is set on Optimizely (seen by event emission)
 **/
const useRecomputeBool = (
  useAccountProvider: () => boolean,
  configLoaded: boolean,
  remoteConfigInstance: RemoteConfigInstance
) => {
  const [shouldRecompute, setShouldRecompute] = useState(false)

  const hasAccount = useAccountProvider()

  // Flip recompute bool whenever account or config state changes
  useEffect(() => {
    setShouldRecompute((recompute) => !recompute)
  }, [hasAccount, configLoaded])

  // Register callback for remote config account set,
  // which flips recompute bool
  const onUserStateChange = useCallback(() => {
    setShouldRecompute((recompute) => !recompute)
  }, [])

  useEffect(() => {
    remoteConfigInstance.listenForUserId(onUserStateChange)
    return () => remoteConfigInstance.unlistenForUserId(onUserStateChange)
  }, [onUserStateChange, remoteConfigInstance])

  return shouldRecompute
}

/**
 * Hooks into updates for a given feature flag.
 * Returns both `isLoaded` and `isEnabled` for more granular control
 * @param flag
 */
export const createUseFeatureFlagHook =
  ({
    remoteConfigInstance,
    getLocalStorageItem,
    setLocalStorageItem,
    useAccountProvider,
    useConfigLoadedProvider
  }: {
    remoteConfigInstance: RemoteConfigInstance
    getLocalStorageItem?: (key: string) => string | null
    setLocalStorageItem?: (key: string, value: string | null) => void
    useAccountProvider: () => boolean
    useConfigLoadedProvider: () => boolean
  }) =>
  (flag: FeatureFlags) => {
    const overrideKey = `${FEATURE_FLAG_OVERRIDE_KEY}:${flag}`
    const configLoaded = useConfigLoadedProvider()

    const shouldRecompute = useRecomputeBool(
      useAccountProvider,
      configLoaded,
      remoteConfigInstance
    )

    const setOverride = (value: OverrideSetting) => {
      setLocalStorageItem?.(overrideKey, value)
    }
    const isEnabled = useMemo(
      () => {
        const override = getLocalStorageItem?.(overrideKey) as OverrideSetting
        if (override === 'enabled') return true
        if (override === 'disabled') return false

        return remoteConfigInstance.getFeatureEnabled(flag)
      },
      // We want configLoaded and shouldRecompute to trigger refreshes of the memo
      // eslint-disable-next-line
      [flag, configLoaded, shouldRecompute]
    )
    return { isLoaded: configLoaded, isEnabled, setOverride }
  }
