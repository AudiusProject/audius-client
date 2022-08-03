import { MouseEvent, useState, useEffect, useCallback, ReactNode } from 'react'

import {
  ID,
  ProfilePictureSizes,
  SquareSizes,
  CoverArtSizes
} from '@audius/common'
import cn from 'classnames'

import { ReactComponent as IconKebabHorizontal } from 'assets/img/iconKebabHorizontal.svg'
import placeholderArt from 'assets/img/imageBlank2x.png'
import { pluralize } from 'common/utils/formatUtil'
import ActionsTab from 'components/actions-tab/ActionsTab'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import Menu, { MenuOptionType } from 'components/menu/Menu'
import RepostFavoritesStats, {
  Size
} from 'components/repost-favorites-stats/RepostFavoritesStats'
import UserBadges from 'components/user-badges/UserBadges'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './Card.module.css'

const cardSizeStyles = {
  small: {
    cardContainer: styles.smallContainer,
    coverArt: styles.smallCoverArt,
    textContainer: cn(styles.textContainer, styles.smallTextContainer),
    actionsContainer: styles.smallActionsContainer
  },
  medium: {
    cardContainer: styles.mediumContainer,
    coverArt: styles.mediumCoverArt,
    textContainer: cn(styles.textContainer, styles.mediumTextContainer),
    actionsContainer: styles.mediumActionsTabContainer
  },
  large: {
    cardContainer: styles.largeContainer,
    coverArt: styles.largeCoverArt,
    textContainer: cn(styles.textContainer, styles.largeTextContainer),
    actionsContainer: styles.largeActionsTabContainer
  }
}

type CardProps = {
  className?: string
  id: ID
  userId: ID
  imageSize: ProfilePictureSizes | CoverArtSizes | null
  primaryText: ReactNode
  secondaryText: ReactNode
  cardCoverImageSizes?: CoverArtSizes
  playlistName?: string
  isUser: boolean
  isPlaylist: boolean // playlist or album
  isPublic?: boolean // only for playlist or album
  handle: string
  playlistId?: number
  isReposted?: boolean
  isSaved?: boolean
  index?: number
  isLoading?: boolean
  setDidLoad?: (index: number) => void
  size: 'small' | 'medium' | 'large'
  menu?: MenuOptionType
  // For wrapping draggable
  link?: string
  // Socials
  reposts?: number
  favorites?: number
  onClickReposts?: () => void
  onClickFavorites?: () => void
  trackCount?: number
  onClick: () => void
}

const UserImage = (props: {
  id: ID
  imageSize: ProfilePictureSizes
  isLoading?: boolean
  callback?: () => void
}) => {
  const image = useUserProfilePicture(
    props.id,
    props.imageSize,
    SquareSizes.SIZE_480_BY_480
  )
  if (image && props.callback) props.callback()

  return (
    <DynamicImage
      className={cn(styles.coverArt, styles.userImage)}
      image={props.isLoading ? '' : image}
    />
  )
}

const CollectionImage = (props: {
  id: ID
  imageSize: CoverArtSizes
  isLoading?: boolean
  callback?: () => void
}) => {
  const image = useCollectionCoverArt(
    props.id,
    props.imageSize,
    SquareSizes.SIZE_480_BY_480,
    placeholderArt
  )

  if (image && props.callback) props.callback()

  return (
    <DynamicImage
      className={styles.coverArt}
      image={props.isLoading ? '' : image}
    />
  )
}

const Card = ({
  className,
  isUser,
  isLoading,
  index,
  setDidLoad,
  id,
  userId,
  imageSize = null,
  isPlaylist,
  handle,
  isReposted,
  isSaved,
  playlistId,
  isPublic,
  playlistName,
  primaryText,
  secondaryText,
  size,
  menu,
  reposts,
  favorites,
  trackCount,
  onClickReposts,
  onClickFavorites,
  onClick
}: CardProps) => {
  // The card is considered `setDidLoad` (and calls it) if the artwork has loaded and its
  // parent is no longer telling it that it is loading. This allows ordered loading.
  const [artworkLoaded, setArtworkLoaded] = useState(false)
  useEffect(() => {
    if (artworkLoaded && setDidLoad) {
      setDidLoad(index!)
    }
  }, [artworkLoaded, setDidLoad, index, isLoading])

  const artworkCallback = useCallback(() => {
    setArtworkLoaded(true)
  }, [setArtworkLoaded])

  const onBottomActionsClick = (e: MouseEvent) => {
    e.stopPropagation()
  }
  const sizeStyles = cardSizeStyles[size]

  let bottomActions = null
  if (menu && (size === 'large' || size === 'medium')) {
    bottomActions = (
      <div
        className={sizeStyles.actionsContainer}
        onClick={onBottomActionsClick}
      >
        <ActionsTab
          handle={handle}
          standalone
          direction='horizontal'
          variant={isPlaylist ? 'playlist' : 'album'}
          playlistId={playlistId}
          playlistName={playlistName}
          containerStyles={styles.actionContainer}
          currentUserReposted={isReposted}
          currentUserSaved={isSaved}
          isPublic={isPublic}
          includeEdit
        />
      </div>
    )
  } else if (menu && size === 'small') {
    bottomActions = (
      <div
        className={sizeStyles.actionsContainer}
        onClick={onBottomActionsClick}
      >
        <Menu menu={menu}>
          {(ref, triggerPopup) => (
            <div className={styles.iconContainer} onClick={triggerPopup}>
              <IconKebabHorizontal
                className={styles.iconKebabHorizontal}
                ref={ref}
              />
            </div>
          )}
        </Menu>
      </div>
    )
  }

  const showRepostFavoriteStats =
    !isUser && reposts && favorites && onClickReposts && onClickFavorites
  return (
    <div
      className={cn(className, styles.cardContainer, sizeStyles.cardContainer)}
      onClick={onClick}
    >
      <div
        className={cn(styles.coverArt, sizeStyles.coverArt, {
          [styles.userCardImage]: isUser
        })}
      >
        {isUser ? (
          <UserImage
            isLoading={isLoading}
            callback={artworkCallback}
            id={id}
            imageSize={imageSize as ProfilePictureSizes}
          />
        ) : (
          <CollectionImage
            isLoading={isLoading}
            callback={() => setArtworkLoaded(true)}
            id={id}
            imageSize={imageSize as CoverArtSizes}
          />
        )}
      </div>
      <div className={sizeStyles.textContainer}>
        <div className={styles.primaryText}>{primaryText}</div>
        <div className={styles.secondaryText}>
          <div className={styles.secondaryTextContent}>{secondaryText}</div>
          <UserBadges
            userId={userId}
            badgeSize={12}
            className={styles.iconVerified}
          />
        </div>
        {showRepostFavoriteStats ? (
          <div className={styles.stats}>
            <RepostFavoritesStats
              isUnlisted={false}
              size={Size.SMALL}
              repostCount={reposts!}
              saveCount={favorites!}
              onClickReposts={onClickReposts!}
              onClickFavorites={onClickFavorites!}
              className={styles.statsWrapper}
            />
            {trackCount !== undefined && (
              <div className={styles.trackCount}>
                {`${trackCount} ${pluralize('Track', trackCount)}`}
              </div>
            )}
          </div>
        ) : null}
      </div>
      {bottomActions}
    </div>
  )
}

Card.defaultProps = {
  primaryText: '',
  secondaryText: '',
  isUser: false,
  isPlaylist: true,
  isReposted: false,
  isLoading: false,
  size: 'large',
  menu: {},
  onClick: () => {}
}

export default Card
