import { useCallback } from 'react'

import {
  followingUserListActions,
  followingUserListSelectors
} from '@audius/common'
import { useDispatch } from 'react-redux'

import IconUser from 'app/assets/images/iconUser.svg'
import { useProfileRoute } from 'app/hooks/useRoute'

import { UserList } from './UserList'
import { UserListScreen } from './UserListScreen'
const { setFollowing } = followingUserListActions
const { getUserList } = followingUserListSelectors

const messages = {
  title: 'Following'
}

export const FollowingScreen = () => {
  const { params } = useProfileRoute<'Following'>()
  const { userId } = params
  const dispatch = useDispatch()

  const handleSetFollowing = useCallback(() => {
    dispatch(setFollowing(userId))
  }, [dispatch, userId])

  return (
    <UserListScreen title={messages.title} titleIcon={IconUser}>
      <UserList
        userSelector={getUserList}
        tag='FOLLOWING'
        setUserList={handleSetFollowing}
      />
    </UserListScreen>
  )
}
