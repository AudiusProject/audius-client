import { WakuMessage, utils, generateSymmetricKey, getPublicKey, waku } from 'js-waku'

import { Message } from 'services/waku/Message'
import { ChatMessage } from 'services/waku/chat_message'

export const SHARED_KEY_STORAGE = 'sharedKeys'

export const initUserConnection = async ({
  waku,
  from,
  handle,
  publicKey,
  chatContentTopic,
  messageSender
}: {
  waku: any
  handle: string
  from: string
  publicKey: string
  chatContentTopic: string
  messageSender: (msg: WakuMessage) => Promise<void>
}) => {
  const storedSharedKeys = window.localStorage.getItem(SHARED_KEY_STORAGE)
  const sharedKeys =
    storedSharedKeys !== null ? JSON.parse(storedSharedKeys) : {}

  // const pubkey = utils.hexToBytes(publicKey.substring(2))
  const privateKey = window.audiusLibs.hedgehog.wallet._privKey
  const pubkey = getPublicKey(privateKey)
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
  if (!(handle in newSharedKeys)) {
    newSharedKeys[handle] = currentSharedKey

    console.log(`newSharedKeys ${JSON.stringify(newSharedKeys)}`)
    localStorage.setItem('sharedKeys', JSON.stringify(newSharedKeys))
  }
  for (const existingHandle in newSharedKeys) {
    waku.deleteDecryptionKey(newSharedKeys[existingHandle])
  }
  console.log(`asdf currentSharedKey ${currentSharedKey}`)

  waku.addDecryptionKey(currentSharedKey)
  const timestamp = new Date()
  const chatMessage = ChatMessage.fromUtf8String(
    timestamp,
    handle,
    'invite:' + handle + ':' + from + ':' + currentSharedKey
  )
  const wakuMsg = await WakuMessage.fromBytes(
    chatMessage.encode(),
    chatContentTopic,
    { timestamp } // wallet
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
  console.log(`parse Message: ${JSON.stringify(message)}`)
  if (message && message.payloadAsUtf8.includes('invite:')) {
    const splitPayload = message.payloadAsUtf8.split(':')
    const user1 = splitPayload[1]
    const user2 = splitPayload[2]
    let to
    const sharedKey = splitPayload[3]
    const currentUserHandle = window.audiusLibs.Account.getCurrentUser().handle
    const handle = message.handle
    if (currentUserHandle === user1) {
      to = user2
    } else if (currentUserHandle === user2) {
      to = user1
    } else {
      return true
    }

    let existingSharedKeys: any = localStorage.getItem(SHARED_KEY_STORAGE)
    existingSharedKeys = existingSharedKeys
      ? JSON.parse(existingSharedKeys)
      : {}
    if (!(handle in existingSharedKeys)) {
      existingSharedKeys[to] = sharedKey
      localStorage.setItem('sharedKeys', JSON.stringify(existingSharedKeys))
    }
    return true
  }
  return false
}
