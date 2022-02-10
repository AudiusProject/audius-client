import React, { useEffect, useContext } from 'react'

import { USER_LIST_TAG } from 'common/store/user-list/favorites/sagas'
import { getUserList } from 'common/store/user-list/favorites/selectors'
import MobilePageContainer from 'components/mobile-page-container/MobilePageContainer'
import NavContext, { LeftPreset } from 'components/nav/store/context'
import UserList from 'components/user-list/UserList'

const messages = {
  title: 'Favorites'
}

// Eventually calculate a custom page size
export const PAGE_SIZE = 15

const FavoritesPage = () => {
  const { setLeft, setCenter, setRight } = useContext(NavContext)!

  useEffect(() => {
    setLeft(LeftPreset.BACK)
    setCenter(messages.title)
    setRight(null)
  }, [setLeft, setCenter, setRight])

  return (
    <MobilePageContainer fullHeight>
      <UserList
        stateSelector={getUserList}
        tag={USER_LIST_TAG}
        pageSize={PAGE_SIZE}
      />
    </MobilePageContainer>
  )
}

export default FavoritesPage
