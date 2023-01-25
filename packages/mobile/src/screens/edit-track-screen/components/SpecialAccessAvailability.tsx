import { View } from 'react-native'

import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import IconSpecialAccess from 'app/assets/images/iconSpecialAccess.svg'

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
    marginRight: spacing(2.5),
    fill: palette.neutral
  },
  selectedTitleIcon: {
    marginTop: 0,
    fill: palette.secondary
  },
  disabledTitleIcon: {
    marginTop: 0,
    fill: palette.neutralLight4
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

  const titleStyles: object[] = [styles.title]
  if (selected) {
    titleStyles.push(styles.selectedTitle)
  } else if (disabled) {
    titleStyles.push(styles.disabledTitle)
  }

  const titleIconStyles: object[] = [styles.titleIcon]
  if (selected) {
    titleIconStyles.push(styles.selectedTitleIcon)
  } else if (disabled) {
    titleIconStyles.push(styles.disabledTitleIcon)
  }

  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        <IconSpecialAccess style={titleIconStyles} />
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
