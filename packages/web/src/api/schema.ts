import { Kind } from '@audius/common'
import { schema } from 'normalizr'

export const userSchema = new schema.Entity(
  Kind.USERS,
  {},
  { idAttribute: 'user_id' }
)

export const trackSchema = new schema.Entity(
  Kind.TRACKS,
  { user: userSchema },
  { idAttribute: 'track_id' }
)

export const apiResponseSchema = new schema.Object({
  user: userSchema,
  track: trackSchema,
  users: new schema.Array(userSchema),
  tracks: new schema.Array(trackSchema)
})

export const apiResponseKeyToKind: Record<string, Kind> = {
  user: Kind.USERS,
  users: Kind.USERS,
  track: Kind.TRACKS,
  tracks: Kind.TRACKS
}
