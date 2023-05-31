import { useCallback, useMemo } from 'react'

import type { ID, Name } from '@audius/common'
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

type ChatMessageTrackProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessageTrack = ({ link, isAuthor }: ChatMessageTrackProps) => {
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

  const uid = useMemo(() => {
    return track ? makeUid(Kind.TRACKS, track.track_id) : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.track_id])

  const recordAnalytics = useCallback(
    ({
      name,
      id
    }: {
      name: Name.PLAYBACK_PLAY | Name.PLAYBACK_PAUSE
      id: ID
    }) => {
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
    id: track?.track_id ?? null,
    uid,
    source: QueueSource.CHAT_TRACKS,
    recordAnalytics
  })

  return item && user && uid ? (
    <TrackTile
      index={0}
      togglePlay={togglePlay}
      uid={uid}
      isTrending={false}
      showArtistPick={false}
      showRankIcon={false}
      isChat
    />
  ) : null
}
