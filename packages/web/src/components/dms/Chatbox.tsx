import React, { useEffect, useReducer, useState } from 'react'

import { Waku, WakuMessage } from 'js-waku'
import { useSelector } from 'react-redux'

import { getUserHandle } from 'common/store/account/selectors'
import { Message } from 'services/waku/Message'
import { retrieveStoreMessages } from 'services/waku/retrieveStoreMessages'
import { initWaku } from 'services/waku/waku'
import { WakuContext } from 'services/waku/wakuContext'

import styles from './Chatbox.module.css'

import { Room } from './Room'
import classNames from 'classnames'

const audiusMessages = {
  title: 'Messages'
}

const ChatContentTopic = '/toy-chat/2/huilong/proto'

const reduceMessages = (state: Message[], newMessages: Message[]) => {
  return state.concat(newMessages)
}

export const Chatbox = (props: { className?: string }) => {
  const [waku, setWaku] = useState<Waku | undefined>(undefined)
  const [historicalMessagesRetrieved, setHistoricalMessagesRetrieved] =
    useState(false)
  const [messages, dispatchMessages] = useReducer(reduceMessages, [])

  useEffect(() => {
    initWaku((w: Waku) => {
      // @ts-ignore
      window.waku = w
      setWaku(w)
    })
      .then(() => console.log('Waku |Waku init done'))
      .catch((e) => console.log('Waku |Waku init failed ', e))
  }, [])

  useEffect(() => {
    if (!waku) return
    // Let's retrieve previous messages before listening to new messages
    if (!historicalMessagesRetrieved) return

    const handleRelayMessage = (wakuMsg: WakuMessage) => {
      console.log('Waku |Message received: ', wakuMsg)
      const msg = Message.fromWakuMessage(wakuMsg)
      if (msg) {
        dispatchMessages([msg])
      }
    }

    waku.relay.addObserver(handleRelayMessage, [ChatContentTopic])

    return function cleanUp() {
      waku?.relay.deleteObserver(handleRelayMessage, [ChatContentTopic])
    }
  }, [waku, historicalMessagesRetrieved])

  useEffect(() => {
    if (!waku) return
    if (historicalMessagesRetrieved) return

    const retrieveMessages = async () => {
      try {
        console.log(`Waku | attempting to Retrieving archived messages`)
        await waku.waitForRemotePeer(undefined, 2000)
        console.log(`Waku |Retrieving archived messages`)

        retrieveStoreMessages(waku, ChatContentTopic, dispatchMessages).then(
          (length) => {
            console.log(`Waku |Messages retrieved:`, length)
            setHistoricalMessagesRetrieved(true)
          }
        )
      } catch (e) {
        console.log(
          `Waku | Error encountered when retrieving archived messages`,
          e
        )
      }
    }

    retrieveMessages()
  }, [waku, historicalMessagesRetrieved])

  const handle = useSelector(getUserHandle)

  return (
    <div className={classNames(props.className, styles.chatbox)}>
      <div className={styles.title}>{audiusMessages.title}</div>
      <WakuContext.Provider value={{ waku }}>
        <Room
          nick={handle || 'no handle'}
          messages={messages}
          topic={ChatContentTopic}
        />
      </WakuContext.Provider>
    </div>
  )
}
