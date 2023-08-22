import { useCallback, useState } from 'react'

import {
  squashNewLines,
  getCanonicalName,
  formatDate,
  formatSeconds,
  Genre,
  FeatureFlags,
  isAudiusUrl,
  getPathFromAudiusUrl,
  Nullable,
  Remix,
  CoverArtSizes,
  ID,
  PremiumConditions,
  FieldVisibility,
  getDogEarType,
  isPremiumContentUSDCPurchaseGated
} from '@audius/common'
import {
  Button,
  ButtonType,
  IconShare,
  IconRocket,
  IconRepost,
  IconHeart,
  IconKebabHorizontal
} from '@audius/stems'
import cn from 'classnames'
import Linkify from 'linkify-react'

import { ReactComponent as IconRobot } from 'assets/img/robot.svg'
import DownloadButtons from 'components/download-buttons/DownloadButtons'
import { EntityActionButton } from 'components/entity-page/EntityActionButton'
import { UserLink } from 'components/link'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Menu from 'components/menu/Menu'
import RepostFavoritesStats from 'components/repost-favorites-stats/RepostFavoritesStats'
import { SearchTag } from 'components/search/SearchTag'
import Skeleton from 'components/skeleton/Skeleton'
import { Tile } from 'components/tile'
import Toast from 'components/toast/Toast'
import Tooltip from 'components/tooltip/Tooltip'
import { ComponentPlacement } from 'components/types'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { moodMap } from 'utils/Moods'

import { AiTrackSection } from './AiTrackSection'
import Badge from './Badge'
import { CardTitle } from './CardTitle'
import GiantArtwork from './GiantArtwork'
import styles from './GiantTrackTile.module.css'
import { GiantTrackTileProgressInfo } from './GiantTrackTileProgressInfo'
import InfoLabel from './InfoLabel'
import { PlayPauseButton } from './PlayPauseButton'
import { PremiumTrackSection } from './PremiumTrackSection'

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1095,
  second: 1190,
  third: 1286
}

// Toast timeouts in ms
const REPOST_TIMEOUT = 1000
const SAVED_TIMEOUT = 1000

const messages = {
  makePublic: 'MAKE PUBLIC',
  isPublishing: 'PUBLISHING',
  repostButtonText: 'repost',
  repostedButtonText: 'reposted',
  unplayed: 'Unplayed',
  timeLeft: 'left',
  played: 'Played',
  generatedWithAi: 'Generated With AI',
  actionGroupLabel: 'track actions'
}

export type GiantTrackTileProps = {
  aiAttributionUserId: Nullable<number>
  artistHandle: string
  badge: Nullable<string>
  coSign: Nullable<Remix>
  coverArtSizes: Nullable<CoverArtSizes>
  credits: string
  currentUserId: Nullable<ID>
  description: string
  doesUserHaveAccess: boolean
  duration: number
  fieldVisibility: FieldVisibility
  following: boolean
  genre: string
  isArtistPick: boolean
  isOwner: boolean
  isPremium: boolean
  isPublishing: boolean
  isRemix: boolean
  isReposted: boolean
  isSaved: boolean
  isUnlisted: boolean
  listenCount: number
  loading: boolean
  mood: string
  onClickFavorites: () => void
  onClickReposts: () => void
  onDownload: (trackId: ID, category?: string, parentTrackId?: ID) => void
  onExternalLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  onInternalLinkClick: (url: string) => void
  onMakePublic: (trackId: ID) => void
  onFollow: () => void
  onPlay: () => void
  onRepost: () => void
  onSave: () => void
  onShare: () => void
  onUnfollow: () => void
  playing: boolean
  premiumConditions: Nullable<PremiumConditions>
  released: string
  repostCount: number
  saveCount: number
  tags: string
  trackId: number
  trackTitle: string
  userId: number
}

