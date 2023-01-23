import { useState, useMemo, useCallback } from 'react'

import type { Nullable, CID, WidthSizes, SquareSizes } from '@audius/common'
import { interleave } from '@audius/common'
import type { User } from '@sentry/react-native'
import type { ImageSourcePropType, ImageURISource } from 'react-native'

import { audiusBackendInstance } from 'app/services/audius-backend-instance'

export type ContentNodeImageSource = {
  source: ImageSourcePropType
  handleError: () => void
}

export const isImageUriSource = (
  source: ImageSourcePropType
): source is ImageURISource => {
  return (source as ImageURISource)?.uri !== undefined
}

/**
 * Create an array of ImageSources for an endpoint and sizes
 */
const createImageSourcesForEndpoints = ({
  endpoints,
  createUri
}: {
  endpoints: string[]
  createUri: (endpoint: string) => string
}): ImageURISource[] =>
  endpoints.reduce((result, endpoint) => {
    const source = {
      uri: createUri(endpoint),
      // A CID is a unique identifier of a piece of content,
      // so we can always rely on a cached value
      // https://reactnative.dev/docs/images#cache-control-ios-only
      cache: 'force-cache' as const
    }

    return [...result, source]
  }, [])

/**
 * Create all the sources for an image.
 * Includes legacy endpoints and optionally local sources
 */
const createAllImageSources = ({
  cid,
  user,
  endpoints: providedEndpoints,
  size,
  localSource
}: {
  cid: Nullable<CID>
  user?: Nullable<{ creator_node_endpoint: Nullable<string> }>
  endpoints?: string[]
  size: SquareSizes | WidthSizes
  localSource?: ImageURISource | null
}) => {
  if (!cid || (!user && !providedEndpoints)) {
    return []
  }

  const endpoints =
    providedEndpoints ??
    (user?.creator_node_endpoint
      ? audiusBackendInstance.getCreatorNodeIPFSGateways(
          user.creator_node_endpoint
        )
      : [])

  const newImageSources = createImageSourcesForEndpoints({
    endpoints,
    createUri: (endpoint) => `${endpoint}${cid}/${size}.jpg`
  })

  // These can be removed when all the data on Content Node has
  // been migrated to the new path
  const legacyImageSources = createImageSourcesForEndpoints({
    endpoints,
    createUri: (endpoint) => `${endpoint}${cid}`
  })

  const sourceList = [
    ...(localSource ? [localSource] : []),
    // Alternate between new and legacy paths, so the legacy path is tried for each
    // content node
    ...interleave(newImageSources, legacyImageSources)
  ]
  return sourceList
}

/**
 * Return the first image source, usually the user's primary
 * or a local source. This is useful for cases where there is no error
 * callback if the image fails to load - like the MusicControls on the lockscreen
 */
export const getImageSourceOptimistic = (
  options: Parameters<typeof createAllImageSources>[0]
) => {
  const allImageSources = createAllImageSources(options)
  return allImageSources[0]
}

type UseContentNodeImageOptions = {
  cid: Nullable<CID>
  user: Nullable<Pick<User, 'creator_node_endpoint'>>
  // The size of the image to fetch
  size: SquareSizes | WidthSizes
  fallbackImageSource: ImageSourcePropType
  localSource?: ImageURISource | null
}

/**
 * Load an image from a user's replica set
 *
 * If the image fails to load, try the next node in the replica set
 *
 * Returns props for the DynamicImage component
 * @returns {
 *  source: ImageSource
 *  onError: () => void
 * }
 */
export const useContentNodeImage = ({
  cid,
  user,
  size,
  fallbackImageSource,
  localSource
}: UseContentNodeImageOptions): ContentNodeImageSource => {
  const [imageSourceIndex, setImageSourceIndex] = useState(0)
  const [failedToLoad, setFailedToLoad] = useState(false)

  const endpoints = useMemo(
    () =>
      user?.creator_node_endpoint
        ? audiusBackendInstance.getCreatorNodeIPFSGateways(
            user.creator_node_endpoint
          )
        : [],
    [user?.creator_node_endpoint]
  )

  // Create an array of ImageSources
  // based on the content node endpoints
  const imageSources = useMemo(() => {
    return createAllImageSources({
      cid,
      endpoints,
      localSource,
      size
    })
  }, [cid, endpoints, localSource, size])

  const handleError = useCallback(() => {
    if (imageSourceIndex < imageSources.length - 1) {
      // Image failed to load from the current node
      setImageSourceIndex(imageSourceIndex + 1)
    } else {
      // Image failed to load from any node in replica set
      setFailedToLoad(true)
    }
  }, [imageSourceIndex, imageSources])

  const source = useMemo(() => {
    if (!user || !cid || failedToLoad) {
      return fallbackImageSource
    }

    return imageSources[imageSourceIndex]
  }, [
    imageSources,
    imageSourceIndex,
    fallbackImageSource,
    failedToLoad,
    user,
    cid
  ])

  const result = useMemo(
    () => ({
      source,
      handleError
    }),
    [source, handleError]
  )

  return result
}
