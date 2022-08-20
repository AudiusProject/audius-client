import { ID, FavoriteType } from 'models/index'
import { UserListStoreState } from 'store/user-list/types'

export type FavoritesOwnState = {
  id: ID | null
  favoriteType: FavoriteType
}

export type FavoritesPageState = {
  favoritesPage: FavoritesOwnState
  userList: UserListStoreState
}

export const FAVORITES_USER_LIST_TAG = 'FAVORITES'
