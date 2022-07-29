import { ComponentType, createRef, PureComponent } from 'react'

import {
  Kind,
  ID,
  UID,
  Name,
  PlaybackSource,
  Lineup,
  Status
} from '@audius/common'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import InfiniteScroll from 'react-infinite-scroller'
import { connect } from 'react-redux'
import { Transition } from 'react-spring/renderprops'
import { Dispatch } from 'redux'

import { LineupActions } from 'common/store/lineup/actions'
import { getShowTip } from 'common/store/tipping/selectors'
import { FeedTipTile } from 'components/tipping/feed-tip-tile/FeedTipTile'
import {
  TrackTileProps,
  PlaylistTileProps,
  TrackTileSize,
  TileProps
} from 'components/track/types'
import { TrackEvent, make } from 'store/analytics/actions'
import { AppState } from 'store/types'
import { isMobile } from 'utils/clientUtil'

import styles from './Lineup.module.css'
import { delineateByTime, delineateByFeatured } from './delineate'
import { LineupVariant } from './types'

// The max number of tiles to load
const MAX_TILES_COUNT = 1000

// The max number of loading tiles to display if count prop passes
const MAX_COUNT_LOADING_TILES = 18

// The inital multiplier for number of tracks to fetch on lineup load
// multiplied by the number of tracks that fit the browser height
export const INITIAL_LOAD_TRACKS_MULTIPLIER = 1.75
export const INITIAL_PLAYLISTS_MULTIPLER = 1

// A multiplier for the number of tiles to fill a page to be
// loaded in on each call (after the intial call)
const TRACKS_AHEAD_MULTIPLIER = 0.75

// Threshold for how far away from the bottom (of the list) the user has to be
// before fetching more tracks as a percentage of the page size
const LOAD_MORE_PAGE_THRESHOLD = 3 / 5

// The minimum inital multiplier for tracks to fetch on lineup load
// use so that multiple lineups on the same page can switch w/out a reload
const MINIMUM_INITIAL_LOAD_TRACKS_MULTIPLIER = 1

// tile height + margin
const totalTileHeight = {
  main: 152 + 16,
  section: 124 + 16,
  condensed: 124 + 8,
  playlist: 350
}

// Load TRACKS_AHEAD x the number of tiles to be displayed on the screen
export const getLoadMoreTrackCount = (
  variant: LineupVariant,
  multiplier: number | (() => number)
) =>
  Math.ceil(
    (window.innerHeight / totalTileHeight[variant]) *
      (typeof multiplier === 'function' ? multiplier() : multiplier)
  )

// Call load more when the user is LOAD_MORE_PAGE_THRESHOLD of the view height
// away from the bottom of the scrolling window.
const getLoadMoreThreshold = () =>
  Math.ceil(window.innerHeight * LOAD_MORE_PAGE_THRESHOLD)

const shouldLoadMore = (
  scrollContainer: HTMLDivElement | null,
  scrollParent: HTMLElement | null,
  threshold: number
) => {
  if (!scrollContainer || !scrollParent) return false
  const { top } = scrollParent.getBoundingClientRect()
  const parentTop = (scrollParent.scrollTop || 0) + -1 * top
  const offset =
    scrollContainer.scrollHeight - parentTop - scrollParent.clientHeight
  return offset <= threshold
}

const getInitPage = (
  lineupLen: number,
  initialTrackLoadCount: number,
  trackLoadMoreCount: number
) => {
  if (lineupLen < initialTrackLoadCount) return 0
  return (
    Math.floor((lineupLen - initialTrackLoadCount) / trackLoadMoreCount) + 1
  )
}

export interface LineupProviderProps {
  'aria-label'?: string
  // Tile components
  trackTile: ComponentType<TrackTileProps> | any
  playlistTile: ComponentType<PlaylistTileProps> | any

  // Other props

  /** The number of tracks to fetch */
  count?: number

