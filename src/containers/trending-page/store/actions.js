export const SET_TRENDING_GENRE = 'DISCOVER/SET_TRENDING_GENRE'
export const SET_TRENDING_TIME_RANGE = 'DISCOVER/SET_TRENDING_TIME_RANGE'
export const SET_LAST_FETCHED_TRENDING_GENRE =
  'DISCOVER/SET_LAST_FETCHED_TRENDING_GENRE'

export const setTrendingGenre = genre => ({
  type: SET_TRENDING_GENRE,
  genre
})

export const setTrendingTimeRange = timeRange => ({
  type: SET_TRENDING_TIME_RANGE,
  timeRange
})

export const setLastFetchedTrendingGenre = genre => ({
  type: SET_LAST_FETCHED_TRENDING_GENRE,
  genre
})
