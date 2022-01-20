import { useSelector } from 'react-redux'

import { ChallengeRewardID, UserChallenge } from 'common/models/AudioRewards'
import { getCompletionStages } from 'components/profile-progress/store/selectors'

type OptimisticChallengeCompletionResponse = Partial<
  Record<ChallengeRewardID, number>
>

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

type OptimisticUserChallenge = UserChallenge & { __isOptimistic: true }
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

  // The client is more up to date than Discovery Nodes, so override whenever possible.
  // Don't override if the challenge is already marked as completed on Discovery.
  if (!challenge?.is_complete && currentStepCountOverride !== undefined) {
    return {
      __isOptimistic: true,
      ...challenge,
      current_step_count: currentStepCountOverride,
      is_complete: currentStepCountOverride >= challenge.max_steps
    }
  }
  return { ...challenge, __isOptimistic: true }
}
