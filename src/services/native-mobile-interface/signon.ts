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

export class SignUpValidateHandleFailureMessage extends NativeMobileMessage {
  constructor({ error }: { error: any }) {
    super(MessageType.SIGN_UP_VALIDATE_HANDLE_FAILURE, { error })
  }
}

export class SignUpValidateHandleSuccessMessage extends NativeMobileMessage {
  constructor() {
    super(MessageType.SIGN_UP_VALIDATE_HANDLE_SUCCESS)
  }
}
