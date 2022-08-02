import { ChallengeRewardID } from '@audius/common'
import { createSelector } from 'reselect'

import { CommonState } from 'common/store'

export const getTrendingRewardsModalType = (state: CommonState) =>
  state.pages.audioRewards.trendingRewardsModalType

export const getChallengeRewardsModalType = (state: CommonState) =>
  state.pages.audioRewards.challengeRewardsModalType

export const getUserChallengeSpecifierMap = (state: CommonState) =>
  state.pages.audioRewards.userChallenges

// Returns just a single challenge per challengeId
export const getUserChallenges = createSelector(
  [getUserChallengeSpecifierMap],
  (challenges) => {
    return Object.values(challenges).reduce((acc, cur) => {
      const challenge = Object.values(cur)[0]
      if (!challenge) return acc // Shouldn't happen
      return {
        ...acc,
        [challenge.challenge_id]: challenge
      }
    }, {})
  }
)

export const getUndisbursedUserChallenges = (state: CommonState) =>
  state.pages.audioRewards.undisbursedChallenges.filter((challenge) => {
    return !(
      state.pages.audioRewards.disbursedChallenges[challenge.challenge_id] ?? []
    ).includes(challenge.specifier)
  })

export const getUserChallenge = (
  state: CommonState,
  props: { challengeId: ChallengeRewardID }
) =>
  Object.values(
    state.pages.audioRewards.userChallenges[props.challengeId] || {}
  )[0]

export const getUserChallengesOverrides = (state: CommonState) =>
  state.pages.audioRewards.userChallengesOverrides

export const getUserChallengesLoading = (state: CommonState) =>
  state.pages.audioRewards.loading

export const getClaimStatus = (state: CommonState) =>
  state.pages.audioRewards.claimStatus

export const getClaimToRetry = (state: CommonState) =>
  state.pages.audioRewards.claimToRetry

export const getHCaptchaStatus = (state: CommonState) =>
  state.pages.audioRewards.hCaptchaStatus

export const getCognitoFlowStatus = (state: CommonState) =>
  state.pages.audioRewards.cognitoFlowStatus

export const getCognitoFlowUrl = (state: CommonState) =>
  state.pages.audioRewards.cognitoFlowUrl

export const getCognitoFlowUrlStatus = (state: CommonState) =>
  state.pages.audioRewards.cognitoFlowUrlStatus

export const getShowRewardClaimedToast = (state: CommonState) =>
  state.pages.audioRewards.showRewardClaimedToast
