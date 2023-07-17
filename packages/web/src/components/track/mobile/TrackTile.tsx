import { useCallback, useState, useEffect, MouseEvent } from 'react'

import {
  ID,
  formatCount,
  PremiumConditions,
  Nullable,
  premiumContentSelectors,
  premiumContentActions,
  formatLineupTileDuration,
  Genre,
  getDogEarType,
  isPremiumContentUSDCPurchaseGated
} from '@audius/common'
import { IconCrown, IconHidden, IconTrending } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconStar } from 'assets/img/iconStar.svg'
import { ReactComponent as IconVolume } from 'assets/img/iconVolume.svg'
import { useModalState } from 'common/hooks/useModalState'
import FavoriteButton from 'components/alt-button/FavoriteButton'
import RepostButton from 'components/alt-button/RepostButton'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import { DogEar } from 'components/dog-ear'
import Skeleton from 'components/skeleton/Skeleton'
import { PremiumContentLabel } from 'components/track/PremiumContentLabel'
import { TrackTileProps } from 'components/track/types'
import typeStyles from 'components/typography/typography.module.css'
import UserBadges from 'components/user-badges/UserBadges'
import { profilePage } from 'utils/route'

import { LockedStatusBadge, LockedStatusBadgeProps } from '../LockedStatusBadge'
import { messages } from '../trackTileMessages'

import BottomButtons from './BottomButtons'
import styles from './TrackTile.module.css'
import TrackTileArt from './TrackTileArt'

const { setLockedContentId } = premiumContentActions
const { getPremiumTrackStatusMap } = premiumContentSelectors

type ExtraProps = {
  permalink: string
  goToTrackPage: (e: MouseEvent<HTMLElement>) => void
  goToArtistPage: (e: MouseEvent<HTMLElement>) => void
  toggleSave: (trackId: ID) => void
  toggleRepost: (trackId: ID) => void
  onShare: (trackId: ID) => void
  makeGoToRepostsPage: (trackId: ID) => (e: MouseEvent<HTMLElement>) => void
  makeGoToFavoritesPage: (trackId: ID) => (e: MouseEvent<HTMLElement>) => void
  isOwner: boolean
  darkMode: boolean
  isMatrix: boolean
  isPremium: boolean
  premiumConditions?: Nullable<PremiumConditions>
  doesUserHaveAccess: boolean
}

type CombinedProps = TrackTileProps & ExtraProps

