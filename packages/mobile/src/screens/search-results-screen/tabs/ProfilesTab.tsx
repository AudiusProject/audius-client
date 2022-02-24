import Status from 'audius-client/src/common/models/Status'
import {
  getSearchStatus,
  makeGetSearchArtists
} from 'audius-client/src/common/store/pages/search-results/selectors'
import { isEqual } from 'lodash'
import { Text } from 'react-native'

import { CardList } from 'app/components/core'
import { FollowArtistCard } from 'app/components/signon/FirstFollows'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { EmptyResults } from '../EmptyResults'

const getSearchUsers = makeGetSearchArtists()

export const ProfilesTab = () => {
  const users = useSelectorWeb(getSearchUsers, isEqual)
  const query = 'todo: pass thru'
  const status = useSelectorWeb(getSearchStatus)

  if (status === Status.LOADING) {
    return (
      <Text>
        {'Render loading spinner, but not the normal one, check mobile web'}
      </Text>
    )
  }

  if (users.length === 0) {
    return <EmptyResults query={query} />
  }

  return (
    <CardList
      data={users}
      renderItem={({ item }) => (
        <FollowArtistCard isSelected={false} user={item} />
      )}
    />
  )
}
