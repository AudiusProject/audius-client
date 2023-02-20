import {
  createEntityAdapter,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit'

import { Track } from 'models/Track'

const tracksAdapter = createEntityAdapter<Track>({
  selectId: (track) => track.track_id
})

type AddTracksAction = PayloadAction<{
  tracks: Track[]
}>

const slice = createSlice({
  name: 'tracks',
  initialState: tracksAdapter.getInitialState(),
  reducers: {
    addTracks: (state, action: AddTracksAction) => {
      const { tracks } = action.payload
      tracksAdapter.upsertMany(state, tracks)
    }
  }
})

const reducer = slice.reducer
const actions = slice.actions

export { actions }
export default reducer
