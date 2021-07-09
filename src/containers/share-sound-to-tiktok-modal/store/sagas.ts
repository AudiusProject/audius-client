import { takeEvery, put, call, select } from 'redux-saga/effects'

import User from 'models/User'
import { getAccountUser } from 'store/account/selectors'

import * as actions from './actions'
import { getIsAuthenticated } from './selectors'

const TIKTOK_SHARE_SOUND_ENDPOINT =
  'https://open-api.tiktok.com/share/sound/upload/'
let track: Blob | null = null

function* handleShare(action: ReturnType<typeof actions.share>) {
  yield put(actions.downloadStarted())

  const { creator_node_endpoint }: User = yield select(getAccountUser)

  const { data } = yield call(
    window.audiusLibs.File.fetchCID,
    action.cid,
    [`${creator_node_endpoint}/ipfs/`],
    () => {}
  )
  track = data

  const authenticated = yield select(getIsAuthenticated)
  if (authenticated) {
    yield put(actions.upload())
  }
}

function* handleAuthenticated(
  action: ReturnType<typeof actions.authenticated>
) {
  yield put(actions.setIsAuthenticated())
  if (track) {
    yield put(actions.upload())
  }
}

function* handleUpload(action: ReturnType<typeof actions.upload>) {
  const formData = new FormData()

  formData.append('sound_file', track as Blob)
  const openId = window.localStorage.getItem('tikTokOpenId')
  const accessToken = window.localStorage.getItem('tikTokAccessToken')

  try {
    const response = yield window.fetch(
      `${TIKTOK_SHARE_SOUND_ENDPOINT}?open_id=${openId}&access_token=${accessToken}`,
      {
        method: 'POST',
        mode: 'cors',
        body: formData
      }
    )
    yield put(actions.uploadSuccess())
  } catch (e) {
    console.log(e)
    // handle error
  } finally {
    track = null
  }
}

function* watchHandleShare() {
  yield takeEvery(actions.share, handleShare)
}

function* watchHandleAuthenticated() {
  yield takeEvery(actions.authenticated, handleAuthenticated)
}

function* watchHandleUpload() {
  yield takeEvery(actions.upload, handleUpload)
}

export default function sagas() {
  return [watchHandleShare, watchHandleAuthenticated, watchHandleUpload]
}
