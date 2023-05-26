import { TrackTile } from 'app/components/lineup-tile'
import { Kind, Name, PlaybackSource, QueueSource, accountSelectors, getPathFromTrackUrl, makeUid, playerSelectors, queueActions, queueSelectors, useGetTrackByPermalink } from "@audius/common"
import { useDispatch, useSelector } from "react-redux"
import { useCallback, useMemo } from "react"
import { make } from 'common/store/analytics/actions'

const { getUserId } = accountSelectors
const { makeGetCurrent } = queueSelectors
const { getPlaying } = playerSelectors
const { clear, add, play, pause } = queueActions

type ChatMessageTrackProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessageTrack = ({ link, isAuthor }: ChatMessageTrackProps) => {
  const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const currentQueueItem = useSelector(makeGetCurrent())
  const playing = useSelector(getPlaying)

  const permalink = getPathFromTrackUrl(link)
  const { data: track, status } = useGetTrackByPermalink(
    {
      permalink,
      currentUserId
    },
    { disabled: !permalink }
  )
  const item = track ? {
    ...track,
    // todo: make sure good value is passed in here
    _cover_art_sizes: {}
  } : null
  const user = track ? {
    ...track.user,
    // todo: make sure good values are passed in here
    _profile_picture_sizes: {},
    _cover_photo_sizes: {}
  } : null

  const uid = useMemo(() => {
    return track ? makeUid(Kind.TRACKS, track.track_id) : ''
  }, [track])
  const isTrackPlaying =
    playing &&
    !!track &&
    !!currentQueueItem.track &&
    currentQueueItem.uid === uid

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
    } else {
      dispatch(clear({}))
      dispatch(
        add({
          entries: [
            { id: track.track_id, uid, source: QueueSource.CHAT_TRACKS }
          ]
        })
      )
      dispatch(play({ uid }))
      recordAnalytics({
        name: Name.PLAYBACK_PLAY,
        source: PlaybackSource.CHAT_TRACK
      })
    }
  }, [dispatch, recordAnalytics, track, isTrackPlaying, currentQueueItem, uid])

  return item && user ? (
    <TrackTile
      index={0}
      togglePlay={onTogglePlay}
      uid={uid}
      isTrending={false}
      showArtistPick={false}
      showRankIcon={false}
      isChat
    />
  ) : null
}
