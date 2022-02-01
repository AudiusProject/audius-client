import { useDispatch } from 'react-redux'

import imageCoverPhotoBlank from 'common/assets/image/imageCoverPhotoBlank.jpg'
import { useImageSize } from 'common/hooks/useImageSize'
import { CoverPhotoSizes, WidthSizes } from 'common/models/ImageSizes'
import { fetchCoverPhoto } from 'common/store/cache/users/actions'

export const useUserCoverPhoto = (
  userId: number | null,
  coverPhotoSizes: CoverPhotoSizes | null,
  size: WidthSizes,
  defaultImage: string = imageCoverPhotoBlank as string,
  onDemand = false,
  load = true
) => {
  const dispatch = useDispatch()

  return useImageSize({
    dispatch,
    id: userId,
    sizes: coverPhotoSizes,
    size,
    action: fetchCoverPhoto,
    defaultImage,
    onDemand,
    load
  })
}
