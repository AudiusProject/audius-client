import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ID } from 'common/models/Identifiers'
import { Supporter, Supporting } from 'common/models/Tipping'
import { User } from 'common/models/User'
import { TippingSendStatus, TippingState } from 'common/store/tipping/types'

const initialState: TippingState = {
  supporters: {},
  supporting: {},
  send: {
    status: null,
    user: null,
    amount: 0
  }
}

const slice = createSlice({
  name: 'tipping',
  initialState,
  reducers: {
    setSupporters: (
      state,
      action: PayloadAction<{ supporters: Record<ID, Supporter[]> }>
    ) => {
      state.supporters = action.payload.supporters
    },
    setSupportersforUser: (
      state,
      action: PayloadAction<{ userId: ID; supportersForUser: Supporter[] }>
    ) => {
      const { userId, supportersForUser } = action.payload
      state.supporters[userId] = supportersForUser
    },
    setSupporting: (
      state,
      action: PayloadAction<{ supporting: Record<ID, Supporting[]> }>
    ) => {
      state.supporting = action.payload.supporting
    },
    setSupportingforUser: (
      state,
      action: PayloadAction<{ userId: ID; supportingForUser: Supporting[] }>
    ) => {
      const { userId, supportingForUser } = action.payload
      state.supporting[userId] = supportingForUser
    },
    setSendStatus: (
      state,
      action: PayloadAction<{ status: TippingSendStatus }>
    ) => {
      state.send.status = action.payload.status
    },
    setSendUser: (state, action: PayloadAction<{ user: User | null }>) => {
      state.send.user = action.payload.user
    },
    setSendAmount: (state, action: PayloadAction<{ amount: number }>) => {
      state.send.amount = action.payload.amount
    },
    resetSendStatus: state => {
      state.send.status = null
    }
  }
})

export const { setSendStatus, setSendAmount, resetSendStatus } = slice.actions

export default slice.reducer
