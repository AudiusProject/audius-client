import type {
  Collection,
  CoverArtSizes,
  Track,
  UserMetadata
} from '@audius/common'
import { DefaultSizes, SquareSizes } from '@audius/common'

import { audiusBackendInstance } from 'app/services/audius-backend-instance'

export const populateCoverArtSizes = async <
  T extends Pick<Track | Collection, 'cover_art_sizes' | 'cover_art'> & {
    user: UserMetadata
  }
>(
  entity: T & { _cover_art_sizes: CoverArtSizes }
) => {
  if (!entity || !entity.user || (!entity.cover_art_sizes && !entity.cover_art))
    return
  const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
    entity.user.creator_node_endpoint
  )
  const multihash = entity.cover_art_sizes || entity.cover_art
  if (!multihash) return entity
  await Promise.allSettled(
    Object.values(SquareSizes).map(async (size) => {
      const coverArtSize = multihash === entity.cover_art_sizes ? size : null
      const url = await audiusBackendInstance.getImageUrl(
        multihash,
        coverArtSize,
        gateways
      )
      entity._cover_art_sizes = {
        ...entity._cover_art_sizes,
        [coverArtSize || DefaultSizes.OVERRIDE]: url
      }
    })
  )
  return entity
}
