import { ChatEvents, type sdk } from '@audius/sdk'
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
    let messageListener: ChatEvents['message'] | null = null
    let reactionListener: ChatEvents['reaction'] | null = null
    let openListener: ChatEvents['open'] | null = null
    let closeListener: ChatEvents['close'] | null = null

    return (next) => (action) => {
      if (connect.match(action)) {
        console.log('Chat middleware attaching')
        audiusSdk().then((sdk) => {
          openListener = () => {
            console.log(
              'Chat middleware WebSocket opened. Listening for chats...'
            )
          }
          messageListener = ({ chatId, message }) => {
            store.dispatch(addMessage({ chatId, message }))
            store.dispatch(incrementUnreadCount({ chatId }))
          }
          reactionListener = ({ chatId, messageId, reaction }) => {
            store.dispatch(
              setMessageReactionSucceeded({
                chatId,
                messageId,
                reaction
              })
            )
          }
          closeListener = () => {
            console.log('Chat middleware WebSocket closed. Reconnecting...')
            sdk.chats.listen()
          }
          sdk.chats.addListener('open', openListener)
          sdk.chats.addListener('message', messageListener)
          sdk.chats.addListener('reaction', reactionListener)
          sdk.chats.addListener('close', closeListener)
          return sdk.chats.listen()
        })
      } else if (disconnect.match(action)) {
        console.log('Chat middleware detaching')
        audiusSdk().then((sdk) => {
          if (openListener) {
            sdk.chats.removeListener('open', openListener)
          }
          if (messageListener) {
            sdk.chats.removeListener('message', messageListener)
          }
          if (reactionListener) {
            sdk.chats.removeListener('reaction', reactionListener)
          }
          if (closeListener) {
            sdk.chats.removeListener('close', closeListener)
          }
        })
      }
      return next(action)
    }
  }
