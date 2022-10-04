import type { Nullable, User, CommonState } from '@audius/common'
import {
  Status,
  useProxySelector,
  accountSelectors,
  profilePageSelectors
} from '@audius/common'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

import { useRoute } from 'app/hooks/useRoute'
const { getProfileUser, getProfileStatus, makeGetProfile, getProfileUserId } =
  profilePageSelectors
const { getAccountUser, getUserId } = accountSelectors

/*
 * Selects profile user and ensures rerenders occur only for changes specified in deps
 */
export const useSelectProfileRoot = <K extends keyof User>(deps: K[]) => {
  const { params } = useRoute<'Profile'>()
  const { handle } = params
  const isAccountUser = handle === 'accountUser'

  const profile = useProxySelector(
    (state) => {
      const profile = isAccountUser
        ? getAccountUser(state)
        : getProfileUser(state, params)
      if (!profile) return null

      const profileSlice = {} as Partial<User>
      deps.forEach((dep) => {
        profileSlice[dep] = profile[dep]
      })

      return profileSlice
    },
    [isAccountUser, ...deps]
  )
  return profile as Nullable<Pick<User, K>>
}

/*
 * Assumes existance of user for convenience. To only be used for inner
 * components that wouldn't render if user wasn't present
 */
export const useSelectProfile = <K extends keyof User>(deps: K[]) => {
  return useSelectProfileRoot(deps) as Pick<User, K>
}

export const getProfile = makeGetProfile()

export const getIsOwner = createSelector(
  (state: CommonState, handle: string) => getProfileUserId(state, handle),
  getUserId,
  (profileUserId, accountUserId) => accountUserId === profileUserId
)

export const useIsProfileLoaded = () => {
  const { params } = useRoute<'Profile'>()
  const { handle } = params
  const profileStatus = useSelector((state) =>
    getProfileStatus(state, handle.toLowerCase())
  )

  return handle === 'accountUser' || profileStatus === Status.SUCCESS
}
