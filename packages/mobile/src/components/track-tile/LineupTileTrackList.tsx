import { LineupTrack } from 'audius-client/src/common/models/Track'
import { range } from 'lodash'
import { Pressable, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import Skeleton from 'app/components/skeleton'
import { getPlayingUid } from 'app/store/audio/selectors'
import { flexRowCentered, makeStyles } from 'app/styles'
import { GestureResponderHandler } from 'app/types/gesture'

// Max number of tracks to display
const DISPLAY_TRACK_COUNT = 5

type LineupTileTrackListProps = {
  isLoading?: boolean
  numLoadingSkeletonRows?: number
  onPress: GestureResponderHandler
  trackCount?: number
  tracks: LineupTrack[]
}

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  item: {
    ...flexRowCentered(),
    width: '100%',
    height: spacing(7),
    fontSize: typography.body,
    overflow: 'hidden',
    padding: spacing(3),
    fontWeight: typography.fontByWeight.medium
  },

  index: {
    color: palette.neutralLight4,
    marginRight: spacing(1)
  },

  title: {
    color: palette.neutral,
    maxWidth: 220,
    // TODO: truncation
    marginRight: spacing(1)
  },

  artist: {
    color: palette.neutralLight4
    // TODO: truncation
  },

  active: {
    color: palette.primary
  },

  divider: {
    marginVertical: spacing(3),
    width: '90%',
    borderTopWidth: 1,
    borderTopColor: palette.neutralLight8
  },

  more: {
    color: palette.neutralLight4
  }
}))

type TrackItemProps = {
  active: boolean
  showSkeleton?: boolean
  index: number
  track?: LineupTrack
}

const TrackItem = (props: TrackItemProps) => {
  const styles = useStyles()
  return (
    <>
      <View style={styles.divider} />
      <View style={styles.item}>
        {props.showSkeleton ? (
          <Skeleton width='100%' height='10' />
        ) : !props.track ? null : (
          <>
            <Text style={[styles.index, props.active && styles.active]}>
              {' '}
              {props.index + 1}{' '}
            </Text>
            <Text style={[styles.title, props.active && styles.active]}>
              {' '}
              {props.track.title}{' '}
            </Text>
            <Text style={styles.artist}> {`by ${props.track.user.name}`} </Text>
          </>
        )}
      </View>
    </>
  )
}

export const LineupTileTrackList = ({
  isLoading,
  numLoadingSkeletonRows,
  onPress,
  trackCount,
  tracks
}: LineupTileTrackListProps) => {
  const styles = useStyles()
  const playingUid = useSelector(getPlayingUid)

  if (!tracks.length && isLoading && numLoadingSkeletonRows) {
    return (
      <>
        {range(numLoadingSkeletonRows).map(i => (
          <TrackItem key={i} active={false} index={i} showSkeleton />
        ))}
      </>
    )
  }

  return (
    <Pressable onPress={onPress}>
      {tracks.slice(0, DISPLAY_TRACK_COUNT).map((track, index) => (
        <TrackItem
          key={track.uid}
          active={playingUid === track.uid}
          index={index}
          track={track}
        />
      ))}
      {trackCount && trackCount > 5 && (
        <>
          <View style={styles.divider} />
          <Text style={[styles.item as any, styles.more]}>
            {`+${trackCount - tracks.length} more tracks`}
          </Text>
        </>
      )}
    </Pressable>
  )
}
