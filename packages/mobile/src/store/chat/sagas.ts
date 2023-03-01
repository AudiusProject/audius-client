import { chatActions } from '@audius/common'
import { takeLatest } from 'redux-saga/effects'

import { navigationRef } from 'app/components/navigation-container/NavigationContainer'

const { goToChat } = chatActions

function* watchGoToChat() {
  yield takeLatest(goToChat, function* (action: ReturnType<typeof goToChat>) {
    const {
      payload: { chatId }
    } = action
    if (navigationRef.isReady()) {
      navigationRef.navigate('HomeStack', {
        screen: 'App',
        params: {
          screen: 'profile',
          params: {
            screen: 'Chat',
            params: {
              chatId
            }
          }
        }
      })
    }
  })
}

export default function sagas() {
  return [watchGoToChat]
}
