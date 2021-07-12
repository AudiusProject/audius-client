import { takeEvery, put, call, select } from 'redux-saga/effects'

import User from 'models/User'
import { getAccountUser } from 'store/account/selectors'

import * as actions from './actions'
import { Status } from './reducer'
import { getIsAuthenticated } from './selectors'

const TIKTOK_SHARE_SOUND_ENDPOINT =
  'https://open-api.tiktok.com/share/sound/upload/'

// Because the track blob cannot live in an action (not a POJO),
// we are creating a singleton here to store it
let track: Blob | null = null

function* handleShare(action: ReturnType<typeof actions.share>) {
  yield put(actions.setStatus(Status.SHARE_STARTED))

  // Fetch the track blob
  const { creator_node_endpoint }: User = yield select(getAccountUser)

  try {
    const { data } = yield call(
      window.audiusLibs.File.fetchCID,
      action.cid,
      [`${creator_node_endpoint}/ipfs/`],
      () => {}
    )
    track = data

    // If already authed with TikTok, start the upload
    const authenticated = yield select(getIsAuthenticated)
    if (authenticated) {
      yield put(actions.upload())
    }
  } catch (e) {
    console.log(e)
    yield put(actions.setStatus(Status.SHARE_ERROR))
  }
}

function* handleAuthenticated(
  action: ReturnType<typeof actions.authenticated>
) {
  yield put(actions.setIsAuthenticated())

  // If track blob already downloaded, start the upload
  if (track) {
    yield put(actions.upload())
  }
}

function* handleUpload(action: ReturnType<typeof actions.upload>) {
  // Upload the track blob to TikTok api
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

    if (!response.ok) {
      throw new Error('TikTok Share sound request unsuccessful')
    }

    yield put(actions.setStatus(Status.SHARE_SUCCESS))
  } catch (e) {
    console.log(e)
    yield put(actions.setStatus(Status.SHARE_ERROR))
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
