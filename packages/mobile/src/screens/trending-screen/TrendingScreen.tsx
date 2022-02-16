import { useMemo } from 'react'

import TimeRange from 'audius-client/src/common/models/TimeRange'
import { Dimensions, View } from 'react-native'

import IconAllTime from 'app/assets/images/iconAllTime.svg'
import IconDay from 'app/assets/images/iconDay.svg'
import IconMonth from 'app/assets/images/iconMonth.svg'
import TopTabNavigator from 'app/components/app-navigator/TopTabNavigator'
import { ScreenHeader } from 'app/components/screen-header'

import { FilterGenreHeaderButton } from './FilterGenreHeaderButton'
import { RewardsBanner } from './RewardsBanner'
import { TrendingLineup } from './TrendingLineup'

const screenHeight = Dimensions.get('window').height

const ThisWeekTab = () => {
  return (
    <TrendingLineup
      header={<RewardsBanner type='tracks' />}
      timeRange={TimeRange.WEEK}
    />
  )
}
const ThisMonthTab = () => {
  return <TrendingLineup timeRange={TimeRange.MONTH} />
}

const ThisYearTab = () => {
  return <TrendingLineup timeRange={TimeRange.ALL_TIME} />
}

export const TrendingScreen = () => {
  const screens = useMemo(
    () => [
      {
        name: 'thisWeek',
        label: 'This Week',
        Icon: IconDay,
        component: ThisWeekTab
      },
      {
        name: 'thisMonth',
        label: 'This Month',
        Icon: IconMonth,
        component: ThisMonthTab
      },
      {
        name: 'thisYear',
        label: 'This Year',
        Icon: IconAllTime,
        component: ThisYearTab
      }
    ],
    []
  )

  return (
    <View style={{ height: screenHeight }}>
      <ScreenHeader text='Trending'>
        <FilterGenreHeaderButton />
      </ScreenHeader>
      <TopTabNavigator initialScreenName='tracks' screens={screens} />
    </View>
  )
}
