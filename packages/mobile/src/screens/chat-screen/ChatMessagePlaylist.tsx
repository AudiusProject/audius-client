import { useCallback, useMemo } from 'react'

import type { ID } from '@audius/common'
import {
  Kind,
  Name,
  PlaybackSource,
  QueueSource,
  accountSelectors,
  getPathFromPlaylistUrl,
  makeUid,
  playerSelectors,
  queueActions,
  useGetPlaylistById,
  useGetTracksByIds
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import { CollectionTile } from 'app/components/lineup-tile'
import { make, track as trackEvent } from 'app/services/analytics'

const { getUserId } = accountSelectors
const { getUid, getPlaying, getTrackId } = playerSelectors
const { clear, add, play, pause } = queueActions

type ChatMessageTrackProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessagePlaylist = ({
  link,
  isAuthor
}: ChatMessageTrackProps) => {
  const dispatch = useDispatch()
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
  const tracksWithUids = playlistTracks.map((track) => ({
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
  const entries = playlistTracks.map((track) => ({
    id: track.track_id,
    uid: uidMap[track.track_id],
    source: QueueSource.CHAT_PLAYLIST_TRACKS
  }))

  const isActive = playingUid !== null && playingUid === uid

  const playTrack = useCallback(
    (uid: string) => {
      if (playingUid !== uid) {
        dispatch(clear({}))
        dispatch(add({ entries }))
        dispatch(play({ uid }))
      } else {
        dispatch(play({}))
      }
    },
    [dispatch, playingUid, entries]
  )

  const pauseTrack = useCallback(() => {
    dispatch(pause({}))
  }, [dispatch])

  const recordAnalytics = useCallback(
    ({
      eventName,
      id
    }: {
      eventName: Name.PLAYBACK_PLAY | Name.PLAYBACK_PAUSE
      id: ID
    }) => {
      trackEvent(
        make({
          eventName,
          id: `${id}`,
          source: PlaybackSource.CHAT_PLAYLIST_TRACK
        })
      )
    },
    []
  )

  const togglePlay = useCallback(() => {
    if (!isPlaying || !isActive) {
      if (isActive) {
        playTrack(playingUid!)
        recordAnalytics({ eventName: Name.PLAYBACK_PLAY, id: playingTrackId! })
      } else {
        const trackUid = tracksWithUids[0] ? tracksWithUids[0].uid : null
        const trackId = tracksWithUids[0] ? tracksWithUids[0].track_id : null
        if (!trackUid || !trackId) return
        playTrack(trackUid)
        recordAnalytics({ eventName: Name.PLAYBACK_PLAY, id: trackId })
      }
    } else {
      pauseTrack()
      recordAnalytics({ eventName: Name.PLAYBACK_PAUSE, id: playingTrackId! })
    }
  }, [
    isPlaying,
    isActive,
    playingUid,
    playingTrackId,
    tracksWithUids,
    playTrack,
    pauseTrack,
    recordAnalytics
  ])

  return playlist && uid ? (
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
  ) : null
}
