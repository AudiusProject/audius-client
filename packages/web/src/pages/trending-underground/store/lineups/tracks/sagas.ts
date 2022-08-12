import { Track, UserTrackMetadata, StringKeys } from '@audius/common'
import { call, select } from 'redux-saga/effects'

import { getContext } from 'common/store'
import { getUserId } from 'common/store/account/selectors'
import { processAndCacheTracks } from 'common/store/cache/tracks/utils'
import {
  PREFIX,
  trendingUndergroundLineupActions
} from 'common/store/pages/trending-underground/lineup/actions'
import { getLineup } from 'common/store/pages/trending-underground/lineup/selectors'
import { LineupSagas } from 'store/lineup/sagas'

function* getTrendingUnderground({
  limit,
  offset
}: {
  limit: number
  offset: number
}) {
  const apiClient = yield* getContext('apiClient')
  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  yield call(remoteConfigInstance.waitForRemoteConfig)
  const TF = new Set(
    remoteConfigInstance.getRemoteVar(StringKeys.UTF)?.split(',') ?? []
  )

  const currentUserId: ReturnType<typeof getUserId> = yield select(getUserId)
  let tracks: UserTrackMetadata[] = yield call(
    (args) => apiClient.getTrendingUnderground(args),
    {
      currentUserId,
      limit,
      offset
    }
  )
  if (TF.size > 0) {
    tracks = tracks.filter((t) => {
      const shaId = window.Web3.utils.sha3(t.track_id.toString())
      return !TF.has(shaId)
    })
  }

  const processed: Track[] = yield processAndCacheTracks(tracks)
  return processed
}

class UndergroundTrendingSagas extends LineupSagas {
  constructor() {
    super(
      PREFIX,
      trendingUndergroundLineupActions,
      getLineup,
      getTrendingUnderground
    )
  }
}

const sagas = () => new UndergroundTrendingSagas().getSagas()
export default sagas
