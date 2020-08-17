import UserListSagaFactory from 'containers/user-list/store/sagas'
import { USER_LIST_TAG } from '../RepostsPage'
import { put, select } from 'redux-saga/effects'
import { getId, getRepostsType, getUserList, getUserIds } from './selectors'
import { getTrack } from 'store/cache/tracks/selectors'
import Track from 'models/Track'
import { ID } from 'models/common/Identifiers'
import { RepostType } from './types'
import Collection from 'models/Collection'
import { getCollection } from 'store/cache/collections/selectors'
import AudiusBackend from 'services/AudiusBackend'
import { createUserListProvider } from 'containers/user-list/utils'
import { trackRepostError, playlistRepostError } from './actions'
import { watchRepostsError } from './errorSagas'

const getPlaylistReposts = createUserListProvider<Collection>({
  getExistingEntity: getCollection,
  extractUserIDSubsetFromEntity: (collection: Collection) =>
    collection.followee_reposts.map(r => r.user_id),
  fetchAllUsersForEntity: ({ limit, offset, entityId }) =>
    AudiusBackend.getRepostersForPlaylist({
      limit,
      offset,
      playlistId: entityId
    }),
  selectCurrentUserIDsInList: getUserIds,
  canFetchMoreUsers: (collection: Collection, combinedUserIDs: ID[]) =>
    combinedUserIDs.length < collection.repost_count,
  includeCurrentUser: p => p.has_current_user_reposted
})

const getTrackReposts = createUserListProvider<Track>({
  getExistingEntity: getTrack,
  extractUserIDSubsetFromEntity: (track: Track) =>
    track.followee_reposts.map(r => r.user_id),
  fetchAllUsersForEntity: ({
    limit,
    offset,
    entityId
  }: {
    limit: number
    offset: number
    entityId: ID
  }) =>
    AudiusBackend.getRepostersForTrack({ limit, offset, trackId: entityId }),
  selectCurrentUserIDsInList: getUserIds,
  canFetchMoreUsers: (track: Track, combinedUserIDs: ID[]) =>
    combinedUserIDs.length < track.repost_count,
  includeCurrentUser: t => t.has_current_user_reposted
})

function* errorDispatcher(error: Error) {
  const repostType = yield select(getRepostsType)
  const id = yield select(getId)
  if (repostType === RepostType.TRACK) {
    yield put(trackRepostError(id, error.message))
  } else {
    yield put(playlistRepostError(id, error.message))
  }
}

function* getReposts(currentPage: number, pageSize: number) {
  const id: number | null = yield select(getId)
  if (!id) return { userIds: [], hasMore: false }
  const repostType = yield select(getRepostsType)
  return yield (repostType === RepostType.TRACK
    ? getTrackReposts
    : getPlaylistReposts)({ id, currentPage, pageSize })
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: USER_LIST_TAG,
  fetchUsers: getReposts,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchRepostsError]
}
