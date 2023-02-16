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
      let hasConnected = false
      if (connect.match(action) && !hasConnected) {
        console.debug('[chats] Listening...')
        hasConnected = true
        const fn = async () => {
          const sdk = await audiusSdk()
          openListener = () => {
            console.debug('[chats] WebSocket opened. Listening for chats...')
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
            console.debug('[chats] WebSocket closed. Reconnecting...')
            sdk.chats.listen()
          }
          sdk.chats.addEventListener('open', openListener)
          sdk.chats.addEventListener('message', messageListener)
          sdk.chats.addEventListener('reaction', reactionListener)
          sdk.chats.addEventListener('close', closeListener)
          return sdk.chats.listen()
        }
        fn()
      } else if (disconnect.match(action) && hasConnected) {
        console.debug('[chats] Unlistening...')
        hasConnected = false
        const fn = async () => {
          const sdk = await audiusSdk()
          if (openListener) {
            sdk.chats.removeEventListener('open', openListener)
          }
          if (messageListener) {
            sdk.chats.removeEventListener('message', messageListener)
          }
          if (reactionListener) {
            sdk.chats.removeEventListener('reaction', reactionListener)
          }
          if (closeListener) {
            sdk.chats.removeEventListener('close', closeListener)
          }
        }
        fn()
      }
      return next(action)
    }
  }