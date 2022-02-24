import Status from 'audius-client/src/common/models/Status'
import {
  getSearchStatus,
  getSearchTracksLineup
} from 'audius-client/src/common/store/pages/search-results/selectors'
import { tracksActions } from 'audius-client/src/common/store/pages/track/lineup/actions'
import { isEqual } from 'lodash'
import { View, Text } from 'react-native'

import { Lineup } from 'app/components/lineup'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import { EmptyResults } from '../EmptyResults'

export const TracksTab = () => {
  const lineup = useSelectorWeb(getSearchTracksLineup, isEqual)
  const status = useSelectorWeb(getSearchStatus)

  if (status === Status.LOADING) {
    return (
      <Text>
        {'Render loading spinner, but not the normal one, check mobile web'}
      </Text>
    )
  }

  const query = 'todo: pass tru'
  if (lineup?.entries.length === 0) {
    return <EmptyResults query={query} />
  }

  return (
    <View>
      <Lineup actions={tracksActions} lineup={lineup} />
    </View>
  )
}
