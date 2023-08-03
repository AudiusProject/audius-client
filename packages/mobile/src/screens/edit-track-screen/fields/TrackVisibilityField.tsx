import { useMemo } from 'react'

import {
  isPremiumContentFollowGated,
  type FieldVisibility,
  type Nullable,
  type PremiumConditions,
  isPremiumContentTipGated
} from '@audius/common'
import { useField } from 'formik'

import type { ContextualMenuProps } from 'app/components/core'
import { ContextualMenu } from 'app/components/core'

const messages = {
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

type TrackVisibilityFieldProps = Partial<ContextualMenuProps>

export const TrackVisibilityField = (props: TrackVisibilityFieldProps) => {
  const [{ value: premiumConditions }] =
    useField<Nullable<PremiumConditions>>('premium_conditions')
  const [{ value: isUnlisted }] = useField<boolean>('is_unlisted')
  const [{ value: fieldVisibility }] =
    useField<FieldVisibility>('field_visibility')

  const fieldVisibilityLabels = fieldVisibilityKeys
    .filter((visibilityKey) => fieldVisibility[visibilityKey])
    .map((visibilityKey) => fieldVisibilityLabelMap[visibilityKey])

  const trackAvailabilityLabels = useMemo(() => {
    if ('nft_collection' in (premiumConditions ?? {})) {
      return [messages.collectibleGated]
    }
    if (isPremiumContentFollowGated(premiumConditions)) {
      return [messages.specialAccess, messages.followersOnly]
    }
    if (isPremiumContentTipGated(premiumConditions)) {
      return [messages.specialAccess, messages.supportersOnly]
    }
    if (isUnlisted) {
      return [messages.hidden, ...fieldVisibilityLabels]
    }
    return [messages.public]
  }, [premiumConditions, isUnlisted, fieldVisibilityLabels])

  return (
    <ContextualMenu
      label={messages.availability}
      menuScreenName={messages.availability}
      value={trackAvailabilityLabels}
      {...props}
    />
  )
}
