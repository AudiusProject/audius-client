import { PageDirection, Waku, WakuMessage } from 'js-waku'

import { Message } from './Message'

export const retrieveStoreMessages = async (
  waku: Waku,
  topic: string,
  setArchivedMessages: (value: Message[]) => void
): Promise<number> => {
  const callback = (wakuMessages: WakuMessage[]): void => {
    const messages: Message[] = []
    wakuMessages
      .map((wakuMsg) => Message.fromWakuMessage(wakuMsg))
      .forEach((message) => {
        if (message) {
          messages.push(message)
        }
      })
    setArchivedMessages(messages)
  }

  const startTime = new Date()
  // Only retrieve a week of history
  startTime.setTime(Date.now() - 1000 * 60 * 60 * 24 * 7)

  const endTime = new Date()

  try {
    const res = await waku.store.queryHistory([topic], {
      pageSize: 5,
      pageDirection: PageDirection.FORWARD,
      timeFilter: {
        startTime,
        endTime
      },
      callback
    })

    return res.length
  } catch (e) {
    console.log('Waku |Failed to retrieve messages', e)
    return 0
  }
}
