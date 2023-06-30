import { memo, MouseEvent, useCallback } from 'react'

import {
  formatCount,
  accountSelectors,
  playbackPositionSelectors,
  pluralize,
  FeatureFlags,
  formatLineupTileDuration,
  Genre,
  CommonState,
  getDogEarType
} from '@audius/common'
import { IconCheck, IconCrown, IconHidden, ProgressBar } from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import { ReactComponent as IconStar } from 'assets/img/iconStar.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import { DogEar } from 'components/dog-ear'
import Skeleton from 'components/skeleton/Skeleton'
import typeStyles from 'components/typography/typography.module.css'
import { useFlag } from 'hooks/useRemoteConfig'

import { LockedStatusBadge } from '../LockedStatusBadge'
import { PremiumContentLabel } from '../PremiumContentLabel'
import {
  TrackTileSize,
  DesktopTrackTileProps as TrackTileProps
} from '../types'

import { BottomRow } from './BottomRow'
import styles from './TrackTile.module.css'

const { getUserId } = accountSelectors
const { getTrackPosition } = playbackPositionSelectors

const messages = {
  getPlays: (listenCount: number) => ` ${pluralize('Play', listenCount)}`,
  artistPick: 'Artist Pick',
  hiddenTrack: 'Hidden Track',
  timeLeft: 'left',
  played: 'Played'
}

const RankAndIndexIndicator = ({
  hasOrdering,
  showCrownIcon,
  isLoading,
  index
}: {
  hasOrdering: boolean
  showCrownIcon: boolean
  isLoading: boolean
  index: number
}) => {
  return (
    <>
      {hasOrdering && (
        <div className={styles.order}>
          {showCrownIcon && (
            <div className={styles.crownContainer}>
              <IconCrown />
            </div>
          )}
          {!isLoading && index}
        </div>
      )}
    </>
  )
}

const renderLockedOrMessageContent = ({
  doesUserHaveAccess,
  fieldVisibility,
  isOwner,
  isPremium,
  listenCount
}: Pick<
  TrackTileProps,
  | 'doesUserHaveAccess'
  | 'fieldVisibility'
  | 'isOwner'
  | 'isPremium'
  | 'listenCount'
>) => {
  if (isPremium && !isOwner) {
    return <LockedStatusBadge locked={!doesUserHaveAccess} />
  }

  const hidePlays = fieldVisibility
    ? fieldVisibility.play_count === false
    : false

  return (
    listenCount !== undefined &&
    listenCount > 0 && (
      <div
        className={cn(styles.plays, {
          [styles.isHidden]: hidePlays
        })}
      >
        {formatCount(listenCount)}
        {messages.getPlays(listenCount)}
      </div>
    )
  )
}

