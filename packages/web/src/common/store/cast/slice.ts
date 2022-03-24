import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const CAST_METHOD = 'cast'

export type CastMethod = 'airplay' | 'chromecast'

type CastState = {
  method: CastMethod
  isCasting: boolean
}

const initialState: CastState = {
  method: 'airplay',
  isCasting: false
}

const slice = createSlice({
  name: 'cast',
  initialState,
  reducers: {
    updateMethod: (
      state,
      {
        payload: { method }
      }: PayloadAction<{ method: CastMethod; persist?: boolean }>
    ) => {
      state.method = method
    },
    setIsCasting: (
      state,
      { payload: { isCasting } }: PayloadAction<{ isCasting: boolean }>
    ) => {
      state.isCasting = isCasting
    }
  }
})

export const { updateMethod, setIsCasting } = slice.actions

export default slice.reducer
