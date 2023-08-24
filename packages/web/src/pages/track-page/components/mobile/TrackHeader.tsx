import { useCallback } from 'react'

import {
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
  PremiumConditions,
  Nullable,
  getDogEarType,
  isPremiumContentCollectibleGated,
  isPremiumContentUSDCPurchaseGated
} from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconCart,
  IconCollectible,
  IconPause,
  IconPlay,
  IconSpecialAccess
} from '@audius/stems'
import cn from 'classnames'
import Linkify from 'linkify-react'

import { ReactComponent as IconRobot } from 'assets/img/robot.svg'
import { make, useRecord } from 'common/store/analytics/actions'
import CoSign from 'components/co-sign/CoSign'
import HoverInfo from 'components/co-sign/HoverInfo'
import { Size } from 'components/co-sign/types'
import { DogEar } from 'components/dog-ear'
import DownloadButtons from 'components/download-buttons/DownloadButtons'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { Link } from 'components/link'
import { SearchTag } from 'components/search/SearchTag'
import { AiTrackSection } from 'components/track/AiTrackSection'
import Badge from 'components/track/Badge'
import { PremiumTrackSection } from 'components/track/PremiumTrackSection'
import { Text } from 'components/typography'
import typeStyles from 'components/typography/typography.module.css'
import UserBadges from 'components/user-badges/UserBadges'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'
import { moodMap } from 'utils/Moods'
import { profilePage } from 'utils/route'
import { isDarkMode } from 'utils/theme/theme'

import HiddenTrackHeader from '../HiddenTrackHeader'

import ActionButtonRow from './ActionButtonRow'
import StatsButtonRow from './StatsButtonRow'
import styles from './TrackHeader.module.css'

const messages = {
  track: 'TRACK',
  remix: 'REMIX',
  play: 'PLAY',
  preview: 'PREVIEW',
  pause: 'PAUSE',
  collectibleGated: 'COLLECTIBLE GATED',
  premiumTrack: 'PREMIUM TRACK',
  specialAccess: 'SPECIAL ACCESS',
  generatedWithAi: 'Generated With AI'
}

type PlayButtonProps = {
  disabled?: boolean
  playing: boolean
  onPlay: () => void
}

const PlayButton = ({ disabled, playing, onPlay }: PlayButtonProps) => {
  return (
    <Button
      disabled={disabled}
      type={ButtonType.PRIMARY_ALT}
      text={playing ? messages.pause : messages.play}
      leftIcon={playing ? <IconPause /> : <IconPlay />}
      onClick={onPlay}
      size={ButtonSize.LARGE}
      fullWidth
    />
  )
}

