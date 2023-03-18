import type {
  TypedCommsResponse,
  UserChat,
  ChatMessage,
  ChatMessageReaction,
  ChatMessageNullableReaction
} from '@audius/sdk'
import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'

import { ID, Status } from 'models'
import { encodeHashId } from 'utils/hashIds'

type ChatId = string
type ChatMessageWithStatus = ChatMessage & { status?: Status }

type ChatState = {
  chats: {
    status: Status
    summary?: TypedCommsResponse<UserChat>['summary']
    entities: Record<string, UserChat>
    ids: string[]
  }
  messages: Record<
    ChatId,
    {
      status: Status
      summary?: TypedCommsResponse<ChatMessage>['summary']
      entities: Record<string, ChatMessageWithStatus>
      ids: string[]
    }
  >
  optimisticReactions: Record<string, ChatMessageReaction>
  optimisticChatRead: Record<string, UserChat>
  activeChatId: string | null
}

type SetMessageReactionPayload = {
  userId: ID
  chatId: string
  messageId: string
  reaction: string | null
}

const initialState: ChatState = {
  chats: {
    status: Status.IDLE,
    entities: {},
    ids: []
  },
  messages: {},
  optimisticChatRead: {},
  optimisticReactions: {},
  activeChatId: null
}

const chatSortComparator = (a: UserChat, b: UserChat) =>
  dayjs(a.last_message_at).isBefore(dayjs(b.last_message_at)) ? 1 : -1

const getNewChatOrder = (state: ChatState) => {
  const allChats = Object.values(state.chats.entities)
  return allChats.sort(chatSortComparator).map((c) => c.chat_id)
}

