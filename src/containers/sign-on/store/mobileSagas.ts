import { call, put, takeEvery } from 'redux-saga/effects'

import { SignInFailureMessage } from 'services/native-mobile-interface/signon'
import { MessageType } from 'services/native-mobile-interface/types'

import * as signOnActions from './actions'

function* watchSignIn() {
  yield takeEvery([MessageType.SUBMIT_SIGNIN], function* (action: {
    type: string
    username: string
    password: string
  }) {
    console.log('Signin: hello from client')
    // const message = new SubmitSignInMessage
    // message.send()
    yield put(signOnActions.setValueField('email', action.username))
    yield put(signOnActions.setValueField('password', action.password))
    yield put(signOnActions.signIn(action.username, action.password))
  })
}

function* watchSignInFailed() {
  yield takeEvery([signOnActions.SIGN_IN_FAILED], function (action: {
    type: string
    error: string
  }) {
    const message = new SignInFailureMessage({
      error: action.error
    })
    message.send()
  })
}

const sagas = () => {
  return [watchSignIn, watchSignInFailed]
}
export default sagas
