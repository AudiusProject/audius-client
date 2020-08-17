import { MessageType } from './types'
import { NativeMobileMessage } from './helpers'

export class BackendDidSetup extends NativeMobileMessage {
  constructor() {
    super(MessageType.BACKEND_SETUP, {})
  }
}

export class RequestNetworkConnected extends NativeMobileMessage {
  constructor() {
    super(MessageType.REQUEST_NETWORK_CONNECTED, {})
  }
}

export class OnFirstPage extends NativeMobileMessage {
  constructor() {
    super(MessageType.ON_FIRST_PAGE, {})
  }
}

export class NotOnFirstPage extends NativeMobileMessage {
  constructor() {
    super(MessageType.NOT_ON_FIRST_PAGE, {})
  }
}
