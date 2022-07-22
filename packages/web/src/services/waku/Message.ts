import { WakuMessage } from 'js-waku'

import { ChatMessage } from './chat_message'

export class Message {
  public chatMessage: ChatMessage
  // WakuMessage timestamp
  public sentTimestamp: Date | undefined

  constructor(chatMessage: ChatMessage, sentTimestamp: Date | undefined) {
    this.chatMessage = chatMessage
    this.sentTimestamp = sentTimestamp
  }

  static fromWakuMessage(wakuMsg: WakuMessage): Message | undefined {
    if (wakuMsg.payload) {
      try {
        const chatMsg = ChatMessage.decode(wakuMsg.payload)
        if (chatMsg) {
          return new Message(chatMsg, wakuMsg.timestamp)
        }
      } catch (e) {
        console.error('Failed to decode chat message', e)
      }
    }
  }

  static fromUtf8String(handle: string, text: string): Message {
    const now = new Date()
    return new Message(ChatMessage.fromUtf8String(now, handle, text), now)
  }
  
  get from() {
    return window.audiusLibs.getAccountUser().handle
  }

  get handle() {
    return this.chatMessage.handle
  }

  get timestamp() {
    return this.chatMessage.timestamp
  }

  get payloadAsUtf8() {
    return this.chatMessage.payloadAsUtf8
  }
}
