import { useCallback, useMemo, useEffect } from 'react'

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
  usePauseTrack,
  ChatMessageTileProps,
  parsePlaylistIdFromPermalink,
  SquareSizes,
  cacheCollectionsActions,
  cacheCollectionsSelectors,
  CommonState
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import MobilePlaylistTile from 'components/track/mobile/ConnectedPlaylistTile'

const { getUserId } = accountSelectors
const { getTrackId } = playerSelectors
const { getCollection } = cacheCollectionsSelectors
const { fetchCoverArt } = cacheCollectionsActions

export const ChatMessagePlaylist = ({
  link,
  onEmpty,
  onSuccess,
  className
}: ChatMessageTileProps) => {
  const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const playingTrackId = useSelector(getTrackId)

  const playlistId = parsePlaylistIdFromPermalink(
    getPathFromPlaylistUrl(link) ?? ''
  )
  const { data: playlist, status } = useGetPlaylistById(
    {
      playlistId,
      currentUserId: currentUserId!
    },
    { disabled: !playlistId || !currentUserId }
  )

  const collectionId = playlist?.playlist_id
  const collection = useSelector((state: CommonState) =>
    getCollection(state, { id: collectionId })
  )

  useEffect(() => {
    if (collectionId) {
      dispatch(fetchCoverArt(collectionId, SquareSizes.SIZE_150_BY_150))
    }
  }, [collectionId, dispatch])

  const uid = useMemo(() => {
    return collectionId ? makeUid(Kind.COLLECTIONS, collectionId) : null
  }, [collectionId])

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
  }, [collectionId])

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

  useEffect(() => {
    if (collection && uid) {
      onSuccess?.()
    } else {
      onEmpty?.()
    }
  }, [collection, uid, onSuccess, onEmpty])

  return collection && uid ? (
    <div className={className}>
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
        variant='readonly'
      />
    </div>
  ) : null
}
