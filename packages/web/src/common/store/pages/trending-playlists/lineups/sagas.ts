import {
  UserCollectionMetadata,
  StringKeys,
  accountSelectors,
  trendingPlaylistsPageLineupSelectors,
  trendingPlaylistsPageLineupActions,
  getContext
} from '@audius/common'
import { call, select } from 'typed-redux-saga'

import { processAndCacheCollections } from 'common/store/cache/collections/utils'
import { LineupSagas } from 'common/store/lineup/sagas'
import { waitForBackendAndAccount } from 'utils/sagaHelpers'
const { getLineup } = trendingPlaylistsPageLineupSelectors
const getUserId = accountSelectors.getUserId

function* getPlaylists({ limit, offset }: { limit: number; offset: number }) {
  yield* waitForBackendAndAccount()
  const apiClient = yield* getContext('apiClient')
  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const web3 = yield* call(audiusBackendInstance.getWeb3)

  yield* call(remoteConfigInstance.waitForRemoteConfig)

  const TF = new Set(
    remoteConfigInstance.getRemoteVar(StringKeys.TPF)?.split(',') ?? []
  )

  const time = 'week' as const

  const currentUserId = yield* select(getUserId)

  let playlists: UserCollectionMetadata[] = yield* call(
    (args) => apiClient.getTrendingPlaylists(args),
    {
      currentUserId,
      limit,
      offset,
      time
    }
  )

  if (TF.size > 0) {
    playlists = playlists.filter((p) => {
      const shaId = web3.utils.sha3(p.playlist_id.toString())
      return !TF.has(shaId)
    })
  }

  // Omit playlists owned by Audius
  const userIdsToOmit = new Set(
    (
      remoteConfigInstance.getRemoteVar(
        StringKeys.TRENDING_PLAYLIST_OMITTED_USER_IDS
      ) || ''
    ).split(',')
  )
  const trendingPlaylists = playlists.filter(
    (playlist) => !userIdsToOmit.has(`${playlist.playlist_owner_id}`)
  )

  const processed = yield* processAndCacheCollections(trendingPlaylists, false)

  return processed
}

class TrendingPlaylistSagas extends LineupSagas {
  constructor() {
    super(
      trendingPlaylistsPageLineupActions.prefix,
      trendingPlaylistsPageLineupActions,
      getLineup,
      getPlaylists
    )
  }
}

const sagas = () => new TrendingPlaylistSagas().getSagas()
export default sagas