const TrackTile = ({
  size,
  order,
  standalone,
  isFavorited,
  isReposted,
  isOwner,
  isUnlisted,
  isPremium,
  premiumConditions,
  doesUserHaveAccess,
  listenCount,
  isActive,
  isArtistPick,
  isDisabled,
  isLoading,
  isPlaying,
  artwork,
  rightActions,
  header,
  title,
  genre,
  userName,
  duration,
  stats,
  fieldVisibility,
  bottomBar,
  isDarkMode,
  isMatrixMode,
  showIconButtons = true,
  containerClassName,
  onClickTitle,
  onClickRepost,
  onClickFavorite,
  onClickShare,
  onTogglePlay,
  showRankIcon,
  permalink,
  isTrack,
  trackId
}: TrackTileProps) => {
  const { isEnabled: isNewPodcastControlsEnabled } = useFlag(
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
  )
  const currentUserId = useSelector(getUserId)
  const trackPositionInfo = useSelector((state: CommonState) =>
    getTrackPosition(state, { trackId, userId: currentUserId })
  )

  const hasOrdering = order !== undefined
  const isLongFormContent =
    genre === Genre.PODCASTS || genre === Genre.AUDIOBOOKS

  const getDurationText = () => {
    if (!duration) {
      return ''
    } else if (
      isLongFormContent &&
      isNewPodcastControlsEnabled &&
      trackPositionInfo
    ) {
      if (trackPositionInfo.status === 'IN_PROGRESS') {
        const remainingTime = duration - trackPositionInfo.playbackPosition
        return (
          <div className={styles.progressTextContainer}>
            <p className={styles.progressText}>
              {`${formatLineupTileDuration(remainingTime, true)} ${
                messages.timeLeft
              }`}
            </p>
            <ProgressBar
              value={(trackPositionInfo.playbackPosition / duration) * 100}
              sliderClassName={styles.progressTextSlider}
            />
          </div>
        )
      } else if (trackPositionInfo.status === 'COMPLETED') {
        return (
          <div className={styles.completeText}>
            {messages.played}
            <IconCheck className={styles.completeIcon} />
          </div>
        )
      }
    } else {
      return formatLineupTileDuration(duration, isLongFormContent)
    }
  }

  const onClickTitleWrapper = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      onClickTitle(e)
    },
    [onClickTitle]
  )

  const dogEarType = isLoading
    ? undefined
    : getDogEarType({
        doesUserHaveAccess,
        isArtistPick,
        isOwner,
        isUnlisted,
        premiumConditions
      })

  return (
    <div
      className={cn(styles.container, {
        [containerClassName!]: !!containerClassName,
        // Active indicates that the track is the current queue item
        [styles.isActive]: isActive,
        [styles.isDisabled]: isDisabled,

        [styles.large]: size === TrackTileSize.LARGE,
        [styles.small]: size === TrackTileSize.SMALL,

        // Standalone means that this tile is not w/ a playlist
        [styles.standalone]: !!standalone
      })}
      onClick={!isLoading && !isDisabled ? onTogglePlay : undefined}
    >
      {/* prefix ordering */}
      <RankAndIndexIndicator
        hasOrdering={hasOrdering}
        showCrownIcon={showRankIcon}
        isLoading={!!isLoading}
        index={order ?? 0}
      />
      {/* Track tile image */}
      <div
        className={cn(styles.imageContainer, {
          [styles.leftSpacing]: !hasOrdering
        })}
      >
        {artwork}
      </div>
      {dogEarType ? <DogEar type={dogEarType} /> : null}
      <div
        className={cn(styles.body, {
          // if track and not playlist/album
          [styles.withoutHeader]: true
        })}
      >
        <div className={cn(styles.topSection)}>
          {size === TrackTileSize.LARGE ? (
            <div
              className={cn(
                typeStyles.labelXSmall,
                typeStyles.labelWeak,
                styles.headerRow
              )}
            >
              {!isLoading && header && <div>{header}</div>}
            </div>
          ) : null}
          <div className={styles.titleRow}>
            {isLoading ? (
              <Skeleton width='80%' className={styles.skeleton} />
            ) : (
              <a
                href={permalink}
                className={cn(typeStyles.titleMedium, styles.title)}
                onClick={onClickTitleWrapper}
              >
                {title}
                {isPlaying ? (
                  <IconVolume className={styles.volumeIcon} />
                ) : null}
              </a>
            )}
          </div>
          <div
            className={cn(
              typeStyles.titleMedium,
              typeStyles.titleWeak,
              styles.creatorRow
            )}
          >
            {isLoading ? (
              <Skeleton width='50%' className={styles.skeleton} />
            ) : (
              userName
            )}
          </div>

          <div
            className={cn(typeStyles.bodyXSmall, styles.socialsRow, {
              [styles.isHidden]: isUnlisted
            })}
          >
            {isLoading ? (
              <Skeleton width='30%' className={styles.skeleton} />
            ) : (
              <>
                {!isLoading && isPremium && (
                  <PremiumContentLabel
                    premiumConditions={premiumConditions}
                    doesUserHaveAccess={!!doesUserHaveAccess}
                    isOwner={isOwner}
                  />
                )}
                {stats}
              </>
            )}
          </div>
          <div className={cn(typeStyles.bodyXSmall, styles.topRight)}>
            {isArtistPick ? (
              <div className={styles.topRightIconLabel}>
                <IconStar className={styles.topRightIcon} />
                {messages.artistPick}
              </div>
            ) : null}
            {isUnlisted ? (
              <div className={styles.topRightIconLabel}>
                <IconHidden className={styles.topRightIcon} />
                {messages.hiddenTrack}
              </div>
            ) : null}
            {!isLoading && duration ? (
              <div className={styles.duration}>{getDurationText()}</div>
            ) : null}
          </div>
          <div className={cn(typeStyles.bodyXSmall, styles.bottomRight)}>
            {!isLoading
              ? renderLockedOrMessageContent({
                  doesUserHaveAccess,
                  fieldVisibility,
                  isOwner,
                  isPremium,
                  listenCount
                })
              : null}
          </div>
        </div>
        <div className={styles.divider} />
        <BottomRow
          doesUserHaveAccess={doesUserHaveAccess}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isFavorited={isFavorited}
          isReposted={isReposted}
          rightActions={rightActions}
          bottomBar={bottomBar}
          isUnlisted={isUnlisted}
          fieldVisibility={fieldVisibility}
          isOwner={isOwner}
          isDarkMode={isDarkMode}
          isMatrixMode={isMatrixMode}
          showIconButtons={showIconButtons}
          onClickRepost={onClickRepost}
          onClickFavorite={onClickFavorite}
          onClickShare={onClickShare}
          isTrack={isTrack}
          trackId={trackId}
        />
      </div>
    </div>
  )
}

export default memo(TrackTile)
