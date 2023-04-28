import { ID } from 'models/Identifiers'
import { Status } from 'models/Status'
import { CommonState } from 'store/reducers'

export const getUserList = (
  state: CommonState
): { userIds: ID[]; status: Status } => state.ui.searchUsersModal.userList
