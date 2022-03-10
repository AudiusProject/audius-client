import { User } from 'audius-client/src/common/models/User'
import {
  getAccountUser,
  getUserId
} from 'audius-client/src/common/store/account/selectors'
import { makeGetLineupMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import {
  getProfileFeedLineup,
  getProfileTracksLineup,
  getProfileUser,
  getProfileUserId,
  makeGetProfile
} from 'audius-client/src/common/store/pages/profile/selectors'
import { isEqual } from 'lodash'
import { createSelector } from 'reselect'

import { useRoute } from 'app/hooks/useRoute'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

/*
 * Selects profile user and ensures rerenders occur only for changes specified in deps
 */
export const useSelectProfileRoot = (deps: Array<keyof User>) => {
  const accountUserHandle = useSelectorWeb(
    state => getAccountUser(state)?.handle
  )
  const { params = { handle: accountUserHandle } } = useRoute<'Profile'>()
  const profile = useSelectorWeb(
    state => getProfileUser(state, params),
    (a, b) => deps.every(arg => isEqual(a?.[arg], b?.[arg]))
  )
  return profile
}

/*
 * Assumes existance of user for convenience. To only be used for inner
 * components that wouldn't render if user wasn't present
 */
export const useSelectProfile = (deps: Array<keyof User>) => {
  return useSelectProfileRoot(deps) as User
}

export const getProfile = makeGetProfile()

export const getIsSubscribed = createSelector(
  [getProfile],
  profile => profile.isSubscribed
)

export const getIsOwner = createSelector(
  [getProfileUserId, getUserId],
  (profileUserId, accountUserId) => profileUserId === accountUserId
)

export const useProfileTracksLineup = () => {
  return useSelectorWeb(getProfileTracksLineup, isEqual)
}

export const useProfileAlbums = () => useSelectorWeb(getProfile, isEqual)

export const useProfilePlaylists = () => useSelectorWeb(getProfile, isEqual)

const getUserFeedMetadatas = makeGetLineupMetadatas(getProfileFeedLineup)

export const useProfileFeedLineup = () => {
  return useSelectorWeb(getUserFeedMetadatas, isEqual)
}
