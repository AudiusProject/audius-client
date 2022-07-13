import { ID } from '@audius/common'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UserListModalState, UserListType, UserListEntityType } from './types'

// Types

const initialState: UserListModalState = {
  userListType: UserListType.REPOST,
  isOpen: false,
  entityType: UserListEntityType.TRACK
}

type SetUsersPayload = {
  userListType: UserListType
  entityType: UserListEntityType
  id: ID
}

// Slice

const slice = createSlice({
  name: 'application/ui/userListModal',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<SetUsersPayload>) => {
      const { userListType, entityType } = action.payload
      state.userListType = userListType
      state.entityType = entityType
    },
    setVisibility: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    }
  }
})

export const { setUsers, setVisibility } = slice.actions

export default slice.reducer
