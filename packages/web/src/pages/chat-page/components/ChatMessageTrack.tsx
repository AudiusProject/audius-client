import { useCallback, useMemo } from 'react'

import {
  Kind,
  Status,
  makeUid,
  PlaybackSource,
  QueueSource,
  accountSelectors,
  useGetTrackByPermalink,
  getPathFromTrackUrl,
  useToggleTrack,
  ID,
  TrackPlayback
} from '@audius/common'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { make } from 'common/store/analytics/actions'
import MobileTrackTile from 'components/track/mobile/ConnectedTrackTile'

import styles from './ChatMessageTrack.module.css'

const { getUserId } = accountSelectors

type ChatMessageTrackProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessageTrack = ({ link, isAuthor }: ChatMessageTrackProps) => {
  const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const permalink = getPathFromTrackUrl(link)

  const { data: track, status } = useGetTrackByPermalink(
    {
      permalink: permalink!,
      currentUserId: currentUserId!
    },
    { disabled: !permalink || !currentUserId }
  )

  const trackId = track?.track_id
  const uid = useMemo(() => {
    return trackId ? makeUid(Kind.TRACKS, trackId) : null
  }, [trackId])

  const recordAnalytics = useCallback(
    ({
      name,
      id
    }: {
      name: TrackPlayback
      id: ID
    }) => {
      if (!track) return
      dispatch(
        make(name, {
          id: `${id}`,
          source: PlaybackSource.CHAT_TRACK
        })
      )
    },
    [dispatch, track]
  )

  const { togglePlay, isTrackPlaying } = useToggleTrack({
    id: track?.track_id ?? null,
    uid,
    source: QueueSource.CHAT_TRACKS,
    recordAnalytics
  })

  return track && uid ? (
    <div className={cn(styles.container, { [styles.isAuthor]: isAuthor })}>
      {/* You may wonder why we use the mobile web track tile here.
      It's simply because the chat track tile uses the same design as mobile web. */}
      <MobileTrackTile
        index={0}
        togglePlay={togglePlay}
        uid={uid}
        isLoading={status === Status.LOADING || status === Status.IDLE}
        hasLoaded={() => {}}
        isTrending={false}
        showRankIcon={false}
        showArtistPick={false}
        isActive={isTrackPlaying}
        isChat
      />
    </div>
  ) : null
}
