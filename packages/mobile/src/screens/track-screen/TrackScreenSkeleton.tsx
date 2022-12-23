import { times, random } from 'lodash'
import { View } from 'react-native'

import { Screen, Tile, Text, Divider } from 'app/components/core'
import Skeleton from 'app/components/skeleton/Skeleton'
import { makeStyles } from 'app/styles'

const messages = {
  heading: 'Track'
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    margin: spacing(3)
  },
  content: {
    paddingVertical: spacing(3) + 2,
    paddingHorizontal: spacing(4)
  },
  heading: {
    alignItems: 'center'
  },
  headingText: {
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing(2)
  },
  trackArtwork: {
    borderWidth: 1,
    borderColor: palette.neutralLight8,
    borderRadius: 4,
    marginBottom: spacing(4),
    height: 195,
    width: 195
  },
  trackTitle: {
    marginVertical: spacing(2),
    height: 24,
    width: 200
  },
  artistName: {
    marginVertical: spacing(2),
    height: 24,
    width: 150
  },
  playButton: {
    marginVertical: spacing(2),
    height: 50,
    width: '100%'
  },
  socialActions: {
    flexDirection: 'row',
    marginVertical: spacing(2)
  },
  socialAction: {
    width: 25,
    height: 25,
    marginHorizontal: spacing(4)
  },
  divider: {
    width: '100%',
    marginVertical: spacing(2)
  },
  metrics: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: spacing(2)
  },
  metric: {
    height: 20,
    width: 30
  },
  metadataSection: {
    marginVertical: spacing(2),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap'
  },
  description: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing(3)
  },
  descriptionText: {
    height: 12,
    marginRight: spacing(1),
    marginBottom: spacing(2)
  },
  metadata: {
    width: '40%',
    height: 15,
    marginVertical: spacing(2),
    marginRight: spacing(3)
  }
}))

export const TrackScreenSkeleton = () => {
  const styles = useStyles()
  return (
    <Screen>
      <Tile styles={{ root: styles.root, content: styles.content }}>
        <View style={styles.heading}>
          <Text
            fontSize='small'
            weight='demiBold'
            color='neutralLight4'
            textTransform='uppercase'
            style={styles.headingText}
          >
            {messages.heading}
          </Text>
          <Skeleton style={styles.trackArtwork} />
          <Skeleton style={styles.trackTitle} />
          <Skeleton style={styles.artistName} />
          <Skeleton style={styles.playButton} />
          <View style={styles.socialActions}>
            <Skeleton style={styles.socialAction} />
            <Skeleton style={styles.socialAction} />
            <Skeleton style={styles.socialAction} />
            <Skeleton style={styles.socialAction} />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.metrics}>
            <Skeleton style={styles.metric} />
            <Skeleton style={styles.metric} />
            <Skeleton style={styles.metric} />
          </View>
          <View style={styles.description}>
            {times(random(5, 15), () => random(20, 100)).map(
              (elementWidth: number, i) => (
                <Skeleton
                  key={i}
                  noShimmer
                  style={[styles.descriptionText, { width: elementWidth }]}
                />
              )
            )}
          </View>
          <Divider style={styles.divider} />
          <View style={styles.metadataSection}>
            <Skeleton style={styles.metadata} />
            <Skeleton style={styles.metadata} />
            <Skeleton style={styles.metadata} />
          </View>
        </View>
      </Tile>
    </Screen>
  )
}
