import type { CoverArtSizes, Track } from '@audius/common'
import { View } from 'react-native'

import IconPause from 'app/assets/images/pbIconPauseAlt.svg'
import IconPlay from 'app/assets/images/pbIconPlayAlt.svg'
import { DynamicImage } from 'app/components/core'
import { useTrackCoverArt } from 'app/hooks/useTrackCoverArt'
import { makeStyles } from 'app/styles'

type TrackArtworkProps = {
  track: Track
  isActive?: boolean
  isPlaying: boolean
  coverArtSizes: CoverArtSizes
}

const useStyles = makeStyles(({ spacing }) => ({
  artworkContainer: {
    height: 52,
    width: 52,
    marginRight: spacing(4)
  },
  image: {
    borderRadius: 4
  },
  artworkIcon: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.4)'
  }
}))

export const TrackArtwork = (props: TrackArtworkProps) => {
  const { isPlaying, isActive, track } = props
  const styles = useStyles()

  const { source, handleError } = useTrackCoverArt(track)

  const ActiveIcon = isPlaying ? IconPause : IconPlay

  return (
    <DynamicImage
      source={source}
      onError={handleError}
      styles={{ root: styles.artworkContainer, image: styles.image }}
    >
      {isActive ? (
        <View style={styles.artworkIcon}>
          <ActiveIcon />
        </View>
      ) : null}
    </DynamicImage>
  )
}
