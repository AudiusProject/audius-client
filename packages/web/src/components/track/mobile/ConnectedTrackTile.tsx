import { memo, MouseEvent } from 'react'

import {
  ID,
  FavoriteSource,
  RepostSource,
  ShareSource,
  FavoriteType,
  accountSelectors,
  tracksSelectors,
  usersSelectors,
  tracksSocialActions,
  OverflowAction,
  OverflowSource,
  mobileOverflowMenuUIActions,
  shareModalUIActions,
  themeSelectors,
  RepostType,
  repostsUserListActions,
  favoritesUserListActions,
  playerSelectors
} from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import { TrackTileProps } from 'components/track/types'
import { AppState } from 'store/types'
import {
  profilePage,
  REPOSTING_USERS_ROUTE,
  FAVORITING_USERS_ROUTE
} from 'utils/route'
import { isMatrix, shouldShowDark } from 'utils/theme/theme'

import { getTrackWithFallback, getUserWithFallback } from '../helpers'

import TrackTile from './TrackTile'
const { getUid, getPlaying, getBuffering } = playerSelectors
const { setFavorite } = favoritesUserListActions
const { setRepost } = repostsUserListActions
const { getTheme } = themeSelectors
const { requestOpen: requestOpenShareModal } = shareModalUIActions
const { open } = mobileOverflowMenuUIActions
const { getTrack } = tracksSelectors
const { getUserFromTrack } = usersSelectors
const { saveTrack, unsaveTrack, repostTrack, undoRepostTrack } =
  tracksSocialActions
const getUserId = accountSelectors.getUserId

type ConnectedTrackTileProps = TrackTileProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const ConnectedTrackTile = memo(
  ({
    uid,
    index,
    size,
    track,
    user,
    ordered,
    trackTileStyles,
    showArtistPick,
    goToRoute,
    togglePlay,
    isBuffering,
    isPlaying,
    playingUid,
    isLoading,
    hasLoaded,
    currentUserId,
    saveTrack,
    unsaveTrack,
    repostTrack,
    unrepostTrack,
    shareTrack,
    setRepostTrackId,
    setFavoriteTrackId,
    clickOverflow,
    darkMode,
    isTrending,
    showRankIcon
  }: ConnectedTrackTileProps) => {
    const {
      is_delete,
      is_unlisted,
      track_id,
      title,
      permalink,
      repost_count,
      save_count,
      field_visibility,
      followee_reposts,
      followee_saves,
      has_current_user_reposted,
      has_current_user_saved,
      _cover_art_sizes,
      activity_timestamp,
      play_count,
      _co_sign,
      duration
    } = getTrackWithFallback(track)

    const { artist_pick_track_id, user_id, handle, name, is_verified } =
      getUserWithFallback(user)

    const isOwner = user_id === currentUserId

    const toggleSave = (trackId: ID) => {
      if (has_current_user_saved) {
        unsaveTrack(trackId)
      } else {
        saveTrack(trackId)
      }
    }

    const toggleRepost = (trackId: ID) => {
      if (has_current_user_reposted) {
        unrepostTrack(trackId)
      } else {
        repostTrack(trackId)
      }
    }

    const goToTrackPage = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      goToRoute(permalink)
    }

    const goToArtistPage = (e: MouseEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      goToRoute(profilePage(handle))
    }

    const onShare = (id: ID) => {
      shareTrack(id)
    }

    const makeGoToRepostsPage =
      (trackId: ID) => (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        setRepostTrackId(trackId)
        goToRoute(REPOSTING_USERS_ROUTE)
      }

    const makeGoToFavoritesPage =
      (trackId: ID) => (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        setFavoriteTrackId(trackId)
        goToRoute(FAVORITING_USERS_ROUTE)
      }

    const onClickOverflow = (trackId: ID) => {
      const overflowActions = [
        !isOwner
          ? has_current_user_reposted
            ? OverflowAction.UNREPOST
            : OverflowAction.REPOST
          : null,
        !isOwner
          ? has_current_user_saved
            ? OverflowAction.UNFAVORITE
            : OverflowAction.FAVORITE
          : null,
        OverflowAction.ADD_TO_PLAYLIST,
        OverflowAction.VIEW_TRACK_PAGE,
        OverflowAction.VIEW_ARTIST_PAGE
      ].filter(Boolean) as OverflowAction[]

      clickOverflow(trackId, overflowActions)
    }

    if (is_delete || user?.is_deactivated) return null

    return (
      <TrackTile
        uid={uid}
        id={track_id}
        userId={user_id}
        index={index}
        key={`${index}`}
        showSkeleton={isLoading}
        hasLoaded={hasLoaded}
        ordered={ordered}
        title={title}
        repostCount={repost_count}
        saveCount={save_count}
        followeeReposts={followee_reposts}
        followeeSaves={followee_saves}
        hasCurrentUserReposted={has_current_user_reposted}
        hasCurrentUserSaved={has_current_user_saved}
        duration={duration}
        coverArtSizes={_cover_art_sizes}
        activityTimestamp={activity_timestamp}
        trackTileStyles={trackTileStyles}
        size={size}
        listenCount={play_count}
        fieldVisibility={field_visibility}
        coSign={_co_sign}
        // Artist Pick
        showArtistPick={showArtistPick}
        isArtistPick={artist_pick_track_id === track_id}
        // Artist
        artistHandle={handle}
        artistName={name}
        artistIsVerified={is_verified}
        // Playback
        permalink={permalink}
        togglePlay={togglePlay}
        isActive={uid === playingUid}
        isLoading={isBuffering}
        isPlaying={uid === playingUid && isPlaying}
        goToArtistPage={goToArtistPage}
        goToTrackPage={goToTrackPage}
        toggleSave={toggleSave}
        onShare={onShare}
        onClickOverflow={onClickOverflow}
        toggleRepost={toggleRepost}
        makeGoToRepostsPage={makeGoToRepostsPage}
        makeGoToFavoritesPage={makeGoToFavoritesPage}
        goToRoute={goToRoute}
        isOwner={isOwner}
        darkMode={darkMode}
        isMatrix={isMatrix()}
        isTrending={isTrending}
        isUnlisted={is_unlisted}
        showRankIcon={showRankIcon}
      />
    )
  }
)

