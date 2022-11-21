import type { Nullable, Collection } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

const { getUser } = cacheUsersSelectors

export const useCollectionCoverArt = (
  collection: Nullable<
    Pick<Collection, 'cover_art_sizes' | 'cover_art' | 'playlist_owner_id'>
  >
) => {
  const cid = collection
    ? collection.cover_art_sizes || collection.cover_art
    : null

  const user = useSelector((state) =>
    getUser(state, { id: collection?.playlist_owner_id })
  )
  // TODO: handle legacy format?
  // const coverArtSize = multihash === track.cover_art_sizes ? size : null

  return useContentNodeImage({ cid, user })
}
