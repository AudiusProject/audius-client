import { View } from 'react-native'

import { Link, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import IconCollectible from 'app/assets/images/iconCollectible.svg'
import { useColor } from 'app/utils/theme'
import IconArrow from 'app/assets/images/iconArrow.svg'
import { useSetTrackAvailabilityFields } from 'app/hooks/useSetTrackAvailabilityFields'
import { useEffect } from 'react'

const messages = {
  collectibleGated: 'Collectible Gated',
  collectibleGatedSubtitle:
    'Users who own a digital collectible matching your selection will have access to your track. Collectible gated content does not appear on trending or in user feeds.',
  learnMore: 'Learn More'
}

const LEARN_MORE_URL = ''

const useStyles = makeStyles(({ typography, spacing, palette }) => ({
  root: {
    width: spacing(76)
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    marginTop: 0,
  },
  selectedTitle: {
    color: palette.secondary
  },
  disabledTitle: {
    color: palette.neutralLight4
  },
  titleIcon: {
    marginTop: 0,
    marginRight: spacing(2.5)
  },
  subtitleContainer: {
    marginTop: spacing(2),
  },
  subtitle: {
    color: palette.neutral
  },
  learnMore: {
    marginTop: spacing(4),
    flexDirection: 'row',
    alignItems: 'center'
  },
  learnMoreText: {
    marginRight: spacing(0.5),
    fontFamily: typography.fontByWeight.bold,
    fontSize: typography.fontSize.small,
    color: palette.secondary
  }
}))

type TrackAvailabilitySelectionProps = {
  selected: boolean
  disabled?: boolean
}

export const CollectibleGatedAvailability = ({ selected, disabled = false }: TrackAvailabilitySelectionProps) => {
  const styles = useStyles()
  const secondary = useColor('secondary')
  const neutral = useColor('neutral')
  const neutralLight4 = useColor('neutralLight4')

  const titleStyles: object[] = [styles.title]
  if (selected) {
    titleStyles.push(styles.selectedTitle)
  } else if (disabled) {
    titleStyles.push(styles.disabledTitle)
  }

  const titleIconColor = selected
    ? secondary
    : disabled
      ? neutralLight4
      : neutral

  const { set: setTrackAvailabilityFields } = useSetTrackAvailabilityFields()

  useEffect(() => {
    if (selected) {
      setTrackAvailabilityFields({
        'is_premium': true,
        'premium_conditions': { nft_collection: undefined }
      },
        true
      )
    }
  }, [selected])

  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        <IconCollectible style={styles.titleIcon} fill={titleIconColor} />
        <Text weight='bold' style={titleStyles}>
          {messages.collectibleGated}
        </Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text fontSize='medium' weight='medium' style={styles.subtitle}>
          {messages.collectibleGatedSubtitle}
        </Text>
      </View>
      <Link url={LEARN_MORE_URL} style={styles.learnMore}>
        <Text style={styles.learnMoreText}>
          {messages.learnMore}
        </Text>
        <IconArrow fill={secondary} width={16} height={16} />
      </Link>
    </View>
  )
}
