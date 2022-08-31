import type { AppState } from 'app/store'

const getBaseState = (state: AppState) => state.lifecycle

export const getLocation = (state: AppState) => getBaseState(state).location
