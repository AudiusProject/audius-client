import { useField } from 'formik'

import type { ContextualSubmenuProps } from 'app/components/core'
import { ContextualSubmenu } from 'app/components/core'
import { useIsPremiumContentEnabled } from 'app/hooks/useIsPremiumContentEnabled'
import { useMemo } from 'react'

const messages = {
  trackVisibility: 'Track Visibility',
  availability: 'Availability',
  public: 'Public',
  collectibleGated: 'Collectible Gated',
  specialAccess: 'Special Access',
  followersOnly: 'Followers Only',
  supportersOnly: 'Supporters Only',
  hidden: 'Hidden',
  showGenre: 'Show Genre',
  showMood: 'Show Mood',
  showTags: 'Show Tags',
  showShareButton: 'Show Share Button',
  showPlayCount: 'Show Play Count'
}

const fieldVisibilityLabelMap = {
  genre: messages.showGenre,
  mood: messages.showMood,
  tags: messages.showTags,
  share: messages.showShareButton,
  play_count: messages.showPlayCount
}

const fieldVisibilityKeys = Object.keys(fieldVisibilityLabelMap)

type TrackVisibilityFieldProps = Partial<ContextualSubmenuProps>

export const TrackVisibilityField = (props: TrackVisibilityFieldProps) => {
  const [{ value: premiumConditions }] = useField('premium_conditions')
  const [{ value: isUnlisted }] = useField('is_unlisted')
  const [{ value: fieldVisibility }] = useField('field_visibility')

  const fieldVisibilityLabels = fieldVisibilityKeys
    .filter((visibilityKey) => fieldVisibility[visibilityKey])
    .map((visibilityKey) => fieldVisibilityLabelMap[visibilityKey])

  const trackAvailabilityLabels = useMemo(() => {
    if ('nft_collection' in (premiumConditions ?? {})) {
      return [messages.collectibleGated]
    }
    if (premiumConditions?.follow_user_id) {
      return [messages.specialAccess, messages.followersOnly]
    }
    if (premiumConditions?.tip_user_id) {
      return [messages.specialAccess, messages.supportersOnly]
    }
    if (isUnlisted) {
      return [messages.hidden, ...fieldVisibilityLabels]
    }
    return [messages.public]
  }, [premiumConditions, isUnlisted, fieldVisibility])

  const isPremiumContentEnabled = useIsPremiumContentEnabled()
  const label = isPremiumContentEnabled
    ? messages.availability
    : messages.trackVisibility
  const submenuScreenName = isPremiumContentEnabled
    ? 'Availability'
    : 'TrackVisibility'

  return (
    <ContextualSubmenu
      label={label}
      submenuScreenName={submenuScreenName}
      value={trackAvailabilityLabels}
      {...props}
    />
  )
}
