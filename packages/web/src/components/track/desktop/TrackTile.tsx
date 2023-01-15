import { memo, MouseEvent, ReactNode, useCallback } from 'react'

import {
  formatCount,
  pluralize,
  formatSeconds,
  FeatureFlags,
  PremiumConditions,
  FieldVisibility
} from '@audius/common'
import {
  IconCrown,
  IconHidden,
  IconCollectible,
  IconSpecialAccess,
  IconLock,
  IconUnlocked
} from '@audius/stems'
import cn from 'classnames'

import { ReactComponent as IconStar } from 'assets/img/iconStar.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import FavoriteButton from 'components/alt-button/FavoriteButton'
import RepostButton from 'components/alt-button/RepostButton'
import ShareButton from 'components/alt-button/ShareButton'
import Skeleton from 'components/skeleton/Skeleton'
import Tooltip from 'components/tooltip/Tooltip'
import { useFlag } from 'hooks/useRemoteConfig'

import { PremiumTrackCornerTag } from '../PremiumTrackCornerTag'
import TrackBannerIcon, { TrackBannerIconType } from '../TrackBannerIcon'
import {
  TrackTileSize,
  DesktopTrackTileProps as TrackTileProps
} from '../types'

import styles from './TrackTile.module.css'

const messages = {
  getPlays: (listenCount: number) => ` ${pluralize('Play', listenCount)}`,
  artistPick: 'Artist Pick',
  hiddenTrack: 'Hidden Track',
  repostLabel: 'Repost',
  unrepostLabel: 'Unrepost',
  collectibleGated: 'Collectible Gated',
  specialAccess: 'Special Access',
  unlocked: 'Unlocked',
  locked: 'LOCKED'
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

const PremiumContentLabel = ({
  premiumConditions,
  doesUserHaveAccess
}: {
  premiumConditions?: PremiumConditions
  doesUserHaveAccess: boolean
}) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )

  if (!isPremiumContentEnabled) {
    return null
  }

  if (doesUserHaveAccess) {
    return (
      <div className={cn(styles.premiumContent, styles.topRightIconLabel)}>
        <IconUnlocked className={styles.topRightIcon} />
        {messages.unlocked}
      </div>
    )
  }

  if (premiumConditions?.nft_collection) {
    return (
      <div className={cn(styles.premiumContent, styles.topRightIconLabel)}>
        <IconCollectible className={styles.topRightIcon} />
        {messages.collectibleGated}
      </div>
    )
  }

  return (
    <div className={cn(styles.premiumContent, styles.topRightIconLabel)}>
      <IconSpecialAccess className={styles.topRightIcon} />
      {messages.specialAccess}
    </div>
  )
}

type BottomRowProps = {
  doesUserHaveAccess?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  isFavorited?: boolean
  isReposted?: boolean
  rightActions?: ReactNode
  bottomBar?: ReactNode
  isUnlisted?: boolean
  fieldVisibility?: FieldVisibility
  isOwner: boolean
  isDarkMode?: boolean
  isMatrixMode: boolean
  showIconButtons?: boolean
  onClickRepost: (e?: MouseEvent) => void
  onClickFavorite: (e?: MouseEvent) => void
  onClickShare: (e?: MouseEvent) => void
}

