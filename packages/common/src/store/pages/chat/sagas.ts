import {
  ChatCreateRPC,
  ChatMessage,
  ChatMessageRPC,
  TypedCommsResponse
} from '@audius/sdk'
import dayjs from 'dayjs'
import { call, put, select, takeEvery, takeLatest } from 'typed-redux-saga'

import { getAccountUser, getUserId } from 'store/account/selectors'

import { decodeHashId, encodeHashId } from '../../../utils'
import { cacheUsersActions } from '../../cache'
import { getContext } from '../../effects'

import * as chatSelectors from './selectors'
import { actions as chatActions } from './slice'

const {
  createChat,
  createChatSucceeded,
  fetchMoreChats,
  fetchMoreChatsSucceeded,
  fetchMoreChatsFailed,
  fetchMoreMessages,
  fetchMoreMessagesSucceeded,
  fetchMoreMessagesFailed,
  fetchChatSucceeded,
  setMessageReaction,
  setMessageReactionSucceeded,
  setMessageReactionFailed,
  markChatAsRead,
  markChatAsReadSucceeded,
  markChatAsReadFailed,
  sendMessage,
  sendMessageSucceeded,
  sendMessageFailed,
  addMessage
} = chatActions
const { getChatsSummary, getChatMessagesSummary, getChat } = chatSelectors

function* doFetchMoreChats() {
  try {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const summary = yield* select(getChatsSummary)
    const before = summary?.prev_cursor
    const response = yield* call([sdk.chats, sdk.chats.getAll], {
      before,
      limit: 30
    })
    const userIds = new Set<number>([])
    for (const chat of response.data) {
      for (const member of chat.chat_members) {
        userIds.add(decodeHashId(member.user_id)!)
      }
    }
    yield* put(
      cacheUsersActions.fetchUsers({
        userIds: Array.from(userIds.values())
      })
    )
    yield* put(fetchMoreChatsSucceeded(response))
  } catch (e) {
    console.error('fetchMoreChatsFailed', e)
    yield* put(fetchMoreChatsFailed())
  }
}

function* doFetchMoreMessages(action: ReturnType<typeof fetchMoreMessages>) {
  const { chatId } = action.payload
  try {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)

    // Ensure we get a chat so we can check the unread count
    yield* call(fetchChatIfNecessary, { chatId })
    const chat = yield* select((state) => getChat(state, chatId))
    const summary = yield* select((state) =>
      getChatMessagesSummary(state, chatId)
    )

    // Paginate through messages until we get to the unread indicator
    let lastResponse: TypedCommsResponse<ChatMessage[]> | undefined
    let before = summary?.prev_cursor
    let hasMoreUnread = true
    let data: ChatMessage[] = []
    while (hasMoreUnread) {
      const limit = 50
      const response = yield* call([sdk.chats, sdk.chats!.getMessages], {
        chatId,
        before,
        limit
      })
      // Only save the last response summary. Pagination is one-way
      lastResponse = response
      data = data.concat(response.data)
      hasMoreUnread =
        !!chat?.unread_message_count &&
        chat.unread_message_count > (response.summary?.next_count ?? 0) - limit
      before = response.summary?.prev_cursor
    }
    if (!lastResponse) {
      throw new Error('No responses gathered')
    }
    yield* put(
      fetchMoreMessagesSucceeded({
        chatId,
        response: {
          ...lastResponse,
          data
        }
      })
    )
  } catch (e) {
    console.error('fetchNewChatMessagesFailed', e)
    yield* put(fetchMoreMessagesFailed({ chatId }))
  }
}

function* doSetMessageReaction(action: ReturnType<typeof setMessageReaction>) {
  const { chatId, messageId, reaction, userId } = action.payload
  try {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const user = yield* select(getAccountUser)
    if (!user) {
      throw new Error('User not found')
    }
    yield* call([sdk.chats, sdk.chats.react], {
      chatId,
      messageId,
      reaction
    })
    const reactionResponse = {
      user_id: encodeHashId(userId)!,
      reaction,
      created_at: dayjs().toISOString()
    }
    yield* put(
      setMessageReactionSucceeded({
        chatId,
        messageId,
        reaction: reactionResponse
      })
    )
  } catch (e) {
    console.error('setMessageReactionFailed', e)
    yield* put(setMessageReactionFailed(action.payload))
  }
}

