import { tracksSocialActions } from '@audius/common'
import queue, { Worker } from 'react-native-job-queue'

import { store } from 'app/store'

import { startQueueIfOnline } from './utils'

const { recordListen } = tracksSocialActions

export const PLAY_COUNTER_WORKER = 'play_counter_worker'

export type PlayCountWorkerPayload = { trackId: number }

const countPlay = async (payload: PlayCountWorkerPayload) => {
  const { trackId } = payload
  store.dispatch(recordListen(trackId))
}

export const setPlayCounterWorker = async (
  worker: Worker<PlayCountWorkerPayload>
) => {
  queue.stop()
  queue.removeWorker(PLAY_COUNTER_WORKER)
  queue.addWorker(worker)
  await startQueueIfOnline()
}

export const playCounterWorker = new Worker(PLAY_COUNTER_WORKER, countPlay)
