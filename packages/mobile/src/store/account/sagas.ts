import type { User } from '@audius/common'
import {
  accountActions,
  getContext,
  removeNullable,
  SquareSizes,
  WidthSizes
} from '@audius/common'
import accountSagas from 'common/store/account/sagas'
import { updateProfileAsync } from 'common/store/profile/sagas'
import FastImage from 'react-native-fast-image'
import { takeEvery, call } from 'typed-redux-saga'

import { IS_MOBILE_USER } from 'app/constants/storage-keys'
import { getImageSourceOptimistic } from 'app/hooks/useContentNodeImage'
const { signedIn } = accountActions

/**
 * Prefetch and cache the profile and cover photos so they are available offline
 */
function* cacheUserImages(user: User) {
  try {
    const { profile_picture_sizes, cover_photo_sizes } = user

    const profileImageUri = getImageSourceOptimistic({
      cid: profile_picture_sizes,
      user,
      size: SquareSizes.SIZE_150_BY_150
    })?.uri

    const coverPhotoUri = getImageSourceOptimistic({
      cid: cover_photo_sizes,
      user,
      size: WidthSizes.SIZE_640
    })?.uri

    const sourcesToPreload = [profileImageUri, coverPhotoUri]
      .filter(removeNullable)
      .map((uri) => ({ uri }))

    console.log('calling preload!', sourcesToPreload)
    yield* call(FastImage.preload, sourcesToPreload)
  } catch (e) {
    console.error('Could not cache profile images', e)
  }
}

// When successfully signed in
function* onSignedIn({ payload: { account } }: ReturnType<typeof signedIn>) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const localStorage = yield* getContext('localStorage')
  const isMobileUser = yield* call(localStorage.getItem, IS_MOBILE_USER)

  yield* call(cacheUserImages, account)

  if (!isMobileUser || isMobileUser !== 'true') {
    try {
      // Legacy method to update whether a user has signed in on
      // native mobile. Used in identity service for notification indexing
      yield* call(audiusBackendInstance.updateUserEvent, {
        hasSignedInNativeMobile: true
      })
      // Updates the user metadata with an event `is_mobile_user` set to true
      // if the account is being fetched from a mobile context
      yield* call(updateProfileAsync, {
        metadata: { ...account, events: { is_mobile_user: true } }
      })

      yield* call(localStorage.setItem, IS_MOBILE_USER, 'true')
    } catch (e) {
      console.error(e)
      // Do nothing. A retry on the next session will suffice.
    }
  }
}

function* watchSignedIn() {
  yield* takeEvery(signedIn.type, onSignedIn)
}

const sagas = () => {
  return [...accountSagas(), watchSignedIn]
}

export default sagas
