import type { Nullable, User } from '@audius/common'

import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

export const useUserProfilePicture = (
  user: Nullable<
    Pick<
      User,
      'profile_picture_sizes' | 'profile_picture' | 'creator_node_endpoint'
    >
  >
) => {
  // TODO: handle legacy format?
  // const cid = multihash === track.cover_art_sizes ? size : null
  const cid = user ? user.profile_picture_sizes || user.profile_picture : null

  // TODO: handle fallback
  // import profilePicEmpty from 'app/assets/images/imageProfilePicEmpty2X.png'

  return useContentNodeImage({ cid, user })
}
