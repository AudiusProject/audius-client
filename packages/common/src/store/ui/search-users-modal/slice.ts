import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type SearchUsersModalState = {
  userIds: number[]
}

const initialState: SearchUsersModalState = {
  userIds: []
}

const slice = createSlice({
  name: 'application/ui/searchUsersModal',
  initialState,
  reducers: {
    searchUsers: (
      _state,
      _action: PayloadAction<{
        query: string
        currentPage?: number
        pageSize?: number
      }>
    ) => {
      // Triggers Saga
    },
    searchUsersSucceeded: (
      state,
      action: PayloadAction<{ userIds: number[] }>
    ) => {
      state.userIds = action.payload.userIds
    }
  }
})

export const actions = slice.actions

export default slice.reducer
