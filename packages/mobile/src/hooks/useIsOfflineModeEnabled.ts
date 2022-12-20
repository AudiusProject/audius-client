import { FeatureFlags } from '@audius/common'

import { useFeatureFlag } from './useRemoteConfig'

// DO NOT CHECK IN VALUE: true
const hardCodeOverride = true

// TODO: remove helpers when feature is shipped
export const useIsOfflineModeEnabled = () =>
  useFeatureFlag(FeatureFlags.OFFLINE_MODE_ENABLED).isEnabled ||
  hardCodeOverride
