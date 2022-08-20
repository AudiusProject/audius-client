import type { WidthSizes } from '@audius/common'
import { cacheUsersActions } from '@audius/common'
const { fetchCoverPhoto } = cacheUsersActions

import imageCoverPhotoBlank from 'app/assets/images/imageCoverPhotoBlank.jpg'
import { getUseImageSizeHook } from 'app/hooks/useImageSize'

export const useUserCoverPhoto = getUseImageSizeHook<WidthSizes>({
  defaultImageSource: imageCoverPhotoBlank,
  action: fetchCoverPhoto
})
