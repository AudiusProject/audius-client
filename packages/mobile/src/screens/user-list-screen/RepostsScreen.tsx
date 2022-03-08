import { getUserList } from 'audius-client/src/common/store/user-list/reposts/selectors'

import { Screen } from 'app/components/core'

import { UserList } from './UserList'

const messages = {
  title: 'Reposts'
}

export const RepostsScreen = () => {
  return (
    <Screen title={messages.title} variant='secondary'>
      <UserList userSelector={getUserList} tag='REPOSTS' />
    </Screen>
  )
}
