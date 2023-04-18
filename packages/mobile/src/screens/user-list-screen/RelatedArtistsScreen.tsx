import { useCallback } from 'react'

import {
  relatedArtistsUserListActions,
  relatedArtistsUserListSelectors,
  RELATED_ARTISTS_USER_LIST_TAG
} from '@audius/common'
import { useDispatch } from 'react-redux'

import IconFollowing from 'app/assets/images/iconFollowing.svg'
import { useProfileRoute } from 'app/hooks/useRoute'

import { UserList } from './UserList'
import { UserListScreen } from './UserListScreen'
const { getUserList } = relatedArtistsUserListSelectors
const { setRelatedArtists } = relatedArtistsUserListActions

const messages = {
  title: 'RelatedArtists'
}

export const RelatedArtistsScreen = () => {
  const { params } = useProfileRoute<'RelatedArtists'>()
  const { userId } = params
  const dispatch = useDispatch()

  const handleSetRelatedArtists = useCallback(() => {
    dispatch(setRelatedArtists(userId))
  }, [dispatch, userId])

  return (
    <UserListScreen title={messages.title} titleIcon={IconFollowing}>
      <UserList
        userSelector={getUserList}
        tag={RELATED_ARTISTS_USER_LIST_TAG}
        setUserList={handleSetRelatedArtists}
      />
    </UserListScreen>
  )
}
