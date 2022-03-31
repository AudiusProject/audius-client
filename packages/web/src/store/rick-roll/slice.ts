import { createSlice } from '@reduxjs/toolkit'

export type RickRollState = { isPlaying: boolean }

const initialState: RickRollState = {
  isPlaying: false
}

const slice = createSlice({
  name: 'RICK-ROLL',
  initialState,
  reducers: {
    play: state => {
      state.isPlaying = true
    },
    stop: state => {
      state.isPlaying = false
    }
  }
})

export const { play, stop } = slice.actions

export default slice.reducer
