import React, { memo, useState, useCallback, useEffect } from 'react'
import { connect } from 'react-redux'
import { push as pushRoute } from 'connected-react-router'
import cn from 'classnames'
import styles from './ConnectedTrackTile.module.css'

import { AppState } from 'store/types'
import { Dispatch } from 'redux'
import { UID, ID } from 'models/common/Identifiers'
import { getTrack } from 'store/cache/tracks/selectors'
import Menu from 'containers/menu/Menu'
import { getUserFromTrack } from 'store/cache/users/selectors'
import { getUid, getPlaying, getBuffering } from 'store/player/selectors'
import { getUserHandle } from 'store/account/selectors'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListType,
  UserListEntityType
} from 'store/application/ui/userListModal/types'
import { getTrackWithFallback, getUserWithFallback } from '../helpers'
import { isDarkMode } from 'utils/theme/theme'

import {
  saveTrack,
  unsaveTrack,
  repostTrack,
  undoRepostTrack,
  shareTrack
} from 'store/social/tracks/actions'
import { ShareSource, RepostSource, FavoriteSource } from 'services/analytics'

import { TrackTileSize } from '../types'

import { OwnProps as TrackMenuProps } from 'containers/menu/TrackMenu'
import { TrackArtwork } from 'components/track/desktop/Artwork'
import ArtistPopover from 'components/artist/ArtistPopover'

import { fullTrackPage, trackPage, profilePage } from 'utils/route'

import Stats from './stats/Stats'
import { Flavor } from './stats/StatsText'

import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import { ReactComponent as IconKebabHorizontal } from 'assets/img/iconKebabHorizontal.svg'
import TrackTile from './TrackTile'
import Draggable from 'containers/dragndrop/Draggable'

type OwnProps = {
  uid: UID
  index: number
  order: number
  containerClassName?: string
  size: TrackTileSize
  showArtistPick: boolean
  ordered: boolean
  togglePlay: (uid: UID, id: ID) => void
  isLoading: boolean
  hasLoaded: (index: number) => void
}

