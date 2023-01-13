import { ID, PremiumContentSignature } from 'models'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type PremiumContentState = {
  premiumTrackSignatureMap: { [id: ID]: PremiumContentSignature }
}

const initialState: PremiumContentState = {
  premiumTrackSignatureMap: {}
}

type UpdatePremiumContentSignaturesPayload = {
  [id: ID]: PremiumContentSignature
}

type RefreshPremiumTrackPayload = {
  trackParams:
    | { slug: string; trackId: null; handle: string }
    | { slug: null; trackId: ID; handle: null }
    | null
}

const slice = createSlice({
  name: 'premiumContent',
  initialState,
  reducers: {
    updatePremiumContentSignatures: (state, action: PayloadAction<UpdatePremiumContentSignaturesPayload>) => {
      state.premiumTrackSignatureMap = {
        ...state.premiumTrackSignatureMap,
        ...action.payload
      }
    },
    refreshPremiumTrack: (_, __: PayloadAction<RefreshPremiumTrackPayload>) => {
    },
  }
})

export const {
  updatePremiumContentSignatures,
  refreshPremiumTrack
} = slice.actions

export const reducer = slice.reducer
export const actions = slice.actions

export default slice
