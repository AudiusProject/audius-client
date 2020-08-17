import { takeEvery, call, put } from 'redux-saga/effects'
import { fetch, fetchSucceeded } from './slice'
import { waitForBackendSetup } from 'store/backend/sagas'
import { waitForValue, requiresAccount } from 'utils/sagaHelpers'
import { getAccountStatus } from 'store/account/selectors'
import Collection from 'models/Collection'
import { ExploreCollectionsVariant } from '../types'
import Explore from 'services/audius-backend/Explore'
import { processAndCacheCollections } from 'store/cache/collections/utils'
import { Status } from 'store/types'
import { EXPLORE_PAGE } from 'utils/route'

function* fetchLetThemDJ() {
  const collections = yield call(Explore.getTopCollections, 'playlist', true)
  return collections
}

function* fetchTopAlbums() {
  const collections = yield call(Explore.getTopCollections, 'album', false)
  return collections
}

function* fetchTopPlaylists() {
  const collections = yield call(Explore.getTopCollections, 'playlist', false)
  return collections
}

function* fetchMoodPlaylists(moods: string[]) {
  const collections = yield call(Explore.getTopPlaylistsForMood, moods)
  return collections
}

const fetchMap = {
  [ExploreCollectionsVariant.LET_THEM_DJ]: requiresAccount(
    fetchLetThemDJ,
    EXPLORE_PAGE
  ),
  [ExploreCollectionsVariant.TOP_ALBUMS]: fetchTopAlbums,
  [ExploreCollectionsVariant.TOP_PLAYLISTS]: fetchTopPlaylists,
  [ExploreCollectionsVariant.MOOD]: fetchMoodPlaylists
}

function* watchFetch() {
  yield takeEvery(fetch.type, function* (action: ReturnType<typeof fetch>) {
    yield call(waitForBackendSetup)
    yield call(
      waitForValue,
      getAccountStatus,
      {},
      status => status !== Status.LOADING
    )

    const { variant, moods } = action.payload

    let collections
    if (variant === ExploreCollectionsVariant.MOOD) {
      collections = yield call(fetchMap[ExploreCollectionsVariant.MOOD], moods!)
    } else if (variant === ExploreCollectionsVariant.DIRECT_LINK) {
      // no-op
    } else {
      collections = yield call(fetchMap[variant])
    }
    if (!collections) return

    yield call(
      processAndCacheCollections,
      collections,
      /* shouldRetrieveTracks= */ false
    )

    const collectionIds = collections.map((c: Collection) => c.playlist_id)

    yield put(
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
