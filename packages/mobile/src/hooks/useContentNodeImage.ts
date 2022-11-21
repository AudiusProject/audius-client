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
}

/**
 * Load an image hosted on content nodes
 * Returns props for the Image component
 */
export const useContentNodeImage = ({
  cid,
  user,
  sizes = SquareSizes
}: UseContentNodeImageOptions): ContentNodeImageSource => {
  const [nodeIndex, setNodeIndex] = useState(0)

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

    return endpoints.reduce(
      (result, gateway) => [
        ...result,
        Object.values(sizes).map((size) => {
          const width = Number(size.split('x')[0])
          return {
            width,
            height: width,
            uri: `${gateway}${cid}/${size}.jpg`
          }
        })
      ],
      []
    )
  }, [cid, endpoints, sizes])

  const handleError = useCallback(() => {
    if (nodeIndex < imageUrisByNode.length - 1) {
      setNodeIndex(nodeIndex + 1)
      console.log('IMAGE LOAD ERROR, attempt', nodeIndex)
    } else {
      // This resolves a statically imported image into a uri
      // const defaultImage = Image.resolveAssetSource(defaultImageSource).uri

      console.log('IMAGE LOAD FAILURE')
    }
  }, [nodeIndex, imageUrisByNode.length])

  const result = useMemo(
    () => ({ source: imageUrisByNode[nodeIndex], handleError }),
    [imageUrisByNode, nodeIndex, handleError]
  )

  return result
}
