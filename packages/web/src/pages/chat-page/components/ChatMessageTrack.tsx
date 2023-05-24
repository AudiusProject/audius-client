import { useCallback, useMemo } from 'react'

import {
  Kind,
  Status,
  makeUid,
  Track,
  queueSelectors,
  playerSelectors,
  Name,
  PlaybackSource,
  queueActions,
  QueueSource
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { make } from 'common/store/analytics/actions'
import MobileTrackTile from 'components/track/mobile/ConnectedTrackTile'

const { makeGetCurrent } = queueSelectors
const { getPlaying } = playerSelectors
const { clear, add, play, pause } = queueActions

type ChatMessageTrackProps = {
  track: Track | undefined | null
  status: Status
  errorMessage: string | null | undefined
}

export const ChatMessageTrack = ({
  track,
  status,
  errorMessage
}: ChatMessageTrackProps) => {
  const dispatch = useDispatch()
  const currentQueueItem = useSelector(makeGetCurrent())
  const uid = useMemo(() => {
    return track ? makeUid(Kind.TRACKS, track.track_id) : ''
  }, [track])
  const playing = useSelector(getPlaying)
  const isTrackPlaying =
    playing &&
    !!track &&
    !!currentQueueItem.track &&
    currentQueueItem.track.track_id === track.track_id

  const recordAnalytics = useCallback(
    ({ name, source }: { name: Name; source: PlaybackSource }) => {
      if (!track) return
      dispatch(
        make(name, {
          id: `${track.track_id}`,
          source
        })
      )
    },
    [dispatch, track]
  )

  const onTogglePlay = useCallback(() => {
    if (!track) return
    if (isTrackPlaying) {
      dispatch(pause({}))
      recordAnalytics({
        name: Name.PLAYBACK_PAUSE,
        source: PlaybackSource.CHAT_TRACK
      })
    } else if (
      currentQueueItem.uid !== uid &&
      currentQueueItem.track &&
      currentQueueItem.track.track_id === track.track_id
    ) {
      dispatch(play({}))
      recordAnalytics({
        name: Name.PLAYBACK_PLAY,
        source: PlaybackSource.CHAT_TRACK
      })
    } else {
      dispatch(clear({}))
      dispatch(
        add({
          entries: [{ id: track.track_id, uid, source: QueueSource.CHAT_TRACKS }]
        })
      )
      dispatch(play({ uid }))
      recordAnalytics({
        name: Name.PLAYBACK_PLAY,
        source: PlaybackSource.CHAT_TRACK
      })
    }
  }, [dispatch, recordAnalytics, track, isTrackPlaying, currentQueueItem, uid])

  if (status === Status.ERROR) {
    return (
      // todo
      <div>error</div>
    )
  }

  return (
    // You may wonder why we use the mobile web track tile here.
    // It's simply because the DMs track tile uses the same design as mobile web.
    <MobileTrackTile
      index={0}
      togglePlay={onTogglePlay}
      uid={uid}
      isLoading={status === Status.LOADING || status === Status.IDLE}
      hasLoaded={() => {}}
      isTrending={false}
      showRankIcon={false}
      showArtistPick={false}
      isActive={isTrackPlaying}
      isChat
    />
  )
}
