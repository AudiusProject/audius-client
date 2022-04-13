import { ID } from 'audius-client/src/common/models/Identifiers'
import { View } from 'react-native'

import IconArrow from 'app/assets/images/iconArrow.svg'
import IconRemix from 'app/assets/images/iconRemix.svg'
import { Button, Tile, GradientText } from 'app/components/core'
import { flexRowCentered, makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

import { TrackScreenRemix } from './TrackScreenRemix'

const messages = {
  title: 'Remixes',
  viewAll: (count: number | null) =>
    `View All ${count && count > 6 ? `${count} ` : ''}Remixes`
}

type TrackScreenRemixesProps = {
  trackIds: ID[]
  onPressGoToRemixes: () => void
  count: number | null
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  tile: {
    padding: spacing(6)
  },

  header: {
    ...flexRowCentered(),
    justifyContent: 'center',
    marginBottom: spacing(6)
  },

  headerText: {
    lineHeight: 30,
    fontSize: 28
  },

  iconRemix: {
    height: spacing(12),
    width: spacing(12),
    marginRight: spacing(2)
  },

  tracks: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },

  track: {
    marginHorizontal: spacing(3),
    marginBottom: spacing(5)
  },

  button: {
    backgroundColor: palette.secondary
  }
}))

export const TrackScreenRemixes = ({
  trackIds,
  onPressGoToRemixes,
  count
}: TrackScreenRemixesProps) => {
  const styles = useStyles()
  const { pageHeaderGradientColor2 } = useThemeColors()
  return (
    <Tile styles={{ tile: styles.tile }}>
      <View style={styles.header}>
        <IconRemix style={styles.iconRemix} fill={pageHeaderGradientColor2} />
        <GradientText style={styles.headerText}>{messages.title}</GradientText>
      </View>
      <View style={styles.tracks}>
        {trackIds.map(id => {
          return <TrackScreenRemix id={id} key={id} style={styles.track} />
        })}
      </View>
      <Button
        title={messages.viewAll(count)}
        icon={IconArrow}
        variant='primary'
        size='medium'
        onPress={onPressGoToRemixes}
        styles={{
          root: styles.button
        }}
      />
    </Tile>
  )
}
