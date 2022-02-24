import Status from 'audius-client/src/common/models/Status'
import {
  getSearchStatus,
  makeGetSearchPlaylists
} from 'audius-client/src/common/store/pages/search-results/selectors'
import { isEqual } from 'lodash'
import { Text } from 'react-native'

import { CollectionList } from 'app/components/collection-list/CollectionList'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { EmptyResults } from '../EmptyResults'

const getSearchPlaylists = makeGetSearchPlaylists()

export const PlaylistsTab = () => {
  const playlists = useSelectorWeb(getSearchPlaylists, isEqual)
  const status = useSelectorWeb(getSearchStatus)

  if (status === Status.LOADING) {
    return (
      <Text>
        {'Render loading spinner, but not the normal one, check mobile web'}
      </Text>
    )
  }

  const query = 'todo: pass thru'
  if (playlists.length === 0) {
    return <EmptyResults query={query} />
  }
  return <CollectionList listKey='search-playlists' collection={playlists} />
}