const renderLockedOrPlaysContent = ({
  doesUserHaveAccess,
  fieldVisibility,
  isOwner,
  isPremium,
  listenCount,
  variant
}: Pick<
  CombinedProps,
  | 'doesUserHaveAccess'
  | 'fieldVisibility'
  | 'isOwner'
  | 'isPremium'
  | 'listenCount'
> &
  Pick<LockedStatusBadgeProps, 'variant'>) => {
  if (isPremium && !isOwner) {
    return <LockedStatusBadge locked={!doesUserHaveAccess} variant={variant} />
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

export const RankIcon = ({
  showCrown,
  index,
  className,
  isVisible = true
}: {
  showCrown: boolean
  index: number
  isVisible?: boolean
  className?: string
}) => {
  return isVisible ? (
    <div className={cn(typeStyles.bodyXsmall, styles.rankContainer, className)}>
      {showCrown ? <IconCrown /> : <IconTrending />}
      {index + 1}
    </div>
  ) : null
}

const TrackTile = (props: CombinedProps) => {
  const {
    id,
    uid,
    index,
    showSkeleton,
    hasLoaded,
    toggleSave,
    toggleRepost,
    onShare,
    onClickOverflow,
    togglePlay,
    coSign,
    darkMode,
    fieldVisibility,
    isActive,
    isMatrix,
    userId,
    isArtistPick,
    isOwner,
    isUnlisted,
    isLoading,
    isPremium,
    listenCount,
    premiumConditions,
    doesUserHaveAccess,
    isTrending,
    showRankIcon,
    permalink,
    artistHandle,
    duration,
    genre,
    isPlaying,
    isBuffering,
    variant,
    containerClassName
  } = props

  const hideShare: boolean = props.fieldVisibility
    ? props.fieldVisibility.share === false
    : false

  const dispatch = useDispatch()
  const [, setModalVisibility] = useModalState('LockedContent')
  const premiumTrackStatusMap = useSelector(getPremiumTrackStatusMap)
  const trackId = isPremium ? id : null
  const premiumTrackStatus = trackId
    ? premiumTrackStatusMap[trackId]
    : undefined
  const isPurchase = isPremiumContentUSDCPurchaseGated(premiumConditions)

  const DogEarIconType = isLoading
    ? undefined
    : getDogEarType({
        premiumConditions,
        isOwner,
        doesUserHaveAccess,
        isArtistPick,
        isUnlisted
      })

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
    [styles.show]: artworkLoaded && !showSkeleton,
    [styles.hide]: !artworkLoaded || showSkeleton
  }

  const handleClick = useCallback(() => {
    if (showSkeleton) return

    if (trackId && !doesUserHaveAccess) {
      dispatch(setLockedContentId({ id: trackId }))
      setModalVisibility(true)
      return
    }

    togglePlay(uid, id)
  }, [
    showSkeleton,
    togglePlay,
    uid,
    id,
    trackId,
    doesUserHaveAccess,
    dispatch,
    setModalVisibility
  ])

  const isReadonly = variant === 'readonly'

  return (
    <div
      className={cn(
        styles.container,
        { [styles.readonly]: isReadonly },
        containerClassName
      )}
    >
      {DogEarIconType ? <DogEar type={DogEarIconType} /> : null}
      <div className={styles.mainContent} onClick={handleClick}>
        <div
          className={cn(
            typeStyles.bodyXSmall,
            styles.topRight,
            styles.statText
          )}
        >
          {isArtistPick ? (
            <div className={styles.topRightIcon}>
              <IconStar />
              {messages.artistPick}
            </div>
          ) : null}
          {props.isUnlisted ? (
            <div className={styles.topRightIcon}>
              <IconHidden />
              {messages.hiddenTrack}
            </div>
          ) : null}
          <div className={cn(styles.duration, fadeIn)}>
            {duration
              ? formatLineupTileDuration(
                  duration,
                  genre === Genre.PODCASTS || genre === Genre.AUDIOBOOKS
                )
              : null}
          </div>
        </div>
        <div className={styles.metadata}>
          <TrackTileArt
            id={props.id}
            isTrack
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            callback={() => setArtworkLoaded(true)}
            showSkeleton={showSkeleton}
            coverArtSizes={props.coverArtSizes}
            coSign={coSign}
            className={styles.albumArtContainer}
            label={`${props.title} by ${props.artistName}`}
            artworkIconClassName={styles.artworkIcon}
          />
          <div
            className={cn(styles.titles, {
              [styles.titlesActive]: isActive,
              [styles.titlesSkeleton]: props.showSkeleton
            })}
          >
            <a
              className={cn(typeStyles.titleMedium, styles.title)}
              href={permalink}
              onClick={props.goToTrackPage}
            >
              <div className={cn(fadeIn)}>{props.title}</div>
              {isPlaying ? <IconVolume /> : null}
              {(!artworkLoaded || showSkeleton) && (
                <Skeleton
                  className={styles.skeleton}
                  width='80%'
                  height='80%'
                />
              )}
            </a>
            <a
              className={styles.artist}
              href={profilePage(artistHandle)}
              onClick={props.goToArtistPage}
            >
              <div className={cn(fadeIn, styles.userName)}>
                <ArtistPopover handle={artistHandle}>
                  <span onClick={props.goToArtistPage}>{props.artistName}</span>
                </ArtistPopover>
              </div>
              <UserBadges
                userId={userId}
                badgeSize={12}
                className={styles.iconVerified}
              />
              {(!artworkLoaded || showSkeleton) && (
                <Skeleton
                  className={styles.skeleton}
                  width='60%'
                  height='80%'
                />
              )}
            </a>
          </div>
          {coSign && (
            <div
              className={cn(
                typeStyles.labelSmall,
                typeStyles.labelStrong,
                styles.coSignLabel
              )}
            >
              {messages.coSign}
            </div>
          )}
        </div>
        {coSign ? (
          <div className={cn(typeStyles.bodyXSmall, styles.coSignText)}>
            <div className={styles.name}>
              {coSign.user.name}
              <UserBadges userId={coSign.user.user_id} badgeSize={8} />
            </div>
            {formatCoSign({
              hasReposted: coSign.has_remix_author_reposted,
              hasFavorited: coSign.has_remix_author_saved
            })}
          </div>
        ) : null}
        <div className={cn(typeStyles.bodyXSmall, styles.statsRow)}>
          <div className={styles.stats}>
            <RankIcon
              showCrown={showRankIcon}
              index={index}
              isVisible={isTrending && artworkLoaded && !showSkeleton}
              className={styles.rankIconContainer}
            />
            {!isLoading && isPremium ? (
              <PremiumContentLabel
                premiumConditions={premiumConditions}
                doesUserHaveAccess={!!doesUserHaveAccess}
                isOwner={isOwner}
              />
            ) : null}
            {!(props.repostCount || props.saveCount) ? null : (
              <>
                <div
                  className={cn(styles.statItem, fadeIn, {
                    [styles.disabledStatItem]: !props.repostCount,
                    [styles.isHidden]: props.isUnlisted
                  })}
                  onClick={
                    props.repostCount && !isReadonly
                      ? props.makeGoToRepostsPage(id)
                      : undefined
                  }
                >
                  <RepostButton
                    iconMode
                    isMatrixMode={isMatrix}
                    isDarkMode={darkMode}
                    className={styles.repostButton}
                    wrapperClassName={styles.repostButtonWrapper}
                  />
                  {formatCount(props.repostCount)}
                </div>
                <div
                  className={cn(styles.statItem, fadeIn, {
                    [styles.disabledStatItem]: !props.saveCount,
                    [styles.isHidden]: props.isUnlisted
                  })}
                  onClick={
                    props.saveCount && !isReadonly
                      ? props.makeGoToFavoritesPage(id)
                      : undefined
                  }
                >
                  <FavoriteButton
                    iconMode
                    isDarkMode={darkMode}
                    isMatrixMode={isMatrix}
                    className={styles.favoriteButton}
                    wrapperClassName={styles.favoriteButtonWrapper}
                  />
                  {formatCount(props.saveCount)}
                </div>
              </>
            )}
          </div>
          <div
            className={cn(typeStyles.bodyXSmall, styles.bottomRight, fadeIn)}
          >
            {!isLoading
              ? renderLockedOrPlaysContent({
                  doesUserHaveAccess,
                  fieldVisibility,
                  isOwner,
                  isPremium,
                  listenCount,
                  variant: isPurchase ? 'premium' : 'gated'
                })
              : null}
          </div>
        </div>
        {!isReadonly ? (
          <BottomButtons
            hasSaved={props.hasCurrentUserSaved}
            hasReposted={props.hasCurrentUserReposted}
            toggleRepost={onToggleRepost}
            toggleSave={onToggleSave}
            onShare={onClickShare}
            onClickOverflow={onClickOverflowMenu}
            isOwner={isOwner}
            isLoading={isLoading}
            isUnlisted={isUnlisted}
            doesUserHaveAccess={doesUserHaveAccess}
            premiumConditions={premiumConditions}
            premiumTrackStatus={premiumTrackStatus}
            isShareHidden={hideShare}
            isDarkMode={darkMode}
            isMatrixMode={isMatrix}
            isTrack
          />
        ) : null}
      </div>
    </div>
  )
}

export default TrackTile
