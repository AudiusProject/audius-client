import type { Track, User } from '@audius/common'
import { cacheTracksSelectors, cacheUsersSelectors } from '@audius/common'
import queue, { Worker } from 'react-native-job-queue'

import { store } from 'app/store'
import { getItemOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import {
  completeDownload,
  errorDownload,
  OfflineItemDownloadStatus,
  startDownload
} from 'app/store/offline-downloads/slice'

import { downloadTrack } from './offline-downloader'
import { markCollectionDownloaded } from './offline-storage'
const { getTrack } = cacheTracksSelectors
const { getUser } = cacheUsersSelectors

const COLLECTION_DOWNLOAD_WORKER = 'collection_download_worker'
const TRACK_DOWNLOAD_WORKER = 'track_download_worker'

export type CollectionDownloadWorkerPayload = {
  collection: string
  trackIds: string[]
}

export type TrackDownloadWorkerPayload = {
  track: Track
  user: User
  collection: string
}

/** Main entrypoint - perform all steps required to complete a download for each track */
export const enqueueCollectionDownload = async (
  collection: string,
  trackIds: number[]
) => {
  store.dispatch(startDownload(collection))
  queue.addJob(
    COLLECTION_DOWNLOAD_WORKER,
    { collection, trackIds },
    {
      attempts: -1,
      priority: 2,
      timeout: 10000
    }
  )
  trackIds.forEach((trackId) => enqueueTrackDownload(trackId, collection))
}

export const enqueueTrackDownload = async (
  trackId: number,
  collection: string
) => {
  const state = store.getState()
  const track = getTrack(state, { id: trackId })
  const user = getUser(state, { id: track?.owner_id })
  const trackIdString = trackId.toString()
  if (!track || !user) {
    // TODO: try getting it from the API
    store.dispatch(errorDownload(trackIdString))
    return false
  }

  store.dispatch(startDownload(trackIdString))

  queue.addJob(
    TRACK_DOWNLOAD_WORKER,
    { track, collection, user },
    {
      attempts: 3,
      priority: 1,
      timeout: 10000
    }
  )
}

const checkCollectionStatus = async ({
  collection,
  trackIds
}: CollectionDownloadWorkerPayload) => {
  const state = store.getState()
  console.log('Checking collection status', collection)
  const trackStatus = trackIds.map((trackId) =>
    getItemOfflineDownloadStatus(trackId)(state)
  )

  if (
    trackStatus.every((status) => status === OfflineItemDownloadStatus.ERROR)
  ) {
    console.log('Collection error', collection)
    store.dispatch(errorDownload(collection))
    return
  }

  if (
    trackStatus.every(
      (status) =>
        status === OfflineItemDownloadStatus.SUCCESS ||
        status === OfflineItemDownloadStatus.ERROR
    )
  ) {
    console.log('Collection done', collection)
    markCollectionDownloaded(collection, false)
    store.dispatch(completeDownload(collection))
  }
}

export const startDownloadWorker = () => {
  queue.configure({
    onQueueFinish: (executedJobs) => {
      console.log('Queue stopped and executed', executedJobs)
    },
    concurrency: 10,
    updateInterval: 10
  })

  const collectionWorker = queue.registeredWorkers[COLLECTION_DOWNLOAD_WORKER]
  // Reset worker to improve devEx. Forces the worker to take code updates across reloads
  if (collectionWorker) queue.removeWorker(COLLECTION_DOWNLOAD_WORKER, true)
  queue.addWorker(new Worker(COLLECTION_DOWNLOAD_WORKER, checkCollectionStatus))

  const worker = queue.registeredWorkers[TRACK_DOWNLOAD_WORKER]
  // Reset worker to improve devEx. Forces the worker to take code updates across reloads
  if (worker) queue.removeWorker(TRACK_DOWNLOAD_WORKER, true)
  queue.addWorker(new Worker(TRACK_DOWNLOAD_WORKER, downloadTrack))
}

// TODO: remove -- debugging only
global.workQueue = queue
global.startDownloadWorker = startDownloadWorker
