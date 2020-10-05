import React, { Component } from 'react'
import { open } from 'store/application/ui/mobileOverflowModal/actions'
import { connect } from 'react-redux'
import { push as pushRoute, replace } from 'connected-react-router'
import { AppState, Status } from 'store/types'
import { Dispatch } from 'redux'

import { makeGetLineupMetadatas } from 'store/lineup/selectors'
import {
  getUser,
  getLineup,
  getTrackRank,
  getTrack,
  getRemixParentTrack,
  getStatus,
  getSourceSelector
} from 'containers/track-page/store/selectors'
import { getUserId } from 'store/account/selectors'
import { tracksActions } from './store/lineups/tracks/actions'
import * as cacheTrackActions from 'store/cache/tracks/actions'
import * as unfollowConfirmationActions from 'containers/unfollow-confirmation-modal/store/actions'
import * as socialTracksActions from 'store/social/tracks/actions'
import * as socialUsersActions from 'store/social/users/actions'
import {
  profilePage,
  searchResultsPage,
  NOT_FOUND_PAGE,
  FEED_PAGE,
  FAVORITING_USERS_ROUTE,
  REPOSTING_USERS_ROUTE,
  fullTrackPage,
  trackRemixesPage,
  trackPage
} from 'utils/route'
import { formatUrlName } from 'utils/formatUtil'
import { parseTrackRoute, TrackRouteParams } from 'utils/route/trackRouteParser'
import { ID, CID, PlayableType } from 'models/common/Identifiers'
import { Uid } from 'utils/uid'
import { getLocationPathname } from 'store/routing/selectors'
import { getPlaying, getBuffering } from 'store/player/selectors'
import { makeGetCurrent } from 'store/queue/selectors'

import * as trackPageActions from './store/actions'

import { OwnProps as MobileTrackPageProps } from './components/mobile/TrackPage'
import { OwnProps as DesktopTrackPageProps } from './components/desktop/TrackPage'
import {
  OverflowAction,
  OverflowSource
} from 'store/application/ui/mobileOverflowModal/types'
import { isMobile } from 'utils/clientUtil'
import { setRepost } from 'containers/reposts-page/store/actions'
import { setFavorite } from 'containers/favorites-page/store/actions'
import { RepostType } from 'containers/reposts-page/store/types'
import { FavoriteType } from 'models/Favorite'
import {
  FollowSource,
  FavoriteSource,
  RepostSource,
  ShareSource,
  Name,
  PlaybackSource
} from 'services/analytics'
import { TrackEvent, make } from 'store/analytics/actions'

import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListType,
  UserListEntityType
} from 'store/application/ui/userListModal/types'
import StemsSEOHint from './components/StemsSEOHint'

import { getTrackPageTitle, getTrackPageDescription } from 'utils/seo'
import { formatSeconds, formatDate } from 'utils/timeUtil'
import { getCannonicalName } from 'utils/genres'
import Track from 'models/Track'
import DeletedPage from 'containers/deleted-page/DeletedPage'

const getRemixParentTrackId = (track: Track | null) =>
  track?.remix_of?.tracks?.[0]?.parent_track_id

type OwnProps = {
  children:
    | React.ComponentType<MobileTrackPageProps>
    | React.ComponentType<DesktopTrackPageProps>
}

type mapStateProps = ReturnType<typeof makeMapStateToProps>
type TrackPageProviderProps = OwnProps &
  ReturnType<mapStateProps> &
  ReturnType<typeof mapDispatchToProps>

type TrackPageProviderState = {
  pathname: string
  ownerHandle: string | null
  showDeleteConfirmation: boolean
  routeKey: ID
  source: string | undefined
}

class TrackPageProvider extends Component<
  TrackPageProviderProps,
  TrackPageProviderState
