import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Name, PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import Kind from 'audius-client/src/common/models/Kind'
import Status from 'audius-client/src/common/models/Status'
import { range } from 'lodash'
import {
  Dimensions,
  SectionList as RNSectionList,
  StyleSheet,
  View
} from 'react-native'

import { SectionList } from 'app/components/core'
import {
  CollectionTile,
  TrackTile,
  LineupTileSkeleton
} from 'app/components/lineup-tile'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useScrollToTop } from 'app/hooks/useScrollToTop'
import { make, track } from 'app/utils/analytics'

import { Delineator } from './Delineator'
import { delineateByTime } from './delineate'
import {
  LineupItem,
  LineupProps,
  LineupVariant,
  LoadingLineupItem
} from './types'

// The max number of tiles to load
const MAX_TILES_COUNT = 1000

// The max number of loading tiles to display if count prop passes
const MAX_COUNT_LOADING_TILES = 18

// The inital multiplier for number of tracks to fetch on lineup load
// multiplied by the number of tracks that fit the screen height
export const INITIAL_LOAD_TRACKS_MULTIPLIER = 1.75
export const INITIAL_PLAYLISTS_MULTIPLER = 1

// A multiplier for the number of tiles to fill a page to be
// loaded in on each call (after the intial call)
const TRACKS_AHEAD_MULTIPLIER = 0.75

// Threshold for how far away from the bottom (of the list) the user has to be
// before fetching more tracks as a percentage of the list height
const LOAD_MORE_THRESHOLD = 0.5

// The minimum inital multiplier for tracks to fetch on lineup load
// use so that multiple lineups on the same page can switch w/out a reload
const MINIMUM_INITIAL_LOAD_TRACKS_MULTIPLIER = 1

// tile height + margin
const totalTileHeight = {
  main: 152 + 16,
  playlist: 350
}

// Helper to calculate an item count based on the Lineup variant and a multiplier
export const getItemCount = (
  variant: LineupVariant,
  multiplier: number | (() => number)
) =>
  Math.ceil(
    (Dimensions.get('window').height / totalTileHeight[variant]) *
      (typeof multiplier === 'function' ? multiplier() : multiplier)
  )

// Calculate minimum, initial, and loadMore itemCounts
const useItemCounts = (variant: LineupVariant) =>
  useMemo(
    () => ({
      minimum: getItemCount(
        variant === LineupVariant.PLAYLIST
          ? LineupVariant.PLAYLIST
          : LineupVariant.MAIN,
        MINIMUM_INITIAL_LOAD_TRACKS_MULTIPLIER
      ),
      initial: getItemCount(variant, () =>
        variant === LineupVariant.PLAYLIST
          ? INITIAL_PLAYLISTS_MULTIPLER
          : INITIAL_LOAD_TRACKS_MULTIPLIER
      ),
      loadMore: getItemCount(variant, TRACKS_AHEAD_MULTIPLIER)
    }),
    [variant]
  )

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  item: {
    padding: 12,
    paddingBottom: 0
  }
})

type Section = {
  delineate: boolean
  hasLeadingElement?: boolean
  title?: string
  data: Array<LineupItem | LoadingLineupItem>
}

/** `Lineup` encapsulates the logic for displaying a list of items such as Tracks (e.g. prefetching items
 * displaying loading states, etc).
 */
