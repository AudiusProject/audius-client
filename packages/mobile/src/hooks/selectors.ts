import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import { getProfileUser } from 'audius-client/src/common/store/pages/profile/selectors'
import { isEmpty } from 'lodash'

import { useSelectorWeb } from './useSelectorWeb'

export const useProfile = () => {
  return useSelectorWeb(
    getProfileUser,
    (a, b) =>
      a?.user_id === b?.user_id &&
      isEmpty(a?._cover_photo_sizes) === isEmpty(b?._cover_photo_sizes) &&
      isEmpty(a?._profile_picture_sizes) === isEmpty(b?._profile_picture_sizes)
  )
}

export const useAccountUser = () => {
  return useSelectorWeb(getAccountUser, (a, b) => a?.user_id === b?.user_id)
}