function* doCreateChat(action: ReturnType<typeof createChat>) {
  const { userIds } = action.payload
  try {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const user = yield* select(getAccountUser)
    if (!user) {
      throw new Error('User not found')
    }
    const res = yield* call([sdk.chats, sdk.chats.create], {
      userId: encodeHashId(user.user_id),
      invitedUserIds: userIds.map((id) => encodeHashId(id))
    })
    const chatId = (res as ChatCreateRPC).params.chat_id
    const { data: chat } = yield* call([sdk.chats, sdk.chats.get], { chatId })
    yield* put(createChatSucceeded({ chat }))
  } catch (e) {
    console.error('createChatFailed', e)
  }
}

function* doMarkChatAsRead(action: ReturnType<typeof markChatAsRead>) {
  const { chatId } = action.payload
  try {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const chat = yield* select((state) => getChat(state, chatId))
    if (!chat || dayjs(chat?.last_read_at).isBefore(chat?.last_message_at)) {
      yield* call([sdk.chats, sdk.chats.read], { chatId })
      yield* put(markChatAsReadSucceeded({ chatId }))
    }
  } catch (e) {
    console.error('markChatAsReadFailed', e)
    yield* put(markChatAsReadFailed({ chatId }))
  }
}

let tempMessageIdCounter = 1
function* doSendMessage(action: ReturnType<typeof sendMessage>) {
  const { chatId, message } = action.payload
  const temporaryMessageId = `temp-${tempMessageIdCounter++}`
  try {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const userId = yield* select(getUserId)
    const currentUserId = encodeHashId(userId)
    if (!currentUserId) {
      return
    }

    // Optimistically add the message
    yield* put(
      addMessage({
        chatId,
        message: {
          sender_user_id: currentUserId,
          message_id: temporaryMessageId,
          message,
          reactions: [],
          created_at: dayjs().toISOString()
        }
      })
    )

    const response = (yield* call([sdk.chats, sdk.chats.message], {
      chatId,
      message
    })) as ChatMessageRPC

    // After successful RPC, replace with real message
    yield* put(
      sendMessageSucceeded({
        chatId,
        oldMessageId: temporaryMessageId,
        message: {
          sender_user_id: currentUserId,
          message_id: response.params.message_id,
          message,
          reactions: [],
          created_at: dayjs().toISOString()
        }
      })
    )
  } catch (e) {
    console.error('sendMessageFailed', e)
    yield* put(
      sendMessageFailed({ chatId, attemptedMessageId: temporaryMessageId })
    )
  }
}

function* fetchChatIfNecessary(args: { chatId: string }) {
  const { chatId } = args
  const existingChat = yield* select((state) => getChat(state, chatId))
  if (!existingChat) {
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const { data: chat } = yield* call([sdk.chats, sdk.chats.get], { chatId })
    if (chat) {
      yield* put(fetchChatSucceeded({ chat }))
    }
  }
}

function* watchAddMessage() {
  yield takeEvery(addMessage, ({ payload }) => fetchChatIfNecessary(payload))
}

function* watchSendMessage() {
  yield takeEvery(sendMessage, doSendMessage)
}

function* watchFetchChats() {
  yield takeLatest(fetchMoreChats, doFetchMoreChats)
}

function* watchFetchChatMessages() {
  yield takeLatest(fetchMoreMessages, doFetchMoreMessages)
}

function* watchSetMessageReaction() {
  yield takeEvery(setMessageReaction, doSetMessageReaction)
}

function* watchCreateChat() {
  yield takeEvery(createChat, doCreateChat)
}

function* watchMarkChatAsRead() {
  yield takeEvery(markChatAsRead, doMarkChatAsRead)
}

export const sagas = () => {
  return [
    watchFetchChats,
    watchFetchChatMessages,
    watchSetMessageReaction,
    watchCreateChat,
    watchMarkChatAsRead,
    watchSendMessage,
    watchAddMessage
  ]
}
