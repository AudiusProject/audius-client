import {
  ChallengeRewardID,
  OptimisticUserChallenge,
  UserChallenge,
  UserChallengeState
} from 'common/models/AudioRewards'
import {
  getUserChallenges,
  getUserChallengesOverrides
} from 'common/store/pages/audio-rewards/selectors'
import { removeNullable } from 'common/utils/typeUtils'

import { CommonState } from '../..'

import { getCompletionStages } from './profile-progress'

/**
 * Gets the state of a user challenge, with the most progress dominating
 * Mutually exclusive, eg: a challenge is only 'completed' if it is not also 'disbursed'
 * @param challenge
 * @returns The state of the challenge
 */
const getUserChallengeState = (
  challenge: UserChallenge
): UserChallengeState => {
  if (challenge.is_disbursed) {
    return 'disbursed'
  }
  if (
    challenge.is_complete ||
    (challenge.max_steps !== null &&
      challenge.current_step_count >= challenge.max_steps)
  ) {
    return 'completed'
  }
  if (challenge.current_step_count > 0) {
    return 'in_progress'
  }
  if (challenge.is_active) {
    return 'incomplete'
  }
  return 'inactive'
}

export const getOptimisticUserChallengeStepCounts = (state: CommonState) => {
  const profileCompletionStages = getCompletionStages(state)
  const profileCompletion = Object.values(profileCompletionStages).filter(
    Boolean
  ).length

  const completion: Partial<Record<ChallengeRewardID, number>> = {
    'profile-completion': profileCompletion
  }

  return completion
}

const toOptimisticChallenge = (
  challenge: UserChallenge,
  stepCountOverrides: Partial<Record<ChallengeRewardID, number>>,
  userChallengesOverrides: Partial<
    Record<ChallengeRewardID, Partial<UserChallenge>>
  >
): OptimisticUserChallenge => {
  const currentStepCountOverride = stepCountOverrides[challenge.challenge_id]
  const userChallengeOverrides = userChallengesOverrides[challenge.challenge_id]

  const challengeOverridden = {
    ...challenge,
    ...userChallengeOverrides,
    // For aggregate challenges, we show the total amount
    // you'd get when completing every step of the challenge
    // -- i.e. for referrals, show 1 audio x 5 steps = 5 audio
    totalAmount:
      challenge.challenge_type === 'aggregate'
        ? challenge.amount * challenge.max_steps
        : challenge.amount
  }

  // The client is more up to date than Discovery Nodes, so override whenever possible.
  // Don't override if the challenge is already marked as completed on Discovery.
  if (!challenge.is_complete && currentStepCountOverride !== undefined) {
    challengeOverridden.current_step_count = currentStepCountOverride
    challengeOverridden.is_complete =
      currentStepCountOverride >= challengeOverridden.max_steps
  }

  return {
    ...challengeOverridden,
    __isOptimistic: true,
    state: getUserChallengeState(challengeOverridden)
  }
}

export const getOptimisticUserChallenges = (state: CommonState) => {
  const stepCountOverrides = getOptimisticUserChallengeStepCounts(state)
  const userChallengesOverrides = getUserChallengesOverrides(state)
  const userChallenges = getUserChallenges(state)
  return Object.values(userChallenges)
    .filter(removeNullable)
    .map(challenge =>
      toOptimisticChallenge(
        challenge,
        stepCountOverrides,
        userChallengesOverrides
      )
    )
    .reduce((map, challenge) => {
      map[challenge.challenge_id] = challenge
      return map
    }, {} as Partial<Record<ChallengeRewardID, OptimisticUserChallenge>>)
}
