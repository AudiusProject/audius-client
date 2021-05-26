import { call, put, select, takeEvery } from 'redux-saga/effects'
import { waitForBackendSetup } from 'store/backend/sagas'
import { update } from './slice'
import * as profileActions from 'containers/profile-page/store/actions'
import {
  getAccountNavigationPlaylists,
  getAccountUser,
  getPlaylistLibrary
} from 'store/account/selectors'
import User from 'models/User'
import {
  PlaylistIdentifier,
  PlaylistLibrary,
  PlaylistLibraryFolder,
  PlaylistLibraryIdentifier
} from 'models/PlaylistLibrary'
import { AccountCollection } from 'store/account/reducer'

function* watchUpdatePlaylistLibrary() {
  yield takeEvery(update.type, function* updatePlaylistLibrary(
    action: ReturnType<typeof update>
  ) {
    const { playlistLibrary } = action.payload
    yield call(waitForBackendSetup)

    const account: User = yield select(getAccountUser)
    // Update playlist library on current account and update profile
    account.playlist_library = playlistLibrary
    yield put(profileActions.updateProfile(account))
  })
}

export function* addPlaylistsNotInLibrary() {
  const library: PlaylistLibrary = yield select(getPlaylistLibrary)
  const playlists: { [id: number]: AccountCollection } = yield select(
    getAccountNavigationPlaylists
  )
  const notInLibrary = { ...playlists }
  library.contents.forEach(
    (identifier: PlaylistLibraryIdentifier | PlaylistLibraryFolder) => {
      if (identifier.type === 'playlist') {
        const playlist = playlists[identifier.playlist_id]
        if (playlist) {
          delete notInLibrary[identifier.playlist_id]
        }
      }
    }
  )
  if (Object.keys(notInLibrary).length > 0) {
    const newEntries = Object.values(notInLibrary).map(
      playlist =>
        ({
          playlist_id: playlist.id,
          type: 'playlist'
        } as PlaylistIdentifier)
    )
    const newContents = library.contents.concat(newEntries)
    yield put(
      update({ playlistLibrary: { ...library, contents: newContents } })
    )
  }
}

export default function sagas() {
  const sagas = [watchUpdatePlaylistLibrary]
  return sagas
}
