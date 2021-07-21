import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  OpenPayload,
  RequestOpenPayload,
  SetStatusPayload,
  SharePayload,
  ShareSoundToTikTokModalState,
  Status
} from './types'

const initialState: ShareSoundToTikTokModalState = {
  isAuthenticated: false,
  status: Status.SHARE_UNINITIALIZED
}

// Slice

const slice = createSlice({
  name: 'application/ui/shareSoundToTikTokModal',
  initialState,
  reducers: {
    authenticated: () => {},
    open: (state, action: PayloadAction<OpenPayload>) => {
      const { track } = action.payload
      state.isAuthenticated = false
      state.track = track
      state.status = Status.SHARE_UNINITIALIZED
    },
    requestOpen: (state, action: PayloadAction<RequestOpenPayload>) => {},
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
  open,
  requestOpen,
  setIsAuthenticated,
  setStatus,
  share,
  upload
} = slice.actions

export default slice.reducer
