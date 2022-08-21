import { CommonStoreContext } from 'common/store'
import * as analytics from 'services/analytics'
import { apiClient } from 'services/audius-api-client'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { env } from 'services/env'
import { fingerprintClient } from 'services/fingerprint'
import { localStorage } from 'services/local-storage'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { remoteConfigInstance } from 'services/remote-config/remote-config-instance'
import { walletClient } from 'services/wallet-client'

import { getLineupSelectorForRoute } from './lineup/lineupForRoute'

export const storeContext: CommonStoreContext = {
  getLocalStorageItem: async (key) => window.localStorage.getItem(key),
  setLocalStorageItem: async (key, value) =>
    window.localStorage.setItem(key, value),
  getFeatureEnabled,
  analytics,
  remoteConfigInstance,
  audiusBackendInstance,
  apiClient,
  fingerprintClient,
  walletClient,
  localStorage,
  isNativeMobile: false,
  env,
  getLineupSelectorForRoute
}
