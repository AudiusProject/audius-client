import { useCallback } from 'react'

import type { Nullable, SquareSizes, WidthSizes } from '@audius/common'
import { reachabilitySelectors } from '@audius/common'
import type { ImageURISource } from 'react-native'
import { exists } from 'react-native-fs'
import { useSelector } from 'react-redux'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'

import {
  getLocalCollectionCoverArtPath,
  getLocalTrackCoverArtPath
} from 'app/services/offline-downloader'
const { getIsReachable } = reachabilitySelectors

export const getLocalImageSource = async (
  getLocalPath: (size: string) => string | undefined,
  size: SquareSizes | WidthSizes
) => {
  const imageSource = {
    uri: `file://${getLocalPath(size.toString())}`
  }

  if (!(await exists(imageSource.uri))) {
    return null
  }

  return imageSource
}

const getLocalTrackImagePath = (trackId?: string) => (size: string) =>
  trackId ? getLocalTrackCoverArtPath(trackId, size) : undefined

const getLocalCollectionImagePath = (collectionId?: string) => (size: string) =>
  collectionId ? getLocalCollectionCoverArtPath(collectionId, size) : undefined

export const getLocalTrackImageSource = (
  trackId: string,
  size: SquareSizes | WidthSizes
) => {
  return getLocalImageSource(getLocalTrackImagePath(trackId), size)
}

export const getLocalCollectionImageSource = (
  collectionId: string,
  size: SquareSizes | WidthSizes
) => {
  return getLocalImageSource(getLocalCollectionImagePath(collectionId), size)
}

export const useLocalImage = (
  getLocalPath: (size: string) => string | undefined,
  size: SquareSizes | WidthSizes
): AsyncState<Nullable<ImageURISource>> => {
  const isNotReachable = useSelector(getIsReachable) === false

  return useAsync(async () => {
    // Only check for local images if not reachable
    if (isNotReachable) {
      return null
    }

    return await getLocalImageSource(getLocalPath, size)
  }, [getLocalPath])
}

export const useLocalTrackImage = ({
  trackId,
  size
}: {
  trackId?: string
  size: SquareSizes | WidthSizes
}) => {
  const getLocalPath = useCallback(
    (size: string) => getLocalTrackImagePath(trackId)(size),
    [trackId]
  )
  return useLocalImage(getLocalPath, size)
}

export const useLocalCollectionImage = ({
  collectionId,
  size
}: {
  collectionId?: string
  size: SquareSizes | WidthSizes
}) => {
  const getLocalPath = useCallback(
    (size: string) => getLocalCollectionImagePath(collectionId)(size),
    [collectionId]
  )
  return useLocalImage(getLocalPath, size)
}
