import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import { FlatList, FlatListProps, View } from 'react-native'
import { useSelector } from 'react-redux'

import { getPlaying, getPlayingUid } from 'app/store/audio/selectors'
import { makeStyles } from 'app/styles'

import { TrackItemAction, TrackListItem } from './TrackListItem'
import { TrackMetadata, TrackMetadataLineup } from './types'

type TrackListProps = {
  filterFn?: (track: TrackMetadata) => boolean
  hideArt?: boolean
  isReorderable?: boolean
  noDividerMargin?: boolean
  onRemove?: (index: number) => void
  onReorder?: (index1: number, index2: number) => void
  onSave?: (isSaved: boolean, trackId: ID) => void
  playingUid?: UID
  showDivider?: boolean
  showTopDivider?: boolean
  togglePlay?: (uid: string, trackId: ID) => void
  trackItemAction?: TrackItemAction
  tracks: TrackMetadataLineup
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  divider: {
    borderBottomColor: palette.neutralLight7,
    borderBottomWidth: 1,
    marginVertical: 0,
    marginHorizontal: spacing(6)
  },
  noMarginDivider: {
    borderBottomColor: palette.neutralLight8,
    marginHorizontal: 0
  },
  hideDivider: {
    opacity: 0
  }
}))

export const TrackList = ({
  filterFn,
  hideArt,
  isReorderable,
  noDividerMargin,
  onSave,
  showDivider,
  showTopDivider,
  togglePlay,
  trackItemAction,
  tracks
}: TrackListProps) => {
  const styles = useStyles()

  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getPlayingUid)

  const renderTrack: FlatListProps<TrackMetadata>['renderItem'] = ({
    item: track,
    index
  }) => {
    const isActive = track.uid !== undefined && track.uid === playingUid

    // The dividers above and belove the active track should be hidden
    const hideDivider =
      isActive || tracks.entries[index - 1]?.uid === playingUid

    return (
      <View>
        {showDivider && (showTopDivider || index > 0) ? (
          <View
            style={[
              styles.divider,
              hideDivider && styles.hideDivider,
              noDividerMargin ? styles.noMarginDivider : {}
            ]}
          />
        ) : null}
        <TrackListItem
          hideArt={hideArt}
          isActive={isActive}
          isPlaying={isPlaying}
          isReorderable={isReorderable}
          track={track}
          key={track.track_id}
          onSave={onSave}
          togglePlay={togglePlay}
          trackItemAction={trackItemAction}
        />
      </View>
    )
  }

  return (
    <FlatList
      data={tracks.entries.filter(filterFn ?? (() => true))}
      renderItem={renderTrack}
    />
  )
}
