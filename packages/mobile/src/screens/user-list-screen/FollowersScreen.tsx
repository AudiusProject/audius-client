import { getUserList } from 'audius-client/src/common/store/user-list/followers/selectors'

import { Screen } from 'app/components/core'

import { UserList } from './UserList'

const messages = {
  title: 'Followers'
}

export const FollowersScreen = () => {
  return (
    <Screen title={messages.title} variant='secondary'>
      <UserList userSelector={getUserList} tag='FOLLOWERS' />
    </Screen>
  )
}
