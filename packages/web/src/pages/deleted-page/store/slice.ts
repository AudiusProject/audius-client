import { lineupReducer } from '@audius/common'
const { asLineup } = lineupReducer
import { createSlice } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'

import { PREFIX as moreByPrefix } from './lineups/more-by/actions'
import moreByTracksReducer from './lineups/more-by/reducer'

type State = {}

const initialState: State = {}

const slice = createSlice({
  name: 'application/pages/remixes',
  initialState,
  reducers: {}
})

const moreByLineupReducer = asLineup(moreByPrefix, moreByTracksReducer)

export default combineReducers({
  page: slice.reducer,
  moreBy: moreByLineupReducer
})
