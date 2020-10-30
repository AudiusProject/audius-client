import { TrackTileProps } from 'components/track/types'
import { ID } from 'models/common/Identifiers'
import React, { useCallback, useState, useEffect } from 'react'

import styles from './TrackTile.module.css'

import { ReactComponent as IconStar } from 'assets/img/iconStar.svg'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import cn from 'classnames'
import { formatCount } from 'utils/formatUtil'
import { formatSeconds } from 'utils/timeUtil'
import Skeleton from 'components/general/Skeleton'
import ArtistPick from '../ArtistPick'
import BottomButtons from './BottomButtons'
import TrackTileArt from './TrackTileArt'
import FavoriteButton from 'components/general/alt-button/FavoriteButton'
import RepostButton from 'components/general/alt-button/RepostButton'

const messages = {
  artistPick: "Artist's Pick",
  coSign: 'Co-Sign',
  reposted: 'Reposted',
  favorited: 'Favorited',
  repostedAndFavorited: 'Reposted & Favorited'
}

type ExtraProps = {
  goToTrackPage: (e: React.MouseEvent<HTMLElement>) => void
  goToArtistPage: (e: React.MouseEvent<HTMLElement>) => void
  toggleSave: (trackId: ID) => void
  toggleRepost: (trackId: ID) => void
  onShare: (trackId: ID) => void
  makeGoToRepostsPage: (
    trackId: ID
  ) => (e: React.MouseEvent<HTMLElement>) => void
  makeGoToFavoritesPage: (
    trackId: ID
  ) => (e: React.MouseEvent<HTMLElement>) => void
  isOwner: boolean
  darkMode: boolean
}

const formatListenCount = (listenCount?: number) => {
  if (!listenCount) return null
  const suffix = listenCount === 1 ? 'Play' : 'Plays'
  return `${formatCount(listenCount)} ${suffix}`
}

const formatCoSign = ({
  hasReposted,
  hasFavorited
}: {
  hasReposted: boolean
  hasFavorited: boolean
}) => {
  if (hasReposted && hasFavorited) {
    return messages.repostedAndFavorited
  } else if (hasFavorited) {
    return messages.favorited
  }
  return messages.reposted
}

const TrackTile = (props: TrackTileProps & ExtraProps) => {
  const {
    id,
    index,
    showSkeleton,
    hasLoaded,
    toggleSave,
    toggleRepost,
    onShare,
    onClickOverflow,
    coSign,
    darkMode
  } = props

  const onToggleSave = useCallback(() => toggleSave(id), [toggleSave, id])

  const onToggleRepost = useCallback(() => toggleRepost(id), [toggleRepost, id])

  const onClickShare = useCallback(() => onShare(id), [onShare, id])

  const onClickOverflowMenu = useCallback(
    () => onClickOverflow && onClickOverflow(id),
    [onClickOverflow, id]
  )

  const [artworkLoaded, setArtworkLoaded] = useState(false)
  useEffect(() => {
    if (artworkLoaded && !showSkeleton) {
      hasLoaded(index)
    }
  }, [artworkLoaded, hasLoaded, index, showSkeleton])

  const fadeIn = {
    [styles.show]: artworkLoaded,
    [styles.hide]: !artworkLoaded
  }

  return (
    <div className={styles.container}>
      {props.showArtistPick && props.isArtistPick && <ArtistPick isMobile />}
      <div
        className={styles.mainContent}
        onClick={() => {
          props.togglePlay(props.uid, id)
        }}
      >
        <div className={cn(styles.topRight, styles.statText)}>
          {props.showArtistPick && props.isArtistPick && (
            <div className={styles.artistPick}>
              <IconStar />
              {messages.artistPick}
            </div>
          )}
          <div className={cn(styles.duration, fadeIn)}>
            {formatSeconds(props.duration)}
          </div>
        </div>
        <div className={styles.metadata}>
          <TrackTileArt
            id={props.id}
            isTrack={true}
            callback={() => setArtworkLoaded(true)}
            showSkeleton={showSkeleton}
            coverArtSizes={props.coverArtSizes}
            coSign={coSign}
            className={styles.albumArtContainer}
          />
          <div
            className={cn(styles.titles, {
              [styles.titlesActive]: props.isPlaying
            })}
          >
            <div className={styles.title} onClick={props.goToTrackPage}>
              <div className={cn(fadeIn)}>{props.title}</div>
              {props.isPlaying && <IconVolume />}
              {(!artworkLoaded || showSkeleton) && (
                <Skeleton
                  className={styles.skeleton}
                  width='80%'
                  height='80%'
                />
              )}
            </div>
            <div className={styles.artist} onClick={props.goToArtistPage}>
              <span className={cn(fadeIn, styles.userName)}>
                {props.artistName}
              </span>
              {props.artistIsVerified && (
                <IconVerified className={styles.iconVerified} />
              )}
              {(!artworkLoaded || showSkeleton) && (
                <Skeleton
                  className={styles.skeleton}
                  width='60%'
                  height='80%'
                />
              )}
            </div>
          </div>
          {coSign && (
            <div className={styles.coSignLabel}>{messages.coSign}</div>
          )}
        </div>
        {coSign && (
          <div className={styles.coSignText}>
            <div className={styles.name}>
              {coSign.user.name}
              {coSign.user.is_verified && (
                <IconVerified className={styles.iconVerified} />
              )}
            </div>
            {formatCoSign({
              hasReposted: coSign.has_remix_author_reposted,
              hasFavorited: coSign.has_remix_author_saved
            })}
          </div>
        )}
        <div className={cn(styles.stats, styles.statText)}>
          {!!(props.repostCount || props.saveCount) && (
            <>
              <div
                className={cn(styles.statItem, fadeIn, {
                  [styles.disabledStatItem]: !props.repostCount
                })}
                onClick={
                  props.repostCount ? props.makeGoToRepostsPage(id) : undefined
                }
              >
                {formatCount(props.repostCount)}
                <RepostButton
                  iconMode
                  isDarkMode={darkMode}
                  className={styles.repostButton}
                />
              </div>
              <div
                className={cn(styles.statItem, fadeIn, {
                  [styles.disabledStatItem]: !props.saveCount
                })}
                onClick={
                  props.saveCount ? props.makeGoToFavoritesPage(id) : undefined
                }
              >
                {formatCount(props.saveCount)}
                <FavoriteButton
                  iconMode
                  isDarkMode={darkMode}
                  className={styles.favoriteButton}
                />
              </div>
            </>
          )}
          <div className={cn(styles.listenCount, fadeIn)}>
            {formatListenCount(props.listenCount)}
          </div>
        </div>
        <BottomButtons
          hasSaved={props.hasCurrentUserSaved}
          hasReposted={props.hasCurrentUserReposted}
          toggleRepost={onToggleRepost}
          toggleSave={onToggleSave}
          onShare={onClickShare}
          onClickOverflow={onClickOverflowMenu}
          isOwner={props.isOwner}
          darkMode={darkMode}
        />
      </div>
    </div>
  )
}

export default TrackTile
