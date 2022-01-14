import type { User } from 'audius-client/src/common/models/User'

export type UserImage = Pick<
  User,
  | 'cover_photo'
  | 'cover_photo_sizes'
  | 'profile_picture'
  | 'profile_picture_sizes'
>

export type UserMultihash = Pick<
  User,
  'metadata_multihash' | 'creator_node_endpoint'
>
