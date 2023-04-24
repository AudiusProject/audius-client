import {
  ID,
  UserListSagaFactory,
  relatedArtistsUserListSelectors,
  relatedArtistsUserListActions,
  RELATED_ARTISTS_USER_LIST_TAG,
  getContext
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

import { watchRelatedArtistsError } from './errorSagas'

export const MAX_RELATED_ARTISTS = 30

const { getRelatedArtistsError } = relatedArtistsUserListActions
const { getId, getUserList } = relatedArtistsUserListSelectors

type FetchRelatedArtistsArgs = {
  artistId: ID
  currentPage: number
  pageSize: number
}

function* fetchRelatedArtists({
  artistId,
  currentPage,
  pageSize
}: FetchRelatedArtistsArgs) {
  const offset = currentPage * pageSize
  const apiClient = yield* getContext('apiClient')
  const response = yield* call([apiClient, apiClient.getRelatedArtists], {
    userId: artistId,
    limit: pageSize,
    offset
  })

  const users = response || []

  const userIds = users.map((user) => user.user_id)
  const hasMore = userIds.length > 0 && offset + pageSize < MAX_RELATED_ARTISTS
  const existingUserIds = yield* select((state) => getUserList(state).userIds)
  const combinedUserIds = [...existingUserIds, ...userIds]
  return {
    combinedUserIds,
    hasMore
  }
}

function* errorDispatcher(error: Error) {
  const id = yield* select(getId)
  if (id) {
    yield* put(getRelatedArtistsError(id, error.message))
  }
}

function* getRelatedArtists(currentPage: number, pageSize: number) {
  const id = yield* select(getId)
  if (!id) return { userIds: [], hasMore: false }

  return yield* call(fetchRelatedArtists, {
    artistId: id,
    currentPage,
    pageSize
  })
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: RELATED_ARTISTS_USER_LIST_TAG,
  fetchUsers: getRelatedArtists,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchRelatedArtistsError]
}