function mapStateToProps(state: AppState, ownProps: TrackTileProps) {
  return {
    track: getTrack(state, { uid: ownProps.uid }),
    user: getUserFromTrack(state, { uid: ownProps.uid }),
    playingUid: getUid(state),
    isBuffering: getBuffering(state),
    isPlaying: getPlaying(state),

    currentUserId: getUserId(state),
    darkMode: shouldShowDark(getTheme(state))
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    shareTrack: (trackId: ID) =>
      dispatch(
        requestOpenShareModal({
          type: 'track',
          trackId,
          source: ShareSource.TILE
        })
      ),
    saveTrack: (trackId: ID) =>
      dispatch(saveTrack(trackId, FavoriteSource.TILE)),
    unsaveTrack: (trackId: ID) =>
      dispatch(unsaveTrack(trackId, FavoriteSource.TILE)),
    repostTrack: (trackId: ID) =>
      dispatch(repostTrack(trackId, RepostSource.TILE)),
    unrepostTrack: (trackId: ID) =>
      dispatch(undoRepostTrack(trackId, RepostSource.TILE)),
    clickOverflow: (trackId: ID, overflowActions: OverflowAction[]) =>
      dispatch(
        open({ source: OverflowSource.TRACKS, id: trackId, overflowActions })
      ),
    setRepostTrackId: (trackId: ID) =>
      dispatch(setRepost(trackId, RepostType.TRACK)),
    setFavoriteTrackId: (trackId: ID) =>
      dispatch(setFavorite(trackId, FavoriteType.TRACK)),
    goToRoute: (route: string) => dispatch(pushRoute(route))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedTrackTile)
