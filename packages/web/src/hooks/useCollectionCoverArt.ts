import {
  CoverArtSizes,
  SquareSizes,
  useImageSize,
  cacheCollectionsActions,
  imageBlank as imageEmpty,
  ID
} from '@audius/common'
import { useDispatch } from 'react-redux'

const { fetchCoverArt } = cacheCollectionsActions

export const useCollectionCoverArt = (
  collectionId: number | null | undefined,
  coverArtSizes: CoverArtSizes | null,
  size: SquareSizes,
  defaultImage: string = imageEmpty as string
) => {
  const dispatch = useDispatch()
  return useImageSize({
    dispatch,
    id: collectionId,
    sizes: coverArtSizes,
    size,
    action: ({ id, size }: { id: ID; size: SquareSizes }) =>
      fetchCoverArt(id, size),
    defaultImage
  })
}
