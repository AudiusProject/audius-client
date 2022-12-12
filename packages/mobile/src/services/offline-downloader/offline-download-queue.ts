import queue, { Worker } from 'react-native-job-queue'

import { store } from 'app/store'
import {
  batchStartDownload,
  errorDownload
} from 'app/store/offline-downloads/slice'

import { downloadTrack } from './offline-downloader'

const TRACK_DOWNLOAD_WORKER = 'track_download_worker'

export type TrackDownloadWorkerPayload = {
  trackId: number
  collection: string
}

export const enqueueTrackDownload = async (
  trackId: number,
  collection: string
) => {
  queue.addJob(
    TRACK_DOWNLOAD_WORKER,
    { trackId, collection },
    {
      attempts: 3,
      priority: 1,
      timeout: 30000 // TODO: what's a reasonable timeout?
    }
  )
}

export const startDownloadWorker = async () => {
  queue.stop()
  queue.configure({
    concurrency: 10,
    updateInterval: 10
  })

  const worker = queue.registeredWorkers[TRACK_DOWNLOAD_WORKER]
  // Reset worker to improve devEx. Forces the worker to take code updates across reloads
  if (worker) queue.removeWorker(TRACK_DOWNLOAD_WORKER, true)
  queue.addWorker(
    new Worker(TRACK_DOWNLOAD_WORKER, downloadTrack, {
      onFailure: ({ payload }) => {
        store.dispatch(errorDownload(payload.trackId.toString()))
      },
      concurrency: 10
    })
  )

  // Sync leftover jobs from last session to redux state
  const jobs = await queue.getJobs()
  const trackIdsInQueue: string[] = []
  jobs
    .filter((job) => job.workerName === TRACK_DOWNLOAD_WORKER)
    .forEach((job) => {
      try {
        const { payload, failed } = job
        const parsedPayload: TrackDownloadWorkerPayload = JSON.parse(payload)
        const trackId = parsedPayload.trackId
        if (failed) {
          store.dispatch(errorDownload(trackId.toString()))
          queue.removeJob(job)
        } else {
          trackIdsInQueue.push(parsedPayload.trackId.toString())
        }
      } catch (e) {
        console.warn(e)
      }
    })

  store.dispatch(batchStartDownload(trackIdsInQueue))

  queue.start()
}
