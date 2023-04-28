import { accountSelectors, getContext } from '@audius/common'
import { call, put, select, takeLatest } from 'typed-redux-saga/dist'

import { fetchTrackCount, setTrackCount } from './slice'
const { getUserId, getUserHandle } = accountSelectors

function* handleFetchTrackCount() {
  const currentUserId = yield* select(getUserId)
  const handle = yield* select(getUserHandle)
  const apiClient = yield* getContext('apiClient')

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
  yield* takeLatest(fetchTrackCount, handleFetchTrackCount)
}

export default function sagas() {
  return [watchFetchTrackCount]
}
