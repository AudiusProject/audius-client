import type { AppState } from '../store'

export const getOwnTrackCount = (state: AppState) => state.ownProfile.trackCount
