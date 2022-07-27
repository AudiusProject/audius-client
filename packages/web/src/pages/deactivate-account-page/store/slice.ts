import { Status } from '@audius/common'
import { createSlice } from '@reduxjs/toolkit'

export type DeactivateAccountState = {
  status?: Status
}

const initialState: DeactivateAccountState = {
  status: undefined
}

const slice = createSlice({
  name: 'application/ui/deactivateAccount',
  initialState,
  reducers: {
    deactivateAccount: (state) => {
      state.status = Status.LOADING
    },
    afterDeactivationSignOut: () => {},
    deactivateAccountFailed: (state) => {
      state.status = Status.ERROR
    }
  }
})

export const {
  deactivateAccount,
  afterDeactivationSignOut,
  deactivateAccountFailed
} = slice.actions
export default slice.reducer
