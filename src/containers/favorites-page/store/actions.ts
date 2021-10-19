import { createCustomAction } from 'typesafe-actions'

import { FavoriteType } from 'common/models/Favorite'
import { ID } from 'common/models/Identifiers'

export const SET_FAVORITE = 'FAVORITING_USERS_PAGE/SET_FAVORITE'
export const GET_TRACK_FAVORITE_ERROR =
  'FAVORITING_USERS_PAGE/GET_TRACK_FAVORITE_ERROR'
export const GET_PLAYLIST_FAVORITE_ERROR =
  'FAVORITING_USERS_PAGE/GET_PLAYLIST_FAVORITE_ERROR'

export const setFavorite = createCustomAction(
  SET_FAVORITE,
  (id: ID, favoriteType: FavoriteType) => ({ id, favoriteType })
)
export const trackFavoriteError = createCustomAction(
  GET_TRACK_FAVORITE_ERROR,
  (id: ID, error: string) => ({ id, error })
)
export const playlistFavoriteError = createCustomAction(
  GET_PLAYLIST_FAVORITE_ERROR,
  (id: ID, error: string) => ({ id, error })
)
