import {
  accountSelectors,
  remixesPageLineupActions as tracksActions,
  remixesPageActions,
  remixesPageSelectors,
  getContext,
  waitForAccount
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

import { processAndCacheTracks } from 'common/store/cache/tracks/utils'
import { LineupSagas } from 'store/lineup/sagas'
import { AppState } from 'store/types'
const { getTrackId, getLineup } = remixesPageSelectors
const { setCount } = remixesPageActions
const getUserId = accountSelectors.getUserId

function* getTracks({
  offset,
  limit,
  payload
}: {
  offset: number
  limit: number
  payload: { trackId: number | null }
}) {
  const apiClient = yield* getContext('apiClient')
  const { trackId } = payload
  if (!trackId) return []

  yield* waitForAccount()
  const currentUserId = yield* select(getUserId)
  const { tracks, count } = yield* call([apiClient, 'getRemixes'], {
    trackId,
    offset,
    limit,
    currentUserId
  })

  yield* put(setCount({ count }))

  const processedTracks = yield* call(processAndCacheTracks, tracks)

  return processedTracks
}

const sourceSelector = (state: AppState) =>
  `${tracksActions.prefix}:${getTrackId(state)}`

class TracksSagas extends LineupSagas {
  constructor() {
    super(
      tracksActions.prefix,
      tracksActions,
      getLineup,
      getTracks,
      undefined,
      undefined,
      sourceSelector
    )
  }
}

export default function sagas() {
  return new TracksSagas().getSagas()
}
