import { CommonState } from '../commonStore'

export const getPremiumTrackSignatureMap = (state: CommonState) =>
  state.premiumContent.premiumTrackSignatureMap

export const getPremiumTrackStatusMap = (state: CommonState) =>
  state.premiumContent.statusMap

export const getLockedContentId = (state: CommonState) =>
  state.premiumContent.lockedContentId
