import { useCallback, useMemo } from 'react'

import {
  Kind,
  Status,
  makeUid,
  ID,
  QueueSource,
  playerSelectors,
  getPathFromPlaylistUrl,
  useGetPlaylistById,
  accountSelectors,
  useGetTracksByIds,
  usePlayTrack,
  usePauseTrack
} from '@audius/common'
import cn from 'classnames'
import { useSelector } from 'react-redux'

import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'

import styles from './ChatMessagePlaylist.module.css'

const { getUserId } = accountSelectors
const { getTrackId } = playerSelectors

type ChatMessagePlaylistProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessagePlaylist = ({
  link,
  isAuthor
}: ChatMessagePlaylistProps) => {
  const currentUserId = useSelector(getUserId)
  const playingTrackId = useSelector(getTrackId)

  const permalink = getPathFromPlaylistUrl(link)
  const playlistNameWithId = permalink?.split('/').slice(-1)[0] ?? ''
  const playlistId = parseInt(playlistNameWithId.split('-').slice(-1)[0])
  const { data: playlist, status } = useGetPlaylistById(
    {
      playlistId,
      currentUserId: currentUserId!
    },
    { disabled: !playlistId || !currentUserId }
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
      currentUserId: currentUserId!
    },
    { disabled: !trackIds.length || !currentUserId }
  )

  const uidMap = useMemo(() => {
    return trackIds.reduce((result: { [id: ID]: string }, id) => {
      result[id] = makeUid(Kind.TRACKS, id)
      return result
    }, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist?.playlist_id])
  const tracksWithUids = useMemo(() => {
    return (tracks || []).map((track) => ({
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
  }, [tracks, uidMap])
  const entries = useMemo(() => {
    return (tracks || []).map((track) => ({
      id: track.track_id,
      uid: uidMap[track.track_id],
      source: QueueSource.CHAT_PLAYLIST_TRACKS
    }))
  }, [tracks, uidMap])

  const play = usePlayTrack()
  const playTrack = useCallback(
    (uid: string) => {
      play({ uid, entries })
    },
    [play, entries]
  )

  const pauseTrack = usePauseTrack()

  return collection && uid ? (
    <div className={cn(styles.container, { [styles.isAuthor]: isAuthor })}>
      {/* You may wonder why we use the mobile web playlist tile here.
      It's simply because the chat playlist tile uses the same design as mobile web. */}
      <MobilePlaylistTile
        index={0}
        uid={uid}
        collection={collection}
        tracks={tracksWithUids}
        playTrack={playTrack}
        pauseTrack={pauseTrack}
        hasLoaded={() => {}}
        isLoading={status === Status.LOADING || status === Status.IDLE}
        isTrending={false}
        showRankIcon={false}
        numLoadingSkeletonRows={tracksWithUids.length}
        togglePlay={() => {}}
        playingTrackId={playingTrackId}
        isChat
      />
    </div>
  ) : null
}
