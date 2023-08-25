import {
  accountSelectors,
  APIActivityV2,
  decodeHashId,
  encodeHashId,
  getContext,
  removeNullable,
  responseAdapter,
  savedPageActions as actions,
  savedPageSelectors,
  signOutActions,
  savedPageTracksLineupActions as tracksActions,
  User,
  UserTrackMetadata,
  waitForValue,
  LIBRARY_SELECTED_CATEGORY_LS_KEY,
  isLibraryCategory,
  LibraryCategoryType,
  Nullable
} from '@audius/common'
import { call, fork, put, select, takeLatest } from 'typed-redux-saga'

import { processAndCacheTracks } from 'common/store/cache/tracks/utils'
import { waitForRead } from 'utils/sagaHelpers'

import tracksSagas from './lineups/sagas'
const { signOut: signOutAction } = signOutActions

const { getSaves } = savedPageSelectors
const { getAccountUser } = accountSelectors

function* fetchLineupMetadatas(offset: number, limit: number) {
  const isNativeMobile = yield* getContext('isNativeMobile')

  // Mobile currently uses infinite scroll instead of a virtualized list
  // so we need to apply the offset & limit
  if (isNativeMobile) {
    yield* put(tracksActions.fetchLineupMetadatas(offset, limit))
  } else {
    yield* put(tracksActions.fetchLineupMetadatas())
  }
}

type LibraryParams = {
  userId: number
  offset: number
  limit: number
  query: string
  sortMethod: string
  sortDirection: string
  category: LibraryCategoryType
}

function* sendLibraryRequest({
  userId,
  offset,
  limit,
  query,
  sortMethod,
  sortDirection,
  category
}: LibraryParams) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const { data, signature } = yield* call([
    audiusBackendInstance,
    audiusBackendInstance.signDiscoveryNodeRequest
  ])
  const audiusSdk = yield* getContext('audiusSdk')
  const sdk = yield* call(audiusSdk)

  const savedTracksResponse = (yield* call(
    [sdk.full.users, sdk.full.users.getUserLibraryTracks as any],
    {
      id: encodeHashId(userId),
      userId: encodeHashId(userId),
      offset,
      limit,
      query,
      sortMethod,
      sortDirection,
      type: category,
      encodedDataMessage: data,
      encodedDataSignature: signature
    }
  )) as any
  const savedTracksResponseData = savedTracksResponse.data as APIActivityV2[]
  const tracks = savedTracksResponse.data
    ?.map(responseAdapter.makeActivity)
    .filter(removeNullable) as UserTrackMetadata[]
  if (!tracks) {
    throw new Error('Something went wrong with library tracks request.')
  }

  const saves = savedTracksResponseData
    .filter((save) => Boolean(save.timestamp && save.item))
    .map((save) => ({
      created_at: save.timestamp,
      save_item_id: decodeHashId(save.item!.id!)
    }))

  return {
    saves,
    tracks
  }
}

function prepareParams({
  account,
  params
}: {
  account: User
  params: ReturnType<typeof actions.fetchSaves>
}) {
  return {
    userId: account.user_id,
    offset: params.offset ?? 0,
    limit: params.limit ?? account.track_save_count,
    query: params.query ?? '',
    sortMethod: params.sortMethod || 'added_date',
    sortDirection: params.sortDirection || 'desc',
    category: params.category
  }
}

function* watchFetchSaves() {
  let currentQuery = ''
  let currentSortMethod = ''
  let currentSortDirection = ''
  let currentCategory = null as Nullable<LibraryCategoryType>

  yield* takeLatest(
    actions.FETCH_SAVES,
    function* (rawParams: ReturnType<typeof actions.fetchSaves>) {
      yield* waitForRead()
      const account: User = yield* call(waitForValue, getAccountUser)
      const saves = yield* select(getSaves)
      const params = prepareParams({ account, params: rawParams })
      const { query, sortDirection, sortMethod, offset, limit, category } =
        params
      const isSameParams =
        query === currentQuery &&
        currentSortDirection === sortDirection &&
        currentSortMethod === sortMethod &&
        currentCategory === category

      // Don't refetch saves in the same session
      if (saves && saves.length && isSameParams) {
        yield* fork(fetchLineupMetadatas, offset, limit)
      } else {
        try {
          currentQuery = query
          currentSortDirection = sortDirection
          currentSortMethod = sortMethod
          currentCategory = category
          yield* put(actions.fetchSavesRequested())
          const { saves, tracks } = yield* call(sendLibraryRequest, params)

          yield* processAndCacheTracks(tracks)

          const fullSaves = Array(account.track_save_count)
            .fill(0)
            .map((_) => ({}))

          fullSaves.splice(offset, saves.length, ...saves)
          yield* put(actions.fetchSavesSucceeded(fullSaves))
          if (limit > 0 && saves.length < limit) {
            yield* put(actions.endFetching(offset + saves.length))
          }
          yield* fork(fetchLineupMetadatas, offset, limit)
        } catch (e) {
          yield* put(actions.fetchSavesFailed())
        }
      }
    }
  )
}

function* watchFetchMoreSaves() {
  yield* takeLatest(
    actions.FETCH_MORE_SAVES,
    function* (rawParams: ReturnType<typeof actions.fetchMoreSaves>) {
      yield* waitForRead()
      const account = yield* call(waitForValue, getAccountUser)
      const params = prepareParams({ account, params: rawParams })
      const { limit, offset } = params

      try {
        const { saves, tracks } = yield* call(sendLibraryRequest, params)
        yield* processAndCacheTracks(tracks)
        yield* put(actions.fetchMoreSavesSucceeded(saves, offset))

        if (limit > 0 && saves.length < limit) {
          yield* put(actions.endFetching(offset + saves.length))
        }
        yield* fork(fetchLineupMetadatas, offset, limit)
      } catch (e) {
        yield* put(actions.fetchMoreSavesFailed())
      }
    }
  )
}

/**
 * Sets the selected category from local storage when the app loads
 */
function* setInitialSelectedCategory() {
  const getLocalStorageItem = yield* getContext('getLocalStorageItem')

  const categoryFromLocalStorage = yield* call(
    getLocalStorageItem,
    LIBRARY_SELECTED_CATEGORY_LS_KEY
  )

  if (
    categoryFromLocalStorage != null &&
    isLibraryCategory(categoryFromLocalStorage)
  ) {
    yield* put(actions.setSelectedCategory(categoryFromLocalStorage))
  }
}

function* setLocalStorageSelectedCategory(
  rawParams: ReturnType<typeof actions.setSelectedCategory>
) {
  const setLocalStorageItem = yield* getContext('setLocalStorageItem')
  setLocalStorageItem(LIBRARY_SELECTED_CATEGORY_LS_KEY, rawParams.category)
}

function* watchSetSelectedCategory() {
  yield* takeLatest(
    actions.SET_SELECTED_CATEGORY,
    setLocalStorageSelectedCategory
  )
}

function* clearLocalStorageSelectedCategory() {
  const removeLocalStorageItem = yield* getContext('removeLocalStorageItem')
  removeLocalStorageItem(LIBRARY_SELECTED_CATEGORY_LS_KEY)
}

function* watchSignOut() {
  yield* takeLatest(signOutAction.type, clearLocalStorageSelectedCategory)
}

export default function sagas() {
  return [
    ...tracksSagas(),
    watchFetchSaves,
    watchFetchMoreSaves,
    watchSetSelectedCategory,
    setInitialSelectedCategory,
    watchSignOut
  ]
}
