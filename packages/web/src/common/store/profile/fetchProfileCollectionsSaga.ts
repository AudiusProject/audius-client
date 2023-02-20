import {
  usersActions,
  getContext,
  profilePageActions,
  profilePageSelectors
} from '@audius/common'
import { isEqual } from 'lodash'
import { put, select, takeLatest, call } from 'typed-redux-saga'

import { processAndCacheCollections } from 'common/store/cache/collections/utils'

const {
  FETCH_COLLECTIONS,
  fetchCollections,
  fetchCollectionsSucceded,
  fetchCollectionsFailed
} = profilePageActions

const { getProfileUser } = profilePageSelectors

export function* watchFetchProfileCollections() {
  yield* takeLatest(FETCH_COLLECTIONS, fetchProfileCollectionsAsync)
}

function* fetchProfileCollectionsAsync(
  action: ReturnType<typeof fetchCollections>
) {
  const { handle } = action
  const user = yield* select((state) => getProfileUser(state, { handle }))

  if (!user) {
    yield* put(fetchCollectionsFailed(handle))
    return
  }

  const { user_id, _collectionIds } = user
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')

  try {
    const latestCollections = yield* call(
      audiusBackendInstance.getPlaylists,
      user_id,
      null,
      false
    )

    const latestCollectionIds = latestCollections.map(({ playlist_id }) =>
      playlist_id.toString()
    )

    if (!isEqual(_collectionIds, latestCollectionIds)) {
      yield* put(
        usersActions.updateUser({
          id: user_id,
          changes: { _collectionIds: latestCollectionIds }
        })
      )
    }

    yield* call(
      processAndCacheCollections,
      latestCollections,
      /* shouldRetrieveTracks= */ false
    )

    yield* put(fetchCollectionsSucceded(handle))
  } catch (e) {
    yield* put(fetchCollectionsFailed(handle))
  }
}
