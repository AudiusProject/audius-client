import { put, takeEvery } from 'redux-saga/effects'

import {
  SignInFailureMessage,
  SignUpValidateEmailFailureMessage,
  SignUpValidateEmailSuccessMessage,
  SignUpValidateHandleFailureMessage,
  SignUpValidateHandleSuccessMessage,
  SignUpSuccessMessage
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

function* watchSignupValidateHandle() {
  yield takeEvery([MessageType.SIGN_UP_VALIDATE_HANDLE], function* (action: {
    type: string
    handle: string
    onValidate?: (error: boolean) => void
  }) {
    yield put(signOnActions.validateHandle(action.handle, action.onValidate))
  })
}

function* watchSignupValidateHandleFailed() {
  yield takeEvery([signOnActions.VALIDATE_HANDLE_FAILED], function (action: {
    type: string
    error: string
  }) {
    const message = new SignUpValidateHandleFailureMessage({
      error: action.error
    })
    // console.log('HANDLE validation failed ' + action.error)
    message.send()
  })
}

function* watchSignupValidateHandleSuccess() {
  yield takeEvery([signOnActions.VALIDATE_HANDLE_SUCCEEDED], function (action: {
    type: string
  }) {
    const message = new SignUpValidateHandleSuccessMessage()
    // console.log('HANDLE: validation suceeded ')
    message.send()
  })
}

function* watchFetchAllFollowArtists() {
  yield takeEvery([MessageType.FETCH_ALL_FOLLOW_ARTISTS], function* (action: {
    type: string
  }) {
    yield put(signOnActions.fetchAllFollowArtists())
  })
}

function dataURLtoFile(fileType: string, dataurl: string, filename: string) {
  const arr = dataurl.split(',')
  const mime = fileType
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  console.log(filename)
  return new File([u8arr], filename, { type: mime })
}

function* watchSignUp() {
  yield takeEvery([MessageType.SUBMIT_SIGNUP], function* (action: {
    type: string
    username: string
    password: string
    name: string
    handle: string
    profileImage: any
  }) {
    // console.log('Signup: hello from client')
    const profileImageFile = dataURLtoFile(
      action.profileImage.fileType,
      'data:' + action.profileImage.file,
      action.profileImage.name
    )
    const profileImageReady = {
      height: action.profileImage.height,
      width: action.profileImage.width,
      name: action.profileImage.name,
      size: action.profileImage.size,
      fileType: action.profileImage.fileType,
      uri: action.profileImage.uri,
      file: profileImageFile
    }
    yield put(signOnActions.setValueField('email', action.username))
    yield put(signOnActions.setValueField('password', action.password))
    yield put(signOnActions.setValueField('name', action.name))
    yield put(signOnActions.setValueField('handle', action.handle))
    yield put(signOnActions.setField('profileImage', profileImageReady))
    yield put(
      signOnActions.signUpWithPhoto(
        action.username,
        action.password,
        action.handle,
        profileImageReady
      )
    )
  })
}

function* watchSignupSuccess() {
  yield takeEvery([signOnActions.SIGN_UP_SUCCEEDED_WITH_ID], function (action: {
    type: string
    userId: number | null
  }) {
    const message = new SignUpSuccessMessage({
      userId: action.userId
    })
    // console.log('SIGNUP: suceeded ')
    message.send()
  })
}

const sagas = () => {
  return [
    watchSignIn,
    watchSignInFailed,
    watchSignupValidateEmail,
    watchSignupValidateEmailFailed,
    watchSignupValidateEmailSuccess,
    watchSignupValidateHandle,
    watchSignupValidateHandleFailed,
    watchSignupValidateHandleSuccess,
    watchFetchAllFollowArtists,
    watchSignUp,
    watchSignupSuccess
  ]
}
export default sagas
