import type { Track, SquareSizes } from '@audius/common'
import { cacheTracksActions, cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
import { getUseImageSizeHook } from 'app/hooks/useImageSize'
import { audiusBackendInstance } from 'app/services/audius-backend-instance'

const { getUser } = cacheUsersSelectors
const { fetchCoverArt } = cacheTracksActions

export const useTrackCoverArt = getUseImageSizeHook<SquareSizes>({
  action: fetchCoverArt,
  defaultImageSource: imageEmpty
})

export const useTrackCoverArtUrls = (track: Track) => {
  const cid = track.cover_art_sizes || track.cover_art

  const user = useSelector((state) => getUser(state, { id: track.owner_id }))
  // const coverArtSize = multihash === track.cover_art_sizes ? size : null

  const gateways = user
    ? audiusBackendInstance.getCreatorNodeIPFSGateways(
        user.creator_node_endpoint
      )
    : []

  return useContentNodeImage(cid, gateways)
}
