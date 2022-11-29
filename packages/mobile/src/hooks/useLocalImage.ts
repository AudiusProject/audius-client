import { useCallback } from 'react'

import { SquareSizes } from '@audius/common'
import type { ImageURISource } from 'react-native'
import { exists } from 'react-native-fs'
import { useAsync } from 'react-use'

import { getLocalCoverArtPath } from 'app/services/offline-downloader'

export const useLocalTrackImage = (trackId?: string) => {
  const getLocalPath = useCallback(
    (size: string) =>
      trackId ? getLocalCoverArtPath(trackId, size) : undefined,
    [trackId]
  )
  return useLocalImage(getLocalPath)
}

export const useLocalImage = (
  getLocalPath: (size: string) => string | undefined
): ImageURISource[] => {
  const imageSources = Object.values(SquareSizes)
    .reverse()
    .map(
      (size): ImageURISource => ({
        uri: `file://${getLocalPath(size.toString())}`,
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1])
      })
    )
    .filter((source) => !!source.uri)

  const { value: verifiedSources, loading } = useAsync(async () => {
    const verifiedSources: ImageURISource[] = []
    for (const source of imageSources) {
      if (source?.uri && (await exists(source.uri))) {
        console.log('verified', source.uri)
        verifiedSources.push(source)
      }
    }
    return verifiedSources
  }, [getLocalPath])

  return loading || !verifiedSources ? [] : verifiedSources
}
