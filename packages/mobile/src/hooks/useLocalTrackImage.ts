import { useState, useCallback, useMemo } from 'react'

import { SquareSizes } from '@audius/common'
import type { ImageSourcePropType, ImageURISource } from 'react-native'

import { getLocalCoverArtPath } from 'app/services/offline-downloader'

export type LocalImageSource = {
  source: ImageSourcePropType | null
  handleError: () => void
}

export const useLocalTrackImage = (
  trackId: string | undefined
): LocalImageSource => {
  const [imageSourceIndex, setImageSourceIndex] = useState(0)
  const [failedToLoad, setFailedToLoad] = useState(false)
  const imageSources = useMemo(
    () =>
      trackId
        ? Object.values(SquareSizes)
            .reverse()
            .map(
              (size): ImageURISource => ({
                uri: getLocalCoverArtPath(trackId, size.toString()),
                width: parseInt(size.split('x')[0]),
                height: parseInt(size.split('x')[1])
              })
            )
        : [],
    [trackId]
  )

  const handleError = useCallback(() => {
    if (imageSourceIndex < imageSources.length - 1) {
      // Image failed to load from the current node
      setImageSourceIndex(imageSourceIndex + 1)
    } else {
      // Image failed to load from any node in replica set
      setFailedToLoad(true)
    }
  }, [imageSourceIndex, imageSources.length])

  const result = useMemo(
    () => ({
      source: failedToLoad ? null : imageSources[imageSourceIndex],
      handleError
    }),
    [failedToLoad, imageSources, imageSourceIndex, handleError]
  )

  return result
}
