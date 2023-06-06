import { useCallback, useMemo } from 'react'

import type { ChatMessageTileProps, ID, TrackPlayback } from '@audius/common'
import {
  Kind,
  PlaybackSource,
  QueueSource,
  accountSelectors,
  getPathFromTrackUrl,
  makeUid,
  useGetTrackByPermalink,
  useToggleTrack
} from '@audius/common'
import { useSelector } from 'react-redux'

import { TrackTile } from 'app/components/lineup-tile'
import { make, track as trackEvent } from 'app/services/analytics'

const { getUserId } = accountSelectors

export const ChatMessageTrack = ({
  link,
  onEmpty,
  onSuccess,
  styles
}: ChatMessageTileProps) => {
  const currentUserId = useSelector(getUserId)

  const permalink = getPathFromTrackUrl(link)
  const { data: track } = useGetTrackByPermalink(
    {
      permalink,
      currentUserId
    },
    { disabled: !permalink }
  )
  const item = track
    ? {
        ...track,
        // todo: make sure good value is passed in here
        _cover_art_sizes: {}
      }
    : null
  const user = track
    ? {
        ...track.user,
        // todo: make sure good values are passed in here
        _profile_picture_sizes: {},
        _cover_photo_sizes: {}
      }
    : null

  const trackId = track?.track_id
  const uid = useMemo(() => {
    return trackId ? makeUid(Kind.TRACKS, trackId) : null
  }, [trackId])

  const recordAnalytics = useCallback(
    ({ name, id }: { name: TrackPlayback; id: ID }) => {
      if (!track) return
      trackEvent(
        make({
          eventName: name,
          id: `${id}`,
          source: PlaybackSource.CHAT_TRACK
        })
      )
    },
    [track]
  )

  const { togglePlay } = useToggleTrack({
    id: track?.track_id,
    uid,
    source: QueueSource.CHAT_TRACKS,
    recordAnalytics
  })

  if (item && user && uid) {
    onSuccess?.()
  } else {
    onEmpty?.()
    return null
  }

  return (
    <TrackTile
      index={0}
      togglePlay={togglePlay}
      uid={uid}
      isTrending={false}
      showArtistPick={false}
      showRankIcon={false}
      styles={styles}
      variant='readonly'
    />
  )
}
