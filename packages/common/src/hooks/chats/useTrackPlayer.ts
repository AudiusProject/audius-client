import { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { ID, Name } from 'models'
import { getPlaying, getUid } from 'store/player/selectors'
import { QueueSource, Queueable, queueActions } from 'store/queue'
import { makeGetCurrent } from 'store/queue/selectors'
import { Nullable } from 'utils'
import { TrackPlayback } from './types'

const { clear, add, play, pause } = queueActions

type RecordAnalytics = ({
  name,
  id
}: {
  name: TrackPlayback
  id: ID
}) => void

type UseToggleTrack = {
  uid: Nullable<string>
  source: QueueSource
  recordAnalytics: RecordAnalytics
  id?: Nullable<ID>
}

export const usePlayTrack = (recordAnalytics?: RecordAnalytics) => {
  const dispatch = useDispatch()
  const playingUid = useSelector(getUid)

  const playTrack = useCallback(
    ({ id, uid, entries }: { id?: ID; uid: string; entries: Queueable[] }) => {
      if (playingUid !== uid) {
        dispatch(clear({}))
        dispatch(add({ entries }))
        dispatch(play({ uid }))
      } else {
        dispatch(play({}))
      }
      if (recordAnalytics && id) {
        recordAnalytics({ name: Name.PLAYBACK_PLAY, id })
      }
    },
    [dispatch, recordAnalytics, playingUid]
  )

  return playTrack
}

export const usePauseTrack = (recordAnalytics?: RecordAnalytics) => {
  const dispatch = useDispatch()

  const pauseTrack = useCallback(
    (id?: ID) => {
      dispatch(pause({}))
      if (recordAnalytics && id) {
        recordAnalytics({ name: Name.PLAYBACK_PLAY, id })
      }
    },
    [dispatch, recordAnalytics]
  )

  return pauseTrack
}

export const useToggleTrack = ({
  uid,
  source,
  recordAnalytics,
  id
}: UseToggleTrack) => {
  const currentQueueItem = useSelector(makeGetCurrent())
  const playing = useSelector(getPlaying)
  const isTrackPlaying =
    playing && !!currentQueueItem.track && currentQueueItem.uid === uid

  const playTrack = usePlayTrack(recordAnalytics)
  const pauseTrack = usePauseTrack(recordAnalytics)

  const togglePlay = useCallback(() => {
    if (!id || !uid) return
    if (isTrackPlaying) {
      pauseTrack(id)
    } else {
      playTrack({ id, uid, entries: [{ id, uid, source }] })
    }
  }, [playTrack, pauseTrack, isTrackPlaying, id, uid, source])

  return { togglePlay, isTrackPlaying }
}
