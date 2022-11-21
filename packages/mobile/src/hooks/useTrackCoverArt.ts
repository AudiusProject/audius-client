import type { Track, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

const { getUser } = cacheUsersSelectors

export const useTrackCoverArt = (
  track: Nullable<Pick<Track, 'cover_art_sizes' | 'cover_art' | 'owner_id'>>
) => {
  const cid = track ? track.cover_art_sizes || track.cover_art : null

  const user = useSelector((state) => getUser(state, { id: track?.owner_id }))
  // TODO: handle legacy format?
  // const coverArtSize = multihash === track.cover_art_sizes ? size : null

  return useContentNodeImage({ cid, user })
}
