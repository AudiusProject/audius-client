import { useState } from 'react'

import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import { View } from 'react-native'
import DraggableFlatList, {
  DraggableFlatListProps
} from 'react-native-draggable-flatlist'
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
  onReorder?: DraggableFlatListProps<TrackMetadata>['onDragEnd']
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
  onRemove,
  onReorder,
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

  const [scrollEnable, setScrollEnable] = useState(true)

  const renderTrack: DraggableFlatListProps<TrackMetadata>['renderItem'] = ({
    item: track,
    index = -1,
    drag,
    isActive: isDragActive
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
          index={index}
          drag={drag}
          hideArt={hideArt}
          isActive={isActive}
          isPlaying={isPlaying}
          isReorderable={isReorderable}
          track={track}
          key={track.track_id}
          onSave={onSave}
          togglePlay={togglePlay}
          trackItemAction={trackItemAction}
          onRemove={onRemove}
        />
      </View>
    )
  }

  return (
    <DraggableFlatList
      activationDistance={scrollEnable ? 100 : 1}
      data={tracks.entries.filter(filterFn ?? (() => true))}
      keyExtractor={(track, index) => `${track.track_id} ${index}`}
      onDragBegin={() => setScrollEnable(false)}
      onDragEnd={p => {
        onReorder?.(p)
        setScrollEnable(true)
      }}
      renderItem={renderTrack}
    />
  )
}
