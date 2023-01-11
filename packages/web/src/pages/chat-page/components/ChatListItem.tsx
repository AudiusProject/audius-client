import { useCallback } from 'react'

import {
  accountSelectors,
  decodeHashId,
  cacheUsersSelectors
} from '@audius/common'
import type { UserChat } from '@audius/sdk'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import { ProfilePicture } from 'components/notification/Notification/components/ProfilePicture'
import UserBadges from 'components/user-badges/UserBadges'
import { chatPage } from 'utils/route'

import styles from './ChatListItem.module.css'

type ChatListItemProps = {
  currentChatId?: string
  chat: UserChat
}

export const ChatListItem = (props: ChatListItemProps) => {
  const { chat, currentChatId } = props
  const dispatch = useDispatch()
  const currentUserId = useSelector(accountSelectors.getUserId)
  const member = chat.chat_members.find(
    (u) => decodeHashId(u.user_id) !== currentUserId
  )
  const user = useSelector((state) =>
    cacheUsersSelectors.getUser(state, {
      id: member ? decodeHashId(member.user_id) ?? -1 : -1
    })
  )
  const isCurrentChat = currentChatId && currentChatId === chat.chat_id
  console.log({ isCurrentChat, currentChatId, chatId: chat.chat_id })

  const handleClick = useCallback(() => {
    dispatch(push(chatPage(chat.chat_id)))
  }, [dispatch, chat])

  if (!user || !member) {
    return null
  }
  return (
    <div
      className={cn(styles.root, { [styles.active]: isCurrentChat })}
      onClick={handleClick}
    >
      <ProfilePicture user={user} className={styles.profilePicture} />
      <div className={styles.userDetails}>
        <ArtistPopover handle={user.handle}>
          <div className={styles.userName}>
            <span>{user.name}</span>
            <UserBadges userId={user.user_id} badgeSize={14} />
          </div>
        </ArtistPopover>
        <ArtistPopover handle={user.handle}>
          <span className={styles.userHandle}>@{user.handle}</span>
        </ArtistPopover>
      </div>
    </div>
  )
}
