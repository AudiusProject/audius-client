import { useEffect } from 'react'

import { useField } from 'formik'
import { Dimensions, View } from 'react-native'

import IconHidden from 'app/assets/images/iconHidden.svg'
import { Text } from 'app/components/core'
import { useSetTrackAvailabilityFields } from 'app/hooks/useSetTrackAvailabilityFields'
import { makeStyles } from 'app/styles'
import { useColor } from 'app/utils/theme'

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

const screenWidth = Dimensions.get('screen').width

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    width: screenWidth - spacing(22)
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    marginTop: 0
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
    marginTop: spacing(2)
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

export const HiddenAvailability = ({
  selected,
  disabled = false
}: TrackAvailabilitySelectionProps) => {
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
  const [{ value: isUnlisted }] = useField<boolean>('is_unlisted')

  // If hidden was not previously selected,
  // set hidden and reset other fields.
  useEffect(() => {
    if (!isUnlisted && selected) {
      setTrackAvailabilityFields(
        {
          is_unlisted: true,
          'field_visibility.share': false,
          'field_visibility.play_count': false
        },
        true
      )
    }
  }, [isUnlisted, selected, setTrackAvailabilityFields])

  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        <IconHidden style={styles.titleIcon} fill={titleIconColor} />
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
          <SwitchField
            name='field_visibility.genre'
            label={messages.showGenre}
            style={styles.firstSwitch}
          />
          <SwitchField
            name='field_visibility.mood'
            label={messages.showMood}
            style={styles.switch}
          />
          <SwitchField
            name='field_visibility.tags'
            label={messages.showTags}
            style={styles.switch}
          />
          <SwitchField
            name='field_visibility.share'
            label={messages.showShareButton}
            style={styles.switch}
          />
          <SwitchField
            name='field_visibility.play_count'
            label={messages.showPlayCount}
            style={styles.switch}
          />
        </View>
      )}
    </View>
  )
}
