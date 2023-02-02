import { useCallback, useMemo } from 'react'

import {
  savedPageTracksLineupActions,
  Kind,
  makeUid,
  cacheActions,
  savedPageSelectors
} from '@audius/common'
import { isEqual, debounce, orderBy } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useReachabilityEffect } from 'app/hooks/useReachabilityEffect'
import { DOWNLOAD_REASON_FAVORITES } from 'app/services/offline-downloader'
import { store } from 'app/store'
import { getOfflineTracks } from 'app/store/offline-downloads/selectors'

const { getSavedTracksLineup } = savedPageSelectors

/**
 * Returns a favorites lineup, supports boths online and offline
 * @param fetchLineup the numeric collection id
 */
export const useFavoritesLineup = (fetchLineup: () => void) => {
  const dispatch = useDispatch()
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const offlineTracks = useSelector(getOfflineTracks)
  const savedTracks = useSelector(getSavedTracksLineup)
  const savedTracksUidMap = savedTracks.entries.reduce((acc, track) => {
    acc[track.id] = track.uid
    return acc
  }, {})
  const lineup = useSelector(getSavedTracksLineup)

  const debouncedFetchSavesOnline = useMemo(() => {
    return debounce((filterVal) => {
      dispatch(fetchSaves(filterVal, '', '', 0, FETCH_LIMIT))
    }, 500)
  }, [dispatch])

  const fetchSavesOnline = useCallback(() => {
    debouncedFetchSavesOnline(filterValue)
  }, [debouncedFetchSavesOnline, filterValue])

  useEffect(() => {
    if (isReachable) {
      fetchSavesOnline()
    }
  }, [isReachable, fetchSavesOnline])

  const fetchLineupOffline = useCallback(() => {
    if (isOfflineModeEnabled) {
      const lineupTracks = Object.values(offlineTracks)
        .filter((track) =>
          track.offline?.reasons_for_download.some(
            (reason) => reason.collection_id === DOWNLOAD_REASON_FAVORITES
          )
        )
        .map((track) => ({
          uid:
            savedTracksUidMap[track.track_id] ??
            makeUid(Kind.TRACKS, track.track_id),
          id: track.track_id,
          dateSaved: track.offline?.favorite_created_at,
          kind: Kind.TRACKS
        }))

      const cacheTracks = lineupTracks.map((track) => ({
        id: track.id,
        uid: track.uid,
        metadata: track
      }))

      store.dispatch(cacheActions.add(Kind.TRACKS, cacheTracks, false, true))

      // Reorder lineup tracks according to favorite time
      const sortedTracks = orderBy(lineupTracks, (track) => track.dateSaved, [
        'desc'
      ])
      dispatch(
        savedPageTracksLineupActions.fetchLineupMetadatasSucceeded(
          sortedTracks,
          0,
          sortedTracks.length,
          0,
          0
        )
      )
    }
  }, [dispatch, isOfflineModeEnabled, offlineTracks, savedTracksUidMap])

  // Fetch the lineup based on reachability
  useReachabilityEffect(fetchLineup, fetchLineupOffline)

  return lineup
}
