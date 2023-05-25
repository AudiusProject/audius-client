import { memo } from 'react'

import {
  ID,
  SquareSizes,
  CoverArtSizes,
  useLoadImageWithTimeout,
  FeatureFlags
} from '@audius/common'
import {
  PbIconPlay as IconPlay,
  PbIconPause as IconPause,
  IconLock
} from '@audius/stems'
import cn from 'classnames'

import CoSign from 'components/co-sign/CoSign'
import { Size } from 'components/co-sign/types'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { useFlag } from 'hooks/useRemoteConfig'
import { useTrackCoverArt } from 'hooks/useTrackCoverArt'

import styles from './Artwork.module.css'

type TileArtworkProps = {
  id: ID
  coverArtSizes: CoverArtSizes
  size: any
  isBuffering: boolean
  isPlaying: boolean
  showArtworkIcon: boolean
  showSkeleton: boolean
  artworkIconClassName?: string
  coSign?: {
    has_remix_author_saved: boolean
    has_remix_author_reposted: boolean
    user: { name: string; is_verified: boolean; user_id: ID }
  }
  callback: () => void
  doesUserHaveAccess?: boolean
}

export const ArtworkIcon = ({
  isBuffering,
  isPlaying,
  artworkIconClassName,
  doesUserHaveAccess,
  isTrack
}: {
  isBuffering: boolean
  isPlaying: boolean
  artworkIconClassName?: string
  doesUserHaveAccess?: boolean
  isTrack?: boolean
}) => {
  const { isEnabled: isGatedContentEnabled } = useFlag(
    FeatureFlags.GATED_CONTENT_ENABLED
  )

  let artworkIcon
  if (isGatedContentEnabled && isTrack && !doesUserHaveAccess) {
    artworkIcon = <IconLock width={36} height={36} />
  } else if (isBuffering) {
    artworkIcon = <LoadingSpinner className={styles.spinner} />
  } else if (isPlaying) {
    artworkIcon = <IconPause />
  } else {
    artworkIcon = <IconPlay />
  }
  return (
    <div
      className={cn(styles.artworkIcon, {
        [artworkIconClassName!]: !!artworkIconClassName
      })}
    >
      {artworkIcon}
    </div>
  )
}

type ArtworkProps = TileArtworkProps & {
  image: any
  label?: string
  isTrack?: boolean
}

const Artwork = memo(
  ({
    size,
    showSkeleton,
    showArtworkIcon,
    artworkIconClassName,
    isBuffering,
    isPlaying,
    image,
    coSign,
    label,
    doesUserHaveAccess,
    isTrack
  }: ArtworkProps) => {
    const imageElement = (
      <DynamicImage
        wrapperClassName={cn(styles.artworkWrapper, {
          [styles.artworkInset]: !coSign,
          [styles.small]: size === 'small',
          [styles.large]: size === 'large'
        })}
        className={styles.artwork}
        image={showSkeleton ? '' : image}
        aria-label={label}
      >
        {showArtworkIcon && (
          <ArtworkIcon
            isBuffering={isBuffering}
            isPlaying={isPlaying}
            artworkIconClassName={artworkIconClassName}
            doesUserHaveAccess={doesUserHaveAccess}
            isTrack={isTrack}
          />
        )}
      </DynamicImage>
    )
    return coSign ? (
      <CoSign
        size={Size.MEDIUM}
        hasFavorited={coSign.has_remix_author_saved}
        hasReposted={coSign.has_remix_author_reposted}
        coSignName={coSign.user.name}
        userId={coSign.user?.user_id ?? 0}
        className={cn(styles.artworkInset, {
          [styles.small]: size === 'small',
          [styles.large]: size === 'large'
        })}
      >
        {imageElement}
      </CoSign>
    ) : (
      imageElement
    )
  }
)

export const TrackArtwork = memo((props: TileArtworkProps) => {
  const { callback } = props
  const image = useTrackCoverArt(
    props.id,
    props.coverArtSizes,
    SquareSizes.SIZE_150_BY_150,
    ''
  )

  useLoadImageWithTimeout(image, callback)

  return <Artwork {...props} image={image} isTrack />
})

export const CollectionArtwork = memo((props: TileArtworkProps) => {
  const { callback } = props
  const image = useCollectionCoverArt(
    props.id,
    props.coverArtSizes,
    SquareSizes.SIZE_150_BY_150
  )

  useLoadImageWithTimeout(image, callback)

  return <Artwork {...props} image={image} />
})
