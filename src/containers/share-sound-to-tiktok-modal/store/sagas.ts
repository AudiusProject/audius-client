import { takeEvery, put, call, select } from 'redux-saga/effects'

import { show as showConfetti } from 'containers/music-confetti/store/slice'
import User from 'models/User'
import { getAccountUser } from 'store/account/selectors'
import { setVisibility } from 'store/application/ui/modals/slice'
import { getTrack } from 'store/cache/tracks/selectors'
import { AppState } from 'store/types'
import { getCreatorNodeIPFSGateways } from 'utils/gatewayUtil'

import { getIsAuthenticated } from './selectors'
import {
  authenticated,
  open,
  requestOpen,
  setIsAuthenticated,
  setStatus,
  share,
  upload
} from './slice'
import { Status } from './types'

const TIKTOK_SHARE_SOUND_ENDPOINT =
  'https://open-api.tiktok.com/share/sound/upload/'

// Because the track blob cannot live in an action (not a POJO),
// we are creating a singleton here to store it
let track: Blob | null = null

function* handleRequestOpen(action: ReturnType<typeof requestOpen>) {
  const track = yield select((state: AppState) =>
    getTrack(state, { id: action.payload.id })
  )

  yield put(
    open({
      track: {
        id: track.track_id,
        title: track.title,
        cid: track.download.cid,
        duration: track.duration
      }
    })
  )
  yield put(setVisibility({ modal: 'ShareSoundToTikTok', visible: true }))
}

function* handleShare(action: ReturnType<typeof share>) {
  yield put(setStatus({ status: Status.SHARE_STARTED }))

  // Fetch the track blob
  const { creator_node_endpoint }: User = yield select(getAccountUser)

  try {
    const { data } = yield call(
      window.audiusLibs.File.fetchCID,
      action.payload.cid,
      getCreatorNodeIPFSGateways(creator_node_endpoint),
      () => {}
    )
    track = data

    // If already authed with TikTok, start the upload
    const authenticated = yield select(getIsAuthenticated)
    if (authenticated) {
      yield put(upload())
    }
  } catch (e) {
    console.log(e)
    yield put(setStatus({ status: Status.SHARE_ERROR }))
  }
}

function* handleAuthenticated(action: ReturnType<typeof authenticated>) {
  yield put(setIsAuthenticated())

  // If track blob already downloaded, start the upload
  if (track) {
    yield put(upload())
  }
}

function* handleUpload(action: ReturnType<typeof upload>) {
  // Upload the track blob to TikTok api
  const formData = new FormData()
  formData.append('sound_file', track as Blob)

  const openId = window.localStorage.getItem('tikTokOpenId')
  const accessToken = window.localStorage.getItem('tikTokAccessToken')

  try {
    const response = yield call(
      window.fetch,
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

    yield put(setStatus({ status: Status.SHARE_SUCCESS }))
    yield put(showConfetti())
  } catch (e) {
    console.log(e)
    yield put(setStatus({ status: Status.SHARE_ERROR }))
  } finally {
    track = null
  }
}

function* watchHandleRequestOpen() {
  yield takeEvery(requestOpen, handleRequestOpen)
}

function* watchHandleShare() {
  yield takeEvery(share, handleShare)
}

function* watchHandleAuthenticated() {
  yield takeEvery(authenticated, handleAuthenticated)
}

function* watchHandleUpload() {
  yield takeEvery(upload, handleUpload)
}

export default function sagas() {
  return [
    watchHandleRequestOpen,
    watchHandleShare,
    watchHandleAuthenticated,
    watchHandleUpload
  ]
}