export const Lineup = ({
  actions,
  count,
  delineate,
  disableTopTabScroll,
  fetchPayload,
  header,
  isTrending,
  leadingElementId,
  leadingElementDelineator,
  lineup,
  loadMore,
  rankIconCount = 0,
  refresh,
  refreshing,
  showLeadingElementArtistPick = true,
  start = 0,
  variant = LineupVariant.MAIN,
  listKey,
  selfLoad,
  includeLineupStatus,
  limit = Infinity,
  ...listProps
}: LineupProps) => {
  const dispatchWeb = useDispatchWeb()
  const ref = useRef<RNSectionList>(null)
  const [isPastLoadThreshold, setIsPastLoadThreshold] = useState(false)
  useScrollToTop(() => {
    ref.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: true
    })
  }, disableTopTabScroll)

  const itemCounts = useItemCounts(variant)

  // Item count based on the current page
  const pageItemCount =
    itemCounts.initial + (lineup.page - 1) * itemCounts.loadMore

  // Either the provided count or a default
  const countOrDefault = count !== undefined ? count : MAX_TILES_COUNT

  const handleLoadMore = useCallback(() => {
    const {
      deleted = 0,
      nullCount = 0,
      entries,
      hasMore,
      page,
      status
    } = lineup

    const lineupLength = entries.length
    const offset = lineupLength + deleted + nullCount

    const shouldLoadMore =
      // Lineup has more items to load
      hasMore &&
      // Number of loaded items does not exceed max count
      lineupLength < countOrDefault &&
      // Page item count doesn't exceed current offset
      (page === 0 || pageItemCount <= offset) &&
      entries.length < limit &&
      (includeLineupStatus ? status !== Status.LOADING : true)

    if (shouldLoadMore) {
      const itemLoadCount = itemCounts.initial + page * itemCounts.loadMore

      dispatchWeb(actions.setPage(page + 1))

      const limit =
        Math.min(itemLoadCount, Math.max(countOrDefault, itemCounts.minimum)) -
        offset

      if (loadMore) {
        loadMore(offset, limit, page === 0)
      } else {
        dispatchWeb(
          actions.fetchLineupMetadatas(offset, limit, page === 0, fetchPayload)
        )
      }
    }
  }, [
    actions,
    countOrDefault,
    dispatchWeb,
    fetchPayload,
    includeLineupStatus,
    itemCounts,
    limit,
    lineup,
    loadMore,
    pageItemCount
  ])

  // When scrolled past the end threshold of the lineup and the lineup is not loading,
  // trigger another load
  useEffect(() => {
    if (isPastLoadThreshold && lineup.status !== Status.LOADING) {
      handleLoadMore()
    }
  }, [isPastLoadThreshold, lineup.status, handleLoadMore])

  useEffect(() => {
    if (selfLoad && lineup.entries.length === 0) {
      handleLoadMore()
    }
  }, [handleLoadMore, selfLoad, lineup])

  const togglePlay = useCallback(
    ({
      uid,
      id,
      source,
      isPlayingUid,
      isPlaying
    }: {
      uid: UID
      id: ID
      source: PlaybackSource
      isPlayingUid: boolean
      isPlaying: boolean
    }) => {
      // setImmediate prevents this cpu-intensive callback from firing until
      // the lineup-tile press animation finishes. This may not be needed when
      // we remove the web-view.
      setImmediate(() => {
        if (!isPlayingUid || !isPlaying) {
          dispatchWeb(actions.play(uid))
          track(
            make({
              eventName: Name.PLAYBACK_PLAY,
              id: `${id}`,
              source: source || PlaybackSource.TRACK_TILE
            })
          )
        } else {
          dispatchWeb(actions.pause())
          track(
            make({
              eventName: Name.PLAYBACK_PAUSE,
              id: `${id}`,
              source: source || PlaybackSource.TRACK_TILE
            })
          )
        }
      })
    },
    [actions, dispatchWeb]
  )

  const getLineupTileComponent = (item: LineupItem) => {
    if (item.kind === Kind.TRACKS || item.track_id) {
      if (item._marked_deleted) {
        return null
      }
      return TrackTile
    } else if (item.kind === Kind.COLLECTIONS || item.playlist_id) {
      return CollectionTile
    }
    return null
  }

  const renderItem = ({
    index,
    item
  }: {
    index: number
    item: LineupItem | LoadingLineupItem
  }) => {
    if (!item) return null
    if ('_loading' in item) {
      if (item._loading) {
        return (
          <View style={styles.item}>
            <LineupTileSkeleton />
          </View>
        )
      }
    } else {
      const LineupTile = getLineupTileComponent(item)
      if (LineupTile) {
        return (
          <View style={styles.item}>
            <LineupTile
              {...item}
              index={index}
              isTrending={isTrending}
              showArtistPick={
                showLeadingElementArtistPick && !!leadingElementId
              }
              showRankIcon={index < rankIconCount}
              togglePlay={togglePlay}
              uid={item.uid}
            />
          </View>
        )
      }
    }
    return null
  }

  // Calculate the sections of data to provide to SectionList
  const sections: Section[] = useMemo(() => {
    const { deleted, entries, hasMore, isMetadataLoading, page } = lineup

    const items = entries.slice(start, count)
    const itemDisplayCount = page <= 1 ? itemCounts.initial : pageItemCount

    const getSkeletonCount = () => {
      const shouldCalculateSkeletons =
        items.length < limit &&
        // Lineup has more items to load
        hasMore &&
        // Data is loading or about to start
        (items.length === 0 || isMetadataLoading) &&
        // There are fewer items than the max count
        items.length < countOrDefault

      if (shouldCalculateSkeletons) {
        // Calculate the number of skeletons to display: total # requested - # rendered - # deleted
        // If the `count` prop is provided, render the count - # loaded tiles
        const loadingSkeletonDifferential = Math.max(
          itemDisplayCount - items.length - deleted,
          0
        )
        return count
          ? Math.min(count - items.length, MAX_COUNT_LOADING_TILES)
          : loadingSkeletonDifferential
      }
      return 0
    }

    const skeletonItems = range(getSkeletonCount()).map(
      () => ({ _loading: true } as LoadingLineupItem)
    )

    if (delineate) {
      return [
        ...delineateByTime(items),
        {
          delineate: false,
          data: skeletonItems
        }
      ]
    }

    if (leadingElementId && showLeadingElementArtistPick) {
      const [artistPick, ...restEntries] = [...items, ...skeletonItems]

      return [
        { delineate: false, data: [artistPick] },
        { delineate: true, data: restEntries, hasLeadingElement: true }
      ]
    }

    const data = [...items, ...skeletonItems]

    if (data.length === 0) return []

    return [
      {
        delineate: false,
        data: data
      }
    ]
  }, [
    count,
    countOrDefault,
    delineate,
    itemCounts,
    lineup,
    pageItemCount,
    leadingElementId,
    showLeadingElementArtistPick,
    start,
    limit
  ])

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - LOAD_MORE_THRESHOLD * layoutMeasurement.height
      ) {
        if (!isPastLoadThreshold) {
          setIsPastLoadThreshold(true)
        }
      } else {
        if (isPastLoadThreshold) {
          setIsPastLoadThreshold(false)
        }
      }
    },
    [isPastLoadThreshold]
  )

  return (
    <View style={styles.root}>
      <SectionList
        {...listProps}
        ref={ref}
        onScroll={handleScroll}
        ListHeaderComponent={header}
        ListFooterComponent={<View style={{ height: 16 }} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={LOAD_MORE_THRESHOLD}
        onRefresh={refresh}
        refreshing={refreshing}
        sections={sections}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item, index) => `${item?.id}  ${index}`}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => {
          if (section.delineate) {
            if (section.hasLeadingElement && leadingElementDelineator) {
              return leadingElementDelineator
            }
            return <Delineator text={section.title} />
          }
          return null
        }}
        listKey={listKey}
        scrollIndicatorInsets={{ right: Number.MIN_VALUE }}
      />
    </View>
  )
}
