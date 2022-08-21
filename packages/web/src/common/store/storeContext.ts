import {
  AnalyticsEvent,
  FeatureFlags,
  LineupState,
  RemoteConfigInstance,
  Track
} from '@audius/common'

import { AudiusAPIClient } from 'common/services/audius-api-client'
import { AudiusBackend } from 'common/services/audius-backend'
import { Env } from 'common/services/env'
import { FingerprintClient } from 'common/services/fingerprint'
import { LocalStorage } from 'common/services/local-storage'
import { WalletClient } from 'common/services/wallet-client'

import { CommonState } from './reducers'

export type CommonStoreContext = {
  getLocalStorageItem: (key: string) => Promise<string | null>
  setLocalStorageItem: (key: string, value: string) => Promise<void>
  getFeatureEnabled: (flag: FeatureFlags) => Promise<boolean | null>
  analytics: {
    init: () => Promise<void>
    track: (event: AnalyticsEvent, callback?: () => void) => Promise<void>
    identify: (
      handle: string,
      traits?: Record<string, unknown>,
      options?: Record<string, unknown>,
      callback?: () => void
    ) => Promise<void>
  }
  remoteConfigInstance: RemoteConfigInstance
  audiusBackendInstance: AudiusBackend
  apiClient: AudiusAPIClient
  fingerprintClient: FingerprintClient
  walletClient: WalletClient
  localStorage: LocalStorage
  isNativeMobile: boolean
  env: Env

  // A helper that returns the appropriate lineup selector for the current
  // route or screen.
  getLineupSelectorForRoute?: () => (state: CommonState) => LineupState<Track>
}
