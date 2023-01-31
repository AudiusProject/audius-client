import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ID, UID, PlaybackSource } from '@audius/common'
import { Kind, Status } from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { range } from 'lodash'
import type { SectionList as RNSectionList } from 'react-native'
import { Dimensions, StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { SectionList } from 'app/components/core'
import {
  CollectionTile,
  TrackTile,
  LineupTileSkeleton
} from 'app/components/lineup-tile'
import { useReachableEffect } from 'app/hooks/useReachabilityEffect'
import { useScrollToTop } from 'app/hooks/useScrollToTop'

import { Delineator } from './Delineator'
import { delineateByTime } from './delineate'
import type {
  LineupProps,
  LoadingLineupItem,
  LineupItem,
  LineupItemTileProps,
  LineupTileViewProps
} from './types'
import { LineupVariant } from './types'

type TogglePlayConfig = {
  uid: UID
  id: ID
  source: PlaybackSource
}

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

const fallbackLineupSelector = (() => {}) as any

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

const SkeletonTrackTileView = memo(function SkeletonTrackTileView() {
  return (
    <View style={styles.item}>
      <LineupTileSkeleton />
    </View>
  )
})

const LineupTileView = memo(function LineupTileView({
  item,
  index,
  isTrending,
  showLeadingElementArtistPick,
  leadingElementId,
  rankIconCount,
  togglePlay
}: LineupTileViewProps) {
  const LineupTile = getLineupTileComponent(item)

  if (LineupTile) {
    return (
      <View style={styles.item}>
        <LineupTile
          {...item}
          index={index}
          isTrending={isTrending}
          showArtistPick={showLeadingElementArtistPick && !!leadingElementId}
          showRankIcon={index < rankIconCount}
          togglePlay={togglePlay}
          uid={item.uid}
        />
      </View>
    )
  } else {
    return null
  }
})

const LineupItemTile = memo(function LineupItemTile({
  item,
  index,
  isTrending,
  showLeadingElementArtistPick,
  leadingElementId,
  rankIconCount,
  togglePlay
}: LineupItemTileProps) {
  if (!item) return null
  if ('_loading' in item) {
    if (item._loading) {
      return <SkeletonTrackTileView />
    }
  } else {
    return (
      <LineupTileView
        item={item}
        index={index}
        isTrending={isTrending}
        showLeadingElementArtistPick={showLeadingElementArtistPick}
        leadingElementId={leadingElementId}
        rankIconCount={rankIconCount}
        togglePlay={togglePlay}
      />
    )
  }
  return null
})

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
  LineupEmptyComponent,
  isTrending,
  leadingElementId,
  leadingElementDelineator,
  lineup: lineupProp,
  lineupSelector = fallbackLineupSelector,
  loadMore,
  pullToRefresh,
  rankIconCount = 0,
  refresh: refreshProp,
  refreshing: refreshingProp,
  showLeadingElementArtistPick = true,
  start = 0,
  variant = LineupVariant.MAIN,
  listKey,
  selfLoad,
  includeLineupStatus,
  limit = Infinity,
  extraFetchOptions,
  ListFooterComponent,
  ...listProps
}: LineupProps) => {
  const dispatch = useDispatch()
  const ref = useRef<RNSectionList>(null)
  const [isPastLoadThreshold, setIsPastLoadThreshold] = useState(false)
  const [refreshing, setRefreshing] = useState(refreshingProp)
  const selectedLineup = useSelector(lineupSelector)
  const lineup = selectedLineup ?? lineupProp
  const { status, entries } = lineup
  const lineupLength = entries.length

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    dispatch(actions.refreshInView(true))
  }, [dispatch, actions])

  useEffect(() => {
    if (status !== Status.LOADING) {
      setRefreshing(false)
    }
  }, [status])

  const refresh = refreshProp ?? handleRefresh

  const handleInView = useCallback(() => {
    dispatch(actions.setInView(true))
  }, [dispatch, actions])

  useFocusEffect(handleInView)

  const itemCounts = useItemCounts(variant)

  // Item count based on the current page
  const pageItemCount =
    itemCounts.initial + (lineup.page - 1) * itemCounts.loadMore

  // Either the provided count or a default
  const countOrDefault = count !== undefined ? count : MAX_TILES_COUNT

  const handleLoadMore = useCallback(
    (reset?: boolean) => {
      const {
        deleted = 0,
        nullCount = 0,
        entries,
        hasMore,
        page,
        status
      } = lineup

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

      if (shouldLoadMore || reset) {
        const _offset = reset ? offset : 0
        const _page = reset ? page : 0
        const itemLoadCount = itemCounts.initial + _page * itemCounts.loadMore

        if (!reset) {
          dispatch(actions.setPage(page + 1))
        }

        const limit =
          Math.min(
            itemLoadCount,
            Math.max(countOrDefault, itemCounts.minimum)
          ) - _offset

        if (loadMore) {
          loadMore(_offset, limit, _page === 0)
        } else {
          dispatch(
            actions.fetchLineupMetadatas(
              _offset,
              limit,
              _page === 0,
              fetchPayload,
              extraFetchOptions
            )
          )
        }
      }
    },
    [
      actions,
      countOrDefault,
      dispatch,
      fetchPayload,
      includeLineupStatus,
      itemCounts,
      limit,
      lineup,
      lineupLength,
      loadMore,
      pageItemCount,
      extraFetchOptions
    ]
  )

  useReachableEffect(
    useCallback(() => {
      if (entries.length > 0 || status === Status.LOADING) return
      handleLoadMore(true)
      // using the latest creates infinite loop, and we only need the initial state
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries])
  )

  // When scrolled past the end threshold of the lineup and the lineup is not loading,
  // trigger another load
  useEffect(() => {
    if (isPastLoadThreshold && status !== Status.LOADING) {
      setIsPastLoadThreshold(false)
      handleLoadMore()
    }
  }, [isPastLoadThreshold, status, handleLoadMore])

  useEffect(() => {
    if (selfLoad && lineupLength === 0 && status !== Status.LOADING) {
      handleLoadMore()
    }
  }, [handleLoadMore, selfLoad, lineupLength, status])

  const togglePlay = useCallback(
    ({ uid, id, source }: TogglePlayConfig) => {
      dispatch(actions.togglePlay(uid, id, source))
    },
    [actions, dispatch]
  )

  const renderItem = useCallback(
    ({
      index,
      item
    }: {
      index: number
      item: LineupItem | LoadingLineupItem
    }) => {
      return (
        <LineupItemTile
          index={index}
          item={item}
          isTrending={isTrending}
          leadingElementId={leadingElementId}
          rankIconCount={rankIconCount}
          showLeadingElementArtistPick={showLeadingElementArtistPick}
          togglePlay={togglePlay}
        />
      )
    },
    [
      isTrending,
      leadingElementId,
      rankIconCount,
      showLeadingElementArtistPick,
      togglePlay
    ]
  )

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
      const result: Section[] = [
        ...delineateByTime(items),
        {
          delineate: false,
          data: skeletonItems
        }
      ]
      return result
    }

    if (leadingElementId && showLeadingElementArtistPick) {
      const [artistPick, ...restEntries] = [...items, ...skeletonItems]

      const result: Section[] = [
        { delineate: false, data: [artistPick] },
        { delineate: true, data: restEntries, hasLeadingElement: true }
      ]
      return result
    }

    const data = [...items, ...skeletonItems]

    if (data.length === 0) {
      return []
    }

    return [{ delineate: false, data }]
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

  const areSectionsEmpty = sections.every(
    (section) => section.data.length === 0
  )

  const scrollToTop = useCallback(() => {
    if (!areSectionsEmpty) {
      ref.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        animated: true
      })
    }
  }, [areSectionsEmpty])

  useScrollToTop(scrollToTop, disableTopTabScroll)

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

  const pullToRefreshProps =
    pullToRefresh || refreshProp ? { onRefresh: refresh, refreshing } : {}

  return (
    <View style={styles.root}>
      <SectionList
        {...listProps}
        {...pullToRefreshProps}
        ref={ref}
        onScroll={handleScroll}
        ListHeaderComponent={header}
        ListFooterComponent={
          lineup.hasMore ? <View style={{ height: 16 }} /> : ListFooterComponent
        }
        ListEmptyComponent={LineupEmptyComponent}
        onEndReached={handleLoadMore as () => void}
        onEndReachedThreshold={LOAD_MORE_THRESHOLD}
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
