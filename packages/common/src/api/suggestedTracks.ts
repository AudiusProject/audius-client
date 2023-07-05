import { useCallback, useEffect, useState } from 'react'

import { shuffle } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'

import { ID } from 'models/Identifiers'
import { getUserId } from 'store/account/selectors'
import { addTrackToPlaylist } from 'store/cache/collections/actions'

import { useGetFavoritedTrackList } from './favorites'
import { useGetTracksByIds } from './track'

const suggestedTrackCount = 5

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

  const suggestedTracksState = useGetTracksByIds(
    {
      currentUserId,
      ids: suggestedTrackIds.slice(0, suggestedTrackCount)
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
    ...suggestedTracksState,
    onRefresh: handleRefresh,
    onAddTrack: handleAddTrack
  }
}
