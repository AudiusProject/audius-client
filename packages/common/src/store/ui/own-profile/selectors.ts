import { CommonState } from 'store/index'

export const getOwnTrackCount = (state: CommonState) =>
  state.ui.ownProfile.trackCount
