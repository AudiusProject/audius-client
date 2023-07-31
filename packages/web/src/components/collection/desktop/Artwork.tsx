import { ComponentType, SVGProps, useCallback, useEffect } from 'react'

import {
  CoverArtSizes,
  SquareSizes,
  cacheCollectionsSelectors,
  imageBlank
} from '@audius/common'
import { Button, ButtonType, IconPencil } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useCollectionCoverArt } from 'hooks/useCollectionCoverArt'
import { open as openEditCollectionModal } from 'store/application/ui/editPlaylistModal/slice'

import styles from './CollectionHeader.module.css'

const { getCollection } = cacheCollectionsSelectors

const messages = {
  addArtwork: 'Add Artwork',
  changeArtwork: 'Change Artwork',
  removeArtwork: 'Remove Artwork'
}

type ArtworkProps = {
  collectionId: number
  coverArtSizes: CoverArtSizes
  callback: () => void
  gradient?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  imageOverride?: string
  isOwner: boolean
}

export const Artwork = (props: ArtworkProps) => {
  const {
    collectionId,
    coverArtSizes,
    callback,
    gradient,
    icon: Icon,
    imageOverride,
    isOwner
  } = props

  const dispatch = useDispatch()

  const isImageAutogenerated = useSelector(
    (state) =>
      getCollection(state, { id: collectionId })?.is_image_autogenerated
  )

  const image = useCollectionCoverArt(
    collectionId,
    coverArtSizes,
    SquareSizes.SIZE_1000_BY_1000
  )

  const hasImage = image && image !== imageBlank

  useEffect(() => {
    // If there's a gradient, this is a smart collection. Just immediately call back
    if (image || gradient || imageOverride || image === '') callback()
  }, [image, callback, gradient, imageOverride])

  const handleEditArtwork = useCallback(() => {
    dispatch(
      openEditCollectionModal({
        collectionId,
        initialFocusedField:
          hasImage && !isImageAutogenerated ? undefined : 'artwork'
      })
    )
  }, [dispatch, collectionId, hasImage, isImageAutogenerated])

  return (
    <DynamicImage
      wrapperClassName={styles.coverArtWrapper}
      className={styles.coverArt}
      image={gradient || imageOverride || image}
    >
      {Icon ? (
        <Icon className={styles.imageIcon} style={{ background: gradient }} />
      ) : null}
      {isOwner ? (
        <span className={styles.imageEditButtonWrapper}>
          <Button
            type={ButtonType.WHITE}
            text={
              hasImage && !isImageAutogenerated
                ? messages.removeArtwork
                : hasImage
                ? messages.changeArtwork
                : messages.addArtwork
            }
            onClick={handleEditArtwork}
            leftIcon={<IconPencil />}
          />
        </span>
      ) : null}
    </DynamicImage>
  )
}
