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

// type RefreshPremiumTrackPayload = {
//   [id: ID]: PremiumContentSignature
// }

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
    // refreshPremiumTrack: (state, action: PayloadAction<RefreshPremiumTrackPayload>) => {
    refreshPremiumTrack: () => {
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
