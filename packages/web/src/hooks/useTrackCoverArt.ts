import {
  CoverArtSizes,
  SquareSizes,
  useImageSize,
  tracksActions,
  imageBlank as imageEmpty
} from '@audius/common'
import { useDispatch } from 'react-redux'

const { fetchCoverArt } = tracksActions

export const useTrackCoverArt = (
  trackId: number | null | string | undefined,
  coverArtSizes: CoverArtSizes | null,
  size: SquareSizes,
  defaultImage: string = imageEmpty as string
) => {
  const dispatch = useDispatch()
  return useImageSize({
    dispatch,
    id: trackId,
    sizes: coverArtSizes,
    size,
    action: fetchCoverArt,
    defaultImage
  })
}
