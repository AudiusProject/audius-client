import { put, takeEvery } from 'redux-saga/effects'

import {
  SignInFailureMessage,
  SignUpValidateEmailFailureMessage,
  SignUpValidateEmailSuccessMessage
} from 'services/native-mobile-interface/signon'
import { MessageType } from 'services/native-mobile-interface/types'

import * as signOnActions from './actions'

function* watchSignIn() {
  yield takeEvery([MessageType.SUBMIT_SIGNIN], function* (action: {
    type: string
    username: string
    password: string
  }) {
    // console.log('Signin: hello from client')
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

function* watchSignupValidateEmail() {
  yield takeEvery([MessageType.SIGN_UP_VALIDATE_EMAIL], function* (action: {
    type: string
    email: string
  }) {
    // console.log('SignUp validate email: hello from client')
    yield put(signOnActions.validateEmail(action.email))
  })
}

function* watchSignupValidateEmailFailed() {
  yield takeEvery([signOnActions.VALIDATE_EMAIL_FAILED], function (action: {
    type: string
    error: string
  }) {
    const message = new SignUpValidateEmailFailureMessage({
      error: action.error
    })
    // console.log('EMAIL validation failed ' + action.error)
    message.send()
  })
}

function* watchSignupValidateEmailSuccess() {
  yield takeEvery([signOnActions.VALIDATE_EMAIL_SUCCEEDED], function (action: {
    type: string
    available: boolean
  }) {
    const message = new SignUpValidateEmailSuccessMessage({
      available: action.available
    })
    // console.log('EMAIL: validation suceeded ' + action.available)
    message.send()
  })
}

const sagas = () => {
  return [
    watchSignIn,
    watchSignInFailed,
    watchSignupValidateEmail,
    watchSignupValidateEmailFailed,
    watchSignupValidateEmailSuccess
  ]
}
export default sagas
