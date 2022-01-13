import { takeEvery, put, call, takeLatest } from 'redux-saga/effects'

import {
  fetchCognitoFlowUrl,
  fetchCognitoFlowUrlFailed,
  fetchCognitoFlowUrlSucceeded,
  updateHCaptchaScore
} from 'common/store/pages/audio-rewards/slice'
import { getCognitoFlow } from 'services/audius-backend/Cognito'
import { MessageType } from 'services/native-mobile-interface/types'
function* watchUpdateHCaptchaScore() {
  yield takeEvery(MessageType.UPDATE_HCAPTCHA_SCORE, function* (action: {
    type: string
    token: string
  }) {
    yield put(updateHCaptchaScore({ token: action.token }))
  })
}

function* fetchCognitoFlowUriAsync() {
  const { shareable_url } = yield call(getCognitoFlow)
  if (shareable_url) {
    yield put(fetchCognitoFlowUrlSucceeded(shareable_url))
  } else {
    yield put(fetchCognitoFlowUrlFailed())
  }
}

function* watchFetchCognitoFlowUrl() {
  yield takeLatest(fetchCognitoFlowUrl.type, fetchCognitoFlowUriAsync)
}

const sagas = () => {
  return [watchUpdateHCaptchaScore, watchFetchCognitoFlowUrl]
}

export default sagas
