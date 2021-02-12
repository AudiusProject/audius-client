import cn from 'classnames'
import React, { memo } from 'react'
import { IconKebabHorizontal } from '@audius/stems'

import loadingSpinner from 'assets/animations/loadingSpinner.json'
import { ReactComponent as IconHeart } from 'assets/img/iconHeart.svg'
import { ReactComponent as IconPause } from 'assets/img/pbIconPause.svg'
import { ReactComponent as IconPlay } from 'assets/img/pbIconPlay.svg'
import { ReactComponent as IconDrag } from 'assets/img/iconDrag.svg'
import { ReactComponent as IconRemoveTrack } from 'assets/img/iconRemoveTrack.svg'
import TablePlayButton from 'components/tracks-table/TablePlayButton'
import { useTrackCoverArt } from 'hooks/useImageSize'
import { ID } from 'models/common/Identifiers'
import { CoverArtSizes, SquareSizes } from 'models/common/ImageSizes'
import Lottie from 'react-lottie'
import styles from './TrackListItem.module.css'
import IconButton from 'components/general/IconButton'
import UserBadges from 'containers/user-badges/UserBadges'

export enum TrackItemAction {
  Save = 'save',
  Overflow = 'overflow'
}

type ArtworkIconProps = {
  isLoading: boolean
  isPlaying: boolean
}

const ArtworkIcon = ({ isLoading, isPlaying }: ArtworkIconProps) => {
  let artworkIcon
  if (isLoading) {
    artworkIcon = (
      <div className={styles.loadingAnimation}>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingSpinner
          }}
        />
      </div>
    )
  } else if (isPlaying) {
    artworkIcon = <IconPause />
  } else {
    artworkIcon = <IconPlay />
  }
  return <div className={styles.artworkIcon}>{artworkIcon}</div>
}

type ArtworkProps = {
  trackId: ID
  isLoading: boolean
  isActive?: boolean
  isPlaying: boolean
  coverArtSizes: CoverArtSizes
}
const Artwork = ({
  trackId,
  isPlaying,
  isActive,
  isLoading,
  coverArtSizes
}: ArtworkProps) => {
  const image = useTrackCoverArt(
    trackId,
    coverArtSizes,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <div className={styles.artworkContainer}>
      <div
        className={cn(styles.artwork, {})}
        style={
          image
            ? {
                backgroundImage: `url(${image})`
              }
            : {}
        }
      >
        {isActive ? (
          <ArtworkIcon isLoading={isLoading} isPlaying={isPlaying} />
        ) : null}
      </div>
    </div>
  )
}

const getMessages = ({ isDeleted = false }: { isDeleted?: boolean } = {}) => ({
  deleted: isDeleted ? ' [Deleted By Artist]' : ''
})

export type TrackListItemProps = {
  className?: string
  index: number
  isLoading: boolean
  isSaved?: boolean
  isReposted?: boolean
  isActive?: boolean
  isPlaying?: boolean
  isRemoveActive?: boolean
  isDeleted: boolean
  coverArtSizes?: CoverArtSizes
  artistName: string
  artistHandle: string
  trackTitle: string
  trackId: ID
  userId: ID
  uid?: string
  isReorderable?: boolean
  isDragging?: boolean
  onSave?: (isSaved: boolean, trackId: ID) => void
  onRemove?: (trackId: ID) => void
  togglePlay?: (uid: string, trackId: ID) => void
  onClickOverflow?: () => void
  trackItemAction?: TrackItemAction
}

const TrackListItem = ({
  className,
  isLoading,
  index,
  isSaved = false,
  isActive = false,
  isPlaying = false,
  isRemoveActive = false,
  artistName,
  trackTitle,
  trackId,
  userId,
  uid,
  coverArtSizes,
  isDeleted,
  onSave,
  onRemove,
  togglePlay,
  trackItemAction,
  onClickOverflow,
  isReorderable = false,
  isDragging = false
}: TrackListItemProps) => {
  const messages = getMessages({ isDeleted })

  const onClickTrack = () => {
    if (uid && !isDeleted && togglePlay) togglePlay(uid, trackId)
  }

  const onSaveTrack = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeleted && !isSaved) return
    if (onSave) onSave(isSaved, trackId)
  }

  const onRemoveTrack = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) onRemove(index)
  }

  return (
    <div
      className={cn(styles.trackContainer, className, {
        [styles.isActive]: isActive,
        [styles.isDeleted]: isDeleted,
        [styles.isReorderable]: isReorderable,
        [styles.isDragging]: isDragging
      })}
      onClick={onClickTrack}
    >
      {coverArtSizes ? (
        <div>
          <Artwork
            trackId={trackId}
            coverArtSizes={coverArtSizes}
            isActive={isActive}
            isLoading={isLoading}
            isPlaying={isPlaying}
          />
        </div>
      ) : isActive && !isDeleted ? (
        <div className={styles.playButtonContainer}>
          <TablePlayButton
            playing={true}
            paused={!isPlaying}
            hideDefault={false}
          />
        </div>
      ) : null}
      {isReorderable && <IconDrag className={styles.dragIcon} />}

      <div className={styles.nameArtistContainer}>
        <div className={styles.trackTitle}>
          {trackTitle}
          {messages.deleted}
        </div>
        <div className={styles.artistName}>
          {artistName}
          <UserBadges
            userId={userId}
            badgeSize={12}
            className={styles.badges}
          />
        </div>
      </div>
      {onSaveTrack && trackItemAction === TrackItemAction.Save && (
        <div className={styles.iconContainer} onClick={onSaveTrack}>
          <IconHeart
            className={cn(styles.heartIcon, { [styles.isSaved]: isSaved })}
          />
        </div>
      )}
      {onClickOverflow && trackItemAction === TrackItemAction.Overflow && (
        <div className={styles.iconContainer}>
          <IconButton
            icon={<IconKebabHorizontal />}
            className={styles.kebabContainer}
            onClick={(e: any) => {
              e.stopPropagation()
              onClickOverflow()
            }}
          />
        </div>
      )}
      {onRemove && (
        <div className={styles.iconContainer}>
          <IconButton
            icon={<IconRemoveTrack />}
            className={cn(styles.removeTrackContainer, {
              [styles.isRemoveActive]: isRemoveActive
            })}
            onClick={onRemoveTrack}
          />
        </div>
      )}
    </div>
  )
}

export default memo(TrackListItem)
