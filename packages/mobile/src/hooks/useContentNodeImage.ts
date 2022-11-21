import { useState, useMemo, useCallback } from 'react'

import type { Nullable, CID } from '@audius/common'
import { SquareSizes } from '@audius/common'
import type { ImageSourcePropType } from 'react-native'

export type ContentNodeImageSource = {
  source: ImageSourcePropType
  handleError: () => void
}

export const useContentNodeImage = (
  cid: Nullable<CID>,
  endpoints: string[]
): ContentNodeImageSource => {
  const [nodeIndex, setNodeIndex] = useState(0)
  const imageUrisByNode = useMemo(() => {
    if (!cid) {
      return []
    }

    return endpoints.reduce(
      (result, gateway, i) => [
        ...result,
        Object.values(SquareSizes).map((size) => {
          const width = Number(size.split('x')[0])
          return {
            width,
            height: width,
            uri:
              i === 0
                ? `${gateway}${cid}/${size}.jpg`
                : `${gateway}${cid}/${size}.jpg`
          }
        })
      ],
      []
    )
  }, [cid, endpoints])

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
