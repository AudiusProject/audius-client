import { call, put, select, takeLatest } from 'typed-redux-saga'

import { accountSelectors } from 'store/account'
import { getContext } from 'store/index'

import { fetchTrackCount, setTrackCount } from './slice'
const { getUserId, getUserHandle } = accountSelectors

function* handleFetchTrackCount() {
  const currentUserId = yield* select(getUserId)
  const handle = yield* select(getUserHandle)
  const apiClient = yield* getContext('apiClient')

  console.log('FetchOwnProfileSaga - running')
  if (!currentUserId || !handle) return

  try {
    const tracks = yield* call([apiClient, apiClient.getUserTracksByHandle], {
      handle,
      currentUserId,
      getUnlisted: true
    })

    yield* put(setTrackCount(tracks.length))
  } catch (e) {
    console.log('failed to fetch own user tracks')
  }
}

export function* watchFetchTrackCount() {
  console.log('FetchOwnProfileSaga - listening')
  yield* takeLatest(fetchTrackCount, handleFetchTrackCount)
}

export default function sagas() {
  console.log('FetchOwnProfileSaga - registered')
  return [watchFetchTrackCount]
}
