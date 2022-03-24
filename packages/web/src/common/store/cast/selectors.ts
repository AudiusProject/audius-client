import { CommonState } from 'common/store'

const getBaseState = (state: CommonState) => state.cast

export const getMethod = (state: CommonState) => getBaseState(state).method

export const getIsCasting = (state: CommonState) =>
  getBaseState(state).isCasting
