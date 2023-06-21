import { CommonState } from 'store/commonStore'

export const getBottomTabBarHeight = (state: CommonState) =>
  state.ui.bottomTabBar.bottomTabBarHeight
