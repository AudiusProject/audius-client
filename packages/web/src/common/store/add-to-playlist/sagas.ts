import {
  accountActions,
  modalsActions,
  addToPlaylistUIActions as actions
} from '@audius/common'
import { takeEvery, put } from 'redux-saga/effects'

import { requiresAccount } from 'common/utils/requiresAccount'
const { setVisibility } = modalsActions
const fetchSavedPlaylists = accountActions.fetchSavedPlaylists

function* handleRequestOpen(action: ReturnType<typeof actions.requestOpen>) {
  yield put(fetchSavedPlaylists())
  yield put(actions.open(action.trackId, action.trackTitle, action.isUnlisted))
  yield put(setVisibility({ modal: 'AddToPlaylist', visible: true }))
}

function* watchHandleRequestOpen() {
  yield takeEvery(actions.REQUEST_OPEN, requiresAccount(handleRequestOpen))
}

export default function sagas() {
  return [watchHandleRequestOpen]
}
