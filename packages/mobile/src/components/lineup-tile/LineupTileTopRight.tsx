import type { PremiumConditions, Nullable } from '@audius/common'
import { formatLineupTileDuration } from '@audius/common'
import type { ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'
import type { SvgProps } from 'react-native-svg'

import IconCollectible from 'app/assets/images/iconCollectible.svg'
import IconHidden from 'app/assets/images/iconHidden.svg'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import IconStar from 'app/assets/images/iconStar.svg'
import IconUnlocked from 'app/assets/images/iconUnlocked.svg'
import Text from 'app/components/text'
import { useIsPremiumContentEnabled } from 'app/hooks/useIsPremiumContentEnabled'
import { flexRowCentered } from 'app/styles'
import { useColor, useThemeColors } from 'app/utils/theme'

import { useStyles as useTrackTileStyles } from './styles'

const messages = {
  artistPick: "Artist's Pick",
  hiddenTrack: 'Hidden Track',
  unlocked: 'Unlocked',
  collectibleGated: 'Collectible Gated',
  specialAccess: 'Special Access'
}

const flexRowEnd = (): ViewStyle => ({
  ...flexRowCentered(),
  justifyContent: 'flex-end'
})

const styles = StyleSheet.create({
  topRight: {
    ...flexRowEnd(),
    position: 'absolute',
    top: 10,
    right: 10,
    left: 0
  },
  item: {
    ...flexRowEnd(),
    marginRight: 8
  },
  icon: {
    marginRight: 4
  }
})

type ItemProps = {
  /**
   * Icon shown on the left hand side of the item
   */
  icon: React.FC<SvgProps>
  /**
   * Label shown on the right hand side of the item
   */
  label: string
  /**
   * Color of icon and label
   */
  color: string
}

const LineupTileTopRightItem = ({ icon: Icon, label, color }: ItemProps) => {
  const trackTileStyles = useTrackTileStyles()
  return (
    <View style={styles.item}>
      <Icon height={16} width={16} fill={color} style={styles.icon} />
      <Text style={{ ...trackTileStyles.statText, color }}>{label}</Text>
    </View>
  )
}

type Props = {
  /**
   * The duration of the track or tracks
   */
  duration?: number
  /**
   * Whether or not the track is the artist pick
   */
  isArtistPick?: boolean
  /**
   * Whether or not the track is a podcast
   */
  isPodcast?: boolean
  /**
   * Whether or not the track is unlisted (hidden)
   */
  isUnlisted?: boolean
  /**
   * Whether or not to show the artist pick icon
   */
  showArtistPick?: boolean
  /**
   * Whether logged in user is owner
   */
  isOwner?: boolean
  /**
   * Whether logged in user has access
   */
  doesUserHaveAccess?: boolean
  /**
   * Premium conditions to determine what icon and label to show
   */
  premiumConditions?: Nullable<PremiumConditions>
}

export const LineupTileTopRight = ({
  duration,
  isArtistPick,
  isPodcast,
  isUnlisted,
  showArtistPick,
  isOwner,
  doesUserHaveAccess,
  premiumConditions
}: Props) => {
  const isGatedContentEnabled = useIsPremiumContentEnabled()
  const { neutralLight4 } = useThemeColors()
  const accentBlue = useColor('accentBlue')
  const trackTileStyles = useTrackTileStyles()

  return (
    <View style={styles.topRight}>
      {isGatedContentEnabled &&
      !!premiumConditions &&
      !isOwner &&
      doesUserHaveAccess ? (
        <LineupTileTopRightItem
          icon={IconUnlocked}
          label={messages.unlocked}
          color={accentBlue}
        />
      ) : null}
      {isGatedContentEnabled &&
      !!premiumConditions &&
      (isOwner || !doesUserHaveAccess) ? (
        <LineupTileTopRightItem
          icon={
            premiumConditions.nft_collection
              ? IconCollectible
              : IconSpecialAccess
          }
          label={
            premiumConditions.nft_collection
              ? messages.collectibleGated
              : messages.specialAccess
          }
          color={accentBlue}
        />
      ) : null}
      {(!isGatedContentEnabled || !premiumConditions) &&
      showArtistPick &&
      isArtistPick ? (
        <LineupTileTopRightItem
          icon={IconStar}
          label={messages.artistPick}
          color={neutralLight4}
        />
      ) : null}
      {isUnlisted && (
        <LineupTileTopRightItem
          icon={IconHidden}
          label={messages.hiddenTrack}
          color={neutralLight4}
        />
      )}
      <Text style={trackTileStyles.statText}>
        {duration ? formatLineupTileDuration(duration, isPodcast) : null}
      </Text>
    </View>
  )
}
