import type { ReactElement } from 'react'
import { useCallback, useMemo } from 'react'

import type { ID, UID } from '@audius/common'
import { playerSelectors } from '@audius/common'
import type { FlatListProps } from 'react-native'
import { FlatList, View } from 'react-native'
import type { DraggableFlatListProps } from 'react-native-draggable-flatlist'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useSelector } from 'react-redux'
import { usePrevious } from 'react-use'

import * as haptics from 'app/haptics'
import { makeStyles } from 'app/styles'

import type { TrackItemAction } from './TrackListItem'
import { TrackListItem } from './TrackListItem'
import { TrackListItemSkeleton } from './TrackListItemSkeleton'
const { getPlaying, getUid } = playerSelectors

type TrackListProps = {
  hideArt?: boolean
  // Accept ids as well as uids because some use cases don't have uids available
  // For example the EditPlaylist track list
  ids?: ID[]
  isReorderable?: boolean
  noDividerMargin?: boolean
  onRemove?: (index: number) => void
  onReorder?: DraggableFlatListProps<UID | ID>['onDragEnd']
  onSave?: (isSaved: boolean, trackId: ID) => void
  playingUid?: UID
  showDivider?: boolean
  showSkeleton?: boolean
  showTopDivider?: boolean
  togglePlay?: (uid: string, trackId: ID) => void
  trackItemAction?: TrackItemAction
  uids?: UID[]
} & Partial<FlatListProps<UID | ID>>

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

const noOp = () => {}

/**
 * A FlatList of tracks
 *
 * If isReorderable === true, make sure the TrackList is not nested in a ScrollView,
 * otherwise certain features like auto scroll while dragging will not work
 */
export const TrackList = ({
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
  const styles = useStyles()

  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getUid)
  const data = useMemo(() => uids ?? ids ?? [], [uids, ids])

  const renderSkeletonTrack = useCallback(
    ({ index }) => (
      <View>
        {showDivider && (showTopDivider || index > 0) ? (
          <View
            style={[styles.divider, noDividerMargin && styles.noMarginDivider]}
          />
        ) : null}
        <TrackListItemSkeleton />
      </View>
    ),
    [showDivider, noDividerMargin, showTopDivider, styles]
  )
  console.log('tracklist rerender')

  const renderDraggableTrack: DraggableFlatListProps<UID | ID>['renderItem'] =
    useCallback(
      ({ item, index = -1, drag }) => {
        const isActive = item !== undefined && item === playingUid

        // The dividers above and belove the active track should be hidden
        const hideDivider = isActive || (uids && uids[index - 1] === playingUid)

        console.log('rendering list item!!!')
        return (
          <View>
            {showDivider && (showTopDivider || index > 0) ? (
              <View
                style={[
                  styles.divider,
                  hideDivider && styles.hideDivider,
                  noDividerMargin && styles.noMarginDivider
                ]}
              />
            ) : null}
            <TrackListItem
              id={ids && (item as ID)}
              index={index}
              drag={drag}
              hideArt={hideArt}
              isActive={isActive}
              isPlaying={isPlaying}
              isReorderable={isReorderable}
              uid={uids && (item as UID)}
              key={item}
              onSave={onSave}
              togglePlay={togglePlay}
              trackItemAction={trackItemAction}
              onRemove={onRemove}
            />
          </View>
        )
      },
      [
        hideArt,
        ids,
        isPlaying,
        isReorderable,
        noDividerMargin,
        onRemove,
        onSave,
        playingUid,
        showDivider,
        showTopDivider,
        styles.divider,
        styles.hideDivider,
        styles.noMarginDivider,
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
      keyExtractor={(item) => String(item)}
      onDragBegin={haptics.light}
      onPlaceholderIndexChange={haptics.light}
      onDragEnd={onReorder}
      renderItem={renderDraggableTrack}
      renderPlaceholder={() => <View />}
    />
  ) : (
    <FlatList {...otherProps} data={data} renderItem={renderTrack} />
  )
}
