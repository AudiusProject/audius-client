import { takeEvery, put, call, select } from 'redux-saga/effects'

import User from 'models/User'
import { getAccountUser } from 'store/account/selectors'

import * as actions from './actions'

function* handleShare(action: ReturnType<typeof actions.share>) {
  const { creator_node_endpoint }: User = yield select(getAccountUser)

  const track: Blob = yield call(
    window.audiusLibs.File.fetchCID,
    action.cid,
    [`${creator_node_endpoint}/ipfs/`],
    (a: any) => {
      console.log('in callback', a)
    }
  )
}

function* watchHandleShare() {
  yield takeEvery(actions.share, handleShare)
}

export default function sagas() {
  return [watchHandleShare]
}
