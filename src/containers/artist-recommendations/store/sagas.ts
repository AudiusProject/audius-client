import { Action } from '@reduxjs/toolkit'
import { SagaIterator } from 'redux-saga'
import { call, put, select, takeEvery } from 'redux-saga/effects'

import User from 'models/User'
import { ID } from 'models/common/Identifiers'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { getUserId } from 'store/account/selectors'
import { processAndCacheUsers } from 'store/cache/users/utils'

import * as artistRecommendationsActions from './slice'

export function* fetchRelatedArtists(action: Action) {
  if (artistRecommendationsActions.fetchRelatedArtists.match(action)) {
    const userId = action.payload.userId
    const currentUserId: ID = yield select(getUserId)
    const relatedArtists: User[] = yield apiClient.getRelatedArtists({
      userId,
      currentUserId
    })

    let filteredArtists = relatedArtists
      .filter(user => !user.does_current_user_follow)
      .slice(0, 5)

    if (filteredArtists.length === 0) {
      const topArtists: User[] = yield apiClient.getTopArtists({
        currentUserId
      })
      filteredArtists = topArtists
        .filter(user => !user.does_current_user_follow)
        .slice(0, 5)
    }
    const relatedArtistIds: ID[] = yield call(cacheUsers, filteredArtists)
    yield put(
      artistRecommendationsActions.fetchRelatedArtistsSucceeded({
        userId,
        relatedArtistIds
      })
    )
  }
}

function* cacheUsers(users: User[]) {
  const currentUserId: ID = yield select(getUserId)
  // Filter out the current user from the list to cache
  yield processAndCacheUsers(
    users.filter(user => user.user_id !== currentUserId)
  )
  return users.map(f => f.user_id)
}

function* watchFetchRelatedArtists() {
  yield takeEvery(
    artistRecommendationsActions.fetchRelatedArtists,
    fetchRelatedArtists
  )
}

export default function sagas() {
  return [watchFetchRelatedArtists]
}
