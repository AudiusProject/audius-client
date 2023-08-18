import {
  ProfilePictureSizes,
  SquareSizes,
  useImageSize,
  cacheUsersActions,
  imageProfilePicEmpty as profilePicEmpty,
  cacheUsersSelectors
} from '@audius/common'
import { useDispatch } from 'react-redux'

import { useSelector } from 'utils/reducer'

const { fetchProfilePicture } = cacheUsersActions
const { getUser } = cacheUsersSelectors

export const useUserProfilePicture = (
  userId: number | null,
  profilePictureSizes: ProfilePictureSizes | null,
  size: SquareSizes,
  defaultImage: string = profilePicEmpty as string,
  load = true
) => {
  const dispatch = useDispatch()
  return useImageSize({
    dispatch,
    id: userId,
    sizes: profilePictureSizes,
    size,
    action: fetchProfilePicture,
    defaultImage,
    load
  })
}

export const useUserProfilePicture2 = (
  userId: number | null,
  size: SquareSizes,
  defaultImage: string = profilePicEmpty as string,
  load = true
) => {
  const dispatch = useDispatch()
  const profilePictureSizes = useSelector(
    (state) => getUser(state, { id: userId })?._profile_picture_sizes
  )
  return useImageSize({
    dispatch,
    id: userId,
    sizes: profilePictureSizes ?? null,
    size,
    action: fetchProfilePicture,
    defaultImage,
    load
  })
}

/**
 * Like useUserProfilePicture, but onDemand is set to true, which
 * returns a callback that can be used to fetch the image on demand.
 */
export const useOnUserProfilePicture = (
  userId: number | null,
  profilePictureSizes: ProfilePictureSizes | null,
  size: SquareSizes,
  defaultImage: string = profilePicEmpty as string,
  load = true
) => {
  const dispatch = useDispatch()
  return useImageSize({
    dispatch,
    id: userId,
    sizes: profilePictureSizes,
    size,
    action: fetchProfilePicture,
    defaultImage,
    load,
    onDemand: true
  })
}
