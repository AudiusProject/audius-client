import {
  TimeRange,
  reachabilitySelectors,
  trendingPageSelectors
} from '@audius/common'
import { useSelector } from 'react-redux'

import IconAllTime from 'app/assets/images/iconAllTime.svg'
import IconDay from 'app/assets/images/iconDay.svg'
import IconMonth from 'app/assets/images/iconMonth.svg'
import { RewardsBanner } from 'app/components/audio-rewards'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'

import { TrendingFilterButton } from './TrendingFilterButton'
import { TrendingLineup } from './TrendingLineup'
const { getTrendingGenre } = trendingPageSelectors
const { getIsReachable } = reachabilitySelectors

const ThisWeekTab = () => {
  const trendingGenre = useSelector(getTrendingGenre)
  return (
    <TrendingLineup
      header={trendingGenre ? null : <RewardsBanner type='tracks' />}
      timeRange={TimeRange.WEEK}
      rankIconCount={5}
    />
  )
}
const ThisMonthTab = () => {
  return <TrendingLineup timeRange={TimeRange.MONTH} />
}

const AllTimeTab = () => {
  return <TrendingLineup timeRange={TimeRange.ALL_TIME} />
}

const trendingScreens = [
  {
    name: 'ThisWeek',
    label: 'This Week',
    Icon: IconDay,
    component: ThisWeekTab
  },
  {
    name: 'ThisMonth',
    label: 'This Month',
    Icon: IconMonth,
    component: ThisMonthTab
  },
  {
    name: 'AllTime',
    label: 'All Time',
    Icon: IconAllTime,
    component: AllTimeTab
  }
]

export const TrendingScreen = () => {
  usePopToTopOnDrawerOpen()

  // TODO: put back the logic
  // const isNotReachable = useSelector(getIsReachable) === false
  const isNotReachable = true

  return (
    <Screen>
      <Header text='Trending'>
        <TrendingFilterButton />
      </Header>
      {isNotReachable ? (
        <OfflinePlaceholder />
      ) : (
        <TopTabNavigator screens={trendingScreens} />
      )}
    </Screen>
  )
}
