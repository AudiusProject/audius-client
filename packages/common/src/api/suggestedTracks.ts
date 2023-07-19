import { useCallback, useEffect, useState } from 'react'

import { difference, isEqual, shuffle } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { usePaginatedQuery } from 'audius-query'
import { ID } from 'models/Identifiers'
import { Status } from 'models/Status'
import { TimeRange } from 'models/TimeRange'
import { Track } from 'models/Track'
import { getUserId } from 'store/account/selectors'
import { addTrackToPlaylist } from 'store/cache/collections/actions'
import { getCollection } from 'store/cache/collections/selectors'
import { getTrack } from 'store/cache/tracks/selectors'
import { CommonState } from 'store/index'

import { useGetFavoritedTrackList } from './favorites'
import { useGetTracksByIds } from './track'
import { useGetTrending } from './trending'

const suggestedTrackCount = 5

type SuggestedTrack =
  | { isLoading: true; key: ID }
  | { isLoading: true; id: ID; key: ID }
  | { isLoading: false; id: ID; track: Track; key: ID }

const skeletons = [...Array(5)].map((_, index) => ({
  key: index,
  isLoading: true as const
}))

const selectSuggestedTracks = (
  state: CommonState,
  ids: ID[]
): SuggestedTrack[] => {
  const suggestedTracks = ids.map((id) => {
    const track = getTrack(state, { id })
    if (!track) return { id, isLoading: true as const, key: id }
    return { id, track, isLoading: false as const, key: id }
  })

  return [...suggestedTracks, ...skeletons].slice(0, 5)
}

const selectCollectionTrackIds = (state: CommonState, collectionId: ID) => {
  const collection = getCollection(state, { id: collectionId })
  if (!collection) return []
  return collection?.playlist_contents.track_ids.map((trackId) => trackId.track)
}

export const useGetSuggestedTracks = (collectionId: ID) => {
  const currentUserId = useSelector(getUserId)
  const dispatch = useDispatch()
  const [suggestedTrackIds, setSuggestedTrackIds] = useState<ID[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const collectionTrackIds = useSelector((state: CommonState) =>
    selectCollectionTrackIds(state, collectionId)
  )

  const { data: favoritedTracks, status: favoritedStatus } =
    useGetFavoritedTrackList({ currentUserId }, { disabled: !currentUserId })

  useEffect(() => {
    if (favoritedTracks) {
      const suggestedTrackIds = difference(
        shuffle(favoritedTracks).map((track) => track.save_item_id),
        collectionTrackIds
      )
      setSuggestedTrackIds(suggestedTrackIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoritedTracks])

  const {
    data: trendingTracks,
    status: trendingStatus,
    loadMore
  } = usePaginatedQuery(
    useGetTrending,
    {
      timeRange: TimeRange.WEEK,
      currentUserId,
      genre: null
    },
    {
      pageSize: 10,
      disabled: favoritedStatus !== Status.SUCCESS
    }
  )

  useEffect(() => {
    if (trendingStatus === Status.SUCCESS) {
      const trendingTrackIds = difference(
        trendingTracks.map((track) => track.track_id),
        collectionTrackIds
      )
      setSuggestedTrackIds([...suggestedTrackIds, ...trendingTrackIds])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendingStatus])

  useEffect(() => {
    if (suggestedTrackIds.length < 5) {
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedTrackIds.length])

  const suggestedTracks = useSelector(
    (state: CommonState) =>
      selectSuggestedTracks(
        state,
        suggestedTrackIds.slice(0, suggestedTrackCount)
      ),
    isEqual
  )

  useGetTracksByIds(
    {
      currentUserId,
      ids: suggestedTracks
        .filter(
          (
            suggestedTrack
          ): suggestedTrack is { isLoading: true; id: ID; key: ID } =>
            'id' in suggestedTrack && suggestedTrack.isLoading
        )
        .map((suggestedTrack) => suggestedTrack.id)
    },
    {
      disabled: !currentUserId || suggestedTrackIds.length === 0
    }
  )

  const handleAddTrack = useCallback(
    (trackId: ID, collectionId: ID) => {
      dispatch(addTrackToPlaylist(trackId, collectionId))
      const trackIndexToRemove = suggestedTrackIds.indexOf(trackId)
      suggestedTrackIds.splice(trackIndexToRemove, 1)
      setSuggestedTrackIds(suggestedTrackIds)
    },
    [dispatch, suggestedTrackIds]
  )

  const handleRefresh = useCallback(() => {
    setSuggestedTrackIds(suggestedTrackIds.slice(suggestedTrackCount))
    setIsRefreshing(true)
  }, [suggestedTrackIds])

  useEffect(() => {
    if (suggestedTracks.every((suggestedTrack) => !suggestedTrack.isLoading)) {
      setIsRefreshing(false)
    }
  }, [suggestedTracks])

  return {
    suggestedTracks,
    isRefreshing,
    onRefresh: handleRefresh,
    onAddTrack: handleAddTrack
  }
}
