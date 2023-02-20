import {
  CoverArtSizes,
  SquareSizes,
  useImageSize,
  cacheTracksActions,
  imageBlank as imageEmpty,
  ID
} from '@audius/common'
import { useDispatch } from 'react-redux'

const { fetchCoverArt } = cacheTracksActions

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
    action: ({ id, size }: { id: ID; size: SquareSizes }) =>
      fetchCoverArt(id, size),
    defaultImage
  })
}
