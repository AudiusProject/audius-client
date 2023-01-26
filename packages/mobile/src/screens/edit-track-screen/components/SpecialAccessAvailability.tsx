import { View } from 'react-native'

import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'
import { useColor } from 'app/utils/theme'
import { useSetTrackAvailabilityFields } from 'app/hooks/useSetTrackAvailabilityFields'
import { useEffect } from 'react'

const messages = {
  specialAccess: 'Special Access',
  specialAccessSubtitle:
    'Special Access tracks are only available to users who meet certain criteria, such as following the artist.'
}

const useStyles = makeStyles(({ spacing, palette }) => ({
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
  }
}))

type TrackAvailabilitySelectionProps = {
  selected: boolean
  disabled?: boolean
}

export const SpecialAccessAvailability = ({ selected, disabled = false }: TrackAvailabilitySelectionProps) => {
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
        'premium_conditions': { follow_user_id: 1 }
      },
        true
      )
    }
  }, [selected])

  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        <IconSpecialAccess style={styles.titleIcon} fill={titleIconColor} />
        <Text weight='bold' style={titleStyles}>
          {messages.specialAccess}
        </Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text fontSize='medium' weight='medium' style={styles.subtitle}>
          {messages.specialAccessSubtitle}
        </Text>
      </View>
    </View>
  )
}