type ConnectedTrackTileProps = OwnProps &
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
    showArtistPick,
    goToRoute,
    togglePlay,
    isBuffering,
    isPlaying,
    playingUid,
    isLoading,
    hasLoaded,
    // showSkeleton,
    containerClassName,
    setRepostUsers,
    setFavoriteUsers,
    setModalVisibility,
    userHandle,
    saveTrack,
    unsaveTrack,
    repostTrack,
    undoRepostTrack,
    shareTrack
  }: ConnectedTrackTileProps) => {
    const {
      is_delete,
      track_id: trackId,
      title,
      repost_count,
      save_count,
      followee_reposts,
      followee_saves,
      _co_sign: coSign,
      has_current_user_reposted: isReposted,
      has_current_user_saved: isFavorited,
      _cover_art_sizes,
      play_count,
      duration
    } = getTrackWithFallback(track)

    const {
      _artist_pick,
      name,
      handle,
      is_verified: isVerified
    } = getUserWithFallback(user)

    const isActive = uid === playingUid
    const isTrackBuffering = isActive && isBuffering
    const isTrackPlaying = isActive && isPlaying
    const isOwner = handle === userHandle
    const isArtistPick = showArtistPick && _artist_pick === trackId

    const onClickStatRepost = () => {
      setRepostUsers(trackId)
      setModalVisibility()
    }

    const onClickStatFavorite = () => {
      setFavoriteUsers(trackId)
      setModalVisibility()
    }

    const [artworkLoaded, setArtworkLoaded] = useState(false)
    useEffect(() => {
      if (artworkLoaded && !isLoading && hasLoaded) {
        hasLoaded(index)
      }
    }, [artworkLoaded, hasLoaded, index, isLoading])

    const renderImage = () => {
      const artworkProps = {
        id: trackId,
        coverArtSizes: _cover_art_sizes,
        coSign: coSign || undefined,
        size: 'large',
        isBuffering: isTrackBuffering,
        isPlaying: isTrackPlaying,
        artworkIconClassName: styles.artworkIcon,
        showArtworkIcon: !isLoading,
        showSkeleton: isLoading,
        callback: () => setArtworkLoaded(true)
      }
      return <TrackArtwork {...artworkProps} />
    }

    const renderOverflowMenu = () => {
      const menu: TrackMenuProps = {
        handle: handle,
        isFavorited,
        isReposted,
        mount: 'page',
        isArtistPick: isArtistPick,
        type: 'track',
        trackId: trackId,
        trackTitle: title,
        isDeleted: is_delete,
        isOwner,
        includeArtistPick: handle === userHandle,
        includeEdit: handle === userHandle,
        includeShare: false,
        includeRepost: false,
        includeFavorite: false,
        includeEmbed: true,
        includeTrackPage: true,
        includeAddToPlaylist: true,
        extraMenuItems: []
      }

      return (
        <Menu menu={menu} className={styles.menuContainer}>
          <div
            className={cn(styles.menuKebabContainer, {
              [styles.small]: size === TrackTileSize.SMALL,
              [styles.large]: size === TrackTileSize.LARGE
            })}
          >
            <IconKebabHorizontal className={cn(styles.iconKebabHorizontal)} />
          </div>
        </Menu>
      )
    }

    const onClickArtistName = useCallback(
      e => {
        e.stopPropagation()
        if (goToRoute) goToRoute(profilePage(handle))
      },
      [handle, goToRoute]
    )

    const onClickTitle = useCallback(
      e => {
        e.stopPropagation()
        if (goToRoute) goToRoute(trackPage(handle, title, trackId))
      },
      [goToRoute, handle, title, trackId]
    )

    const renderUserName = () => {
      return (
        <div className={styles.userName}>
          <ArtistPopover handle={handle}>
            <span
              className={cn(styles.name, {
                [styles.artistNameLink]: onClickArtistName
              })}
              onClick={onClickArtistName}
            >
              {name}
            </span>
          </ArtistPopover>
          {isVerified && <IconVerified className={styles.iconVerified} />}
        </div>
      )
    }

    const renderStats = () => {
      const contentTitle = 'track' // undefined,  playlist or album -  undefined is track
      const statSize = 'large'
      return (
        <div className={cn(styles.socialInfo)}>
          <Stats
            hideImage={size === TrackTileSize.SMALL}
            count={repost_count}
            followeeActions={followee_reposts}
            contentTitle={contentTitle}
            size={statSize}
            onClick={onClickStatRepost}
            flavor={Flavor.REPOST}
          />
          <Stats
            count={save_count}
            followeeActions={followee_saves}
            contentTitle={contentTitle}
            size={statSize}
            onClick={onClickStatFavorite}
            flavor={Flavor.FAVORITE}
          />
        </div>
      )
    }

    const onClickFavorite = useCallback(() => {
      if (isFavorited) {
        unsaveTrack(trackId)
      } else {
        saveTrack(trackId)
      }
    }, [saveTrack, unsaveTrack, trackId, isFavorited])

    const onClickRepost = useCallback(() => {
      if (isReposted) {
        undoRepostTrack(trackId)
      } else {
        repostTrack(trackId)
      }
    }, [repostTrack, undoRepostTrack, trackId, isReposted])

    const onClickShare = useCallback(() => {
      shareTrack(trackId)
    }, [shareTrack, trackId])

    const onTogglePlay = useCallback(() => {
      togglePlay(uid, trackId)
    }, [togglePlay, uid, trackId])

    if (is_delete) return null

    const order = ordered && index !== undefined ? index + 1 : undefined
    const artwork = renderImage()
    const stats = renderStats()
    const rightActions = renderOverflowMenu()
    const userName = renderUserName()

    const disableActions = false
    const showSkeleton = isLoading

    return (
      <Draggable
        text={title}
        kind='track'
        id={trackId}
        isOwner={isOwner}
        isDisabled={disableActions || showSkeleton}
        link={fullTrackPage(handle, title, trackId)}
      >
        <TrackTile
          size={size}
          order={order}
          standalone
          isFavorited={isFavorited}
          isReposted={isReposted}
          isOwner={isOwner}
          isLoading={isLoading}
          isDarkMode={isDarkMode()}
          listenCount={play_count}
          isActive={isActive}
          isArtistPick={isArtistPick}
          artwork={artwork}
          rightActions={rightActions}
          title={title}
          userName={userName}
          duration={duration}
          stats={stats}
          containerClassName={cn(styles.container, {
            [containerClassName!]: !!containerClassName,
            [styles.loading]: isLoading,
            [styles.active]: isActive
          })}
          onClickTitle={onClickTitle}
          onClickRepost={onClickRepost}
          onClickFavorite={onClickFavorite}
          onClickShare={onClickShare}
          onTogglePlay={onTogglePlay}
        />
      </Draggable>
    )
  }
)

function mapStateToProps(state: AppState, ownProps: OwnProps) {
  return {
    track: getTrack(state, { uid: ownProps.uid }),
    user: getUserFromTrack(state, { uid: ownProps.uid }),
    playingUid: getUid(state),
    isBuffering: getBuffering(state),
    isPlaying: getPlaying(state),
    userHandle: getUserHandle(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),

    shareTrack: (trackId: ID) =>
      dispatch(shareTrack(trackId, ShareSource.TILE)),
    repostTrack: (trackId: ID) =>
      dispatch(repostTrack(trackId, RepostSource.TILE)),
    undoRepostTrack: (trackId: ID) =>
      dispatch(undoRepostTrack(trackId, RepostSource.TILE)),
    saveTrack: (trackId: ID) =>
      dispatch(saveTrack(trackId, FavoriteSource.TILE)),
    unsaveTrack: (trackId: ID) =>
      dispatch(unsaveTrack(trackId, FavoriteSource.TILE)),

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
    setModalVisibility: () => dispatch(setVisibility(true))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedTrackTile)
