import { NativeMobileMessage } from './helpers'
import { MessageType } from './types'

export class ReloadMessage extends NativeMobileMessage {
  constructor() {
    super(MessageType.RELOAD, {})
  }
}
