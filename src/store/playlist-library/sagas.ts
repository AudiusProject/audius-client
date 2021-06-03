import { all, call, put, select, takeEvery } from 'redux-saga/effects'
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
import { getResult } from 'store/confirmer/selectors'
import { updateProfileAsync } from 'containers/profile-page/store/sagas'
import { waitForValue } from 'utils/sagaHelpers'
import { makeKindId } from 'utils/uid'
import { Kind } from 'store/types'
import { ID } from 'models/common/Identifiers'
import * as cacheActions from 'store/cache/actions'

/**
 * Given a temp playlist, resolves it to a proper playlist
 * @param playlist
 * @returns a playlist library identifier
 */
function* resolveTempPlaylists(
  playlist: PlaylistLibraryIdentifier | PlaylistLibraryFolder
) {
  if (playlist.type === 'temp_playlist') {
    const { playlist_id }: { playlist_id: ID } = yield call(
      waitForValue,
      getResult,
      {
        uid: makeKindId(Kind.COLLECTIONS, playlist.playlist_id),
        index: 0
      },
      res => {
        return Object.keys(res).length > 0
      }
    )
    return {
      type: 'playlist',
      playlist_id
    }
  }
  return playlist
}

function* watchUpdatePlaylistLibrary() {
  yield takeEvery(update.type, function* updatePlaylistLibrary(
    action: ReturnType<typeof update>
  ) {
    const { playlistLibrary } = action.payload
    yield call(waitForBackendSetup)

    const account: User = yield select(getAccountUser)
    account.playlist_library = playlistLibrary

    // Deal with temp playlists
    // If there's a temp playlist, wait for it to get an actual id before we
    // move forward with writing the playlist library update to chain.
    const tempIds = playlistLibrary.contents
      .map(playlist =>
        playlist.type === 'temp_playlist' ? playlist.playlist_id : null
      )
      .filter(Boolean)
    if (tempIds.length > 0) {
      yield put(
        cacheActions.update(Kind.USERS, [
          {
            id: account.user_id,
            metadata: account
          }
        ])
      )
      // Map over playlist library contents and resolve each temp id playlist
      // to one with an actual id.
      // TODO: Support folders here.
      const newContents: (
        | PlaylistLibraryIdentifier
        | PlaylistLibraryFolder
      )[] = yield all(
        playlistLibrary.contents.map(playlist =>
          call(resolveTempPlaylists, playlist)
        )
      )
      playlistLibrary.contents = newContents
    }

    // Update playlist library on chain via an account profile update
    yield call(updateProfileAsync, { metadata: account })
  })
}

export function* addPlaylistsNotInLibrary() {
  let library: PlaylistLibrary = yield select(getPlaylistLibrary)
  if (!library) library = { contents: [] }
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
