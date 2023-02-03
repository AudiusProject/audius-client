import { reachabilitySelectors } from '@audius/common'
import queue from 'react-native-job-queue'

import { store } from 'app/store'

const getIsReachable = reachabilitySelectors.getIsReachable

export const startQueueIfOnline = async () => {
  const state = store.getState()
  const reachable = getIsReachable(state)
  if (reachable) {
    console.log('actually starting queue')
    return queue.start()
  }
}
