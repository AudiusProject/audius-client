import type { Nullable } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type ShareToStoryProgressState = typeof initialState

type State = {
  progress: number
  cancel: Nullable<() => Promise<void>>
}

const initialState: State = {
  progress: 0,
  cancel: null
}

const slice = createSlice({
  name: 'shareToStoryProgress',
  initialState,
  reducers: {
    setProgress: (state, action: PayloadAction<number>) => {
      console.log('setting progress to', action.payload)
      state.progress = action.payload
    },
    setCancel: (state, action: PayloadAction<() => Promise<void>>) => {
      state.cancel = action.payload
    },
    reset: (state) => {
      console.log('resetting')
      state.progress = 0
      state.cancel = initialState.cancel
      console.log('reset to', state.progress)
    }
  }
})

export const { setProgress, setCancel, reset } = slice.actions

export default slice.reducer
