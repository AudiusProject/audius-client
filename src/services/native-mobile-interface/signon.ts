import { NativeMobileMessage } from './helpers'
import { MessageType } from './types'

export class SignInFailureMessage extends NativeMobileMessage {
  constructor({ error }: { error: any }) {
    super(MessageType.SIGN_IN_FAILURE, { error })
  }
}

export class SignUpValidateEmailFailureMessage extends NativeMobileMessage {
  constructor({ error }: { error: any }) {
    super(MessageType.SIGN_UP_VALIDATE_EMAIL_FAILURE, { error })
  }
}

export class SignUpValidateEmailSuccessMessage extends NativeMobileMessage {
  constructor({ available }: { available: any }) {
    super(MessageType.SIGN_UP_VALIDATE_EMAIL_SUCCESS, { available })
  }
}
