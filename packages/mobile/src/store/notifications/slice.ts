import { createSlice } from '@reduxjs/toolkit'

export type NotificationsState = {
  isOpen: boolean
}

const initialState: NotificationsState = {
  isOpen: false
}

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    open: (state) => {
      state.isOpen = true
    },
    close: (state) => {
      state.isOpen = false
    }
  }
})

export const { open, close } = slice.actions

export default slice.reducer
