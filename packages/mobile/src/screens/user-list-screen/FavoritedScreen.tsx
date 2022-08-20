import { useCallback } from 'react'

import { favoritesUserListActions } from '@audius/common'
import { favoritesUserListSelectors } from '@audius/common'
const { getUserList } = favoritesUserListSelectors

import IconHeart from 'app/assets/images/iconHeart.svg'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useRoute } from 'app/hooks/useRoute'

import { UserList } from './UserList'
import { UserListScreen } from './UserListScreen'
const { setFavorite } = favoritesUserListActions

const messages = {
  title: 'Favorites'
}

export const FavoritedScreen = () => {
  const { params } = useRoute<'Favorited'>()
  const { id, favoriteType } = params
  const dispatchWeb = useDispatchWeb()

  const handleSetFavorited = useCallback(() => {
    dispatchWeb(setFavorite(id, favoriteType))
  }, [dispatchWeb, id, favoriteType])

  return (
    <UserListScreen title={messages.title} titleIcon={IconHeart}>
      <UserList
        userSelector={getUserList}
        tag='FAVORITES'
        setUserList={handleSetFavorited}
      />
    </UserListScreen>
  )
}
