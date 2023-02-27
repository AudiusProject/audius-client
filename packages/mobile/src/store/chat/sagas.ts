import { chatActions } from '@audius/common'
import { takeLatest } from 'redux-saga/effects'

import { navigationRef } from 'app/components/navigation-container/NavigationContainer'

const { goToChat } = chatActions

function* watchGoToChat() {
  yield takeLatest(goToChat, function* (action: ReturnType<typeof goToChat>) {
    const {
      payload: { chatId }
    } = action
    navigationRef.current?.navigate('Chat', { chatId })
  })
}

export default function sagas() {
  return [watchGoToChat]
}
