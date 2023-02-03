import { type sdk } from '@audius/sdk'
import { Middleware } from 'redux'

import { actions as chatActions } from './slice'

const {
  connect,
  disconnect,
  addMessage,
  incrementUnreadCount,
  setMessageReactionSucceeded
} = chatActions

export const chatMiddleware =
  (audiusSdk: () => Promise<ReturnType<typeof sdk>>): Middleware =>
  (store) => {
    let listener: ReturnType<typeof sdk>['chats']['eventEmitter']
    let websocket: Awaited<
      ReturnType<ReturnType<typeof sdk>['chats']['listen']>
    >
    return (next) => (action) => {
      if (connect.match(action)) {
        audiusSdk()
          .then((sdk) => {
            if (!listener) {
              listener = sdk.chats.eventEmitter
              listener.on('open', () => {
                console.log(
                  'Chat middleware WebSocket opened. Listening for chats...'
                )
              })
              listener.on('message', ({ chatId, message }) => {
                store.dispatch(addMessage({ chatId, message }))
                store.dispatch(incrementUnreadCount({ chatId }))
              })
              listener.on('reaction', ({ chatId, messageId, reaction }) => {
                store.dispatch(
                  setMessageReactionSucceeded({
                    chatId,
                    messageId,
                    reaction
                  })
                )
              })
              listener.on('close', () => {
                console.log('Chat middleware WebSocket closed.')
              })
              return sdk.chats.listen()
            }
            return Promise.resolve(null)
          })
          .then((ws) => {
            if (ws !== null) {
              console.log('Chat middleware initialized.')
              websocket = ws
            }
          })
      } else if (disconnect.match(action) && websocket) {
        websocket.close()
      }
      return next(action)
    }
  }