const PreviewButton = ({ playing, onPlay }: PlayButtonProps) => {
  return (
    <Button
      type={ButtonType.SECONDARY}
      text={playing ? messages.pause : messages.preview}
      leftIcon={playing ? <IconPause /> : <IconPlay />}
      onClick={onPlay}
      fullWidth
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
  artistHandle: string
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
  aiAttributedUserId: Nullable<ID>
  onClickMobileOverflow: (
    trackId: ID,
    overflowActions: OverflowAction[]
  ) => void
  onPlay: () => void
  onShare: () => void
  onSave: () => void
  onRepost: () => void
  onDownload: (trackId: ID, category?: string, parentTrackId?: ID) => void
  goToFavoritesPage: (trackId: ID) => void
  goToRepostsPage: (trackId: ID) => void
}

const TrackHeader = ({
  title,
  trackId,
  userId,
  coverArtSizes,
  artistName,
  artistHandle,
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
  aiAttributedUserId,
  onPlay,
  onShare,
  onSave,
  onRepost,
  onDownload,
  onClickMobileOverflow,
  goToFavoritesPage,
  goToRepostsPage
}: TrackHeaderProps) => {
  const showSocials = !isUnlisted && doesUserHaveAccess
  const isUSDCPurchaseGated =
    isPremiumContentUSDCPurchaseGated(premiumConditions)
  // Preview button is shown for USDC-gated tracks if user does not have access
  // or is the owner
  const showPreview = isUSDCPurchaseGated && (isOwner || !doesUserHaveAccess)
  // Play button is conditionally hidden for USDC-gated tracks when the user does not have access
  const showPlay = isUSDCPurchaseGated ? doesUserHaveAccess : true
  const showListenCount =
    isOwner || (!isPremium && (isUnlisted || fieldVisibility.play_count))

  // TODO: https://linear.app/audius/issue/PAY-1590/[webmobileweb]-add-support-for-playing-previews
  const onPreview = useCallback(() => console.info('Preview Clicked'), [])

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
      !isPremium ? OverflowAction.ADD_TO_PLAYLIST : null,
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
          <div className={cn(styles.tags, styles.withSectionDivider)}>
            {filteredTags.map((tag) => (
              <SearchTag
                key={tag}
                tag={tag}
                className={styles.tag}
                source='track page'
              />
            ))}
          </div>
        ) : null}
      </>
    )
  }

  const renderDownloadButtons = () => {
    return (
      <DownloadButtons
        className={cn(
          styles.downloadButtonsContainer,
          styles.withSectionDivider
        )}
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

  const renderDogEar = () => {
    // Omitting isOwner and doesUserHaveAccess to ensure we always show premium DogEars
    const DogEarType = getDogEarType({
      isUnlisted,
      premiumConditions
    })
    if (!isLoading && DogEarType) {
      return (
        <div className={styles.borderOffset}>
          <DogEar type={DogEarType} className={styles.DogEar} />
        </div>
      )
    }
    return null
  }

  const renderHeaderText = () => {
    if (isPremium) {
      let IconComponent = IconSpecialAccess
      let titleMessage = messages.specialAccess
      if (isPremiumContentCollectibleGated(premiumConditions)) {
        IconComponent = IconCollectible
        titleMessage = messages.collectibleGated
      } else if (isPremiumContentUSDCPurchaseGated(premiumConditions)) {
        IconComponent = IconCart
        titleMessage = messages.premiumTrack
      }
      return (
        <div className={cn(styles.typeLabel, styles.premiumContentLabel)}>
          <IconComponent />
          <span>{titleMessage}</span>
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
      {renderDogEar()}
      {isUnlisted ? (
        <div className={styles.hiddenTrackHeaderWrapper}>
          <HiddenTrackHeader />
        </div>
      ) : (
        renderHeaderText()
      )}
      {aiAttributedUserId ? (
        <Badge
          icon={<IconRobot />}
          className={styles.badgeAi}
          textLabel={messages.generatedWithAi}
        />
      ) : null}
      {imageElement}
      <div className={styles.titleArtistSection}>
        <h1 className={styles.title}>{title}</h1>
        <Link
          to={profilePage(artistHandle)}
          color='secondary'
          variant='body'
          size='large'
        >
          <Text as='h2' variant='inherit'>
            {artistName}
          </Text>
          <UserBadges
            className={styles.verified}
            badgeSize={16}
            userId={userId}
          />
        </Link>
      </div>
      {showPlay ? (
        <PlayButton
          disabled={!doesUserHaveAccess}
          playing={isPlaying}
          onPlay={onPlay}
        />
      ) : null}
      {premiumConditions && trackId ? (
        <PremiumTrackSection
          isLoading={isLoading}
          trackId={trackId}
          premiumConditions={premiumConditions}
          doesUserHaveAccess={doesUserHaveAccess}
          isOwner={isOwner}
          wrapperClassName={styles.premiumTrackSectionWrapper}
          className={styles.premiumTrackSection}
          buttonClassName={styles.premiumTrackSectionButton}
          ownerId={userId}
        />
      ) : null}
      {showPreview ? (
        <PreviewButton playing={isPlaying} onPlay={onPreview} />
      ) : null}
      <ActionButtonRow
        showRepost={showSocials}
        showFavorite={showSocials}
        showShare={!isUnlisted || fieldVisibility.share || isOwner}
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
      {coSign ? (
        <div className={cn(styles.coSignInfo, styles.withSectionDivider)}>
          <HoverInfo
            coSignName={coSign.user.name}
            hasFavorited={coSign.has_remix_author_saved}
            hasReposted={coSign.has_remix_author_reposted}
            userId={coSign.user.user_id}
          />
        </div>
      ) : null}
      <StatsButtonRow
        className={styles.withSectionDivider}
        showListenCount={showListenCount}
        showFavoriteCount={!isUnlisted}
        showRepostCount={!isUnlisted}
        listenCount={listenCount}
        favoriteCount={saveCount}
        repostCount={repostCount}
        onClickFavorites={onClickFavorites}
        onClickReposts={onClickReposts}
      />
      {aiAttributedUserId ? (
        <AiTrackSection
          attributedUserId={aiAttributedUserId}
          className={cn(styles.aiSection, styles.withSectionDivider)}
          descriptionClassName={styles.aiSectionDescription}
        />
      ) : null}
      {description ? (
        <Linkify options={{ attributes: { onClick: onExternalLinkClick } }}>
          <h3
            className={cn(
              typeStyles.body,
              typeStyles.bodyMedium,
              styles.description,
              styles.withSectionDivider
            )}
          >
            {squashNewLines(description)}
          </h3>
        </Linkify>
      ) : null}
      <div className={cn(styles.infoSection, styles.withSectionDivider)}>
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
