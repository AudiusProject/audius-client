import { useState, useEffect } from 'react'

import styles from './UserChats.module.css'

import { getPublicKey, utils, WakuMessage } from 'js-waku'

import { Message } from 'services/waku/Message'
import { ChatMessage } from 'services/waku/chat_message'
import { useWaku } from 'services/waku/wakuContext'

import Input from './Input'
import List from './List'
import classNames from 'classnames'
import { sendMessage } from 'services/waku/utils'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { tupleNum } from 'antd/lib/_util/type'

interface Props {
  messages: Message[]
  handle: string
  className?: string
  topic: string
}

export const Chat = (props: Props) => {
  const { waku, activeHandle } = useWaku()

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

    // @ts-ignore
    const run = async () => {
      await waitForLibsInit()
      const privateKey = window.audiusLibs.hedgehog.wallet._privKey
      const publicKey = getPublicKey(privateKey)
      console.log(`pubkey: ${utils.bytesToHex(publicKey)}`)

      waku.addDecryptionKey(privateKey)

      // Update store peer when new peer connected & identified
      waku.libp2p.peerStore.on('change:protocols', async () => {
        let counter = 0
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _peer of waku.store.peers) {
          counter++
        }
        setStorePeers(counter)
      })
    }
    run()
  }, [waku])

  return (
    <div className={classNames(props.className)}>
      <List messages={props.messages} />
      <Input
        sendMessage={
          waku
            ? async (messageToSend) => {
                return handleMessage(
                  messageToSend,
                  activeHandle!,
                  props.topic,
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
  handle: string,
  topic: string,
  messageSender: (msg: WakuMessage) => Promise<void>
) {
  await sendMessage({
    handle,
    chatContentTopic: topic,
    message,
    messageSender
  })
}

export default Chat
