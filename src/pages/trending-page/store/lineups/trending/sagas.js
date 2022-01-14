import { select } from 'redux-saga/effects'

import TimeRange from 'common/models/TimeRange'
import { getUserId } from 'common/store/account/selectors'
import { retrieveTrending } from 'pages/track-page/store/retrieveTrending'
import { getTrendingGenre } from 'pages/trending-page/store/selectors'
import { LineupSagas } from 'store/lineup/sagas'

import {
  TRENDING_WEEK_PREFIX,
  TRENDING_MONTH_PREFIX,
  TRENDING_YEAR_PREFIX,
  TRENDING_ALL_TIME_PREFIX,
  trendingWeekActions,
  trendingMonthActions,
  trendingYearActions,
  trendingAllTimeActions
} from './actions'

function getTracks(timeRange) {
  return function* ({ offset, limit }) {
    const genreAtStart = yield select(getTrendingGenre)
    const userId = yield select(getUserId)
    try {
      const tracks = yield retrieveTrending({
        timeRange,
        limit,
        offset,
        genre: genreAtStart,
        currentUserId: userId
      })
      return tracks
    } catch (e) {
      console.error(`Trending error: ${e.message}`)
      return []
    }
  }
}

class TrendingWeekSagas extends LineupSagas {
  constructor() {
    super(
      TRENDING_WEEK_PREFIX,
      trendingWeekActions,
      store => store.trending.trendingWeek,
      getTracks(TimeRange.WEEK)
    )
  }
}

class TrendingMonthSagas extends LineupSagas {
  constructor() {
    super(
      TRENDING_MONTH_PREFIX,
      trendingMonthActions,
      store => store.trending.trendingMonth,
      getTracks(TimeRange.MONTH)
    )
  }
}

class TrendingYearSagas extends LineupSagas {
  constructor() {
    super(
      TRENDING_YEAR_PREFIX,
      trendingYearActions,
      store => store.trending.trendingYear,
      getTracks(TimeRange.YEAR)
    )
  }
}

class TrendingAllTimeSagas extends LineupSagas {
  constructor() {
    super(
      TRENDING_ALL_TIME_PREFIX,
      trendingAllTimeActions,
      store => store.trending.trendingAllTime,
      getTracks(TimeRange.ALL_TIME)
    )
  }
}

export default function sagas() {
  return [
    ...new TrendingWeekSagas().getSagas(),
    ...new TrendingMonthSagas().getSagas(),
    ...new TrendingYearSagas().getSagas(),
    ...new TrendingAllTimeSagas().getSagas()
  ]
}
