import {
  ChallengeRewardID,
  OptimisticUserChallenge,
  UserChallenge,
  UserChallengeState,
  removeNullable
} from '@audius/common'

import {
  getUndisbursedUserChallenges,
  getUserChallenges,
  getUserChallengesOverrides
} from 'common/store/pages/audio-rewards/selectors'
import { UndisbursedUserChallenge } from 'common/store/pages/audio-rewards/slice'

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
/**
 * Converts a user challenge to an optimistic user challenge
 * @param challenge The original UserChallenge
 * @param stepCountOverrides the overrides to apply to challenge step counts
 * @param userChallengesOverrides the overrides to apply to other challenge states (currently used for disbursement)
 * @returns the optimistic state of that challenge
 */
const toOptimisticChallenge = (
  challenge: UserChallenge,
  undisbursed: UndisbursedUserChallenge[],
  stepCountOverrides: Partial<Record<ChallengeRewardID, number>>,
  userChallengesOverrides: Partial<
    Record<ChallengeRewardID, Partial<UserChallenge>>
  >
): OptimisticUserChallenge => {
  const currentStepCountOverride = stepCountOverrides[challenge.challenge_id]
  const userChallengeOverrides = userChallengesOverrides[challenge.challenge_id]

  const challengeOverridden = {
    ...challenge,
    ...userChallengeOverrides
  }

  // The client is more up to date than Discovery Nodes, so override whenever possible.
  // Don't override if the challenge is already marked as completed on Discovery.
  if (!challenge.is_complete && currentStepCountOverride !== undefined) {
    challengeOverridden.current_step_count = currentStepCountOverride
    challengeOverridden.is_complete =
      currentStepCountOverride >= challengeOverridden.max_steps
  }

  const state = getUserChallengeState(challengeOverridden)
  // For aggregate challenges, we show the total amount
  // you'd get when completing every step of the challenge
  // -- i.e. for referrals, show 1 audio x 5 steps = 5 audio
  const totalAmount =
    challenge.challenge_type === 'aggregate'
      ? challenge.amount * challenge.max_steps
      : challenge.amount
  const claimableAmount =
    challengeOverridden.challenge_type !== 'aggregate'
      ? state === 'completed'
        ? totalAmount
        : 0
      : undisbursed.reduce<number>((acc, val) => acc + val.amount, 0)
  const undisbursedSpecifiers = undisbursed.map((c) => c.specifier)

  return {
    ...challengeOverridden,
    __isOptimistic: true,
    state,
    totalAmount,
    claimableAmount,
    undisbursedSpecifiers
  }
}

/**
 * Returns all user challenges using an optimistic state and current_step_count
 * based on what the client tracks. Prevents UI oddness while waiting for discovery to index
 * @param challenge The user challenge to get the optimistic state for
 * @returns the same challenge with state and current_step_count overridden as necessary
 */
export const getOptimisticUserChallenges = (state: CommonState) => {
  const stepCountOverrides = getOptimisticUserChallengeStepCounts(state)
  const userChallengesOverrides = getUserChallengesOverrides(state)
  const userChallenges = getUserChallenges(state)
  const undisbursedUserChallenges = getUndisbursedUserChallenges(state).reduce<
    Partial<Record<ChallengeRewardID, UndisbursedUserChallenge[]>>
  >((acc, val) => {
    acc[val.challenge_id] = [...(acc[val.challenge_id] || []), val]
    return acc
  }, {})
  return Object.values(userChallenges)
    .filter(removeNullable)
    .map((challenge) =>
      toOptimisticChallenge(
        challenge,
        undisbursedUserChallenges[challenge.challenge_id] || [],
        stepCountOverrides,
        userChallengesOverrides
      )
    )
    .reduce((map, challenge) => {
      map[challenge.challenge_id] = challenge
      return map
    }, {} as Partial<Record<ChallengeRewardID, OptimisticUserChallenge>>)
}
