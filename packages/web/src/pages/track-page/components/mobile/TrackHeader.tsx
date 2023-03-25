import { useCallback } from 'react'

import {
  CID,
  ID,
  Name,
  SquareSizes,
  CoverArtSizes,
  FieldVisibility,
  Remix,
  squashNewLines,
  getCanonicalName,
  formatSeconds,
  formatDate,
  OverflowAction,
  imageBlank as placeholderArt,
  FeatureFlags,
  PremiumConditions,
  Nullable
} from '@audius/common'
import {
  Button,
  ButtonType,
  IconCollectible,
  IconPause,
  IconPlay,
  IconSpecialAccess
} from '@audius/stems'
import cn from 'classnames'
import Linkify from 'linkify-react'

import { make, useRecord } from 'common/store/analytics/actions'
import CoSign from 'components/co-sign/CoSign'
import HoverInfo from 'components/co-sign/HoverInfo'
import { Size } from 'components/co-sign/types'
import DownloadButtons from 'components/download-buttons/DownloadButtons'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { PremiumTrackSection } from 'components/track/PremiumTrackSection'
import TrackBannerIcon, {
  TrackBannerIconType
} from 'components/track/TrackBannerIcon'
import UserBadges from 'components/user-badges/UserBadges'
import { useFlag } from 'hooks/useRemoteConfig'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'
import { moodMap } from 'utils/moods'
import { isDarkMode, isMatrix } from 'utils/theme/theme'

import HiddenTrackHeader from '../HiddenTrackHeader'

import ActionButtonRow from './ActionButtonRow'
import StatsButtonRow from './StatsButtonRow'
import styles from './TrackHeader.module.css'

const messages = {
  track: 'TRACK',
  remix: 'REMIX',
  play: 'PLAY',
  pause: 'PAUSE',
  collectibleGated: 'COLLECTIBLE GATED',
  specialAccess: 'SPECIAL ACCESS'
}

const PlayButton = (props: { playing: boolean; onPlay: () => void }) => {
  return props.playing ? (
    <Button
      className={cn(styles.playAllButton, styles.buttonFormatting)}
      textClassName={styles.playAllButtonText}
      type={ButtonType.PRIMARY_ALT}
      text={messages.pause}
      leftIcon={<IconPause />}
      onClick={props.onPlay}
    />
  ) : (
    <Button
      className={cn(styles.playAllButton, styles.buttonFormatting)}
      textClassName={styles.playAllButtonText}
      type={ButtonType.PRIMARY_ALT}
      text={messages.play}
      leftIcon={<IconPlay />}
      onClick={props.onPlay}
    />
  )
}

type TrackHeaderProps = {
  isLoading: boolean
  isPlaying: boolean
  isOwner: boolean
  isSaved: boolean
  isReposted: boolean
  isFollowing: boolean
  title: string
  trackId: ID
  userId: ID
  coverArtSizes: CoverArtSizes | null
  artistName: string
  artistVerified: boolean
  description: string
  released: string
  genre: string
  mood: string
  credits: string
  tags: string
  listenCount: number
  duration: number
  saveCount: number
  repostCount: number
  isUnlisted: boolean
  isPremium: boolean
  premiumConditions: Nullable<PremiumConditions>
  doesUserHaveAccess: boolean
  isRemix: boolean
  fieldVisibility: FieldVisibility
  coSign: Remix | null
  onClickTag: (tag: string) => void
  onClickArtistName: () => void
  onClickMobileOverflow: (
    trackId: ID,
    overflowActions: OverflowAction[]
  ) => void
  onPlay: () => void
  onShare: () => void
  onSave: () => void
  onRepost: () => void
  onDownload: (
    trackId: ID,
    cid: CID,
    category?: string,
    parentTrackId?: ID
  ) => void
  goToFavoritesPage: (trackId: ID) => void
  goToRepostsPage: (trackId: ID) => void
}

