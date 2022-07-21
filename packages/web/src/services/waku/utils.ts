import { WakuMessage, utils, generateSymmetricKey } from 'js-waku'

import { ChatMessage } from 'services/waku/chat_message'
import { Message } from 'services/waku/Message'

export const SHARED_KEY_STORAGE = 'sharedKeys'

export const initUserConnection = async ({
  waku,
  handle,
  publicKey,
  chatContentTopic,
  messageSender
}: {
  waku: any
  handle: string
  publicKey: string
  chatContentTopic: string
  messageSender: (msg: WakuMessage) => Promise<void>
}) => {
  const storedSharedKeys = window.localStorage.getItem(SHARED_KEY_STORAGE)
  const sharedKeys =
    storedSharedKeys !== null ? JSON.parse(storedSharedKeys) : {}

  // const pubkey = utils.hexToBytes(publicKey.substring(2))
  const pubkey = '0482a93ae2b9e7b4e55273b4d50d935d750a3dd6fb798689bdcce6b0cbbf6d8638b207590183529e99f2aa7bde8eaff9d0c422e25b9398033e3d2ae9aef221e4d0'
  const currentSharedKey =
    handle in sharedKeys
      ? sharedKeys[handle]
      : utils.bytesToHex(generateSymmetricKey())

  const currentSharedKeys = localStorage.getItem('sharedKeys')

  // const txt = args.join(" ");
  console.log(`set receiver ${publicKey.substring(2)}`)
  console.log({ pubkey })
  localStorage.setItem('to', handle)
  const newSharedKeys: any =
    currentSharedKeys !== null ? JSON.parse(currentSharedKeys) : {}
  newSharedKeys[handle] = currentSharedKey
  for (const existingHandle in newSharedKeys) {
    waku.deleteDecryptionKey(newSharedKeys[existingHandle])
  }

  waku.addDecryptionKey(currentSharedKey)

  console.log(`newSharedKeys ${JSON.stringify(newSharedKeys)}`)
  localStorage.setItem('sharedKeys', JSON.stringify(newSharedKeys))

  const timestamp = new Date()
  const chatMessage = ChatMessage.fromUtf8String(
    timestamp,
    handle,
    'invite:' + currentSharedKey
  )
  const wakuMsg = await WakuMessage.fromBytes(
    chatMessage.encode(),
    chatContentTopic,
    { timestamp, encPublicKey: pubkey } // wallet
  )
  return messageSender(wakuMsg)
}

type SendMessageParams = {
  handle: string
  chatContentTopic: string
  message: string
  messageSender: (msg: WakuMessage) => Promise<void>
}

export const sendMessage = async ({
  handle,
  chatContentTopic,
  message,
  messageSender
}: SendMessageParams) => {
  const timestamp = new Date()
  const chatMessage = ChatMessage.fromUtf8String(timestamp, handle, message)
  const storedSharedKeys = localStorage.getItem(SHARED_KEY_STORAGE)
  if (!storedSharedKeys) {
    console.log('local storage net set')
    return null
  }
  const sharedKeys = JSON.parse(storedSharedKeys)
  const symKey = sharedKeys[handle]
  if (!symKey) {
    console.log({
      handle,
      sharedKeys,
      message,
      chatContentTopic
    })
    console.log('sym key not found')
    return null
  }
  const body = { timestamp, symKey }
  const wakuMsg = await WakuMessage.fromBytes(
    chatMessage.encode(),
    chatContentTopic,
    body
  )
  return messageSender(wakuMsg)
}

export const checkIsInviteMessage = (message: Message) => {
  console.log('parse Message')
  if (message && message.payloadAsUtf8.includes('invite:')) {
    const sharedKey = message.payloadAsUtf8.split('invite:')[1]
    const handle = message.handle

    let existingSharedKeys: any = localStorage.getItem(SHARED_KEY_STORAGE)
    existingSharedKeys = existingSharedKeys
      ? JSON.parse(existingSharedKeys)
      : {}
    if (!(handle in existingSharedKeys)) {
      existingSharedKeys[handle] = sharedKey
    }

    localStorage.setItem('sharedKeys', JSON.stringify(existingSharedKeys))
    return true
  }
  return false
}
