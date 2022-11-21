import type { CommonState, Nullable, Track } from '@audius/common'
import { averageColorSelectors } from '@audius/common'
import { Dimensions, View } from 'react-native'
import { Shadow } from 'react-native-shadow-2'
import { useSelector } from 'react-redux'

import { TrackImage } from 'app/components/track-image/TrackImage'
import { makeStyles } from 'app/styles'
const { getDominantColorsByTrack } = averageColorSelectors

const dimensions = Dimensions.get('window')
const spacing = 24

const useStyles = makeStyles(({ palette }) => ({
  root: {
    marginLeft: spacing,
    marginRight: spacing,
    maxHeight: dimensions.width - spacing * 2,
    alignSelf: 'center'
  },
  shadow: {
    alignSelf: 'flex-start'
  },
  image: {
    alignSelf: 'center',
    borderRadius: 8,
    borderColor: palette.white,
    borderWidth: 2,
    overflow: 'hidden',
    height: '100%',
    width: '100%',
    aspectRatio: 1
  }
}))

type ArtworkProps = {
  track: Nullable<Track>
}

export const Artwork = ({ track }: ArtworkProps) => {
  const styles = useStyles()

  const dominantColors = useSelector((state: CommonState) =>
    getDominantColorsByTrack(state, {
      track
    })
  )

  let shadowColor = 'rgba(0,0,0,0.05)'
  const dominantColor = dominantColors ? dominantColors[0] : null
  if (dominantColor) {
    const { r, g, b } = dominantColor
    shadowColor = `rgba(${r.toFixed()},${g.toFixed()},${b.toFixed()},0.1)`
  }

  return (
    <View style={styles.root}>
      <Shadow
        viewStyle={styles.shadow}
        offset={[0, 1]}
        radius={15}
        distance={10}
        startColor={shadowColor}
      >
        <View style={styles.image}>
          <TrackImage track={track} />
        </View>
      </Shadow>
    </View>
  )
}
