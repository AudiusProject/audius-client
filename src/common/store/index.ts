import Cache from 'common/models/Cache'
import { Collection } from 'common/models/Collection'
import Kind from 'common/models/Kind'
import accountSlice from 'common/store/account/reducer'
import accountSagas from 'common/store/account/sagas'
import * as accountSelectors from 'common/store/account/selectors'
import * as cacheActions from 'common/store/cache/actions'
import * as collectionActions from 'common/store/cache/collections/actions'
import collectionsErrorSagas from 'common/store/cache/collections/errorSagas'
import collectionsReducer from 'common/store/cache/collections/reducer'
import collectionsSagas from 'common/store/cache/collections/sagas'
import * as collectionsSelectors from 'common/store/cache/collections/selectors'
import { asCache } from 'common/store/cache/reducer'
import cacheSagas from 'common/store/cache/sagas'
import * as cacheSelectors from 'common/store/cache/selectors'
import * as tracksActions from 'common/store/cache/tracks/actions'
import tracksReducer from 'common/store/cache/tracks/reducer'
import tracksSagas from 'common/store/cache/tracks/sagas'
import * as tracksSelectors from 'common/store/cache/tracks/selectors'
import * as usersActions from 'common/store/cache/users/actions'
import usersReducer from 'common/store/cache/users/reducer'
import usersSagas from 'common/store/cache/users/sagas'
import * as usersSelectors from 'common/store/cache/users/selectors'
import UserCacheState from 'common/store/cache/users/types'

import TracksCacheState from './cache/tracks/types'

// In the future, these state slices will live in @audius/client-common.
// For now they live in the web client. As features get migrated to RN
// relevant state slices should be added here. Eventually they will be pulled into
// @audius/client-common and the mobile client will no longer be dependent on the web client

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

export type CommonState = {
  account: ReturnType<typeof accountSlice.reducer>

  // Cache
  tracks: TracksCacheState
  collections: Cache<Collection>
  users: UserCacheState
}
