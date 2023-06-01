import { useCallback, useMemo } from 'react'

import type { ID, Name, TrackPlayback } from '@audius/common'
import {
  Kind,
  PlaybackSource,
  QueueSource,
  accountSelectors,
  getPathFromPlaylistUrl,
  makeUid,
  playerSelectors,
  useGetPlaylistById,
  useGetTracksByIds,
  usePlayTrack,
  usePauseTrack
} from '@audius/common'
import { useSelector } from 'react-redux'

import { CollectionTile } from 'app/components/lineup-tile'
import type { ChatMessageTileProps } from 'app/screens/chat-screen/ChatMessageTrack'
import { make, track as trackEvent } from 'app/services/analytics'

const { getUserId } = accountSelectors
const { getUid, getPlaying, getTrackId } = playerSelectors

export const ChatMessagePlaylist = ({
  link,
  isAuthor,
  onEmpty
}: ChatMessageTileProps) => {
  const currentUserId = useSelector(getUserId)
  const isPlaying = useSelector(getPlaying)
  const playingTrackId = useSelector(getTrackId)
  const playingUid = useSelector(getUid)

  const permalink = getPathFromPlaylistUrl(link)
  const playlistNameWithId = permalink?.split('/').slice(-1)[0] ?? ''
  const playlistId = parseInt(playlistNameWithId.split('-').slice(-1)[0])
  const { data: playlist } = useGetPlaylistById(
    {
      playlistId,
      currentUserId
    },
    { disabled: !playlistId }
  )
  const collection = playlist
    ? {
        ...playlist,
        // todo: make sure good value is passed in here
        _cover_art_sizes: {}
      }
    : null

  const uid = playlist ? makeUid(Kind.COLLECTIONS, playlist.playlist_id) : null
  const trackIds =
    playlist?.playlist_contents?.track_ids?.map((t) => t.track) ?? []
  const { data: tracks } = useGetTracksByIds(
    {
      ids: trackIds,
      currentUserId
    },
    { disabled: !trackIds.length }
  )
  const playlistTracks = tracks ?? []

  const uidMap = useMemo(() => {
    return trackIds.reduce((result: { [id: ID]: string }, id) => {
      result[id] = makeUid(Kind.TRACKS, id)
      return result
    }, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist?.playlist_id])
  const tracksWithUids = useMemo(() => {
    return playlistTracks.map((track) => ({
      ...track,
      // todo: make sure good value is passed in here
      _cover_art_sizes: {},
      user: {
        ...track.user,
        _profile_picture_sizes: {},
        _cover_photo_sizes: {}
      },
      id: track.track_id,
      uid: uidMap[track.track_id]
    }))
  }, [playlistTracks, uidMap])
  const entries = useMemo(() => {
    return playlistTracks.map((track) => ({
      id: track.track_id,
      uid: uidMap[track.track_id],
      source: QueueSource.CHAT_PLAYLIST_TRACKS
    }))
  }, [playlistTracks, uidMap])

  const isActive = playingUid !== null && playingUid === uid

  const recordAnalytics = useCallback(
    ({
      name,
      id
    }: {
      name: TrackPlayback
      id: ID
    }) => {
      trackEvent(
        make({
          eventName: name,
          id: `${id}`,
          source: PlaybackSource.CHAT_PLAYLIST_TRACK
        })
      )
    },
    []
  )

  const playTrack = usePlayTrack(recordAnalytics)
  const pauseTrack = usePauseTrack(recordAnalytics)

  const togglePlay = useCallback(() => {
    if (!isPlaying || !isActive) {
      if (isActive) {
        playTrack({ id: playingTrackId!, uid: playingUid!, entries })
      } else {
        const trackUid = tracksWithUids[0] ? tracksWithUids[0].uid : null
        const trackId = tracksWithUids[0] ? tracksWithUids[0].track_id : null
        if (!trackUid || !trackId) return
        playTrack({ id: trackId, uid: trackUid, entries })
      }
    } else {
      pauseTrack(playingTrackId!)
    }
  }, [
    isPlaying,
    isActive,
    playingUid,
    playingTrackId,
    entries,
    tracksWithUids,
    playTrack,
    pauseTrack
  ])

  if (!collection || !uid) {
    onEmpty?.()
    return null
  }

  return (
    <CollectionTile
      index={0}
      togglePlay={togglePlay}
      uid={uid}
      collection={collection}
      tracks={tracksWithUids}
      isTrending={false}
      showArtistPick={false}
      showRankIcon={false}
      isChat
    />
  )
}
