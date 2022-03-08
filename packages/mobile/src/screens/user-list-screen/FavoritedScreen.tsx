import { getUserList } from 'audius-client/src/common/store/user-list/favorites/selectors'

import { Screen } from 'app/components/core'

import { UserList } from './UserList'

const messages = {
  title: 'Favorites'
}

export const FavoritedScreen = () => {
  return (
    <Screen title={messages.title} variant='secondary'>
      <UserList userSelector={getUserList} tag='FAVORITES' />
    </Screen>
  )
}
