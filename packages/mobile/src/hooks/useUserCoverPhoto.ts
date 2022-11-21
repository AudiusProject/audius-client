import type { Nullable, User } from '@audius/common'
import { WidthSizes } from '@audius/common'

import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

export const useUserCoverPhoto = (
  user: Nullable<
    Pick<User, 'cover_photo_sizes' | 'cover_photo' | 'creator_node_endpoint'>
  >
) => {
  // TODO: handle legacy format?
  // const cid = multihash === track.cover_art_sizes ? size : null
  const cid = user ? user.cover_photo_sizes || user.cover_photo : null

  // TODO: handle fallback
  // import imageCoverPhotoBlank from 'app/assets/images/imageCoverPhotoBlank.jpg'

  return useContentNodeImage({ cid, user, sizes: WidthSizes })
}
