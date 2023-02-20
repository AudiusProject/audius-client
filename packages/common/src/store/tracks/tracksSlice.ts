import {
  createEntityAdapter,
  createSlice,
  Dictionary,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'

import { Track } from 'models/Track'

const tracksAdapter = createEntityAdapter<Track>({
  selectId: (track) => track.track_id
})

type AddTracksAction = PayloadAction<{
  tracks: Track[]
}>

export type TracksState = EntityState<Track> & {
  timestamps: Dictionary<number>
  // TODO uids
}

const initialState: TracksState = {
  ...tracksAdapter.getInitialState(),
  timestamps: {}
}

const slice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    addTracks: (state, action: AddTracksAction) => {
      const { tracks } = action.payload
      tracksAdapter.upsertMany(state, tracks)
    },
    updateTrack: tracksAdapter.updateOne
  }
})

const reducer = slice.reducer
const actions = slice.actions

export { actions }
export default reducer
