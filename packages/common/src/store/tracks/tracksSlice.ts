import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { Status } from 'models/Status'
import { Track } from 'models/Track'

import {
  AddTracksAction,
  AddUidsAction,
  CheckIsDownloadableAction,
  DeleteTrackAction,
  DeleteTrackSucceededAction,
  EditTrackAction,
  FetchCoverArtAction,
  TracksState
} from './types'

export const tracksAdapter = createEntityAdapter<Track>({
  selectId: (track) => track.track_id
})

const initialState: TracksState = {
  ...tracksAdapter.getInitialState(),
  timestamps: {},
  permalinks: {},
  statuses: {},
  uids: {}
}

const slice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    addTracks: (state, action: AddTracksAction) => {
      const { tracks } = action.payload
      tracksAdapter.addMany(state, tracks)
      // Object.assign(state.uids, uids)

      const now = Date.now()
      for (const track of tracks) {
        const { track_id, permalink } = track
        state.permalinks[permalink.toLowerCase()] = track_id
        state.timestamps[track_id] = now
        state.statuses[track_id] = Status.SUCCESS
      }
    },
    updateTrack: tracksAdapter.updateOne,
    updateTracks: tracksAdapter.updateMany,
    addUids: (state, action: AddUidsAction) => {
      const { uids } = action.payload
      for (const { id, uid } of uids) {
        state.uids[uid] = id
      }
    },
    editTrack: (_state, _action: EditTrackAction) => {},
    editTrackSucceeded: () => {},
    editTrackFailed: () => {},
    deleteTrack: (_state, _action: DeleteTrackAction) => {},
    deleteTrackSucceeded: (_state, _action: DeleteTrackSucceededAction) => {},
    deleteTrackFailed: () => {},
    fetchCoverArt: (_state, _action: FetchCoverArtAction) => {},
    checkIsDownloadable: (_state, _action: CheckIsDownloadableAction) => {}
  }
})

const reducer = slice.reducer
const actions = slice.actions

export { actions }
export default reducer
