import type {
  TypedCommsResponse,
  UserChat,
  ChatMessage,
  ChatMessageReaction,
  ChatMessageNullableReaction
} from '@audius/sdk'
import {
  Action,
  createSlice,
  PayloadAction,
  createEntityAdapter,
  EntityState
} from '@reduxjs/toolkit'
import dayjs from 'dayjs'

import { ID, Status } from 'models'
import { encodeHashId } from 'utils/hashIds'

type UserChatWithMessagesStatus = UserChat & {
  messagesStatus?: Status
  messagesSummary?: TypedCommsResponse<ChatMessage>['summary']
}

type ChatMessageWithSendStatus = ChatMessage & {
  status?: Status
  chat_id: string
}

type ChatState = {
  chats: EntityState<UserChatWithMessagesStatus> & {
    status: Status
    summary?: TypedCommsResponse<UserChat>['summary']
  }
  messages: EntityState<ChatMessageWithSendStatus> & {
    status?: Status
    summary?: TypedCommsResponse<ChatMessage>['summary']
  }
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

const chatSortComparator = (a: UserChat, b: UserChat) =>
  dayjs(a.last_message_at).isBefore(dayjs(b.last_message_at)) ? 1 : -1

export const chatsAdapter = createEntityAdapter<UserChatWithMessagesStatus>({
  selectId: (chat) => chat.chat_id,
  sortComparer: chatSortComparator
})

const messageSortComparator = (a: ChatMessage, b: ChatMessage) =>
  dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1

export const chatMessagesAdapter =
  createEntityAdapter<ChatMessageWithSendStatus>({
    selectId: (message) => message.message_id,
    sortComparer: messageSortComparator
  })

const initialState: ChatState = {
  chats: {
    status: Status.IDLE,
    ...chatsAdapter.getInitialState()
  },
  messages: chatMessagesAdapter.getInitialState(),
  optimisticChatRead: {},
  optimisticReactions: {},
  activeChatId: null
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
      chatsAdapter.upsertOne(state.chats, chat)
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
      state.chats.summary = action.payload.summary
      chatsAdapter.addMany(state.chats, action.payload.data)
    },
    fetchMoreChatsFailed: (state) => {
      state.chats.status = Status.ERROR
    },
    fetchMoreMessages: (state, action: PayloadAction<{ chatId: string }>) => {
      // triggers saga
      if (!state.messages[action.payload.chatId]) {
        state.messages[action.payload.chatId] = {
          ...chatMessagesAdapter.getInitialState(),
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
      chatsAdapter.updateOne(state.chats, {
        id: chatId,
        changes: {
          messagesStatus: Status.SUCCESS,
          messagesSummary: summary
        }
      })
      chatsAdapter.updateOne(state.chats, {
        id: chatId,
        changes: { messagesStatus: Status.SUCCESS, messagesSummary: summary }
      })
      chatMessagesAdapter.upsertMany(
        state.messages,
        data.map((message) => ({ ...message, chat_id: chatId }))
      )
    },
    fetchMoreMessagesFailed: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      const { chatId } = action.payload
      chatsAdapter.updateOne(state.chats, {
        id: chatId,
        changes: { messagesStatus: Status.ERROR }
      })
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

      // Ensure the message exists
      chatMessagesAdapter.addOne(state.messages, {
        chat_id: chatId,
        message_id: messageId,
        reactions: [],
        message: '',
        sender_user_id: '',
        created_at: ''
      })
      const existingMessage = chatMessagesAdapter
        .getSelectors()
        .selectById(state.messages, messageId)
      const existingReactions = existingMessage?.reactions ?? []
      state.messages.entities[messageId]!.reactions = existingReactions.filter(
        (r) => r.user_id !== reaction.user_id
      )
      if (reaction.reaction !== null) {
        state.messages.entities[messageId]!.reactions.push(reaction)
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
      chatsAdapter.upsertOne(state.chats, chat)
    },
    markChatAsRead: (state, action: PayloadAction<{ chatId: string }>) => {
      // triggers saga
      // Optimistically mark as read
      const { chatId } = action.payload
      const existingChat = chatsAdapter
        .getSelectors()
        .selectById(state.chats, chatId)
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
      const existingChat = chatsAdapter
        .getSelectors()
        .selectById(state.chats, chatId)
      chatsAdapter.updateOne(state.chats, {
        id: chatId,
        changes: {
          last_read_at: existingChat?.last_message_at,
          unread_message_count: 0
        }
      })
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
      chatMessagesAdapter.upsertOne(state.messages, {
        ...message,
        chat_id: chatId
      })
      chatsAdapter.updateOne(state.chats, {
        id: chatId,
        changes: {
          last_message: message.message,
          last_message_at: message.created_at
        }
      })
    },
    incrementUnreadCount: (
      state,
      action: PayloadAction<{ chatId: string }>
    ) => {
      const { chatId } = action.payload
      // If we're actively reading, this will immediately get marked as read.
      // Ignore the unread bump to prevent flicker
      if (state.activeChatId !== chatId) {
        const existingChat = chatsAdapter
          .getSelectors()
          .selectById(state.chats, chatId)
        const existingUnreadCount = existingChat?.unread_message_count ?? 0
        chatsAdapter.updateOne(state.chats, {
          id: chatId,
          changes: { unread_message_count: existingUnreadCount + 1 }
        })
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
    sendMessageFailed: (
      state,
      action: PayloadAction<{
        chatId: string
        messageId: string
      }>
    ) => {
      // Mark message as not sent
      const { messageId } = action.payload
      chatMessagesAdapter.updateOne(state.messages, {
        id: messageId,
        changes: { status: Status.ERROR }
      })
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
