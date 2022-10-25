import {
  StringKeys,
  accountSelectors,
  trendingUndergroundPageLineupSelectors,
  trendingUndergroundPageLineupActions,
  getContext
} from '@audius/common'
import { call, select } from 'typed-redux-saga'

import { processAndCacheTracks } from 'common/store/cache/tracks/utils'
import { LineupSagas } from 'common/store/lineup/sagas'
import { waitForBackendAndAccount } from 'utils/sagaHelpers'

const { getLineup } = trendingUndergroundPageLineupSelectors
const getUserId = accountSelectors.getUserId

function* getTrendingUnderground({
  limit,
  offset
}: {
  limit: number
  offset: number
}) {
  yield* waitForBackendAndAccount()
  const apiClient = yield* getContext('apiClient')
  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const web3 = yield* call(audiusBackendInstance.getWeb3)

  yield call(remoteConfigInstance.waitForRemoteConfig)

  const TF = new Set(
    remoteConfigInstance.getRemoteVar(StringKeys.UTF)?.split(',') ?? []
  )

  const currentUserId = yield* select(getUserId)

  let tracks = yield* call((args) => apiClient.getTrendingUnderground(args), {
    currentUserId,
    limit,
    offset
  })

  if (TF.size > 0) {
    tracks = tracks.filter((t) => {
      const shaId = web3.utils.sha3(t.track_id.toString())
      return !TF.has(shaId)
    })
  }

  const processed = yield* processAndCacheTracks(tracks)
  return processed
}

class UndergroundTrendingSagas extends LineupSagas {
  constructor() {
    super(
      trendingUndergroundPageLineupActions.prefix,
      trendingUndergroundPageLineupActions,
      getLineup,
      getTrendingUnderground
    )
  }
}

const sagas = () => new UndergroundTrendingSagas().getSagas()
export default sagas
