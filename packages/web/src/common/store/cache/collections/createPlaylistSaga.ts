import {
  cacheCollectionsActions,
  cacheTracksSelectors,
  getContext
} from '@audius/common'
import { call, select, takeLatest } from 'typed-redux-saga'

import { ensureLoggedIn } from 'common/utils/ensureLoggedIn'
import { waitForWrite } from 'utils/sagaHelpers'

const { getTrack } = cacheTracksSelectors

export function* watchCreatePlaylistSaga() {
  yield* takeLatest(
    cacheCollectionsActions.CREATE_PLAYLIST,
    createPlaylistWorker
  )
}

function* createPlaylistWorker(
  action: ReturnType<typeof cacheCollectionsActions.createPlaylist>
) {
  yield* waitForWrite()
  const { initTrackId, formFields } = action
  const userId = yield* ensureLoggedIn()

  if (initTrackId) {
    const track = yield* select(getTrack, { id: action.initTrackId })
    if (track) {
      formFields._cover_art_sizes = track._cover_art_sizes
      formFields.cover_art_sizes = track.cover_art_sizes
    }
  }

  const { audiusLibs } = yield* getContext('audiusBackendInstance')
  if (!audiusLibs.discoveryProvider) return

  const unclaimedId = yield* call(
    [audiusLibs.discoveryProvider, audiusLibs.discoveryProvider.getUnclaimedId],
    'playlists'
  )
}
