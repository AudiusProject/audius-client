import React from 'react'
import cn from 'classnames'

import styles from './Card.module.css'
import placeholderArt from 'assets/img/imageBlank2x.png'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import {
  ProfilePictureSizes,
  SquareSizes,
  CoverArtSizes
} from 'models/common/ImageSizes'
import {
  useCollectionCoverArt,
  useUserProfilePicture
} from 'hooks/useImageSize'
import { ID } from 'models/common/Identifiers'
import { pluralize } from 'utils/formatUtil'
import RepostFavoritesStats, {
  Size
} from 'components/repost-favorites-stats/RepostFavoritesStats'

const UserImage = (props: { id: ID; imageSize: ProfilePictureSizes }) => {
  const image = useUserProfilePicture(
    props.id,
    props.imageSize,
    SquareSizes.SIZE_480_BY_480
  )

  return (
    <DynamicImage
      wrapperClassName={cn(styles.coverArt, styles.userCardImage)}
      image={image}
    />
  )
}

const CollectionImage = (props: { id: ID; imageSize: CoverArtSizes }) => {
  const image = useCollectionCoverArt(
    props.id,
    props.imageSize,
    SquareSizes.SIZE_480_BY_480,
    placeholderArt
  )

  return <DynamicImage wrapperClassName={styles.coverArt} image={image} />
}

type CardProps = {
  className?: string
  id: ID
  imageSize: ProfilePictureSizes | CoverArtSizes | null
  primaryText: string | React.ReactNode
  secondaryText: string | React.ReactNode
  isUser?: boolean
  isVerified?: boolean
  trackCount?: number
  // Socials
  reposts?: number
  favorites?: number
  onClickReposts?: () => void
  onClickFavorites?: () => void
  onClick: () => void
}

const Card = ({
  className,
  id,
  imageSize = null,
  isUser,
  isVerified,
  primaryText,
  secondaryText,
  trackCount,
  reposts,
  favorites,
  onClickReposts,
  onClickFavorites,
  onClick
}: CardProps) => {
  const showRepostFavoriteStats =
    !isUser && reposts && favorites && onClickReposts && onClickFavorites
  return (
    <div
      className={cn(styles.cardContainer, {
        [className!]: !!className
      })}
      onClick={onClick}
    >
      <div className={styles.tileCoverArtContainer}>
        {isUser ? (
          <UserImage id={id} imageSize={imageSize as ProfilePictureSizes} />
        ) : (
          <CollectionImage id={id} imageSize={imageSize as CoverArtSizes} />
        )}
      </div>
      <div className={styles.text}>
        <div className={styles.primaryText}>{primaryText}</div>
        <div
          className={cn(styles.secondaryText, {
            [styles.verifiedUser]: isUser && isVerified
          })}
        >
          {secondaryText}
          {isUser && isVerified ? (
            <IconVerified className={styles.iconVerified} />
          ) : null}
        </div>
        {(showRepostFavoriteStats || trackCount !== undefined) && (
          <div className={styles.menu}>
            {showRepostFavoriteStats ? (
              <RepostFavoritesStats
                isUnlisted={false}
                size={Size.SMALL}
                repostCount={reposts!}
                saveCount={favorites!}
                onClickReposts={onClickReposts!}
                onClickFavorites={onClickFavorites!}
                className={styles.statsWrapper}
              />
            ) : null}
            {trackCount !== undefined && (
              <div className={styles.trackCount}>
                {`${trackCount} ${pluralize('Track', trackCount)}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

Card.defaultProps = {
  isUser: false,
  primaryText: '',
  secondaryText: '',
  onClick: () => {},
  className: ''
}

export default Card
