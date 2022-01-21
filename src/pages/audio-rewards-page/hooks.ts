import { useSelector } from 'react-redux'

import { ChallengeRewardID, UserChallenge } from 'common/models/AudioRewards'
import { getCompletionStages } from 'components/profile-progress/store/selectors'

type OptimisticChallengeCompletionResponse = Partial<
  Record<ChallengeRewardID, number>
>
type UserChallengeState =
  | 'inactive'
  | 'incomplete'
  | 'in_progress'
  | 'completed'
  | 'disbursed'
type OptimisticUserChallenge = Omit<
  UserChallenge,
  'is_complete' | 'is_active' | 'is_disbursed'
> & {
  __isOptimistic: true
  state: UserChallengeState
}
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
    challenge.current_step_count >= challenge.max_steps
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

export const useOptimisticChallengeCompletionStepCounts = () => {
  const profileCompletionStages = useSelector(getCompletionStages)
  const profileCompletion = Object.values(profileCompletionStages).filter(
    Boolean
  ).length

  const completion: OptimisticChallengeCompletionResponse = {
    'profile-completion': profileCompletion
  }

  return completion
}

/**
 * Given a challenge, returns a challenge that uses an optimistic
 * is_complete and current_step_count based on what the client knows
 * @param challenge The user challenge to get the optimistic state for
 * @returns the same challenge with is_complete and current_step_count overridden as necessary
 */
export const useOptimisticUserChallenge = (
  challenge?: UserChallenge
): OptimisticUserChallenge | undefined => {
  const stepCountOverrides = useOptimisticChallengeCompletionStepCounts()

  if (!challenge) {
    return challenge
  }
  const currentStepCountOverride = stepCountOverrides[challenge?.challenge_id]

  const challengeOverridden = { ...challenge }

  // The client is more up to date than Discovery Nodes, so override whenever possible.
  // Don't override if the challenge is already marked as completed on Discovery.
  if (!challenge?.is_complete && currentStepCountOverride !== undefined) {
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
