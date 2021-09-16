import accountSlice from 'store/account/reducer'
import accountSagas from 'store/account/sagas'
import * as accountSelectors from 'store/account/selectors'
import * as cacheActions from 'store/cache/actions'
import * as collectionActions from 'store/cache/collections/actions'
import collectionsErrorSagas from 'store/cache/collections/errorSagas'
import collectionsReducer from 'store/cache/collections/reducer'
import collectionsSagas from 'store/cache/collections/sagas'
import * as collectionsSelectors from 'store/cache/collections/selectors'
import { asCache } from 'store/cache/reducer'
import cacheSagas from 'store/cache/sagas'
import * as cacheSelectors from 'store/cache/selectors'
import * as tracksActions from 'store/cache/tracks/actions'
import tracksReducer from 'store/cache/tracks/reducer'
import tracksSagas from 'store/cache/tracks/sagas'
import * as tracksSelectors from 'store/cache/tracks/selectors'
import * as usersActions from 'store/cache/users/actions'
import usersReducer from 'store/cache/users/reducer'
import usersSagas from 'store/cache/users/sagas'
import * as usersSelectors from 'store/cache/users/selectors'
import { AppState, Kind } from 'store/types'

// In the future, these state slices will live in @audius/client-store.
// For now they live in the web client. As features get migrated to RN
// relevant state slices should be added here. Eventually they will be pulled into
// @audius/client-store and the mobile client will no longer be dependent on the web client

export const reducers = {
  account: accountSlice.reducer,

  // Cache
  tracks: asCache(tracksReducer, Kind.TRACKS),
  collections: asCache(collectionsReducer, Kind.COLLECTIONS),
  users: asCache(usersReducer, Kind.USERS)
}

export const actions = {
  account: accountSlice.actions,
  cache: cacheActions,
  collection: collectionActions,
  tracks: tracksActions,
  users: usersActions
}

export const selectors = {
  account: accountSelectors,
  cache: cacheSelectors,
  collections: collectionsSelectors,
  tracks: tracksSelectors,
  users: usersSelectors
}

export const sagas = {
  account: accountSagas,
  cache: cacheSagas,
  collectionsError: collectionsErrorSagas,
  collections: collectionsSagas,
  tracks: tracksSagas,
  users: usersSagas
}

export type State = Pick<AppState, keyof typeof reducers>
