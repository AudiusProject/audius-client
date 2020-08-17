import React from 'react'
import * as discoverPageActions from 'containers/discover-page//store/actions'
import TrendingGenreSelectionPage from './components/TrendingGenreSelectionPage'
import { GENRES, ELECTRONIC_PREFIX } from 'utils/genres'
import { Dispatch } from 'redux'
import { AppState } from 'store/types'
import { connect } from 'react-redux'
import {
  getTrendingGenre,
  getTrendingTimeRange
} from 'containers/discover-page/store/selectors'
import { push as pushRoute } from 'connected-react-router'
import { TRENDING_PAGE } from 'utils/route'
import {
  trendingMonthActions,
  trendingYearActions,
  trendingWeekActions
} from 'containers/discover-page/store/lineups/trending/actions'
import TimeRange from 'models/TimeRange'

type ConnectedTrendingGenreSelectionPageProps = {} & ReturnType<
  typeof mapStateToProps
> &
  ReturnType<typeof mapDispatchToProps>

// Mobile page for selecting a genre by which to filter trending.
const ConnectedTrendingGenreSelectionPage = ({
  setTrendingGenre,
  genre,
  timeRange,
  setTrendingTimeRange,
  goToTrending,
  resetAllTrending
}: ConnectedTrendingGenreSelectionPageProps) => {
  const setTrimmedGenre = (genre: string | null) => {
    const trimmedGenre =
      genre !== null ? genre.replace(ELECTRONIC_PREFIX, '') : genre
    setTrendingGenre(trimmedGenre)
    resetAllTrending()
    setTrendingTimeRange(timeRange)
    goToTrending()
  }

  return (
    <TrendingGenreSelectionPage
      genres={GENRES}
      didSelectGenre={setTrimmedGenre}
      selectedGenre={genre}
    />
  )
}

function mapStateToProps(state: AppState) {
  return {
    genre: getTrendingGenre(state),
    timeRange: getTrendingTimeRange(state)
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    setTrendingGenre: (genre: string | null) =>
      dispatch(discoverPageActions.setTrendingGenre(genre)),
    setTrendingTimeRange: (timeRange: TimeRange) =>
      dispatch(discoverPageActions.setTrendingTimeRange(timeRange)),
    goToTrending: () => dispatch(pushRoute(TRENDING_PAGE)),
    resetAllTrending: () => {
      dispatch(trendingWeekActions.reset())
      dispatch(trendingMonthActions.reset())
      dispatch(trendingYearActions.reset())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedTrendingGenreSelectionPage)
