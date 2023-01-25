import { useField } from 'formik'

import type { ContextualSubmenuProps } from 'app/components/core'
import { ContextualSubmenu } from 'app/components/core'
import { useIsPremiumContentEnabled } from 'app/hooks/useIsPremiumContentEnabled'

const messages = {
  trackVisibility: 'Track Visibility',
  availability: 'Availability',
  public: 'Public',
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
  const [{ value: isUnlisted }] = useField('is_unlisted')
  const [{ value: fieldVisibility }] = useField('field_visibility')

  const trackVisibilityLabel = isUnlisted ? messages.hidden : messages.public
  const fieldVisibilityLabels = fieldVisibilityKeys
    .filter((visibilityKey) => fieldVisibility[visibilityKey])
    .map((visibilityKey) => fieldVisibilityLabelMap[visibilityKey])

  const values = [trackVisibilityLabel, ...fieldVisibilityLabels]

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
      value={values}
      {...props}
    />
  )
}
