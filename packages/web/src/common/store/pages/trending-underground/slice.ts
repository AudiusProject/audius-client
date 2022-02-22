import { combineReducers, createSlice } from '@reduxjs/toolkit'

import { asLineup } from 'common/store/lineup/reducer'

import { PREFIX } from './lineup/actions'
import trendingReducer from './lineup/reducer'

const initialState = {}

const slice = createSlice({
  name: 'application/pages/trendingUnderground',
  initialState,
  reducers: {}
})

const trendingUndergroundLineupReducer = asLineup(PREFIX, trendingReducer)

export default combineReducers({
  page: slice.reducer,
  trending: trendingUndergroundLineupReducer
})
