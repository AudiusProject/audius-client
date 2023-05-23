import { Collection, Kind, Status, makeUid, ID, queueSelectors, QueueSource, playerSelectors, queueActions, accountSelectors } from '@audius/common'

import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const { getUid } = playerSelectors
const { clear, add, play, pause } = queueActions
const { getAccountUser } = accountSelectors

type ChatMessagePlaylistProps = {
  playlist: Collection | undefined | null
  status: Status
  errorMessage: string | null | undefined
}

export const ChatMessagePlaylist = ({
  playlist,
  status,
  errorMessage
}: ChatMessagePlaylistProps) => {
  const dispatch = useDispatch()
  const currentUser = useSelector(getAccountUser)
  const playingUid = useSelector(getUid)
  const uid = playlist ? makeUid(Kind.COLLECTIONS, playlist.playlist_id) : ''
  const uidMap = useMemo(() => {
    return playlist?.tracks?.reduce((result: { [id: ID]: string }, track) => {
      result[track.track_id] = makeUid(Kind.TRACKS, track.track_id)
      return result
    }, {}) ?? []
  }, [playlist])
  const tracksWithUids = playlist?.tracks?.map(track => ({
    ...track,
    id: track.track_id,
    uid: uidMap[track.track_id],
    source: QueueSource.DM_PLAYLIST_TRACKS,
    user: currentUser
  })) ?? []
  const entries = playlist?.tracks?.map(track => ({
    id: track.track_id,
    uid: uidMap[track.track_id],
    source: QueueSource.DM_PLAYLIST_TRACKS
  })) ?? []

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

  if (status === Status.ERROR) {
    return (
      // todo
      <div>error</div>
    )
  }

  return (
    // You may wonder why we use the mobile web track tile here.
    // It's simply because the DMs track tile uses the mobile web version.
    <MobilePlaylistTile
      index={0}
      uid={uid}
      collection={playlist}
      // @ts-ignore
      tracks={tracksWithUids}
      playTrack={playTrack}
      pauseTrack={pauseTrack}
      hasLoaded={() => {}}
      isLoading={false}
      isTrending={false}
      showRankIcon={false}
      isDM

      // numLoadingSkeletonRows={numPlaylistSkeletonRows}
    />
  )
}
