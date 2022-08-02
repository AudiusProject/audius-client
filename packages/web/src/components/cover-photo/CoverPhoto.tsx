import { memo, useState } from 'react'

import { CoverPhotoSizes, WidthSizes, Nullable } from '@audius/common'
import cn from 'classnames'
import { FileWithPreview } from 'react-dropzone'
import Lottie from 'react-lottie'

import loadingSpinner from 'assets/animations/loadingSpinner.json'
import imageCoverPhotoBlank from 'assets/img/imageCoverPhotoBlank.jpg'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import ImageSelectionButton from 'components/image-selection/ImageSelectionButton'
import { useUserCoverPhoto } from 'hooks/useUserCoverPhoto'

import styles from './CoverPhoto.module.css'

const messages = {
  imageName: 'Cover Photo'
}

type CoverPhotoProps = {
  userId: Nullable<number>
  coverPhotoSizes: Nullable<CoverPhotoSizes>
  updatedCoverPhoto?: string
  className?: string
  loading?: boolean
  error?: boolean
  edit?: boolean
  darken?: boolean
  onDrop?: (
    file: FileWithPreview[],
    source: 'original' | 'unsplash' | 'url'
  ) => Promise<void>
}

const CoverPhoto = ({
  userId,
  coverPhotoSizes,
  updatedCoverPhoto,
  className,
  error,
  edit = false,
  darken = false,
  onDrop
}: CoverPhotoProps) => {
  const [processing, setProcessing] = useState(false)
  const gradient = darken
    ? 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)'
    : 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 70%, rgba(0, 0, 0, 0.2) 100%)'

  const image = useUserCoverPhoto(userId, coverPhotoSizes, WidthSizes.SIZE_2000)
  let backgroundImage = ''
  let backgroundStyle = {}
  let immediate = false
  if (coverPhotoSizes) {
    if (image === imageCoverPhotoBlank && !updatedCoverPhoto) {
      backgroundImage = `${gradient}, url(${imageCoverPhotoBlank})`
      backgroundStyle = {
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }
    } else {
      backgroundImage = `${gradient}, url(${updatedCoverPhoto || image})`
      backgroundStyle = {
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }
    }
  } else {
    backgroundImage = gradient
    immediate = true
  }

  const handleDrop = async (
    file: Promise<FileWithPreview[]>,
    source: 'original' | 'unsplash' | 'url'
  ) => {
    setProcessing(true)
    const image = await file
    await onDrop?.(([] as FileWithPreview[]).concat(image), source)
    setProcessing(false)
  }

  const loadingElement = (
    <div className={cn(styles.overlay, { [styles.processing]: processing })}>
      <Lottie
        options={{ loop: true, autoplay: true, animationData: loadingSpinner }}
      />
    </div>
  )

  return (
    <div className={cn(styles.coverPhoto, className)}>
      <DynamicImage
        image={backgroundImage}
        isUrl={false}
        wrapperClassName={styles.photo}
        imageStyle={backgroundStyle}
        usePlaceholder={false}
        immediate={immediate}
      >
        <div className={styles.spinner}>
          {processing ? loadingElement : null}
        </div>
      </DynamicImage>
      <div className={styles.button}>
        {edit ? (
          <ImageSelectionButton
            imageName={messages.imageName}
            hasImage={Boolean(image || updatedCoverPhoto)}
            error={!!error}
            onSelect={handleDrop}
            source='CoverPhoto'
          />
        ) : null}
      </div>
    </div>
  )
}

export default memo(CoverPhoto)