const slice = createSlice({
  name: 'application/pages/chat',
  initialState,
  reducers: {
    createChat: (_state, _action: PayloadAction<{ userIds: ID[] }>) => {
      // triggers saga
    },
    createChatSucceeded: (state, action: PayloadAction<{ chat: UserChat }>) => {
      const { chat } = action.payload
      state.chats.ids.unshift(chat.chat_id)
      state.chats.entities[chat.chat_id] = chat
    },
    goToChat: (_state, _action: PayloadAction<{ chatId: string }>) => {
      // triggers saga
    },
    fetchMoreChats: (state) => {
      // triggers saga
      state.chats.status = Status.LOADING
    },
    fetchMoreChatsSucceeded: (
      state,
      action: PayloadAction<TypedCommsResponse<UserChat[]>>
    ) => {
      state.chats.status = Status.SUCCESS
      for (const chat of action.payload.data) {
        state.chats.ids.push(chat.chat_id)
        state.chats.entities[chat.chat_id] = chat
      }
      state.chats.summary = action.payload.summary
    },
    fetchMoreChatsFailed: (state) => {
      state.chats.status = Status.ERROR
    },
    fetchMoreMessages: (state, action: PayloadAction<{ chatId: string }>) => {
      // triggers saga
      if (!state.messages[action.payload.chatId]) {
        state.messages[action.payload.chatId] = {
          ids: [],
          entities: {},
          status: Status.LOADING
        }
      } else {
        state.messages[action.payload.chatId].status = Status.LOADING
      }
    },
    fetchMoreMessagesSucceeded: (
      state,
      action: PayloadAction<{
        response: TypedCommsResponse<ChatMessage[]>
        chatId: string
      }>
    ) => {
      const {
        chatId,
        response: { data, summary }
      } = action.payload
      state.messages[chatId].status = Status.SUCCESS
      for (const message of data) {
        if (!state.messages[chatId].ids.includes(message.message_id)) {
          state.messages[chatId].ids.push(message.message_id)
        }
        state.messages[chatId].entities[message.message_id] = message
      }
      state.messages[chatId].summary = summary
    },
    fetchMoreMessagesFailed: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      const { chatId } = action.payload
      state.messages[chatId].status = Status.ERROR
    },
    setMessageReaction: (
      state,
      action: PayloadAction<SetMessageReactionPayload>
    ) => {
      // triggers saga
      // Optimistically set reaction
      const { userId, messageId, reaction } = action.payload
      const encodedUserId = encodeHashId(userId)
      if (reaction) {
        state.optimisticReactions[messageId] = {
          user_id: encodedUserId,
          reaction,
          created_at: dayjs().toISOString()
        }
      } else {
        delete state.optimisticReactions[messageId]
      }
    },
    setMessageReactionSucceeded: (
      state,
      action: PayloadAction<{
        chatId: string
        messageId: string
        reaction: ChatMessageNullableReaction
      }>
    ) => {
      // Set the true state
      const { chatId, messageId, reaction } = action.payload
      delete state.optimisticReactions[messageId]
      const existingReactions =
        state.messages[chatId].entities[messageId].reactions ?? []
      state.messages[chatId].entities[messageId].reactions =
        existingReactions.filter((r) => r.user_id !== reaction.user_id)
      if (reaction.reaction !== null) {
        state.messages[chatId].entities[messageId].reactions.push(reaction)
      }
    },
    setMessageReactionFailed: (
      state,
      action: PayloadAction<SetMessageReactionPayload>
    ) => {
      // Reset our optimism :(
      const { messageId } = action.payload
      delete state.optimisticReactions[messageId]
    },
    fetchChatSucceeded: (state, action: PayloadAction<{ chat: UserChat }>) => {
      const { chat } = action.payload
      if (!state.chats.entities[chat.chat_id]) {
        state.chats.ids.push(chat.chat_id)
        state.chats.ids = getNewChatOrder(state)
        state.chats.entities[chat.chat_id] = chat
      }
    },
    markChatAsRead: (state, action: PayloadAction<{ chatId: string }>) => {
      // triggers saga
      // Optimistically mark as read
      const { chatId } = action.payload
      const existingChat = state.chats.entities[chatId]
      if (existingChat) {
        state.optimisticChatRead[chatId] = {
          ...existingChat,
          last_read_at: existingChat.last_message_at,
          unread_message_count: existingChat.unread_message_count
        }
      }
    },
    markChatAsReadSucceeded: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      // Set the true state
      const { chatId } = action.payload
      delete state.optimisticChatRead[chatId]
      if (state.chats.entities[chatId]) {
        state.chats.entities[chatId].last_read_at =
          state.chats.entities[chatId].last_message_at
        state.chats.entities[chatId].unread_message_count = 0
      }
    },
    markChatAsReadFailed: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      // Reset our optimism :(
      const { chatId } = action.payload
      delete state.optimisticChatRead[chatId]
    },
    sendMessage: (
      _state,
      _action: PayloadAction<{ chatId: string; message: string }>
    ) => {
      // triggers saga which will add a message optimistically and replace it after success
    },
    addMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: ChatMessage }>
    ) => {
      // triggers saga to get chat if not exists
      const { chatId, message } = action.payload
      if (!state.messages[chatId].ids.includes(message.message_id)) {
        state.messages[chatId].ids.unshift(message.message_id)
      }
      state.messages[chatId].entities[message.message_id] = message
      state.chats.entities[chatId].last_message = message.message
      state.chats.entities[chatId].last_message_at = message.created_at
      state.chats.ids = getNewChatOrder(state)
    },
    incrementUnreadCount: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      const { chatId } = action.payload
      // If we're actively reading, this will immediately get marked as read.
      // Ignore the unread bump to prevent flicker
      if (state.activeChatId !== chatId) {
        state.chats.entities[chatId].unread_message_count += 1
      }
    },
    /**
     * Marks the chat as currently being read.
     * Prevents flicker of unread status when new messages come in if actively reading.
     */
    setActiveChat: (
      state,
      action: PayloadAction<{ chatId: string | null }>
    ) => {
      const { chatId } = action.payload
      state.activeChatId = chatId
    },
    sendMessageSucceeded: (
      state,
      action: PayloadAction<{
        chatId: string
        oldMessageId: string
        newMessageId: string
      }>
    ) => {
      const { chatId, oldMessageId, newMessageId } = action.payload

      // Add the real message
      if (!state.messages[chatId].ids.includes(newMessageId)) {
        state.messages[chatId].ids.unshift(newMessageId)
      }
      state.messages[chatId].entities[newMessageId] = {
        ...state.messages[chatId].entities[oldMessageId],
        message_id: newMessageId
      }

      // Delete the old message
      state.messages[chatId].ids = state.messages[chatId].ids.filter(
        (id) => id !== oldMessageId
      )
      delete state.messages[chatId].entities[oldMessageId]
    },
    sendMessageFailed: (
      state,
      action: PayloadAction<{
        chatId: string
        messageId: string
      }>
    ) => {
      // Delete the optimistic entry
      const { chatId, messageId } = action.payload
      state.messages[chatId].ids = state.messages[chatId].ids.filter(
        (id) => id !== messageId
      )
      delete state.messages[chatId].entities[messageId]
    },
    connect: (_state, _action: Action) => {
      // triggers middleware
    },
    disconnect: (_state, _action: Action) => {
      // triggers middleware
    }
  }
})

export const actions = slice.actions

export default slice.reducer
