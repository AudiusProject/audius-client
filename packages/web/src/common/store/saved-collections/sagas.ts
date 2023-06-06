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