export const GiantTrackTile = ({
  aiAttributionUserId,
  artistHandle,
  badge,
  coSign,
  coverArtSizes,
  credits,
  description,
  doesUserHaveAccess,
  duration,
  fieldVisibility,
  following,
  genre,
  isArtistPick,
  isOwner,
  isPremium,
  isRemix,
  isReposted,
  isPublishing,
  isSaved,
  isUnlisted,
  listenCount,
  loading,
  mood,
  onClickFavorites,
  onClickReposts,
  onDownload,
  onExternalLinkClick,
  onFollow,
  onInternalLinkClick,
  onMakePublic,
  onPlay,
  onSave,
  onShare,
  onRepost,
  onUnfollow,
  released,
  repostCount,
  saveCount,
  playing,
  premiumConditions,
  tags,
  trackId,
  trackTitle,
  userId
}: GiantTrackTileProps) => {
  const [artworkLoading, setArtworkLoading] = useState(true)
  const onArtworkLoad = useCallback(
    () => setArtworkLoading(false),
    [setArtworkLoading]
  )
  const isLongFormContent =
    genre === Genre.PODCASTS || genre === Genre.AUDIOBOOKS
  const isNewPodcastControlsEnabled = getFeatureEnabled(
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
  )
  const isUSDCPurchaseGated =
    isPremiumContentUSDCPurchaseGated(premiumConditions)
  // Preview button is shown for USDC-gated tracks if user does not have access
  // or is the owner
  const showPreview = isUSDCPurchaseGated && (isOwner || !doesUserHaveAccess)
  // Play button is conditionally hidden for USDC-gated tracks when the user does not have access
  const showPlay = isUSDCPurchaseGated ? doesUserHaveAccess : true

  // TODO: https://linear.app/audius/issue/PAY-1590/[webmobileweb]-add-support-for-playing-previews
  const onPreview = useCallback(() => {
    console.log('Preview Clicked')
  }, [])

  const renderCardTitle = (className: string) => {
    return (
      <CardTitle
        className={className}
        isUnlisted={isUnlisted}
        isRemix={isRemix}
        isPremium={isPremium}
        isPodcast={genre === Genre.PODCASTS}
        premiumConditions={premiumConditions}
      />
    )
  }

  const renderShareButton = () => {
    const shouldShow =
      (!isUnlisted && !isPublishing) || fieldVisibility.share || isOwner
    return (
      shouldShow && (
        <EntityActionButton
          type={ButtonType.COMMON}
          text='share'
          leftIcon={<IconShare />}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
          onClick={onShare}
        />
      )
    )
  }

  const renderMakePublicButton = () => {
    return (
      (isUnlisted || isPublishing) &&
      isOwner && (
        <EntityActionButton
          type={isPublishing ? ButtonType.DISABLED : ButtonType.COMMON}
          text={isPublishing ? messages.isPublishing : messages.makePublic}
          leftIcon={
            isPublishing ? (
              <LoadingSpinner className={styles.spinner} />
            ) : (
              <IconRocket />
            )
          }
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
          onClick={isPublishing ? undefined : () => onMakePublic(trackId)}
        />
      )
    )
  }

  const renderRepostButton = () => {
    return (
      !isUnlisted &&
      !isPublishing &&
      !isOwner && (
        <Toast
          placement={ComponentPlacement.BOTTOM}
          text={'Reposted!'}
          disabled={isReposted}
          delay={REPOST_TIMEOUT}
          fillParent={false}
        >
          <Tooltip
            disabled={isOwner || repostCount === 0}
            text={isReposted ? 'Unrepost' : 'Repost'}
          >
            <div>
              <EntityActionButton
                name='repost'
                type={
                  isOwner
                    ? ButtonType.DISABLED
                    : isReposted
                    ? ButtonType.SECONDARY
                    : ButtonType.COMMON
                }
                widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
                text={
                  isReposted
                    ? messages.repostedButtonText
                    : messages.repostButtonText
                }
                leftIcon={<IconRepost />}
                onClick={isOwner ? () => {} : onRepost}
              />
            </div>
          </Tooltip>
        </Toast>
      )
    )
  }

  const renderFavoriteButton = () => {
    return (
      !isUnlisted &&
      !isOwner && (
        <Toast
          placement={ComponentPlacement.BOTTOM}
          text={'Favorited!'}
          disabled={isSaved}
          delay={SAVED_TIMEOUT}
          fillParent={false}
        >
          <Tooltip
            disabled={isOwner || saveCount === 0}
            text={isSaved ? 'Unfavorite' : 'Favorite'}
          >
            <div>
              <EntityActionButton
                name='favorite'
                type={
                  isOwner
                    ? ButtonType.DISABLED
                    : isSaved
                    ? ButtonType.SECONDARY
                    : ButtonType.COMMON
                }
                text={isSaved ? 'FAVORITED' : 'FAVORITE'}
                widthToHideText={BUTTON_COLLAPSE_WIDTHS.third}
                leftIcon={<IconHeart />}
                onClick={isOwner ? undefined : onSave}
              />
            </div>
          </Tooltip>
        </Toast>
      )
    )
  }

  const renderMood = () => {
    const shouldShow = !isUnlisted || fieldVisibility.mood
    return (
      shouldShow &&
      mood && (
        <InfoLabel
          className={styles.infoLabelPlacement}
          labelName='mood'
          labelValue={mood in moodMap ? moodMap[mood] : mood}
        />
      )
    )
  }

  const renderGenre = () => {
    const shouldShow = !isUnlisted || fieldVisibility.genre

    return (
      shouldShow && (
        <InfoLabel
          className={styles.infoLabelPlacement}
          labelName='genre'
          labelValue={getCanonicalName(genre)}
        />
      )
    )
  }

  const renderListenCount = () => {
    const shouldShow =
      isOwner || (!isPremium && (isUnlisted || fieldVisibility.play_count))

    if (!shouldShow) {
      return null
    }
    return (
      <div className={styles.listens}>
        {!isOwner && listenCount === 0 ? (
          <span className={styles.firstListen}>
            Be the first to listen to this track!
          </span>
        ) : (
          <>
            <span className={styles.numberOfListens}>
              {listenCount.toLocaleString()}
            </span>
            <span className={styles.listenText}>
              {listenCount === 1 ? 'Play' : 'Plays'}
            </span>
          </>
        )}
      </div>
    )
  }

  const renderTags = () => {
    const shouldShow = !isUnlisted || fieldVisibility.tags
    return (
      shouldShow &&
      tags && (
        <div className={styles.tagSection}>
          {tags
            .split(',')
            .filter((t) => t)
            .map((tag) => (
              <SearchTag
                className={styles.tagFormatting}
                tag={tag}
                key={tag}
                source='track page'
              />
            ))}
        </div>
      )
    )
  }

  const renderReleased = () => {
    return (
      !isUnlisted &&
      released && (
        <InfoLabel
          className={styles.infoLabelPlacement}
          labelName='released'
          labelValue={formatDate(released)}
        />
      )
    )
  }

  const renderStatsRow = () => {
    const isLongFormContent =
      genre === Genre.PODCASTS || genre === Genre.AUDIOBOOKS
    const isNewPodcastControlsEnabled = getFeatureEnabled(
      FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
      FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
    )

    return (
      <>
        <RepostFavoritesStats
          isUnlisted={isUnlisted}
          repostCount={repostCount}
          saveCount={saveCount}
          onClickReposts={onClickReposts}
          onClickFavorites={onClickFavorites}
        />
        {isLongFormContent && isNewPodcastControlsEnabled
          ? renderListenCount()
          : null}
      </>
    )
  }

  const renderDownloadButtons = () => {
    return (
      <DownloadButtons
        className={styles.downloadButtonsContainer}
        trackId={trackId}
        isOwner={isOwner}
        following={following}
        doesUserHaveAccess={doesUserHaveAccess}
        onDownload={onDownload}
      />
    )
  }

  const isLoading = loading || artworkLoading
  // Omitting isOwner and doesUserHaveAccess so that we always show premium DogEars
  const dogEarType = isLoading
    ? undefined
    : getDogEarType({
        premiumConditions,
        isUnlisted
      })

  const overflowMenuExtraItems = []
  if (!isOwner) {
    overflowMenuExtraItems.push({
      text: following ? 'Unfollow Artist' : 'Follow Artist',
      onClick: () =>
        setTimeout(() => (following ? onUnfollow() : onFollow()), 0)
    })
  }

  const overflowMenu = {
    menu: {
      type: 'track',
      trackId,
      trackTitle,
      genre,
      handle: artistHandle,
      isFavorited: isSaved,
      mount: 'page',
      isOwner,
      includeFavorite: false,
      includeTrackPage: false,
      isArtistPick,
      includeEmbed: !(isUnlisted || isPremium),
      includeArtistPick: !isUnlisted,
      includeAddToPlaylist: !(isUnlisted || isPremium),
      extraMenuItems: overflowMenuExtraItems
    }
  }

  const fadeIn = {
    [styles.show]: !isLoading,
    [styles.hide]: isLoading
  }

  return (
    <Tile
      className={styles.giantTrackTile}
      dogEar={dogEarType}
      size='large'
      elevation='mid'
    >
      <div className={styles.topSection}>
        <GiantArtwork
          trackId={trackId}
          coverArtSizes={coverArtSizes}
          coSign={coSign}
          callback={onArtworkLoad}
        />
        <div className={styles.infoSection}>
          <div className={styles.infoSectionHeader}>
            {renderCardTitle(cn(fadeIn))}
            <div className={styles.title}>
              <h1 className={cn(fadeIn)}>{trackTitle}</h1>
              {isLoading && <Skeleton className={styles.skeleton} />}
            </div>
            <div className={styles.artistWrapper}>
              <div className={cn(fadeIn)}>
                <span>By </span>
                <UserLink
                  color='secondary'
                  variant='body'
                  size='large'
                  textAs='h2'
                  userId={userId}
                  badgeSize={18}
                  popover
                />
              </div>
              {isLoading && (
                <Skeleton className={styles.skeleton} width='60%' />
              )}
            </div>
          </div>

          <div className={cn(styles.playSection, fadeIn)}>
            {showPlay ? (
              <PlayPauseButton
                disabled={!doesUserHaveAccess}
                playing={playing}
                onPlay={onPlay}
                trackId={trackId}
              />
            ) : null}
            {showPreview ? (
              <PlayPauseButton
                playing={playing}
                onPlay={onPreview}
                trackId={trackId}
                isPreview
              />
            ) : null}
            {isLongFormContent && isNewPodcastControlsEnabled ? (
              <GiantTrackTileProgressInfo
                duration={duration}
                trackId={trackId}
              />
            ) : (
              renderListenCount()
            )}
          </div>

          <div className={cn(styles.statsSection, fadeIn)}>
            {renderStatsRow()}
          </div>

          <div
            className={cn(styles.actionButtons, fadeIn)}
            role='group'
            aria-label={messages.actionGroupLabel}
          >
            {renderShareButton()}
            {renderMakePublicButton()}
            {doesUserHaveAccess && renderRepostButton()}
            {doesUserHaveAccess && renderFavoriteButton()}
            <span>
              {/* prop types for overflow menu don't work correctly
              so we need to cast here */}
              <Menu {...(overflowMenu as any)}>
                {(ref, triggerPopup) => (
                  <div className={cn(styles.menuKebabContainer)} ref={ref}>
                    <Button
                      className={cn(styles.buttonFormatting, styles.moreButton)}
                      leftIcon={<IconKebabHorizontal />}
                      onClick={triggerPopup}
                      text={null}
                      textClassName={styles.buttonTextFormatting}
                      type={ButtonType.COMMON}
                    />
                  </div>
                )}
              </Menu>
            </span>
          </div>
        </div>
        <div className={styles.badges}>
          {aiAttributionUserId ? (
            <Badge
              icon={<IconRobot />}
              className={styles.badgeAi}
              textLabel={messages.generatedWithAi}
            />
          ) : null}
          {badge ? (
            <Badge className={styles.badgePlacement} textLabel={badge} />
          ) : null}
        </div>
      </div>

      {isPremium && premiumConditions ? (
        <PremiumTrackSection
          isLoading={isLoading}
          trackId={trackId}
          premiumConditions={premiumConditions}
          doesUserHaveAccess={doesUserHaveAccess}
          isOwner={isOwner}
          ownerId={userId}
        />
      ) : null}

      {aiAttributionUserId ? (
        <AiTrackSection attributedUserId={aiAttributionUserId} />
      ) : null}

      <div className={cn(styles.bottomSection, fadeIn)}>
        <div className={styles.infoLabelsSection}>
          <InfoLabel
            className={styles.infoLabelPlacement}
            labelName='duration'
            labelValue={`${formatSeconds(duration)}`}
          />
          {renderReleased()}
          {renderGenre()}
          {renderMood()}
          {credits ? (
            <InfoLabel
              className={styles.infoLabelPlacement}
              labelName='credit'
              labelValue={credits}
            />
          ) : null}
        </div>
        {description ? (
          <Linkify
            options={{
              attributes: {
                onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
                  const url = event.currentTarget.href

                  if (isAudiusUrl(url)) {
                    const path = getPathFromAudiusUrl(url)
                    event.nativeEvent.preventDefault()
                    onInternalLinkClick(path ?? '/')
                  } else {
                    onExternalLinkClick(event)
                  }
                }
              },
              target: (href, type, tokens) => {
                return isAudiusUrl(href) ? '' : '_blank'
              }
            }}
          >
            <h3 className={styles.description}>
              {squashNewLines(description)}
            </h3>
          </Linkify>
        ) : null}
        {renderTags()}
        {renderDownloadButtons()}
      </div>
    </Tile>
  )
}
