import {
  Track,
  TrackMetadata,
  AudiusBackend,
  PremiumContentType
} from '@audius/common'
import { omit } from 'lodash'

/**
 * Potentially add
 */
const setIsCoSigned = <T extends TrackMetadata>(track: T) => {
  const { remix_of } = track

  const remixOfTrack = remix_of?.tracks?.[0]

  const isCoSigned =
    remixOfTrack &&
    (remixOfTrack.has_remix_author_saved ||
      remixOfTrack.has_remix_author_reposted)

  if (isCoSigned) {
    return {
      ...track,
      _co_sign: remix_of!.tracks[0]
    }
  }
  return track
}

/**
 * When a track is not unlisted, even if field visibility is set
 * we should coerce the track into a state where socials are visible.
 * @param track
 * @returns track with repaired field visibility
 */
const setFieldVisibility = <T extends TrackMetadata>(track: T) => {
  const { is_unlisted } = track
  if (!is_unlisted) {
    // Public track
    return {
      ...track,
      field_visibility: {
        ...track.field_visibility,
        genre: true,
        mood: true,
        tags: true,
        share: true,
        play_count: true
      }
    }
  }
  return track
}

/**
 * NOTE: This is a temporary fix for a backend bug: The field followee_saves is not defined.
 * This is a stopgap to prevent the client from erroring and should be removed after fixed.
 * The current erroneous disprov endpoint is `/feed/reposts/<userid>`
 * @param track
 */
const setDefaultFolloweeSaves = <T extends TrackMetadata>(track: T) => {
  return {
    ...track,
    followee_saves: track?.followee_saves ?? []
  }
}

const setTypedPremiumConditions = <T extends TrackMetadata>(track: T) => {
  const premium_conditions = track.premium_conditions as any
  let type
  if (premium_conditions?.nft_collection != null) {
    type = PremiumContentType.COLLECTIBLE_GATED
  } else if (premium_conditions?.follow_user_id != null) {
    type = PremiumContentType.FOLLOW_GATED
  } else if (premium_conditions?.tip_user_id != null) {
    type = PremiumContentType.TIP_GATED
  } else if (premium_conditions?.usdc_purchase != null) {
    type = PremiumContentType.USDC_PURCHASE
  } else {
    type = null
  }
  return {
    ...track,
    premium_conditions: type
      ? {
          type,
          ...premium_conditions
        }
      : null
  }
}

/**
 * Reformats a track to be used internally within the client
 * This method should *always* be called before a track is cached.
 */
export const reformat = <T extends TrackMetadata>(
  track: T,
  audiusBackendInstance: AudiusBackend
): Track => {
  const t = track
  const withoutUser = omit(t, 'user')
  // audius-query denormalization expects track.user to contain the id of the owner.
  const withUserIdAsUser = { ...withoutUser, user: t.owner_id }
  const withImages = audiusBackendInstance.getTrackImages(withUserIdAsUser)
  const withCosign = setIsCoSigned(withImages)
  const withFieldVisibility = setFieldVisibility(withCosign)
  const withTypedPremiumConditions =
    setTypedPremiumConditions(withFieldVisibility)

  const withDefaultSaves = setDefaultFolloweeSaves(withTypedPremiumConditions)
  return withDefaultSaves
}
