import { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { ID } from 'models'
import { getPlaying } from 'store/player/selectors'
import { QueueSource, queueActions } from 'store/queue'
import { makeGetCurrent } from 'store/queue/selectors'
import { Nullable } from 'utils'

const { clear, add, play, pause } = queueActions

export const useTrackPlayer = ({
  id,
  uid,
  queueSource,
  recordPlay,
  recordPause
}: {
  id: Nullable<ID>
  uid: Nullable<string>
  queueSource: QueueSource
  recordPlay?: () => void
  recordPause?: () => void
}) => {
  const dispatch = useDispatch()
  const currentQueueItem = useSelector(makeGetCurrent())
  const playing = useSelector(getPlaying)
  const isTrackPlaying =
    playing && !!currentQueueItem.track && currentQueueItem.uid === uid

  const togglePlay = useCallback(() => {
    if (!id || !uid) return
    if (isTrackPlaying) {
      dispatch(pause({}))
      recordPause?.()
    } else {
      dispatch(clear({}))
      dispatch(
        add({
          entries: [{ id, uid, source: queueSource }]
        })
      )
      dispatch(play({ uid }))
      recordPlay?.()
    }
  }, [dispatch, recordPlay, recordPause, isTrackPlaying, id, uid, queueSource])

  return { togglePlay, isTrackPlaying }
}
