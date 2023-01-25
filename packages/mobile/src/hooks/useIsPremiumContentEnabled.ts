import { FeatureFlags } from '@audius/common'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { getIsIOS } from "audius-client/src/utils/browser"

// This will be removed after the launch of premium content.
// For now, it helps us handle feature flagging the
// release of premium content on different mobile os.
export const useIsPremiumContentEnabled = () => {
  const isIos = getIsIOS()
  const { isEnabled: isAndroidPremiumContentEnabled } = useFeatureFlag(FeatureFlags.ANDROID_PREMIUM_CONTENT_ENABLED)
  const { isEnabled: isIosPremiumContentEnabled } = useFeatureFlag(FeatureFlags.IOS_PREMIUM_CONTENT_ENABLED)
  return useFeatureFlag(FeatureFlags.PREMIUM_CONTENT_ENABLED) && (
    isIos ? isIosPremiumContentEnabled : isAndroidPremiumContentEnabled
  )
}
