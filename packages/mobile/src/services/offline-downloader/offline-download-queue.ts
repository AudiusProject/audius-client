import type { UserTrackMetadata, Track, User } from '@audius/common'
import { cacheTracksSelectors, cacheUsersSelectors } from '@audius/common'
import queue, { Worker } from 'react-native-job-queue'

import { store } from 'app/store'
import {
  completeDownload,
  errorDownload,
  loadTrack,
  startDownload
} from 'app/store/offline-downloads/slice'

import {
  downloadCoverArt,
  tryDownloadTrackFromEachCreatorNode,
  writeUserTrackJson
} from './offline-downloader'
import { getTrackJson, verifyTrack, writeTrackJson } from './offline-storage'
const { getTrack } = cacheTracksSelectors
const { getUser } = cacheUsersSelectors

const TRACK_DOWNLOAD_WORKER = 'track_download_worker'

type TrackDownloadWorkerPayload = {
  track: Track
  user: User
  collection: string
}

export const enqueueDownload = async (trackId: number, collection: string) => {
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
      priority: 0,
      timeout: 10000
    }
  )
}

export const startDownloadWorker = () => {
  queue.addWorker(
    new Worker(
      TRACK_DOWNLOAD_WORKER,
      async ({ track, user, collection }: TrackDownloadWorkerPayload) => {
        const trackIdStr = track.track_id.toString()
        console.log(
          'Queue downloading track',
          trackIdStr,
          collection,
          'by',
          user.user_id
        )
        try {
          if (await verifyTrack(trackIdStr, false)) {
            // Track already downloaded, so rewrite the json
            // to include this collection in the downloaded_from_collection list
            const trackJson = await getTrackJson(trackIdStr)
            const trackToWrite: UserTrackMetadata = {
              ...trackJson,
              offline: {
                download_completed_time:
                  trackJson.offline?.download_completed_time ?? Date.now(),
                last_verified_time:
                  trackJson.offline?.last_verified_time ?? Date.now(),
                downloaded_from_collection:
                  trackJson.offline?.downloaded_from_collection?.concat(
                    collection
                  ) ?? [collection]
              }
            }
            await writeTrackJson(trackIdStr, trackToWrite)
            store.dispatch(loadTrack(track))
            store.dispatch(completeDownload(trackIdStr))
            return
          }

          await downloadCoverArt(track)
          await tryDownloadTrackFromEachCreatorNode(track)
          await writeUserTrackJson(track, user, collection)
          const verified = await verifyTrack(trackIdStr, true)
          if (verified) {
            store.dispatch(loadTrack(track))
            store.dispatch(completeDownload(trackIdStr))
          } else {
            store.dispatch(errorDownload(trackIdStr))
          }
          return verified
        } catch (e) {
          store.dispatch(errorDownload(trackIdStr))
          console.error(e)
          return false
        }
      }
    )
  )
}
