import { CommonState } from 'store/commonStore'

export const getId = (state: CommonState) =>
  state.ui.userList.suggestedFollows.suggestedFollowsPage.id
export const getUserList = (state: CommonState) =>
  state.ui.userList.suggestedFollows.userList
export const getUserIds = (state: CommonState) =>
  state.ui.userList.suggestedFollows.userList.userIds
