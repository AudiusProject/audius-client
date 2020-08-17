import React, { memo } from 'react'
import { ID } from 'models/common/Identifiers'

import styles from './TrackTileArt.module.css'

import cn from 'classnames'
import {
  useTrackCoverArt,
  useCollectionCoverArt,
  useLoadImageWithTimeout
} from 'hooks/useImageSize'
import { CoverArtSizes, SquareSizes } from 'models/common/ImageSizes'
import { Size } from 'components/co-sign/types'
import { Remix } from 'models/Track'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import CoSign from 'components/co-sign/CoSign'

type TrackTileArtProps = {
  isTrack: boolean
  id: ID
  coverArtSizes: CoverArtSizes
  className?: string
  showSkeleton?: boolean
  coSign?: Remix | null
  // Called when the image is done loading
  callback: () => void
}

const TrackTileArt = ({
  id,
  isTrack,
  className,
  coverArtSizes,
  showSkeleton,
  coSign,
  callback
}: TrackTileArtProps) => {
  const useImage = isTrack ? useTrackCoverArt : useCollectionCoverArt
  const image = useImage(id, coverArtSizes, SquareSizes.SIZE_150_BY_150)

  useLoadImageWithTimeout(image, callback)

  return coSign ? (
    <CoSign
      size={Size.SMALL}
      className={cn(styles.container, className)}
      hasFavorited={coSign.has_remix_author_saved}
      hasReposted={coSign.has_remix_author_reposted}
      isVerified={coSign.user.is_verified}
      coSignName={coSign.user.name}
    >
      <DynamicImage
        image={showSkeleton ? '' : image}
        wrapperClassName={styles.imageWrapper}
      />
    </CoSign>
  ) : (
    <DynamicImage
      image={showSkeleton ? '' : image}
      wrapperClassName={cn(styles.container, styles.imageWrapper, className)}
    />
  )
}

export default memo(TrackTileArt)
