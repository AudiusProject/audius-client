import {
  accountSelectors,
  decodeHashId,
  cacheUsersSelectors,
  useProxySelector
} from '@audius/common'
import type { UserChat } from '@audius/sdk'

export const useOtherChatUser = (chat?: UserChat) =>
  useProxySelector(
    (state) => {
      if (!chat) {
        return null
      }
      const currentUserId = accountSelectors.getUserId(state)
      const member = chat.chat_members.find(
        (u) => decodeHashId(u.user_id) !== currentUserId
      )
      if (!member) {
        return null
      }
      return cacheUsersSelectors.getUser(state, {
        id: decodeHashId(member.user_id)
      })
    },
    [chat]
  )
