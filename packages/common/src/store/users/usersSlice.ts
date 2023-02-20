import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { User } from 'models/User'

import {
  AddUsersAction,
  FetchCoverPhotoAction,
  FetchProfilePictureAction,
  FetchUsersAction,
  FetchUserSocialsAction,
  UsersState
} from './types'

export const FETCH_USERS = 'CACHE/USERS/FETCH'

export const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user.user_id
})

const initialState: UsersState = {
  ...usersAdapter.getInitialState(),
  handles: {},
  timestamps: {}
}

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUsers: (state, action: AddUsersAction) => {
      const { users } = action.payload
      usersAdapter.upsertMany(state, users)
      const now = Date.now()
      for (const user of users) {
        state.handles[user.handle.toLowerCase()] = user.user_id
        state.timestamps[user.user_id] = now
      }
    },
    updateUser: usersAdapter.updateOne,
    fetchUsers: (_state, _action: FetchUsersAction) => {},
    fetchUserSocials: (_state, _action: FetchUserSocialsAction) => {},
    fetchCoverPhoto: (_state, _action: FetchCoverPhotoAction) => {},
    fetchProfilePicture: (_state, _action: FetchProfilePictureAction) => {}
  }
})

const reducer = slice.reducer
const actions = slice.actions

export { actions }
export default reducer
