import { Action, createAction } from '@reduxjs/toolkit'

import { ID } from 'models/common/Identifiers'

// export const FETCH_RELATED_ARTISTS =
//   'ARTIST_RECOMMENDATIONS/FETCH_RELATED_ARTISTS'
// export const FETCH_RELATED_ARTISTS_SUCCEEDED =
//   'ARTIST_RECOMMENDATIONS/FETCH_RELATED_ARTISTS_SUCCEEDED'

// export function fetchRelatedArtists2(userId: ID): FetchRelatedArtistsAction {
//   return { type: FETCH_RELATED_ARTISTS, userId }
// }
// export type FetchRelatedArtistsAction = Action<string> & {
//   userId: ID
// }

// export function fetchRelatedArtistsSucceeded2(
//   userId: ID,
//   relatedArtistIds: ID[]
// ): FetchRelatedArtistsSuccessAction {
//   return { type: FETCH_RELATED_ARTISTS_SUCCEEDED, userId, relatedArtistIds }
// }

// export type FetchRelatedArtistsSuccessAction = Action<string> & {
//   userId: ID
//   relatedArtistIds: ID[]
// }

export const fetchRelatedArtists = createAction<{ userId: ID }>(
  'ARTIST_RECOMMENDATIONS/FETCH_RELATED_ARTISTS'
)
export const fetchRelatedArtistsSucceeded = createAction<{
  userId: ID
  relatedArtistIds: ID[]
}>('ARTIST_RECOMMENDATIONS/FETCH_RELATED_ARTISTS_SUCCEEDED')
