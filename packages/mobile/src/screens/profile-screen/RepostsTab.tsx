import { useCallback, useMemo } from 'react'

import {
  profilePageSelectors,
  profilePageFeedLineupActions as feedActions,
  useProxySelector,
  Status
} from '@audius/common'
import { useIsFocused } from '@react-navigation/native'
import { View } from 'react-native'

import { Lineup } from 'app/components/lineup'

import { EmptyProfileTile } from './EmptyProfileTile'
import { useSelectProfile } from './selectors'

const { getProfileFeedLineup } = profilePageSelectors

export const RepostsTab = () => {
  const { handle } = useSelectProfile(['handle'])
  const handleLower = handle.toLowerCase()
  // const isFocused = useIsFocused()

  const lineup = useProxySelector(
    (state) => getProfileFeedLineup(state, handleLower),
    [handleLower]
  )
  const { repost_count } = useSelectProfile(['repost_count'])

  const extraFetchOptions = useMemo(
    () => ({ handle: handleLower }),
    [handleLower]
  )

  return (
    <Lineup
      listKey='profile-reposts'
      lazy
      selfLoad
      actions={feedActions}
      lineup={lineup}
      limit={repost_count}
      disableTopTabScroll
      ListEmptyComponent={<EmptyProfileTile tab='reposts' />}
      showsVerticalScrollIndicator={false}
      extraFetchOptions={extraFetchOptions}
    />
  )
}