const TrackHeader = ({
  title,
  trackId,
  userId,
  coverArtSizes,
  artistName,
  artistVerified,
  description,
  isOwner,
  isFollowing,
  released,
  duration,
  isLoading,
  isPlaying,
  isSaved,
  isReposted,
  isUnlisted,
  isPremium,
  premiumConditions,
  doesUserHaveAccess,
  isRemix,
  fieldVisibility,
  coSign,
  saveCount,
  repostCount,
  listenCount,
  mood,
  credits,
  genre,
  tags,
  onClickArtistName,
  onClickTag,
  onPlay,
  onShare,
  onSave,
  onRepost,
  onDownload,
  onClickMobileOverflow,
  goToFavoritesPage,
  goToRepostsPage
}: TrackHeaderProps) => {
  const { isEnabled: isGatedContentEnabled } = useFlag(
    FeatureFlags.GATED_CONTENT_ENABLED
  )
  const showSocials =
    !isUnlisted && (!isGatedContentEnabled || doesUserHaveAccess)

  const image = useTrackCoverArt(
    trackId,
    coverArtSizes,
    SquareSizes.SIZE_480_BY_480
  )
  const onSaveHeroTrack = () => {
    if (!isOwner) onSave()
  }
  const filteredTags = (tags || '').split(',').filter(Boolean)

  const trackLabels: { isHidden?: boolean; label: string; value: any }[] = [
    {
      label: 'Duration',
      value: formatSeconds(duration)
    },
    {
      label: 'Genre',
      isHidden: isUnlisted && !fieldVisibility?.genre,
      value: getCanonicalName(genre)
    },
    { value: formatDate(released), label: 'Released', isHidden: isUnlisted },
    {
      isHidden: isUnlisted && !fieldVisibility?.mood,
      label: 'Mood',
      // @ts-ignore
      value: mood && mood in moodMap ? moodMap[mood] : mood
    },
    { label: 'Credit', value: credits }
  ].filter(({ isHidden, value }) => !isHidden && !!value)

  const record = useRecord()
  const onExternalLinkClick = useCallback(
    (event: { target: { href: string } }) => {
      record(
        make(Name.LINK_CLICKING, {
          url: event.target.href,
          source: 'track page' as const
        })
      )
    },
    [record]
  )

  const onClickOverflow = () => {
    const overflowActions = [
      isOwner || !showSocials
        ? null
        : isReposted
        ? OverflowAction.UNREPOST
        : OverflowAction.REPOST,
      isOwner || !showSocials
        ? null
        : isSaved
        ? OverflowAction.UNFAVORITE
        : OverflowAction.FAVORITE,
      !isGatedContentEnabled || !isPremium
        ? OverflowAction.ADD_TO_PLAYLIST
        : null,
      isFollowing
        ? OverflowAction.UNFOLLOW_ARTIST
        : OverflowAction.FOLLOW_ARTIST,
      OverflowAction.VIEW_ARTIST_PAGE
    ].filter(Boolean) as OverflowAction[]

    onClickMobileOverflow(trackId, overflowActions)
  }

  const renderTags = () => {
    if (isUnlisted && !fieldVisibility.tags) return null
    return (
      <>
        {filteredTags.length > 0 ? (
          <div className={styles.tags}>
            {filteredTags.map((tag) => (
              <h2
                key={tag}
                onClick={() => onClickTag(tag)}
                className={styles.tag}
              >
                {tag}
              </h2>
            ))}
          </div>
        ) : null}
      </>
    )
  }

  const renderDownloadButtons = () => {
    return (
      <DownloadButtons
        className={styles.downloadButtonsContainer}
        trackId={trackId}
        isOwner={isOwner}
        following={isFollowing}
        doesUserHaveAccess={doesUserHaveAccess}
        onDownload={onDownload}
      />
    )
  }

  const renderTrackLabels = () => {
    return trackLabels.map((infoFact) => {
      return (
        <div key={infoFact.label} className={styles.infoFact}>
          <div className={styles.infoLabel}>{infoFact.label}</div>
          <div className={styles.infoValue}>{infoFact.value}</div>
        </div>
      )
    })
  }

  const onClickFavorites = useCallback(() => {
    goToFavoritesPage(trackId)
  }, [goToFavoritesPage, trackId])

  const onClickReposts = useCallback(() => {
    goToRepostsPage(trackId)
  }, [goToRepostsPage, trackId])

  const imageElement = coSign ? (
    <CoSign
      size={Size.LARGE}
      hasFavorited={coSign.has_remix_author_saved}
      hasReposted={coSign.has_remix_author_reposted}
      coSignName={coSign.user.name}
      className={styles.coverArt}
      userId={coSign.user.user_id}
    >
      <DynamicImage image={image} wrapperClassName={styles.imageWrapper} />
    </CoSign>
  ) : (
    <DynamicImage
      image={image}
      wrapperClassName={cn(styles.coverArt, styles.imageWrapper)}
    />
  )

  const renderCornerTag = () => {
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
    if (showPremiumCornerTag && cornerTagIconType) {
      return (
        <TrackBannerIcon
          type={cornerTagIconType}
          isMatrixMode={isMatrix()}
          className={styles.cornerTag}
        />
      )
    }
    return null
  }

  const renderHeaderText = () => {
    if (isGatedContentEnabled && isPremium) {
      return (
        <div className={cn(styles.typeLabel, styles.premiumContentLabel)}>
          {premiumConditions?.nft_collection ? (
            <IconCollectible />
          ) : (
            <IconSpecialAccess />
          )}
          {premiumConditions?.nft_collection ? (
            <span>{messages.collectibleGated}</span>
          ) : (
            <span>{messages.specialAccess}</span>
          )}
        </div>
      )
    }

    return (
      <div className={styles.typeLabel}>
        {isRemix ? messages.remix : messages.track}
      </div>
    )
  }

  return (
    <div className={styles.trackHeader}>
      {renderCornerTag()}
      {isUnlisted ? (
        <div className={styles.hiddenTrackHeaderWrapper}>
          <HiddenTrackHeader />
        </div>
      ) : (
        renderHeaderText()
      )}
      {imageElement}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.artist} onClick={onClickArtistName}>
        <h2>{artistName}</h2>
        <UserBadges
          className={styles.verified}
          badgeSize={16}
          userId={userId}
        />
      </div>
      <div className={styles.buttonSection}>
        {isGatedContentEnabled &&
        !doesUserHaveAccess &&
        premiumConditions &&
        trackId ? (
          <PremiumTrackSection
            isLoading={false}
            trackId={trackId}
            premiumConditions={premiumConditions}
            doesUserHaveAccess={doesUserHaveAccess}
            isOwner={false}
            wrapperClassName={styles.premiumTrackSectionWrapper}
            className={styles.premiumTrackSection}
            buttonClassName={styles.premiumTrackSectionButton}
          />
        ) : null}
        {!isGatedContentEnabled || doesUserHaveAccess ? (
          <PlayButton playing={isPlaying} onPlay={onPlay} />
        ) : null}
        <ActionButtonRow
          showRepost={showSocials}
          showFavorite={showSocials}
          showShare={!isUnlisted || fieldVisibility.share}
          showOverflow
          shareToastDisabled
          isOwner={isOwner}
          isReposted={isReposted}
          isSaved={isSaved}
          onClickOverflow={onClickOverflow}
          onRepost={onRepost}
          onFavorite={onSaveHeroTrack}
          onShare={onShare}
          darkMode={isDarkMode()}
        />
      </div>
      {isGatedContentEnabled &&
        doesUserHaveAccess &&
        premiumConditions &&
        trackId && (
          <PremiumTrackSection
            isLoading={false}
            trackId={trackId}
            premiumConditions={premiumConditions}
            doesUserHaveAccess={doesUserHaveAccess}
            isOwner={isOwner}
            wrapperClassName={cn(
              styles.premiumTrackSectionWrapper,
              styles.unlockedSection
            )}
            className={styles.premiumTrackSection}
            buttonClassName={styles.premiumTrackSectionButton}
          />
        )}
      {coSign && (
        <div className={styles.coSignInfo}>
          <HoverInfo
            coSignName={coSign.user.name}
            hasFavorited={coSign.has_remix_author_saved}
            hasReposted={coSign.has_remix_author_reposted}
            userId={coSign.user.user_id}
          />
        </div>
      )}
      <StatsButtonRow
        showListenCount={!isUnlisted || fieldVisibility.play_count}
        showFavoriteCount={!isUnlisted}
        showRepostCount={!isUnlisted}
        listenCount={listenCount}
        favoriteCount={saveCount}
        repostCount={repostCount}
        onClickFavorites={onClickFavorites}
        onClickReposts={onClickReposts}
      />
      {description ? (
        <Linkify options={{ attributes: { onClick: onExternalLinkClick } }}>
          <h3 className={styles.description}>{squashNewLines(description)}</h3>
        </Linkify>
      ) : null}
      <div
        className={cn(styles.infoSection, {
          [styles.noStats]: isUnlisted && !fieldVisibility.play_count
        })}
      >
        {renderTrackLabels()}
      </div>
      {renderDownloadButtons()}
      {renderTags()}
    </div>
  )
}

TrackHeader.defaultProps = {
  loading: false,
  playing: false,
  active: true,
  coverArtUrl: placeholderArt,
  artistVerified: false,
  description: '',

  isOwner: false,
  isAlbum: false,
  hasTracks: false,
  isPublished: false,
  isSaved: false,

  saveCount: 0,
  tags: [],
  onPlay: () => {}
}

export default TrackHeader
