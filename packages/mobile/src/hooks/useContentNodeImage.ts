import { useState, useMemo, useCallback } from 'react'

import type { Nullable, CID, WidthSizes } from '@audius/common'
import { SquareSizes } from '@audius/common'
import type { User } from '@sentry/react-native'
import type { ImageSourcePropType } from 'react-native'

import { audiusBackendInstance } from 'app/services/audius-backend-instance'

export type ContentNodeImageSource = {
  source: ImageSourcePropType
  handleError: () => void
}

type UseContentNodeImageOptions = {
  cid: Nullable<CID>
  user: Nullable<Pick<User, 'creator_node_endpoint'>>
  sizes?: typeof SquareSizes | typeof WidthSizes
  useLegacyImagePath?: boolean
  fallbackImageSource: ImageSourcePropType
}

/**
 * Load an image from a user's replica set
 * Returns props for the ImageLoader component
 *
 * If the image fails to load, try the next node in the replica set
 */
export const useContentNodeImage = ({
  cid,
  user,
  sizes = SquareSizes,
  useLegacyImagePath,
  fallbackImageSource
}: UseContentNodeImageOptions): ContentNodeImageSource => {
  const [nodeIndex, setNodeIndex] = useState(0)
  const [failedToLoad, setFailedToLoad] = useState(false)

  const endpoints = useMemo(
    () =>
      user
        ? audiusBackendInstance.getCreatorNodeIPFSGateways(
            user.creator_node_endpoint
          )
        : [],
    [user]
  )

  const imageUrisByNode = useMemo(() => {
    if (!cid) {
      return []
    }

    return endpoints.reduce((result, gateway) => {
      const source = useLegacyImagePath
        ? { uri: `${gateway}${cid}` }
        : Object.values(sizes).map((size) => {
            const width = Number(size.split('x')[0])
            return {
              width,
              height: width,
              uri: `${gateway}${cid}/${size}.jpg`
            }
          })

      return [...result, source]
    }, [])
  }, [cid, endpoints, sizes, useLegacyImagePath])

  const handleError = useCallback(() => {
    if (nodeIndex < imageUrisByNode.length - 1) {
      setNodeIndex(nodeIndex + 1)

      // TODO: potentially record analytics here
      console.log('IMAGE LOAD ERROR, attempt', nodeIndex)
    } else {
      // This resolves a statically imported image into a uri
      // const defaultImage = Image.resolveAssetSource(defaultImageSource).uri

      setFailedToLoad(true)
      console.log('IMAGE LOAD FAILURE')
    }
  }, [nodeIndex, imageUrisByNode.length])

  const result = useMemo(
    () => ({
      source: failedToLoad ? fallbackImageSource : imageUrisByNode[nodeIndex],
      handleError
    }),
    [imageUrisByNode, nodeIndex, handleError, fallbackImageSource, failedToLoad]
  )

  return result
}
