import { relatedArtistsUserListActions } from '@audius/common'
import { put, takeEvery } from 'redux-saga/effects'

import * as errorActions from 'store/errors/actions'
const { GET_RELATED_ARTISTS_ERROR, getRelatedArtistsError } =
  relatedArtistsUserListActions

type handleRelatedArtistsError = ReturnType<typeof getRelatedArtistsError>

export function* handleFollowersError(action: handleRelatedArtistsError) {
  yield put(
    errorActions.handleError({
      message: action.type,
      shouldRedirect: true,
      shouldReport: true,
      additionalInfo: {
        errorMessage: action.error,
        id: action.id
      }
    })
  )
}

export function* watchRelatedArtistsError() {
  yield takeEvery([GET_RELATED_ARTISTS_ERROR], handleFollowersError)
}
