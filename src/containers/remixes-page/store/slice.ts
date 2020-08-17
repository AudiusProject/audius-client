import { combineReducers } from 'redux'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import remixesTracksReducer from './lineups/tracks/reducer'
import { PREFIX as remixesTracksPrefix } from './lineups/tracks/actions'
import { asLineup } from 'store/lineup/reducer'
import { ID } from 'models/common/Identifiers'

type State = {
  trackId: ID | null
  count: number | null
}

const initialState: State = {
  trackId: null,
  count: null
}

const slice = createSlice({
  name: 'application/pages/remixes',
  initialState,
  reducers: {
    reset: state => {
      state.trackId = null
    },
    fetchTrack: (state, action: PayloadAction<{ trackId: ID }>) => {},
    fetchTrackSucceeded: (state, action: PayloadAction<{ trackId: ID }>) => {
      const { trackId } = action.payload
      state.trackId = trackId
    },
    setCount: (state, action: PayloadAction<{ count: number }>) => {
      const { count } = action.payload
      state.count = count
    }
  }
})

const remixesLineupReducer = asLineup(remixesTracksPrefix, remixesTracksReducer)

export const {
  reset,
  setCount,
  fetchTrack,
  fetchTrackSucceeded
} = slice.actions

export default combineReducers({
  page: slice.reducer,
  tracks: remixesLineupReducer
})
