import { useCallback } from 'react'

import { tracksActions } from 'audius-client/src/common/store/pages/profile/lineups/tracks/actions'
import { getProfileTracksLineup } from 'audius-client/src/common/store/pages/profile/selectors'
import { isEqual } from 'lodash'

import { Lineup } from 'app/components/lineup'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'

type TrackTabProps = {
  isProfileLoaded: boolean
}

export const TracksTab = ({ isProfileLoaded }: TrackTabProps) => {
  const lineup = useSelectorWeb(getProfileTracksLineup, isEqual)
  const dispatchWeb = useDispatchWeb()
  const { user_id, track_count, _artist_pick } = useSelectProfile([
    'user_id',
    'track_count',
    '_artist_pick'
  ])

  const loadMore = useCallback(
    (offset: number, limit: number) => {
      dispatchWeb(
        tracksActions.fetchLineupMetadatas(offset, limit, false, {
          userId: user_id
        })
      )
    },
    [dispatchWeb, user_id]
  )

  /**
   * If the profile isn't loaded yet, pass the lineup and empty entries
   * array so only skeletons are displayed
   */
  return (
    <Lineup
      leadingElementId={_artist_pick}
      listKey='profile-tracks'
      actions={tracksActions}
      lineup={isProfileLoaded ? lineup : { ...lineup, entries: [] }}
      limit={track_count}
      loadMore={loadMore}
      disableTopTabScroll
      ListEmptyComponent={<EmptyProfileTile tab='tracks' />}
      showsVerticalScrollIndicator={false}
    />
  )
}
