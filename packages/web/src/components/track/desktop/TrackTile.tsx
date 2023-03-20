import { memo, MouseEvent, useCallback } from 'react'

import {
  formatCount,
  playbackPositionSelectors,
  pluralize,
  FeatureFlags,
  formatLineupTileDuration,
  Genre,
  CommonState
} from '@audius/common'
import { IconCheck, IconCrown, IconHidden, ProgressBar } from '@audius/stems'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import { ReactComponent as IconStar } from 'assets/img/iconStar.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import Skeleton from 'components/skeleton/Skeleton'
import { useFlag } from 'hooks/useRemoteConfig'

import { PremiumContentLabel } from '../PremiumContentLabel'
import TrackBannerIcon, { TrackBannerIconType } from '../TrackBannerIcon'
import {
  TrackTileSize,
  DesktopTrackTileProps as TrackTileProps
} from '../types'

import { BottomRow } from './BottomRow'
import styles from './TrackTile.module.css'

const { getTrackPosition } = playbackPositionSelectors

const messages = {
  getPlays: (listenCount: number) => ` ${pluralize('Play', listenCount)}`,
  artistPick: 'Artist Pick',
  hiddenTrack: 'Hidden Track',
  collectibleGated: 'Collectible Gated',
  specialAccess: 'Special Access',
  unlocked: 'Unlocked',
  locked: 'LOCKED',
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

const TrackTile = memo(
  ({
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
    isDisabled,
    isLoading,
    isArtistPick,
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
    const { isEnabled: isGatedContentEnabled } = useFlag(
      FeatureFlags.GATED_CONTENT_ENABLED
    )
    const { isEnabled: isNewPodcastControlsEnabled } = useFlag(
      FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED
    )
    const trackPositionInfo = useSelector((state: CommonState) =>
      getTrackPosition(state, { trackId })
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
              <ProgressBar
                value={(trackPositionInfo.playbackPosition / duration) * 100}
                sliderClassName={styles.progressTextSlider}
              />
              <p className={styles.progressText}>
                {`${formatLineupTileDuration(remainingTime, true)} ${
                  messages.timeLeft
                }`}
              </p>
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

    const hidePlays = fieldVisibility
      ? fieldVisibility.play_count === false
      : false

    const showPremiumCornerTag =
      isGatedContentEnabled &&
      !isLoading &&
      premiumConditions &&
      (isOwner || !doesUserHaveAccess)
    const cornerTagIconType = showPremiumCornerTag
      ? isOwner
        ? premiumConditions.nft_collection
          ? TrackBannerIconType.COLLECTIBLE_GATED
          : TrackBannerIconType.SPECIAL_ACCESS
        : TrackBannerIconType.LOCKED
      : null

    const onClickTitleWrapper = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClickTitle(e)
      },
      [onClickTitle]
    )

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
        {showPremiumCornerTag && cornerTagIconType ? (
          <TrackBannerIcon
            type={cornerTagIconType}
            isMatrixMode={isMatrixMode}
            containerClassName={styles.premiumCornerTagContainer}
          />
        ) : null}
        {isArtistPick && !showPremiumCornerTag ? (
          <TrackBannerIcon
            type={TrackBannerIconType.STAR}
            isMatrixMode={isMatrixMode}
          />
        ) : null}
        {isUnlisted && (
          <TrackBannerIcon
            type={TrackBannerIconType.HIDDEN}
            isMatrixMode={isMatrixMode}
          />
        )}
        <div
          className={cn(styles.body, {
            // if track and not playlist/album
            [styles.withoutHeader]: true
          })}
        >
          <div className={cn(styles.topSection)}>
            <div className={cn(styles.headerRow)}>
              {!isLoading && header && <div>{header}</div>}
            </div>
            <div
              className={cn(
                styles.titleRow,
                styles.title,
                isPremium ? styles.withPremium : null
              )}
            >
              {isLoading ? (
                <Skeleton width='80%' className={styles.skeleton} />
              ) : (
                <a
                  href={permalink}
                  className={styles.title}
                  onClick={onClickTitleWrapper}
                >
                  {title}
                  {isActive ? (
                    <IconVolume className={styles.volumeIcon} />
                  ) : null}
                </a>
              )}
            </div>
            <div className={styles.creatorRow}>
              {isLoading ? (
                <Skeleton width='50%' className={styles.skeleton} />
              ) : (
                userName
              )}
            </div>

            <div
              className={cn(styles.socialsRow, {
                [styles.isHidden]: isUnlisted
              })}
            >
              {isLoading ? (
                <Skeleton width='30%' className={styles.skeleton} />
              ) : (
                stats
              )}
            </div>
            <div className={styles.topRight}>
              {isArtistPick && (
                <div className={styles.topRightIconLabel}>
                  <IconStar className={styles.topRightIcon} />
                  {messages.artistPick}
                </div>
              )}
              {!isLoading && isPremium && (
                <PremiumContentLabel
                  premiumConditions={premiumConditions}
                  doesUserHaveAccess={!!doesUserHaveAccess}
                  isOwner={isOwner}
                />
              )}
              {isUnlisted && (
                <div className={styles.topRightIconLabel}>
                  <IconHidden className={styles.topRightIcon} />
                  {messages.hiddenTrack}
                </div>
              )}
              {!isLoading && duration && (
                <div className={styles.duration}>{getDurationText()}</div>
              )}
            </div>
            <div className={styles.bottomRight}>
              {!isLoading && listenCount !== undefined && listenCount > 0 && (
                <div
                  className={cn(styles.plays, {
                    [styles.isHidden]: hidePlays
                  })}
                >
                  {formatCount(listenCount)}
                  {messages.getPlays(listenCount)}
                </div>
              )}
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
)

export default memo(TrackTile)
