import type { Nullable, PremiumConditions } from '@audius/common'

export type TrackAvailabilitySelectionProps = {
  selected: boolean
  disabled?: boolean
  disabledContent?: boolean
  initialPremiumConditions?: Nullable<PremiumConditions>
}
