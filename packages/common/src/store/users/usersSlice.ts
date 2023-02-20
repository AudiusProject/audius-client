import {
  createEntityAdapter,
  createSlice,
  Dictionary,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'

import { ID } from 'models/Identifiers'
import { SquareSizes, WidthSizes } from 'models/ImageSizes'
import { User } from 'models/User'

export const FETCH_USERS = 'CACHE/USERS/FETCH'

export const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user.user_id
})

export type UsersState = EntityState<User> & {
  handles: Dictionary<ID>
  timestamps: Dictionary<number>
}

const initialState: UsersState = {
  ...usersAdapter.getInitialState(),
  handles: {},
  timestamps: {}
}

type AddUsersAction = PayloadAction<{
  users: User[]
}>

// type UpdateUserAction = PayloadAction<Update<User>>

type FetchUsersAction = PayloadAction<{
  userIds: ID[]
  requiredFields?: any
  forceRetrieveFromSource?: boolean
}>

type FetchUserSocialsAction = PayloadAction<{
  handle: string
}>

type FetchCoverPhotoAction = PayloadAction<{
  id: ID
  size: WidthSizes
}>

type FetchProfilePictureAction = PayloadAction<{
  id: ID
  size: SquareSizes
}>

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
