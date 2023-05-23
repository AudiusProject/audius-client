import { chatActions } from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { takeLatest } from 'redux-saga/effects'
import { put } from 'typed-redux-saga'

import { CHATS_PAGE, chatPage } from 'utils/route'

const { goToChat } = chatActions

function* watchGoToChat() {
  yield takeLatest(goToChat, function* (action: ReturnType<typeof goToChat>) {
    const {
      payload: { chatId }
    } = action
    if (!chatId) {
      yield* put(pushRoute(CHATS_PAGE))
    } else {
      yield* put(pushRoute(chatPage(chatId)))
    }
  })
}

export default function sagas() {
  return [watchGoToChat]
}
