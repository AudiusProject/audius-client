import { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import imageEmpty from 'assets/img/imageBlank2x.png'
import imageCoverPhotoBlank from 'assets/img/imageCoverPhotoBlank.jpg'
import profilePicEmpty from 'assets/img/imageProfilePicEmpty2X.png'
import useInstanceVar from 'hooks/useInstanceVar'
import {
  CoverArtSizes,
  CoverPhotoSizes,
  DefaultSizes,
  ImageSizesObject,
  ProfilePictureSizes,
  SquareSizes,
  URL,
  WidthSizes
} from 'models/common/ImageSizes'
import { fetchCoverArt as fetchCollectionCoverArt } from 'store/cache/collections/actions'
import { fetchCoverArt as fetchTrackCoverArt } from 'store/cache/tracks/actions'
import { fetchCoverPhoto, fetchProfilePicture } from 'store/cache/users/actions'

type Size = SquareSizes | WidthSizes

/** Gets the width dimension of a size */
const getWidth = (size: Size): number => parseInt(size.split('x')[0], 10)

/** Sorts sizes according to their width dimension */
const sortSizes = <ImageSize extends Size>(
  sizes: ImageSize[],
  reverse?: boolean
): ImageSize[] => {
  return reverse
    ? sizes.sort((a, b) => getWidth(b) - getWidth(a))
    : sizes.sort((a, b) => getWidth(a) - getWidth(b))
}

/**
 * Gets the next available image size using a comparator function
 */
const getNextImage = <
  ImageSize extends Size,
  ImageSizes extends ImageSizesObject<ImageSize>
>(
  comparator: (desiredSize: ImageSize, currentSize: ImageSize) => boolean
) => (imageSizes: ImageSizes, size: ImageSize): URL => {
  const keys = Object.keys(imageSizes) as ImageSize[]

  const next = sortSizes(keys.filter(s => !comparator(size, s)))[0]
  return imageSizes[next]
}

/**
 * Gets the next smallest available image size. If we have images
 * [A > B > C] and we request B, this method returns C.
 */
const smallerWidthComparator = <ImageSize extends Size>(
  desiredSize: ImageSize,
  size: ImageSize
) => getWidth(size) < getWidth(desiredSize)

/**
 * Gets the first available larger image size. If we have images
 * [A > B > C] and we request C, this method returns A.
 */
const largerWidthComparator = <ImageSize extends Size>(
  desiredSize: ImageSize,
  size: ImageSize
) => getWidth(size) > getWidth(desiredSize)

type UseImageSizeProps<
  ImageSize extends Size,
  ImageSizes extends ImageSizesObject<ImageSize>
> = {
  action: (id: number, size: ImageSize) => void
  defaultImage?: string
  id?: number | null
  onDemand?: boolean
  size: ImageSize
  sizes: ImageSizes | null
}

/**
 * Custom hooks that allow a component to use an image size for a
 * track, collection, or user's image.
 *
 * If the desired size is not yet cached, the next best size will be returned.
 * The desired size will be requested and returned when it becomes available
 *
 */
const useImageSize = <
  ImageSize extends Size,
  ImageSizes extends ImageSizesObject<ImageSize>
>({
  action,
  defaultImage = '',
  id,
  onDemand,
  size,
  sizes
}: UseImageSizeProps<ImageSize, ImageSizes>) => {
  const dispatch = useDispatch()
  const [getPreviousId, setPreviousId] = useInstanceVar<number | null>(null)

  const fallbackImage = (url: URL) => {
    setPreviousId(null)
    return url
  }

  const getImageSize = (): URL => {
    if (id === null || id === undefined) {
      return ''
    }

    // No image sizes object
    if (!sizes) {
      return fallbackImage('')
    }

    // Found an override
    const override = sizes[DefaultSizes.OVERRIDE]
    if (override) {
      return fallbackImage(override)
    }

    // Found the desired size
    const desired = sizes[size]
    if (desired) {
      return desired
    }

    // A larger size does exist
    const larger = getNextImage(largerWidthComparator)(sizes, size)
    if (larger) {
      return fallbackImage(larger)
    }

    // Don't dispatch twice for the same id
    if (getPreviousId() !== id) {
      setPreviousId(id)
      // Request the desired size
      dispatch(action(id, size))
    }

    // A smaller size does exist
    const smaller = getNextImage(smallerWidthComparator)(sizes, size)
    if (smaller) {
      return fallbackImage(smaller)
    }

    return defaultImage
  }

  // TODO: sk - disambiguate the return value so it can be typed
  if (!onDemand) return getImageSize() as any
  return getImageSize as any
}

const ARTWORK_HAS_LOADED_TIMEOUT = 1000

// We don't want to indefinitely delay tile loading
// waiting for the image, so set a timeout before
// we call callback().
export const useLoadImageWithTimeout = (
  image: any,
  callback?: () => void,
  timeout: number = ARTWORK_HAS_LOADED_TIMEOUT
) => {
  const [getDidCallback, setDidCallback] = useInstanceVar(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!image) {
        if (callback) callback()
        setDidCallback(true)
      }
    }, timeout)
    return () => clearTimeout(t)
  }, [image, callback, timeout, setDidCallback])

  useEffect(() => {
    if (image && !getDidCallback() && callback) callback()
  }, [image, callback, getDidCallback])
}

export const useTrackCoverArt = (
  trackId: number | null,
  coverArtSizes: CoverArtSizes | null,
  size: SquareSizes,
  defaultImage: string = imageEmpty,
  onDemand = false
) =>
  useImageSize({
    id: trackId,
    sizes: coverArtSizes,
    size,
    action: fetchTrackCoverArt,
    defaultImage,
    onDemand
  })

export const useCollectionCoverArt = (
  collectionId: number,
  coverArtSizes: CoverArtSizes | null,
  size: SquareSizes,
  defaultImage: string = imageEmpty,
  onDemand = false
) =>
  useImageSize({
    id: collectionId,
    sizes: coverArtSizes,
    size,
    action: fetchCollectionCoverArt,
    defaultImage,
    onDemand
  })

export const useUserProfilePicture = (
  userId: number | null,
  profilePictureSizes: ProfilePictureSizes | null,
  size: SquareSizes,
  defaultImage: string = profilePicEmpty,
  onDemand = false
) =>
  useImageSize({
    id: userId,
    sizes: profilePictureSizes,
    size,
    action: fetchProfilePicture,
    defaultImage,
    onDemand
  })

export const useUserCoverPhoto = (
  userId: number | null,
  coverPhotoSizes: CoverPhotoSizes | null,
  size: WidthSizes,
  defaultImage: string = imageCoverPhotoBlank,
  onDemand = false
) =>
  useImageSize({
    id: userId,
    sizes: coverPhotoSizes,
    size,
    action: fetchCoverPhoto,
    defaultImage,
    onDemand
  })
