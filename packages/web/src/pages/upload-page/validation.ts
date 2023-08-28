import {
  Genre,
  HashId,
  Mood,
  PremiumConditionsFollowUserId,
  PremiumConditionsNFTCollection,
  PremiumConditionsTipUserId
} from '@audius/sdk'
import { z } from 'zod'

const messages = {
  invalidReleaseDateError: 'Release date should not be in the future.',
  artworkRequiredError: 'Artwork is required.',
  genreRequiredError: 'Genre is required.',
  track: {
    titleRequiredError: 'Your track must have a name.'
  },
  playlist: {
    nameRequiredError: 'Your playlist must have a name.'
  },
  album: {
    nameRequiredError: 'Your album must have a name.'
  }
}

const GenreSchema = z
  .enum(Object.values(Genre) as [Genre, ...Genre[]])
  .nullable()
  .refine((val) => val !== null, {
    message: messages.genreRequiredError
  })

const MoodSchema = z
  .optional(z.enum(Object.values(Mood) as [Mood, ...Mood[]]))
  .nullable()

// TODO: KJ - Need to update the schema in sdk and then import here
const SdkTrackMetadataSchema = z.object({
  aiAttributionUserId: z.optional(HashId),
  description: z.optional(z.string().max(1000)),
  download: z.optional(
    z
      .object({
        cid: z.optional(z.string()),
        isDownloadable: z.boolean(),
        requiresFollow: z.boolean()
      })
      .strict()
      .nullable()
  ),
  fieldVisibility: z.optional(
    z.object({
      mood: z.optional(z.boolean()),
      tags: z.optional(z.boolean()),
      genre: z.optional(z.boolean()),
      share: z.optional(z.boolean()),
      playCount: z.optional(z.boolean()),
      remixes: z.optional(z.boolean())
    })
  ),
  genre: GenreSchema,
  isPremium: z.optional(z.boolean()),
  isrc: z.optional(z.string().nullable()),
  isUnlisted: z.optional(z.boolean()),
  iswc: z.optional(z.string().nullable()),
  license: z.optional(z.string().nullable()),
  mood: MoodSchema,
  premiumConditions: z.optional(
    z.union([
      PremiumConditionsNFTCollection,
      PremiumConditionsFollowUserId,
      PremiumConditionsTipUserId
    ])
  ),
  releaseDate: z.optional(
    z.date().max(new Date(), { message: messages.invalidReleaseDateError })
  ),
  remixOf: z.optional(
    z
      .object({
        tracks: z
          .array(
            z.object({
              parentTrackId: HashId
            })
          )
          .min(1)
      })
      .strict()
  ),
  tags: z.optional(z.string()),
  title: z.string({
    required_error: messages.track.titleRequiredError
  }),
  previewStartSeconds: z.optional(z.number()),
  audioUploadId: z.optional(z.string()),
  previewCid: z.optional(z.string())
})

export const TrackMetadataSchema = SdkTrackMetadataSchema.merge(
  z.object({
    artwork: z
      .object({
        url: z.string()
      })
      .nullable()
  })
)

export const TrackMetadataFormSchema = TrackMetadataSchema.refine(
  (form) => form.artwork !== null,
  {
    message: messages.artworkRequiredError,
    path: ['artwork']
  }
)

export type TrackMetadata = z.input<typeof TrackMetadataSchema>

const createCollectionSchema = (collectionType: 'playlist' | 'album') =>
  z.object({
    artwork: z
      .object({
        url: z.string()
      })
      .nullable()

      .refine((artwork) => artwork !== null, {
        message: messages.artworkRequiredError
      }),
    playlist_name: z.string({
      required_error: messages[collectionType].nameRequiredError
    }),
    description: z.optional(z.string().max(1000)),
    releaseDate: z.optional(
      z.coerce
        .date()
        .max(new Date(), { message: messages.invalidReleaseDateError })
    ),
    trackDetails: z.object({
      genre: GenreSchema,
      mood: MoodSchema,
      tags: z.optional(z.string())
    }),
    is_album: z.literal(collectionType === 'album'),
    tracks: z.array(TrackMetadataSchema)
  })

export const PlaylistSchema = createCollectionSchema('playlist')
export type PlaylistValues = z.input<typeof PlaylistSchema>

export const AlbumSchema = createCollectionSchema('album')
export type AlbumValues = z.input<typeof AlbumSchema>

export type CollectionValues = PlaylistValues | AlbumValues
