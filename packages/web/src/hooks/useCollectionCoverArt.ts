import {
  CoverArtSizes,
  SquareSizes,
  useImageSize,
  collectionsActions,
  imageBlank as imageEmpty
} from '@audius/common'
import { useDispatch } from 'react-redux'

const { fetchCoverArt } = collectionsActions

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
    action: fetchCoverArt,
    defaultImage
  })
}
