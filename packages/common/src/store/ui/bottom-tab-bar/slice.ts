import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type BottomTabBarState = {
  bottomTabBarHeight: number
}

const initialState: BottomTabBarState = {
  bottomTabBarHeight: 0
}

const slice = createSlice({
  name: 'ui/bottom-tab-bar',
  initialState,
  reducers: {
    setBottomTabBarHeight: (
      state,
      action: PayloadAction<{
        height: number
      }>
    ) => {
      const { height } = action.payload
      state.bottomTabBarHeight = height
    }
  }
})

export const { setBottomTabBarHeight } = slice.actions
export const actions = slice.actions
export default slice.reducer
