import { useMemo, useState } from 'react'

import type { Nullable, PremiumConditions } from '@audius/common'
import { TrackAvailabilityType } from '@audius/common'
import { useField } from 'formik'
import { View, Text } from 'react-native'

import IconHidden from 'app/assets/images/iconHidden.svg'
import IconQuestionCircle from 'app/assets/images/iconQuestionCircle.svg'
import { useIsNFTGateEnabled } from 'app/hooks/useIsNFTGateEnabled'
import { useIsSpecialAccessGateEnabled } from 'app/hooks/useIsSpecialAccessGateEnabled'
import { makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

import { CollectibleGatedAvailability } from '../components/CollectibleGatedAvailability'
import { HiddenAvailability } from '../components/HiddenAvailability'
import { PublicAvailability } from '../components/PublicAvailability'
import { SpecialAccessAvailability } from '../components/SpecialAccessAvailability'
import type { RemixOfField } from '../types'

import type { ListSelectionData } from './ListSelectionScreen'
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
  showPlayCount: 'Show Play Count',
  markedAsRemix:
    'This track is marked as a remix. To enable additional availability options, unmark within Remix Settings.'
}

const publicAvailability = TrackAvailabilityType.PUBLIC
const specialAccessAvailability = TrackAvailabilityType.SPECIAL_ACCESS
const collectibleGatedAvailability = TrackAvailabilityType.COLLECTIBLE_GATED
const hiddenAvailability = TrackAvailabilityType.HIDDEN

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  isRemix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(4),
    marginHorizontal: spacing(4),
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    backgroundColor: palette.neutralLight9,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2)
  },
  isRemixText: {
    fontFamily: typography.fontByWeight.medium,
    fontSize: typography.fontSize.medium,
    color: palette.neutral
  },
  questionIcon: {
    marginRight: spacing(4),
    width: spacing(5),
    height: spacing(5)
  }
}))

const MarkedAsRemix = () => {
  const styles = useStyles()
  const neutral = useColor('neutral')
  const [{ value: remixOf }] = useField<RemixOfField>('remix_of')

  return remixOf ? (
    <View style={styles.isRemix}>
      <IconQuestionCircle style={styles.questionIcon} fill={neutral} />
      <Text style={styles.isRemixText}>{messages.markedAsRemix}</Text>
    </View>
  ) : null
}

export const TrackAvailabilityScreen = () => {
  const isSpecialAccessGateEnabled = useIsSpecialAccessGateEnabled()
  const isNFTGateEnabled = useIsNFTGateEnabled()

  const [{ value: isPremium }] = useField<boolean>('is_premium')
  const [{ value: premiumConditions }] =
    useField<Nullable<PremiumConditions>>('premium_conditions')
  const [{ value: isUnlisted }] = useField<boolean>('is_unlisted')
  const [{ value: remixOf }] = useField<RemixOfField>('remix_of')

  const initialAvailability = useMemo(() => {
    if ('nft_collection' in (premiumConditions ?? {})) {
      return TrackAvailabilityType.COLLECTIBLE_GATED
    }
    if (isPremium) {
      return TrackAvailabilityType.SPECIAL_ACCESS
    }
    if (isUnlisted) {
      return TrackAvailabilityType.HIDDEN
    }
    return TrackAvailabilityType.PUBLIC
    // we only care about what the initial value was here
    // eslint-disable-next-line
  }, [])

  const [availability, setAvailability] =
    useState<TrackAvailabilityType>(initialAvailability)

  const data: ListSelectionData[] = [
    { label: publicAvailability, value: publicAvailability },
    {
      label: specialAccessAvailability,
      value: specialAccessAvailability,
      disabled: !!remixOf
    },
    {
      label: collectibleGatedAvailability,
      value: collectibleGatedAvailability,
      disabled: !!remixOf
    },
    { label: hiddenAvailability, value: hiddenAvailability }
  ]

  const items = {
    [publicAvailability]: (
      <PublicAvailability
        selected={availability === TrackAvailabilityType.PUBLIC}
        disabled={false}
      />
    ),
    [specialAccessAvailability]: isSpecialAccessGateEnabled ? (
      <SpecialAccessAvailability
        selected={availability === TrackAvailabilityType.SPECIAL_ACCESS}
        disabled={!!remixOf}
      />
    ) : null,
    [collectibleGatedAvailability]: isNFTGateEnabled ? (
      <CollectibleGatedAvailability
        selected={availability === TrackAvailabilityType.COLLECTIBLE_GATED}
        disabled={!!remixOf}
      />
    ) : null,
    [hiddenAvailability]: (
      <HiddenAvailability
        selected={availability === TrackAvailabilityType.HIDDEN}
        disabled={false}
      />
    )
  }

  return (
    <ListSelectionScreen
      data={data}
      renderItem={({ item }) => items[item.label]}
      screenTitle={messages.title}
      icon={IconHidden}
      value={availability}
      onChange={setAvailability}
      disableSearch
      allowDeselect={false}
      hideSelectionLabel
      header={<MarkedAsRemix />}
    />
  )
}
