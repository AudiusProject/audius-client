import { PayloadAction } from '@reduxjs/toolkit'
import { shuffle } from 'lodash'
import { put, select, takeEvery } from 'typed-redux-saga'

import { ID, User } from 'models'
import { DoubleKeys } from 'services/remote-config'
import { accountSelectors } from 'store/account'
import { processAndCacheUsers } from 'store/cache'
import { getContext } from 'store/effects'
import { waitForRead } from 'utils/sagaHelpers'
import { removeNullable } from 'utils/typeUtils'

import { actions as relatedArtistsActions } from './slice'

const getUserId = accountSelectors.getUserId

export function* fetchRelatedArtists(action: PayloadAction<{ artistId: ID }>) {
  yield* waitForRead()
  const apiClient = yield* getContext('apiClient')
  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  if (relatedArtistsActions.fetchRelatedArtists.match(action)) {
    const artistId = action.payload.artistId

    const currentUserId: ID | null = yield* select(getUserId)
    const relatedArtists: User[] = yield apiClient.getRelatedArtists({
      userId: artistId,
      currentUserId,
      limit: 50
    })

    let showingTopArtists = false
    let filteredArtists = relatedArtists
      .filter((user) => !user.does_current_user_follow && !user.is_deactivated)
      .slice(0, 5)
    if (filteredArtists.length === 0) {
      const showTopArtistRecommendationsPercent =
        remoteConfigInstance.getRemoteVar(
          DoubleKeys.SHOW_ARTIST_RECOMMENDATIONS_FALLBACK_PERCENT
        ) || 0
      const showTopArtists = Math.random() < showTopArtistRecommendationsPercent

      if (showTopArtists) {
        filteredArtists = yield fetchTopArtists()
        showingTopArtists = true
      }
    }
    if (filteredArtists.length > 0) {
      const relatedArtistIds: ID[] = yield* cacheUsers(filteredArtists)
      yield* put(
        relatedArtistsActions.fetchRelatedArtistsSucceeded({
          artistId,
          relatedArtistIds,
          isTopArtistsRecommendation: showingTopArtists
        })
      )
    }
  }
}

function* fetchTopArtists() {
  yield* waitForRead()
  const apiClient = yield* getContext('apiClient')
  const currentUserId: ID | null = yield* select(getUserId)
  const topArtists: User[] = yield apiClient.getTopArtists({
    currentUserId,
    limit: 50
  })
  const filteredArtists = topArtists.filter(
    (user) => !user.does_current_user_follow && !user.is_deactivated
  )
  if (filteredArtists.length > 0) {
    // Pick 5 at random
    const selectedArtists = shuffle(filteredArtists).slice(0, 5)
    return selectedArtists
  }
  return []
}

function* cacheUsers(users: User[]) {
  yield* waitForRead()
  const currentUserId: ID | null = yield* select(getUserId)
  // Filter out the current user from the list to cache
  yield processAndCacheUsers(
    users.filter((user) => user.user_id !== currentUserId)
  )
  return users.map((f) => f.user_id).filter(removeNullable)
}

function* watchFetchRelatedArtists() {
  yield* takeEvery(
    relatedArtistsActions.fetchRelatedArtists,
    fetchRelatedArtists
  )
}

export default function sagas() {
  return [watchFetchRelatedArtists]
}
