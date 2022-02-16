import { useCallback, useEffect, useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { Name } from 'audius-client/src/common/models/Analytics'
import TimeRange from 'audius-client/src/common/models/TimeRange'
import { makeGetLineupMetadatas } from 'audius-client/src/common/store/lineup/selectors'
import { setTrendingTimeRange } from 'audius-client/src/common/store/pages/trending/actions'
import {
  trendingWeekActions,
  trendingMonthActions,
  trendingAllTimeActions
} from 'audius-client/src/common/store/pages/trending/lineup/actions'
import {
  getDiscoverTrendingAllTimeLineup,
  getDiscoverTrendingMonthLineup,
  getDiscoverTrendingWeekLineup
} from 'audius-client/src/common/store/pages/trending/selectors'
import { isEqual } from 'lodash'
import { View } from 'react-native'

import { Lineup } from 'app/components/lineup'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'
import { make, track } from 'app/utils/analytics'

const getTrendingWeekLineup = makeGetLineupMetadatas(
  getDiscoverTrendingWeekLineup
)

const getTrendingMonthLineup = makeGetLineupMetadatas(
  getDiscoverTrendingMonthLineup
)

const getTrendingAllTimeLineup = makeGetLineupMetadatas(
  getDiscoverTrendingAllTimeLineup
)

const selectorsMap = {
  [TimeRange.WEEK]: getTrendingWeekLineup,
  [TimeRange.MONTH]: getTrendingMonthLineup,
  [TimeRange.ALL_TIME]: getTrendingAllTimeLineup
}

const actionsMap = {
  [TimeRange.WEEK]: trendingWeekActions,
  [TimeRange.MONTH]: trendingMonthActions,
  [TimeRange.ALL_TIME]: trendingAllTimeActions
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    paddingTop: spacing(3)
  }
}))

type TrendingLineupProps = {
  timeRange: TimeRange
  header?: any
}

export const TrendingLineup = (props: TrendingLineupProps) => {
  const { timeRange, header } = props
  const styles = useStyles()
  const trendingLineup = useSelectorWeb(selectorsMap[timeRange], isEqual)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigation = useNavigation()
  const dispatchWeb = useDispatchWeb()
  const trendingActions = actionsMap[timeRange]

  useEffect(() => {
    // @ts-ignore
    const tabPressListener = navigation.addListener('tabPress', () => {
      dispatchWeb(setTrendingTimeRange(timeRange))
    })

    return tabPressListener
  }, [navigation, dispatchWeb, timeRange])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    dispatchWeb(trendingActions.refreshInView(true))
  }, [dispatchWeb, trendingActions])

  const handlePlayTrack = useCallback(
    (uid?: string) => {
      dispatchWeb(trendingActions.play(uid))
    },
    [dispatchWeb, trendingActions]
  )

  const handlePauseTrack = useCallback(() => {
    dispatchWeb(trendingActions.pause())
  }, [dispatchWeb, trendingActions])

  const handleLoadMore = useCallback(
    (offset: number, limit: number, overwrite: boolean) => {
      dispatchWeb(
        trendingActions.fetchLineupMetadatas(offset, limit, overwrite)
      )
      track(make({ eventName: Name.FEED_PAGINATE, offset, limit }))
    },
    [dispatchWeb, trendingActions]
  )

  return (
    <View style={styles.root}>
      <Lineup
        header={header}
        lineup={trendingLineup}
        actions={trendingActions}
        refresh={handleRefresh}
        refreshing={isRefreshing && trendingLineup.isMetadataLoading}
        loadMore={handleLoadMore}
        playTrack={handlePlayTrack}
        pauseTrack={handlePauseTrack}
      />
    </View>
  )
}
