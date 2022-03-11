import { CommonState } from 'common/store'

const getBaseState = (state: CommonState) => state.ui.addToPlaylist

export const getTrackId = (state: CommonState) => getBaseState(state).trackId
export const getTrackTitle = (state: CommonState) =>
  getBaseState(state).trackTitle
