import { useCallback, useEffect } from 'react'

import {
  profilePageSelectors,
  profilePageTracksLineupActions as tracksActions,
  Status,
  useProxySelector
} from '@audius/common'
import { useDispatch } from 'react-redux'

import { Lineup } from 'app/components/lineup'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useIsProfileLoaded, useSelectProfile } from './selectors'
const { getProfileTracksLineup } = profilePageSelectors

export const TracksTab = () => {
  // const isProfileLoaded = useIsProfileLoaded()
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

  // const { status } = lineup

  // useEffect(() => {
  //   if (status === Status.IDLE) {
  //     dispatch(
  //       tracksActions.fetchLineupMetadatas(
  //         undefined,
  //         undefined,
  //         undefined,
  //         { userId: user_id },
  //         { handle: handleLower }
  //       )
  //     )
  //   }
  // }, [dispatch, status, user_id, handleLower])

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