> {
  state: TrackPageProviderState = {
    pathname: this.props.pathname,
    ownerHandle: null,
    showDeleteConfirmation: false,
    routeKey: parseTrackRoute(this.props.pathname)?.trackId ?? 0,
    source: undefined
  }

  componentDidMount() {
    const params = parseTrackRoute(this.props.pathname)
    if (params) {
      this.fetchTracks(params)
    } else {
      // Go to 404 if the track id isn't parsed correctly
      this.props.goToRoute(NOT_FOUND_PAGE)
    }
  }

  componentDidUpdate(prevProps: TrackPageProviderProps) {
    const { pathname, track, status, refetchTracksLinup } = this.props
    if (status === Status.ERROR) {
      this.props.goToRoute(NOT_FOUND_PAGE)
    }
    if (!isMobile()) {
      // On componentDidUpdate we try to reparse the URL because if you’re on a track page
      // and go to another track page, the component doesn’t remount but we need to
      // trigger a re-fetch based on the URL. On mobile, separate page provider components are
      // used so this is a non-issue.
      if (pathname !== this.state.pathname) {
        const params = parseTrackRoute(pathname)
        if (params) {
          this.setState({ pathname })
          this.fetchTracks(params)
        }
      }
    }

    // Set the lineup source in state once it's set in redux
    if (
      !this.state.source &&
      this.state.routeKey === this.props.track?.track_id
    ) {
      this.setState({ source: this.props.source })
    }

    // If the remix of this track changed and we have
    // already fetched the track, refetch the entire lineup
    // because the remix parent track needs to be retrieved
    if (
      prevProps.track &&
      prevProps.track.track_id &&
      track &&
      track.track_id &&
      getRemixParentTrackId(prevProps.track) !== getRemixParentTrackId(track)
    ) {
      refetchTracksLinup()
    }

    if (track) {
      const params = parseTrackRoute(pathname)
      if (params) {
        // Check if we are coming from a non-canonical route and replace route if necessary.
        const { trackTitle, trackId, handle } = params
        const newTrackTitle = formatUrlName(track.title)
        if (trackTitle === null || handle === null) {
          if (this.props.user) {
            const newPath = trackPage(
              this.props.user.handle,
              newTrackTitle,
              track.track_id
            )
            this.props.replaceRoute(newPath)
          }
        } else {
          // Check that the track name hasn't changed. If so, update url.
          if (track.track_id === trackId) {
            if (newTrackTitle !== trackTitle) {
              const newPath = pathname.replace(trackTitle, newTrackTitle)
              this.props.replaceRoute(newPath)
            }
          }
        }
      }
    }
  }

  componentWillUnmount() {
    if (!isMobile()) {
      // Don't reset on mobile because there are two
      // track pages mounted at a time due to animations.
      this.props.resetTrackPage()
    }
  }

  fetchTracks = (params: NonNullable<TrackRouteParams>) => {
    const { track } = this.props
    const { trackTitle, trackId, handle } = params

    // Go to feed if the track is deleted
    if (track && track.track_id === trackId) {
      if (track._marked_deleted) {
        this.props.goToRoute(FEED_PAGE)
        return
      }
    }
    this.props.reset()
    this.props.setTrackId(trackId)
    this.props.fetchTrack(trackId, trackTitle, handle, !!(trackTitle && handle))
    if (handle) {
      this.setState({ ownerHandle: handle })
    }
  }

  onHeroPlay = (heroPlaying: boolean) => {
    const {
      play,
      pause,
      currentQueueItem,
      moreByArtist: { entries },
      record
    } = this.props
    if (!entries || !entries[0]) return
    const track = entries[0]

    if (heroPlaying) {
      pause()
      record(
        make(Name.PLAYBACK_PAUSE, {
          id: `${track.id}`,
          source: PlaybackSource.TRACK_PAGE
        })
      )
    } else if (
      currentQueueItem.uid !== track.uid &&
      currentQueueItem.track &&
      currentQueueItem.track.track_id === track.id
    ) {
      play()
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${track.id}`,
          source: PlaybackSource.TRACK_PAGE
        })
      )
    } else if (track) {
      play(track.uid)
      record(
        make(Name.PLAYBACK_PLAY, {
          id: `${track.id}`,
          source: PlaybackSource.TRACK_PAGE
        })
      )
    }
  }

  onMoreByArtistTracksPlay = (uid?: string) => {
    const { play, recordPlayMoreByArtist } = this.props
    play(uid)
    if (uid) {
      const trackId = Uid.fromString(uid).id
      recordPlayMoreByArtist(trackId)
    }
  }

  onHeroRepost = (isReposted: boolean, trackId: ID) => {
    const { repostTrack, undoRepostTrack } = this.props
    if (!isReposted) {
      repostTrack(trackId)
    } else {
      undoRepostTrack(trackId)
    }
  }

  onHeroShare = (trackId: ID) => {
    const { shareTrack } = this.props
    shareTrack(trackId)
  }

  onSaveTrack = (isSaved: boolean, trackId: ID) => {
    const { saveTrack, unsaveTrack } = this.props
    if (isSaved) {
      unsaveTrack(trackId)
    } else {
      saveTrack(trackId)
    }
  }

  onFollow = () => {
    const { onFollow, track } = this.props
    if (track) onFollow(track.owner_id)
  }

  onUnfollow = () => {
    const { onUnfollow, onConfirmUnfollow, track } = this.props
    if (track) {
      if (this.props.isMobile) {
        onConfirmUnfollow(track.owner_id)
      } else {
        onUnfollow(track.owner_id)
      }
    }
  }

  goToProfilePage = (handle: string) => {
    this.props.goToRoute(profilePage(handle))
  }

  goToSearchResultsPage = (tag: string) => {
    this.props.goToRoute(searchResultsPage(tag))
    this.props.recordTagClick(tag.replace('#', ''))
  }

  goToParentRemixesPage = () => {
    const { goToRemixesOfParentPage, track } = this.props
    const parentTrackId = getRemixParentTrackId(track)
    if (parentTrackId) {
      goToRemixesOfParentPage(parentTrackId)
    }
  }

  goToAllRemixesPage = () => {
    const { track, user } = this.props
    if (track && user) {
      this.props.goToRoute(
        trackRemixesPage(user.handle, track.title, track.track_id)
      )
    }
  }

  goToFavoritesPage = (trackId: ID) => {
    this.props.setFavoriteTrackId(trackId)
    this.props.goToRoute(FAVORITING_USERS_ROUTE)
  }

  goToRepostsPage = (trackId: ID) => {
    this.props.setRepostTrackId(trackId)
    this.props.goToRoute(REPOSTING_USERS_ROUTE)
  }

  onClickReposts = () => {
    this.props.track && this.props.setRepostUsers(this.props.track.track_id)
    this.props.setModalVisibility()
  }

  onClickFavorites = () => {
    this.props.track && this.props.setFavoriteUsers(this.props.track.track_id)
    this.props.setModalVisibility()
  }

  render() {
    const {
      track,
      remixParentTrack,
      user,
      trackRank,
      moreByArtist,
      currentQueueItem,
      playing,
      buffering,
      userId,
      pause,
      downloadTrack,
      onExternalLinkClick
    } = this.props
    const heroPlaying =
      playing &&
      !!track &&
      !!currentQueueItem.track &&
      currentQueueItem.track.track_id === track.track_id
    const badge =
      trackRank.year && trackRank.year <= 5
        ? `#${trackRank.year} This Year`
        : trackRank.month && trackRank.month <= 5
        ? `#${trackRank.month} This Month`
        : trackRank.week && trackRank.week <= 5
        ? `#${trackRank.week} This Week`
        : null

    const desktopProps = {
      // Follow Props
      onFollow: this.onFollow,
      onUnfollow: this.onUnfollow,
      makePublic: this.props.makeTrackPublic,
      onClickReposts: this.onClickReposts,
      onClickFavorites: this.onClickFavorites
    }

    const title = getTrackPageTitle({
      title: track ? track.title : '',
      handle: user ? user.handle : ''
    })

    const releaseDate = track ? track.release_date || track.created_at : ''
    const description = getTrackPageDescription({
      releaseDate: releaseDate ? formatDate(releaseDate) : '',
      description: track?.description ?? '',
      mood: track?.mood ?? '',
      genre: track ? getCannonicalName(track.genre) : '',
      duration: track ? formatSeconds(track.duration) : '',
      tags: track ? (track.tags || '').split(',').filter(Boolean) : []
    })
    const canonicalUrl =
      user && track
        ? fullTrackPage(user.handle, track.title, track.track_id)
        : ''

    // If the track has a remix parent and it's not deleted.
    const hasValidRemixParent =
      !!getRemixParentTrackId(track) &&
      (!remixParentTrack || remixParentTrack.is_delete === false)

    if ((track?.is_delete || track?._marked_deleted) && user) {
      return (
        <DeletedPage
          title={title}
          description={description}
          canonicalUrl={canonicalUrl}
          playable={{ metadata: track, type: PlayableType.TRACK }}
          user={user}
        />
      )
    }

    const childProps = {
      title,
      description,
      canonicalUrl,
      heroTrack: track,
      hasValidRemixParent,
      user,
      heroPlaying,
      userId,
      badge,
      onHeroPlay: this.onHeroPlay,
      goToProfilePage: this.goToProfilePage,
      goToSearchResultsPage: this.goToSearchResultsPage,
      goToAllRemixesPage: this.goToAllRemixesPage,
      goToParentRemixesPage: this.goToParentRemixesPage,
      onHeroRepost: this.onHeroRepost,
      onHeroShare: this.onHeroShare,
      onSaveTrack: this.onSaveTrack,
      onDownloadTrack: downloadTrack,
      onClickMobileOverflow: this.props.clickOverflow,
      onConfirmUnfollow: this.props.onConfirmUnfollow,
      goToFavoritesPage: this.goToFavoritesPage,
      goToRepostsPage: this.goToRepostsPage,

      // Tracks Lineup Props
      tracks: moreByArtist,
      currentQueueItem,
      isPlaying: playing,
      isBuffering: buffering,
      play: this.onMoreByArtistTracksPlay,
      pause,
      onExternalLinkClick
    }

    return (
      <>
        {!!track?._stems?.[0] && <StemsSEOHint />}
        <this.props.children
          key={this.state.routeKey}
          {...childProps}
          {...desktopProps}
        />
      </>
    )
  }
}

function makeMapStateToProps() {
  const getMoreByArtistLineup = makeGetLineupMetadatas(getLineup)
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => {
    return {
      source: getSourceSelector(state),
      track: getTrack(state),
      remixParentTrack: getRemixParentTrack(state),
      user: getUser(state),
      status: getStatus(state),
      moreByArtist: getMoreByArtistLineup(state),
      userId: getUserId(state),

      currentQueueItem: getCurrentQueueItem(state),
      playing: getPlaying(state),
      buffering: getBuffering(state),
      trackRank: getTrackRank(state),
      isMobile: isMobile(),
      pathname: getLocationPathname(state)
    }
  }
  return mapStateToProps
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    fetchTrack: (
      trackId: ID,
      trackName: string | null,
      ownerHandle: string | null,
      canBeUnlisted: boolean
    ) =>
      dispatch(
        trackPageActions.fetchTrack(
          trackId,
          trackName,
          ownerHandle,
          canBeUnlisted
        )
      ),
    setTrackId: (trackId: number) =>
      dispatch(trackPageActions.setTrackId(trackId)),
    resetTrackPage: () => dispatch(trackPageActions.resetTrackPage()),
    makeTrackPublic: (trackId: ID) =>
      dispatch(trackPageActions.makeTrackPublic(trackId)),

    goToRoute: (route: string) => dispatch(pushRoute(route)),
    replaceRoute: (route: string) => dispatch(replace(route)),
    reset: (source?: string) => dispatch(tracksActions.reset(source)),
    play: (uid?: string) => dispatch(tracksActions.play(uid)),
    recordPlayMoreByArtist: (trackId: ID) => {
      const trackEvent: TrackEvent = make(Name.TRACK_PAGE_PLAY_MORE, {
        id: trackId
      })
      dispatch(trackEvent)
    },
    pause: () => dispatch(tracksActions.pause()),
    shareTrack: (trackId: ID) =>
      dispatch(socialTracksActions.shareTrack(trackId, ShareSource.PAGE)),
    saveTrack: (trackId: ID) =>
      dispatch(
        socialTracksActions.saveTrack(trackId, FavoriteSource.TRACK_PAGE)
      ),
    unsaveTrack: (trackId: ID) =>
      dispatch(
        socialTracksActions.unsaveTrack(trackId, FavoriteSource.TRACK_PAGE)
      ),
    deleteTrack: (trackId: ID) =>
      dispatch(cacheTrackActions.deleteTrack(trackId)),
    repostTrack: (trackId: ID) =>
      dispatch(
        socialTracksActions.repostTrack(trackId, RepostSource.TRACK_PAGE)
      ),
    undoRepostTrack: (trackId: ID) =>
      dispatch(
        socialTracksActions.undoRepostTrack(trackId, RepostSource.TRACK_PAGE)
      ),
    editTrack: (trackId: ID, formFields: any) =>
      dispatch(cacheTrackActions.editTrack(trackId, formFields)),
    onFollow: (userId: ID) =>
      dispatch(socialUsersActions.followUser(userId, FollowSource.TRACK_PAGE)),
    onUnfollow: (userId: ID) =>
      dispatch(
        socialUsersActions.unfollowUser(userId, FollowSource.TRACK_PAGE)
      ),
    onConfirmUnfollow: (userId: ID) =>
      dispatch(unfollowConfirmationActions.setOpen(userId)),
    downloadTrack: (
      trackId: ID,
      cid: CID,
      creatorNodeEndpoints: string,
      category?: string,
      parentTrackId?: ID
    ) => {
      dispatch(
        socialTracksActions.downloadTrack(
          trackId,
          cid,
          creatorNodeEndpoints,
          category
        )
      )
      const trackEvent: TrackEvent = make(Name.TRACK_PAGE_DOWNLOAD, {
        id: trackId,
        category,
        parent_track_id: parentTrackId
      })
      dispatch(trackEvent)
    },
    clickOverflow: (trackId: ID, overflowActions: OverflowAction[]) =>
      dispatch(open(OverflowSource.TRACKS, trackId, overflowActions)),
    setRepostTrackId: (trackId: ID) =>
      dispatch(setRepost(trackId, RepostType.TRACK)),
    setFavoriteTrackId: (trackId: ID) =>
      dispatch(setFavorite(trackId, FavoriteType.TRACK)),
    onExternalLinkClick: (event: any) => {
      const trackEvent: TrackEvent = make(Name.LINK_CLICKING, {
        url: event.target.href,
        source: 'track page' as 'track page'
      })
      dispatch(trackEvent)
    },
    recordTagClick: (tag: string) => {
      const trackEvent: TrackEvent = make(Name.TAG_CLICKING, {
        tag,
        source: 'track page' as 'track page'
      })
      dispatch(trackEvent)
    },
    record: (event: TrackEvent) => dispatch(event),
    setRepostUsers: (trackID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.REPOST,
          entityType: UserListEntityType.TRACK,
          id: trackID
        })
      ),
    setFavoriteUsers: (trackID: ID) =>
      dispatch(
        setUsers({
          userListType: UserListType.FAVORITE,
          entityType: UserListEntityType.TRACK,
          id: trackID
        })
      ),
    setModalVisibility: () => dispatch(setVisibility(true)),
    goToRemixesOfParentPage: (parentTrackId: ID) =>
      dispatch(trackPageActions.goToRemixesOfParentPage(parentTrackId)),
    refetchTracksLinup: () => dispatch(trackPageActions.refetchLineup())
  }
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(TrackPageProvider)
