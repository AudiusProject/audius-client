import { useEffect, useState } from 'react'

import { WakuMessage } from 'js-waku'

import { Message } from 'services/waku/Message'
import { ChatMessage } from 'services/waku/chat_message'
import { useWaku } from 'services/waku/wakuContext'

import Input from './Input'
import List from './List'

interface Props {
  messages: Message[]
  commandHandler: (cmd: string) => void
  nick: string
}

export const Room = (props: Props) => {
  const { waku } = useWaku()

  const [storePeers, setStorePeers] = useState(0)
  const [relayPeers, setRelayPeers] = useState(0)
  console.log('Waku |store', storePeers)
  console.log('Waku |relay', relayPeers)

  useEffect(() => {
    if (!waku) return

    // Update relay peer count on heartbeat
    waku.relay.on('gossipsub:heartbeat', () => {
      setRelayPeers(waku.relay.getPeers().size)
    })
  }, [waku])

  useEffect(() => {
    if (!waku) return

    // Update store peer when new peer connected & identified
    waku.libp2p.peerStore.on('change:protocols', async () => {
      let counter = 0
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _peer of waku.store.peers) {
        counter++
      }
      setStorePeers(counter)
    })
  }, [waku])

  return (
    <div
      className='chat-container'
      style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <List messages={props.messages} />
      <Input
        sendMessage={
          waku
            ? async (messageToSend) => {
                return handleMessage(
                  messageToSend,
                  props.nick,
                  props.topic,
                  () => {},
                  waku.relay.send.bind(waku.relay)
                )
              }
            : undefined
        }
      />
    </div>
  )
}

async function handleMessage(
  message: string,
  nick: string,
  topic: string,
  commandHandler: (cmd: string) => void,
  messageSender: (msg: WakuMessage) => Promise<void>
) {
  if (message.startsWith('/')) {
    commandHandler(message)
  } else {
    const timestamp = new Date()
    const chatMessage = ChatMessage.fromUtf8String(timestamp, nick, message)
    const wakuMsg = await WakuMessage.fromBytes(chatMessage.encode(), topic, {
      timestamp
    })
    console.log({ wakuMsg })
    return messageSender(wakuMsg)
  }
}
