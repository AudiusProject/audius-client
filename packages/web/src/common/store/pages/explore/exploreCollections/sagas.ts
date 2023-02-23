import {
  Collection,
  explorePageCollectionsActions,
  ExploreCollectionsVariant,
  getContext,
  UserCollectionMetadata
} from '@audius/common'
import { uniq } from 'lodash'
import { takeEvery, call, put } from 'typed-redux-saga'

import { processAndCacheCollections } from 'common/store/cache/collections/utils'
import { requiresAccount } from 'common/utils/requiresAccount'
import { EXPLORE_PAGE } from 'utils/route'
import { waitForRead } from 'utils/sagaHelpers'
const { fetch, fetchSucceeded } = explorePageCollectionsActions

function* fetchLetThemDJ() {
  const explore = yield* getContext('explore')
  const collections = yield* call(
    [explore, 'getTopCollections'],
    'playlist',
    true
  )
  return collections
}

function* fetchTopAlbums() {
  const explore = yield* getContext('explore')
  const collections = yield* call(
    [explore, 'getTopCollections'],
    'album',
    false
  )
  return collections
}

function* fetchMoodPlaylists(moods: string[]) {
  const explore = yield* getContext('explore')
  const collections = yield* call([explore, 'getTopPlaylistsForMood'], moods)
  return collections
}

const fetchMap = {
  [ExploreCollectionsVariant.LET_THEM_DJ]: requiresAccount(
    fetchLetThemDJ,
    EXPLORE_PAGE
  ),
  [ExploreCollectionsVariant.TOP_ALBUMS]: fetchTopAlbums,
  [ExploreCollectionsVariant.MOOD]: fetchMoodPlaylists
}

function* watchFetch() {
  yield* takeEvery(fetch.type, function* (action: ReturnType<typeof fetch>) {
    yield* waitForRead()

    const { variant, moods } = action.payload

    let collections: UserCollectionMetadata[] | Collection[] | undefined
    if (variant === ExploreCollectionsVariant.MOOD) {
      collections = yield* call(
        fetchMap[ExploreCollectionsVariant.MOOD],
        moods!
      )
    } else if (variant === ExploreCollectionsVariant.DIRECT_LINK) {
      // no-op
    } else {
      collections = yield* call(fetchMap[variant])
    }
    if (!collections) return

    yield* call(
      processAndCacheCollections,
      collections,
      /* shouldRetrieveTracks= */ false
    )

    const collectionIds = uniq(
      collections.map((c: UserCollectionMetadata | Collection) => c.playlist_id)
    )

    yield* put(
      fetchSucceeded({
        variant,
        collectionIds
      })
    )
  })
}

export default function sagas() {
  return [watchFetch]
}
