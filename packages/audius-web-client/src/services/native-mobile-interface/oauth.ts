import { MessageType } from './types'
import { NativeMobileMessage } from './helpers'

export class RequestTwitterAuthMessage extends NativeMobileMessage {
  constructor(authURL: string) {
    super(MessageType.REQUEST_TWITTER_AUTH, { authURL })
  }
}
