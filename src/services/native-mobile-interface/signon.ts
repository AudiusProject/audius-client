import { NativeMobileMessage } from './helpers'
import { MessageType } from './types'

export class SignInFailureMessage extends NativeMobileMessage {
  constructor({ error }: { error: any }) {
    super(MessageType.SIGN_IN_FAILURE, { error })
  }
}
