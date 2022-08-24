import { useCallback } from 'react'

import {
  repostsUserListActions,
  repostsUserListSelectors
} from '@audius/common'

import IconRepost from 'app/assets/images/iconRepost.svg'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useRoute } from 'app/hooks/useRoute'

import { UserList } from './UserList'
import { UserListScreen } from './UserListScreen'
const { setRepost } = repostsUserListActions
const { getUserList } = repostsUserListSelectors

const messages = {
  title: 'Reposts'
}

export const RepostsScreen = () => {
  const { params } = useRoute<'Reposts'>()
  const { id, repostType } = params
  const dispatchWeb = useDispatchWeb()

  const handleSetRepost = useCallback(() => {
    dispatchWeb(setRepost(id, repostType))
  }, [dispatchWeb, id, repostType])

  return (
    <UserListScreen title={messages.title} titleIcon={IconRepost}>
      <UserList
        userSelector={getUserList}
        tag='REPOSTS'
        setUserList={handleSetRepost}
      />
    </UserListScreen>
  )
}
