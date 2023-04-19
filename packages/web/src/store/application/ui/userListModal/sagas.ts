import {
  FavoriteType,
  topSupportersUserListActions as topSupporterActions,
  supportingUserListActions as supportingActions,
  RepostType,
  repostsUserListActions as repostActions,
  notificationsUserListActions as notificationActions,
  mutualsUserListActions,
  followingUserListActions as followingActions,
  followersUserListActions as followerActions,
  favoritesUserListActions as favoritesActions,
  relatedArtistsUserListActions
} from '@audius/common'
import { takeEvery, put } from 'redux-saga/effects'

import { setUsers } from './slice'
import { UserListType, UserListEntityType } from './types'
const { setMutuals } = mutualsUserListActions
const { setRelatedArtists } = relatedArtistsUserListActions

function* watchSetUsers() {
  yield takeEvery(
    setUsers.type,
    function* (action: ReturnType<typeof setUsers>) {
      const { userListType, entityType, id } = action.payload
      switch (userListType) {
        case UserListType.FAVORITE:
          yield put(
            favoritesActions.setFavorite(
              id,
              entityType === UserListEntityType.TRACK
                ? FavoriteType.TRACK
                : FavoriteType.PLAYLIST
            )
          )
          break
        case UserListType.REPOST:
          yield put(
            repostActions.setRepost(
              id,
              entityType === UserListEntityType.TRACK
                ? RepostType.TRACK
                : RepostType.COLLECTION
            )
          )
          break
        case UserListType.FOLLOWER:
          yield put(followerActions.setFollowers(id))
          break
        case UserListType.FOLLOWING:
          yield put(followingActions.setFollowing(id))
          break
        case UserListType.MUTUAL_FOLLOWER:
          yield put(setMutuals(id))
          break
        case UserListType.NOTIFICATION:
          yield put(
            notificationActions.setNotificationId(id as unknown as string)
          )
          break
        case UserListType.RELATED_ARTISTS:
          yield put(setRelatedArtists(id))
          break
        case UserListType.SUPPORTER:
          yield put(topSupporterActions.setTopSupporters(id))
          break
        case UserListType.SUPPORTING:
          yield put(supportingActions.setSupporting(id))
          break
        default:
          break
      }
    }
  )
}

export default function sagas() {
  return [watchSetUsers]
}
