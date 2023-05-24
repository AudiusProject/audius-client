import { Kind, Status, makeUid, ID, QueueSource, playerSelectors, queueActions, getPathFromPlaylistUrl, useGetPlaylistById, accountSelectors, useGetTracksByIds } from '@audius/common'

import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cn from 'classnames'
import styles from './ChatMessagePlaylist.module.css'

const { getUserId } = accountSelectors
const { getUid } = playerSelectors
const { clear, add, play, pause } = queueActions

type ChatMessagePlaylistProps = {
  link: string
  isAuthor: boolean
}

export const ChatMessagePlaylist = ({ link, isAuthor }: ChatMessagePlaylistProps) => {
  const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const playingUid = useSelector(getUid)

  const permalink = getPathFromPlaylistUrl(link)
  const playlistNameWithId = permalink?.split('/').slice(-1)[0] ?? ''
  const playlistId = parseInt(playlistNameWithId.split('-').slice(-1)[0])
  const {
    data: playlist,
    status
  } = useGetPlaylistById({
    playlistId,
    currentUserId
  }, { disabled: !playlistId })

  const uid = playlist ? makeUid(Kind.COLLECTIONS, playlist.playlist_id) : ''
  const trackIds = playlist?.playlist_contents?.track_ids?.map(t => t.track) ?? []
  const {
    data: tracks
  } = useGetTracksByIds({
    ids: trackIds,
    currentUserId
  }, { disabled: !trackIds.length })
  const playlistTracks = tracks ?? []

  const uidMap = useMemo(() => {
    return trackIds.reduce((result: { [id: ID]: string }, id) => {
      result[id] = makeUid(Kind.TRACKS, id)
      return result
    }, {})
  }, [playlist?.playlist_id])
  const tracksWithUids = playlistTracks.map((track) => ({
    ...track,
    id: track.track_id,
    uid: uidMap[track.track_id]
  }))
  const entries = playlistTracks.map((track) => ({
    id: track.track_id,
    uid: uidMap[track.track_id],
    source: QueueSource.CHAT_PLAYLIST_TRACKS
  }))

  const playTrack = useCallback((uid: string) => {
    if (playingUid !== uid) {
      dispatch(clear({}))
      dispatch(
        add({ entries })
      )
      dispatch(play({ uid }))
    } else {
      dispatch(play({}))
    }
  }, [dispatch, playingUid, entries])

  const pauseTrack = useCallback(() => {
    dispatch(pause({}))
  }, [dispatch])

  return playlist ? (
    <div className={cn(styles.container, { [styles.isAuthor]: isAuthor })}>
      {/* You may wonder why we use the mobile web track tile here.
      It's simply because the DMs track tile uses the mobile web version. */}
      <MobilePlaylistTile
        index={0}
        uid={uid}
        collection={playlist}
        tracks={tracksWithUids}
        playTrack={playTrack}
        pauseTrack={pauseTrack}
        hasLoaded={() => {}}
        isLoading={status === Status.LOADING || status === Status.IDLE}
        isTrending={false}
        showRankIcon={false}
        numLoadingSkeletonRows={tracksWithUids.length}
        isChat
      />
    </div>
  ) : null
}
