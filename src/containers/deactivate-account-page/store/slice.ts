import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import Status from 'common/models/Status'

export type DeactivateAccountState = {
  status?: Status
  isConfirmationVisible: boolean
}

const initialState: DeactivateAccountState = {
  status: undefined,
  isConfirmationVisible: false
}

const slice = createSlice({
  name: 'application/ui/deactivateAccount',
  initialState,
  reducers: {
    deactivateAccount: state => {
      state.status = Status.LOADING
    },
    afterDeactivationSignOut: () => {},
    deactivateAccountFailed: state => {
      state.status = Status.ERROR
    },
    setIsConfirmationVisible: (state, action: PayloadAction<boolean>) => {
      state.isConfirmationVisible = action.payload
    }
  }
})

export const {
  deactivateAccount,
  afterDeactivationSignOut,
  deactivateAccountFailed,
  setIsConfirmationVisible
} = slice.actions
export default slice.reducer
