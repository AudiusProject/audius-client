import {
  CollectionType,
  ID,
  savedCollectionsActions,
  savedCollectionsSelectors,
  waitForRead
} from '@audius/common'
import { all, call, select, put, takeEvery } from 'typed-redux-saga'

import { retrieveCollections } from '../cache/collections/utils'

const { fetchCollections, fetchCollectionsSucceeded } = savedCollectionsActions
const { getAccountAlbums, getAccountPlaylists } = savedCollectionsSelectors

type FetchCollectionsConfig = {
  type: CollectionType
  ids: ID[]
}

function* fetchCollectionsAsync({ ids, type }: FetchCollectionsConfig) {
  yield waitForRead()

  yield* call(retrieveCollections, ids)

  yield put(
    fetchCollectionsSucceeded({
      type
    })
  )
}

/** Will create and wait on parallel effects to fetch full details for all saved albums and
 * playlists. Note: Only use this if you really need full details (such as track
 * lists) for all collections, as it may potentially fetch a lot of data.
 */
export function* fetchAllAccountCollections() {
  yield waitForRead()

  const { data: playlists } = yield* select(getAccountPlaylists)
  const { data: albums } = yield* select(getAccountAlbums)

  yield* all([
    call(fetchCollectionsAsync, {
      ids: albums.map(({ id }) => id),
      type: 'albums'
    }),
    call(fetchCollectionsAsync, {
      ids: playlists.map(({ id }) => id),
      type: 'playlists'
    })
  ])
}

function* watchFetchCollections() {
  yield* takeEvery(
    fetchCollections.type,
    function* (action: ReturnType<typeof fetchCollections>) {
      yield* fetchCollectionsAsync(action.payload)
    }
  )
}

export default function sagas() {
  return [watchFetchCollections]
}
