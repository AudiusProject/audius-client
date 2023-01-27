import { CommonState } from 'store/reducers'

export const getSearchUserModalResults = (state: CommonState) =>
  state.ui.searchUsersModal.userIds
