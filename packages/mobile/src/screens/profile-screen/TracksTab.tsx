import { useCallback, useEffect } from 'react'

import {
  profilePageSelectors,
  profilePageTracksLineupActions as tracksActions,
  useProxySelector
} from '@audius/common'
import { useDispatch } from 'react-redux'

import { Lineup } from 'app/components/lineup'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useIsProfileLoaded, useSelectProfile } from './selectors'
const { getProfileTracksLineup } = profilePageSelectors

export const TracksTab = () => {
  const isProfileLoaded = useIsProfileLoaded()
  const dispatch = useDispatch()

  const { handle, user_id, track_count, artist_pick_track_id } =
    useSelectProfile([
      'handle',
      'user_id',
      'track_count',
      'artist_pick_track_id'
    ])

  const handleLower = handle.toLowerCase()

  const lineup = useProxySelector(
    (state) => getProfileTracksLineup(state, handleLower),
    [handleLower]
  )

  useEffect(() => {
    if (isProfileLoaded) {
      dispatch(
        tracksActions.fetchLineupMetadatas(
          undefined,
          undefined,
          undefined,
          { userId: user_id },
          { handle: handleLower }
        )
      )
    }
  }, [dispatch, isProfileLoaded, user_id, handleLower])

  const loadMore = useCallback(
    (offset: number, limit: number) => {
      dispatch(
        tracksActions.fetchLineupMetadatas(
          offset,
          limit,
          false,
          {
            userId: user_id
          },
          { handle }
        )
      )
    },
    [dispatch, user_id, handle]
  )

  if (!lineup) return null

  /**
   * If the profile isn't loaded yet, pass the lineup an empty entries
   * array so only skeletons are displayed
   */
  return (
    <Lineup
      leadingElementId={artist_pick_track_id}
      listKey='profile-tracks'
      actions={tracksActions}
      lineup={lineup}
      limit={track_count}
      loadMore={loadMore}
      disableTopTabScroll
      ListEmptyComponent={<EmptyProfileTile tab='tracks' />}
      showsVerticalScrollIndicator={false}
    />
  )
}
