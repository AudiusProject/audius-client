import { useCallback } from 'react'

import {
  profilePageSelectors,
  profilePageTracksLineupActions as tracksActions,
  useProxySelector
} from '@audius/common'
import { useDispatch } from 'react-redux'

import { Lineup } from 'app/components/lineup'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'
const { getProfileTracksLineup } = profilePageSelectors

export const TracksTab = () => {
  const dispatch = useDispatch()

  const { handle, user_id, track_count, _artist_pick } = useSelectProfile([
    'handle',
    'user_id',
    'track_count',
    '_artist_pick'
  ])

  const handleLower = handle.toLowerCase()

  const lineup = useProxySelector(
    (state) => getProfileTracksLineup(state, handleLower),
    [handleLower]
  )

  const loadMore = useCallback(
    (offset: number, limit: number) => {
      dispatch(
        tracksActions.fetchLineupMetadatas(
          offset,
          limit,
          false,
          { userId: user_id },
          { handle }
        )
      )
    },
    [dispatch, user_id, handle]
  )

  return (
    <Lineup
      selfLoad
      leadingElementId={_artist_pick}
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
