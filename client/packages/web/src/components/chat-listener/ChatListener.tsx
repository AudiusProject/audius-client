import { useEffect } from 'react'

import { Status, accountSelectors, chatActions } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

const { connect, disconnect, fetchMoreChats, fetchUnreadMessagesCount } =
  chatActions
const { getAccountStatus } = accountSelectors

export const ChatListener = () => {
  const dispatch = useDispatch()
  const accountStatus = useSelector(getAccountStatus)
  // Connect to chats websockets and prefetch chats
  useEffect(() => {
    if (accountStatus === Status.SUCCESS) {
      dispatch(connect())
      dispatch(fetchMoreChats())
      dispatch(fetchUnreadMessagesCount())
    }
    return () => {
      dispatch(disconnect())
    }
  }, [dispatch, accountStatus])
  return null
}
