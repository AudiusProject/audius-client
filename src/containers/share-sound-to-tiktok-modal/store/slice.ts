import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  OpenPayload,
  SetStatusPayload,
  SharePayload,
  ShareSoundToTikTokModalState
} from './types'

const initialState: ShareSoundToTikTokModalState = {
  isAuthenticated: false,
  isOpen: false,
  status: null
}

// Slice

const slice = createSlice({
  name: 'application/ui/shareSoundToTikTokModal',
  initialState,
  reducers: {
    authenticated: () => {},
    close: state => {
      state.isOpen = false
    },
    open: (state, action: PayloadAction<OpenPayload>) => {
      const { track } = action.payload
      state.isAuthenticated = false
      state.isOpen = true
      state.track = track
      state.status = null
    },
    setIsAuthenticated: state => {
      state.isAuthenticated = true
    },
    setStatus: (state, action: PayloadAction<SetStatusPayload>) => {
      const { status } = action.payload
      state.status = status
    },
    share: (state, action: PayloadAction<SharePayload>) => {},
    upload: () => {}
  }
})

export const {
  authenticated,
  close,
  open,
  setIsAuthenticated,
  setStatus,
  share,
  upload
} = slice.actions

export default slice.reducer
