import { createSlice } from '@reduxjs/toolkit'

type MobileConnectWalletsDrawerState = {
  isOpen: boolean
}

const initialState: MobileConnectWalletsDrawerState = {
  isOpen: false
}

const slice = createSlice({
  name: 'mobile-connect-wallets-drawer',
  initialState,
  reducers: {
    show: state => {
      state.isOpen = true
    },
    hide: state => {
      state.isOpen = false
    }
  }
})

export const { show, hide } = slice.actions

export default slice.reducer
