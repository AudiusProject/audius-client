import type { Nullable } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type OwnProfileState = typeof initialState

type State = {
  trackCount: Nullable<number>
}

const initialState: State = {
  trackCount: null
}

const slice = createSlice({
  name: 'ownProfileTracks',
  initialState,
  reducers: {
    fetchTrackCount: () => {},
    setTrackCount: (state, action: PayloadAction<number>) => {
      state.trackCount = action.payload
    }
  }
})

export const { fetchTrackCount, setTrackCount } = slice.actions

export default slice.reducer
