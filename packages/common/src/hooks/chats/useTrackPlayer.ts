import { useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { ID, Name } from 'models'
import { getPlaying } from 'store/player/selectors'
import { QueueSource, queueActions } from 'store/queue'
import { makeGetCurrent } from 'store/queue/selectors'
import { Nullable } from 'utils'

const { clear, add, play, pause } = queueActions

export const useTrackPlayer = ({
  id,
  uid,
  source,
  recordAnalytics
}: {
  id: Nullable<ID>
  uid: Nullable<string>
  source: QueueSource
  recordAnalytics: (name: Name.PLAYBACK_PLAY | Name.PLAYBACK_PAUSE) => void
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
      recordAnalytics(Name.PLAYBACK_PAUSE)
    } else {
      dispatch(clear({}))
      dispatch(
        add({
          entries: [{ id, uid, source }]
        })
      )
      dispatch(play({ uid }))
      recordAnalytics(Name.PLAYBACK_PLAY)
    }
  }, [dispatch, recordAnalytics, isTrackPlaying, id, uid, source])

  return { togglePlay, isTrackPlaying }
}
