import {
  getContext,
  chatSelectors,
  chatActions,
  decodeHashId
} from '@audius/common'
import { call, put, select, takeEvery } from 'typed-redux-saga'

import { fetchUsers } from 'common/store/cache/users/sagas'

const {
  fetchMoreChats,
  fetchMoreChatsSucceeded,
  fetchNewChatMessages,
  fetchNewChatMessagesSucceeded
} = chatActions
const { getChatsSummary, getChatMessagesSummary } = chatSelectors

function* doFetchMoreChats() {
  const audiusSdk = yield* getContext('audiusSdk')
  const sdk = yield* call(audiusSdk)
  const summary = yield* select(getChatsSummary)
  console.log({ summary })
  const cursor = summary?.next_cursor
  const response = yield* call([sdk.chats!, sdk.chats!.getAll], {
    cursor
  })
  const userIds = new Set<number>([])
  for (const chat of response.data) {
    for (const member of chat.chat_members) {
      userIds.add(decodeHashId(member.user_id))
    }
  }
  yield* call(fetchUsers, Array.from(userIds.values()))
  yield* put(fetchMoreChatsSucceeded(response))
}

function* doFetchChatMessages(action: ReturnType<typeof fetchNewChatMessages>) {
  const { chatId } = action.payload
  const audiusSdk = yield* getContext('audiusSdk')
  const sdk = yield* call(audiusSdk)
  const summary = yield* select((state) =>
    getChatMessagesSummary(state, chatId)
  )
  const after = summary?.prev_cursor
  const response = yield* call([sdk.chats!, sdk.chats!.getMessages], {
    chatId,
    after
  })
  yield* put(fetchNewChatMessagesSucceeded({ chatId, response }))
}

function* watchFetchChats() {
  yield takeEvery(fetchMoreChats, doFetchMoreChats)
}

function* watchFetchChatMessages() {
  yield takeEvery(fetchNewChatMessages, doFetchChatMessages)
}

export default function sagas() {
  return [watchFetchChats, watchFetchChatMessages]
}