const BottomRow = ({
  doesUserHaveAccess,
  isDisabled,
  isLoading,
  isFavorited,
  isReposted,
  rightActions,
  bottomBar,
  isUnlisted,
  fieldVisibility,
  isOwner,
  isDarkMode,
  isMatrixMode,
  showIconButtons,
  onClickRepost,
  onClickFavorite,
  onClickShare
}: BottomRowProps) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )

  const repostLabel = isReposted ? messages.unrepostLabel : messages.repostLabel

  const hideShare: boolean = fieldVisibility
    ? fieldVisibility.share === false
    : false

  const onStopPropagation = useCallback(
    (e: MouseEvent) => e.stopPropagation(),
    []
  )

  const renderShareButton = () => {
    return (
      <Tooltip
        text={'Share'}
        disabled={isDisabled || hideShare}
        placement='top'
        mount='page'
      >
        <div
          className={cn(styles.iconButtonContainer, {
            [styles.isHidden]: hideShare
          })}
          onClick={onStopPropagation}
        >
          <ShareButton
            onClick={onClickShare}
            isDarkMode={!!isDarkMode}
            className={styles.iconButton}
            stopPropagation={false}
            isMatrixMode={isMatrixMode}
          />
        </div>
      </Tooltip>
    )
  }

  if (isPremiumContentEnabled && !doesUserHaveAccess) {
    return (
      <div className={cn(styles.premiumContent, styles.bottomRow)}>
        <IconLock />
        {messages.locked}
      </div>
    )
  }

  return (
    <div className={styles.bottomRow}>
      {bottomBar}
      {!isLoading && showIconButtons && isUnlisted && (
        <div className={styles.iconButtons}>{renderShareButton()}</div>
      )}
      {!isLoading && showIconButtons && !isUnlisted && (
        <div className={styles.iconButtons}>
          <Tooltip
            text={repostLabel}
            disabled={isDisabled || isOwner}
            placement='top'
            mount='page'
          >
            <div
              className={cn(styles.iconButtonContainer, {
                [styles.isDisabled]: isOwner,
                [styles.isHidden]: isUnlisted
              })}
            >
              <RepostButton
                aria-label={repostLabel}
                onClick={onClickRepost}
                isActive={isReposted}
                isDisabled={isOwner}
                isDarkMode={!!isDarkMode}
                isMatrixMode={isMatrixMode}
                wrapperClassName={styles.iconButton}
              />
            </div>
          </Tooltip>
          <Tooltip
            text={isFavorited ? 'Unfavorite' : 'Favorite'}
            disabled={isDisabled || isOwner}
            placement='top'
            mount='page'
          >
            <div
              className={cn(styles.iconButtonContainer, {
                [styles.isDisabled]: isOwner,
                [styles.isHidden]: isUnlisted
              })}
            >
              <FavoriteButton
                onClick={onClickFavorite}
                isActive={isFavorited}
                isDisabled={isOwner}
                isDarkMode={!!isDarkMode}
                isMatrixMode={isMatrixMode}
                wrapperClassName={styles.iconButton}
              />
            </div>
          </Tooltip>
          {renderShareButton()}
        </div>
      )}
      {!isLoading && <div>{rightActions}</div>}
    </div>
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
    permalink
  }: TrackTileProps) => {
    const hasOrdering = order !== undefined

    const onClickTitleWrapper = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        onClickTitle(e)
      },
      [onClickTitle]
    )

    const hidePlays = fieldVisibility
      ? fieldVisibility.play_count === false
      : false

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
        onClick={isLoading || isDisabled ? undefined : onTogglePlay}
      >
        {isPremium && (
          <PremiumTrackCornerTag doesUserHaveAccess={!!doesUserHaveAccess} />
        )}
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
        {isArtistPick && (
          <TrackBannerIcon
            type={TrackBannerIconType.STAR}
            isMatrixMode={isMatrixMode}
          />
        )}
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
            <div className={styles.titleRow}>
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
              {isPremium && (
                <PremiumContentLabel premiumConditions={premiumConditions} doesUserHaveAccess={!!doesUserHaveAccess} />
              )}
              {isArtistPick && (
                <div className={styles.topRightIconLabel}>
                  <IconStar className={styles.topRightIcon} />
                  {messages.artistPick}
                </div>
              )}
              {isUnlisted && (
                <div className={styles.topRightIconLabel}>
                  <IconHidden className={styles.topRightIcon} />
                  {messages.hiddenTrack}
                </div>
              )}
              {!isLoading && duration && (
                <div className={styles.duration}>{formatSeconds(duration)}</div>
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
          />
        </div>
      </div>
    )
  }
)

export default memo(TrackTile)
