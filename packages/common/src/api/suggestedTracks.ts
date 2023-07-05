import { useCallback, useEffect, useState } from 'react'

import { shuffle } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { ID } from 'models/Identifiers'
import { getUserId } from 'store/account/selectors'
import { addTrackToPlaylist } from 'store/cache/collections/actions'
import { getTrack } from 'store/cache/tracks/selectors'
import { CommonState } from 'store/index'

import { useGetFavoritedTrackList } from './favorites'
import { useGetTracksByIds } from './track'

const suggestedTrackCount = 5

const selectSuggestedTracks = (state: CommonState, ids: ID[]) => {
  return ids.map((id) => {
    const track = getTrack(state, { id })
    if (!track) return { id, isLoading: true as const }
    return { id, track, isLoading: false as const }
  })
}

export const useGetSuggestedTracks = () => {
  const currentUserId = useSelector(getUserId)
  const dispatch = useDispatch()

  const { data: favoritedTracks } = useGetFavoritedTrackList(
    { currentUserId },
    { disabled: !currentUserId }
  )

  const [suggestedTrackIds, setSuggestedTrackIds] = useState<ID[]>([])

  useEffect(() => {
    if (favoritedTracks) {
      const suggestedTrackIds = shuffle(favoritedTracks).map(
        (track) => track.save_item_id
      )
      setSuggestedTrackIds(suggestedTrackIds)
    }
  }, [favoritedTracks])

  const suggestedTracks = useSelector((state: CommonState) =>
    selectSuggestedTracks(
      state,
      suggestedTrackIds.slice(0, suggestedTrackCount)
    )
  )

  useGetTracksByIds(
    {
      currentUserId,
      ids: suggestedTracks
        .filter((suggestedTrack) => suggestedTrack.isLoading)
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
  }, [suggestedTrackIds])

  return {
    suggestedTracks,
    onRefresh: handleRefresh,
    onAddTrack: handleAddTrack
  }
}
