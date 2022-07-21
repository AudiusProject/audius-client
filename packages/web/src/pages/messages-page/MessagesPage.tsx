import React, { useCallback, useEffect, useReducer, useState } from 'react'

import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'

import { Waku, WakuMessage } from 'js-waku'
import { ReactNodeLike } from 'prop-types'
import { useSelector } from 'react-redux'

import { getAccountUser } from 'common/store/account/selectors'

import { Message } from 'services/waku/Message'
import { retrieveStoreMessages } from 'services/waku/retrieveStoreMessages'
import { initWaku } from 'services/waku/waku'
import { WakuContext } from 'services/waku/wakuContext'

import Chat from './components/Chat'
import UserChats from './components/UserChats'

import styles from './MessagesPage.module.css'
import { checkIsInviteMessage } from 'services/waku/utils'

const ChatContentTopic = '/toy-chat/2/huilong/proto'

export const messages = {
  title: 'Messages',
  description: 'Decentralized chat, end to end encrypted!'
}

const reduceMessages = (
  state: Message[],
  newMessages: Message[],
  action: 'clear' | 'add' = 'add'
) => {
  if (action === 'add') {
    return state.concat(newMessages)
  } else if (action === 'clear') {
    return []
  }
}

export const MessagesContent = (props: {
  messages: Message[]
  handles: string[]
  resetMessages: () => void
}) => {
  const currentUser = useSelector(getAccountUser)
  return (
    <>
      <div className={styles.container}>
        <UserChats
          topic={ChatContentTopic}
          className={styles.userChats}
          handles={props.handles}
          resetMessages={props.resetMessages}
        />
        <Chat
          className={styles.chat}
          handle={currentUser?.handle ?? 'no handle?'}
          messages={props.messages}
          topic={ChatContentTopic}
        />
      </div>
    </>
  )
}

export const DesktopPage = ({ children }: { children: ReactNodeLike }) => {
  const header = <Header primary={messages.title} />
  return (
    <Page
      title={messages.title}
      description={messages.description}
      contentClassName={styles.pageContent}
      containerClassName={styles.pageContainer}
      variant={'flush'}
      header={header}>
      {children}
    </Page>
  )
}

export const MessagesPage = () => {
  const [waku, setWaku] = useState<Waku | undefined>(undefined)
  const [activeHandle, setActiveHandle] = useState<string | undefined>(
    undefined
  )
  const [historicalMessagesRetrieved, setHistoricalMessagesRetrieved] =
    useState(false)
  const [messages, dispatchMessages] = useReducer(reduceMessages, [])
  const resetMessages = useCallback(() => {
    dispatchMessages([], 'clear')
    setHistoricalMessagesRetrieved(false)
  }, [dispatchMessages, setHistoricalMessagesRetrieved])
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
      if (msg && !checkIsInviteMessage(msg)) {
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

  // TODO: make mobile page and ternary on page
  const Page = DesktopPage
  console.log({ messages })
  // const handles = [...new Set(messages.map((msg) => msg.chatMessage.handle))]
  const handles = ['joe']
  console.log({ handles })
  return (
    <Page>
      <WakuContext.Provider value={{ waku, activeHandle, setActiveHandle }}>
        <MessagesContent handles={handles} messages={messages} resetMessages={resetMessages} />
      </WakuContext.Provider>
    </Page>
  )
}

export default MessagesPage
