import { View } from 'react-native'

import { Divider, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import IconHidden from 'app/assets/images/iconHidden.svg'
import { SwitchField } from '../fields'

const messages = {
  hidden: 'Hidden',
  hiddenSubtitle:
    "Hidden tracks won't be visible to your followers. Only you will see them on your profile. Anyone who has the link will be able to listen.",
  hideTrack: 'Hide Track',
  showGenre: 'Show Genre',
  showMood: 'Show Mood',
  showTags: 'Show Tags',
  showShareButton: 'Show Share Button',
  showPlayCount: 'Show Play Count'
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
  },
  selection: {
    marginTop: spacing(2),
    padding: spacing(4),
    backgroundColor: palette.neutralLight10,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2)
  },
  firstSwitch: {
    marginTop: 0
  },
  switch: {
    marginTop: spacing(2)
  }
}))

type TrackAvailabilitySelectionProps = {
  selected: boolean
  disabled?: boolean
}

export const HiddenAvailability = ({ selected, disabled = false }: TrackAvailabilitySelectionProps) => {
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
        <IconHidden style={titleIconStyles} />
        <Text weight='bold' style={titleStyles}>
          {messages.hidden}
        </Text>
      </View>
      <View style={styles.subtitleContainer}>
        <Text fontSize='medium' weight='medium' style={styles.subtitle}>
          {messages.hiddenSubtitle}
        </Text>
      </View>
      {selected && (
        <View style={styles.selection}>
          {/* <SwitchField name='is_unlisted' label={messages.hideTrack} style={styles.switch} /> */}
          <SwitchField name='field_visibility.genre' label={messages.showGenre} style={styles.firstSwitch} />
          <SwitchField name='field_visibility.mood' label={messages.showMood} style={styles.switch} />
          <SwitchField name='field_visibility.tags' label={messages.showTags} style={styles.switch} />
          <SwitchField
            name='field_visibility.share'
            label={messages.showShareButton}
            style={styles.switch} />
          <SwitchField
            name='field_visibility.play_count'
            label={messages.showPlayCount}
            style={styles.switch} />
        </View>
      )}
    </View>
  )
}
