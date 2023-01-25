import { useState } from 'react'

import { TrackAvailabilityType } from '@audius/common'

import IconHidden from 'app/assets/images/iconHidden.svg'

import { CollectibleGatedAvailability } from '../components/CollectibleGatedAvailability'
import { HiddenAvailability } from '../components/HiddenAvailability'
import { PublicAvailability } from '../components/PublicAvailability'
import { SpecialAccessAvailability } from '../components/SpecialAccessAvailability'

import { ListSelectionScreen } from './ListSelectionScreen'

const messages = {
  title: 'Availability',
  description:
    "Hidden tracks won't show up on your profile. Anyone who has the link will be able to listen.",
  hideTrack: 'Hide Track',
  showGenre: 'Show Genre',
  showMood: 'Show Mood',
  showTags: 'Show Tags',
  showShareButton: 'Show Share Button',
  showPlayCount: 'Show Play Count'
}

const publicAvailability = TrackAvailabilityType.PUBLIC
const specialAccessAvailability = TrackAvailabilityType.SPECIAL_ACCESS
const collectibleGatedAvailability = TrackAvailabilityType.COLLECTIBLE_GATED
const hiddenAvailability = TrackAvailabilityType.HIDDEN

const data = [
  { label: publicAvailability, value: publicAvailability },
  { label: specialAccessAvailability, value: specialAccessAvailability },
  { label: collectibleGatedAvailability, value: collectibleGatedAvailability },
  { label: hiddenAvailability, value: hiddenAvailability }
]

const items = {
  [publicAvailability]: <PublicAvailability />,
  [specialAccessAvailability]: <SpecialAccessAvailability />,
  [collectibleGatedAvailability]: <CollectibleGatedAvailability />,
  [hiddenAvailability]: <HiddenAvailability />
}

export const TrackAvailabilityScreen = () => {
  const [availability, setAvailability] = useState(TrackAvailabilityType.PUBLIC)

  return (
    <ListSelectionScreen
      data={data}
      renderItem={({ item }) => items[item.label]}
      screenTitle={messages.title}
      icon={IconHidden}
      value={availability}
      onChange={setAvailability}
      disableSearch
    />
  )
}
