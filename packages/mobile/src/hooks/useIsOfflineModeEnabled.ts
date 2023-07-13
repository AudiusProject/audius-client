import { FeatureFlags } from '@audius/common'

import { useFeatureFlag } from './useRemoteConfig'

// TODO: remove helpers when feature is shipped
export const useIsOfflineModeEnabled = () =>
  useFeatureFlag(FeatureFlags.OFFLINE_MODE_RELEASE).isEnabled
