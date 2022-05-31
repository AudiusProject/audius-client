import { useMemo } from 'react'

import { User } from 'audius-client/src/common/models/User'
import { ID } from 'common/models/Identifiers'
import { getUsers } from 'common/store/cache/users/selectors'
import { getSupportersForUser } from 'common/store/tipping/selectors'
import { Dimensions, FlatList } from 'react-native'

import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { useSelectProfile } from '../selectors'

import { TopSupporterTile } from './TopSupporterTile'
import { TopSupporterTileSkeleton } from './TopSupporterTileSkeleton'

type SkeletonData = { loading: true }
const skeletonData: SkeletonData[] = [{ loading: true }, { loading: true }]

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    marginTop: spacing(1),
    marginBottom: spacing(4)
  },
  singleSupporterTile: {
    width: Dimensions.get('window').width - spacing(6)
  }
}))

export const TopSupportersList = () => {
  const styles = useStyles()
  const { user_id, supporter_count } = useSelectProfile(['user_id'])
  const supporters = useSelectorWeb(state =>
    getSupportersForUser(state, user_id)
  )
  const topSupporterIds = useMemo(() => {
    const supporterIds = (supporters
      ? Object.keys(supporters)
      : ([] as unknown)) as ID[]
    return supporterIds.sort(
      (id1, id2) => supporters[id1].rank - supporters[id2].rank
    )
  }, [supporters])

  const topSupporterUsers = useSelectorWeb(state =>
    getUsers(state, { ids: topSupporterIds })
  )

  const topSupporters = useMemo(
    () =>
      topSupporterIds
        .map(supporterId => topSupporterUsers[supporterId])
        .filter(Boolean),
    [topSupporterIds, topSupporterUsers]
  )

  const topSupportersData = useMemo(() => {
    if (topSupporters.length === 0) {
      return skeletonData
    }
    return topSupporters
  }, [topSupporters])

  if (supporter_count === 1) {
    if (topSupporters.length === 0) {
      return <TopSupporterTileSkeleton style={styles.singleSupporterTile} />
    }
    return (
      <TopSupporterTile
        style={styles.singleSupporterTile}
        rank={1}
        supporter={topSupporters[0]}
      />
    )
  }

  return (
    <FlatList<SkeletonData | User>
      horizontal
      data={topSupportersData}
      renderItem={({ item, index }) =>
        'loading' in item ? (
          <TopSupporterTileSkeleton />
        ) : (
          <TopSupporterTile
            key={item.user_id}
            rank={index + 1}
            supporter={item}
          />
        )
      }
    />
  )
}