  /** The maximum number of tracks to fetch while paginating */
  limit?: number
  start?: number
  lineup: Lineup<any>
  playingUid: UID | null
  playingTrackId: ID | null
  playing: boolean
  playTrack: (uid: UID) => void
  pauseTrack: () => void
  variant: LineupVariant
  loadMore?: (offset: number, limit: number, overwrite: boolean) => void
  selfLoad: boolean
  scrollParent?: HTMLElement | null
  endOfLineup?: JSX.Element

  /**
   * Whether or not to delineate the lineup by time of the `activityTimestamp` prop
   */
  delineate?: boolean

  /**
   * Indicator if a track should be displayed differently (ie. artist pick)
   * The leadingElementId is displayed at the top of the lineup
   */
  leadingElementId?: ID

  /**
   * JSX Element that can be used to delineate the leading element from the rest
   */
  leadingElementDelineator?: JSX.Element | null

  /**
   * Track tile properties to optionally pass to the leading element track tile
   */
  leadingElementTileProps?: Partial<TileProps>

  /**
   * Class name to optionally apply to the leading element
   */
  leadingElementClassName?: string

  /**
   * Whether to show the artist pick on the leading element.
   * Defaults to true.
   */
  showLeadingElementArtistPick?: boolean

  /**
   * Class name to optionally apply to the container after the leading element
   */
  laggingContainerClassName?: string

  /**
   * Whether or not to animate the sliding in of the leading element
   */
  animateLeadingElement?: boolean

  /**
   * Whether or not to apply leading element tile props and styles to the
   * skeleton tile rendered in its place
   */
  applyLeadingElementStylesToSkeleton?: boolean

  /**
   * Extra content that preceeds the lineup to be rendered. Can be anything,
   * but is not tied to playback or other lineup pagination logic.
   */
  extraPrecedingElement?: JSX.Element

  buffering: boolean
  ordered?: boolean
  lineupContainerStyles?: string
  setInView?: (inView: boolean) => void
  playingSource: string | null
  emptyElement?: JSX.Element
  actions: LineupActions
  delayLoad?: boolean
  /** How many rows to show for a loading playlist tile. Defaults to 0 */
  numPlaylistSkeletonRows?: number

  /** Are we in a trending lineup? Allows tiles to specialize their rendering */
  isTrending?: boolean

  /** Whether we are in the feed lineup */
  isFeed?: boolean

  /** How many icons to show for top ranked entries in the lineup. Defaults to 0, showing none */
  rankIconCount?: number
}

interface LineupProviderState {
  scrollParent: HTMLElement | null
  loadMoreThreshold: number
  minimumTrackLoadCount: number
  initialTrackLoadCount: number
  trackLoadMoreCount: number
  // Used to artificially enforce the ordering at which tiles are rendered to the user
  // Because tiles are connected themselves and are in charge of retrieving their own content
  // from the store/BE, they could appear in a non-progressive order. This ensures that the first
  // tile is displayed before the second, etc.
  loadedTiles: boolean[]
}

type CombinedProps = LineupProviderProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

/** `LineupProvider` encapsulates the logic for displaying a Lineup (e.g. prefetching items)
 * displaying loading states, etc). This is decoupled from the rendering logic, which
 * is controlled by injecting tiles conforming to `Track/Playlist/SkeletonProps interfaces.
 */
class LineupProvider extends PureComponent<CombinedProps, LineupProviderState> {
  scrollContainer = createRef<HTMLDivElement>()

  constructor(props: any) {
    super(props)
    const loadMoreThreshold = getLoadMoreThreshold()
    const minimumTrackLoadCount = getLoadMoreTrackCount(
      this.props.variant === LineupVariant.PLAYLIST
        ? LineupVariant.PLAYLIST
        : LineupVariant.MAIN,
      MINIMUM_INITIAL_LOAD_TRACKS_MULTIPLIER
    )
    const initialTrackLoadCount = getLoadMoreTrackCount(
      this.props.variant,
      () =>
        this.props.variant === LineupVariant.PLAYLIST
          ? INITIAL_PLAYLISTS_MULTIPLER
          : INITIAL_LOAD_TRACKS_MULTIPLIER
    )
    const trackLoadMoreCount = getLoadMoreTrackCount(
      this.props.variant,
      TRACKS_AHEAD_MULTIPLIER
    )
    const page = getInitPage(
      this.props.lineup.entries.length,
      initialTrackLoadCount,
      trackLoadMoreCount
    )
    props.setPage(page, props.actions.setPage)
    this.state = {
      scrollParent: this.props.scrollParent || null,
      loadMoreThreshold,
      minimumTrackLoadCount,
      initialTrackLoadCount,
      trackLoadMoreCount,
      loadedTiles: new Array(200)
    }
  }

