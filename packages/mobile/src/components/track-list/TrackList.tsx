import type { ReactElement } from 'react'
import { useCallback, useMemo } from 'react'

import type { ID, UID } from '@audius/common'
import type { FlatListProps } from 'react-native'
import { FlatList, View } from 'react-native'
import type { DraggableFlatListProps } from 'react-native-draggable-flatlist'
import DraggableFlatList from 'react-native-draggable-flatlist'

import * as haptics from 'app/haptics'

import type { TrackItemAction, TrackListItemProps } from './TrackListItem'
import { TrackListItem } from './TrackListItem'
import { TrackListItemSkeleton } from './TrackListItemSkeleton'

type TrackListProps = {
  hideArt?: boolean
  // Accept ids as well as uids because some use cases don't have uids available
  // For example the EditPlaylist track list
  ids?: ID[]
  contextPlaylistId?: ID
  isReorderable?: boolean
  onRemove?: (index: number) => void
  onReorder?: DraggableFlatListProps<UID | ID>['onDragEnd']
  onSave?: (isSaved: boolean, trackId: ID) => void
  showSkeleton?: boolean
  togglePlay?: (uid: string, trackId: ID) => void
  trackItemAction?: TrackItemAction
  uids?: UID[]
} & Partial<FlatListProps<UID | ID>> &
  Pick<TrackListItemProps, 'noDividerMargin' | 'showDivider' | 'showTopDivider'>

const noOp = () => {}
const keyExtractor = (item: string | number) => String(item)

/**
 * A FlatList of tracks
 *
 * If isReorderable === true, make sure the TrackList is not nested in a ScrollView,
 * otherwise certain features like auto scroll while dragging will not work
 */
export const TrackList = ({
  contextPlaylistId,
  hideArt,
  ids,
  isReorderable,
  noDividerMargin,
  onRemove,
  onReorder,
  onSave,
  showDivider,
  showSkeleton,
  showTopDivider,
  togglePlay,
  trackItemAction,
  uids,
  ...otherProps
}: TrackListProps) => {
  const data = useMemo(() => uids ?? ids ?? [], [uids, ids])

  const renderSkeletonTrack = useCallback(
    ({ index }) => (
      <TrackListItemSkeleton
        index={index}
        showDivider={showDivider}
        showTopDivider={showTopDivider}
        noDividerMargin={noDividerMargin}
      />
    ),
    [showDivider, noDividerMargin, showTopDivider]
  )

  const renderDraggableTrack: DraggableFlatListProps<UID | ID>['renderItem'] =
    useCallback(
      ({ item, index = -1, drag }) => {
        return (
          <TrackListItem
            id={ids && (item as ID)}
            contextPlaylistId={contextPlaylistId}
            index={index}
            drag={drag}
            hideArt={hideArt}
            isReorderable={isReorderable}
            uid={uids && (item as UID)}
            prevUid={uids && uids[index - 1]}
            key={item}
            onSave={onSave}
            togglePlay={togglePlay}
            trackItemAction={trackItemAction}
            onRemove={onRemove}
            showDivider={showDivider}
            showTopDivider={showTopDivider}
            noDividerMargin={noDividerMargin}
          />
        )
      },
      [
        contextPlaylistId,
        hideArt,
        ids,
        isReorderable,
        noDividerMargin,
        onRemove,
        onSave,
        showDivider,
        showTopDivider,
        togglePlay,
        trackItemAction,
        uids
      ]
    )

  const renderTrack: FlatListProps<UID | ID>['renderItem'] = useCallback(
    ({ item, index }) =>
      renderDraggableTrack({
        item,
        index,
        drag: noOp,
        isActive: false
      }) as ReactElement,
    [renderDraggableTrack]
  )

  if (showSkeleton)
    return (
      <FlatList {...otherProps} data={data} renderItem={renderSkeletonTrack} />
    )

  return isReorderable ? (
    <DraggableFlatList
      {...otherProps}
      autoscrollThreshold={200}
      data={data}
      keyExtractor={keyExtractor}
      onDragBegin={haptics.medium}
      onPlaceholderIndexChange={haptics.light}
      onDragEnd={onReorder}
      renderItem={renderDraggableTrack}
      renderPlaceholder={() => <View />}
    />
  ) : (
    <FlatList
      {...otherProps}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderTrack}
    />
  )
}