  togglePlay = (uid: UID, trackId: ID, source?: PlaybackSource) => {
    const { playTrack, pauseTrack, playing, playingUid, record } = this.props
    if (uid !== playingUid || (uid === playingUid && !playing)) {
      playTrack(uid)
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${trackId}`,
          source: source || PlaybackSource.TRACK_TILE
        })
      )
    } else if (uid === playingUid && playing) {
      pauseTrack()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: `${trackId}`,
          source: source || PlaybackSource.TRACK_TILE
        })
      )
    }
  }

  pageTrackCount = () => {
    return (
      this.state.initialTrackLoadCount +
      (this.props.lineup.page - 1) * this.state.trackLoadMoreCount
    )
  }

  loadMore = () => {
    const {
      limit,
      count = MAX_TILES_COUNT,
      lineup,
      lineup: { page },
      loadMore
    } = this.props
    const { minimumTrackLoadCount, trackLoadMoreCount, initialTrackLoadCount } =
      this.state
    const lineupLength = lineup.entries.length
    const offset = lineupLength + lineup.deleted + lineup.nullCount
    if (
      (!limit || lineupLength !== limit) &&
      loadMore &&
      lineupLength < count &&
      (page === 0 || this.pageTrackCount() <= offset)
    ) {
      const trackLoadCount =
        page === 0
          ? initialTrackLoadCount
          : initialTrackLoadCount + page * trackLoadMoreCount
      this.props.setPage(page + 1, this.props.actions.setPage)
      const limit =
        Math.min(trackLoadCount, Math.max(count, minimumTrackLoadCount)) -
        offset
      loadMore(offset, limit, page === 0)
    }
  }

  componentDidMount() {
    const lineupLength = this.props.lineup.entries.length
    if (
      this.props.selfLoad &&
      lineupLength < this.state.minimumTrackLoadCount
    ) {
      this.loadMore()
    }
    if (this.props.setInView) this.props.setInView(true)
  }

  componentWillUnmount() {
    if (this.props.setInView) this.props.setInView(false)
  }

  componentDidUpdate(
    prevProps: LineupProviderProps,
    prevState: LineupProviderState
  ) {
    if (
      this.props.scrollParent &&
      !this.state.scrollParent &&
      this.props.scrollParent !== this.state.scrollParent
    ) {
      const scrollParent = this.props.scrollParent
      this.setState({
        scrollParent,
        trackLoadMoreCount: getLoadMoreTrackCount(
          this.props.variant,
          TRACKS_AHEAD_MULTIPLIER
        )
      })
      if (
        this.props.selfLoad &&
        shouldLoadMore(
          this.scrollContainer.current,
          scrollParent,
          this.state.loadMoreThreshold
        ) &&
        this.props.lineup.hasMore
      ) {
        this.loadMore()
        return
      }
    }

    // Currently when requesting tracks with a limit, the backend may return more than the requested number of tracks.
    // So, for pagination and loading more tracks, the lineup metadatas may have more than the 'pageTrackCount'
    if (
      prevProps.lineup.isMetadataLoading &&
      this.props.lineup.entries.length >= this.pageTrackCount()
    ) {
      const container = this.scrollContainer.current
      const { scrollParent: parent, loadMoreThreshold: threshold } = this.state
      if (
        this.props.selfLoad &&
        shouldLoadMore(container, parent, threshold) &&
        this.props.lineup.hasMore
      ) {
        this.loadMore()
        return
      }
    }

    // If the updated lineup is self load and changed from loading to success,
    // check if it should load more again.
    if (
      this.props.selfLoad &&
      prevProps.lineup.status === Status.LOADING &&
      this.props.lineup.status === Status.SUCCESS
    ) {
      const container = this.scrollContainer.current
      const { scrollParent: parent, loadMoreThreshold: threshold } = this.state
      if (
        shouldLoadMore(container, parent, threshold) &&
        this.props.lineup.hasMore
      ) {
        this.loadMore()
      }
    }
  }

  // If the uid of the currently playing track is not in the lineup, check if the track and is playing
  // then return the first uid of the first track that matches else the uid
  getPlayingUid = () => {
    const { lineup, playingTrackId, playingSource, playingUid } = this.props

    const isLineupPlaying = lineup.entries.some((entry) => {
      if (entry.track_id) return playingUid === entry.uid
      else if (entry.playlist_id)
        return entry.tracks.some((track: any) => track.uid === playingUid)
      return false
    })
    if (playingTrackId && !isLineupPlaying && lineup.prefix === playingSource) {
      for (const entry of lineup.entries) {
        if (entry.track_id === playingTrackId) return entry.uid
        if (entry.playlist_id) {
          for (const track of entry.tracks) {
            if (track.track_id === playingTrackId) return track.uid
          }
        }
      }
    } else {
      return playingUid
    }
  }

  hasLoaded = (index: number) => {
    if (!this.state.loadedTiles[index]) {
      this.setState((state) => {
        const newLoadedTiles = [...state.loadedTiles]
        newLoadedTiles[index] = true
        return {
          loadedTiles: newLoadedTiles
        }
      })
    }
  }

  canLoad = (index: number) => {
    if (index === 0 || index === this.props.start) return true
    // If the previous one is loaded, or we've just loaded too many
    return (
      !!this.state.loadedTiles[index - 1] ||
      this.state.loadedTiles.length < index
    )
  }

  render() {
    const {
      count,
      limit,
      start,
      lineup,
      variant,
      ordered,
      playTrack,
      pauseTrack,
      delineate,
      playingTrackId,
      leadingElementId,
      leadingElementDelineator,
      leadingElementTileProps,
      leadingElementClassName,
      laggingContainerClassName,
      animateLeadingElement,
      applyLeadingElementStylesToSkeleton,
      extraPrecedingElement,
      endOfLineup,
      lineupContainerStyles,
      isMobile,
      showLeadingElementArtistPick = true,
      lineup: { isMetadataLoading, page },
      numPlaylistSkeletonRows,
      isTrending = false,
      isFeed = false,
      showTip,
      rankIconCount = 0
    } = this.props
    const status = lineup.status
    const {
      loadMoreThreshold,
      initialTrackLoadCount,
      trackLoadMoreCount,
      scrollParent
    } = this.state

    let tileSize: TrackTileSize
    let lineupStyle = {}
    let containerClassName: string
    if (variant === LineupVariant.MAIN || variant === LineupVariant.PLAYLIST) {
      tileSize = TrackTileSize.LARGE
      lineupStyle = styles.main
    } else if (variant === LineupVariant.SECTION) {
      tileSize = TrackTileSize.SMALL
      lineupStyle = styles.section
      containerClassName = styles.searchTrackTileContainer
    } else if (variant === LineupVariant.CONDENSED) {
      tileSize = TrackTileSize.SMALL
      lineupStyle = styles.section
    }

    lineup.entries = lineup.entries || []

    // If the lineup is supposed to display a fixed count, make sure to skip over deleted
    // tracks. E.g. if a lineup is supposed to show a count of 5, but two entries are deleted
    // show 7 instead.
    const lineupCount = count !== undefined ? count : lineup.entries.length
    let tiles = lineup.entries
      .map((entry, index) => {
        if (entry.kind === Kind.TRACKS || entry.track_id) {
          // Render a track tile if the kind tracks or there's a track id present

          if (entry._marked_deleted) return null
          let trackProps = {
            ...entry,
            key: index,
            index,
            ordered,
            togglePlay: this.togglePlay,
            size: tileSize,
            containerClassName,
            uid: entry.uid,
            showArtistPick: showLeadingElementArtistPick && !!leadingElementId,
            isLoading: !this.canLoad(index),
            hasLoaded: this.hasLoaded,
            isTrending,
            showRankIcon: index < rankIconCount
          }
          if (entry.id === leadingElementId) {
            trackProps = { ...trackProps, ...leadingElementTileProps }
          }
          return <this.props.trackTile key={index} {...trackProps} />
        } else if (entry.kind === Kind.COLLECTIONS || entry.playlist_id) {
          // Render a track tile if the kind tracks or there's a track id present

          const playlistProps = {
            ...entry,
            key: index,
            index,
            uid: entry.uid,
            size: tileSize,
            ordered,
            playTrack,
            pauseTrack,
            playingTrackId,
            togglePlay: this.togglePlay,
            isLoading: !this.canLoad(index),
            hasLoaded: this.hasLoaded,
            numLoadingSkeletonRows: numPlaylistSkeletonRows,
            isTrending,
            showRankIcon: index < rankIconCount
          }

          return <this.props.playlistTile key={index} {...playlistProps} />
        }
        // Poorly formed track or playlist metatdata.
        return null
      })
      // Remove nulls (invalid playlists or tracks)
      .filter(Boolean)
      .slice(start, lineupCount)

    const tilesDisplayCount =
      page <= 1 ? initialTrackLoadCount : this.pageTrackCount()
    if (
      isMetadataLoading &&
      lineup.hasMore &&
      tiles.length < (count !== undefined ? count : MAX_TILES_COUNT) &&
      (!limit || tiles.length !== limit)
    ) {
      // Calculate the number of loading tiles to display: total # requested - # rendered - # deleted
      // If the `count` prop is provided, render the count - # loaded tiles
      const loadingSkeletonDifferential = Math.max(
        tilesDisplayCount - tiles.length - lineup.deleted,
        0
      )
      const loadingSkeletonCount = count
        ? Math.min(count - tiles.length, MAX_COUNT_LOADING_TILES)
        : loadingSkeletonDifferential
      const loadingSkeletons: JSX.Element[] = [
        ...Array(loadingSkeletonCount)
      ].map((_, index) => {
        const skeletonTileProps = {
          key: tiles.length + index,
          index: tiles.length + index,
          size: tileSize,
          ordered: this.props.ordered,
          isLoading: true,
          isTrending,
          numLoadingSkeletonRows: numPlaylistSkeletonRows
        }

        // Skeleton tile should change depending on variant
        const SkeletonTileElement =
          variant === LineupVariant.PLAYLIST
            ? this.props.playlistTile
            : this.props.trackTile
        // If elected to apply leading element styles to the skeletons
        // Create featured content structure around firest skeleton tile
        if (
          applyLeadingElementStylesToSkeleton &&
          index === 0 &&
          !!leadingElementId
        ) {
          return (
            <>
              <div
                className={cn(
                  styles.featuredContainer,
                  leadingElementClassName
                )}
                style={{
                  marginBottom: 12,
                  height: '100%',
                  maxHeight: 174
                }}
              >
                <div className={styles.featuredContent}>
                  <SkeletonTileElement
                    {...{ ...skeletonTileProps, ...leadingElementTileProps }}
                    key={index}
                  />
                </div>
              </div>
              {leadingElementDelineator}
            </>
          )
        }
        return (
          <SkeletonTileElement
            {...skeletonTileProps}
            key={tiles.length + index}
          />
        )
      })

      tiles = tiles.concat(loadingSkeletons)
    }

    if (tiles.length === 0 && status === Status.LOADING) {
      tiles = []
    }

    if (status === Status.ERROR) {
      // Error could mean no tracks or some tracks had an error loading.
      // TODO: Distinguish between no tracks and error'd tracks
      tiles = []
    }

    if (delineate) {
      tiles = delineateByTime(tiles, isMobile)
    }

    if (extraPrecedingElement) {
      tiles.unshift(extraPrecedingElement)
    }

    let featuredTiles: any[] = []
    if (leadingElementId) {
      const { featured, remaining } = delineateByFeatured(
        tiles,
        leadingElementId,
        isMobile,
        styles.featuredDelineate,
        leadingElementDelineator
      )
      tiles = remaining
      featuredTiles = featured
    }
    const allTiles = featuredTiles.concat(tiles)
    const featuredTrackUid =
      featuredTiles.length > 0 ? featuredTiles[0].props.uid : null
    const allTracks = allTiles.reduce((acc, track) => {
      acc[track.props.uid] = track
      return acc
    }, {})

    // Can load more:
    // If (the limit is not set OR the number of track in the lineup is not equal to the limit)
    // AND (the lineup count is less than the count or less than the max tile count if not set)
    // AND (the number of tracks requested is less than the number of tracks in total (in the lineup + deleted))
    const canLoadMore =
      (!limit || limit !== lineupCount) &&
      lineupCount <= (count !== undefined ? count : MAX_TILES_COUNT) &&
      page * trackLoadMoreCount <= lineupCount + lineup.deleted

    const endLineup =
      !lineup.hasMore && !count && endOfLineup ? endOfLineup : null
    return [
      <div
        className={cn(lineupStyle, {
          [lineupContainerStyles!]: !!lineupContainerStyles
        })}
        style={{ position: 'relative' }}
        key='lineup'
      >
        <Transition
          items={featuredTrackUid}
          from={{ opacity: 0, marginBottom: 0, maxHeight: 0 }}
          // Set the `initial` value to the same as `enter` signifying that component mounts
          // of the lineup do not trigger an animation, rather  updates to the featuredTrackUid do.
          initial={{
            opacity: 1,
            marginBottom: 12,
            maxHeight: 174
          }}
          enter={{
            opacity: 1,
            marginBottom: 12,
            maxHeight: 174
          }}
          leave={{ opacity: 0, marginBottom: 0, maxHeight: 0 }}
          config={{ duration: 175 }}
          immediate={isMobile || !animateLeadingElement}
        >
          {(featuredId: ID | null) =>
            featuredId
              ? (props) => (
                  <div
                    className={cn(
                      styles.featuredContainer,
                      leadingElementClassName
                    )}
                    style={{
                      height: '100%',
                      maxHeight: props.maxHeight,
                      marginBottom: props.marginBottom
                    }}
                  >
                    <div
                      className={styles.featuredContent}
                      style={{
                        height: '100%',
                        opacity: props.opacity,
                        maxHeight: props.maxHeight
                      }}
                    >
                      {allTracks[featuredId]}
                    </div>
                  </div>
                )
              : () => null
          }
        </Transition>
        <div
          ref={this.scrollContainer}
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
          className={cn({
            [laggingContainerClassName!]: !!laggingContainerClassName
          })}
        >
          {tiles.length === 0 && status === Status.SUCCESS ? (
            this.props.emptyElement
          ) : (
            <InfiniteScroll
              aria-label={this.props['aria-label']}
              pageStart={0}
              loadMore={lineup.hasMore ? this.loadMore : () => {}}
              hasMore={lineup.hasMore && canLoadMore}
              // If we're on mobile, we scroll the entire page so we should use the window
              // to calculate scroll position.
              useWindow={isMobile}
              initialLoad={false}
              getScrollParent={() => scrollParent}
              threshold={loadMoreThreshold}
              element='ol'
            >
              {isFeed && showTip ? <FeedTipTile /> : null}
              {tiles.map((tile, index) => (
                <li key={index}>{tile}</li>
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>,
      endLineup
    ]
  }
}

function mapStateToProps(state: AppState) {
  return {
    isMobile: isMobile(),
    showTip: getShowTip(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    setPage: (page: number, setPageAction: (page: number) => any) =>
      dispatch(setPageAction(page)),
    record: (event: TrackEvent) => dispatch(event)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LineupProvider)
